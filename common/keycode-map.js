var KEYCODE_MAP = [
    {
        keyCode: 8,
        code: "Backspace",
        key: "Backspace",
        short: "BS",
        to: {
            robotjs: "backspace"
        }
    },
    {
        keyCode: 9,
        code: "Tab",
        key: "Tab",
        to: {
            robotjs: "tab"
        }
    },
    {
        keyCode: 10,
        code: "Enter",
        key: "Enter",
        short: ">>>",
        to: {
            robotjs: "enter"
        }
    },
    {
        keyCode: 16,
        code: "ShiftLeft",
        key: "Shift",
        short: "SL",
        isModifier: true,
        to: {
            robotjs: "shift"
        }
    },
    {
        keyCode: 16,
        code: "ShiftRight",
        key: "Shift",
        short: "SR",
        isModifier: true,
        to: {
            robotjs: "right_shift"
        }
    },
    {
        keyCode: 17,
        code: "ControlLeft",
        key: "Control",
        short: "CL",
        isModifier: true,
        to: {
            robotjs: "control"
        }
    },
    {
        keyCode: 18,
        code: "AltLeft",
        key: "Alt",
        isModifier: true,
        to: {
            robotjs: "alt"
        }
    },
    {
        keyCode: 18,
        code: "AltRight",
        key: "Alt",
        isModifier: true,
        to: {
            robotjs: "alt"
        }
    },
    {
        keyCode: 19,
        code: "PauseBreak",
        key: "PauseBreak",
        short: "PB",
        to: {}
    },
    {
        keyCode: 20,
        code: "CapsLock",
        key: "CapsLock",
        short: "Caps",
        to: {}
    },
    {
        keyCode: 27,
        code: "Escape",
        key: "Escape",
        short: "Esc",
        to: {
            robotjs: "escape"
        }
    },
    {
        keyCode: 32,
        code: "Space",
        key: " ",
        to: {
            robotjs: "space"
        }
    },
    {
        keyCode: 33,
        code: "PageUp",
        key: "PageUp",
        short: "Pup",
        to: {
            robotjs: "pageup"
        }
    },
    {
        keyCode: 34,
        code: "PageDown",
        key: "PageDown",
        short: "Pdown",
        to: {
            robotjs: "pagedown"
        }
    },
    {
        keyCode: 35,
        code: "End",
        key: "End",
        to: {
            robotjs: "end"
        }
    },
    {
        keyCode: 36,
        code: "Home",
        key: "Home",
        to: {
            robotjs: "home"
        }
    },
    {
        keyCode: 37,
        code: "ArrowLeft",
        key: "ArrowLeft",
        short: "<",
        to: {
            robotjs: "left"
        }
    },
    {
        keyCode: 38,
        code: "ArrowUp",
        key: "ArrowUp",
        short: "^",
        to: {
            robotjs: "up"
        }
    },
    {
        keyCode: 39,
        code: "ArrowRight",
        key: "ArrowRight",
        short: ">",
        to: {
            robotjs: "right"
        }
    },
    {
        keyCode: 40,
        code: "ArrowDown",
        key: "ArrowDown",
        short: "down",
        to: {
            robotjs: "down"
        }
    },
    {
        keyCode: 45,
        code: "Insert",
        key: "Insert",
        short: "Ins",
        to: {
            robotjs: "insert"
        }
    },
    {
        keyCode: 46,
        code: "Delete",
        key: "Delete",
        short: "Del",
        to: {
            robotjs: "delete"
        }
    },
    {
        keyCode: 48,
        code: "Digit0",
        key: "0",
        to: {
            robotjs: "0"
        }
    },
    {
        keyCode: 49,
        code: "Digit1",
        key: "1",
        to: {
            robotjs: "1"
        }
    },
    {
        keyCode: 50,
        code: "Digit2",
        key: "2",
        to: {
            robotjs: "2"
        }
    },
    {
        keyCode: 51,
        code: "Digit3",
        key: "3",
        to: {
            robotjs: "3"
        }
    },
    {
        keyCode: 52,
        code: "Digit4",
        key: "4",
        to: {
            robotjs: "4"
        }
    },
    {
        keyCode: 53,
        code: "Digit5",
        key: "5",
        to: {
            robotjs: "5"
        }
    },
    {
        keyCode: 54,
        code: "Digit6",
        key: "6",
        to: {
            robotjs: "6"
        }
    },
    {
        keyCode: 55,
        code: "Digit7",
        key: "7",
        to: {
            robotjs: "7"
        }
    },
    {
        keyCode: 56,
        code: "Digit8",
        key: "8",
        to: {
            robotjs: "8"
        }
    },
    {
        keyCode: 57,
        code: "Digit9",
        key: "9",
        to: {
            robotjs: "9"
        }
    },
    {
        keyCode: 65,
        code: "KeyA",
        key: "a",
        to: {
            robotjs: "a"
        }
    },
    {
        keyCode: 66,
        code: "KeyB",
        key: "b",
        to: {
            robotjs: "b"
        }
    },
    {
        keyCode: 67,
        code: "KeyC",
        key: "c",
        to: {
            robotjs: "c"
        }
    },
    {
        keyCode: 68,
        code: "KeyD",
        key: "d",
        to: {
            robotjs: "d"
        }
    },
    {
        keyCode: 69,
        code: "KeyE",
        key: "e",
        to: {
            robotjs: "e"
        }
    },
    {
        keyCode: 70,
        code: "KeyF",
        key: "f",
        to: {
            robotjs: "f"
        }
    },
    {
        keyCode: 71,
        code: "KeyG",
        key: "g",
        to: {
            robotjs: "g"
        }
    },
    {
        keyCode: 72,
        code: "KeyH",
        key: "h",
        to: {
            robotjs: "h"
        }
    },
    {
        keyCode: 73,
        code: "KeyI",
        key: "i",
        to: {
            robotjs: "i"
        }
    },
    {
        keyCode: 74,
        code: "KeyJ",
        key: "j",
        to: {
            robotjs: "j"
        }
    },
    {
        keyCode: 75,
        code: "KeyK",
        key: "k",
        to: {
            robotjs: "k"
        }
    },
    {
        keyCode: 76,
        code: "KeyL",
        key: "l",
        to: {
            robotjs: "l"
        }
    },
    {
        keyCode: 77,
        code: "KeyM",
        key: "m",
        to: {
            robotjs: "m"
        }
    },
    {
        keyCode: 78,
        code: "KeyN",
        key: "n",
        to: {
            robotjs: "n"
        }
    },
    {
        keyCode: 79,
        code: "KeyO",
        key: "o",
        to: {
            robotjs: "o"
        }
    },
    {
        keyCode: 80,
        code: "KeyP",
        key: "p",
        to: {
            robotjs: "p"
        }
    },
    {
        keyCode: 81,
        code: "KeyQ",
        key: "q",
        to: {
            robotjs: "q"
        }
    },
    {
        keyCode: 82,
        code: "KeyR",
        key: "r",
        to: {
            robotjs: "r"
        }
    },
    {
        keyCode: 83,
        code: "KeyS",
        key: "s",
        to: {
            robotjs: "s"
        }
    },
    {
        keyCode: 84,
        code: "KeyT",
        key: "t",
        to: {
            robotjs: "t"
        }
    },
    {
        keyCode: 85,
        code: "KeyU",
        key: "u",
        to: {
            robotjs: "u"
        }
    },
    {
        keyCode: 86,
        code: "KeyV",
        key: "v",
        to: {
            robotjs: "v"
        }
    },
    {
        keyCode: 87,
        code: "KeyW",
        key: "w",
        to: {
            robotjs: "w"
        }
    },
    {
        keyCode: 88,
        code: "KeyX",
        key: "x",
        to: {
            robotjs: "x"
        }
    },
    {
        keyCode: 89,
        code: "KeyY",
        key: "y",
        to: {
            robotjs: "y"
        }
    },
    {
        keyCode: 90,
        code: "KeyZ",
        key: "z",
        to: {
            robotjs: "z"
        }
    },
    {
        keyCode: 91,
        code: "MetaLeft",
        key: "Meta",
        to: {
            robotjs: "command"
        }
    },
    {
        keyCode: 112,
        code: "F1",
        key: "F1",
        to: {
            robotjs: "f1"
        }
    },
    {
        keyCode: 113,
        code: "F2",
        key: "F2",
        to: {
            robotjs: "f2"
        }
    },
    {
        keyCode: 114,
        code: "F3",
        key: "F3",
        to: {
            robotjs: "f3"
        }
    },
    {
        keyCode: 115,
        code: "F4",
        key: "F4",
        to: {
            robotjs: "f4"
        }
    },
    {
        keyCode: 116,
        code: "F5",
        key: "F5",
        to: {
            robotjs: "f5"
        }
    },
    {
        keyCode: 117,
        code: "F6",
        key: "F6",
        to: {
            robotjs: "f6"
        }
    },
    {
        keyCode: 118,
        code: "F7",
        key: "F7",
        to: {
            robotjs: "f7"
        }
    },
    {
        keyCode: 119,
        code: "F8",
        key: "F8",
        to: {
            robotjs: "f8"
        }
    },
    {
        keyCode: 120,
        code: "F9",
        key: "F9",
        to: {
            robotjs: "f9"
        }
    },
    {
        keyCode: 121,
        code: "F10",
        key: "F10",
        to: {
            robotjs: "f10"
        }
    },
    {
        keyCode: 122,
        code: "F11",
        key: "F11",
        to: {
            robotjs: "f11"
        }
    },
    {
        keyCode: 123,
        code: "F12",
        key: "F12",
        to: {
            robotjs: "f12"
        }
    },
    {
        keyCode: 186,
        code: "Semicolon",
        key: ";",
        short: ";|:",
        to: {
            robotjs: ";"
        }
    },
    {
        keyCode: 186,
        code: "Semicolon",
        key: ":",
        short: ";|:",
        to: {
            robotjs: ":"
        }
    },
    {
        keyCode: 187,
        code: "Equal",
        key: "=",
        short: "=/+",
        to: {
            robotjs: "="
        }
    },
    {
        keyCode: 187,
        code: "Equal",
        key: "+",
        short: "=/+",
        to: {
            robotjs: "+"
        }
    },
    {
        keyCode: 188,
        code: "Comma",
        key: ",",
        short: ",|<",
        to: {
            robotjs: ","
        }
    },
    {
        keyCode: 188,
        code: "Comma",
        key: "<",
        short: ",|<",
        to: {
            robotjs: "<"
        }
    },
    {
        keyCode: 189,
        code: "Minus",
        key: "-",
        short: "-/_",
        to: {
            robotjs: "-"
        }
    },
    {
        keyCode: 189,
        code: "Minus",
        key: "_",
        short: "-/_",
        to: {
            robotjs: "_"
        }
    },
    {
        keyCode: 190,
        code: "Period",
        key: ".",
        short: ".|>",
        to: {
            robotjs: "."
        }
    },
    {
        keyCode: 190,
        code: "Period",
        key: ">",
        short: ".|>",
        to: {
            robotjs: ">"
        }
    },
    {
        keyCode: 191,
        code: "Slash",
        key: "/",
        short: "/|?",
        to: {
            robotjs: "/"
        }
    },
    {
        keyCode: 191,
        code: "Slash",
        key: "?",
        short: "/|?",
        to: {
            robotjs: "?"
        }
    },
    {
        keyCode: 219,
        code: "BracketLeft",
        key: "[",
        short: "[/{",
        to: {
            robotjs: "["
        }
    },
    {
        keyCode: 219,
        code: "BracketLeft",
        key: "{",
        short: "[/{",
        to: {
            robotjs: "{"
        }
    },
    {
        keyCode: 220,
        code: "Backslash",
        key: "\\",
        short: "\\||",
        to: {
            robotjs: "\\"
        }
    },
    {
        keyCode: 220,
        code: "Backslash",
        key: "|",
        short: "\\||",
        to: {
            robotjs: "|"
        }
    },
    {
        keyCode: 221,
        code: "BracketRight",
        key: "]",
        short: "]/}",
        to: {
            robotjs: "]"
        }
    },
    {
        keyCode: 221,
        code: "BracketRight",
        key: "}",
        short: "]/}",
        to: {
            robotjs: "}"
        }
    },
    {
        keyCode: 222,
        code: "Quote",
        key: "'",
        short: "'|\"",
        to: {
            robotjs: "'"
        }
    },
    {
        keyCode: 222,
        code: "Quote",
        key: "\"",
        short: "'|\"",
        to: {
            robotjs: "\""
        }
    },
];
