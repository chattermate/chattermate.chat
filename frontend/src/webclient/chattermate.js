// @ts-nocheck
import { createHostActions } from './loader/hostActions.js'
import { createPushLayout, sheetCss } from './loader/pushLayout.js'
// TypeScript declarations for global variables
/** @type {string} */
window.chattermateId;
/** @type {string} */
window.chattermateBaseUrl;
/** @type {object} Public widget API — see the assignment at the bottom of this file. */
window.ChatterMate;
/** @type {object|undefined} Declarative options, same shape as ChatterMate.init(options). */
window.chattermateConfig;

;(function () {
  // Function to validate hex color code
  function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  // Resolve the backend base URL at RUNTIME so a single built chattermate.min.js
  // works for every deployment without a rebuild. Priority:
  //   1. window.chattermateBaseUrl — set by the install snippet the dashboard
  //      generates, so a self-hosted embed reaches the right backend even though
  //      this script runs on the customer's own site (where config.js is absent).
  //   2. window.APP_CONFIG.API_URL — present when embedded inside our own SPA.
  //   3. __CHATTERMATE_API_URL__ — the default baked at build time (see the
  //      build-webclient scripts). Only this default changes per build; the
  //      resolution logic above stays runtime, so env changes need no rebuild.
  function getBaseUrl() {
    if (typeof window !== 'undefined' && window.chattermateBaseUrl) {
      return window.chattermateBaseUrl;
    }

    if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.API_URL) {
      return window.APP_CONFIG.API_URL;
    }

    if (typeof __CHATTERMATE_API_URL__ !== 'undefined') {
      return __CHATTERMATE_API_URL__;
    }

    // Final fallback — default to production so a plain build ships working.
    return 'https://api.chattermate.chat/api/v1';
  }

  // Configuration object
  const config = {
    baseUrl: getBaseUrl(),
    containerId: 'chattermate-container',
    backdropId: 'chattermate-backdrop',
    buttonId: 'chattermate-button',
    chatBubbleColor: '#f34611', // Default color
    loadingContainerId: 'chattermate-loading',
    tokenKey: 'ctid', // Key for localStorage
    tokenProvider: null, // Host callback that mints a fresh conversation token
    containerBottom: 100, // Default bottom position
    containerRight: 20, // Default right position
    containerWidth: 400, // Default width
    containerHeight: 560, // Default height
    launcherBottom: 20, // Launcher button distance from the bottom edge (configurable)
    launcherRight: 20, // Launcher button distance from the active side edge (configurable)
    side: 'right', // Which screen edge the launcher/window hug: 'right' | 'left'
    displayMode: 'floating', // 'floating' | 'sidebar-left' | 'sidebar-right' | 'search-bar'
    launcher: true, // false hides the built-in launcher (site uses its own trigger/API)
    sidebarWidth: 420, // Panel width in the sidebar display modes
    layout: 'overlay', // 'overlay' | 'push': in sidebar modes, push moves pushTarget aside
    pushTarget: null, // CSS selector of the page content the push layout makes room in
    mobileMode: 'fullscreen', // 'fullscreen' | 'sheet' (a bottom sheet on phones)
    searchBarWidth: 320, // Trigger bar width in search-bar mode
    searchPlaceholder: 'Ask anything...',
    zIndex: 999999, // Stacking base; related layers offset from it (badge -1, mobile chrome +1/+2)
    trigger: null, // Optional CSS selector — matching elements toggle the chat on click
    hotkey: true, // ⌘K opens the Ask AI palette; set false if the site owns that key
    surfaceIsPalette: null, // Reported by the widget (WIDGET_SURFACE); null until then
    chatStyle: null, // Reported by the widget; decides whether it draws its own close
    chatInitiationMessages: [], // Will be populated from widget data
    initiationMessageId: 'chattermate-initiation',
    initiationShownKey: 'ctim_shown', // Key for tracking if initiation was shown
    unreadCount: 0, // unread agent messages (reported by the iframe) once chat opened
    hasOpened: false, // whether the visitor has opened the chat at least once
  }

  // Keys the developer set explicitly (via chattermateConfig / init / setPosition).
  // Dashboard defaults arriving later over CUSTOMIZATION_UPDATE never override these —
  // precedence is: developer options > dashboard settings > built-in defaults.
  const devOverrides = {}
  function setDevConfig(key, value) {
    config[key] = value
    devOverrides[key] = true
  }

  const DISPLAY_MODES = ['floating', 'sidebar-left', 'sidebar-right', 'search-bar']
  // Chat styles that render the Ask AI surface (centered command palette) instead of
  // a corner chat window. Mirrors isAskAnythingStyle in WidgetBuilder.vue.
  const ASK_AI_STYLES = ['ASK_ANYTHING', 'AURORA']
  // Palette defaults, used only when no explicit size was configured.
  const ASK_AI_WIDTH = 680
  const ASK_AI_HEIGHT = 620 // Ceiling: the palette grows to fit its content up to this.
  const ASK_AI_MIN_HEIGHT = 140

  // Whether a size came from the developer or the dashboard, as opposed to the
  // built-in default. The Ask AI palette has its own defaults but must still honour
  // an explicitly configured size.
  const sizeIsExplicit = { width: false, height: false }

  // The palette is the surface for the ask-anything styles, and for the search-bar
  // trigger whatever the style — a box labelled "Ask anything" that opens a corner
  // chat window is incoherent. An explicit drawer choice still wins.
  // Last height the palette asked for, so a window resize can re-clamp it against the
  // new 76vh ceiling instead of leaving the box at a stale size.
  let paletteContentHeight = 0

  function isAskAiModal() {
    // The widget reports which surface it actually rendered (WIDGET_SURFACE); it
    // falls back to the chat panel for ratings, product cards and workflow forms,
    // and that needs the ordinary window geometry, not a hugged palette.
    if (config.surfaceIsPalette === false) return false
    const askSurface = ASK_AI_STYLES.indexOf(config.chatStyle) !== -1
      || config.displayMode === 'search-bar'
    return askSurface
      && config.displayMode !== 'sidebar-left'
      && config.displayMode !== 'sidebar-right'
  }

  // Size the container to the palette's reported content height, clamped. Called on
  // every report and on window resize (the 76vh ceiling moves with the viewport).
  // Clears the inline height entirely for non-palette surfaces, so a hugged height
  // can never linger on an ordinary chat window.
  function applyPaletteHeight() {
    const container = document.getElementById(config.containerId)
    if (!container) return
    if (!isAskAiModal() || !paletteContentHeight) {
      container.style.height = ''
      return
    }
    const max = Math.min(paletteSize().height, Math.round(window.innerHeight * 0.76))
    container.style.height = Math.max(ASK_AI_MIN_HEIGHT, Math.min(max, paletteContentHeight)) + 'px'
  }

  function paletteSize() {
    return {
      width: sizeIsExplicit.width ? config.containerWidth : ASK_AI_WIDTH,
      height: sizeIsExplicit.height ? config.containerHeight : ASK_AI_HEIGHT,
    }
  }

  // Dashboard "Widget placement" defaults (customization_metadata.widget_display,
  // validated server-side) arriving over CUSTOMIZATION_UPDATE. Fills only the keys
  // the developer didn't set. Types are re-checked because this crosses a frame.
  function applyDashboardDisplay(display) {
    if (!display || typeof display !== 'object') return
    const set = function (configKey, value) {
      if (!devOverrides[configKey]) config[configKey] = value
    }
    if (DISPLAY_MODES.indexOf(display.mode) !== -1) set('displayMode', display.mode)
    if (display.side === 'left' || display.side === 'right') set('side', display.side)
    if (typeof display.launcher === 'boolean') set('launcher', display.launcher)
    if (isNumber(display.width)) {
      set('containerWidth', Math.max(280, display.width))
      if (!devOverrides.containerWidth) sizeIsExplicit.width = true
    }
    if (isNumber(display.height)) {
      set('containerHeight', Math.max(400, display.height))
      if (!devOverrides.containerHeight) sizeIsExplicit.height = true
    }
    if (isNumber(display.sidebar_width)) set('sidebarWidth', Math.max(280, display.sidebar_width))
    if (typeof display.search_placeholder === 'string' && display.search_placeholder) {
      set('searchPlaceholder', display.search_placeholder.slice(0, 80))
    }
    if (isNumber(display.offset_bottom)) set('launcherBottom', Math.max(0, display.offset_bottom))
    if (isNumber(display.offset_side)) set('launcherRight', Math.max(0, display.offset_side))
    if (isNumber(display.z_index)) set('zIndex', Math.max(1, Math.floor(display.z_index)))
  }

  // Geometry the widget interior needs to adapt its own sizing (see WidgetBuilder).
  // Reports what the container actually is, which in Ask AI mode is the palette
  // rather than the configured floating-window size.
  function widgetDisplayPayload() {
    const palette = isAskAiModal()
    const size = palette ? paletteSize() : { width: config.containerWidth, height: config.containerHeight }
    return {
      type: 'WIDGET_DISPLAY',
      mode: palette ? 'ask-ai' : config.displayMode,
      width: size.width,
      height: size.height,
      // So the palette's own ⌘K handler honours a site that turned the chord off.
      hotkey: config.hotkey !== false,
    }
  }

  // The chat window's open/close mechanics live inside initialize() (they need the
  // DOM elements it creates). This controller is populated there so the public API
  // below can reach them; calls made before then are queued and flushed on init.
  let controller = null
  const pendingCalls = []
  let triggerClickQueued = false
  // The widget iframe's window, once created — message handlers accept commands
  // only from it, so other embedded frames (ads etc.) can't drive the widget.
  // The widget's iframe. Its window is read live: moving the container in the DOM
  // gives the frame a new WindowProxy.
  let widgetFrame = null
  function frameWindow() {
    return widgetFrame ? widgetFrame.contentWindow : null
  }
  // Bumped whenever the page changes who the visitor is (identify, logout,
  // destroy): an answer that arrives later for the old identity is dropped.
  let identityEpoch = 0
  // The conversation the frame is in, reported by CHAT_CREATED. Kept so logout() and
  // a change of identity can close it server-side before the frame goes away.
  let currentSessionId = null
  // The widget frame's origin, taken from its FRAME_READY: the frame may have been
  // redirected to a dedicated host, so it isn't derived from baseUrl. Everything sent
  // to the frame is addressed to it, so a token never reaches any other document.
  let frameOrigin = null
  function postToFrame(message) {
    const target = frameWindow()
    if (target && frameOrigin) target.postMessage(message, frameOrigin)
  }
  // The page's in-app actions and context (ChatterMate.registerActions/setContext).
  // Only reaches the frame once it has mounted; announced again on every mount.
  const hostActions = createHostActions(function (message) {
    if (!widgetMounted) return false
    postToFrame(message)
    return true
  }, (function () { try { return window.sessionStorage } catch (e) { return null } })())
  const pushLayout = createPushLayout(window)
  // Only the widget frame may talk to the loader: the right window, and the right
  // origin - which is only known once it says hello, so until then hello is all it
  // may say (hostile sibling frames can reach us, and a frame could be somewhere
  // unexpected before that).
  function isFromWidgetFrame(event) {
    const target = frameWindow()
    if (!target || event.source !== target) return false
    if (!frameOrigin) return event.data.type === 'FRAME_READY'
    return event.origin === frameOrigin
  }
  // Whether the widget in the current frame has mounted (WIDGET_READY): only then is
  // it listening for anything but the handshake.
  let widgetMounted = false
  // A fresher token for the same visitor, given while the frame was still starting:
  // handed over as soon as the widget mounts.
  let pendingIdentity = null
  // The last load failed in a way that may have passed (a server error, a frame
  // that never answered): the next time the visitor opens the chat, try again.
  let retryOnOpen = false
  const NOT_CONFIGURED = 'This chat widget is not currently configured. Please contact the website administrator to enable chat support.'
  // A frame of ours that this page's Content-Security-Policy refused (no frame-src
  // for us): the widget is then built inside the page instead (fallBackInPage).
  let frameRefusedByPolicy = false
  // This script's own address while it runs: the in-page loader sits beside it.
  const LOADER_SRC = (document.currentScript && document.currentScript.src) || ''
  const IN_PAGE_LOADER = 'chattermate-legacy.min.js'
  // How long the in-page chat gets to load, then to come up once loaded, before the
  // framed widget comes back to say it can't load here
  const IN_PAGE_START_MS = 20000
  const IN_PAGE_MOUNT_MS = 10000
  let fellBackInPage = false
  // The in-page loader couldn't be fetched: the framed widget is back, showing its error
  let inPageUnavailable = false
  // Every option given (window.chattermateConfig, init()): handed on to the in-page loader
  const givenOptions = {}
  // Set while the frame closes an outgoing visitor's session; called on END_CHAT_DONE.
  let endChatDone = null
  let endChatTimer = null
  function cancelEndChat() {
    clearTimeout(endChatTimer)
    endChatTimer = null
    endChatDone = null
  }
  // Set by destroy(): the site removed the widget on purpose, so nothing may
  // rebuild it or queue work against it until it calls reload().
  let isDestroyed = false
  function withController(fn) {
    if (controller) {
      fn()
    } else if (!isDestroyed) {
      pendingCalls.push(fn)
    }
  }

  // Public event bus: 'ready' | 'open' | 'close' | 'unread'.
  // 'ready' fires once; late subscribers are invoked immediately (see on()).
  const listeners = {}
  let widgetReadyFired = false
  function emitEvent(name, payload) {
    const cbs = listeners[name]
    if (!cbs || !cbs.length) return
    cbs.slice().forEach(function (cb) {
      try { cb(payload) } catch (e) { /* a broken site listener must not break the widget */ }
    })
  }

  // Pick a readable ink color (dark/light) for content sitting on a given bg.
  function onColor(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim())
    if (!m) return '#0B0C10'
    const n = parseInt(m[1], 16)
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
    return lum > 0.6 ? '#0B0C10' : '#FFFFFF'
  }

  // The launcher stays invisible (`.chattermate-pending`, see updateStyles) until
  // revealButton() runs, so the correct brand color is applied before it's ever seen —
  // no orange-then-green flash on a cold cache. Reveal fires on whichever happens
  // first: the real color arrives (CUSTOMIZATION_UPDATE), the widget fails to load
  // (so the "Chat Unavailable" card stays reachable), or a timeout as a last resort.
  let buttonRevealed = false
  let revealTimeoutId = null
  const onRevealCallbacks = []

  function revealButton() {
    if (buttonRevealed) return
    buttonRevealed = true
    if (revealTimeoutId) {
      clearTimeout(revealTimeoutId)
      revealTimeoutId = null
    }
    const btn = document.getElementById(config.buttonId)
    if (btn) btn.classList.remove('chattermate-pending')
    onRevealCallbacks.splice(0).forEach((cb) => {
      try { cb() } catch (e) { /* no-op */ }
    })
  }

  // Launcher badge: show the nudge count until the chat is first opened, then the
  // count of unread agent messages reported by the iframe. Hidden when open/empty.
  function updateBadge() {
    const btn = document.getElementById(config.buttonId)
    if (!btn) return
    const badge = btn.querySelector('.cm-badge')
    if (!badge) return
    const count = config.hasOpened
      ? config.unreadCount
      : (config.chatInitiationMessages || []).length
    badge.textContent = count > 99 ? '99+' : String(count)
    badge.style.display = (count > 0 && !btn.classList.contains('active')) ? 'flex' : 'none'
  }

  // Create and inject styles
  function updateStyles() {
    const mode = config.displayMode
    const isSidebar = mode === 'sidebar-left' || mode === 'sidebar-right'
    // Sidebar modes pin the window to their own edge; everything else (launcher,
    // nudge, floating window) follows the configured side.
    const side = mode === 'sidebar-left' ? 'left' : (mode === 'sidebar-right' ? 'right' : config.side)
    // The search bar is shorter than the bubble launcher; dependent offsets track it.
    const launcherHeight = mode === 'search-bar' ? 48 : 64
    // Every chat style draws a header chevron that closes the widget, except
    // ASK_ANYTHING and AURORA (see isAskAnythingStyle in WidgetBuilder.vue).
    const hasInPanelClose = ASK_AI_STYLES.indexOf(config.chatStyle) === -1
    // Ask AI styles open as a centered command-palette overlay (⌘K), the pattern
    // people expect from an "Ask anything" surface — not a corner chat window.
    // Sidebar modes still win: an explicit drawer choice is more specific.
    const askAiModal = isAskAiModal()
    const palette = paletteSize()

    const style = document.createElement('style')
    style.id = 'chattermate-styles'
    style.textContent = `
      /* ===== Rounded-square launcher (design comp) ===== */
      #${config.buttonId} {
        position: fixed;
        bottom: ${config.launcherBottom}px;
        ${side}: ${config.launcherRight}px;
        width: 64px;
        height: 64px;
        border-radius: 20px 20px 20px 6px;
        background: ${config.chatBubbleColor};
        color: ${onColor(config.chatBubbleColor)};
        box-shadow: 0 16px 40px -8px ${config.chatBubbleColor}cc, inset 0 0 0 1px rgba(255,255,255,0.08);
        cursor: pointer;
        z-index: ${config.zIndex};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s cubic-bezier(.34,1.3,.5,1), opacity 320ms ease;
        animation: chattermate-float 4s ease-in-out infinite;
      }
      #${config.buttonId}.active { animation: none; }
      /* Stay fully invisible until the org's real brand color is known (or the
         widget errors out / times out) — avoids ever flashing the wrong color. */
      #${config.buttonId}.chattermate-pending {
        opacity: 0;
        pointer-events: none;
      }
      #${config.buttonId}:hover { transform: scale(1.06); }

      /* Expanding rings (closed state only) */
      #${config.buttonId} .cm-ring {
        position: absolute;
        inset: 0;
        border-radius: 20px 20px 20px 6px;
        border: 1.5px solid ${config.chatBubbleColor};
        animation: chattermate-ring 2.4s ease-out infinite;
        pointer-events: none;
      }
      #${config.buttonId} .cm-ring.r2 { animation-delay: 1.2s; }
      #${config.buttonId}.active .cm-ring { display: none; }

      /* Pulsing 3-dot mark (closed). Absolutely centered so it stays pinned to the
         button's center regardless of the button's display mode (flex on desktop,
         block when .mobile-closed) or viewport. */
      #${config.buttonId} .cm-dots {
        display: flex;
        gap: 5px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      #${config.buttonId} .cm-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
        animation: chattermate-pulse 1.5s ease-in-out infinite;
      }
      #${config.buttonId} .cm-dot:nth-child(2) { animation-delay: .18s; }
      #${config.buttonId} .cm-dot:nth-child(3) { animation-delay: .36s; }
      #${config.buttonId}.active .cm-dots { display: none; }

      /* Chevron (open) — absolutely centered, pinned to the button center. */
      #${config.buttonId} .cm-chevron {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 26px;
        font-weight: 700;
        line-height: 1;
        color: currentColor;
      }
      #${config.buttonId}.active .cm-chevron { display: block; }

      /* Unread badge = number of nudges */
      #${config.buttonId} .cm-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        min-width: 22px;
        height: 22px;
        padding: 0 6px;
        border-radius: 999px;
        background: #FF8A73;
        color: #0B0C10;
        font: 700 11.5px/1 -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        align-items: center;
        justify-content: center;
        border: 2px solid #F5F3EE;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: none;
      }
      #${config.buttonId}.active .cm-badge { display: none; }

      #${config.buttonId}.loading .cm-dots,
      #${config.buttonId}.loading .cm-chevron { visibility: hidden; }
      #${config.buttonId}.loading:after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin: -8px 0 0 -8px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: chattermate-spin 0.6s linear infinite;
      }

      /* Search-bar trigger content: hidden unless search-bar mode (below) shows it. */
      #${config.buttonId} .cm-search { display: none; }

      ${mode === 'search-bar' ? `
      @media (min-width: 769px) {
        /* ===== Search-bar mode: the launcher becomes a search-input-like bar.
           Same element, same click/toggle/badge logic. Mobile keeps the bubble. ===== */
        #${config.buttonId} {
          width: ${config.searchBarWidth}px;
          height: 48px;
          border-radius: 24px;
          padding: 0 16px;
          background: #ffffff;
          color: #374151;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14), inset 0 0 0 1.5px ${config.chatBubbleColor}55;
          animation: none;
          justify-content: flex-start;
          box-sizing: border-box;
        }
        #${config.buttonId}:hover { transform: scale(1.02); }
        #${config.buttonId} .cm-ring,
        #${config.buttonId} .cm-dots,
        #${config.buttonId} .cm-chevron,
        #${config.buttonId}.active .cm-chevron { display: none; }
        /* Dark spinner — the stock white one vanishes on the white bar. */
        #${config.buttonId}.loading .cm-search { visibility: hidden; }
        #${config.buttonId}.loading:after {
          border-color: rgba(0, 0, 0, 0.15);
          border-top-color: ${config.chatBubbleColor};
        }
        #${config.buttonId} .cm-search {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          width: 100%;
        }
        #${config.buttonId} .cm-search svg {
          flex-shrink: 0;
          color: ${config.chatBubbleColor};
        }
        #${config.buttonId} .cm-search-placeholder {
          font: 400 14px/1.2 -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      ` : ''}

      @keyframes chattermate-spin { to { transform: rotate(360deg); } }
      @keyframes chattermate-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes chattermate-ring { 0% { transform: scale(.85); opacity: .5; } 100% { transform: scale(1.6); opacity: 0; } }
      @keyframes chattermate-pulse { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }

      @media (prefers-reduced-motion: reduce) {
        #${config.buttonId},
        #${config.buttonId} .cm-ring,
        #${config.buttonId} .cm-dot,
        .initiation-orb { animation: none !important; }
        /* Open and close in place: no slide, scale or fade for people who asked for less motion. */
        #${config.buttonId},
        #${config.containerId},
        #${config.backdropId} { transition: none !important; }
      }

      #${config.containerId} {
        position: fixed;
        /* The window sits above the launcher; when the launcher is moved (via
           ChatterMate.init position / setPosition) the window shifts by the same
           delta so the two stay together. Mobile is full-screen (media query below)
           and is unaffected. */
        bottom: ${(config.containerBottom || 100) + ((config.launcherBottom || 20) - 20)}px;
        ${side}: ${(config.containerRight || 20) + ((config.launcherRight || 20) - 20)}px;
        width: ${config.containerWidth || 384}px;
        max-width: calc(100vw - 48px);
        height: ${config.containerHeight}px;
        max-height: calc(100vh - 132px);
        background: transparent;
        z-index: ${config.zIndex};
        overflow: hidden;
        /* Animated open/close with slide + fade */
        opacity: 0;
        visibility: hidden;
        transform: translateY(16px) scale(0.98);
        transition: opacity 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 360ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 360ms;
        border: none;
        padding: 0;
        margin: 0;
        pointer-events: none;
      }

      #${config.containerId}.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
        transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
        pointer-events: auto;
      }

      /* Backdrop element: always in the DOM, so keep it out of the host page's flow
         even when it is not in use — an unstyled div in <body> adds a phantom row to
         a flex/grid body layout. */
      #${config.backdropId} {
        position: fixed;
        inset: 0;
        display: none;
      }

      ${askAiModal ? `
      /* ===== Ask AI: centered command palette (⌘K), the pattern people expect from
         an "Ask anything" surface — dimmed page, top-anchored so the eye lands on
         the input rather than the middle of the screen. ===== */
      #${config.containerId} {
        top: 12vh;
        bottom: auto;
        left: 50%;
        right: auto;
        width: min(${palette.width}px, calc(100vw - 32px));
        max-width: none;
        /* A cross-document iframe can't size its embedder, so this is a starting
           height only: the palette measures its content and posts WIDGET_RESIZE,
           which sets an inline height (clamped to this ceiling). height:100% against
           an auto-height parent would collapse to the 150px replaced default. */
        height: min(${palette.height}px, 76vh);
        max-height: 76vh;
        transform: translate(-50%, -8px) scale(0.98);
        z-index: ${config.zIndex + 1};
        transition: opacity 360ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
                    height 200ms cubic-bezier(0.22, 1, 0.36, 1),
                    visibility 0s linear 360ms;
      }
      #${config.containerId}.active {
        transform: translate(-50%, 0) scale(1);
        transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
                    height 200ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      #${config.containerId} .chattermate-iframe {
        border-radius: 16px;
      }
      #${config.backdropId} {
        display: block;
        background: rgba(9, 9, 14, 0.45);
        backdrop-filter: blur(2px);
        z-index: ${config.zIndex};
        opacity: 0;
        visibility: hidden;
        transition: opacity 220ms ease, visibility 0s linear 220ms;
      }
      #${config.backdropId}.active {
        opacity: 1;
        visibility: visible;
        transition: opacity 220ms ease;
      }
      /* The palette dims the page and closes on backdrop click / Esc, so the launcher
         would just be a stray button floating over the dim. */
      #${config.buttonId}.active {
        display: none;
      }
      @media (max-width: 768px) {
        /* Full-screen on phones like every other mode. The main mobile block below
           pins the edges but never resets transform — without this the centering
           translate would shove the panel half a screen to the left. */
        #${config.containerId},
        #${config.containerId}.active { transform: none !important; }
        #${config.backdropId} { display: none; }
      }
      ` : ''}

      ${isSidebar ? `
      /* ===== Sidebar mode: full-height drawer hugging the ${side} edge ===== */
      #${config.containerId} {
        top: 0;
        bottom: auto;
        ${side}: 0;
        ${side === 'left' ? 'right: auto;' : 'left: auto;'}
        width: ${config.sidebarWidth}px;
        max-width: 100vw;
        height: 100dvh;
        max-height: 100dvh;
        transform: translateX(${side === 'left' ? '-100%' : '100%'});
        box-shadow: ${side === 'left' ? '' : '-'}12px 0 40px rgba(0, 0, 0, 0.12);
      }
      #${config.containerId}.active {
        transform: translateX(0);
      }
      #${config.containerId} .chattermate-iframe {
        border-radius: 0;
      }
      ${hasInPanelClose ? `
      /* The drawer's own header chevron closes it, so keeping the launcher on screen
         would just park a duplicate button beside the panel. Hide it while open. */
      #${config.buttonId}.active {
        display: none;
      }
      ` : `
      /* ASK_ANYTHING / AURORA draw no in-panel chevron, and the drawer would paint over
         the launcher (later sibling, equal z-index) — leaving nothing to click. Keep it
         reachable: slide it out beside the drawer edge, one layer up. */
      #${config.buttonId} {
        z-index: ${config.zIndex + 1};
        transition: transform 0.3s cubic-bezier(.34,1.3,.5,1), opacity 320ms ease,
                    left 360ms cubic-bezier(0.22, 1, 0.36, 1), right 360ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      #${config.buttonId}.active {
        ${side}: ${config.sidebarWidth + 20}px;
      }
      `}
      ` : ''}

      /* Clean border around the widget container */
      /* The widget panel (inside the iframe) draws its own theme-aware border, so the
         container no longer adds one — avoids a double border (and a white line on dark themes). */

        .chattermate-iframe {
                width: 100%;
        height: 100%;
        border: none;
        padding: 0;
        margin: 0;
        display: block;
        border-radius: 24px;
        /* Rely on corner shadows from container */
        box-shadow: none;
      }

      #chattermate-mobile-close {
        display: none;
        position: fixed;
        top: 20px;
        right: 20px;
        width: 44px;
        height: 44px;
        background: transparent;
        border: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: ${config.zIndex + 1};
        transition: all 0.3s ease;
      }

      #chattermate-mobile-topbar {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        z-index: ${config.zIndex};
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        box-sizing: border-box;
      }

      #chattermate-mobile-topbar.active {
        display: flex;
      }

      #chattermate-mobile-topbar .topbar-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      /* Only ASK_ANYTHING (which has no in-panel header chevron) uses the floating
         mobile-close; other styles close via the header chevron, so don't double up. */
      .ask-anything-mobile #chattermate-mobile-close.active {
        display: flex;
      }

      @media (max-width: 768px) {
        #${config.containerId} {
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important; /* Dynamic viewport height for mobile browsers */
          /* Reset the desktop max-width/height clamp — without this the desktop rule's
             max-width: calc(100vw - 48px) / max-height: calc(100vh - 132px) keeps the
             window a floating panel instead of going full-screen on mobile. */
          max-width: 100vw !important;
          max-height: 100vh !important;
          max-height: 100dvh !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          right: 0 !important;
          border-radius: 0 !important;
          position: fixed !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        #${config.containerId}.active {
          bottom: 0 !important;
        }

        .chattermate-iframe {
          border-radius: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important; /* Dynamic viewport height for mobile browsers */
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        #${config.buttonId} {
          display: none;
        }

        #${config.buttonId}.mobile-closed {
          /* flex (not block) keeps the launcher's centering context; the dots/chevron
             are absolutely centered regardless, but this keeps it consistent. */
          display: flex !important;
          width: 56px !important;
          height: 56px !important;
          /* Respect the configured position on mobile too, so the closed launcher can
             clear a fixed bottom nav bar (the main reason to move it up). */
          bottom: ${config.launcherBottom}px !important;
          ${side}: ${config.launcherRight}px !important;
        }

        .ask-anything-mobile #chattermate-mobile-close.active {
          display: flex !important;
        }

        #chattermate-mobile-close:hover {
          opacity: 0.7;
        }

        /* ASK_ANYTHING style specific mobile topbar */
        .ask-anything-mobile #chattermate-mobile-topbar.active {
          display: flex !important;
        }

        .ask-anything-mobile #chattermate-mobile-close.active {
          top: 15px !important;
          right: 15px !important;
          z-index: ${config.zIndex + 2} !important;
        }

        /* When topbar is visible, push iframe down to avoid overlap */
        .ask-anything-mobile .chattermate-iframe {
          top: 60px !important;
          height: calc(100vh - 60px) !important;
          height: calc(100dvh - 60px) !important;
        }
      }

      @media (min-width: 769px) {
        #chattermate-mobile-close {
          display: none !important;
        }
      }

      /* Chat Initiation Message Styles */
      #${config.initiationMessageId} {
        position: fixed !important;
        /* Sit above the launcher (+12px gap) and align to its edge on the active side,
           so it never overlaps the icon regardless of the configured position/mode. */
        bottom: ${(config.launcherBottom || 20) + launcherHeight + 12}px !important;
        ${side}: ${config.launcherRight || 20}px !important;
        max-width: 260px !important;
        background: white !important;
        padding: 12px 36px 12px 14px !important;
        border-radius: 14px !important;
        box-shadow: 0 3px 16px rgba(0, 0, 0, 0.1) !important;
        z-index: ${config.zIndex - 1} !important;
        cursor: pointer !important;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px) scale(0.95);
        transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1) !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        font-size: 14px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        border: none !important;
        display: block !important;
        width: auto !important;
        height: auto !important;
        min-width: 0 !important;
        min-height: 0 !important;
        max-height: none !important;
        line-height: 1.4 !important;
        text-align: left !important;
        vertical-align: baseline !important;
        overflow: visible !important;
      }
      /* Clamp the nudge text to 4 lines with an ellipsis so a long welcome/initiation
         message can never balloon the bubble over the page or into the launcher.
         Applied to the text node only, so the orb (left:-34px) is never clipped. */
      #${config.initiationMessageId} .initiation-message-text {
        margin: 0 !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 4 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
      }

      /* Siri-style orb avatar beside the nudge (design comp) */
      .initiation-orb {
        position: absolute !important;
        left: -34px !important;
        bottom: 2px !important;
        width: 26px !important;
        height: 26px !important;
        border-radius: 50% !important;
        background: conic-gradient(from 0deg, #C9F24E, #9D8CFF, #5FE3D6, #FF8A73, #C9F24E) !important;
        box-shadow: 0 4px 14px rgba(157, 140, 255, 0.4) !important;
        animation: chattermate-orb-spin 6s linear infinite !important;
        z-index: 1 !important;
      }
      @keyframes chattermate-orb-spin { to { transform: rotate(360deg); } }
      ${side === 'left' ? `
      /* On the left edge the orb (which protrudes 34px past the bubble) would clip
         off-screen — mirror it to the bubble's page-facing side. */
      .initiation-orb {
        left: auto !important;
        right: -34px !important;
      }
      ` : ''}

      #${config.initiationMessageId}.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
        animation: chattermate-bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      @keyframes chattermate-bounce-in {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.8);
        }
        50% {
          transform: translateY(-5px) scale(1.02);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      #${config.initiationMessageId}:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.14);
      }

      #${config.initiationMessageId}::after {
        content: '' !important;
        position: absolute !important;
        bottom: -7px !important;
        ${side}: 30px !important;
        width: 14px !important;
        height: 14px !important;
        min-width: 14px !important;
        min-height: 14px !important;
        max-width: 14px !important;
        max-height: 14px !important;
        background: white !important;
        transform: rotate(45deg) !important;
        box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.06) !important;
        clip-path: polygon(0 0, 100% 0, 100% 100%) !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        z-index: -1 !important;
      }

      .initiation-message-text {
        font-size: 13px !important;
        line-height: 1.4 !important;
        color: #374151 !important;
        margin: 0 !important;
        padding: 0 4px 0 0 !important;
        position: relative !important;
        z-index: 1 !important;
        min-height: 18px !important;
        box-sizing: border-box !important;
        border: none !important;
        background: transparent !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        max-width: none !important;
        max-height: none !important;
        text-align: left !important;
        vertical-align: baseline !important;
        font-weight: normal !important;
        font-style: normal !important;
        text-decoration: none !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        word-spacing: normal !important;
        white-space: normal !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
      }

      .initiation-message-text::after {
        content: '|';
        animation: blink 1s step-end infinite;
        margin-left: 2px;
        color: ${config.chatBubbleColor};
        font-weight: 500;
      }

      .initiation-message-text.typing-complete::after {
        display: none;
      }

      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      .initiation-close {
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
        width: 20px !important;
        height: 20px !important;
        min-width: 20px !important;
        min-height: 20px !important;
        max-width: 20px !important;
        max-height: 20px !important;
        background: rgba(0, 0, 0, 0.04) !important;
        border: none !important;
        border-radius: 5px !important;
        cursor: pointer !important;
        opacity: 0.5 !important;
        transition: all 0.2s ease !important;
        z-index: 2 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        outline: none !important;
        box-shadow: none !important;
        text-decoration: none !important;
        font-size: 0 !important;
        line-height: 0 !important;
        overflow: hidden !important;
        flex-shrink: 0 !important;
      }

      .initiation-close:hover {
        opacity: 1 !important;
        background: rgba(0, 0, 0, 0.08) !important;
        transform: scale(1.05) !important;
      }

      .initiation-close::before,
      .initiation-close::after {
        content: '' !important;
        position: absolute !important;
        width: 9px !important;
        height: 1.5px !important;
        min-width: 9px !important;
        min-height: 1.5px !important;
        max-width: 9px !important;
        max-height: 1.5px !important;
        background: #4a5568 !important;
        border-radius: 1px !important;
        top: 50% !important;
        left: 50% !important;
        margin: -0.75px 0 0 -4.5px !important;
        padding: 0 !important;
        border: none !important;
        box-sizing: border-box !important;
      }

      .initiation-close::before {
        transform: rotate(45deg) !important;
      }

      .initiation-close::after {
        transform: rotate(-45deg) !important;
      }

      @media (max-width: 768px) {
        #${config.initiationMessageId} {
          display: none !important;
        }
      }

      /* Error UI Styles */
      .chattermate-error-ui {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 24px;
        overflow: hidden;
        position: relative;
      }

      .chattermate-error-ui::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 50%);
        pointer-events: none;
      }

      .chattermate-error-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 24px;
        text-align: center;
        position: relative;
        z-index: 1;
        max-width: 90%;
      }

      .chattermate-error-close {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 2;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 50%;
        background: rgba(120, 120, 140, 0.12);
        color: #4b5563;
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .chattermate-error-close:hover {
        background: rgba(120, 120, 140, 0.22);
      }

      .chattermate-error-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
        border-radius: 20px;
        margin-bottom: 20px;
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
      }

      .chattermate-error-icon {
        width: 36px;
        height: 36px;
        color: #6366f1;
      }

      .chattermate-error-title {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 12px 0;
        letter-spacing: -0.01em;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .chattermate-error-message {
        font-size: 14px;
        line-height: 1.6;
        color: #64748b;
        margin: 0 0 24px 0;
        max-width: 280px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .chattermate-error-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 12px;
        color: #94a3b8;
        opacity: 0.8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .chattermate-error-footer-link {
        color: inherit;
        text-decoration: none;
        cursor: pointer;
      }
      .chattermate-error-footer-link:hover {
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .chattermate-error-ui {
          border-radius: 0;
        }

        .chattermate-error-card {
          padding: 24px 20px;
        }

        .chattermate-error-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
        }

        .chattermate-error-icon {
          width: 32px;
          height: 32px;
        }

        .chattermate-error-title {
          font-size: 18px;
        }

        .chattermate-error-message {
          font-size: 13px;
          max-width: 260px;
        }
      }

      ${config.mobileMode === 'sheet' ? sheetCss(config.containerId) : ''}

      ${config.launcher ? '' : `
      /* Launcher hidden by config — the site opens the chat with its own trigger or
         the JS API. Last in the sheet so it also beats the mobile .mobile-closed
         re-show (display: flex !important at equal specificity). */
      #${config.buttonId}, #${config.buttonId}.mobile-closed { display: none !important; }
      `}
    `
    // Remove existing style if it exists
    const existingStyle = document.getElementById('chattermate-styles')
    if (existingStyle) {
      existingStyle.remove()
    }
    document.head.appendChild(style)

    // The search-bar placeholder is data, not markup — keep it in sync here since
    // every config change funnels through updateStyles().
    syncLauncherContent()
  }

  // Set text content on launcher children (textContent, never innerHTML — the
  // placeholder can come from dashboard settings).
  function syncLauncherContent() {
    const btn = document.getElementById(config.buttonId)
    if (!btn) return
    const placeholder = btn.querySelector('.cm-search-placeholder')
    if (placeholder && placeholder.textContent !== config.searchPlaceholder) {
      placeholder.textContent = config.searchPlaceholder
    }
  }

  // A token is only usable if it's a non-empty string. The stringified "undefined"
  // and "null" turn up routinely in site code that read an empty session.
  function normalizeToken(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    return trimmed;
  }

  // Get stored token - check window.chattermateToken first (set by developer),
  // then fall back to localStorage (persisted from previous sessions)
  function getStoredToken() {
    let stored = null
    try {
      stored = localStorage.getItem(config.tokenKey)
    } catch (e) {
      // A sandboxed page has no storage: carry on with what the page set, if anything
    }
    return normalizeToken(window.chattermateToken) || normalizeToken(stored);
  }

  // The customer a token names, or null. Read-only: the backend still verifies every
  // token; this only decides whether an identify() is a change of person (rebuild) or
  // the same person with a fresher token (swap in place). The loader is a standalone
  // script with no imports, so it carries its own copy of this rather than sharing
  // the widget app's useConversationToken.
  function tokenSubject(token) {
    const value = normalizeToken(token);
    if (!value) return null;
    const payload = value.split('.')[1];
    if (!payload) return null;
    try {
      const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return claims.sub || claims.customer_id || null;
    } catch (e) {
      return null;
    }
  }

  // Save token
  function saveToken(token) {
    if (!token) return
    try {
      localStorage.setItem(config.tokenKey, token);
    } catch (e) {
      /* no storage: the token lives in memory for this page view */
    }
  }

  // Remove token
  function removeToken() {
    try {
      localStorage.removeItem(config.tokenKey);
    } catch (e) {
      /* nothing stored to remove */
    }
  }

  // Check if device is mobile
  function isMobileDevice() {
    return window.innerWidth <= 768;
  }

  // Sanitize message to remove corrupted emoji characters
  function sanitizeMessage(message) {
    if (!message) return '';
    // Remove replacement characters and other common corruption patterns
    return message
      .replace(/\uFFFD/g, '') // Remove replacement character
      .replace(/[��]/g, '') // Remove common corruption symbols
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
  }

  // Get a random message from the array
  function getRandomInitiationMessage() {
    if (!config.chatInitiationMessages || config.chatInitiationMessages.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * config.chatInitiationMessages.length);
    const message = config.chatInitiationMessages[randomIndex];
    return message ? sanitizeMessage(message) : null;
  }

  // Check if initiation message should be shown (first visit in session)
  function shouldShowInitiation() {
    // Only show on desktop
    if (isMobileDevice()) return false;

    // The nudge bubble is anchored to the launcher; with the launcher hidden it
    // would float over nothing, so skip it entirely.
    if (!config.launcher) return false;
    
    // Check if we have messages to show
    if (!config.chatInitiationMessages || config.chatInitiationMessages.length === 0) {
      return false;
    }
    
    // Check session storage to see if already shown in this session
    return !sessionStorage.getItem(config.initiationShownKey);
  }

  // Mark initiation as shown
  function markInitiationShown() {
    sessionStorage.setItem(config.initiationShownKey, 'true');
  }

  // Create initiation message element
  function createInitiationMessage() {
    const message = getRandomInitiationMessage();
    if (!message) return null;

    const initiationDiv = document.createElement('div');
    initiationDiv.id = config.initiationMessageId;
    initiationDiv.innerHTML = `
      <span class="initiation-orb"></span>
      <button class="initiation-close" aria-label="Close"></button>
      <p class="initiation-message-text"></p>
    `;

    // Store the full message for typewriting effect
    initiationDiv.dataset.fullMessage = message;

    return initiationDiv;
  }

  // Typewriting effect for initiation message
  function typeWriteMessage(element, text, speed = 50) {
    const textElement = element.querySelector('.initiation-message-text');
    if (!textElement) return;

    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        textElement.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
        // Remove cursor after typing is complete
        textElement.classList.add('typing-complete');
        element.typeInterval = null;
      }
    }, speed);

    // Store interval ID to clear it if needed
    element.typeInterval = typeInterval;
  }

  // Show initiation message with animation
  function showInitiationMessage(initiationDiv, toggleChatFn) {
    if (!initiationDiv || !shouldShowInitiation()) return;

    document.body.appendChild(initiationDiv);

    // Show after a short delay for better UX
    setTimeout(() => {
      initiationDiv.classList.add('show');
      
      // Start typewriting effect after bubble appears
      setTimeout(() => {
        const fullMessage = initiationDiv.dataset.fullMessage;
        if (fullMessage) {
          typeWriteMessage(initiationDiv, fullMessage, 40);
        }
      }, 300);
    }, 1500);

    // Click on message opens chat
    initiationDiv.addEventListener('click', (e) => {
      if (!e.target.classList.contains('initiation-close')) {
        // Clear typewriting interval if still running
        if (initiationDiv.typeInterval) {
          clearInterval(initiationDiv.typeInterval);
        }
        hideInitiationMessage(initiationDiv);
        toggleChatFn();
        markInitiationShown();
      }
    });

    // Close button hides message
    const closeBtn = initiationDiv.querySelector('.initiation-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Clear typewriting interval if still running
        if (initiationDiv.typeInterval) {
          clearInterval(initiationDiv.typeInterval);
        }
        hideInitiationMessage(initiationDiv);
        markInitiationShown();
      });
    }
  }

  // Hide initiation message
  function hideInitiationMessage(initiationDiv) {
    if (!initiationDiv) return;
    
    initiationDiv.classList.remove('show');
    setTimeout(() => {
      if (initiationDiv.parentNode) {
        initiationDiv.parentNode.removeChild(initiationDiv);
      }
    }, 400);
  }

  // Initialize function to create and append elements
  function initialize() {
    isDestroyed = false
    updateStyles()

    // Create chat button with icon
    const button = document.createElement('div')
    button.id = config.buttonId
    button.classList.add('chattermate-pending')
    button.innerHTML = `
      <span class="cm-ring"></span>
      <span class="cm-ring r2"></span>
      <div class="cm-dots"><span class="cm-dot"></span><span class="cm-dot"></span><span class="cm-dot"></span></div>
      <span class="cm-chevron">&#8964;</span>
      <span class="cm-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.35-4.35"></path></svg>
        <span class="cm-search-placeholder"></span>
      </span>
      <span class="cm-badge"></span>
    `
    // Safety net: reveal anyway if nothing else does within a few seconds (e.g. an
    // unexpected error before the fetch's own error handling runs), so the launcher
    // is never left permanently invisible.
    revealTimeoutId = setTimeout(revealButton, 8000)

    // Create chat container
    const container = document.createElement('div')
    container.id = config.containerId

    // Create mobile minimize button
    const mobileCloseButton = document.createElement('div')
    mobileCloseButton.id = 'chattermate-mobile-close'
    mobileCloseButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12H19" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `

    // Create mobile topbar for ASK_ANYTHING style
    const mobileTopbar = document.createElement('div')
    mobileTopbar.id = 'chattermate-mobile-topbar'
    mobileTopbar.innerHTML = `
      <h3 class="topbar-title">Chat</h3>
      <div style="width: 44px;"></div>
    `

    // Dimmed backdrop behind the centered Ask AI palette. Always in the DOM but only
    // visible in that mode (see updateStyles); clicking it closes, as users expect.
    const backdrop = document.createElement('div')
    backdrop.id = config.backdropId

    // Add elements to document
    document.body.appendChild(button)
    document.body.appendChild(backdrop)
    document.body.appendChild(container)
    document.body.appendChild(mobileCloseButton)
    document.body.appendChild(mobileTopbar)
    updateBadge()
    // The button just entered the DOM — populate its text content (search placeholder).
    syncLauncherContent()

    let isOpen = false
    // While the frame starts: the listener for this page refusing it, and the host
    // of another refused frame (the frame host a redirect went to)
    let policyListener = null
    let refusedOrigin = null
    let iframe = null
    let initiationMessageElement = null

    // Push layout: an open drawer makes room in the page's own content (see pushLayout.js).
    function applyPush() {
      const mode = config.displayMode
      const drawer = mode === 'sidebar-left' || mode === 'sidebar-right'
      pushLayout.apply(isOpen && drawer && config.layout === 'push', {
        pushTarget: config.pushTarget,
        side: mode === 'sidebar-left' ? 'left' : 'right',
        width: config.sidebarWidth,
      })
    }

    function toggleChat() {
      isOpen = !isOpen
      container.classList.toggle('active')
      backdrop.classList.toggle('active', isOpen)
      button.classList.toggle('active')
      mobileCloseButton.classList.toggle('active')
      applyPush()
      if (isOpen) {
        config.hasOpened = true
        config.unreadCount = 0
        if (retryOnOpen) {
          teardownFrame()
          prefetchWidget()
        }
      }
      // Tell the iframe whether it's visible so it can track unread messages.
      postToFrame({ type: 'WIDGET_VISIBILITY', open: isOpen })
      if (isOpen) {
        reportPage()
        // A cross-origin frame can't take focus on its own; the click that opened
        // the chat lets the page hand it over, so the input (or Ask AI box) gets it.
        if (iframe && widgetMounted) iframe.focus()
      }
      updateBadge()

      // Hide initiation message when chat is opened
      if (isOpen && initiationMessageElement) {
        hideInitiationMessage(initiationMessageElement);
        initiationMessageElement = null;
        markInitiationShown();
      }

      // Handle mobile button visibility
      if (isMobileDevice()) {
        if (isOpen) {
          // When opening on mobile, hide the button
          button.classList.remove('mobile-closed')
          // Stop bouncing when open
          button.style.animation = ''
        } else {
          // When closing on mobile, show the button
          button.classList.add('mobile-closed')
          // Add subtle idle bounce when closed
          button.style.animation = 'chattermate-float 4s ease-in-out infinite'
          // Hide topbar when closing
          mobileTopbar.classList.remove('active')
          document.body.classList.remove('ask-anything-mobile')
        }
      } else {
        // On desktop, ensure mobile close button is hidden when widget is open
        if (isOpen) {
          mobileCloseButton.classList.remove('active')
        }
      }

      if (isOpen) postToFrame({ type: 'SCROLL_TO_BOTTOM' })

      emitEvent(isOpen ? 'open' : 'close')
    }

    // Prefill (don't send) the chat input, e.g. ChatterMate.open({ message: '...' }).
    // Queued until the iframe has loaded so an early open({message}) isn't lost.
    let pendingPrefill = null
    function prefillMessage(text) {
      const clean = String(text || '').slice(0, 2000)
      if (!clean) return
      if (widgetMounted) {
        if (iframe) iframe.focus()
        postToFrame({ type: 'PREFILL_MESSAGE', text: clean })
      } else {
        pendingPrefill = clean
      }
    }

    // The frame takes the visitor's identity once, in its handshake (HOST_INIT), so a
    // different visitor means throwing this frame away and starting a new one.
    // Everything tied to the old frame is reset here.
    let loadGeneration = 0
    function teardownFrame() {
      // Invalidates the callbacks of a load still in flight — see prefetchWidget.
      loadGeneration++
      // Clears the iframe and, after a failed load, the error card.
      while (container.firstChild) container.removeChild(container.firstChild)
      iframe = null
      widgetFrame = null
      currentSessionId = null
      widgetReadyFired = false
      pendingPrefill = null
      pendingIdentity = null
      widgetMounted = false
      frameOrigin = null
      retryOnOpen = false
      frameRefusedByPolicy = false
      refusedOrigin = null
      stopWatchingForPolicyRefusal()
      clearFrameTimer()
      // A rebuild already under way supersedes the one a pending END_CHAT would do
      cancelEndChat()
      button.classList.remove('loading')
      paletteContentHeight = 0
      applyPaletteHeight()
    }

    // Rebuild the widget for whatever token is current — the mechanism behind
    // ChatterMate.identify() / logout() / reload().
    function reloadWidget() {
      // The conversation goes away with the frame; leaving the panel open would
      // just show the visitor an empty box while the replacement loads.
      if (isOpen) toggleChat()
      teardownFrame()
      config.unreadCount = 0
      config.hasOpened = false
      updateBadge()
      prefetchWidget()
    }

    // Remove the widget from the page entirely: frame, launcher, styles, listeners
    // and timers. Nothing of ours is left behind for a site that is unmounting the
    // page region it lives in, or hiding chat for a whole class of visitor.
    // ChatterMate.reload() builds it again from scratch.
    function destroyWidget() {
      if (isOpen) toggleChat()
      teardownFrame()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('message', handleFrameMessage)
      window.removeEventListener('popstate', reportPage)
      window.removeEventListener('hashchange', reportPage)
      unwatchHistory()
      // The nudge is appended to <body>, not to our container, and it runs a
      // typewriter interval that would keep ticking on a detached node.
      if (initiationMessageElement) {
        if (initiationMessageElement.typeInterval) clearInterval(initiationMessageElement.typeInterval)
        removeNode(initiationMessageElement)
        initiationMessageElement = null
      }
      ;[button, backdrop, container, mobileCloseButton, mobileTopbar].forEach(removeNode)
      removeNode(document.getElementById('chattermate-styles'))
      document.body.classList.remove('ask-anything-mobile')
      // A rebuilt launcher starts hidden again (.chattermate-pending) and needs its
      // own reveal, so drop the reveal state and the pending safety-net timer with it.
      buttonRevealed = false
      if (revealTimeoutId) {
        clearTimeout(revealTimeoutId)
        revealTimeoutId = null
      }
      onRevealCallbacks.length = 0
      config.unreadCount = 0
      config.hasOpened = false
      controller = null
      pendingCalls.length = 0
      triggerClickQueued = false
      isDestroyed = true
      identityEpoch++
    }

    // Create error UI for authentication failures using safe DOM methods
    function createErrorUI(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'chattermate-error-ui';

      const card = document.createElement('div');
      card.className = 'chattermate-error-card';

      // Close button (top-right). Without this there's no way to dismiss the error on
      // mobile, where the launcher is hidden while the widget is open.
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'chattermate-error-close';
      closeBtn.setAttribute('aria-label', 'Close chat');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', function () {
        if (isOpen) toggleChat();
      });
      // Anchored to the full-panel wrapper so it sits at the top-right of the screen
      // when the error is shown full-screen on mobile.
      errorDiv.appendChild(closeBtn);

      // Icon wrapper
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'chattermate-error-icon-wrapper';
      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSvg.setAttribute('class', 'chattermate-error-icon');
      iconSvg.setAttribute('viewBox', '0 0 24 24');
      iconSvg.setAttribute('fill', 'none');
      iconSvg.setAttribute('stroke', 'currentColor');
      iconSvg.setAttribute('stroke-width', '1.5');
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', 'M9 12l2 2 4-4');
      iconSvg.appendChild(path1);
      iconSvg.appendChild(path2);
      iconWrapper.appendChild(iconSvg);

      // Title
      const title = document.createElement('h2');
      title.className = 'chattermate-error-title';
      title.textContent = 'Chat Unavailable';

      // Message
      const messageEl = document.createElement('p');
      messageEl.className = 'chattermate-error-message';
      messageEl.textContent = message;

      // Footer
      const footer = document.createElement('div');
      footer.className = 'chattermate-error-footer';
      const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      logoSvg.setAttribute('width', '14');
      logoSvg.setAttribute('height', '14');
      logoSvg.setAttribute('viewBox', '0 0 60 60');
      logoSvg.setAttribute('fill', 'none');
      const logoPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      logoPath.setAttribute('d', 'M18 12 H42 A6 6 0 0 1 48 18 V42 A6 6 0 0 1 42 48 H18 A6 6 0 0 1 12 42 V18 A6 6 0 0 1 18 12 Z M17 30 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z M26 30 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z M35 30 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z');
      logoPath.setAttribute('fill-rule', 'evenodd');
      logoPath.setAttribute('fill', 'currentColor');
      logoPath.setAttribute('opacity', '0.6');
      logoSvg.appendChild(logoPath);
      const footerText = document.createElement('a');
      footerText.href = 'https://chattermate.chat';
      footerText.target = '_blank';
      footerText.rel = 'noopener noreferrer';
      footerText.className = 'chattermate-error-footer-link';
      footerText.textContent = 'Powered by ChatterMate';
      footer.appendChild(logoSvg);
      footer.appendChild(footerText);

      // Assemble card
      card.appendChild(iconWrapper);
      card.appendChild(title);
      card.appendChild(messageEl);
      card.appendChild(footer);
      errorDiv.appendChild(card);

      return errorDiv;
    }

    // A frame refused by frame-ancestors (the widget's allowed domains) still fires
    // `load`, it just never says hello. Give a loaded frame this long to do so.
    const FRAME_HELLO_MS = 3000
    // And a frame that never even loads (network, outage) this long - or that said
    // hello but never got as far as mounting (a stalled bootstrap).
    const FRAME_LOAD_MS = 20000
    let frameTimer = null
    function clearFrameTimer() {
      if (frameTimer) {
        clearTimeout(frameTimer)
        frameTimer = null
      }
    }

    // The hosts a page's frame-src must allow: the frame's own, and the frame host it
    // may be redirected to (only the page's policy report names that one).
    function frameSources() {
      const sources = []
      try { sources.push(new URL(frameUrl()).origin) } catch (e) { /* no frame address */ }
      if (refusedOrigin && sources.indexOf(refusedOrigin) === -1) sources.push(refusedOrigin)
      return sources
    }

    // The page's Content-Security-Policy refusing a frame while ours starts. Ours by
    // address: straight to the in-page fallback. Any other frame refusal (a redirect
    // to the frame host reports just that host) only counts if ours then never says
    // hello (frameDidNotStart), so a blocked ad never moves a working chat.
    function watchForPolicyRefusal(src, generation) {
      stopWatchingForPolicyRefusal()
      policyListener = function (e) {
        // Only the browser's own report: page script can't fake one to move the chat
        if (!e.isTrusted || generation !== loadGeneration || frameOrigin) return
        const directive = e.effectiveDirective || e.violatedDirective || ''
        if (!/^(frame-src|child-src|default-src)/.test(directive)) return
        let blocked = null
        try { blocked = new URL(e.blockedURI) } catch (err) { return /* 'inline' and the like */ }
        if (blocked.origin === new URL(src).origin) {
          frameRefusedByPolicy = true
          // No in-page chat here either: ours won't start, so say so now
          if (!fallBackInPage(frameSources())) frameDidNotStart()
        } else if (blocked.pathname === '/' && !blocked.search) {
          // Just an origin: how a refused redirect to the frame host is reported
          frameRefusedByPolicy = true
          refusedOrigin = refusedOrigin || blocked.origin
        }
      }
      document.addEventListener('securitypolicyviolation', policyListener)
    }

    function stopWatchingForPolicyRefusal() {
      if (policyListener) document.removeEventListener('securitypolicyviolation', policyListener)
      policyListener = null
    }

    // The frame's address, under the API base the page configured. Only a web
    // address becomes a frame: a javascript: or data: one would run in the page.
    function frameUrl() {
      let url
      try {
        url = new URL(config.baseUrl + '/widgets/' + encodeURIComponent(window.chattermateId) + '/frame', window.location.href)
      } catch (e) {
        return null
      }
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
      url.searchParams.set('host', '1')
      return url.href
    }

    function showLoadError(message) {
      teardownFrame()
      container.appendChild(createErrorUI(message))
      // Reveal (with the default color) so this error is reachable — it'll never get
      // a real color since the widget never loaded.
      revealButton()
    }

    function showUnavailable() {
      showLoadError('Chat is unavailable right now. Please try again later.')
      retryOnOpen = true
    }

    function frameDidNotStart() {
      if (frameRefusedByPolicy && fallBackInPage(frameSources())) return
      const host = window.location.hostname || 'this site'
      if (frameRefusedByPolicy) {
        showLoadError('Chat couldn’t load on “' + host + '”: this page’s Content-Security-Policy blocks it. The site owner can allow it in the policy’s frame-src.')
        return
      }
      showLoadError('Chat couldn’t load on “' + host + '”. If the widget is limited to certain domains, add this one in its settings; otherwise check the widget ID.')
    }

    // The widget runs on our own origin, in a frame that asks for the visitor's token
    // once it is up (FRAME_READY → HOST_INIT). Created straight away, still hidden, so
    // the chat opens instantly.
    function prefetchWidget() {
      if (iframe) return
      const src = frameUrl()
      if (!src) {
        showLoadError(NOT_CONFIGURED)
        return
      }
      button.classList.add('loading')
      const generation = loadGeneration

      iframe = document.createElement('iframe')
      iframe.className = 'chattermate-iframe'
      // Screen readers announce a frame by its title.
      iframe.title = 'Chat'
      // A srcdoc frame inherited this from the page; a real frame must be granted it.
      // '*': the frame may be redirected to the frame host, a different origin from
      // the URL set here, and a bare feature name only grants that first origin.
      iframe.setAttribute('allow', 'clipboard-write *')
      watchForPolicyRefusal(src, generation)
      iframe.src = src
      iframe.addEventListener('load', function () {
        if (generation !== loadGeneration || frameOrigin) return
        clearFrameTimer()
        frameTimer = setTimeout(frameDidNotStart, FRAME_HELLO_MS)
      })
      container.appendChild(iframe)
      // From now on its window is the only one that may talk to the loader.
      widgetFrame = iframe
      frameTimer = setTimeout(frameDidNotStart, FRAME_LOAD_MS)
    }

    // The widget is mounted and listening: give it what it needs to render.
    function onWidgetReady() {
      clearFrameTimer()
      if (pendingIdentity) {
        // The page identified the visitor after the frame was handed the old token.
        // Mid-start the widget can't take a new one safely: start it again with it.
        reloadWidget()
        return
      }
      widgetMounted = true
      button.classList.remove('loading')
      // Developer display overrides, known now. Dashboard defaults merge later; the
      // CUSTOMIZATION_UPDATE reply re-sends the final values.
      postToFrame(widgetDisplayPayload())
      // The widget is prefetched while still hidden — say so, or surfaces that focus
      // themselves on open (the Ask AI palette) would grab focus now.
      postToFrame({ type: 'WIDGET_VISIBILITY', open: isOpen })
      if (pendingPrefill) {
        postToFrame({ type: 'PREFILL_MESSAGE', text: pendingPrefill })
        pendingPrefill = null
      }
      widgetReadyFired = true
      // A frame that actually loaded clears the recovery budget.
      identityRecoveryUsed = false
      emitEvent('ready')
    }

    // The frame could not start for this visitor.
    function onWidgetError(code) {
      clearFrameTimer()
      if (pendingIdentity && (code === 'identity_expired' || code === 'token_required')) {
        // It was refused the token it had when it said hello, and the page has
        // identified the visitor since: start again with that, nothing to recover.
        reloadWidget()
        return
      }
      if (code === 'identity_expired') {
        // The stored token belongs to a visitor whose identity has run out — a page
        // reopened long after the app identified them. Ask the page for a fresh one
        // and load again as that visitor, rather than starting over as a stranger.
        teardownFrame()
        const epoch = identityEpoch
        emitEvent('identityExpired')
        // The page answered by identifying someone (or tearing the widget down)
        // itself: that already rebuilt the frame, so recovering would undo it.
        if (epoch !== identityEpoch || isDestroyed) return
        recoverIdentityAndLoad()
        return
      }
      if (code === 'token_required') {
        removeToken()
        showLoadError(NOT_CONFIGURED)
        return
      }
      showUnavailable()
    }

    // Leads record the page they came from; tell the frame when a single-page app moves on.
    function reportPage() {
      if (widgetMounted) postToFrame({ type: 'HOST_PAGE', url: window.location.href })
    }

    // SPA routers move on with history.pushState/replaceState, which fire no
    // event, so journeys keyed to a page would never see the visitor arrive.
    // Wrap both while the widget is up; unwrap only what is still ours, in case
    // the site wrapped them again after us.
    const historyWrappers = {}
    function watchHistory() {
      ;['pushState', 'replaceState'].forEach(function (name) {
        const original = window.history[name]
        if (typeof original !== 'function' || historyWrappers[name]) return
        const wrapped = function () {
          const result = original.apply(this, arguments)
          reportPage()
          return result
        }
        historyWrappers[name] = { original: original, wrapped: wrapped }
        window.history[name] = wrapped
      })
    }
    function unwatchHistory() {
      Object.keys(historyWrappers).forEach(function (name) {
        if (window.history[name] === historyWrappers[name].wrapped) window.history[name] = historyWrappers[name].original
        delete historyWrappers[name]
      })
    }

    // Token + unread-count updates from the widget frame. Registered once for the
    // page: the frame is replaced on every identity change (see reloadWidget), and
    // registering per load would stack a duplicate handler each time.
    function handleFrameMessage(event) {
      if (!event.data || typeof event.data.type !== 'string') return
      if (!isFromWidgetFrame(event)) return
      if (event.data.type === 'FRAME_READY') {
        // The frame is up (again, if it reloaded itself): hand it the visitor. Its
        // origin, now known, addresses everything sent to it from here on.
        if (event.origin === 'null') return
        frameOrigin = event.origin
        stopWatchingForPolicyRefusal() // it started: nothing to fall back from
        // A frame that reloaded itself starts over: not listening until it mounts again
        widgetMounted = false
        button.classList.add('loading')
        clearFrameTimer()
        frameTimer = setTimeout(showUnavailable, FRAME_LOAD_MS)
        postToFrame({ type: 'HOST_INIT', token: getStoredToken(), pageUrl: window.location.href })
        pendingIdentity = null // HOST_INIT carried the newest token
        return
      }
      if (event.data.type === 'WIDGET_READY') {
        onWidgetReady()
        hostActions.announce()
        return
      }
      if (hostActions.handleFrameMessage(event.data)) return
      if (event.data.type === 'WIDGET_OPEN_REQUEST') {
        // A journey step that opens the chat by itself (once per step).
        if (!isOpen) toggleChat()
        return
      }
      if (event.data.type === 'WIDGET_ERROR') {
        onWidgetError(String(event.data.code || ''))
        return
      }
      // The outgoing visitor's frame, closing up before a switch: nothing it says
      // about tokens or sessions may land on the visitor replacing it.
      const closingUp = !!endChatDone
      if (event.data.type === 'TOKEN_CLEAR') {
        // The widget dropped the visitor's identity (e.g. it was refused): forget it here too.
        if (closingUp) return
        removeToken()
        window.chattermateToken = null
        return
      }
      if (event.data.type === 'WIDGET_ESCAPE') {
        // Escape pressed inside the frame, which the page's own key handlers can't
        // see. A drawer closes on it, as it would with focus on the page.
        const drawer = config.displayMode === 'sidebar-left' || config.displayMode === 'sidebar-right'
        if (drawer && isOpen) toggleChat()
        return
      }
      if (event.data.type === 'END_CHAT_DONE') {
        if (endChatDone) endChatDone()
        return
      }
      if (event.data.type === 'UNREAD_COUNT') {
        config.unreadCount = Math.max(0, parseInt(event.data.count, 10) || 0)
        updateBadge()
        // With a hidden launcher there's no badge — the site listens for this
        // event to decorate its own trigger.
        emitEvent('unread', config.unreadCount)
        return
      }
      if (event.data.type === 'TOKEN_UPDATE') {
        if (closingUp) return
        const updated = normalizeToken(event.data.token)
        if (!updated) return
        saveToken(updated)
        return
      }
      if (event.data.type === 'CHAT_SESSION') {
        if (closingUp) return
        currentSessionId = String(event.data.sessionId || '') || null
        // Only a conversation the server actually created is news: reconnecting into
        // the one already in progress is not a new chat. `authenticated` says whether
        // it still belongs to the identified visitor, so a site can re-identify
        // instead of guessing.
        if (event.data.created) {
          emitEvent('chatCreated', {
            sessionId: currentSessionId,
            authenticated: !!event.data.authenticated,
          })
        }
        return
      }
      if (event.data.type === 'IDENTITY_EXPIRED') {
        if (closingUp) return
        // The widget cannot mint a token: that needs the site's API key. Ask the page
        // for one, and tell it either way so it can react on its own terms.
        emitEvent('identityExpired')
        requestTokenFromHost()
      }
      return
    }

    // The frame could not even be fetched with the stored token. Replace the identity
    // if the page can, and otherwise fall back to an anonymous visitor - a chat widget
    // that refuses to load at all is worse than one that has forgotten who you are.
    function recoverIdentityAndLoad() {
      if (identityRecoveryUsed || typeof config.tokenProvider !== 'function') {
        // Nobody can replace the identity, so load as an anonymous visitor rather
        // than leaving the page with a chat widget that refuses to open at all.
        removeToken()
        window.chattermateToken = null
        prefetchWidget()
        return
      }
      identityRecoveryUsed = true
      const epoch = identityEpoch
      const generation = loadGeneration
      // Overtaken: the page identified someone, logged out, reloaded or removed
      // the widget while the provider was answering
      const stale = () => epoch !== identityEpoch || generation !== loadGeneration || isDestroyed
      Promise.resolve()
        .then(() => config.tokenProvider())
        .then((token) => {
          if (stale()) return
          const next = normalizeToken(token)
          if (next) {
            window.chattermateToken = next
            saveToken(next)
          } else {
            removeToken()
            window.chattermateToken = null
          }
        })
        .catch((error) => {
          console.error('ChatterMate: tokenProvider failed', error)
          if (stale()) return
          removeToken()
          window.chattermateToken = null
        })
        .finally(() => {
          if (!stale()) prefetchWidget()
        })
    }

    // Ask the host page for a replacement token and hand it to the LIVE frame.
    // Deliberately not a reload: the visitor is looking at a conversation, and
    // rebuilding the frame would take it away to fix a problem they never saw.
    let tokenRequestInFlight = false
    // A tokenProvider that keeps handing back a token the backend rejects would
    // otherwise fetch in a loop. One recovery per successful load is enough.
    let identityRecoveryUsed = false
    function requestTokenFromHost() {
      if (tokenRequestInFlight) return
      if (identityRecoveryUsed || typeof config.tokenProvider !== 'function') {
        // Nothing is coming: let the frame stop waiting and carry on anonymously,
        // rather than leaving the visitor at a chat that can't authenticate.
        postToFrame({ type: 'IDENTITY_UNAVAILABLE' })
        return
      }
      tokenRequestInFlight = true
      identityRecoveryUsed = true
      const epoch = identityEpoch
      const askedBy = widgetFrame
      Promise.resolve()
        .then(() => config.tokenProvider())
        .then((token) => {
          // Overtaken by an identify()/logout(), or the frame that asked is gone
          if (epoch !== identityEpoch || askedBy !== widgetFrame) return
          const next = normalizeToken(token)
          if (!next) {
            postToFrame({ type: 'IDENTITY_UNAVAILABLE' })
            return
          }
          window.chattermateToken = next
          saveToken(next)
          postToFrame({ type: 'TOKEN_REFRESH', token: next })
        })
        .catch((error) => {
          console.error('ChatterMate: tokenProvider failed', error)
          postToFrame({ type: 'IDENTITY_UNAVAILABLE' })
        })
        .finally(() => {
          tokenRequestInFlight = false
        })
    }

    window.addEventListener('message', handleFrameMessage)
    window.addEventListener('popstate', reportPage)
    window.addEventListener('hashchange', reportPage)
    watchHistory()

    // Start prefetching immediately
    prefetchWidget()

    // Show initiation message shortly after the launcher becomes visible — scheduling
    // this from page-load time (rather than from reveal) could show a nudge bubble
    // pointing at a launcher that isn't on screen yet.
    onRevealCallbacks.push(() => {
      setTimeout(() => {
        if (isDestroyed) return
        if (!isOpen && config.chatInitiationMessages.length > 0) {
          initiationMessageElement = createInitiationMessage();
          showInitiationMessage(initiationMessageElement, toggleChat);
        }
      }, 2000)
    })

    // Don't auto-open on mobile devices - let user initiate
    // Mobile users will see the chat button and can tap to open

    // Add click event listeners
    button.addEventListener('click', toggleChat)
    mobileCloseButton.addEventListener('click', toggleChat)
    // Clicking the dimmed page closes the Ask AI palette.
    backdrop.addEventListener('click', function () {
      if (isOpen) toggleChat()
    })

    // Initialize mobile button visibility
    if (isMobileDevice() && !isOpen) {
      button.classList.add('mobile-closed')
      // Idle bounce animation when initially closed
      button.style.animation = 'chattermate-float 4s ease-in-out infinite'
    }

    // Handle window resize to update mobile behavior
    function handleResize() {
      const isMobile = isMobileDevice()
      applyPush() // crossing the phone width starts or stops pushing
      
      if (isMobile && !isOpen) {
        // On mobile when closed, show the button
        button.classList.add('mobile-closed')
        button.style.animation = 'chattermate-float 4s ease-in-out infinite'
        // Ensure mobile close button is hidden when widget is closed
        mobileCloseButton.classList.remove('active')
      } else if (!isMobile) {
        // On desktop, remove mobile-specific classes
        button.classList.remove('mobile-closed')
        button.style.animation = ''
        // Ensure mobile close button is hidden on desktop
        if (isOpen) {
          mobileCloseButton.classList.remove('active')
        }
      }
      
      // Update styles to handle viewport changes
      updateStyles()
      // The palette's ceiling is 76vh, which just moved.
      applyPaletteHeight()
    }
    window.addEventListener('resize', handleResize)

    // Expose the open/close mechanics to the public API, then run anything the
    // site called before the DOM was ready.
    controller = {
      isOpen: function () { return isOpen },
      toggle: toggleChat,
      open: function (opts) {
        if (!isOpen) toggleChat()
        if (opts && opts.message) prefillMessage(opts.message)
      },
      close: function () {
        if (isOpen) toggleChat()
      },
      reload: reloadWidget,
      destroy: destroyWidget,
    }
    pendingCalls.splice(0).forEach(function (fn) {
      try { fn() } catch (e) { /* keep the widget alive if a queued call throws */ }
    })
  }

  // Declarative options: the install snippet may set window.chattermateConfig with the
  // same shape as ChatterMate.init(options). Applied before the widget is built.
  applyOptions(window.chattermateConfig)

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!isDestroyed) initialize()
    })
  } else {
    initialize()
  }

  // Keyboard: ⌘K / Ctrl+K opens the Ask AI palette, Esc closes it — the shortcuts this
  // pattern trains people to expect. Only bound for the Ask AI styles, so we never
  // hijack ⌘K on a site running the ordinary chat bubble.
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '')
  document.addEventListener('keydown', function (e) {
    if (!controller || !isAskAiModal()) return
    // Accept only the platform's palette chord: Ctrl+K on macOS is the shell's
    // kill-to-end-of-line inside text fields, and stealing it breaks typing.
    const chord = isMac ? (e.metaKey && !e.ctrlKey) : (e.ctrlKey && !e.metaKey)
    if (config.hotkey && chord && !e.altKey && !e.repeat && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      controller.toggle()
      return
    }
    if (e.key === 'Escape' && controller.isOpen()) {
      controller.close()
    }
  })

  // No-code custom launcher: any element matching the developer's `trigger` selector or
  // carrying data-chattermate-open toggles the chat. Delegated, so elements added after
  // page load work too.
  document.addEventListener('click', function (e) {
    const el = e.target
    if (!el || !el.closest) return
    let match = el.closest('[data-chattermate-open]')
    if (!match && config.trigger) {
      try {
        match = el.closest(config.trigger)
      } catch (err) { /* invalid selector supplied by the site — ignore */ }
    }
    if (!match) return
    // Stop in-page anchors used as triggers (<a href="#">) from scrolling the page.
    if (match.tagName === 'A') e.preventDefault()
    if (controller) {
      controller.toggle()
    } else if (!isDestroyed && !triggerClickQueued) {
      // Clicks landing before the widget is built coalesce into one "open" — replaying
      // N raw toggles would flap the window open/closed on init.
      triggerClickQueued = true
      pendingCalls.push(function () { controller.open() })
    }
  })

  // Add message listener for customization updates
  window.addEventListener('message', function (event) {
    if (!event.data || typeof event.data.type !== 'string') return
    // Only the widget iframe may drive the loader (hide/restyle/close).
    if (!isFromWidgetFrame(event)) return
    // The Ask AI palette reports how tall its content is, so the box hugs a short
    // answer instead of standing at full height with dead space underneath. Only the
    // palette does this; every other mode keeps its configured geometry.
    if (event.data.type === 'WIDGET_RESIZE') {
      if (typeof event.data.height !== 'number' || !isFinite(event.data.height)) return
      paletteContentHeight = Math.round(event.data.height)
      applyPaletteHeight()
      return
    }
    // The widget switched surface (palette ⇄ chat panel). Re-render the geometry for
    // the new one and drop any hugged height the palette had asked for.
    if (event.data.type === 'WIDGET_SURFACE') {
      const palette = !!event.data.palette
      if (config.surfaceIsPalette === palette) return
      config.surfaceIsPalette = palette
      if (!palette) paletteContentHeight = 0
      updateStyles()
      applyPaletteHeight()
      return
    }
    // Header chevron inside the widget asks to minimize.
    if (event.data.type === 'WIDGET_MINIMIZE') {
      withController(function () { controller.close() })
      return
    }
    if (event.data.type === 'CUSTOMIZATION_UPDATE') {
      const customData = event.data.data;
      const newColor = customData.chat_bubble_color;
      config.chatBubbleColor = isValidHexColor(newColor) ? newColor : config.chatBubbleColor;
      if (typeof customData.chat_style === 'string') {
        config.chatStyle = customData.chat_style;
      }

      // Store chat initiation messages
      if (customData.chat_initiation_messages && Array.isArray(customData.chat_initiation_messages)) {
        config.chatInitiationMessages = customData.chat_initiation_messages;
      }

      // Dashboard "Widget placement" defaults. Applied before revealButton() below,
      // so the launcher first appears already in its final mode/position — no jump.
      applyDashboardDisplay(customData.widget_display)

      // ASK_ANYTHING sits a little lower than the other styles (desktop only).
      // A per-style default, not an override: geometry the developer set via
      // init()/chattermateConfig (devOverrides) always wins.
      if (!isMobileDevice()) {
        if (!devOverrides.containerBottom) {
          config.containerBottom = customData.chat_style === 'ASK_ANYTHING' ? 90 : 100;
        }
      } else {
        // Handle mobile ASK_ANYTHING style. This handler is outside initialize(), so
        // reach the open-state and topbar through the controller/DOM, not closures.
        const chatOpen = controller ? controller.isOpen() : false
        const topbar = document.getElementById('chattermate-mobile-topbar')
        if (customData.chat_style === 'ASK_ANYTHING' && chatOpen) {
          document.body.classList.add('ask-anything-mobile')
          if (topbar) topbar.classList.add('active')
        } else {
          document.body.classList.remove('ask-anything-mobile')
          if (topbar) topbar.classList.remove('active')
        }
      }
      // Mobile positioning is handled by CSS media queries and should not be affected
      
      updateStyles()
      // Re-inject styles recolors the launcher; refresh the nudge badge count.
      updateBadge()
      // The real color is applied above, so it's now safe to show the launcher.
      revealButton()

      // Tell the widget the final display geometry (developer overrides merged with
      // dashboard defaults) so its interior sizing can adapt. Replied to the sending
      // frame — this handler sits outside initialize() and has no iframe reference.
      postToFrame(widgetDisplayPayload())
    }
  })

  function isNumber(value) {
    return typeof value === 'number' && isFinite(value)
  }

  function removeNode(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node)
  }

  // Re-inject styles so an already-rendered widget updates immediately; before the
  // first render this is a no-op (initialize() injects them).
  function refreshStylesIfRendered() {
    if (document.getElementById('chattermate-styles')) {
      updateStyles()
    }
  }

  // Move the launcher (and, with it, the chat window) to a custom position.
  // Accepts { side, bottom, offset } — side 'left'|'right', distances in pixels from
  // the bottom and the chosen side edge. Legacy { bottom, right } still works
  // (right === offset). Use this to lift the widget above a fixed bottom nav bar.
  // No effect on mobile, where the window is full-screen.
  function applyPosition(position, deferRefresh) {
    if (!position || typeof position !== 'object') return
    if (position.side === 'left' || position.side === 'right') {
      setDevConfig('side', position.side)
    }
    if (isNumber(position.bottom)) {
      setDevConfig('launcherBottom', Math.max(0, position.bottom))
    }
    const offset = isNumber(position.offset) ? position.offset : position.right
    if (isNumber(offset)) {
      setDevConfig('launcherRight', Math.max(0, offset))
    }
    // applyOptions refreshes once for the whole batch; skip the extra rebuild here.
    if (!deferRefresh) refreshStylesIfRendered()
  }

  // Apply developer options — shared by ChatterMate.init(options) and the declarative
  // window.chattermateConfig. Every recognized key counts as a developer override, so
  // dashboard defaults arriving later never fight it. Loose sanity clamps only; the
  // page owner is configuring their own page.
  function applyOptions(options) {
    if (!options || typeof options !== 'object') return
    Object.assign(givenOptions, options)
    if (options.baseUrl) {
      config.baseUrl = options.baseUrl
    }
    if (options.id) {
      window.chattermateId = options.id
    }
    if (typeof options.tokenProvider === 'function') {
      // Called when the widget needs a token the page alone can mint: on an expired
      // identity, or when there is none yet. Must resolve to a /generate-token token.
      config.tokenProvider = options.tokenProvider
    }
    if (typeof options.launcher === 'boolean') {
      setDevConfig('launcher', options.launcher)
    }
    if (DISPLAY_MODES.indexOf(options.displayMode) !== -1) {
      setDevConfig('displayMode', options.displayMode)
    }
    if (isNumber(options.width)) {
      setDevConfig('containerWidth', Math.max(280, options.width))
      sizeIsExplicit.width = true
    }
    if (isNumber(options.height)) {
      setDevConfig('containerHeight', Math.max(400, options.height))
      sizeIsExplicit.height = true
    }
    if (typeof options.hotkey === 'boolean') {
      setDevConfig('hotkey', options.hotkey)
    }
    if (isNumber(options.sidebarWidth)) {
      setDevConfig('sidebarWidth', Math.max(280, options.sidebarWidth))
    }
    if (options.layout === 'push' || options.layout === 'overlay') {
      setDevConfig('layout', options.layout)
    }
    if (typeof options.pushTarget === 'string' && options.pushTarget) {
      setDevConfig('pushTarget', options.pushTarget)
    }
    if (options.mobileMode === 'sheet' || options.mobileMode === 'fullscreen') {
      setDevConfig('mobileMode', options.mobileMode)
    }
    if (isNumber(options.zIndex)) {
      setDevConfig('zIndex', Math.max(1, Math.floor(options.zIndex)))
    }
    if (typeof options.trigger === 'string' && options.trigger) {
      setDevConfig('trigger', options.trigger)
    }
    if (options.searchBar && typeof options.searchBar === 'object') {
      if (typeof options.searchBar.placeholder === 'string' && options.searchBar.placeholder) {
        setDevConfig('searchPlaceholder', options.searchBar.placeholder.slice(0, 80))
      }
      if (isNumber(options.searchBar.width)) {
        setDevConfig('searchBarWidth', Math.max(160, options.searchBar.width))
      }
    }
    if (options.position) {
      applyPosition(options.position, true)
    }
    refreshStylesIfRendered()
  }

  // Identity control for single-page apps. The widget's identity is fixed when its
  // frame loads, so a login or logout that never reloads the page has to reload the
  // frame — otherwise the visitor keeps the identity they had when the script ran.
  // Before the widget is built there's nothing to reload: initialize() will fetch
  // with whatever token is current by then. A destroyed widget stays destroyed —
  // only reload() brings it back.
  function reloadWidgetIfRunning() {
    if (controller) controller.reload()
  }

  // Close the conversation the widget is leaving behind, then rebuild the frame.
  // Dropping the frame alone only takes the conversation off THIS page: the session
  // stays open on the server, so identifying that visitor again would hand them back
  // a transcript logout() told them was gone. The frame closes it - it holds the
  // outgoing visitor's token - with a keepalive request, and says when it's done.
  // Bounded, so a frame that never answers can't hold up the switch.
  const END_CHAT_WAIT_MS = 1000
  function endConversationThenReload(sessionId) {
    currentSessionId = null
    // A switch already waiting on the frame will rebuild with the newest token.
    if (endChatDone) return
    // Only a mounted widget listens for END_CHAT
    if (!sessionId || !widgetFrame || !widgetMounted) {
      reloadWidgetIfRunning()
      return
    }
    endChatDone = function () {
      cancelEndChat()
      reloadWidgetIfRunning()
    }
    endChatTimer = setTimeout(endChatDone, END_CHAT_WAIT_MS)
    postToFrame({ type: 'END_CHAT', sessionId: sessionId })
  }

  // ChatterMate.reload(): rebuild the widget, and build it again after destroy().
  function reloadOrRebuild() {
    if (fellBackInPage && !inPageUnavailable) return
    if (controller) {
      controller.reload()
      return
    }
    if (!isDestroyed) return
    isDestroyed = false
    // With the loader in <head> there may be no <body> to build into yet; clearing
    // the flag is enough, because the pending DOMContentLoaded boot then runs.
    if (document.readyState !== 'loading') initialize()
  }

  // A page whose Content-Security-Policy won't let it frame the widget still gets the
  // chat: the previous loader builds it inside the page, under that same policy (it
  // needs the script and API sources such a page already allows, plus inline
  // scripts). The site's options, listeners, an open chat and any calls made while
  // it loads carry over. False when it can't be done.
  function fallBackInPage(sources) {
    const ownApi = window.ChatterMate
    if (fellBackInPage || !LOADER_SRC || !ownApi || typeof ownApi !== 'object') return false
    let src
    try {
      src = new URL(IN_PAGE_LOADER, LOADER_SRC).href
    } catch (e) {
      return false
    }
    fellBackInPage = true
    console.warn('[ChatterMate] This page\'s Content-Security-Policy blocks the chat frame, so the chat runs inside the page instead. ' +
      'For the framed chat, add to the policy: frame-src ' + sources.join(' ') + ' (the Widget tab in ChatterMate lists every source).')
    const wasOpen = !!(controller && controller.isOpen())
    const carried = Object.keys(listeners).map(function (event) { return [event, listeners[event].splice(0)] })
    // Until the in-page loader is up, the page's calls wait for it
    const waiting = []
    const standIn = {}
    Object.keys(ownApi).forEach(function (name) {
      if (typeof ownApi[name] === 'function') standIn[name] = function () { waiting.push([name, arguments]) }
    })
    standIn.isOpen = function () { return wasOpen }
    window.ChatterMate = standIn
    destroyWidgetIfRunning()
    window.chattermateConfig = Object.assign({}, givenOptions)

    // The in-page chat can't run here either (missing, or the page's policy blocks
    // its inline scripts too): back to the framed widget, which shows why it can't load
    function backToFramed(reason) {
      if (inPageUnavailable) return
      console.error('[ChatterMate] ' + reason + ' Add to the Content-Security-Policy: frame-src ' + sources.join(' '))
      inPageUnavailable = true
      const inPage = window.ChatterMate
      if (inPage && inPage !== standIn && inPage !== ownApi && typeof inPage.destroy === 'function') inPage.destroy()
      window.ChatterMate = ownApi
      carried.forEach(function (entry) { listeners[entry[0]] = entry[1] })
      ownApi.reload()
    }

    const script = document.createElement('script')
    script.src = src
    script.onload = function () {
      const api = window.ChatterMate
      if (!api || api === standIn || typeof api.on !== 'function') {
        backToFramed('The in-page chat didn\'t start.')
        return
      }
      const cannotStart = function () { backToFramed('The chat couldn\'t start inside this page either.') }
      const startTimer = setTimeout(cannotStart, IN_PAGE_START_MS)
      api.on('ready', function () {
        clearTimeout(startTimer)
        setTimeout(function () { if (!inPageChatMounted()) cannotStart() }, IN_PAGE_MOUNT_MS)
      })
      carried.forEach(function (entry) {
        entry[1].forEach(function (cb) { api.on(entry[0], cb) })
      })
      if (wasOpen && typeof api.open === 'function') api.open()
      waiting.forEach(function (call) {
        if (typeof api[call[0]] === 'function') api[call[0]].apply(api, call[1])
      })
    }
    // Not there (an exact-path script-src, a network error)
    script.onerror = function () { backToFramed('The in-page chat couldn\'t be loaded from ' + src + '.') }
    document.head.appendChild(script)
    return true
  }

  // Whether the in-page chat actually came up: its loader says 'ready' once its page
  // has loaded, even when this page's policy then blocks the scripts inside it (a
  // nonce or 'strict-dynamic' policy). That page is same-origin, so look at it.
  function inPageChatMounted() {
    const frame = document.querySelector('iframe.chattermate-iframe')
    try {
      const app = frame && frame.contentDocument && frame.contentDocument.getElementById('app')
      return !!(app && app.childElementCount)
    } catch (e) {
      return true // nothing to look into: take its word for it
    }
  }

  function destroyWidgetIfRunning() {
    if (controller) {
      controller.destroy()
      return
    }
    // destroy() before the DOM was ready — a site deciding this visitor gets no
    // chat at all. Cancel the pending build rather than let it run afterwards.
    isDestroyed = true
    pendingCalls.length = 0
    triggerClickQueued = false
  }

  // Switch to the identity carried by `token` (from your backend's
  // /api/v1/generate-token call) and start that visitor's conversation.
  function setIdentity(token) {
    const next = normalizeToken(token)
    if (!next) return
    const current = getStoredToken()
    // Sites re-identify on every route change; re-tokenizing with the token the
    // widget already runs on must not throw away a conversation in progress.
    if (next === current) return

    const sameVisitor = current && tokenSubject(next) && tokenSubject(next) === tokenSubject(current)
    // Any new token supersedes an answer still on its way for the old one
    identityEpoch++
    window.chattermateToken = next
    saveToken(next)

    // A fresher token for the SAME visitor is not a new identity: hand it to the
    // running frame instead of rebuilding, so re-authenticating never costs the
    // visitor the chat they are in the middle of.
    // While the previous visitor's frame is closing up, the rebuild it is waiting
    // on picks up this token; the frame itself is no longer theirs to update.
    if (sameVisitor && widgetFrame && !endChatDone) {
      if (widgetMounted) postToFrame({ type: 'TOKEN_REFRESH', token: next })
      // Not mounted yet: the frame isn't listening. It gets this when it is - or,
      // if it hasn't said hello, in its HOST_INIT.
      else pendingIdentity = next
      return
    }
    // A different visitor: the previous one's conversation must not be left open on
    // the server, or re-identifying them later would replay it.
    endConversationThenReload(currentSessionId)
  }

  // Drop the current identity and its conversation, back to anonymous. The next
  // load gets a fresh anonymous token from the backend.
  function clearIdentity() {
    const previousSession = currentSessionId
    identityEpoch++
    window.chattermateToken = null
    removeToken()
    endConversationThenReload(previousSession)
  }

  function setLauncherVisible(visible) {
    setDevConfig('launcher', !!visible)
    refreshStylesIfRendered()
  }

  // Public widget API. Open/close/toggle work from any point after the script loads;
  // calls that land before the DOM is ready are queued and run on init.
  window.ChatterMate = {
    // Configure, e.g. init({ id, launcher: false, position: { side: 'left', bottom: 24, offset: 24 } })
    init: applyOptions,
    // Runtime reposition, e.g. ChatterMate.setPosition({ bottom: 100, right: 24 })
    // Wrapped so stray extra arguments never hit applyPosition's internal param.
    setPosition: function (position) { applyPosition(position) },
    // open() accepts an optional { message } to prefill (not send) the chat input.
    open: function (opts) {
      withController(function () { controller.open(opts) })
    },
    close: function () {
      withController(function () { controller.close() })
    },
    toggle: function () {
      withController(function () { controller.toggle() })
    },
    isOpen: function () {
      return controller ? controller.isOpen() : false
    },
    showLauncher: function () { setLauncherVisible(true) },
    hideLauncher: function () { setLauncherVisible(false) },
    // In-app actions: registerActions({ open_page: async ({ path }) => ({ ok: true }) }).
    // Only actions declared on the agent's Actions tab are used.
    registerActions: function (map) { hostActions.register(map) },
    // Drop every registered action, the page context and unsent events.
    unregisterActions: function () { hostActions.reset() },
    // Page state the agent may use, e.g. setContext({ plan: 'free', step: 'billing' }).
    setContext: function (context) { hostActions.setContext(context) },
    // Tell journeys something happened in the app, e.g. notify('invoice_sent').
    notify: function (event) { hostActions.notify(event) },
    // Start a journey from the app's own code, e.g. startJourney('first_invoice').
    startJourney: function (key) { hostActions.startJourney(key) },
    // Show a message from the page, e.g. prompt({ message: 'Need help with billing?',
    // suggestions: ['Yes please'], open: true }). Nothing is stored unless the visitor replies.
    prompt: function (options) {
      hostActions.prompt(options)
      if (options && options.open === true) withController(function () { controller.open() })
    },
    // SPA login: identify(token) switches the widget to that visitor.
    identify: function (token) { setIdentity(token) },
    // SPA logout: back to an anonymous visitor, previous conversation dropped.
    logout: function () { clearIdentity() },
    // Rebuild the widget with the current token (e.g. after a failed load, or to
    // bring it back after destroy()).
    reload: function () { reloadOrRebuild() },
    // Remove the widget from the page: nothing of ours is left behind.
    destroy: function () { destroyWidgetIfRunning() },
    // Events: 'ready' (widget loaded), 'open', 'close', 'unread' (count payload),
    // 'chatCreated' ({ sessionId, authenticated }), 'identityExpired' (the token this
    // widget was identified with has run out - hand it a new one with identify()).
    on: function (event, cb) {
      if (typeof event !== 'string' || typeof cb !== 'function') return
      // 'ready' already happened — call straight away so consent-gated / lazy site
      // code doesn't miss it. It fires only once, so there's nothing to register.
      if (event === 'ready' && widgetReadyFired) {
        try { cb() } catch (e) { /* site listener error */ }
        return
      }
      ;(listeners[event] = listeners[event] || []).push(cb)
    },
    off: function (event, cb) {
      const cbs = listeners[event]
      if (!cbs) return
      const i = cbs.indexOf(cb)
      if (i !== -1) cbs.splice(i, 1)
    },
  }
})()
