var UI = {
    bus: false,

    // TODO: Better naming
    sourceElements: [],

    memoize: {},
    getMemoized: function (fnName) {
        if (!SFC.FUNC.isInObject(UI.memoize, fnName)) {
            var args = [];
            for (var i = 0; i < arguments.length; ++i) {
                if (i >= 2) {
                    args.push(arguments[i]);
                }
            }
            var value = false;
            value = UI[fnName].apply(this, args);
            UI.memoize = SFC.FUNC.appendToObject(UI.memoize, fnName, value);
        }
        return UI.memoize[fnName];
    },

    getTheScene: function () {
        return document.getElementById('the-scene');
    },

    getTheAssets: function () {
        return document.getElementById('the-assets');
    },

    getEntityWorktable: function () {
        return document.getElementById('entity-worktable');
    },

    getTheCamera: function () {
        return document.getElementsByTagName('a-camera')[0];
    },

    appendElementToScene: function (element) {
        UI.getMemoized('getTheScene').appendChild(element);
    },

    appendElementToAssets: function (element) {
        UI.getMemoized('getTheAssets').appendChild(element);
    },

    appendElementToEntityWorktable: function (element) {
        UI.getMemoized('getEntityWorktable').appendChild(element);
    },

    showServerCommands: function (name, socketInfo) {
        UI.appendElementToEntityWorktable(
            AFRAME_HELPER.createEntityPlaneTextElement({
                entity: {
                    position: { x: -0.4, y: -0.4, z: 0.1 },
                    rotation: { x: 45, y: 90, z: 90 }
                },
                plane: {
                    material: { color: 'rgb(80, 80, 80)', opacity: 0.5 },
                    width: 0.2,
                    height: 0.1,
                    class: 'clickable',
                    click: true,
                    clickEventName: 'server-command-clicked',
                    id: 'command-' + name + '-cmd-get-sources',
                    cmd: 'get-sources',
                    connectionName: name,
                    socketInfo: socketInfo
                },
                text: {
                    value: 'Get RDS Sources',
                    align: 'center',
                    color: 'white',
                    width: 0.5,
                    height: 0.5
                }
            })
        );
    },

    listenToServerCommandClicks: function () {
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'server-command-clicked', function (evt) {
            if (evt.target._data.cmd === 'get-sources') {
                var socket = SFC.WEBSOCKET.getSocketById(SFC.WEBSOCKET.sockets, evt.target._data.socketInfo._id);
                if (socket) {
                    SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEventOnce(SFC.WEBSOCKET.bus, 'message-received', function (data) {
                        // data.socketInfo
                        // data.message
                        if (data.socketInfo._id === socket._getInfo()._id) {
                            var message = JSON.parse(data.message.data);
                            UI.showSources(message.data, data.socketInfo);
                        }
                    });
                    SFC.WEBSOCKET.sendCommand(socket, APP.serverCommands.askForListOfSources());
                } else {
                    SFL.LOG.error('Could not find socket from server-command-clicked', evt);
                }
            } else {
                SFC.LOG.info('Untracked command from server-command-clicked', evt);
            }
        });
    },

    listenToAttachToSourceCommandClicks: function () {
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'connection-command-attach-to-source-clicked', function (evt) {
            SFC.LOG.message(evt);
            var socket = SFC.WEBSOCKET.getSocketById(SFC.WEBSOCKET.sockets, evt.target._data.socketInfo._id);
            if (socket) {
                SFC.WEBSOCKET.sendCommand(socket, APP.serverCommands.attachToSource({id: evt.target._data.sourceId}));
                //APP.testPeerOfferDo(socket._getInfo());
            } else {
                SFL.LOG.error('Could not find socket from server-command-clicked', evt);
            }
        });
    },

    resetSourceElements: function (elements) {
        for (var i = 0; i < elements.length; ++i) {
            var sourceElement = elements[i];
            sourceElement.remove();
        }
        return [];
    },

    showSources: function (sources, socketInfo) {
        UI.sourceElements = UI.resetSourceElements(UI.sourceElements);

        var currentPosition = {x: -0.2, y: -0.2, z: 0.11};
        for (var i = 0; i < sources.length; ++i) {
            var source = sources[i];
            var element = AFRAME_HELPER.createEntityPlaneTextElement({
                entity: {
                    position: currentPosition,
                    rotation: { x: 45, y: 90, z: 90 }
                },
                plane: {
                    material: { color: 'rgb(80, 80, 80)', opacity: 0.5 },
                    class: 'clickable',
                    width: 0.3,
                    height: 0.1,
                    click: true,
                    clickEventName: 'connection-command-attach-to-source-clicked',
                    id: 'cmd-attach-to-source',
                    sourceId: source.id,
                    sourceDeviceId: source.deviceId,
                    socketInfo: socketInfo
                },
                text: {
                    value: (source.name) ? source.name : source.label,
                    align: 'center',
                    color: 'white',
                    width: 0.5,
                    height: 0.5
                }
            });
            UI.sourceElements.push(element);
            UI.appendElementToEntityWorktable(element);
            currentPosition.z += 0.11;
        }
    },

    showCanvas: function () {
        // TODO: Grids should auto-calculate themselves based on resize events
        // TODO: If something in grid exceeds grid width / height, scroll needs to be allowed
        // TODO: If any of your elements go beyond width / height of canvas, you need to allow for scrolling

        var rootCanvas = CANVAS.createRootCanvas(4);
        document.body.style.backgroundColor = 'rgb(51, 51, 51)';
        rootCanvas.style.margin = 'auto';
        rootCanvas.style.display = 'block';
        rootCanvas.style.position = 'absolute';
        rootCanvas.style.top = 0;
        rootCanvas.style.left = 0;
        //rootCanvas.style.bottom = 0;
        rootCanvas.style.right = 0;
        var rootContext = rootCanvas.getContext('2d');
        var rootGrid = CANVAS.createRootGrid(false);
        var listGrid = CANVAS.createGrid(rootGrid, [
            {
                x: 1, y: 1,
                grids: [
                    {
                        x: {from: 1, to: (rootGrid.columns/2)},
                        y: {from: 1, to: (rootGrid.rows/2)}
                    }
                ]
            },
            {
                x: 2, y: 1,
                grids: [
                    {
                        x: {from: ((rootGrid.columns/2)+1), to: (rootGrid.columns)},
                        y: {from: 1, to: (rootGrid.rows/2)}
                    }
                ]
            },
            {
                x: 1, y: 2,
                grids: [
                    {
                        x: {from: 1, to: (rootGrid.columns/2)},
                        y: {from: ((rootGrid.rows/2)+1), to: (rootGrid.rows)}
                    }
                ]
            },
            {
                x: 2, y: 2,
                grids: [
                    {
                        x: {from: ((rootGrid.columns/2)+1), to: (rootGrid.columns)},
                        y: {from: ((rootGrid.rows/2)+1), to: (rootGrid.rows)}
                    }
                ]
            }
        ]);
        CANVAS.renderGrid(rootGrid, rootCanvas);
        CANVAS.renderGrid(listGrid, rootCanvas, 'rgba(0, 255, 0, 0.3)');
        CANVAS.layers[0] = [];
        var sampleText = CANVAS.createText(rootGrid.size.width * 6, rootGrid.size.height * 2, "Something can go here", true);
        CANVAS.layers[0].push(sampleText);
        sampleText = CANVAS.putElementOntoCanvas(sampleText, rootCanvas, listGrid.spaces[3].top.x, listGrid.spaces[3].top.y);
        var roundedRect = CANVAS.createRoundedRectangle(30, 30, 5, true);
        CANVAS.layers[0].push(roundedRect);
        // TODO: Draw canvas on animationframe by iterating layers, bottom up
        roundedRect = CANVAS.putElementOntoCanvas(roundedRect, rootCanvas, listGrid.spaces[2].top.x, listGrid.spaces[2].top.y);

        var gg = [];
        var ggX = 1;
        var ggY = 1;
        for (var y = 1; y <= rootGrid.rows; y += (rootGrid.rows/10)) {
            for (var x = 1; x <= rootGrid.columns; x += (rootGrid.columns/4)) {
                gg.push({
                    x: ggX, y: ggY, grids: [
                        {
                            x: { from: x, to: ((x-1) + (rootGrid.columns/4)) },
                            y: { from: y, to: ((y-1) + (rootGrid.rows/10)) }
                        }
                    ]
                });
                ++ggX;
            }
            ++ggY;
            ggX = 1;
        }
        var sourcesListGrid = CANVAS.createGrid(rootGrid, gg);
        console.log(sourcesListGrid);
        CANVAS.renderGrid(sourcesListGrid, rootCanvas, 'rgba(255, 0, 0, 0.3)');
        var sY = 1;
        for (var name in CONNECTIONS) {
            var connection = CONNECTIONS[name];
            if (connection.pty) {
                var outName = name + ' PTY';
            }
            if (connection.data) {
                var outName = name + ' WebRTC';
            }
            var text = CANVAS.createText(sourcesListGrid.size.width, sourcesListGrid.size.height, outName, true);
            CANVAS.layers[0].push(text);
            text = CANVAS.putElementOntoCanvas(text, rootCanvas, sourcesListGrid.getGrid(1, sY).top.x, sourcesListGrid.getGrid(1, sY).top.y);
            ++sY;
            // TODO: Here is a good example of "if (sY > sourceListGrid.rows) { implement scrolling }"
        }

        // canvas.addEventListener('mousedown|mouseup|touchstart|touchend|touchmove');
        rootCanvas.addEventListener('mousemove', function (evt) {
            for (var i = (CANVAS.layers.length - 1); i >= 0; --i) {
                var layer = CANVAS.layers[i];
                for (var e = (layer.length - 1); e >= 0; --e) {
                    var element = layer[e];
                    if (element.isHit(evt.layerX, evt.layerY)) {
                        console.log('Hit');
                    }
                }
            }
                // TODO: Simply replace top most connection item with selected, show connecting status
                // TODO: On connected, if PTY, replace with xterm
                // TODO: On connected, if webrtc, show available devices/sources under item selected
                // TODO: When selected a device/source, put that under connection item now and show connecting status
                // TODO: Connection item and source/device can disappear when video comes in which replaces screen
                // TODO: On video show settings bar as hover with drag abilities
                // -- dragging must account for focused element on mousedown/mouseup
        });
        return rootCanvas;
    },

    setup: function () {
        UI.listenToServerCommandClicks();
        UI.listenToAttachToSourceCommandClicks();

        var rootCanvas = UI.showCanvas();
        var canvasEl = document.getElementById('canvas-worktable');
        canvasEl.width = rootCanvas.width;
        canvasEl.height = rootCanvas.height;
        var contextEl = canvasEl.getContext('2d');
        contextEl.drawImage(rootCanvas, 0, 0);

        UI.appendElementToScene(
            AFRAME_HELPER.createEntityElement({
                id: 'entity-worktable',
                class: 'movable',
                position: {x: 0, y: 0, z: -0.03},
                rotation: {x: -70, y: 0, z: 0}
            })
        );
        UI.appendElementToEntityWorktable(
            AFRAME_HELPER.createPlaneElement({
                side: 'double',
                width: 0.6,
                height: 0.4,
                position: {x: 0, y: 0, z: 0},
                rotation: {x: 0, y: 0, z: 0},
                material: {
                    opacity: 1,
                    color: 'rgb(240, 240, 240)',
                    src: '#canvas-worktable'
                },
                // drawCanvas: {
                //     canvasId: 'canvas-worktable'
                // }
            })
        );
        UI.appendElementToEntityWorktable(
            AFRAME_HELPER.createTextElement({
                value: 'Not connected yet...',
                id: 'text-one',
                width: 1,
                height: 1,
                align: 'center',
                color: 'red',
                position: {x: 0.03, y: 0.03, z: 0.03},
                opacity: 1
            })
        );
        UI.appendElementToEntityWorktable(
            AFRAME_HELPER.createPlaneElement({
                class: 'clickable',
                id: 'toggle-mouse-move',
                side: 'double',
                width: 0.1,
                height: 0.1,
                position: {x: -0.65, y: -0.50, z: 0.001},
                material: {
                    color: 'rgb(150, 40, 40)'
                }
            })
        );
        // UI.appendElementToEntityWorktable(
        //     AFRAME_HELPER.createCircleElement({
        //         class: 'clickable',
        //         id: 'toggle-servers-view',
        //         side: 'double',
        //         width: 0.1,
        //         height: 0.1,
        //         position: {x: -0.65, y: -0.65, z: 0.001},
        //         material: {
        //             color: 'rgb(50, 50, 50)'
        //         },
        //         geometry: {
        //             radius: 0.05
        //         }
        //     })
        // );
        UI.appendElementToEntityWorktable(
            AFRAME_HELPER.createEntityPlaneFontAwesomeElement({
                entity: {
                    position: { x: -0.65, y: -0.65, z: 0.001 }
                },
                plane: {
                    material: { color: 'rgb(255, 100, 60)', opacity: 0.5 },
                    width: 0.05,
                    height: 0.05,
                    // class: 'clickable',
                    // click: true,
                    // clickEventName: 'toggle-servers-view',
                    // id: 'toggle-servers-view',
                    size: 10
                },
                text: {
                    opacity: 1,
                    charcode: 'fas fa-server',
                    align: 'center',
                    color: 'red',
                    id: 'toggle-servers-view',
                    width: 1,
                    height: 1
                }
            })
        );
        UI.appendElementToEntityWorktable(
            AFRAME_HELPER.createKeyboardEntity({
                id: 'keyboard',
                position: {x: -0.5, y: -0.47, z: 0.001}
            })
        );

        document.querySelector('a-scene').addEventListener('enter-vr', function () {
            console.log("ENTERED VR");
            document.querySelector('#left-hand').setAttribute('thumbstick-logging', '');
            document.querySelector('#left-hand').setAttribute('oculus-quest-2-controller-logging', '');
            document.querySelector('#right-hand').setAttribute('oculus-quest-2-controller-logging', '');
            //document.querySelector('a-entity').setAttribute('track-hand-rotation', '');
        });
        document.querySelector('#toggle-mouse-move').addEventListener('click', function (evt) {
            if (!mouseToggled) {
                document.querySelector('#toggle-mouse-move').setAttribute('material', {color: 'rgb(40, 40, 40)'});
                mouseToggled = true;
            } else {
                document.querySelector('#toggle-mouse-move').setAttribute('material', {color: 'rgb(150, 40, 40)'});
                mouseToggled = false;
            }
        });
        document.querySelector('#toggle-servers-view').addEventListener('click', function (evt) {
            var currentPosition = {x: -0.6, y: -0.6, z: 0.1};
            for (var name in APP.connections) {
                var connection = APP.connections[name];
                var element = AFRAME_HELPER.createEntityPlaneTextElement({
                    entity: {
                        position: currentPosition,
                        rotation: { x: 45, y: 90, z: 90 }
                    },
                    plane: {
                        material: { color: 'rgb(80, 80, 80)', opacity: 0.2 },
                        width: 0.1,
                        class: 'clickable',
                        height: 0.035,
                        click: true,
                        clickEventName: 'connection-clicked',
                        id: 'connection-' + name,
                        connectionName: name,
                        border: true,
                        borderColor: 'rgb(80, 80, 80)'
                    },
                    text: {
                        value: name,
                        align: 'center',
                        color: 'rgb(255, 255, 255)',
                        width: 0.3,
                        height: 0.5
                    }
                });
                element.children[0].setAttribute('animation__connecting', {
                    property: 'components.material.material.color',
                    type: 'color',
                    from: 'rgb(80, 80, 80)',
                    to: 'rgb(255, 150, 150)',
                    easing: 'easeInOutSine',
                    dir: 'alternate',
                    loop: 5,
                    dur: 400,
                    startEvents: 'start_animation__connecting',
                    pauseEvents: 'pause_animation__connecting, start_animation__connected, start_animation__failed',
                    resumeEvents: 'resume_animation__connecting, start_animation__connecting'
                });
                element.children[0].setAttribute('animation__connected', {
                    property: 'components.material.material.color',
                    type: 'color',
                    from: 'rgb(80, 80, 80)',
                    to: 'rgb(150, 255, 150)',
                    easing: 'easeInOutSine',
                    dir: 'alternate',
                    loop: 5,
                    dur: 400,
                    startEvents: 'start_animation__connected',
                    pauseEvents: 'pause_animation__connected, start_animation__connecting, start_animation__failed',
                    resumeEvents: 'resume_animation__connected, start_animation__connected'
                });
                // TODO: You could generalize these animations and store them separately instead of creating them over and over. Look at AFRAME.ANIME() to see a component output
                element.children[0].setAttribute('animation__failed', {
                    property: 'components.material.material.color',
                    type: 'color',
                    from: 'rgb(80, 80, 80)',
                    to: 'rgb(255, 0, 0)',
                    easing: 'easeInOutSine',
                    dir: 'alternate',
                    loop: 5,
                    dur: 400,
                    startEvents: 'start_animation__failed',
                    pauseEvents: 'pause_animation__failed, start_animation__connecting, start_animation__connected',
                    resumeEvents: 'resume_animation__failed, start_animation__failed'
                });
                UI.appendElementToEntityWorktable(element);
                currentPosition.z += 0.04;
            }
            APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'connection-clicked', function (evt) {
                if (evt.target.id === 'connection-MSI') {
                    console.log('Connect');
                    evt.target.emit('start_animation__connecting', null, false);
                    // TODO: Better handling of names so this is more dynamic
                    var socket = APP.connectToServer('MSI', 'data');
                    setupNewPeer(socket);
                    SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'message-received', function (data) {
                        // data.socketInfo
                        // data.message
                        var socket = SFC.WEBSOCKET.getSocketById(SFC.WEBSOCKET.sockets, data.socketInfo._id);
                        if (data.socketInfo._id === socket._getInfo()._id) {
                            var message = JSON.parse(data.message.data);
                            if (message.action === 'peer_offer') {
                                p.signal(message.data);
                            } else if (message.action === 'peer_connected') {
                                p.serverConnected = true;
                                if (p.clientConnected && p.serverConnected) {
                                    SFC.WEBSOCKET.sendCommand(socket, APP.serverCommands.attachToSource({id: evt.target._data.sourceId}));
                                }
                            } else if (message.action === 'ask_for_peer_offer') {
                                if (!p) {
                                    setupNewPeer();
                                    p.on('connect', function () {
                                        p.clientConnected = true;
                                        SFC.WEBSOCKET.sendCommand(socket, {action: 'peer_connected'});
                                        if (p.serverConnected && p.clientConnected) {
                                            SFC.WEBSOCKET.sendCommand(socket, APP.serverCommands.attachToSource({id: evt.target._data.sourceId}));
                                        }
                                    });
                                }
                                p.on('signal', function (data) {
                                    console.trace('signal', data);
                                    SFC.WEBSOCKET.sendCommand(socket, APP.serverCommands.sendPeerAnswer(data));
                                });
                                console.log(message);
                                p.signal(message.data);
                            } else if (message.status) {
                                //APP.testPeerOfferDo(data.socketInfo);
                            }
                        }
                    });
                    socket.addEventListener('error', function () {
                        SFC.WEBSOCKETS.sockets = SFC.WEBSOCKETS.destroy(SFC.WEBSOCKETS.sockets, socket);
                        evt.target.emit('start_animation__failed', null, false);
                    });
                    SFC.WEBSOCKET.whenReady(socket, function (socket) {
                        evt.target.emit('start_animation__connected', null, false);
                        console.log('socket ready', socket._getInfo());
                        UI.showServerCommands(evt.target._data.connectionName, socket._getInfo());
                    });
                }
            });
        });

        document.getElementById('right-hand').addEventListener('pinchended', function (evt) {
            //document.querySelector('#text-one').setAttribute('value', JSON.stringify(evt));
        });
        document.getElementById('right-hand').addEventListener('pinchmoved', function (evt) {
            // TODO: This works! See if you can also intersect by hands!
            //document.querySelector('#text-one').setAttribute('value', JSON.stringify(evt.target.components['hand-tracking-controls'].pinchEventDetail));
        });

        // TODO: Make this its own thing in the UI or APP (or whatever)
        // TODO: Also add thumbstick movement as well
        var movables = document.getElementsByClassName('movable');
        for (var i = 0; i < movables.length; ++i) {
            if (movables[i] instanceof HTMLElement) {
                // TODO: Need a better way to catch clicks because clicking on inside elements also triggers this and it's annoying
                /*movables[i].addEventListener('click', function () {
                    if (MODES.focusedElement === this) {
                        MODES.focusedElement = false;
                        MODES.positioningFocusedElement = false;
                        APP.getMemoized('UI', 'getTheCamera').components['wasd-controls'].play();
                    } else {
                        MODES.focusedElement = this;
                        MODES.positioningFocusedElement = true;
                        APP.getMemoized('UI', 'getTheCamera').components['wasd-controls'].pause();
                    }
                });*/
            }
        }
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'keyboard-38-clicked', function () {
            if (MODES.focusedElement && MODES.positioningFocusedElement) {
                // TODO: Update all setAttributes to use this instead because it's faster than setAttribute by a lot
                MODES.focusedElement.object3D.position.y += 0.1;
            }
        });
        document.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 38) {
                if (MODES.focusedElement && MODES.positioningFocusedElement) {
                    // TODO: Update all setAttributes to use this instead because it's faster than setAttribute by a lot
                    MODES.focusedElement.object3D.position.y += 0.1;
                }
            }
        });
    }
};
