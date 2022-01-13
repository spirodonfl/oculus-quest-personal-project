/**
 * State machine
 */
/*
var __exampleStateBus = {
    previousState: null,
    currentState: 'uninitialized',
    states: {
        uninitialized: {},
        initialized: {
            _canTransition: function (from) {
                if (from === 'uninitialized') {
                    return true;
                }
                return false;
            },
            _onEnter: function (data) {
                // Does not need to return anything
            },
            _onExit: function (data) {
                console.log('exit', data);
                // Does not need to return anything
            },
            customFunction: function (data) {
                console.log('In custom function: ', data);
                // transitionStateTo(...);
            }
        }
    }
};
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
    SFC.FSM = {
        bus: {},
        addState: function (bus, name, state) {
            // Assumptions: validated that state has _canTransition, _onEnter and _onExit functions
            var _ = SFC.FUNC.cloneObject(bus);
            _ = SFC.FUNC.appendToObject(_.states, name, state);
            return _;
        },
        handleStateAction: function (bus, state, action) {
            // Assumptions: bus.states has state, bus.states[state] has action
            // TODO: Can we make this a function?
            // Any time with deal with the "arguments" keyword, we MUST pass it to a local variable
            // If we don't, it's actually not passable as an argument to other functions
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; ++_key) {
                args[_key] = arguments[_key];
            }
            args = args.slice(3, args.length);
            return bus.states[state][action].apply(this, args);
        },
        transitionStateTo: function (bus, from, to, data) {
            // Assumptions: same as handleStateAction plus data is validated and we can actually transition to this
            // NOTE: Keeping this here as an example of how to use tryCatch
            /*function run (bus, from, to, data) {
                var _ = cloneObject(bus);
                if (!handleStateAction(_, to, '_canTransition', from)) {
                    throwError('Could not transition state from "' + from + '" to "' + to + '"');
                    return {};
                }
                handleStateAction(_, from, '_onExit', data);
                handleStateAction(_, to, '_onEnter', data);
                _.previousState = from;
                _.currentState = to;
                return _;
            }
            return tryCatch(run, defaultTryCatchFail).apply(null, arguments);*/
            var _ = SFC.FUNC.cloneObject(bus);
            _.previousState = from;
            _.currentState = to;
            return _;
        }
    }
}
