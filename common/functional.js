/**
 * General
 */
var SFC = {
    FUNC: {
        /**
         * Example of currying. A function that returns a function that returns a function.
         * Nothing happens until you get to the last function
         */
        curry: function (fn) {
            return function curried() {
                const args = Array.prototype.slice.call(arguments);
                const done = args.length >= fn.length;
                if (done) {
                    return fn.apply(this, args);
                } else {
                    return function() {
                        const args2 = Array.prototype.slice.call(arguments);
                        return curried.apply(this, args.concat(args2));
                    }
                }
            }
        },
        // The above is akin to
        /*
        function prepareCooking(cook) {
          return function(egg1) {
            return function(egg2) {
              return function(egg3) {
                // HERE
                return function(egg4) {
                  return cook(egg1, egg2, egg3, egg4)
                }
              }
            }
          }
        }
        Where ...
        let collect = start(new Egg())
        collect = collect(new Egg())
        collect = collect(new Egg())
        collect = collect(new Egg())
        // collect === 'served'
        */

        defaultTryCatchFail: function (err, args) {
            return false;
        },

        catcherApply: function (err, catcher, args) {
            return catcher.apply(this, [err, args]);
        },

        tryCatch: function (tryer, catcher) {
            return function tryerCatcher() {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; ++_key) {
                    args[_key] = arguments[_key];
                }

                try {
                    var result = tryer.apply(this, args);
                    return SFC.FUNC.isPromise(result) ? result.catch(function (err) { SFC.FUNC.catcherApply.apply(this, [err, catcher, args]) }) : result;
                } catch (err) {
                    return SFC.FUNC.catcherApply.apply(this, [err, catcher, args]);
                }
            }
        },

        isInt: function (value) {
            return Number.isInteger(value);
        },

        isInArray: function (array, value) {
            return SFC.FUNC.isArray(array) ? array.indexOf(value) >= 0 : false;
        },

        isInObject: function (object, value) {
            return SFC.FUNC.isObject(object) ? object.hasOwnProperty(value) : false;
        },

        cloneObject: function (object) {
            return SFC.FUNC.isObject(object) ? Object.assign({}, object) : {};
        },

        cloneArray: function (array) {
            return SFC.FUNC.isArray(array) ? array.slice() : [];
        },

        ifValueIs: function (value, is) {
            return value === is;
        },

        isObject: function (object) {
            return (typeof object === 'object' && object !== null);
        },

        isEmptyObject: function (object) {
            return (object === {}) ? true : false;
        },

        isEmptyArray: function (array) {
            return (array === []) ? true : false;
        },

        isArray: function (array) {
            return (array.constructor === Array);
        },

        isString: function (string) {
            return (typeof string === 'string' || string instanceof String);
        },

        isPromise: function (value) {
            return (value !== null && typeof value.then === 'function');
        },

        mergeObjects: function (obj1, obj2){
            var obj3 = {};
            // TODO: If isObject ??
            for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
            for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
            return obj3;
        },

        appendToObject: function (object, key, value) {
            // We don't care to compare the object to make sure it succeeded here. Why?
            // What if you pass an empty object? A comparison here would always be true EVEN if cloneObject failed
            // Therefore, we just run the operation. If you care whether or not it worked, do it outside of here
            var _ = SFC.FUNC.cloneObject(object);
            if (!SFC.FUNC.isInObject(_, key)) {
                _[key] = value;
            }
            return _;
        },

        appendToArray: function (array, value) {
            var _ = SFC.FUNC.cloneArray(array);
            _.push(value);
            return _;
        },

        removeFromArray: function (array, key) {
            var _ = SFC.FUNC.cloneArray(array);
            if (SFC.FUNC.isInArray(_, key)) {
                _.splice(key, 1);
            }
            return _;
        },

        getLastElementFromArray: function (array) {
            return array[(array.length - 1)];
        },

        grepFunctionName: function (string) {
            // Example: function abc() { console.log(grepFunctionName(arguments.callee.toString())); }
            var sub = string.substr('function '.length);
            return sub.substr(0, sub.indexOf('('));
        },

        pipe: function () {
            function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }
            var _this = this;

            for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
                fns[_key] = arguments[_key];
            }

            return function (x) {
                var _this2 = this;

                _newArrowCheck(this, _this);

                return fns.reduce(function (v, f) {
                    _newArrowCheck(this, _this2);

                    return f(v);
                }.bind(this), x);
            }.bind(this);
        }
    }
}

