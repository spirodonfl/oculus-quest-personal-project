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
    var __example_schemas = {
        keyFourSchema: {
            is: 'bool'
        },
        randoDataSchema: {
            is: 'object', // or array or string or whatever
            lengths: { eq: 123, min: 10, max: 10 }, // TODO: ?? do we need this
            value: {
                keyOne: { is: 'string', required: true },
                keyTwo: { is: 'int', required: true },
                keyThree: { is: 'bool' },
                keyFour: this.keyFourSchema
            }
        },
        anotherRando: {
            is: 'array',
            length: {
                eq: 123,
                min: 10,
                max: 100
            },
            value: {
                eq: [1, 2, 3],
                oo: [[1, 2, 3], [4, 5, 6]],
                // neq
                // noo
                cn: [2, 4] // TODO: how about contains AND/OR with combos of each
            }
        },
        asInteger: {
            is: 'integer',
            value: {
                eq: 123,
                oo: [23, 41, 123],
                // neq
                // noo
                min: 0,
                max: 100
            }
        },
        asBool: {
            is: 'bool',
            value: { eq: true } // or false
        },
        anotherRando: {
            is: 'string',
            length: {
                eq: 123,
                min: 10, // minimum
                max: 100, // maximum
            },
            value: {
                eq: 'must be this',
                oo: ['could', 'be', 'this', 'or', 'this'], // one of
                neq: 'something',
                noo: ['not', 'of', 'these'], // not one of
                cn: ['some', 'regex', 'here'] // contains
            }
        }
    }
    SFC.DATA = {
        isValid: function (schema, data) {
            // TODO: This
            return true;
        }
    };
}
