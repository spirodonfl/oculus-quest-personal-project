UI._canvas = {
    drawPending: false,
    requestAnimationFrame: function () {
        if (UI._canvas.drawPending) {
            UI._canvas.redraw();
        }
        requestAnimationFrame(UI._canvas.requestAnimationFrame);
    },
    // requestAnimationFrame: function(callback) {
    //     requestAnimationFrame(function(t) {
    //         callback(t);
    //         // Note: You may potentially want to remove this. Test first
    //         if (UI._canvas.drawPending) {
    //             UI._canvas.redraw();
    //         }
    //     });
    // },
    redraw: function () {
        UI._canvas.drawPending = false;

        var rootCanvas = CANVAS.layers[0];
        var rootContext = CANVAS.layers[0].getContext('2d');
        // TODO: Each grid should actualy be its own layer. Then each grid has elements inside of it. Each grid has a "needsRender" flag. If true, clear grid and redraw.
        rootContext.clearRect(0, 0, rootCanvas.width, rootCanvas.height);
        // Note: Skipping 0 because that should be the root canvas
        for (var i = 1; i < CANVAS.layers.length; ++i) {
            var layer = CANVAS.layers[i];
            if (layer.isGrid) {
                if (layer.shouldRender) {
                    CANVAS.renderGrid(layer, rootCanvas, layer.color);
                    for (var e = 0; e < layer.elements.length; ++e) {
                        var element = layer.elements[e];
                        element = CANVAS.putElementOntoCanvas(element, rootCanvas, element.drawPosition.x, element.drawPosition.y);
                    }
                }
            } else {
                CANVAS.putElementOntoCanvas(layer, rootCanvas, layer.drawPosition.y, layer.drawPosition.x);
            }
        }
    },
    load: function () {
        // TODO: This should *probably* be the APP bus
        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'source-clicked', function (evt) {
            var targetId = evt._id;
            APP.websocket.send(JSON.stringify({action: 'attach_to_source', data: {id: targetId}}));
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
                        // TODO: Name this variable AND the actual grid ID better
                        var connectionsListGrid = false;
                        for (var i = 0; i < CANVAS.layers.length; ++i) {
                            var layer = CANVAS.layers[i];
                            if (layer.isGrid && layer.id === 'connections-list') {
                                connectionsListGrid = layer;
                                break;
                            }
                        }
                        if (connectionsListGrid) {
                            setInterval(function () {
                                var rootCanvas = CANVAS.layers[0];
                                var rootContext = rootCanvas.getContext('2d');
                                // TODO: Scale this down
                                // TODO: If you have multiple videos, iterate them, do a play/pause, draw in between, that way they all stay updated
                                rootContext.drawImage(UI.elements.video, connectionsListGrid(3, 1).top.x, connectionsListGrid(3, 1).top.y);
                                // TODO: on click, bring video element over top and overlay settings bar -> UI.loadSettingsBar -> UI._canvas.loadSettingsBar
                                // TODO: probably bring in all event listeners for video-* from UI._html since you're using the same thing here but only if you're in canvas ONLY mode
                            }, 2000);
                        }
                        // TODO: this. show video in canvas
                        clearInterval(waitForVideo);
                    }
                }, 500);
            }
        });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-stream', function (peer) {
            if (APP.connection.type !== 'pty') {
                // UI.clearView();
                // TODO: Iterate over streams and implement any stream you have not yet implemented instead of default to 0
                // NOTE: All streams comes with ._id so you can identify them better
                UI.setupVideo(peer._streams[0]);
                // TODO: Maybe skip to show video with no mouse events unless you popup the full viewer as an html element (or 3d element)
            }
        });

        UI.bus = SFC.EVENTS.listenToEvent(UI.bus, 'server-connection-clicked', function (evt) {
            UI.connection.target.id = evt._id;
            UI.connection.target.type = evt._type;
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
                    }
                }
            }
            if (UI.connection.raw) {
                // TODO: Attempting to create connection
                APP.websocket = APP.connectToServer(UI.connection.target.name, UI.connection.target.type);
                if (APP.websocket !== false && APP.websocket !== {}) {
                    // TODO: Success!
                    // TODO: Attempting peer connection
                } else {
                    // TODO: Failed
                }
            }
        });
        // TODO: Show bottom bar for the following (1) connections (2) notes (3) models (4) library (mostly saved html output but could also contain screenshots too)
        // TODO: Grids should auto-calculate themselves based on resize events
        // TODO: Scrolling should just be auto-configured when you have a grid of say 5x5 but a vertical list of 8 items. You know when to scroll so just allow scrolling when applicable

        var rootCanvas = CANVAS.createRootCanvas();
        document.body.style.backgroundColor = 'rgb(51, 51, 51)';
        rootCanvas.style.margin = 'auto';
        rootCanvas.style.display = 'block';
        rootCanvas.style.position = 'absolute';
        rootCanvas.style.top = 0;
        rootCanvas.style.left = 0;
        // rootCanvas.style.bottom = 0;
        rootCanvas.style.right = 0;
        // TODO: Need to figure out scaling below. Doing this causes tracking of position & mouse position to be way off
        // So that we scale down to the right scale for our viewport with a nice crisp image
        // rootCanvas.style.maxWidth = CANVAS.size.width * (CANVAS.scale - 1);
        // rootCanvas.style.maxHeight = CANVAS.size.height * (CANVAS.scale - 1);
        CANVAS.layers.push(rootCanvas);

        var rootContext = rootCanvas.getContext('2d');

        var rootGrid = CANVAS.createRootGrid(false);
        CANVAS.layers.push(rootGrid);

        document.body.appendChild(rootCanvas);
        // canvas.addEventListener('mousedown|mouseup|touchstart|touchend|touchmove');
        rootCanvas.addEventListener('mousemove', function (evt) {
            // Note: skipping 0 because it's root canvas and skipping 1 because it's root grid
            for (var i = (CANVAS.layers.length - 1); i >= 2; --i) {
                var layer = CANVAS.layers[i];
                if (layer.isGrid) {
                    if (layer.elements) {
                        for (var e = (layer.elements.length - 1); e >= 0; --e) {
                            var element = layer.elements[e];
                            if (element.isHit(evt.layerX, evt.layerY)) {
                                console.log('Hit', element._id);
                            }
                        }
                    } else {
                        console.log(layer);
                    }
                }
            }
        });
        rootCanvas.addEventListener('click', function (evt) {
            // Note: skipping 0 because it's root canvas and skipping 1 because it's root grid
            for (var i = (CANVAS.layers.length - 1); i >= 2; --i) {
                var layer = CANVAS.layers[i];
                if (layer.isGrid) {
                    if (layer.elements) {
                        for (var e = (layer.elements.length - 1); e >= 0; --e) {
                            var element = layer.elements[e];
                            if (element.isHit(evt.layerX, evt.layerY)) {
                                console.log('Hit', element._id);
                                if (element.click) {
                                    element.click();
                                }
                            }
                        }
                    } else {
                        console.log(layer);
                    }
                }
            }
        });

        UI.showConnections();
    },
    showConnections: function () {
        var rootGrid = CANVAS.layers[1];
        // TODO: A better way for this...
        var gg = [];
        var ggX = 1;
        var ggY = 1;
        for (var y = 1; y <= rootGrid.rows; y += (rootGrid.rows/20)) {
            for (var x = 1; x <= rootGrid.columns; x += (rootGrid.columns/4)) {
                gg.push({
                    x: ggX, y: ggY, grids: [
                        {
                            x: { from: x, to: ((x-1) + (rootGrid.columns/4)) },
                            y: { from: y, to: ((y-1) + (rootGrid.rows/20)) }
                        }
                    ]
                });
                ++ggX;
            }
            ++ggY;
            ggX = 1;
        };
        var connectionsListGrid = CANVAS.createGrid(rootGrid, gg, {
            color: 'rgba(0, 0, 255, 0.6)',
            shouldRender: true,
            id: 'connections-list'
        });
        CANVAS.layers.push(connectionsListGrid);

        var sY = 1;
        for (var name in CONNECTIONS) {
            var connection = CONNECTIONS[name];
            var outName = '';
            var type = '';
            if (connection.pty) {
                outName = name + ' PTY';
                type = 'pty';
                var text = CANVAS.createText(connectionsListGrid.size.width, connectionsListGrid.size.height, outName, true);
                text._id = connection.id;
                text._type = type;
                text.click = function () {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'server-connection-clicked', text);
                }
                text.drawPosition = {
                    x: connectionsListGrid.getGrid(1, sY).top.x,
                    y: connectionsListGrid.getGrid(1, sY).top.y
                };
                connectionsListGrid.elements.push(text);
                ++sY;
            }
            if (connection.data) {
                outName = name + ' WebRTC';
                type = 'data';
                var text = CANVAS.createText(connectionsListGrid.size.width, connectionsListGrid.size.height, outName, true);
                text._id = connection.id;
                text._type = type;
                text.click = function () {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'server-connection-clicked', text);
                }
                text.drawPosition = {
                    x: connectionsListGrid.getGrid(1, sY).top.x,
                    y: connectionsListGrid.getGrid(1, sY).top.y
                };
                connectionsListGrid.elements.push(text);
                ++sY;
            }
        }

        UI._canvas.drawPending = true;
    },
    showSources: function (data) {
        // TODO: Name this variable AND the actual grid ID better
        var connectionsListGrid = false;
        for (var i = 0; i < CANVAS.layers.length; ++i) {
            var layer = CANVAS.layers[i];
            if (layer.isGrid && layer.id === 'connections-list') {
                connectionsListGrid = layer;
                break;
            }
        }
        if (connectionsListGrid) {
            // TODO: Only show as many rows as are visible in the grid
            // TODO: Allow scroll when number of things exceeds visible rows. Need to keep a cursor track of arrays
            var sY = 1;
            if (data.sources !== undefined) {
                for (var i = 0; i < data.sources.length; ++i) {
                    var source = data.sources[i];
                    var text = CANVAS.createText(connectionsListGrid.size.width, connectionsListGrid.size.height, source.name, true);
                    text._id = source.id;
                    text.click = function () {
                        UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'source-clicked', text);
                    }
                    text.drawPosition = {
                        x: connectionsListGrid.getGrid(2, sY).top.x,
                        y: connectionsListGrid.getGrid(2, sY).top.y
                    };
                    connectionsListGrid.elements.push(text);
                    ++sY;
                }
            } else {
                SFC.LOG.error('Serious error: no sources?', data);
            }

            for (var i = 0; i < data.devices.length; ++i) {
                var device = data.devices[i];
                var text = CANVAS.createText(connectionsListGrid.size.width, connectionsListGrid.size.height, deivce.label, true);
                text._id = source.deviceId;
                text.click = function () {
                    UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'device-clicked', text);
                }
                text.drawPosition = {
                    x: connectionsListGrid.getGrid(2, sY).top.x,
                    y: connectionsListGrid.getGrid(2, sY).top.y
                };
                connectionsListGrid.elements.push(text);
                ++sY;
            }
        } else {
            // TODO: No grid??
        }

        UI._canvas.drawPending = true;
    }
};
requestAnimationFrame(UI._canvas.requestAnimationFrame);

        // NOTE: This also works
        // requestAnimationFrame(UI.redraw);
        // anime({
        //     targets: UI.testRgb,
        //     r: 100,
        //     rounds: 1,
        //     easing: 'linear',
        //     update: function () {
        //         UI.testRgb.r = Math.floor(UI.testRgb.r);
        //         console.log('update', UI.testRgb);
        //         UI.drawPending = true;
        //         UI.redraw();
        //     },
        //     change: function () {
        //         console.log('change');
        //     }
        // });
