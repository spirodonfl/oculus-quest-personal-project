if (
    (
        function sfcLoad () {
            if (!SFC) {
                throw new Error('SFC not loaded');
            }
            return true;
        }
    )()
) {
    SFC.LOG = {
        bus: false,
        messages: [],
        errors: [],
        infos: [],
        to: { file: false, console: true },
        capture: { messages: true, errors: true, infos: true },
        error: function (message, data) {
            if (SFC.LOG.capture.errors) {
                if (SFC.LOG.to.console) {
                    console.error(message, data);
                }
                if (SFC.LOG.to.file) {
                    var fs = require('fs');
                    fs.appendFile('error.txt', JSON.stringify({message, data}), function () {});
                }
                SFC.LOG.errors.push({message, data});
                if (SFC.LOG.errors.length >= 100) {
                    SFC.LOG.errors.shift();
                }
            }
            if (SFC.EVENTS !== undefined) {
                SFC.LOG.bus = SFC.EVENTS.emitEvent(SFC.LOG.bus, 'new-error', {message, data});
            }
        },
        message: function (message, data) {
            if (SFC.LOG.capture.messages) {
                if (SFC.LOG.to.console) {
                    console.log(message, data);
                }
                if (SFC.LOG.to.file) {
                    var fs = require('fs');
                    fs.appendFile('message.txt', JSON.stringify({message, data}), function () {});
                }
                SFC.LOG.messages.push({message, data});
                if (SFC.LOG.messages.length >= 100) {
                    SFC.LOG.messages.shift();
                }
            }
            if (SFC.EVENTS !== undefined) {
                SFC.LOG.bus = SFC.EVENTS.emitEvent(SFC.LOG.bus, 'new-message', {message, data});
            }
        },
        info: function (message, data) {
            if (SFC.LOG.capture.infos) {
                if (SFC.LOG.to.console) {
                    console.info(message, data);
                }
                if (SFC.LOG.to.file) {
                    var fs = require('fs');
                    fs.appendFile('info.txt', JSON.stringify({message, data}), function () {});
                }
                SFC.LOG.infos.push({message, data});
                if (SFC.LOG.infos.length >= 100) {
                    SFC.LOG.infos.shift();
                }
            }
            if (SFC.EVENTS !== undefined) {
                SFC.LOG.bus = SFC.EVENTS.emitEvent(SFC.LOG.bus, 'new-info', {message, data});
            }
        }
    };
}
