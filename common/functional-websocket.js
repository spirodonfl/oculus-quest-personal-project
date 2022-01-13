
if (
    (
        function sfcLoad () {
            if (!SFC) {
                throw new Error('SFC not loaded');
            }
            if (!SFC.LOG) {
                throw new Error('SFC Log not loaded');
            }
            if (!SFC.throwError) {
                throw new Error('SFC Error not loaded');
            }
            return true;
        }
    )()
) {
    SFC.WEBSOCKET = {
        bus: [],
        sockets: [],
        schemas: {
            createSocket: {
                binaryType: {
                    is: 'string',
                    required: false,
                    example: 'arraybuffer'
                },
                url: {
                    is: 'string',
                    required: true
                },
                id: {
                    is: 'mixed',
                    required: true,
                    example: 'MSI'
                },
                uniqueName: {
                    is: 'string',
                    required: true,
                    example: 'uhg6t6r5w3w'
                }
            }
        },
        defaultOnOpen: function (socket) {
            SFC.LOG.message('Socket connection open', socket._getInfo());
            if (SFC.EVENTS !== undefined) {
                SFC.WEBSOCKET.bus = SFC.EVENTS.emitEvent(SFC.WEBSOCKET.bus, 'websocket-open', {
                    socketInfo: socket._getInfo()
                });
            }
        },
        defaultOnClose: function (socket) {
            SFC.LOG.message('Socket connection closed', socket._getInfo());
            SFC.WEBSOCKET.destroy(SFC.WEBSOCKET.sockets, socket);
            if (SFC.EVENTS !== undefined) {
                SFC.WEBSOCKET.bus = SFC.EVENTS.emitEvent(SFC.WEBSOCKET.bus, 'websocket-close', {
                    socketInfo: socket._getInfo()
                });
            }
        },
        defaultOnError: function (socket, err) {
            var dataObject = { err: err };
            dataObject = SFC.FUNC.mergeObjects(dataObject, socket._getInfo());
            SFC.LOG.error('Socket connection error', dataObject);
            if (SFC.EVENTS !== undefined) {
                SFC.WEBSOCKET.bus = SFC.EVENTS.emitEvent(SFC.WEBSOCKET.bus, 'websocket-error', {
                    error: err,
                    socketInfo: socket._getInfo()
                });
            }
        },
        defaultOnMessage: function (socket, message) {
            SFC.LOG.message('Remote message received', [socket._getInfo(), message]);
            if (SFC.EVENTS !== undefined) {
                SFC.WEBSOCKET.bus = SFC.EVENTS.emitEvent(SFC.WEBSOCKET.bus, 'websocket-message', {
                    message: message,
                    socketInfo: socket._getInfo()
                });
            }
        },
        addSocketToArray: function (socketsArray, socket) {
            // We cannot clone sockets array.
            // There's no sensible way to clone the sockets in the array so we *have* to change by reference
            var exists = false;
            for (var i = 0; i < socketsArray.length; ++i) {
                if (socketsArray[i]._id === socket._id && socketsArray[i]._uniqueName === socket._uniqueName) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                socketsArray.push(socket);
            }
            return socketsArray;
        },
        removeSocketFromArray: function (socketsArray, socket) {
            for (var i = 0; i < socketsArray.length; ++i) {
                if (socketsArray[i]._id === socket._id && socketsArray[i]._uniqueName === socket._uniqueName) {
                    delete socketsArray[i];
                    break;
                }
            }
            socket = null;
            return socketsArray;
        },
        destroy: function (socketsArray, socket) {
            // TODO: Do the whole cloneobject thing
            socket.close();
            socketsArray = this.removeSocketFromArray(socketsArray, socket);
            return socketsArray;
        },
        getSocketById: function (socketsArray, socketId) {
            for (var i = 0; i < socketsArray.length; ++i) {
                if (socketsArray[i].id === socketId) {
                    return socketsArray[i];
                }
            }
            return false;
        },
        create: function (data) {
            // Assumptions: data is validated
            var socket = new WebSocket(data.url);
            if (data.binaryType === 'arraybuffer') {
                socket.binaryType = 'arraybuffer';
            }
            socket._id = data.id;
            socket._uniqueName = data.uniqueName;
            socket._getInfo = function () {
                return {
                    id: this._id,
                    uniqueName: this._uniqueName
                }
            };
            
            socket.addEventListener('open', function () { SFC.WEBSOCKET.defaultOnOpen(this); });
            socket.addEventListener('close', function () { SFC.WEBSOCKET.defaultOnClose(this); });
            socket.addEventListener('error', function (err) { SFC.WEBSOCKET.defaultOnError(this, err); });
            socket.addEventListener('message', function (message) { SFC.WEBSOCKET.defaultOnMessage(this, message); });

            return socket;
        },
        createAndAdd: function (data) {
            var socket = SFC.WEBSOCKET.create(data);
            // TODO: Make sure we have no socket of type data.uniqueName
            SFC.WEBSOCKET.sockets = SFC.WEBSOCKET.addSocketToArray(SFC.WEBSOCKET.sockets, socket);
            return socket;
        },
        sendCommand: function (socket, command) {
            if (SFC.FUNC.isArray(command) || SFC.FUNC.isObject(command)) {
                socket.send(JSON.stringify(command));
            } else if (SFC.FUNC.isString(command)) {
                socket.send(command);
            } else {
                SFC.LOG.error('Could not properly validate "command" for socket command');
                return false;
            }
            return true;
        },
        // TODO: We should *not need* whenReady. Figure that out. Apparently, some sockets close abruptly and that's the cause
        whenReadyInterval: false,
        whenReady: function (socket, callback) {
            if (socket.readyState !== 1) {
                SFC.WEBSOCKET.whenReadyInterval = setInterval(function () {
                    SFC.WEBSOCKET.whenReady(socket, callback);
                }, 500);
            } else {
                clearInterval(SFC.WEBSOCKET.whenReadyInterval);
                SFC.WEBSOCKET.whenReadyInterval = false;
                callback(socket);
            }
        }
    }
}
