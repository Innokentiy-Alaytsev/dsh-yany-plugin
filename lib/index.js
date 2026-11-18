/**
 * Host half of @crufteneer/dsh-yany-plugin (YANY).
 *
 * The browser half decides when a notification is needed. The Host half owns
 * two capabilities a page cannot perform itself:
 *
 *  - Durable settings in a plugin state file. DSH keeps *configuration* in the
 *    profile's Cordis patch, but these preferences change from the UI at
 *    runtime, including a frequently updated per-session mute list, so they
 *    belong in the plugin's own state file under `$DSH_HOME/storages/`. The
 *    page keeps a localStorage copy only as a fast cache and offline fallback.
 *  - Bringing the application window to the foreground on Windows. `focus.ps1`
 *    handles an already visible window; relaunching the Desktop executable
 *    asks the running instance to restore, show, and focus a hidden one.
 */
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const inject = ['webServer'];

const FOCUS_SCRIPT = fileURLToPath(new URL('../scripts/focus.ps1', import.meta.url));
const FLASH_SCRIPT = fileURLToPath(new URL('../scripts/flash.ps1', import.meta.url));
const FOCUS_TIMEOUT_MS = 8000;
const RELAUNCH_TIMEOUT_MS = 6000;
const THROTTLE_MS = 750;
const FLASH_THROTTLE_MS = 500;
const SETTINGS_BODY_LIMIT = 64 * 1024;
const MAX_MUTED_SESSIONS = 1000;

const DEFAULT_SETTINGS = {
	master: true,
	sound: true,
	native: true,
	focus: true,
	activeSound: false,
	volume: 0.7,
	mutedSessions: [],
};

/** @param {import('node:http').ServerResponse} res */
function sendJson(res, status, payload) {
	res.statusCode = status;
	res.setHeader('content-type', 'application/json; charset=utf-8');
	res.setHeader('cache-control', 'no-store');
	res.end(JSON.stringify(payload));
}

/** Keep the stored shape stable no matter what a client sends. */
function normalizeSettings(raw) {
	const fallback = { ...DEFAULT_SETTINGS, mutedSessions: [] };
	if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return fallback;
	const muted = Array.isArray(raw.mutedSessions)
		? raw.mutedSessions.filter((id) => typeof id === 'string' && id !== '').slice(0, MAX_MUTED_SESSIONS)
		: [];
	const volume =
		typeof raw.volume === 'number' && Number.isFinite(raw.volume)
			? Math.min(1, Math.max(0, raw.volume))
			: DEFAULT_SETTINGS.volume;
	return {
		master: raw.master !== false,
		sound: raw.sound !== false,
		native: raw.native !== false,
		focus: raw.focus !== false,
		activeSound: raw.activeSound === true,
		volume,
		mutedSessions: [...new Set(muted)],
	};
}

/** `$DSH_HOME/storages/dsh-yany-plugin/settings.json`, matching the DSH home layout. */
function settingsFilePath() {
	const configured = process.env.DSH_HOME;
	const home =
		typeof configured === 'string' && configured.trim() !== ''
			? configured
			: path.join(os.homedir(), '.dsh');
	return path.join(home, 'storages', 'dsh-yany-plugin', 'settings.json');
}

/** Settings location used before the plugin was renamed; migrated on first load. */
function legacySettingsFilePath() {
	const configured = process.env.DSH_HOME;
	const home =
		typeof configured === 'string' && configured.trim() !== ''
			? configured
			: path.join(os.homedir(), '.dsh');
	return path.join(home, 'storages', 'dsh-notify', 'settings.json');
}

/** Read a JSON request body with a hard size limit. */
function readRequestBody(req, limit) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let size = 0;
		req.on('data', (chunk) => {
			size += chunk.length;
			if (size > limit) {
				reject(new Error('body-too-large'));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
		req.on('error', reject);
	});
}

/**
 * Durable settings with serialized atomic writes.
 * @param {string} file
 * @param {string} legacyFile
 * @param {{ warn?: (message: string) => void, info?: (message: string) => void }} [logger]
 */
function createSettingsStore(file, legacyFile, logger) {
	let chain = Promise.resolve();

	// Read on every request: the file is small, and this keeps an edit made
	// outside the UI visible the next time a page loads or regains focus.
	const readSettings = async (target) => {
		const text = await fs.readFile(target, 'utf8');
		// A hand-edited file may carry a UTF-8 BOM; JSON.parse rejects it.
		return normalizeSettings(JSON.parse(text.replace(/^\uFEFF/, '')));
	};

	const load = async () => {
		try {
			return await readSettings(file);
		} catch (error) {
			if (error?.code === 'ENOENT') {
				try {
					const legacy = await readSettings(legacyFile);
					await save(legacy);
					await fs.rm(legacyFile, { force: true });
					logger?.info?.(`dsh-yany: migrated settings to ${file}`);
					return legacy;
				} catch {
					/* no legacy settings to migrate */
				}
			} else {
				logger?.warn?.(`dsh-yany: could not read ${file}: ${String(error)}`);
			}
			return normalizeSettings(null);
		}
	};

	const save = (raw) => {
		const normalized = normalizeSettings(raw);
		const run = chain.then(async () => {
			await fs.mkdir(path.dirname(file), { recursive: true });
			const temporary = `${file}.${String(process.pid)}.tmp`;
			await fs.writeFile(temporary, JSON.stringify(normalized, null, 2) + '\n', 'utf8');
			await fs.rename(temporary, file);
		});
		// Keep the chain alive after a failed write; the caller still sees the error.
		chain = run.catch(() => {});
		return run.then(() => normalized);
	};

	return { load, save, file };
}

/**
 * Start one helper process and settle with its success flag.
 * @param {string} file
 * @param {string[]} args
 * @param {number} timeoutMs
 */
function runAndWait(file, args, timeoutMs) {
	return new Promise((resolve) => {
		let child;
		try {
			child = spawn(file, args, { windowsHide: true, stdio: 'ignore' });
		} catch {
			resolve(false);
			return;
		}
		let settled = false;
		const settle = (ok) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve(ok);
		};
		const timer = setTimeout(() => {
			try {
				child.kill();
			} catch {
				/* the process may already be gone */
			}
			settle(false);
		}, timeoutMs);
		child.on('error', () => settle(false));
		child.on('exit', (code) => settle(code === 0));
	});
}

/**
 * The Desktop executable when the Host runs inside Electron's Node mode.
 * A plain `dsh web` Host runs node.exe and has no window to relaunch.
 * @returns {string | undefined}
 */
function desktopExecutable() {
	if (process.platform !== 'win32') return undefined;
	if (!process.versions.electron) return undefined;
	const executable = process.execPath;
	if (typeof executable !== 'string' || executable === '') return undefined;
	if (path.basename(executable).toLowerCase() === 'node.exe') return undefined;
	return executable;
}

/** Keep one focus attempt in flight; concurrent callers share its outcome. */
function createFocusRunner() {
	let inFlight = null;
	let lastStartedAt = 0;

	const attempt = async () => {
		const scripted = await runAndWait(
			'powershell.exe',
			['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', FOCUS_SCRIPT],
			FOCUS_TIMEOUT_MS,
		);
		if (scripted) return { focused: true, method: 'script' };

		const executable = desktopExecutable();
		if (executable !== undefined) {
			const relaunched = await runAndWait(executable, [], RELAUNCH_TIMEOUT_MS);
			return { focused: relaunched, method: relaunched ? 'relaunch' : 'none' };
		}
		return { focused: false, method: 'none' };
	};

	return () => {
		if (inFlight !== null) return inFlight;
		const now = Date.now();
		if (now - lastStartedAt < THROTTLE_MS) {
			return Promise.resolve({ focused: true, method: 'throttled' });
		}
		lastStartedAt = now;
		inFlight = attempt().finally(() => {
			inFlight = null;
		});
		return inFlight;
	};
}

/** Keep one taskbar flash in flight; bursts share the same attempt. */
function createFlashRunner() {
	let inFlight = null;
	let lastStartedAt = 0;

	return () => {
		if (inFlight !== null) return inFlight;
		const now = Date.now();
		if (now - lastStartedAt < FLASH_THROTTLE_MS) return Promise.resolve(true);
		lastStartedAt = now;
		inFlight = runAndWait(
			'powershell.exe',
			['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', FLASH_SCRIPT],
			FOCUS_TIMEOUT_MS,
		).finally(() => {
			inFlight = null;
		});
		return inFlight;
	};
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
	const settings = createSettingsStore(settingsFilePath(), legacySettingsFilePath(), ctx.logger);
	const flash = createFlashRunner();

	const origin = (() => {
		try {
			return ctx.webServer.getOrigin();
		} catch {
			return undefined;
		}
	})();

	// The Desktop shell serves the page from its own scheme and forwards
	// requests here; a browser reaches the same routes through the loopback
	// origin. Requests forwarded by the shell carry no Origin header.
	const allowedOrigins = new Set(['dsh-app://app']);
	if (origin !== undefined) allowedOrigins.add(origin);

	const trusted = (req) => {
		const requestOrigin = req.headers.origin;
		if (typeof requestOrigin !== 'string' || requestOrigin === '') return true;
		return allowedOrigins.has(requestOrigin);
	};

	ctx.effect(
		() =>
			ctx.webServer.register({
				kind: 'exact',
				path: '/dsh-yany/settings',
				handler: async (req, res) => {
					if (!trusted(req)) {
						sendJson(res, 403, { ok: false, error: 'forbidden-origin' });
						return;
					}
					try {
						if (req.method === 'GET' || req.method === 'HEAD') {
							// Load first: a first run may migrate the legacy
							// settings file into the new location, and `exists`
							// must describe the file the client will actually get.
							const loaded = await settings.load();
							const exists = await fs.access(settings.file).then(
								() => true,
								() => false,
							);
							sendJson(res, 200, {
								ok: true,
								settings: loaded,
								file: settings.file,
								exists,
							});
							return;
						}
						if (req.method === 'POST' || req.method === 'PUT') {
							let body;
							try {
								body = JSON.parse(await readRequestBody(req, SETTINGS_BODY_LIMIT));
							} catch {
								sendJson(res, 400, { ok: false, error: 'invalid-json' });
								return;
							}
							const raw =
								body !== null && typeof body === 'object' && body.settings !== undefined
									? body.settings
									: body;
							sendJson(res, 200, { ok: true, settings: await settings.save(raw) });
							return;
						}
						sendJson(res, 405, { ok: false, error: 'method-not-allowed' });
					} catch (error) {
						sendJson(res, 500, { ok: false, error: String(error) });
					}
				},
			}),
		'dsh-yany: settings route',
	);

	ctx.effect(
		() =>
			ctx.webServer.register({
				kind: 'exact',
				path: '/dsh-yany/flash',
				handler: async (req, res) => {
					if (req.method !== 'POST') {
						sendJson(res, 405, { ok: false, error: 'method-not-allowed' });
						return;
					}
					if (!trusted(req)) {
						sendJson(res, 403, { ok: false, error: 'forbidden-origin' });
						return;
					}
					if (process.platform !== 'win32') {
						sendJson(res, 501, { ok: false, error: 'unsupported' });
						return;
					}
					try {
						const flashed = await flash();
						sendJson(res, 200, { ok: true, flashed });
					} catch (error) {
						sendJson(res, 500, { ok: false, error: String(error) });
					}
				},
			}),
		'dsh-yany: flash route',
	);

	if (process.platform !== 'win32') {
		ctx.logger?.info?.('dsh-yany: window focus and taskbar flash are only implemented on Windows');
		return;
	}

	const focus = createFocusRunner();

	ctx.effect(
		() =>
			ctx.webServer.register({
				kind: 'exact',
				path: '/dsh-yany/ping',
				handler: (req, res) => {
					if (req.method !== 'GET' && req.method !== 'HEAD') {
						sendJson(res, 405, { ok: false, error: 'method-not-allowed' });
						return;
					}
					sendJson(res, 200, {
						ok: true,
						plugin: '@crufteneer/dsh-yany-plugin',
						platform: process.platform,
						settingsFile: settings.file,
					});
				},
			}),
		'dsh-yany: ping route',
	);

	ctx.effect(
		() =>
			ctx.webServer.register({
				kind: 'exact',
				path: '/dsh-yany/focus',
				handler: async (req, res) => {
					if (req.method !== 'POST') {
						sendJson(res, 405, { ok: false, error: 'method-not-allowed' });
						return;
					}
					if (!trusted(req)) {
						sendJson(res, 403, { ok: false, error: 'forbidden-origin' });
						return;
					}
					try {
						const result = await focus();
						sendJson(res, 200, { ok: true, ...result });
					} catch (error) {
						sendJson(res, 500, { ok: false, error: String(error) });
					}
				},
			}),
		'dsh-yany: focus route',
	);
}
