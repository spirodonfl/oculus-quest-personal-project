/**
 * Events
 *
 * This can live on its own because the only thing you need to do to attach events to a custom
 * component is give it a bus object and pass that into the functions. Therefore, you never
 * have to create a copy of this object and this can just stay as it is.
 */

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
    SFC.EVENTS = {
        bus: {},

        emitEvent: function (bus, name, data) {
            var _ = SFC.FUNC.cloneObject(bus);
            if (SFC.FUNC.isInObject(_, name)) {
                for (var i = 0; i < _[name].length; ++i) {
                    _[name][i](data);
                }
            }
            var onceName = name + ':once';
            if (SFC.FUNC.isInObject(_, onceName)) {
                for (var i = 0; i < _[onceName].length; ++i) {
                    _[onceName][i](data);
                }
                delete _[onceName];
            }
            return _;
        },

        listenToEvent: function (bus, name, callback) {
            var _ = SFC.FUNC.cloneObject(bus);
            _ = SFC.FUNC.appendToObject(_, name, []);
            // callback = function cb(data) { console.log(data); }
            _[name] = SFC.FUNC.appendToArray(_[name], callback);
            return _;
        },

        stopListeningToEvent: function (bus, name, callback) {
            var keysToRemove = [];
            for (var i = 0; i < bus[name].length; ++i) {
                if (bus[name][i] === callback) {
                    keysToRemove.push(i);
                }
            }
            var _ = SFC.FUNC.cloneObject(bus);
            for (var i = 0; i < keysToRemove.length; ++i) {
                // TODO: WRONG! This will remove the wrong keys because, after you remove the first one, the indexes are out of whack. Might need UUIDs here
                _[name] = removeFromArray(_[name], keysToRemove[i]);
            }
            return _;
        },

        listenToEventOnce: function (bus, name, callback) {
            var onceName = name + ':once';
            var _ = SFC.FUNC.cloneObject(bus);
            _ = SFC.FUNC.appendToObject(_, onceName, []);
            // callback = function cb(data) { console.log(data); }
            _[onceName] = SFC.FUNC.appendToArray(_[onceName], callback);
            return _;
        },

        stopAllEventListeners: function (bus, name) {
            var onceName = name + ':once';
            var _ = SFC.FUNC.cloneObject(bus);
            if (SFC.FUNC.isInObject(bus, name)) {
                delete _[name];
            }
            if (SFC.FUNC.isInObject(bus, onceName)) {
                delete _[onceName];
            }
            return _;
        }
    }
}
