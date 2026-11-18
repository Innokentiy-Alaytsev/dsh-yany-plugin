// Headless harness for the @crufteneer/dsh-yany-plugin client half: loads client.js with stubbed
// browser globals, mocks the Client Cordis services it injects, then drives
// session-status transitions and asserts the observable effects.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, '..', 'lib', 'client.js'), 'utf8');

const results = [];
function check(name, ok, detail) {
	results.push({ name, ok: Boolean(ok), detail });
	if (!ok) console.error('FAIL:', name, detail === undefined ? '' : detail);
}

// ---------------------------------------------------------------- DOM / env --
const storage = new Map();
globalThis.localStorage = {
	getItem: (key) => (storage.has(key) ? storage.get(key) : null),
	setItem: (key, value) => storage.set(key, String(value)),
	removeItem: (key) => storage.delete(key),
};

const styleTags = [];
globalThis.document = {
	documentElement: { lang: 'en' },
	head: {
		appendChild: (node) => styleTags.push(node),
	},
	createElement: (tag) => ({
		tagName: tag,
		dataset: {},
		textContent: '',
		remove() {
			this.removed = true;
		},
	}),
	querySelector: () => null,
	hasFocus: () => windowFocused,
};
let windowFocused = false;

const notifications = [];
class FakeNotification {
	static permission = 'granted';
	static requestPermission() {
		return Promise.resolve('granted');
	}
	constructor(title, options) {
		this.title = title;
		this.options = options;
		this.closed = false;
		notifications.push(this);
	}
	close() {
		this.closed = true;
	}
}
globalThis.Notification = FakeNotification;

Object.defineProperty(globalThis, 'navigator', {
	value: { language: 'ru-RU', languages: ['ru-RU'] },
	configurable: true,
	writable: true,
});

const fetchCalls = [];
const hostSettings = { master: true, sound: true, native: true, focus: true, mutedSessions: [] };
globalThis.fetch = async (url, init) => {
	fetchCalls.push({ url, init });
	const method = (init && init.method) || 'GET';
	if (url === '/dsh-yany/settings' && method === 'GET') {
		return { ok: true, json: async () => ({ ok: true, settings: hostSettings }) };
	}
	return { ok: true, json: async () => ({ ok: true }) };
};

const tones = [];
class FakeGain {
	constructor() {
		this.connectedTo = null;
		const gain = {
			value: 1,
			setValueAtTime: () => {},
			exponentialRampToValueAtTime: (value) => {
				if (value > 0) tones.push(value);
			},
			setTargetAtTime: (value) => {
				gain.value = value;
			},
		};
		this.gain = gain;
	}
	connect(node) {
		this.connectedTo = node;
		return node;
	}
}
class FakeAudioContext {
	static instances = [];
	constructor() {
		this.currentTime = 0;
		this.destination = {};
		this.state = 'running';
		this.gains = [];
		FakeAudioContext.instances.push(this);
	}
	createOscillator() {
		return {
			type: 'sine',
			frequency: { setValueAtTime: () => {} },
			connect: () => {},
			start: () => {},
			stop: () => {},
		};
	}
	createGain() {
		const gain = new FakeGain();
		this.gains.push(gain);
		return gain;
	}
	resume() {
		return Promise.resolve();
	}
}
globalThis.window = {
	AudioContext: FakeAudioContext,
	addEventListener: () => {},
	removeEventListener: () => {},
	focus: () => {
		globalThis.focusedCalls += 1;
	},
};
globalThis.focusedCalls = 0;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

// ------------------------------------------------------------------- React ---
const created = [];
const React = {
	createElement: (type, props, ...children) => {
		const node = { type, props, children };
		created.push(node);
		return node;
	},
	useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
	useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
	Fragment: 'Fragment',
};

// -------------------------------------------------------------- module load --
let registered;
globalThis.window.__ModuleLoader__ = {
	load: (entry) => {
		registered = entry;
	},
};

const moduleShim = { exports: {} };
new Function('require', 'module', 'exports', source.replace(/^window\.__ModuleLoader__\.load\(/, 'window.__ModuleLoader__.load('))
	.call(globalThis, (name) => {
		if (name === 'react') return React;
		throw new Error('unexpected require: ' + name);
	}, moduleShim, moduleShim.exports);

check('module registered', registered !== undefined);
check('module id is the package name', registered.id === '@crufteneer/dsh-yany-plugin', registered.id);

// ------------------------------------------------------------- Client ctx ----
function createStore(initial) {
	let snapshot = initial;
	const listeners = new Set();
	return {
		getSnapshot: () => snapshot,
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		set(next) {
			snapshot = next;
			for (const listener of [...listeners]) listener();
		},
	};
}

const statusStore = createStore(new Map());
const listStore = createStore({ phase: 'ready', ids: [], byId: {} });
const opened = [];
const disposers = [];
const registeredSlots = [];
const remoteHandlers = new Map();

const ctx = {
	effect(fn) {
		const cleanup = fn();
		if (typeof cleanup === 'function') disposers.push(cleanup);
		return () => {};
	},
	locale: {
		register: () => () => {},
		bind: () => (key) => key,
	},
	slots: {
		inject(slot, callback) {
			return callback();
		},
		register(options, Component) {
			registeredSlots.push({ options, Component });
			return () => {};
		},
	},
	sessions: { list: listStore },
	uiSession: { sessionStatus: statusStore },
	uiWorkspace: {
		mainReference: { sessionId: 's0' },
		openSession: (id) => {
			opened.push(id);
			ctx.uiWorkspace.mainReference = { sessionId: id };
		},
	},
	remote: {
		$on(name, handler) {
			remoteHandlers.set(name, handler);
			return () => {};
		},
	},
};

const plugin = registered.factory((name) => {
	if (name === 'react') return React;
	throw new Error('unexpected require: ' + name);
});
check('client exports inject', Array.isArray(plugin.inject) && plugin.inject.includes('uiSession'), plugin.inject);
plugin.apply(ctx);

// ------------------------------------------------------------ localizations ---
const OFFICIAL_LOCALES = ['en', 'de', 'es', 'fr', 'ja', 'pt', 'ru', 'zh'];
const DICT = plugin.dict;
check(
	'dictionary exposes every official DSH locale',
	OFFICIAL_LOCALES.every((code) => DICT[code] !== undefined),
	Object.keys(DICT),
);
for (const code of OFFICIAL_LOCALES) {
	check(
		`locale ${code} has the same keys as en`,
		JSON.stringify(Object.keys(DICT[code]).sort()) === JSON.stringify(Object.keys(DICT.en).sort()),
	);
}
check(
	'no empty translations',
	OFFICIAL_LOCALES.every((code) =>
		Object.values(DICT[code]).every((value) => typeof value === 'string' && value.trim() !== ''),
	),
);
check(
	'zh and ja translations are rendered',
	DICT.zh['panel.muteAll'] === '全部通知静音' && DICT.ja['panel.muteAll'] === 'すべての通知をミュート',
);

// ------------------------------------------------------------- slot checks --
const slots = registeredSlots.map((entry) => entry.options.name);
check('header mute slot registered', slots.includes('conversation.session.header.actions'), slots);
check('sidebar footer slot registered', slots.includes('sidebar.footer.action'), slots);
check('sidebar row hover slot registered', slots.includes('sidebar.session.row.hover'), slots);
check('shell overlay slot registered', slots.includes('shell.overlay'), slots);
check(
	'slot registrations carry a locale namespace',
	registeredSlots.every((entry) => entry.options.locale === '@crufteneer/dsh-yany-plugin'),
	registeredSlots.map((entry) => entry.options.locale),
);

// -------------------------------------------------------------- completion ---
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

listStore.set({
	phase: 'ready',
	ids: ['s1', 's2'],
	byId: {
		s1: { sessionId: 's1', title: 'First session', depth: 0 },
		s2: { sessionId: 's2', title: 'Second session', depth: 0 },
		s5: { sessionId: 's5', title: 'Subagent session', origin: 'subagent', parentSessionId: 's1' },
	},
});

statusStore.set(new Map([['s1', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
check('running transition does not notify', notifications.length === 0, notifications.map((n) => n.title));

statusStore.set(new Map([['s1', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('completed turn notifies', notifications.length === 1, notifications.map((n) => n.title));
check('completed notification text', notifications[0] && notifications[0].title === 'Turn completed', notifications[0] && notifications[0].title);
check('completed notification names the session', notifications[0] && String(notifications[0].options.body).includes('First session'), notifications[0] && notifications[0].options.body);
check('completion plays a sound cue', tones.length > 0, tones.length);
check('completion flashes the taskbar', fetchCalls.some((call) => call.url === '/dsh-yany/flash' && call.init && call.init.method === 'POST'));
check('cue envelopes carry the 8x baseline', tones[0] === 0.64 && tones[2] === 0.56, tones.slice(0, 4));
check('system notification is silent (own cue)', notifications[0] && notifications[0].options.silent === true);

// ----------------------------------------------------------------- failure ---
notifications.length = 0;
const before = tones.length;
statusStore.set(new Map([['s1', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
remoteHandlers.get('api-session/error')('s1', 'Connection reset by peer');
statusStore.set(new Map([['s1', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('failed turn notifies', notifications.length === 1, notifications.map((n) => n.title));
check('failed notification text', notifications[0] && notifications[0].title === 'Turn failed', notifications[0] && notifications[0].title);
check('failed notification carries the error', notifications[0] && String(notifications[0].options.body).includes('Connection reset'), notifications[0] && notifications[0].options.body);
check('failure has its own cue', tones.length > before, tones.length - before);

// ------------------------------------------------------------- subagents ---
notifications.length = 0;
const tonesBeforeSubagent = tones.length;
const flashesBeforeSubagent = fetchCalls.filter((call) => call.url === '/dsh-yany/flash').length;
statusStore.set(new Map([['s5', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
statusStore.set(new Map([['s5', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('subagent turn does not notify', notifications.length === 0, notifications.map((n) => n.title));
check('subagent turn stays silent', tones.length === tonesBeforeSubagent, tones.length - tonesBeforeSubagent);
check(
	'subagent turn does not flash the taskbar',
	fetchCalls.filter((call) => call.url === '/dsh-yany/flash').length === flashesBeforeSubagent,
);

// ---------------------------------------------------------- waiting + queue ---
notifications.length = 0;
statusStore.set(
	new Map([
		['s1', { running: true, pendingInteraction: { sessionId: 's1', kind: 'approval', key: 'a1', toolName: 'pwsh', reason: 'Run the tests' }, completionUnread: false }],
		['s2', { running: false, pendingInteraction: { sessionId: 's2', kind: 'question', key: 'q1', questions: [{ question: 'Which branch?' }] }, completionUnread: false }],
	]),
);
check('two waiting sessions produce two notifications', notifications.length === 2, notifications.map((n) => n.title));
check('waiting notification text', notifications[0] && notifications[0].title === 'Waiting for your input', notifications[0] && notifications[0].title);
check('approval notification carries the reason', notifications[0] && String(notifications[0].options.body).includes('Run the tests'), notifications[0] && notifications[0].options.body);
check('question notification carries the question', notifications[1] && String(notifications[1].options.body).includes('Which branch?'), notifications[1] && notifications[1].options.body);
check('urgent notifications request interaction', notifications[0] && notifications[0].options.requireInteraction === true);

await wait(450);
check('first waiting session is revealed', opened[0] === 's1', opened);
check('window focus is requested', fetchCalls.some((call) => call.url === '/dsh-yany/focus' && call.init && call.init.method === 'POST'), fetchCalls);
check('first session is focused before the second', opened.length === 1, opened);

// Resolving the first interaction must advance the queue to the second session.
statusStore.set(
	new Map([
		['s1', { running: false, pendingInteraction: undefined, completionUnread: false }],
		['s2', { running: false, pendingInteraction: { sessionId: 's2', kind: 'question', key: 'q1', questions: [{ question: 'Which branch?' }] }, completionUnread: false }],
	]),
);
await wait(450);
check('second waiting session is revealed after the first resolves', opened[1] === 's2', opened);

// Re-sending the same interaction key must not re-notify.
notifications.length = 0;
statusStore.set(
	new Map([
		['s1', { running: false, pendingInteraction: undefined, completionUnread: false }],
		['s2', { running: false, pendingInteraction: { sessionId: 's2', kind: 'question', key: 'q1', questions: [{ question: 'Which branch?' }] }, completionUnread: false }],
	]),
);
check('identical pending snapshot does not re-notify', notifications.length === 0, notifications.map((n) => n.title));

// -------------------------------------------------------------------- mute ---
notifications.length = 0;
const headerMute = registeredSlots.find((entry) => entry.options.name === 'conversation.session.header.actions');
headerMute.Component({ sessionId: 's2' }); // renders a bell button
statusStore.set(
	new Map([
		['s1', { running: true, pendingInteraction: undefined, completionUnread: false }],
		['s2', { running: false, pendingInteraction: { sessionId: 's2', kind: 'question', key: 'q2', questions: [{ question: 'Again?' }] }, completionUnread: false }],
	]),
);
check('waiting session still notifies before mute', notifications.length === 1, notifications.length);

// Click the rendered mute button for s2.
const bell = created.find((node) => node.props && node.props['data-yany'] === 'session-mute');
check('mute button renders', bell !== undefined);
if (bell !== undefined) bell.props.onClick({ preventDefault() {}, stopPropagation() {} });

notifications.length = 0;
const tonesBeforeMute = tones.length;
const flashesBeforeMute = fetchCalls.filter((call) => call.url === '/dsh-yany/flash').length;
statusStore.set(new Map([['s2', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
statusStore.set(new Map([['s2', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
statusStore.set(new Map([['s2', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('muted session does not notify', notifications.length === 0, notifications.map((n) => n.title));
check('muted session stays silent', tones.length === tonesBeforeMute, tones.length - tonesBeforeMute);
check(
	'muted session does not flash the taskbar',
	fetchCalls.filter((call) => call.url === '/dsh-yany/flash').length === flashesBeforeMute,
);

const stored = JSON.parse(storage.get('dsh-yany.prefs.v1') || '{}');
check('mute state persists', Array.isArray(stored.mutedSessions) && stored.mutedSessions.includes('s2'), stored);

await wait(450);
const settingsPush = fetchCalls.find(
	(call) => call.url === '/dsh-yany/settings' && call.init && call.init.method === 'POST',
);
check('settings are written to the Host file', settingsPush !== undefined);
check(
	'settings payload carries the muted session',
	settingsPush !== undefined && String(settingsPush.init.body).includes('"s2"'),
	settingsPush && settingsPush.init.body,
);
check(
	'Host settings are read on startup',
	fetchCalls.some((call) => call.url === '/dsh-yany/settings' && ((call.init && call.init.method) || 'GET') === 'GET'),
);

// ------------------------------------------------------------------- panel ---
const panelSlot = registeredSlots.find((entry) => entry.options.name === 'shell.overlay');
const footerSlot = registeredSlots.find((entry) => entry.options.name === 'sidebar.footer.action');
check('panel hidden by default', panelSlot.Component({}) === null);
const footerButton = footerSlot.Component({});
check('footer button renders', footerButton !== null && footerButton !== undefined);
footerButton.props.onClick();
const panel = panelSlot.Component({});
check('panel opens from the footer button', panel !== null && panel !== undefined);
const texts = created.filter((node) => typeof node.children?.[0] === 'string' || typeof node.children === 'string');
check('panel mentions mute-all', JSON.stringify(panel).includes('Mute all notifications'));

// ------------------------------------------------- active-session sound ---
// The global option exists so an open, focused window still plays a cue for the
// session on screen; it must never add a second per-session copy of the option.
const activeSoundRow = [...created]
	.reverse()
	.find((node) => node.props && node.props.label === 'Sound for the active session');
check('active-session sound row is in the panel', activeSoundRow !== undefined);

ctx.uiWorkspace.mainReference = { sessionId: 's1' };
windowFocused = true;

notifications.length = 0;
let activeTones = tones.length;
const flashesBeforeActive = fetchCalls.filter((call) => call.url === '/dsh-yany/flash').length;
statusStore.set(new Map([['s1', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
statusStore.set(new Map([['s1', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('active session stays silent by default', tones.length === activeTones && notifications.length === 0, tones.length - activeTones);
check(
	'active session does not flash the taskbar',
	fetchCalls.filter((call) => call.url === '/dsh-yany/flash').length === flashesBeforeActive,
);

if (activeSoundRow !== undefined) activeSoundRow.props.onChange(true);

notifications.length = 0;
activeTones = tones.length;
statusStore.set(new Map([['s1', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
statusStore.set(new Map([['s1', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('active session completion plays a cue when enabled', tones.length > activeTones, tones.length - activeTones);
check('active session completion has no system toast', notifications.length === 0, notifications.map((n) => n.title));

notifications.length = 0;
activeTones = tones.length;
statusStore.set(
	new Map([
		['s1', { running: false, pendingInteraction: { sessionId: 's1', kind: 'approval', key: 'active-1', reason: 'Check' }, completionUnread: false }],
	]),
);
check('active session waiting plays a cue when enabled', tones.length > activeTones, tones.length - activeTones);
check('active session waiting has no system toast', notifications.length === 0, notifications.map((n) => n.title));

if (activeSoundRow !== undefined) activeSoundRow.props.onChange(false);

notifications.length = 0;
activeTones = tones.length;
statusStore.set(
	new Map([
		['s1', { running: false, pendingInteraction: { sessionId: 's1', kind: 'approval', key: 'active-2', reason: 'Check' }, completionUnread: false }],
	]),
);
check('active session is silent again when the option is off', tones.length === activeTones && notifications.length === 0);
windowFocused = false;

// ----------------------------------------------------------------- volume ---
const volumeRowNode = [...created]
	.reverse()
	.find((node) => node.type && node.type.name === 'VolumeRow');
check('volume row is in the panel', volumeRowNode !== undefined);
if (volumeRowNode !== undefined) volumeRowNode.type({});
const volumeSlider = [...created]
	.reverse()
	.find((node) => node.props && node.props.type === 'range');
check('volume slider is rendered', volumeSlider !== undefined);

const audio = FakeAudioContext.instances[0];
const master = audio ? audio.gains.find((gain) => gain.connectedTo === audio.destination) : undefined;
check('master gain starts at 70%', master !== undefined && master.gain.value === 0.7, master && master.gain.value);

listStore.set({
	phase: 'ready',
	ids: ['s1', 's2', 's3', 's4'],
	byId: {
		s1: { sessionId: 's1', title: 'First session', depth: 0 },
		s2: { sessionId: 's2', title: 'Second session', depth: 0 },
		s3: { sessionId: 's3', title: 'Third session', depth: 0 },
		s4: { sessionId: 's4', title: 'Fourth session', depth: 0 },
	},
});

if (volumeSlider !== undefined) volumeSlider.props.onChange({ target: { value: '0' } });
check('0% sets the master gain to zero', master !== undefined && master.gain.value === 0, master && master.gain.value);

notifications.length = 0;
const volumeTones = tones.length;
statusStore.set(new Map([['s4', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
statusStore.set(new Map([['s4', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('0% still announces the turn', notifications.length === 1, notifications.map((n) => n.title));
check('0% keeps the cue scheduled, only inaudible', tones.length > volumeTones, tones.length - volumeTones);

await wait(450);
const volumePush = [...fetchCalls]
	.reverse()
	.find((call) => call.url === '/dsh-yany/settings' && call.init && call.init.method === 'POST');
check('volume is persisted', volumePush !== undefined && String(volumePush.init.body).includes('"volume":0'), volumePush && volumePush.init.body);

if (volumeSlider !== undefined) volumeSlider.props.onChange({ target: { value: '70' } });
check('70% restores the master gain', master !== undefined && master.gain.value === 0.7, master && master.gain.value);

// ------------------------------------------------------------ localization ---
// The same module must render the Russian dictionary when the page locale is
// Russian; English is only the source language, not the only interface.
document.documentElement.lang = 'ru';
listStore.set({
	phase: 'ready',
	ids: ['s1', 's2', 's3'],
	byId: {
		s1: { sessionId: 's1', title: 'First session', depth: 0 },
		s2: { sessionId: 's2', title: 'Second session', depth: 0 },
		s3: { sessionId: 's3', title: 'Third session', depth: 0 },
	},
});
notifications.length = 0;
statusStore.set(new Map([['s3', { running: true, pendingInteraction: undefined, completionUnread: false }]]));
statusStore.set(new Map([['s3', { running: false, pendingInteraction: undefined, completionUnread: false }]]));
check('Russian locale renders the completion title', notifications[0] && notifications[0].title === 'Ход завершён', notifications[0] && notifications[0].title);
check('Russian locale names the session', notifications[0] && String(notifications[0].options.body).includes('Third session'), notifications[0] && notifications[0].options.body);
document.documentElement.lang = 'en';

// -------------------------------------------------------------- diagnostics --
const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
	for (const entry of failed) console.log('-', entry.name, entry.detail ?? '');
	process.exitCode = 1;
}
