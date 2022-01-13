// TODO: App should moved to common folder since it has crossover with client and electron
var APP = {
    bus: false,
    connections: CONNECTIONS,
    websocket: false,
    peer: false,
    connection: { type: '' },
    uuids: {
        v4: []
    },
    memoize: {},
    // TODO: These schemas should live in separate files. The server needs these too. Better to make them sharable.
    schemas: {
        connectionData: {
            ip: {
                is: 'string',
                required: true,
                example: '192.168.0.1'
            },
            port: {
                is: 'integer',
                required: true,
                example: 8000
            }
        },
        serverCommands: {
            askForListOfSources: {}
        },
        serverResponses: {
            askForListOfSources: {}
        }
    },
    serverCommands: {
        askForListOfSources: function (data) {
            var cmd = {};
            if (!SFC.DATA.isValid(APP.schemas.serverCommands.askForListOfSources, data)) {
                SFC.LOG.error('Server data for command "askForListOfSources" is not valid');
            } else {
                cmd = { action: 'get_sources', data };
            }
            return cmd;
        },
        attachToSource: function (data) {
            var cmd = {};
            if (!SFC.DATA.isValid(APP.schemas.serverCommands.attachToSource, data)) {
                SFC.LOG.error('Server data for command "attachToSource" is not valid');
            } else {
                cmd = { action: 'attach_to_source', data };
            }
            return cmd;
        },
        askForPeerOffer: function (data) {
            // TODO: This
            var cmd = { action: 'ask_for_peer_offer' };
            return cmd;
        },
        sendPeerAnswer: function (data, id) {
            // TODO: This
            var cmd = { action: 'send_peer_answer', data: data, id: id };
            return cmd;
        },
        sendKeyboardType: function (data) {
            // TODO: This
            // REQUIRED: data.key
            var cmd = { action: 'keyboard_type', data: data };
            return cmd;
        },
        sendKeyboardDown: function (data) {
            // TODO: This
            // REQUIRED: data.key
            var cmd = { action: 'keyboard_down', data: data };
            return cmd;
        },
        sendKeyboardUp: function (data) {
            // TODO: This
            // REQUIRED: data.key
            var cmd = { action: 'keyboard_up', data: data };
            return cmd;
        },
        sendMouseMoveBy: function (data) {
            // TODO: This
            // REQUIRED: data.x data.y
            var cmd = { action: 'mouse_move_by', data: data };
            return cmd;
        }
    },
    connectToServer: function (name, type, arrayBuffer) {
        var response = {};
        var pass = true;
        if (!SFC.FUNC.isInObject(APP.connections, name)) {
            SFC.LOG.error('Connection "' + name + '" is not in connections list', APP.connections);
            pass = false;
        }
        if (!SFC.FUNC.isInObject(APP.connections[name], type)) {
            SFC.LOG.error('Connection "' + name + '" has no data for "' + type + '"', APP.connections[name]);
            pass = false;
        }
        var data = APP.connections[name][type];
        if (!SFC.DATA.isValid(APP.schemas['connectionData'], data)) {
            SFC.LOG.error('Connection data for "' + name + '" is not valid', data);
            pass = false;
        }
        var id = APP.generateUUIDv4();
        var socketData = {
            url: 'wss://' + data.ip + ':' + data.port,
            uniqueName: name + '-' + type,
            id: id
        };
        if (arrayBuffer) {
            socketData.binaryType = 'arraybuffer';
        } else {
            socketData.binaryType = 'blob';
        }
        if (!SFC.DATA.isValid(SFC.WEBSOCKET.schemas['createSocket'], socketData)) {
            SFC.LOG.error('Data schema to create socket is not valid', socketData);
            pass = false;
        }
        if (pass) {
            response = SFC.WEBSOCKET.createAndAdd(socketData);
        }

        // TODO: Move to listener function
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'shortcut-toggled', function (id) {
            if (undefined === SHORTCUTS[id].isUI) {
                APP.websocket.send(JSON.stringify({
                    action: 'shortcut',
                    data: { id: id }
                }));
            }
        });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'mouse-left-click', function () {
            APP.websocket.send(JSON.stringify({
                action: 'mouse_left_click',
                data: {}
            }));
        });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'mouse-right-click', function () {
            APP.websocket.send(JSON.stringify({
                action: 'mouse_right_click',
                data: {}
            }));
        });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'mouse-wheel-scroll', function (wheel) {
            // TODO: Confirm data is accurate (wheel.x|y)
            APP.websocket.send(JSON.stringify({
                action: 'mouse_wheel_scroll',
                data: wheel
            }));
        });
        // APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'setting-toggled', function (id) {
        //
        // });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-signal', function (data) {
            // TODO: All websocket commands should go through SFC.WEBSOCKET please
            SFC.WEBSOCKET.sendCommand(APP.websocket, JSON.stringify({
                action: 'peer_answer',
                data: { signal: data.latestSignal, _uuid: data._uuid }
            }));
        });
        // TODO: Peer connect here is not the same for HTML/CANVAS/3D as it is for ELECTRON. Might need to split this out
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-connect', function (peer) {
            if (APP.connection.type !== 'pty') {
                APP.websocket.send(JSON.stringify({
                   action: 'get_sources',
                   data: {_uuid: peer._uuid}
                }));
            }
        });

        return response;
    },

    generateUUIDv4: function () {
        APP.uuids.v4 = SFC.UUID.generatev4(APP.uuids.v4);
        return SFC.FUNC.getLastElementFromArray(APP.uuids.v4);
    },

    getMemoized: function (fnName) {
        if (!SFC.FUNC.isInObject(APP.memoize, fnName)) {
            var args = [];
            for (var i = 0; i < arguments.length; ++i) {
                if (i >= 2) {
                    args.push(arguments[i]);
                }
            }
            var value = false;
            value = APP[fnName].apply(this, args);
            APP.memoize = SFC.FUNC.appendToObject(APP.memoize, fnName, value);
        }
        return APP.memoize[fnName];
    },

    gcd: function (a, b) {
        if (b > a) {
            temp = a;
            a = b;
            b = temp
        }
        while (b != 0) {
            m = a % b;
            a = b;
            b = m;
        }
        return a;
    },
    ratio: function (x, y) {
        var c = APP.gcd(x, y);
        //return "" + (x / c) + ":" + (y / c)
        return [(x / c), (y / c)];
    },
    setupNewPeer: function (_uuid) {
        var p = new SimplePeer({initiator: false, trickle: false});
        p._uuid = _uuid;
        p._streams = [];
        p.latestSignal = false;
        p.latestData = false;
        p.on('error', function (error) {
            SFC.LOG.error('peer error', error);
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-error', this);
        });
        p.on('signal', function (data) {
            SFC.LOG.info('peer signal', data);
            this.latestSignal = data;
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-signal', this);
        });
        p.on('connect', function () {
            SFC.LOG.info('peer connected');
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-connect', this);
        });
        p.on('data', function (data) {
            SFC.LOG.info('peer data', data);
            this.latestData = data;
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-data', this);
        });
        p.on('stream', function (stream) {
            // TODO: Properly handle multiple streams
            this._streams.push(stream);
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-stream', this);
        });

        return p;
    },
    toggleShortcut: function (id) {
        for (var i in SHORTCUTS) {
            if (id === i) {
                if (SHORTCUTS[i].value) {
                    SHORTCUTS[i].value = false;
                } else {
                    SHORTCUTS[i].value = true;
                }
                APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'shortcut-toggled', id);
                break;
            }
        }
    },
    toggleSetting: function (id) {
        for (var i in SETTINGS) {
            if (id === i) {
                if (SETTINGS[i].value) {
                    SETTINGS[i].value = false;
                } else {
                    SETTINGS[i].value = true;
                }
                APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'setting-toggled', id);
                break;
            }
        }
    }
};
