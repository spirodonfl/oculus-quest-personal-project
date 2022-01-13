// RDS page UI
var UI = {
    modes: {
        threeDee: false,
        html: false,
        canvas: false,
        electron: false
    },
    enableMode: function (type) {
        if (UI.modes[type] !== undefined) {
            UI.modes[type] = true;
        } else {
            return false;
        }
        if (type === 'threeDee') {
            // 3D requires canvas mode. In canvas mode, check if threedee is on and, if not, center canvas on page otherwise use aframe asset and offscreen
            UI.modes.canvas = true;
        }
    },
    bus: false,
    elements: {},
    keyboard: {
        queue: [],
        activeModifiers: []
    },
    connection: {
        target: {
            type: null,
            id: null,
            name: null
        },
        raw: null
    },
    mousepad: {
        delta: 6,
        start: { x: 0, y: 0 },
        tracking: false
    },
    // DRAGGING //
    // TODO: Modes because what if you need different drag object for threedee vs canvas and both are running?
    drag: {
        delta: 6,
        element: null,
        x: false,
        y: false
    },
    simpleDrag: function(element) {
        // TODO: Modes
        element.addEventListener('mousedown', function (event) {
            UI.drag.element = event.target;
            UI.drag.x = event.clientX;
            UI.drag.y = event.clientY;
        });
        element.addEventListener('mousemove', function (event) {
            if (UI.drag.element) {
                const diffX = (event.clientX - parseInt(UI.drag.x)) + document.body.scrollLeft;
                const diffY = (event.clientY - parseInt(UI.drag.y)) + document.body.scrollTop;
                UI.drag.x = event.clientX;
                UI.drag.y = event.clientY;

                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'element-drag-mousemove', {event, diffX, diffY});

                var rect = UI.drag.element.getBoundingClientRect();
                var top = rect.top + diffY;
                var left = rect.left + diffX;
                UI.drag.element.style.top = top + 'px';
                UI.drag.element.style.left = left + 'px';
            }
        });
        element.addEventListener('touchstart', function (event) {
            UI.drag.element = event.target;
            UI.drag.x = event.targetTouches[0].clientX;
            UI.drag.y = event.targetTouches[0].clientY;
        });
        element.addEventListener('touchmove', function (event) {
            if (UI.drag.element) {
                const diffX = (event.changedTouches[0].clientX - parseInt(UI.drag.x)) + document.body.scrollLeft;
                const diffY = (event.changedTouches[0].clientY - parseInt(UI.drag.y)) + document.body.scrollTop;
                UI.drag.x = event.changedTouches[0].clientX;
                UI.drag.y = event.changedTouches[0].clientY;

                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'element-drag-touchmove', {event, diffX, diffY});

                var rect = UI.drag.element.getBoundingClientRect();
                var top = rect.top + diffY;
                var left = rect.left + diffX;
                UI.drag.element.style.top = top + 'px';
                UI.drag.element.style.left = left + 'px';
            }
        });
    },

    // VIRTUAL KEYBOARD //
    showKeyboard: function () {
        // TODO: Modes
        UI.elements.virtualKeyboardElement.style.display = 'block';
    },
    hideKeyboard: function () {
        // TODO: Modes
        UI.elements.virtualKeyboardElement.style.display = 'none';
    },
    setupKeyboard: function () {
        // TODO: Modes
        var virtualKeyboardElement = document.createElement('div');
        UI.elements.virtualKeyboardElement = virtualKeyboardElement;
        virtualKeyboardElement.id = 'virtual-keyboard';
        virtualKeyboardElement.style.display = 'none';
        var keySize = { width: 40, height: 40, fontSize: 12 };
        keySize.fontSize = keySize.width / 3.33;
        for (var r = 0; r < KEYCODE_MAP_LAYOUT.test.keys.length; ++r) {
            var rows = KEYCODE_MAP_LAYOUT.test.keys[r];
            var rowElement = document.createElement('div');
            for (var c = 0; c < rows.length; ++c) {
                var layoutKey = rows[c];
                var keyData = false;
                if (layoutKey.keyCode !== null) {
                    for (var i = 0; i < KEYCODE_MAP.length; ++i) {
                        if (KEYCODE_MAP[i].keyCode === layoutKey.keyCode) {
                            keyData = KEYCODE_MAP[i];
                            break;
                        }
                    }
                } else {
                    keyData = {short: ''};
                }
                if (keyData) {
                    if (keyData.short === '' || keyData.short === ' ') {
                        keyData.short = '&nbsp;';
                    }
                    if (keyData.key === ' ') {
                        keyData.key = '&nbsp;';
                    }
                    var keyElement = document.createElement('div');
                    keyElement.classList.add('key');
                    // TODO: Should not these things be moved to styles?
                    keyElement.style.width = (keySize.width * layoutKey.size.width) + 'px';
                    keyElement.style.height = (keySize.height * layoutKey.size.height) + 'px';
                    keyElement.style.lineHeight = (keySize.height - 10) + 'px';
                    keyElement.innerHTML = (keyData.short) ? keyData.short : keyData.key;
                    keyElement.style.fontSize = keySize.fontSize + 'px';
                    keyElement.keyData = keyData;
                    keyElement.addEventListener('click', function (evt) {
                        UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'virtual-key-hit', evt);
                    });
                    rowElement.appendChild(keyElement);
                } else {
                    SFC.LOG.error('Key in layout was not in the map', layoutKey);
                }
            }
            UI.elements.virtualKeyboardElement.appendChild(rowElement);
        }
        UI.simpleDrag(UI.elements.virtualKeyboardElement);
        document.body.appendChild(virtualKeyboardElement);
    },

    setupVideo: function (stream) {
        // TODO: Modes
        // TODO: This needs to be an applied style
        UI.elements.settingsBarWrapper.style.display = 'block';
        UI.elements.settingsBarWrapper.style.zIndex = 2;
        var video = document.createElement('video');
        UI.elements.video = video;
        video.setAttribute('autoplay', '');
        if ('srcObject' in video) {
            video.srcObject = stream;
        } else {
            video.src = window.URL.createObjectURL(stream);
        }
        video.id = 'rando-video';
        STYLES.applyStyleToElement(STYLES.getParsedStyle('video'), video);
        video.setAttribute('width', '100%');
        video._clicking = false;
        video._interval = { clicking: false, moving: false };
        video._layer = { x: 0, y: 0 };
        var clicking = false;
        var clickingInterval = false;
        var movingInterval = false;
        video.addEventListener('touchstart', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'video-touchstart', evt);
            return false;
        });
        video.addEventListener('touchmove', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'video-touchmove', evt);
            return false;
        });
        video.addEventListener('touchend', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'video-touchend', evt);
            return false;
        });
        video.addEventListener('mousemove', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'video-mousemove', evt);
            return false;
        });
        video.addEventListener('mousedown', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'video-mousedown', evt);
            return false;
        });
        video.addEventListener('mouseup', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'video-mouseup', evt);
            return false;
        });
        document.body.appendChild(video);
    },

    hideTrackpad: function () {
        // TODO: Modes
        UI.elements.trackpadWrapper.style.display = 'none';
    },
    showTrackpad: function () {
        // TODO: Modes
        UI.elements.trackpadWrapper.style.display = 'block';
    },
    setupTrackpad: function () {
        // TODO: Modes
        var trackpadWrapper = document.createElement('div');
        trackpadWrapper.id = 'trackpad-wrapper';
        STYLES.applyStyleToElement(STYLES.getParsedStyle('trackpad'), trackpadWrapper);
        UI.elements.trackpadWrapper = trackpadWrapper;
        UI.simpleDrag(UI.elements.trackpadWrapper);
        var pad = document.createElement('div');
        pad.id = 'trackpad-mouse';
        pad.style.border = '1px solid black';
        pad.style.width = '200px';
        pad.style.height = '200px';
        pad.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        pad.addEventListener('mousedown', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mousepad-mousedown', evt);
            return false;
        });
        pad.addEventListener('mousemove', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mousepad-mousemove', evt);
            return false;
        });
        pad.addEventListener('mouseup', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mousepad-mouseup', evt);
            return false;
        });
        pad.addEventListener('touchstart', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mousepad-touchstart', evt);
            return false;
        });
        pad.addEventListener('touchmove', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mousepad-touchmove', evt);
            return false;
        });
        trackpadWrapper.appendChild(pad);
        var clickPadBtn = document.createElement('button');
        clickPadBtn.id = 'trackpad-mouse-click-btn';
        //clickPadBtn.innerText = 'Mouse Click';
        clickPadBtn.style.border = '1px solid black';
        clickPadBtn.style.width = '50%';
        clickPadBtn.style.height = '40px';
        clickPadBtn.style.float = 'left';
        clickPadBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        clickPadBtn.addEventListener('click', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mousepad-virtual-click', {});
            return false;
        });
        var rightClickPadBtn = document.createElement('button');
        rightClickPadBtn.id = 'trackpad-mouse-right-click-btn';
        //rightClickPadBtn.innerText = 'Right Mouse Click';
        rightClickPadBtn.style.border = '1px solid black';
        rightClickPadBtn.style.width = '50%';
        rightClickPadBtn.style.height = '40px';
        rightClickPadBtn.style.float = 'left';
        rightClickPadBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        rightClickPadBtn.addEventListener('click', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mousepad-virtual-right-click', {});
            return false;
        });
        trackpadWrapper.appendChild(clickPadBtn);
        trackpadWrapper.appendChild(rightClickPadBtn);
        document.body.appendChild(trackpadWrapper);
    },

    listenToKeyboard: function () {
        // This is probably ok to be universal (regardless of mode)
        document.addEventListener('keydown', function (evt) {
            if (SETTINGS['listen-to-keyboard'].value) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'keydown', evt);
                return false;
            }
        });
        document.addEventListener('keyup', function (evt) {
            if (SETTINGS['listen-to-keyboard'].value) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'keyup', evt);
                return false;
            }
        });
    },

    listenToMouse: function () {
        // This is probably ok to be universal (regardless of mode)
        // TODO: Clean up the settings for this. It's really weird because you have "Remote Video - Listen to mouse & touch" and then this too... kinda weird
        // Right click
        document.addEventListener('contextmenu', function (evt) {
            if (SETTINGS['listen-to-mouse'].value) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'right-mouse-click', evt);
                return false;
            }
        });
        // Scroll
        document.addEventListener('wheel', function (evt) {
            if (SETTINGS['listen-to-mouse'].value) {
                evt.preventDefault(); // TODO: Apparently this doesn't work because it's passive
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'mouse-wheel-scroll', evt);
                return false;
            }
        });
    },

    // SETTINGS //
    loadSettingsBar: function () {
        if (UI.modes.html) {
            UI._html.loadSettingsBar();
        }
        if (UI.modes.canvas) {
            UI._canvas.loadSettingsBar();
        }
        if (UI.modes.threeDee) {
            UI._threeDee.loadSettingsBar();
        }
        if (UI.modes.electron) {
            UI._electron.loadSettingsBar();
        }
    },

    sendKeyboardQueueInterval: null,
    sendKeyboardQueue: function () {
        if (UI.keyboard.queue.length === 1) {
            var key = UI.keyboard.queue[0];
            var modifiers = [];
            if (key.evt.ctrlKey) { modifiers.push('control'); }
            if (key.evt.altKey) { modifiers.push('alt'); }
            if (key.evt.shiftKey) { modifiers.push('shift'); }
            if (key.evt.metaKey) { modifiers.push('command'); }
            var as = key.keyData.to.robotjs;
            APP.websocket.send(JSON.stringify({
                action: 'keyboard_type',
                data: {
                    key: as,
                    modifiers: modifiers
                }
            }));
        } else {
            for (var i = 0; i < UI.keyboard.queue.length; ++i) {
                var key = UI.keyboard.queue[i];
                if (!key.keyData.isModifier) {
                    var modifiers = [];
                    if (key.evt.ctrlKey) { modifiers.push('control'); }
                    if (key.evt.altKey) { modifiers.push('alt'); }
                    if (key.evt.shiftKey) { modifiers.push('shift'); }
                    if (key.evt.metaKey) { modifiers.push('command'); }
                    var as = key.keyData.to.robotjs;
                    APP.websocket.send(JSON.stringify({
                        action: 'keyboard_type',
                        data: {
                            key: as,
                            modifiers: modifiers
                        }
                    }));
                }
            }
        }
        UI.keyboard.queue = [];
    },

    // WebRTC === UI === data
    load: function () {
        // General events that are applicable to all modes go here
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mousepad-virtual-click', function () {
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'mouse-left-click', {});
        });
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mousepad-virtual-right-click', function () {
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'mouse-right-click', {});
        });
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'right-mouse-click', function () {
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'mouse-right-click', {});
        });
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'shortcut-clicked', function (id) {
            APP.toggleShortcut(id);
        });
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'setting-clicked', function (id) {
            APP.toggleSetting(id);
        });
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'keydown', function (evt) {
            var keyData = false;
            if (evt.key === ' ') {
                for (var i = 0; i < KEYCODE_MAP.length; ++i) {
                    if (KEYCODE_MAP[i].keyCode === 32) {
                        keyData = KEYCODE_MAP[i];
                        break;
                    }
                }
            } else {
                for (var i = 0; i < KEYCODE_MAP.length; ++i) {
                    if (KEYCODE_MAP[i].key === evt.key.toLowerCase() || KEYCODE_MAP[i].key === evt.key) {
                        keyData = KEYCODE_MAP[i];
                        break;
                    }
                }
            }
            if (keyData) {
                UI.keyboard.queue.push({keyData, evt});
                clearInterval(UI.sendKeyboardQueueInterval);
                UI.sendKeyboardQueueInterval = setInterval(UI.sendKeyboardQueue,  500);
            } else {
                SFC.LOG.error('Could not find key in map', evt);
            }
        });
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'keyup', function (evt) {
            clearInterval(UI.sendKeyboardQueueInterval);
            if (UI.keyboard.queue.length > 0) {
                UI.sendKeyboardQueue();
            }
        });
        // TODO: May need to split this out for ELECTRON mode
        SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'websocket-message', function (message, socketInfo) {
            if (UI.connection.target.type === 'rds') {
                // NOTHING?
            } else if (UI.connection.target.type !== 'pty') {
                // TODO: message.message???
                var message = JSON.parse(message.message.data);
                if (message.action === 'peer_offer') {
                    APP.peer.signal(message.data.signal);
                } else if (message.action === 'get_sources' || message.action === 'ask_for_sources') {
                    console.log('TEST');
                    // TODO: No need for both here? One is webrtc and one is pure websocket
                    UI.showSources(message.data);
                } else if (message.action === 'your_uuid') {
                    APP.websocket._uuid = message.data._uuid;
                    APP.peer = APP.setupNewPeer(message.data._uuid);
                }
            } else {
                // TODO: message.message ???
                UI.term.write(message.message.data);
            }
        });

        UI.listenToKeyboard();
        UI.listenToMouse();

        if (UI.modes.html) {
            UI._html.load();
        }
        if (UI.modes.canvas) {
            UI._canvas.load();
        }
        if (UI.modes.threeDee) {
            UI._threeDee.load();
        }
        if (UI.modes.electron) {
            UI._electron.load();
        }
    },

    createXTermElement: function () {
        var element = document.createElement('div');
        element.setAttribute('id', 'xterm');
        element.setAttribute('width', 3);
        element.setAttribute('height', 3);
        return element;
    },

    resizeXTerminal: function (rows, cols) {
        // TODO: Make sure UI.term exists and that rows,cols are integers
        UI.term.resize(rows, cols);
        APP.websocket.send(JSON.stringify({
            action: 'resize',
            data: { rows: rows, cols: cols }
        }));
    },

    setXTerminalFontSize: function (size) {
        // TODO: Make sure UI.term exists and that size is an integer
        UI.term.setOption('fontSize', size);
    },

    createXTerminal: function () {
        var terminal = new Terminal({
            theme: XTERM_THEMES.default,
            allowTransparency: true,
            cursorBlink: true,
            disableStdin: false,
            rows: PTYSettings.rows,
            cols: PTYSettings.cols,
            fontSize: 16,
            rendererType: 'canvas'
        });
        terminal.on('data', function (data) {
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'xterm-data', {data});
        });
        terminal.on('exit', function () {
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'xterm-exit', {});
        });
        // We may also want to use xterm-addon-fit to fit terminal into element
        // Maybe addon-fullscren (?)
        // addon-search (?)
        // addon-ligatures (?)
        // addon-webgl on the aframe view (?)
        // maybe addon-weblinks

        return terminal;
    },

    setWindowTitle: function (title) {
        document.title = title;
    },

    showSources: function (data) {
        if (UI.modes.html) {
            UI._html.showSources(data);
        }
        if (UI.modes.canvas) {
            UI._canvas.showSources(data);
        }
        if (UI.modes.threeDee) {
            UI._threeDee.showSources(data);
        }
        if (UI.modes.electron) {
            UI._electron.showSources(data);
        }
    },

    clearView: function () {
        if (UI.modes.html) {
            UI._html.clearView();
        }
        if (UI.modes.canvas) {
            UI._canvas.clearView();
        }
        if (UI.modes.threeDee) {
            UI._threeDee.clearView();
        }
        if (UI.modes.electron) {
            UI._electron.clearView();
        }
    },

    showConnections: function () {
        if (UI.modes.html) {
            UI._html.showConnections();
        }
        if (UI.modes.canvas) {
            UI._canvas.showConnections();
        }
        if (UI.modes.threeDee) {
            UI._threeDee.showConnections();
        }
        if (UI.modes.electron) {
            UI._electron.showConnections();
        }
    }
};
