UI._html = {
    elements: {}, // TODO: Update all UI.elements to UI._html.elements
    load: function () {
        UI.elements.message = document.getElementById('message');
        UI.elements.action = document.getElementById('action');

        UI.setupTrackpad();
        UI.setupKeyboard();
        UI.loadSettingsBar();

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mousepad-mousedown', function (evt) {
            UI.mousepad.tracking = true;
            UI.mousepad.start.x = evt.pageX;
            UI.mousepad.start.y = evt.pageY;
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mousepad-mousemove', function (evt) {
            if (UI.mousepad.tracking) {
                const diffX = evt.pageX - UI.mousepad.start.x;
                const diffY = evt.pageY - UI.mousepad.start.y;
                APP.websocket.send(JSON.stringify({
                    action: 'mouse_move_by',
                    data: {
                        x: diffX,
                        y: diffY
                    }
                }));
            }
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mousepad-mouseup', function (evt) {
            UI.mousepad.tracking = false;
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mousepad-touchstart', function (evt) {
            UI.mousepad.start.x = evt.targetTouches[0].pageX;
            UI.mousepad.start.y = evt.targetTouches[0].pageY;
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mousepad-touchmove', function (evt) {
            const diffX = evt.changedTouches[0].pageX - UI.mousepad.start.x;
            const diffY = evt.changedTouches[0].pageY - UI.mousepad.start.y;
            APP.websocket.send(JSON.stringify({
                action: 'mouse_move_by',
                data: {
                    x: diffX,
                    y: diffY
                }
            }));
        });

        document.body.addEventListener('mouseup', function (event) {
            UI.drag.element = false;
        });
        document.body.addEventListener('touchend', function (event) {
            UI.drag.element = false;
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'video-touchstart', function (evt) {
            if (SETTINGS['track-video-movements'].value) {}
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'video-touchmove', function (evt) {
            if (SETTINGS['track-video-movements'].value) {}
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'video-touchend', function (evt) {
            if (SETTINGS['track-video-movements'].value) {}
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'video-mouseup', function (evt) {
            if (SETTINGS['track-video-movements'].value) {
                UI.elements.video._which = evt.which;
                var leftOrRight = 'left';
                if (evt.which === 3) {
                    leftOrRight = 'right';
                }
                APP.websocket.send(JSON.stringify({
                    action: 'mouse_click_up',
                    data: { leftOrRight: leftOrRight }
                }));
            }
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'video-mousedown', function (evt) {
            if (SETTINGS['track-video-movements'].value) {
                UI.elements.video._which = evt.which;
                var leftOrRight = 'left';
                if (evt.which === 3) {
                    leftOrRight = 'right';
                }
                APP.websocket.send(JSON.stringify({
                    action: 'mouse_click_down',
                    data: { leftOrRight: leftOrRight }
                }));
            }
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'video-mousemove', function (evt) {
            if (SETTINGS['track-video-movements'].value) {
                // TODO: Pass id of video into event bus instead of event. That way it matches a peer stream so you know what you're targeting server side
                UI.elements.video._layer.x = evt.layerX;
                UI.elements.video._layer.y = evt.layerY;
                clearInterval(UI.elements.video._interval.moving);
                UI.elements.video._interval.moving = setInterval(function () {
                    APP.websocket.send(JSON.stringify({
                        action: 'mouse_move_to',
                        data: {
                            x: UI.elements.video._layer.x,
                            y: UI.elements.video._layer.y
                        }
                    }));
                    clearInterval(UI.elements.video._interval.moving);
                }, 100);
            } else {
                if (UI.elements.video && UI.elements.video._internal) {
                    clearInterval(UI.elements.video._internal.moving);
                }
            }
        });

        // Since mouse wheel scroll may be different on 3D vs html vs canvas, so we keep it here
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'mouse-wheel-scroll', function (evt) {
            var wheel = {
                x: evt.wheelDeltaX,
                y: evt.wheelDeltaY
            };
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'mouse-wheel-scroll', wheel);
        });

        // TODO: This should *probably* be the APP bus
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'virtual-key-hit', function (evt) {
            if (evt.target.keyData) {
                var keyData = evt.target.keyData;
                var as = keyData.to.robotjs;
                if (as === 'control' && !SFC.FUNC.isInArray(UI.keyboard.activeModifiers, 'control')) {
                    UI.keyboard.activeModifiers.push('control');
                    evt.target.classList.add('active-modifier');
                    evt.target.style.backgroundColor = 'rgba(243, 243, 243, 0.7)';
                    evt.target.style.color = 'rgba(0, 0, 0, 1)';
                } else if (as === 'shift' && !SFC.FUNC.isInArray(UI.keyboard.activeModifiers, 'shift')) {
                    UI.keyboard.activeModifiers.push('shift');
                    evt.target.classList.add('active-modifier');
                    evt.target.style.backgroundColor = 'rgba(243, 243, 243, 0.7)';
                    evt.target.style.color = 'rgba(0, 0, 0, 1)';
                } else if (as === 'alt' && !SFC.FUNC.isInArray(UI.keyboard.activeModifiers, 'alt')) {
                    UI.keyboard.activeModifiers.push('alt');
                    evt.target.classList.add('active-modifier');
                    evt.target.style.backgroundColor = 'rgba(243, 243, 243, 0.7)';
                    evt.target.style.color = 'rgba(0, 0, 0, 1)';
                } else if (as === 'command' && !SFC.FUNC.isInArray(UI.keyboard.activeModifiers, 'command')) {
                    UI.keyboard.activeModifiers.push('command');
                    evt.target.classList.add('active-modifier');
                    evt.target.style.backgroundColor = 'rgba(243, 243, 243, 0.7)';
                    evt.target.style.color = 'rgba(0, 0, 0, 1)';
                } else {
                    if (APP.websocket) {
                        SFC.WEBSOCKET.sendCommand(APP.websocket, {
                            action: 'keyboard_type',
                            data: {
                                key: as,
                                modifiers: UI.keyboard.activeModifiers
                            }
                        });
                    }
                    UI.keyboard.activeModifiers = [];
                    var activeModifiers = document.getElementsByClassName('active-modifier');
                    for (var i = 0; i < activeModifiers.length; ++i) {
                        activeModifiers[i].style.backgroundColor = 'rgba(243, 243, 243, 0.3)';
                        activeModifiers[i].style.color = 'rgba(0, 0, 0, 0.4)';
                        activeModifiers[i].classList.remove('active-modifier');
                    }
                }
            }
        });

        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'shortcut-toggled', function (id) {
            if (SHORTCUTS[id]) {
                if (SHORTCUTS[id].value === false) {
                    if (id === 'toggle-virtual-keyboard') {
                        UI.hideKeyboard();
                    }
                    if (id === 'toggle-virtual-mouse') {
                        UI.hideTrackpad();
                    }
                } else if (SHORTCUTS[id].value) {
                    if (id === 'toggle-virtual-keyboard') {
                        UI.showKeyboard();
                    }
                    if (id === 'toggle-virtual-mouse') {
                        UI.showTrackpad();
                    }
                }
                if (id === 'increase-xterm-font-size') {
                    ++UI.term._fontSize;
                    UI.setXTerminalFontSize(UI.term._fontSize);
                } else if (id === 'decrease-xterm-font-size') {
                    --UI.term._fontSize;
                    UI.setXTerminalFontSize(UI.term._fontSize);
                } else if (id === 'increase-xterm-rows') {
                    ++UI.term._rows;
                    UI.resizeXTerminal(UI.term._rows, UI.term._cols);
                } else if (id === 'decrease-xterm-rows') {
                    --UI.term._rows;
                    UI.resizeXTerminal(UI.term._rows, UI.term._cols);
                } else if (id === 'increase-xterm-cols') {
                    ++UI.term._cols;
                    UI.resizeXTerminal(UI.term._rows, UI.term._cols);
                } else if (id === 'decrease-xterm-cols') {
                    --UI.term._cols;
                    UI.resizeXTerminal(UI.term._rows, UI.term._cols);
                }
            }
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'shortcut-clicked', function (id) {
            var element = SFC.HTML.geid('shortcut-' + id);
            // TODO: Some shortcuts should auto toggle on and off like CTRL-TAB and stuff
            if (SHORTCUTS[element.dataset.shortcut].value) {
                STYLES.applyStyleToElement(STYLES.getParsedStyle('shortcutButton', 'on'), element);
            } else {
                STYLES.applyStyleToElement(STYLES.getParsedStyle('shortcutButton'), element);
            }
        });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'setting-toggled', function (id) {
            if (SETTINGS[id]) {
                if (SETTINGS[id].value) {
                    if (id === 'remote-video-actual-size') {
                        UI.elements.video.style.width = UI.elements.video.dataset.width + 'px';
                    } else if (id === 'remote-video-fit-size') {
                        UI.elements.video.style.width = '100%';
                    }
                } else {
                    if (id === 'remote-video-actual-size' || id === 'remote-video-fit-size') {
                        UI.elements.video.style.width = '100%';
                    }
                }
            }
        });
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'setting-clicked', function (id) {
            var element = SFC.HTML.geid('setting-' + id);
            if (SETTINGS[element.dataset.setting].value) {
                STYLES.applyStyleToElement(STYLES.getParsedStyle('settingButton', 'on'), element);
            } else {
                STYLES.applyStyleToElement(STYLES.getParsedStyle('settingButton'), element);
            }
        });

        // TODO: This should *probably* be the APP bus
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'source-clicked', function (evt) {
            var targetId = evt.target.id;
            // APP.websocket.send(JSON.stringify({action: 'attach_to_source', data: {id: targetId}}));

            // TODO: Connect to rds socket / port and send a message to begin receiving. Must include data.window with id
            var ffmpegSocket = APP.connectToServer(UI.connection.target.name, 'rds');
            ffmpegSocket.addEventListener('open', function () {
                console.log('ffmpeg connect');
                ffmpegSocket.send(JSON.stringify({action: '', data: { window: targetId }}));
                // TODO: Modes
                // TODO: This needs to be an applied style
                UI.elements.settingsBarWrapper.style.display = 'block';
                UI.elements.settingsBarWrapper.style.zIndex = 2;
            });
            ffmpegSocket.addEventListener('message', function (data) {
                console.log('ffmpeg message', data);
                var canvas = document.getElementById('test');
                // TODO: Remove from hard coded html and append to body
                var context = canvas.getContext('2d');
                var imageObj = new Image();
                // TODO: data.data??
                imageObj.src = "data:image/jpeg;base64," + data.data;
                imageObj.onload = function () {
                    console.log(imageObj.width, imageObj.height);
                    canvas.width = imageObj.width;
                    canvas.height = imageObj.height;
                    context.height = imageObj.height;
                    context.width = imageObj.width;
                    context.drawImage(imageObj, 0, 0, context.width, context.height);
                }
            });
            // TODO: UI.setupVideo
        });
        // TODO: UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'device-clicked', function (evt) {});

        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-data', function (peer) {
            SFC.LOG.info('peer-info', JSON.parse(peer.latestData));
            var message = JSON.parse(peer.latestData);
            if (message.action === 'video_settings') {
                // TODO: message.data.audioSettings
                // TODO: message.data.id (targetId)
                var waitForVideo = false;
                waitForVideo = setInterval(function () {
                    if (UI.elements.video) {
                        UI.elements.video.dataset.width = message.data.videoSettings.width;
                        UI.elements.video.dataset.height = message.data.videoSettings.height;
                        UI.elements.video.style.maxWidth = message.data.videoSettings.width + 'px';
                        if (SETTINGS['remote-video-actual-size'].value) {
                            UI.elements.video.style.width = message.data.videoSettings.width + 'px';
                        }
                        clearInterval(waitForVideo);
                    }
                }, 500);
            }
        });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-stream', function (peer) {
            if (APP.connection.type !== 'pty') {
                UI.clearView();
                // TODO: Iterate over streams and implement any stream you have not yet implemented instead of default to 0
                // NOTE: All streams comes with ._id so you can identify them better
                UI.setupVideo(peer._streams[0]);
            }
        });

        SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'websocket-error', function (err, socketInfo) {
            SFC.LOG.error('websocket error', err);
            UI.elements.message.innerText = 'Failed to connect via websocket';
            UI.elements.action.innerText = '';
        });

        // TODO: Candidate for main APP since this is *somewhat* consistent on 3d, html and canvas
        SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'websocket-open', function (socketInfo) {
            SFC.LOG.info('websocket open');
            if (UI.connection.target.type === 'pty') {
                var element = UI.createXTermElement();
                document.body.appendChild(element);
                var term = UI.createXTerminal();
                //var fitAddon = new fit();
                //term.loadAddon(fit);
                term.open(element);
                //term.fit();
                //fit.fit(term);
                term._fontSize = 16;
                term._rows = PTYSettings.rows;
                term._cols = PTYSettings.cols;
                UI.term = term;
                // TODO: Needs a style application and a function
                UI.elements.settingsBarWrapper.style.display = 'block';
                UI.elements.settingsBarWrapper.style.zIndex = 6;
                APP.connection.type = 'pty';
                UI.clearView();
                UI.setWindowTitle(UI.connection.target.name + ' - PTY');
            } else if (UI.connection.target.type === 'data') {
                // TODO: This has to be update for all other connections since we're not using webrtc anymore (?)
                if (APP.websocket) {
                    SFC.WEBSOCKET.sendCommand(APP.websocket, {action: 'ask_for_sources'});
                }
            } else {
                UI.setWindowTitle(UI.connection.target.name + ' - RDS');
            }
        });
        // TODO: Candidate for main APP since this is *somewhat* consistent on 3d, html and canvas
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'xterm-data', function (data) {
            if (APP.websocket) {
                // TODO: data.data ???
                SFC.WEBSOCKET.sendCommand(APP.websocket, data.data);
            }
        });
        // TODO: Candidate for main APP since this is *somewhat* consistent on 3d, html and canvas
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'xterm-exit', function () {
            // TODO: Shut everything down (close websocket, close peer, reload page)
        });

        SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'websocket-close', function (socketInfo) {
            SFC.LOG.info('websocket closed');
            UI.elements.message.innerText = 'Websocket connection closed';
            UI.elements.action.innerText = '';
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'server-connection-clicked', function (evt) {
            UI.connection.target.id = evt.target.dataset.id;
            UI.connection.target.type = evt.target.dataset.type;
            UI.connection.target.name = false;
            UI.connection.raw = false;
            for (var name in CONNECTIONS) {
                if (CONNECTIONS[name].id === UI.connection.target.id) {
                    if (UI.connection.target.type === 'data') {
                        UI.connection.raw = CONNECTIONS[name].data;
                        UI.connection.target.name = name;
                        break;
                    } else if (UI.connection.target.type === 'pty') {
                        UI.connection.raw = CONNECTIONS[name].pty;
                        UI.connection.target.name = name;
                        break;
                    } else if (UI.connection.target.type === 'rds') {
                        UI.connection.raw = CONNECTIONS[name].rds;
                        UI.connection.target.name = name;
                        break;
                    }
                }
            }
            if (UI.connection.raw) {
                UI.elements.action.innerText = 'Attempting to establish websocket connection to ' + UI.connection.target.name;
                APP.websocket = APP.connectToServer(UI.connection.target.name, UI.connection.target.type);
                if (APP.websocket !== false && APP.websocket !== {}) {
                    UI.elements.message.innerText = 'Successfully connected to ' + UI.connection.target.name + ' via websocket...';
                    UI.elements.action.innerText = 'Attempting to establish peer connection...';
                } else {
                    UI.elements.message.innerText = 'Failed to connect to ' + UI.connection.target.name + ' via websocket...';
                }
            }
        });

        UI.showConnections();
    },
    showConnections: function () {
        var ul = document.createElement('ul');
        ul.id = 'connections-list';
        UI.elements.connectionList = ul;

        for (var name in CONNECTIONS) {
            var connection = CONNECTIONS[name];
            if (connection.pty) {
                var li = document.createElement('li');
                li.id = 'connection-' + connection.id;
                li.dataset.id = connection.id;
                li.dataset.type = 'pty';
                li.innerText = name + ' PTY';
                li.classList.add('selectable');
                li.addEventListener('click', function (evt) {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'server-connection-clicked', evt);
                });
                ul.appendChild(li);
            }
            if (connection.data) {
                var li = document.createElement('li');
                li.id = 'connection-' + connection.id;
                li.dataset.id = connection.id;
                li.dataset.type = 'data';
                li.innerText = name + ' WebRTC';
                li.classList.add('selectable');
                li.addEventListener('click', function (evt) {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'server-connection-clicked', evt);
                });
                ul.appendChild(li);
            }
            if (connection.rds) {
                var li = document.createElement('li');
                li.id = 'connection-' + connection.id;
                li.dataset.id = connection.id;
                li.dataset.type = 'rds';
                li.innerText = name + ' RDS';
                li.classList.add('selectable');
                li.addEventListener('click', function (evt) {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'server-connection-clicked', evt);
                });
                ul.appendChild(li);
            }
        }
        // TODO: This is all kinda weird for UI so let's fix it. The action and message divs too
        document.getElementById('loading').remove();
        document.body.appendChild(ul);
    },
    clearView: function () {
        // TODO: This is really not the right place to remove these nor should you really remove them in case something comes up. Fix it.
        document.getElementById('message').remove();
        document.getElementById('action').remove();

        UI.elements.connectionList.style.display = 'none';
        if (UI.elements.sourcesList) {
            UI.elements.sourcesList.style.display = 'none';
        }
    },
    showSources: function (data) {
        var add = false;
        if (UI.elements.sourcesList === undefined) {
            var ul = document.createElement('ul');
            ul.id = 'sources-list';
            UI.elements.sourcesList = ul;
            add = true;
        }

        for (var i = 0; i < UI.elements.sourcesList.children.length; ++i) {
            var element = UI.elements.sourcesList.children[i];
            if (element instanceof HTMLElement) {
                element.remove();
            }
        }

        if (data.sources !== undefined) {
            for (var i = 0; i < data.sources.length; ++i) {
                var source = data.sources[i];
                var li = document.createElement('li');
                li.id = source.id;
                li.innerText = source.name;
                li.classList.add('selectable');
                li.addEventListener('click', function (evt) {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'source-clicked', evt);
                });
                ul.appendChild(li);
            }
        } else {
            SFC.LOG.error('Serious error: no sources?', data);
        }

        for (var i = 0; i < data.devices.length; ++i) {
            var device = data.devices[i];
            var li = document.createElement('li');
            li.id = device.deviceId;
            li.innerText = device.label;
            li.classList.add('selectable');
            li.addEventListener('click', function (evt) {
                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'device-clicked', evt);
            });
            ul.appendChild(li);
        }

        if (add) { document.body.appendChild(ul); }
    },
    loadSettingsBar: function () {
        var settingsBarWrapper = document.createElement('div');
        STYLES.applyStyleToElement(STYLES.getParsedStyle('settingsBarWrapper'), settingsBarWrapper);
        for (var setting in SETTINGS) {
            var settingBtn = document.createElement('div');
            settingBtn.id = 'setting-' + setting;
            settingBtn.classList.add('setting-btn');
            settingBtn.dataset.setting = setting;
            settingBtn.addEventListener('click', function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                var target = false;
                for (var i = 0; i < evt.path.length; ++i) {
                    if (evt.path[i].classList.contains('setting-btn')) {
                        target = evt.path[i];
                        break;
                    }
                }
                UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'setting-clicked', target.dataset.setting);
                return false;
            });
            STYLES.applyStyleToElement(STYLES.getParsedStyle('settingButton'), settingBtn);
            if (SETTINGS[setting].icon) {
                settingBtn.innerHTML = SETTINGS[setting].icon;
            } else {
                settingBtn.innerHTML = SETTINGS[setting].text;
            }
            settingsBarWrapper.appendChild(settingBtn);
        }
        for (var shortcut in SHORTCUTS) {
            var shortcutBtn = document.createElement('div');
            shortcutBtn.id = 'shortcut-' + shortcut;
            shortcutBtn.classList.add('shortcut-btn');
            shortcutBtn.dataset.shortcut = shortcut;
            shortcutBtn.addEventListener('click', function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                var target = false;
                for (var i = 0; i < evt.path.length; ++i) {
                    if (evt.path[i].classList.contains('shortcut-btn')) {
                        target = evt.path[i];
                        break;
                    }
                }
                if (target) {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'shortcut-clicked', target.dataset.shortcut);
                }
                return false;
            });
            STYLES.applyStyleToElement(STYLES.getParsedStyle('shortcutButton'), shortcutBtn);
            if (SHORTCUTS[shortcut].icon) {
                shortcutBtn.innerHTML = SHORTCUTS[shortcut].icon;
            } else {
                shortcutBtn.innerText = SHORTCUTS[shortcut].text;
            }
            settingsBarWrapper.appendChild(shortcutBtn);
        }
        UI.simpleDrag(settingsBarWrapper);
        UI.elements.settingsBarWrapper = settingsBarWrapper;
        document.body.appendChild(settingsBarWrapper);
    },
};
