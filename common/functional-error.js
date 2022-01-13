if (
    (
        function sfcLoad () {
            if (!SFC) {
                throw new Error('SFC not loaded');
            }
            if (!SFC.LOG) {
                throw new Error('SFC Log not loaded');
            }
            return true;
        }
    )()
) {
    SFC.throwError = function (message, data) {
        SFC.LOG.error(message, data);
        // NOTE: Remember that this interrupts and stops any further executions
        throw new Error(message, data);
    }
}
