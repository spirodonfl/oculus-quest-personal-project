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
    SFC.HTML = {
        // TODO: Add memoization
        geid: function (id) {
            return document.getElementById(id);
        },
        gecn: function (name) {
            return document.getElementsByClassName(name);
        },
        getn: function (name) {
            return document.getElementsByTagName(name);
        },
        // example: getComputedStyle(document.body)
        gcs: function (element) {
            return getComputedStyle(element);
        },
        // example: getPropertyValue('--some-custom-css-var');
        gpv: function (computedStyle, name) {
            return computedStyle.getPropertyValue(name);
        },
        // example: setProperty('--some-customer-css-var', 280);
        sp: function (element, name, value) {
            element.style.setProperty(name, value);
        }
    };
}
