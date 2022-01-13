// TODO: Handle states like on/off
var STYLES = {
    color: {
        purple: 'rgb(173 154 217)',
        green: 'rgb(120, 120, 66)',
        blue: 'rgb(75, 129, 139)',
        grayish: 'rgb(150, 150, 150)',
        blueTwo: 'rgb(0 192 201)'
    },
    settingButton: {
        default: {
            display: 'inline-block',
            padding: 5,
            color: 'rgb(80, 80, 80)',
            border: '2px solid rgb(80, 80, 80)',
            borderRadius: 5,
            margin: 2
        },
        on: {
            border: '2px solid rgb(238, 119, 140)',
            color: 'rgb(238, 119, 140)'
        }
    },
    shortcutButton: {
        default: {
            display: 'inline-block',
            padding: 5,
            color: 'rgb(80, 80, 80)',
            border: '2px solid rgb(80, 80, 80)',
            borderRadius: 5,
            margin: 2
        },
        on: {
            border: '2px solid rgb(211, 194, 153)',
            color: 'rgb(211, 194, 153)'
        }
    },
    settingsBarWrapper: {
        default: {
            position: 'absolute',
            width: 300,
            height: 80,
            padding: 20,
            backgroundColor: 'rgba(0, 0, 0, 1)',
            whiteSpace: 'nowrap',
            overflowY: 'hidden',
            display: 'none'
        }
    },
    trackpad: {
        default: {
            width: 240,
            height: 280,
            position: 'absolute',
            backgroundStyle: 'rgba(200, 200, 200, 0.3)',
            padding: 20,
            paddingBottom: 30,
            top: 0,
            zIndex: 2,
            display: 'none'
        },
        on: {
            display: 'block'
        },
        off: {
            display: 'none'
        }
    },
    video: {
        default: { zIndex: 1 }
    },

    // TODO: This should get moved to SFC.STYLES
    getParsedStyle: function (name, state) {
        var parsedStyle = {};
        if (STYLES[name]) {
            var _styles = STYLES[name].default;
            if (state) {
                _styles = STYLES[name][state];
                // TODO: Confirm it exists
            }
            for (var i in _styles) {
                var value = _styles[i];
                if (i === 'width') {
                    parsedStyle[i] = value + 'px';
                } else if (i === 'height') {
                    parsedStyle[i] = value + 'px';
                } else if (i === 'padding') {
                    parsedStyle[i] = value + 'px';
                } else if (i === 'paddingBottom') {
                    parsedStyle[i] = value + 'px';
                } else if (i === 'top') {
                    parsedStyle[i] = value + 'px';
                } else if (i === 'borderRadius') {
                    parsedStyle[i] = value + 'px';
                } else if (i === 'margin') {
                    parsedStyle[i] = value + 'px';
                } else {
                    parsedStyle[i] = value;
                }
            }
        }
        return parsedStyle;
    },

    applyStyleToElement: function (style, element) {
        for (var i in style) {
            element.style[i] = style[i];
        }
    }
};
