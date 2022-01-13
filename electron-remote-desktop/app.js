var APP = {
    bus: false,
    websocket: false,
    peer: false,
    uuids: {
        v4: []
    },
    memoize: {},
    serverCommands: {
        // ...
    },
    connectToServer: function (arrayBuffer) {
        var response = {};
        var id = APP.generateUUIDv4();
        var socketData = {
            url: 'wss://localhost:9090',
            uniqueName: 'localhost',
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
        response = SFC.WEBSOCKET.createAndAdd(socketData);

        return response;
    },

    // TODO: Common function. Common-ize it somehow?
    generateUUIDv4: function () {
        APP.uuids.v4 = SFC.UUID.generatev4(APP.uuids.v4);
        return SFC.FUNC.getLastElementFromArray(APP.uuids.v4);
    },

    // TODO: Common function. Common-ize it somehow?
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

    setupNewPeer: function (_uuid) {
        var p = new SimplePeer({initiator: true, trickle: false});
        p.latestSignal = false;
        p.latestData = false;
        p.waitForAnswer = false;
        p._uuid = _uuid;
        p._listeningTo = [];
        p.on('error', function (error) {
            SFC.LOG.error('peer error', error);
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-error', {peer: this, error});
        });
        p.on('signal', function (data) {
            SFC.LOG.info('peer signal', data);
            this.latestSignal = data;
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-signal', {peer: this, signal: data});
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
        p.on('close', function () {
            SFC.LOG.info('peer close');
            APP.bus = SFC.EVENTS.emitEvent(APP.bus, 'peer-close', this);
        });

        return p;
    },

    peers: [],
    listenToPeers: function () {
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-connect', function (peer) {});
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-data', function (peer) {});
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-close', function (peer) {});
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-error', function (data) {
            // TODO: When creating new peers per connection, you will need to fix this
            //APP.peer = APP.setupNewPeer();
        });
        APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-signal', function (data) {
            // data.peer && data.data
            SFC.LOG.info('peer signaled', data);
            if (!data.peer.waitForAnswer) {
                data.peer.waitForAnswer = true;
                APP.websocket.send(JSON.stringify({
                    action: 'peer_offer',
                    data: { signal: data.peer.latestSignal, _uuid: data.peer._uuid }
                }));
            } else {
                data.peer.waitForAnswer = false;
            }
        });
    }
};
