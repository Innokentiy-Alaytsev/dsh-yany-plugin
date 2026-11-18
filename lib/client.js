window.__ModuleLoader__.load({
  id: '@crufteneer/dsh-yany-plugin',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = '@crufteneer/dsh-yany-plugin';
    const STORAGE_KEY = 'dsh-yany.prefs.v1';
    const LEGACY_STORAGE_KEY = 'dsh-notify.prefs.v1';

    const DICT = {
      en: {
        'panel.title': 'Notifications',
        'panel.open': 'Notification settings',
        'panel.close': 'Close',
        'panel.muteAll': 'Mute all notifications',
        'panel.muteAllHint': 'Silences every session until turned back on.',
        'panel.sound': 'Sound',
        'panel.soundHint': 'A short cue for each event.',
        'panel.volume': 'Volume',
        'panel.volumeHint': 'Cue loudness. At 0% notifications stay on, only the sound is muted.',
        'panel.activeSound': 'Sound for the active session',
        'panel.activeSoundHint': 'Play cues even for the session already open in the front window.',
        'panel.native': 'System notifications',
        'panel.nativeHint': 'Windows toast notifications from this app.',
        'panel.focus': 'Focus window on request',
        'panel.focusHint': 'Brings the session that waits for an answer to the front, one at a time.',
        'panel.test': 'Test notification',
        'panel.sessionMuted': 'This session is muted',
        'panel.sessionHint': 'Use the bell in a session header or sidebar row to mute just that session.',
        'mute.session': 'Mute notifications for this session',
        'unmute.session': 'Unmute notifications for this session',
        'waiting.title': 'Waiting for your input',
        'waiting.approval': 'Approval requested',
        'waiting.question': 'A question needs your answer',
        'waiting.fallback': 'The agent is waiting for you.',
        'completed.title': 'Turn completed',
        'failed.title': 'Turn failed',
        'untitled': 'Untitled session',
        'test.title': 'Notifications',
        'test.body': 'Sound and system notifications are working.',
      },
      ru: {
        'panel.title': 'Уведомления',
        'panel.open': 'Настройки уведомлений',
        'panel.close': 'Закрыть',
        'panel.muteAll': 'Заглушить все уведомления',
        'panel.muteAllHint': 'Отключает оповещения для всех сессий, пока не будет выключено.',
        'panel.sound': 'Звук',
        'panel.soundHint': 'Короткий сигнал для каждого события.',
        'panel.volume': 'Громкость',
        'panel.volumeHint': 'Громкость сигналов. При 0% оповещения остаются включёнными, беззвучен только сигнал.',
        'panel.activeSound': 'Звук для активной сессии',
        'panel.activeSoundHint': 'Играть сигналы даже для сессии, открытой в переднем окне.',
        'panel.native': 'Системные уведомления',
        'panel.nativeHint': 'Всплывающие уведомления Windows от этого приложения.',
        'panel.focus': 'Выводить окно при запросе',
        'panel.focusHint': 'Показывает сессию, которая ждёт ответа, на первом плане — по одной.',
        'panel.test': 'Проверить уведомление',
        'panel.sessionMuted': 'Эта сессия заглушена',
        'panel.sessionHint': 'Колокольчик в заголовке сессии или в строке списка заглушает только её.',
        'mute.session': 'Заглушить уведомления для этой сессии',
        'unmute.session': 'Включить уведомления для этой сессии',
        'waiting.title': 'Ожидается ваш ответ',
        'waiting.approval': 'Запрошено подтверждение',
        'waiting.question': 'Вопрос требует вашего ответа',
        'waiting.fallback': 'Агент ждёт вашего действия.',
        'completed.title': 'Ход завершён',
        'failed.title': 'Ход завершился неудачно',
        'untitled': 'Сессия без названия',
        'test.title': 'Уведомления',
        'test.body': 'Звук и системные уведомления работают.',
      },
      de: {
        'panel.title': 'Benachrichtigungen',
        'panel.open': 'Benachrichtigungseinstellungen',
        'panel.close': 'Schließen',
        'panel.muteAll': 'Alle Benachrichtigungen stummschalten',
        'panel.muteAllHint': 'Schaltet alle Sitzungen stumm, bis es wieder aktiviert wird.',
        'panel.sound': 'Ton',
        'panel.soundHint': 'Ein kurzer Signalton für jedes Ereignis.',
        'panel.volume': 'Lautstärke',
        'panel.volumeHint': 'Lautstärke der Signaltöne. Bei 0 % bleiben Benachrichtigungen aktiv, nur der Ton ist stumm.',
        'panel.activeSound': 'Ton für die aktive Sitzung',
        'panel.activeSoundHint': 'Spielt Signaltöne auch für die bereits im Vordergrundfenster geöffnete Sitzung.',
        'panel.native': 'Systembenachrichtigungen',
        'panel.nativeHint': 'Windows-Toastbenachrichtigungen dieser App.',
        'panel.focus': 'Fenster bei Anfrage fokussieren',
        'panel.focusHint': 'Holt die Sitzung, die auf eine Antwort wartet, eins nach dem anderen in den Vordergrund.',
        'panel.test': 'Benachrichtigung testen',
        'panel.sessionMuted': 'Diese Sitzung ist stummgeschaltet',
        'panel.sessionHint': 'Mit der Glocke in der Sitzungsüberschrift oder in der Seitenleiste nur diese Sitzung stummschalten.',
        'mute.session': 'Benachrichtigungen für diese Sitzung stummschalten',
        'unmute.session': 'Benachrichtigungen für diese Sitzung aktivieren',
        'waiting.title': 'Warten auf deine Eingabe',
        'waiting.approval': 'Bestätigung angefordert',
        'waiting.question': 'Eine Frage braucht deine Antwort',
        'waiting.fallback': 'Der Agent wartet auf dich.',
        'completed.title': 'Durchlauf abgeschlossen',
        'failed.title': 'Durchlauf fehlgeschlagen',
        'untitled': 'Unbenannte Sitzung',
        'test.title': 'Benachrichtigungen',
        'test.body': 'Ton und Systembenachrichtigungen funktionieren.',
      },
      es: {
        'panel.title': 'Notificaciones',
        'panel.open': 'Ajustes de notificaciones',
        'panel.close': 'Cerrar',
        'panel.muteAll': 'Silenciar todas las notificaciones',
        'panel.muteAllHint': 'Silencia todas las sesiones hasta que se vuelva a activar.',
        'panel.sound': 'Sonido',
        'panel.soundHint': 'Un breve aviso sonoro para cada evento.',
        'panel.volume': 'Volumen',
        'panel.volumeHint': 'Volumen de los avisos. Al 0 % las notificaciones siguen activas; solo se silencia el sonido.',
        'panel.activeSound': 'Sonido para la sesión activa',
        'panel.activeSoundHint': 'Reproduce los avisos incluso para la sesión ya abierta en la ventana en primer plano.',
        'panel.native': 'Notificaciones del sistema',
        'panel.nativeHint': 'Notificaciones emergentes de Windows de esta aplicación.',
        'panel.focus': 'Enfocar la ventana al solicitarlo',
        'panel.focusHint': 'Trae al frente la sesión que espera una respuesta, de una en una.',
        'panel.test': 'Probar notificación',
        'panel.sessionMuted': 'Esta sesión está silenciada',
        'panel.sessionHint': 'Usa la campana del encabezado de la sesión o de la fila de la barra lateral para silenciar solo esa sesión.',
        'mute.session': 'Silenciar las notificaciones de esta sesión',
        'unmute.session': 'Activar las notificaciones de esta sesión',
        'waiting.title': 'Esperando tu respuesta',
        'waiting.approval': 'Se ha solicitado aprobación',
        'waiting.question': 'Una pregunta necesita tu respuesta',
        'waiting.fallback': 'El agente está esperando tu acción.',
        'completed.title': 'Turno completado',
        'failed.title': 'El turno ha fallado',
        'untitled': 'Sesión sin título',
        'test.title': 'Notificaciones',
        'test.body': 'El sonido y las notificaciones del sistema funcionan.',
      },
      fr: {
        'panel.title': 'Notifications',
        'panel.open': 'Paramètres de notification',
        'panel.close': 'Fermer',
        'panel.muteAll': 'Couper toutes les notifications',
        'panel.muteAllHint': 'Coupe toutes les sessions jusqu’à réactivation.',
        'panel.sound': 'Son',
        'panel.soundHint': 'Un court signal pour chaque événement.',
        'panel.volume': 'Volume',
        'panel.volumeHint': 'Volume des signaux. À 0 %, les notifications restent actives, seul le son est coupé.',
        'panel.activeSound': 'Son pour la session active',
        'panel.activeSoundHint': 'Joue les signaux même pour la session déjà ouverte dans la fenêtre au premier plan.',
        'panel.native': 'Notifications système',
        'panel.nativeHint': 'Notifications toast Windows de cette application.',
        'panel.focus': 'Mettre la fenêtre au premier plan sur demande',
        'panel.focusHint': 'Affiche la session qui attend une réponse, une par une.',
        'panel.test': 'Tester la notification',
        'panel.sessionMuted': 'Cette session est coupée',
        'panel.sessionHint': 'Utilisez la cloche dans l’en-tête de session ou la ligne de la barre latérale pour couper uniquement cette session.',
        'mute.session': 'Couper les notifications de cette session',
        'unmute.session': 'Réactiver les notifications de cette session',
        'waiting.title': 'En attente de votre saisie',
        'waiting.approval': 'Approbation demandée',
        'waiting.question': 'Une question attend votre réponse',
        'waiting.fallback': 'L’agent attend votre action.',
        'completed.title': 'Tour terminé',
        'failed.title': 'Le tour a échoué',
        'untitled': 'Session sans titre',
        'test.title': 'Notifications',
        'test.body': 'Le son et les notifications système fonctionnent.',
      },
      ja: {
        'panel.title': '通知',
        'panel.open': '通知設定',
        'panel.close': '閉じる',
        'panel.muteAll': 'すべての通知をミュート',
        'panel.muteAllHint': '再度有効にするまで、すべてのセッションをミュートします。',
        'panel.sound': 'サウンド',
        'panel.soundHint': 'イベントごとに短い通知音を鳴らします。',
        'panel.volume': '音量',
        'panel.volumeHint': '通知音の音量です。0% でも通知は有効なままで、音だけが聞こえなくなります。',
        'panel.activeSound': 'アクティブなセッションの音',
        'panel.activeSoundHint': '前面ウィンドウで開いているセッションでも通知音を鳴らします。',
        'panel.native': 'システム通知',
        'panel.nativeHint': 'このアプリの Windows トースト通知です。',
        'panel.focus': '要求時にウィンドウを前面へ',
        'panel.focusHint': '応答待ちのセッションを 1 つずつ前面に表示します。',
        'panel.test': '通知をテスト',
        'panel.sessionMuted': 'このセッションはミュートされています',
        'panel.sessionHint': 'セッション見出しまたはサイドバー行のベルで、そのセッションだけをミュートできます。',
        'mute.session': 'このセッションの通知をミュート',
        'unmute.session': 'このセッションの通知を有効化',
        'waiting.title': '入力待ちです',
        'waiting.approval': '承認が求められています',
        'waiting.question': '回答が必要な質問があります',
        'waiting.fallback': 'エージェントがあなたの操作を待っています。',
        'completed.title': 'ターン完了',
        'failed.title': 'ターン失敗',
        'untitled': '無題のセッション',
        'test.title': '通知',
        'test.body': 'サウンドとシステム通知は正常に動作しています。',
      },
      pt: {
        'panel.title': 'Notificações',
        'panel.open': 'Configurações de notificações',
        'panel.close': 'Fechar',
        'panel.muteAll': 'Silenciar todas as notificações',
        'panel.muteAllHint': 'Silencia todas as sessões até ser reativado.',
        'panel.sound': 'Som',
        'panel.soundHint': 'Um sinal curto para cada evento.',
        'panel.volume': 'Volume',
        'panel.volumeHint': 'Volume dos sinais. Em 0%, as notificações continuam ativas; apenas o som fica mudo.',
        'panel.activeSound': 'Som para a sessão ativa',
        'panel.activeSoundHint': 'Toca os sinais mesmo para a sessão já aberta na janela em primeiro plano.',
        'panel.native': 'Notificações do sistema',
        'panel.nativeHint': 'Notificações toast do Windows deste aplicativo.',
        'panel.focus': 'Focar a janela ao solicitar',
        'panel.focusHint': 'Traz para a frente a sessão que espera uma resposta, uma de cada vez.',
        'panel.test': 'Testar notificação',
        'panel.sessionMuted': 'Esta sessão está silenciada',
        'panel.sessionHint': 'Use o sino no cabeçalho da sessão ou na linha da barra lateral para silenciar apenas essa sessão.',
        'mute.session': 'Silenciar as notificações desta sessão',
        'unmute.session': 'Ativar as notificações desta sessão',
        'waiting.title': 'Aguardando sua resposta',
        'waiting.approval': 'Aprovação solicitada',
        'waiting.question': 'Uma pergunta precisa da sua resposta',
        'waiting.fallback': 'O agente está aguardando sua ação.',
        'completed.title': 'Turno concluído',
        'failed.title': 'O turno falhou',
        'untitled': 'Sessão sem título',
        'test.title': 'Notificações',
        'test.body': 'O som e as notificações do sistema estão funcionando.',
      },
      zh: {
        'panel.title': '通知',
        'panel.open': '通知设置',
        'panel.close': '关闭',
        'panel.muteAll': '全部通知静音',
        'panel.muteAllHint': '在所有会话上静音，直到重新开启。',
        'panel.sound': '声音',
        'panel.soundHint': '每个事件播放简短提示音。',
        'panel.volume': '音量',
        'panel.volumeHint': '提示音音量。0% 时通知仍然开启，只是听不到声音。',
        'panel.activeSound': '当前会话声音',
        'panel.activeSoundHint': '即使会话已在最前台窗口中打开，也播放提示音。',
        'panel.native': '系统通知',
        'panel.nativeHint': '本应用发送的 Windows 通知。',
        'panel.focus': '请求时置前窗口',
        'panel.focusHint': '将等待回答的会话逐个置于最前。',
        'panel.test': '测试通知',
        'panel.sessionMuted': '此会话已静音',
        'panel.sessionHint': '使用会话标题栏或侧边栏行中的铃铛，仅静音该会话。',
        'mute.session': '静音此会话的通知',
        'unmute.session': '开启此会话的通知',
        'waiting.title': '等待你的输入',
        'waiting.approval': '请求批准',
        'waiting.question': '有一个问题需要你回答',
        'waiting.fallback': '智能体正在等待你的操作。',
        'completed.title': '轮次完成',
        'failed.title': '轮次失败',
        'untitled': '未命名会话',
        'test.title': '通知',
        'test.body': '声音和系统通知工作正常。',
      },
    };

    const CSS = `
.yany-btn { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; padding:0; border:0; border-radius:6px; background:transparent; color:var(--dsw-alias-label-tertiary,#8b95a5); cursor:pointer; line-height:0; }
.yany-btn:hover { background:var(--dsw-alias-fill-l1,rgba(255,255,255,.07)); color:var(--dsw-alias-label-secondary,#c3cad6); }
.yany-btn:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#3b82f6); outline-offset:1px; }
.yany-btn.yany-off { color:var(--dsw-alias-state-warning-primary,#f59e0b); }
.yany-backdrop { position:fixed; inset:0; z-index:1190; background:transparent; }
.yany-panel { position:fixed; left:12px; bottom:56px; z-index:1200; box-sizing:border-box; width:310px; max-width:calc(100vw - 24px); padding:12px; border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12)); border-radius:10px; background-color:var(--dsw-alias-bg-layer-2,#232830); background-image:linear-gradient(var(--dsw-menu-surface-fill,#303136a3),var(--dsw-menu-surface-fill,#303136a3)); color:var(--dsw-alias-label-primary,#e6e9ef); box-shadow:var(--dsw-elevation-prominent,0 14px 38px rgba(0,0,0,.45)); font:12px/1.45 var(--dsw-font-sans,system-ui,-apple-system,"Segoe UI",sans-serif); }
.yany-head { display:flex; align-items:center; gap:8px; margin:0 0 8px; }
.yany-head-title { flex:1; font-size:13px; font-weight:600; }
.yany-row { display:flex; align-items:center; gap:10px; padding:6px 4px; border-radius:6px; cursor:pointer; }
.yany-row:hover { background:var(--dsw-alias-fill-l1,rgba(255,255,255,.05)); }
.yany-row-text { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.yany-row-label { font-size:12px; color:var(--dsw-alias-label-primary,#e6e9ef); }
.yany-row-hint { font-size:11px; color:var(--dsw-alias-label-tertiary,#8b95a5); }
.yany-row input[type=checkbox] { width:16px; height:16px; margin:0; accent-color:var(--dsw-alias-state-business-primary,#3b82f6); cursor:pointer; }
.yany-volume { flex-direction:column; align-items:stretch; gap:4px; cursor:default; }
.yany-volume-head { display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
.yany-volume-value { color:var(--dsw-alias-label-secondary,#c3cad6); font-size:11px; font-variant-numeric:tabular-nums; }
.yany-volume input[type=range] { width:100%; margin:0; accent-color:var(--dsw-alias-state-business-primary,#3b82f6); cursor:pointer; }
.yany-sep { height:1px; margin:8px 0; background:var(--dsw-alias-border-l1,rgba(255,255,255,.1)); }
.yany-actions { display:flex; gap:8px; padding:2px 4px 0; }
.yany-link { padding:4px 8px; border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14)); border-radius:6px; background:transparent; color:var(--dsw-alias-label-secondary,#c3cad6); font:inherit; cursor:pointer; }
.yany-link:hover { background:var(--dsw-alias-fill-l1,rgba(255,255,255,.07)); }
.yany-hint { margin:8px 4px 0; font-size:11px; color:var(--dsw-alias-label-tertiary,#8b95a5); }
.yany-muted-mark { display:inline-flex; color:var(--dsw-alias-state-warning-primary,#f59e0b); line-height:0; }
`;

    function normalizePrefs(raw) {
      const base = {
        master: true,
        sound: true,
        native: true,
        focus: true,
        activeSound: false,
        volume: 0.7,
        mutedSessions: [],
      };
      if (raw === null || typeof raw !== 'object') return base;
      const volume =
        typeof raw.volume === 'number' && Number.isFinite(raw.volume)
          ? Math.min(1, Math.max(0, raw.volume))
          : 0.7;
      return {
        master: raw.master !== false,
        sound: raw.sound !== false,
        native: raw.native !== false,
        focus: raw.focus !== false,
        activeSound: raw.activeSound === true,
        volume,
        mutedSessions: Array.isArray(raw.mutedSessions)
          ? raw.mutedSessions.filter((id) => typeof id === 'string')
          : [],
      };
    }

    function createStore(initial, persistKey) {
      let snapshot = initial;
      const listeners = new Set();
      return {
        getSnapshot: () => snapshot,
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        set(next) {
          snapshot = next;
          if (persistKey !== undefined) {
            try {
              localStorage.setItem(persistKey, JSON.stringify(next));
            } catch {
              /* private mode or a full quota never breaks notifications */
            }
          }
          for (const listener of [...listeners]) {
            try {
              listener();
            } catch (error) {
              console.error('[dsh-yany] store listener failed:', error);
            }
          }
        },
      };
    }

    function loadPrefs() {
      try {
        const current = localStorage.getItem(STORAGE_KEY);
        const legacy = current === null ? localStorage.getItem(LEGACY_STORAGE_KEY) : null;
        const prefs = normalizePrefs(JSON.parse(current ?? legacy ?? 'null'));
        if (current === null && legacy !== null) {
          // Rename migration: keep the old browser preferences and drop the
          // legacy key so only the new one is read next time.
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch {
            /* the cache is best effort */
          }
        }
        return prefs;
      } catch {
        return normalizePrefs(null);
      }
    }

    const prefs = createStore(loadPrefs(), STORAGE_KEY);
    const ui = createStore({ panel: false });

    // The Host owns the durable settings file; this browser store is a cache so
    // the first paint never waits for the network, and a fallback when the Host
    // route is unavailable.
    const SETTINGS_ENDPOINT = '/dsh-yany/settings';
    let prefsDirty = false;
    let settingsPushTimer = null;

    function usePrefs() {
      return React.useSyncExternalStore(prefs.subscribe, prefs.getSnapshot, prefs.getSnapshot);
    }

    function useUi() {
      return React.useSyncExternalStore(ui.subscribe, ui.getSnapshot, ui.getSnapshot);
    }

    function isSessionMuted(state, sessionId) {
      if (state.master === false) return true;
      return sessionId !== undefined && state.mutedSessions.includes(sessionId);
    }

    function updatePrefs(patch) {
      const next = { ...prefs.getSnapshot(), ...patch };
      prefs.set(next);
      if (patch.volume !== undefined) applyVolume();
      prefsDirty = true;
      scheduleSettingsPush();
      if (!next.focus || !next.master) {
        focusQueue.length = 0;
        focusActive = null;
      }
      pumpFocus();
    }

    function scheduleSettingsPush() {
      if (settingsPushTimer !== null) clearTimeout(settingsPushTimer);
      settingsPushTimer = setTimeout(() => {
        settingsPushTimer = null;
        pushSettings();
      }, 300);
    }

    async function pushSettings() {
      try {
        const response = await fetch(SETTINGS_ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(prefs.getSnapshot()),
        });
        if (response.ok) prefsDirty = false;
      } catch {
        /* the local cache stays authoritative until the next change */
      }
    }

    async function loadHostSettings() {
      try {
        const response = await fetch(SETTINGS_ENDPOINT, {
          method: 'GET',
          headers: { accept: 'application/json' },
        });
        if (!response.ok) return;
        const payload = await response.json();
        const raw =
          payload !== null && typeof payload === 'object' && payload.settings !== undefined
            ? payload.settings
            : payload;
        const next = normalizePrefs(raw);
        // A change made while the read was in flight wins over the stored copy.
        if (prefsDirty) {
          scheduleSettingsPush();
          return;
        }
        // First run after the move from localStorage: keep the local copy and
        // materialize it into the Host file instead of discarding it. With
        // defaults this still creates the file on the first page load.
        if (payload !== null && typeof payload === 'object' && payload.exists === false) {
          prefsDirty = true;
          scheduleSettingsPush();
          return;
        }
        prefs.set(next);
        applyVolume();
        writeBootMarker('settings');
      } catch {
        /* keep the cached settings when the Host is unreachable */
      }
    }

    function toggleSessionMute(sessionId) {
      if (typeof sessionId !== 'string' || sessionId === '') return;
      const state = prefs.getSnapshot();
      const muted = state.mutedSessions.includes(sessionId);
      updatePrefs({
        mutedSessions: muted
          ? state.mutedSessions.filter((id) => id !== sessionId)
          : [...state.mutedSessions, sessionId],
      });
    }

    function togglePanel() {
      ui.set({ ...ui.getSnapshot(), panel: !ui.getSnapshot().panel });
    }

    /** Support diagnostic: the last completed boot/settings phase in this page. */
    function writeBootMarker(phase) {
      try {
        const state = prefs.getSnapshot();
        localStorage.setItem(
          'dsh-yany.boot.v1',
          JSON.stringify({
            at: Date.now(),
            phase,
            audio:
              typeof window.AudioContext !== 'undefined' ||
              typeof window.webkitAudioContext !== 'undefined',
            notifications: typeof Notification !== 'undefined',
            permission: typeof Notification !== 'undefined' ? Notification.permission : 'unavailable',
            master: state.master,
            sound: state.sound,
            native: state.native,
            focus: state.focus,
            activeSound: state.activeSound,
            volume: state.volume,
            muted: state.mutedSessions.length,
          }),
        );
      } catch {
        /* storage may be unavailable */
      }
    }

    function closePanel() {
      if (ui.getSnapshot().panel) ui.set({ ...ui.getSnapshot(), panel: false });
    }

    /** @type {null | object} */
    let ctx = null;
    let tt = (key) => key;
    let audioContext = null;
    let masterGain = null;
    // The envelope levels are deliberately quiet; this baseline multiplies them
    // so the volume slider at 100% is audible on a typically quiet desktop mix.
    const CUE_GAIN = 8;

    const errors = new Map();
    const errorTimers = new Map();
    const prevStatus = new Map();
    const pendingKeys = new Map();
    const focusQueue = [];
    let focusActive = null;
    let pumping = false;

    function makeT(context) {
      let bound = null;
      try {
        bound = context.locale.bind(NS);
      } catch {
        bound = null;
      }
      return function translate(key, params) {
        if (bound !== null) {
          try {
            const value = bound(key, params);
            if (typeof value === 'string' && value !== key) return value;
          } catch {
            /* fall through to the bundled dictionary */
          }
        }
        let language = 'en';
        try {
          const raw =
            document.documentElement.lang ||
            (navigator.languages && navigator.languages[0]) ||
            navigator.language ||
            'en';
          language = String(raw).slice(0, 2).toLowerCase();
        } catch {
          language = 'en';
        }
        const dictionary = DICT[language] || DICT.en;
        let text = dictionary[key] ?? DICT.en[key] ?? key;
        if (params !== undefined && params !== null) {
          for (const name of Object.keys(params)) {
            text = text.split('{' + name + '}').join(String(params[name]));
          }
        }
        return text;
      };
    }

    function collapse(text) {
      return String(text === undefined || text === null ? '' : text)
        .replace(/\s+/g, ' ')
        .trim();
    }

    function truncate(text, limit) {
      const value = collapse(text);
      return value.length > limit ? value.slice(0, Math.max(0, limit - 1)) + '…' : value;
    }

    function sessionRow(sessionId) {
      try {
        const list = ctx.sessions.list.getSnapshot();
        return list && list.byId ? list.byId[sessionId] : undefined;
      } catch {
        return undefined;
      }
    }

    function sessionTitle(sessionId) {
      const row = sessionRow(sessionId);
      const title = row && typeof row.title === 'string' ? collapse(row.title) : '';
      return title !== '' ? title : tt('untitled');
    }

    function isSubagentRow(row) {
      if (row === undefined || row === null) return false;
      // `origin` is the authoritative marker; a historical fork can keep a
      // `parentSessionId` without being a subagent, so it is not used. `depth`
      // covers subagent-catalog rows that do not carry the header origin.
      if (row.origin === 'subagent') return true;
      if (row.subagent !== undefined && row.subagent !== null) return true;
      return typeof row.depth === 'number' && row.depth > 0;
    }

    function isViewing(sessionId) {
      try {
        const workspace = ctx.uiWorkspace;
        return Boolean(workspace && workspace.mainReference && workspace.mainReference.sessionId === sessionId);
      } catch {
        return false;
      }
    }

    function allowed(sessionId) {
      return !isSessionMuted(prefs.getSnapshot(), sessionId);
    }

    function pendingOf(sessionId) {
      try {
        const snapshot = ctx.uiSession.sessionStatus.getSnapshot();
        const state = snapshot.get(sessionId);
        return state ? state.pendingInteraction : undefined;
      } catch {
        return undefined;
      }
    }

    // ---------------------------------------------------------------- sound --

    function currentVolume() {
      const value = prefs.getSnapshot().volume;
      return typeof value === 'number' && Number.isFinite(value)
        ? Math.min(1, Math.max(0, value))
        : 0.7;
    }

    function ensureAudio() {
      if (audioContext !== null) return audioContext;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      try {
        audioContext = new AudioCtor();
        masterGain = audioContext.createGain();
        masterGain.gain.value = currentVolume();
        masterGain.connect(audioContext.destination);
      } catch {
        audioContext = null;
        masterGain = null;
      }
      return audioContext;
    }

    function applyVolume() {
      if (audioContext === null || masterGain === null) return;
      const value = currentVolume();
      try {
        if (typeof masterGain.gain.setTargetAtTime === 'function') {
          masterGain.gain.setTargetAtTime(value, audioContext.currentTime, 0.02);
        } else {
          masterGain.gain.value = value;
        }
      } catch {
        masterGain.gain.value = value;
      }
    }

    function scheduleTone(context, frequency, delay, duration, volume, type) {
      const startedAt = context.currentTime + delay;
      const level = Math.min(1, volume * CUE_GAIN);
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type || 'sine';
      oscillator.frequency.setValueAtTime(frequency, startedAt);
      gain.gain.setValueAtTime(0.0001, startedAt);
      gain.gain.exponentialRampToValueAtTime(level, startedAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + duration);
      oscillator.connect(gain);
      gain.connect(masterGain === null ? context.destination : masterGain);
      oscillator.start(startedAt);
      oscillator.stop(startedAt + duration + 0.03);
    }

    function playCue(kind) {
      if (prefs.getSnapshot().sound !== true) return;
      const context = ensureAudio();
      if (context === null) return;
      // A zero volume keeps the cue scheduled but inaudible; notifications are
      // never disabled by the volume control.
      applyVolume();
      if (context.state === 'suspended') {
        context.resume().catch(() => {});
      }
      try {
        if (kind === 'failed') {
          scheduleTone(context, 392, 0, 0.16, 0.09, 'sine');
          scheduleTone(context, 311, 0.18, 0.24, 0.08, 'sine');
        } else if (kind === 'complete') {
          scheduleTone(context, 659, 0, 0.12, 0.08, 'sine');
          scheduleTone(context, 880, 0.13, 0.18, 0.07, 'sine');
        } else {
          scheduleTone(context, 1046, 0, 0.09, 0.08, 'triangle');
          scheduleTone(context, 1318, 0.11, 0.09, 0.07, 'triangle');
          scheduleTone(context, 1046, 0.22, 0.14, 0.06, 'triangle');
        }
      } catch (error) {
        console.warn('[dsh-yany] sound failed:', error);
      }
    }

    // ------------------------------------------------------------- native OS --

    function nativeAvailable() {
      return typeof Notification !== 'undefined';
    }

    function requestNativePermission() {
      if (!nativeAvailable() || Notification.permission !== 'default') return;
      if (prefs.getSnapshot().native !== true) return;
      try {
        const result = Notification.requestPermission();
        if (result && typeof result.catch === 'function') result.catch(() => {});
      } catch {
        /* a blocked permission simply disables toasts */
      }
    }

    function notifyNative(title, body, sessionId, urgent) {
      if (prefs.getSnapshot().native !== true || !nativeAvailable()) return;
      if (Notification.permission !== 'granted') return;
      try {
        const notification = new Notification(title, {
          body,
          silent: true,
          tag: sessionId ? 'dsh-yany:' + sessionId : 'dsh-yany',
          requireInteraction: urgent === true,
        });
        notification.onclick = () => {
          try {
            notification.close();
          } catch {
            /* already closed */
          }
          if (typeof sessionId === 'string' && sessionId !== '') {
            revealSession(sessionId).catch(() => {});
          } else {
            focusWindow();
          }
        };
      } catch (error) {
        console.warn('[dsh-yany] system notification failed:', error);
      }
    }

    // ------------------------------------------------------------ focus queue --

    function enqueueFocus(sessionId, key) {
      const state = prefs.getSnapshot();
      if (state.focus !== true || state.master !== true || state.mutedSessions.includes(sessionId)) return;
      const existing = focusQueue.find((item) => item.sessionId === sessionId);
      if (existing !== undefined) existing.key = key;
      else focusQueue.push({ sessionId, key });
      pumpFocus();
    }

    async function revealSession(sessionId) {
      try {
        const workspace = ctx.uiWorkspace;
        const current = workspace && workspace.mainReference ? workspace.mainReference.sessionId : undefined;
        if (current !== sessionId && workspace && typeof workspace.openSession === 'function') {
          workspace.openSession(sessionId);
        }
      } catch (error) {
        console.warn('[dsh-yany] could not open the session:', error);
      }
      await new Promise((resolve) => setTimeout(resolve, 320));
      await focusWindow();
    }

    async function focusWindow() {
      // The Host owns window activation on Windows. A renderer-initiated
      // `window.focus()` is only a fallback for compositions without the Host
      // route: on Electron it can race with the native restore and leave the
      // window minimized, which is the bug this order avoids.
      try {
        const response = await fetch('/dsh-yany/focus', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{"source":"dsh-yany"}',
        });
        if (response.ok) return true;
      } catch {
        /* fall through to the renderer fallback */
      }
      try {
        window.focus();
      } catch {
        /* the window may be locked by the OS */
      }
      return false;
    }

    async function flashTaskbar() {
      // Standard Windows taskbar flash (FlashWindowEx, FLASHW_TRAY |
      // FLASHW_TIMERNOFG). It never changes focus, Z-order, size, or
      // visibility, and stops as soon as the window is activated.
      try {
        const response = await fetch('/dsh-yany/flash', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{"source":"dsh-yany"}',
        });
        return response.ok;
      } catch {
        return false;
      }
    }

    async function pumpFocus() {
      if (pumping) return;
      pumping = true;
      try {
        for (;;) {
          if (focusActive !== null) {
            const current = pendingOf(focusActive.sessionId);
            const stillQueued = current !== undefined && current.key === focusActive.key;
            if (stillQueued && allowed(focusActive.sessionId)) break;
            focusActive = null;
          }
          const next = focusQueue.shift();
          if (next === undefined) break;
          const current = pendingOf(next.sessionId);
          if (current === undefined || current.key !== next.key) continue;
          if (!allowed(next.sessionId)) continue;
          focusActive = next;
          await revealSession(next.sessionId);
        }
      } finally {
        pumping = false;
      }
    }

    // ---------------------------------------------------------------- events --

    function waitingBody(interaction) {
      if (interaction === null || typeof interaction !== 'object') return tt('waiting.fallback');
      if (interaction.kind === 'approval') {
        const reason = interaction.displayReason || interaction.reason;
        if (typeof reason === 'string' && collapse(reason) !== '') return truncate(reason, 200);
        const tool = typeof interaction.toolName === 'string' ? interaction.toolName : '';
        return tool !== '' ? tt('waiting.approval') + ': ' + tool : tt('waiting.approval');
      }
      if (Array.isArray(interaction.questions) && interaction.questions.length > 0) {
        const first = interaction.questions[0];
        const text = first && (first.question || first.prompt || first.title || first.text);
        if (typeof text === 'string' && collapse(text) !== '') return truncate(text, 200);
        return tt('waiting.question');
      }
      return tt('waiting.fallback');
    }

    function onWaiting(sessionId, interaction) {
      if (!allowed(sessionId)) return;
      const active = isViewing(sessionId) && document.hasFocus();
      // The user is looking at this session in the front window: the approval
      // card is already on screen, so no toast and no window action. With the
      // global `activeSound` preference the cue still plays, because the window
      // can be open and focused while the user is away from it.
      if (active) {
        if (prefs.getSnapshot().activeSound === true) playCue('input');
        return;
      }
      playCue('input');
      notifyNative(tt('waiting.title'), sessionTitle(sessionId) + '\n' + waitingBody(interaction), sessionId, true);
      flashTaskbar();
      if (prefs.getSnapshot().focus === true) enqueueFocus(sessionId, interaction.key);
    }

    function clearError(sessionId) {
      errors.delete(sessionId);
      const timer = errorTimers.get(sessionId);
      if (timer !== undefined) {
        clearTimeout(timer);
        errorTimers.delete(sessionId);
      }
    }

    function onFinished(sessionId) {
      const failure = errors.get(sessionId);
      clearError(sessionId);
      if (!allowed(sessionId)) return;
      const active = isViewing(sessionId) && document.hasFocus();
      if (active && prefs.getSnapshot().activeSound !== true) return;

      if (failure !== undefined) {
        playCue('failed');
        if (!active) {
          notifyNative(tt('failed.title'), sessionTitle(sessionId) + '\n' + truncate(failure.message, 180), sessionId, false);
          flashTaskbar();
        }
      } else {
        playCue('complete');
        if (!active) {
          notifyNative(tt('completed.title'), sessionTitle(sessionId), sessionId, false);
          flashTaskbar();
        }
      }
    }

    function onAgentError(sessionId, message) {
      if (typeof sessionId !== 'string' || sessionId === '') return;
      const entry = { message: collapse(message), at: Date.now() };
      errors.set(sessionId, entry);

      const pending = errorTimers.get(sessionId);
      if (pending !== undefined) clearTimeout(pending);
      errorTimers.set(
        sessionId,
        setTimeout(() => {
          errorTimers.delete(sessionId);
          const current = errors.get(sessionId);
          if (current === undefined || current.at !== entry.at) return;
          let running;
          try {
            running = ctx.uiSession.sessionStatus.getSnapshot().get(sessionId)?.running;
          } catch {
            running = undefined;
          }
          if (running === true) return;
          onFinished(sessionId);
        }, 4000),
      );
    }

    function onStatus(prime) {
      let snapshot;
      try {
        snapshot = ctx.uiSession.sessionStatus.getSnapshot();
      } catch {
        return;
      }
      if (snapshot === null || typeof snapshot.forEach !== 'function') return;

      let list = null;
      try {
        list = ctx.sessions.list.getSnapshot();
      } catch {
        list = null;
      }

      snapshot.forEach((state, sessionId) => {
        const row = list && list.byId ? list.byId[sessionId] : undefined;
        if (isSubagentRow(row)) {
          prevStatus.set(sessionId, state);
          return;
        }

        const previous = prevStatus.get(sessionId);
        const interaction = state.pendingInteraction;

        if (interaction !== undefined && interaction !== null) {
          if (pendingKeys.get(sessionId) !== interaction.key) {
            pendingKeys.set(sessionId, interaction.key);
            if (prime !== true) onWaiting(sessionId, interaction);
          }
        } else if (pendingKeys.has(sessionId)) {
          pendingKeys.delete(sessionId);
        }

        if (prime !== true && previous !== undefined) {
          if (previous.running === true && state.running === false) onFinished(sessionId);
          if (previous.running !== true && state.running === true) clearError(sessionId);
        }

        prevStatus.set(sessionId, state);
      });

      if (prime === true) {
        for (const sessionId of [...prevStatus.keys()]) {
          if (!snapshot.has(sessionId)) prevStatus.delete(sessionId);
        }
      }

      pumpFocus();
    }

    // ----------------------------------------------------------- components --

    function BellIcon(props) {
      const off = props && props.off === true;
      const size = props && typeof props.size === 'number' ? props.size : 16;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          style: { display: 'block' },
        },
        h('path', { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8' }),
        h('path', { d: 'M13.7 21a2 2 0 0 1-3.4 0' }),
        off ? h('line', { x1: 3, y1: 3, x2: 21, y2: 21 }) : null,
      );
    }

    function MuteButton(props) {
      const state = usePrefs();
      const sessionId = props && props.sessionId;
      if (typeof sessionId !== 'string' || sessionId === '') return null;
      const muted = isSessionMuted(state, sessionId);
      const label = muted ? tt('unmute.session') : tt('mute.session');
      return h(
        'button',
        {
          type: 'button',
          className: 'yany-btn' + (muted ? ' yany-off' : ''),
          title: label,
          'aria-label': label,
          'aria-pressed': muted,
          'data-yany': 'session-mute',
          onClick: (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleSessionMute(sessionId);
          },
        },
        h(BellIcon, { off: muted, size: props.size || 16 }),
      );
    }

    function RowMuteAction(props) {
      const state = usePrefs();
      const sessionId = props && props.sessionId;
      if (typeof sessionId !== 'string' || sessionId === '') return null;
      const muted = isSessionMuted(state, sessionId);
      return h(
        'button',
        {
          type: 'button',
          className: 'yany-btn' + (muted ? ' yany-off' : ''),
          title: muted ? tt('unmute.session') : tt('mute.session'),
          'aria-label': muted ? tt('unmute.session') : tt('mute.session'),
          'data-yany': 'row-mute',
          onClick: (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleSessionMute(sessionId);
          },
        },
        h(BellIcon, { off: muted, size: 14 }),
      );
    }

    function RowMutedMark(props) {
      const state = usePrefs();
      const sessionId = props && props.sessionId;
      if (typeof sessionId !== 'string' || sessionId === '') return null;
      if (!isSessionMuted(state, sessionId)) return null;
      return h(
        'span',
        {
          className: 'yany-muted-mark',
          title: tt('unmute.session'),
          'data-yany': 'row-muted',
          onClick: (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleSessionMute(sessionId);
          },
        },
        h(BellIcon, { off: true, size: 12 }),
      );
    }

    function FooterButton() {
      const state = usePrefs();
      const layer = useUi();
      const off = state.master !== true;
      const label = tt('panel.open');
      return h(
        'button',
        {
          type: 'button',
          className: 'yany-btn' + (off ? ' yany-off' : ''),
          title: label,
          'aria-label': label,
          'aria-expanded': layer.panel === true,
          'data-yany': 'footer',
          onClick: () => togglePanel(),
        },
        h(BellIcon, { off, size: 16 }),
      );
    }

    function ToggleRow(props) {
      return h(
        'label',
        { className: 'yany-row' },
        h(
          'span',
          { className: 'yany-row-text' },
          h('span', { className: 'yany-row-label' }, props.label),
          props.hint ? h('span', { className: 'yany-row-hint' }, props.hint) : null,
        ),
        h('input', {
          type: 'checkbox',
          checked: props.checked === true,
          onChange: (event) => props.onChange(event.target.checked),
        }),
      );
    }

    function VolumeRow() {
      const state = usePrefs();
      const percent = Math.round(
        (typeof state.volume === 'number' ? Math.min(1, Math.max(0, state.volume)) : 0.7) * 100,
      );
      return h(
        'div',
        { className: 'yany-row yany-volume' },
        h(
          'div',
          { className: 'yany-volume-head' },
          h('span', { className: 'yany-row-label' }, tt('panel.volume')),
          h('span', { className: 'yany-volume-value' }, percent + '%'),
        ),
        h('input', {
          type: 'range',
          min: 0,
          max: 100,
          step: 5,
          value: percent,
          'aria-label': tt('panel.volume'),
          onChange: (event) => updatePrefs({ volume: Number(event.target.value) / 100 }),
        }),
        h('span', { className: 'yany-row-hint' }, tt('panel.volumeHint')),
      );
    }

    function Panel() {
      const state = usePrefs();
      const layer = useUi();
      if (layer.panel !== true) return null;

      const currentSession = (() => {
        try {
          const workspace = ctx.uiWorkspace;
          return workspace && workspace.mainReference ? workspace.mainReference.sessionId : undefined;
        } catch {
          return undefined;
        }
      })();
      const currentMuted =
        typeof currentSession === 'string' ? isSessionMuted(state, currentSession) : false;

      return h(
        'div',
        { className: 'yany-backdrop', onMouseDown: () => closePanel() },
        h(
          'div',
          {
            className: 'yany-panel',
            role: 'dialog',
            'aria-label': tt('panel.title'),
            onMouseDown: (event) => event.stopPropagation(),
          },
          h(
            'div',
            { className: 'yany-head' },
            h('span', { style: { display: 'inline-flex', color: 'var(--dsw-alias-label-secondary,#c3cad6)' } }, h(BellIcon, { off: state.master !== true, size: 15 })),
            h('span', { className: 'yany-head-title' }, tt('panel.title')),
            h(
              'button',
              { type: 'button', className: 'yany-btn', title: tt('panel.close'), 'aria-label': tt('panel.close'), onClick: () => closePanel() },
              '×',
            ),
          ),
          h(ToggleRow, {
            label: tt('panel.muteAll'),
            hint: tt('panel.muteAllHint'),
            checked: state.master !== true,
            onChange: (checked) => updatePrefs({ master: !checked }),
          }),
          h('div', { className: 'yany-sep' }),
          h(ToggleRow, {
            label: tt('panel.sound'),
            hint: tt('panel.soundHint'),
            checked: state.sound === true,
            onChange: (checked) => updatePrefs({ sound: checked }),
          }),
          h(VolumeRow),
          h(ToggleRow, {
            label: tt('panel.activeSound'),
            hint: tt('panel.activeSoundHint'),
            checked: state.activeSound === true,
            onChange: (checked) => updatePrefs({ activeSound: checked }),
          }),
          h(ToggleRow, {
            label: tt('panel.native'),
            hint: tt('panel.nativeHint'),
            checked: state.native === true,
            onChange: (checked) => {
              updatePrefs({ native: checked });
              if (checked) requestNativePermission();
            },
          }),
          h(ToggleRow, {
            label: tt('panel.focus'),
            hint: tt('panel.focusHint'),
            checked: state.focus === true,
            onChange: (checked) => updatePrefs({ focus: checked }),
          }),
          h('div', { className: 'yany-sep' }),
          h(
            'div',
            { className: 'yany-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'yany-link',
                onClick: () => {
                  ensureAudio();
                  playCue('input');
                  notifyNative(tt('test.title'), tt('test.body'), undefined, false);
                },
              },
              tt('panel.test'),
            ),
            typeof currentSession === 'string'
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'yany-link',
                    onClick: () => toggleSessionMute(currentSession),
                  },
                  currentMuted ? tt('unmute.session') : tt('mute.session'),
                )
              : null,
          ),
          h('div', { className: 'yany-hint' }, tt('panel.sessionHint')),
        ),
      );
    }

    // ------------------------------------------------------------------ apply --

    const inject = ['slots', 'locale', 'sessions', 'uiSession', 'uiWorkspace', 'remote'];

    function apply(context) {
      ctx = context;

      context.effect(
        () => context.locale.register(NS, DICT),
        'dsh-yany: dictionaries',
      );
      tt = makeT(context);

      context.effect(
        () => {
          if (document.querySelector('style[data-yany]') !== null) return () => {};
          const tag = document.createElement('style');
          tag.dataset.yany = '';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        },
        'dsh-yany: styles',
      );

      context.effect(
        () => {
          const status = context.uiSession && context.uiSession.sessionStatus;
          if (!status || typeof status.subscribe !== 'function') return () => {};
          const unsubscribe = status.subscribe(() => onStatus(false));
          onStatus(true);
          return () => {
            unsubscribe();
          };
        },
        'dsh-yany: session status',
      );

      context.effect(
        () => {
          if (!context.remote || typeof context.remote.$on !== 'function') return () => {};
          return context.remote.$on('api-session/error', (sessionId, message) => {
            onAgentError(sessionId, message);
          });
        },
        'dsh-yany: agent errors',
      );

      context.effect(
        () => {
          const unlock = () => {
            requestNativePermission();
            if (prefs.getSnapshot().sound === true) {
              const audio = ensureAudio();
              if (audio !== null && audio.state === 'suspended') audio.resume().catch(() => {});
            }
          };
          window.addEventListener('pointerdown', unlock, true);
          window.addEventListener('keydown', unlock, true);
          return () => {
            window.removeEventListener('pointerdown', unlock, true);
            window.removeEventListener('keydown', unlock, true);
          };
        },
        'dsh-yany: audio and permission unlock',
      );

      context.slots.inject('conversation.session.header.actions', () =>
        context.slots.register(
          {
            name: 'conversation.session.header.actions',
            id: 'dsh-yany.mute',
            order: 40,
            locale: NS,
          },
          MuteButton,
        ),
      );

      context.slots.inject('sidebar.session.row.hover', () =>
        context.slots.register(
          {
            name: 'sidebar.session.row.hover',
            id: 'dsh-yany.row-mute',
            order: 20,
            locale: NS,
          },
          RowMuteAction,
        ),
      );

      context.slots.inject('sidebar.session.row.trailing', () =>
        context.slots.register(
          {
            name: 'sidebar.session.row.trailing',
            id: 'dsh-yany.row-muted',
            order: 20,
            locale: NS,
          },
          RowMutedMark,
        ),
      );

      context.slots.inject('sidebar.footer.action', () =>
        context.slots.register(
          {
            name: 'sidebar.footer.action',
            id: 'dsh-yany.footer',
            order: 30,
            locale: NS,
          },
          FooterButton,
        ),
      );

      context.slots.inject('shell.overlay', () =>
        context.slots.register(
          {
            name: 'shell.overlay',
            id: 'dsh-yany.panel',
            order: 100,
            locale: NS,
          },
          Panel,
        ),
      );

      context.effect(
        () => () => {
          for (const timer of errorTimers.values()) clearTimeout(timer);
          errorTimers.clear();
          focusQueue.length = 0;
          focusActive = null;
        },
        'dsh-yany: timers',
      );

      context.effect(
        () => {
          loadHostSettings();
          const refresh = () => {
            if (document.visibilityState === 'visible') loadHostSettings();
          };
          window.addEventListener('focus', refresh);
          if (typeof document.addEventListener === 'function') {
            document.addEventListener('visibilitychange', refresh);
          }
          return () => {
            window.removeEventListener('focus', refresh);
            if (typeof document.removeEventListener === 'function') {
              document.removeEventListener('visibilitychange', refresh);
            }
            if (settingsPushTimer !== null) {
              clearTimeout(settingsPushTimer);
              settingsPushTimer = null;
            }
          };
        },
        'dsh-yany: settings file',
      );

      // Support diagnostic: proves in the page that this client half booted, and
      // records the notification surface it found. Never read by the plugin.
      writeBootMarker('boot');
    }

    return { inject, apply, dict: DICT };
  },
});
