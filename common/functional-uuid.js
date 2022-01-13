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
    SFC.UUID = {
        ids: {
            v4: []
        },
        v4: function () {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
                return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
            });
        },
        generatev4: function (array) {
            var _ = SFC.FUNC.cloneArray(array);
            var id = SFC.UUID.v4();
            while (SFC.FUNC.isInArray(_, id)) {
                id = SFC.FUNC.v4();
            }
            _ = SFC.FUNC.appendToArray(_, id);
            return _;
            // Note: Retrieve newest id by going getLastElementFromArray(uuidv4array)
        }
    }
}
