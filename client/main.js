
var p = false;
var SPSignal = false;
function setupNewPeer(ws) {
    if (p) { p.destroy(); p = null; }
    p = new SimplePeer({initiator: false, trickle: false});
    p.serverConnected = false;
    p.clientConnected = false;
    p.ws = ws;
    p.on('error', function (error) {
        console.error(error);
    });
    p.on('signal', function (data) {
        console.log('signal', data);
        SPSignal = data;
        SFC.WEBSOCKET.sendCommand(this.ws, JSON.stringify({action: 'peer_answer', data: data}));
    });
    p.on('connect', function () {
        console.log('connected');
        // p.send('Cool!');
    });
    p.on('data', function (data) {
        console.log('data', data);
    });
    p.on('stream', function (stream) {
        console.log('streaming!');
        var video = document.createElement('video');
        video.setAttribute('autoplay', '');
        if ('srcObject' in video) {
            video.srcObject = stream;
        } else {
            video.src = window.URL.createObjectURL(stream);
        }
        video.id = 'rando-video';
        var vt = stream.getVideoTracks()[0];
        console.log(vt);
        console.log(vt.getSettings());
        var w = 1920;
        var h = 1080;
        var ratio = w / h;
        var name = 'MSI' + '-' + 'screen:0:0'.replaceAll(':', '-');
        var theScene = document.querySelector('#the-scene');
        var theAssets = document.querySelector('#the-assets');
        var newImage = document.createElement('img');
        newImage.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D');
        newImage.id = 'source-image-' + name;
        newImage.setAttribute('crossorigin', 'anonymous');
        theAssets.appendChild(newImage);

        theAssets.appendChild(video);
        var newVideo = document.createElement('a-video');
        newVideo.setAttribute('src', '#rando-video');
        newVideo.setAttribute('material', {src: '#rando-video'});
        newVideo.setAttribute('width', (1.6 * ratio));
        newVideo.setAttribute('height', 1.6);
        newVideo.setAttribute('position', {x: 0.10, y: 0, z: 1});
        newVideo.setAttribute('rotation', {x: 65, y: 0, z: 0});
        //theScene.appendChild(newVideo);
        UI.appendElementToEntityWorktable(newVideo);

        for (var i = 0; i < UI.sourceElements.length; ++i) {
            var sourceElement = UI.sourceElements[i];
            sourceElement.remove();
        }
        UI.sourceElements = [];

        /* WORKING but just a touch slow
        var newCanvas = document.createElement('canvas');
        newCanvas.id = 'source-canvas-' + name;
        newCanvas.width = w;
        newCanvas.height = h;
        var newCtx = newCanvas.getContext('2d');
        theAssets.appendChild(newCanvas);
        var newPlane = document.createElement('a-plane');
        newPlane.setAttribute('id', 'source-plane-' + name);
        newPlane.setAttribute('width', 5);
        newPlane.setAttribute('height', 5);
        //newPlane.setAttribute('imgSrc', '#source-image-'+ name);
        // newPlane.setAttribute('material', {side: 'double', src: '#source-image-'+name});
        newPlane.setAttribute('material', {src: '#source-canvas-'+name});
        // newPlane.setAttribute('auto-update-image', '');
        newPlane.setAttribute('draw-canvas', '');
        theScene.appendChild(newPlane);
        setInterval(function () {
    //newPlane.setAttribute('material', {src: '#source-canvas-'+name});
            newCtx.drawImage(video, 0, 0, w, h);
            //newImage.setAttribute('src', newCanvas.toDataURL('image/png'));
        }, 250);*/
    });
}

var APP_EVENT_BUS = false;

// TODO: Probably move this to APP
var MODES = {
    remoteMouseActive: false,
    remoteKeyboardActive: false,
    focusedElement: false,
    positioningFocusedElement: false,
    rotatingFocusedElement: false
};

var connectToggle = false;
var mouseToggled = false;
window.addEventListener('load', function () {
    if (undefined === _isAFrameReady || _isAFrameReady === false) {
        UI.bus = SFC.EVENTS.listenToEventOnce(UI.bus, 'aframeIsReady', function () {
            UI.setup();
        });
    } else {
        UI.setup();
    }
});

var TESTS = {
    mysocket: false,
    myrds: false,
    myptysocket: false,
    autoConnectMSI: function () {
        this.mysocket = APP.connectToServer('MSI', 'data');
        SFC.WEBSOCKET.whenReady(this.mysocket, function () {
            document.querySelector('#text-one').setAttribute('value', 'Websocket connected...');
            var cmd = APP.serverCommands.attachToSource({id: 'screen:0:0'});
            if (!SFC.FUNC.isEmptyObject(cmd)) {
                SFC.WEBSOCKET.sendCommand(TESTS.mysocket, cmd);
                //TESTS.mysocket.close();
                TESTS.peerOfferDo();
            }
        });
    },
    one: function () {
        this.mysocket = APP.connectToServer('MSI', 'data');
        var ss = this.mysocket;
        this.mysocket.addEventListener('open', function () {
            SFC.WEBSOCKET.sendCommand(ss, APP.serverCommands.askForListOfSources());
        });
    },
    two: function (sourceId) {
        var cmd = APP.serverCommands.attachToSource({id: sourceId});
        if (!SFC.FUNC.isEmptyObject(cmd)) {
            SFC.WEBSOCKET.sendCommand(this.mysocket, APP.serverCommands.attachToSource({id: sourceId}));
        }
    },
    three: function (sourceId) {
        this.myrds = APP.connectToServer('MSI', 'rds', false);
        var ss = this.myrds;
        handleNewCapture('MSI', 'test', this.myrds);
        this.myrds.addEventListener('open', function () {
            console.log('hooked');
        });
    },
    four: function (sourceId) {
        SFC.WEBSOCKET.sendCommand(this.myrds, APP.serverCommands.attachToSource({id: sourceId}));
    },
    peerOfferDo: function () {
        //this.mysocket = APP.connectToServer('MSI', 'data');
        SFC.WEBSOCKET.whenReady(this.mysocket, function () {
            document.querySelector('#text-one').setAttribute('value', 'Attempting webrtc...');
            SFC.WEBSOCKET.sendCommand(TESTS.mysocket, APP.serverCommands.askForPeerOffer());
        });
        this.mysocket.addEventListener('message', function (m) {
            document.querySelector('#text-one').setAttribute('value', 'Webrtc responded...');
            var data = JSON.parse(m.data);
            console.log(data);
            document.querySelector('#text-one').setAttribute('value', JSON.stringify(data));
            if (data.action === 'ask_for_peer_offer') {
                document.querySelector('#text-one').setAttribute('value', 'Peer offered...');
                p.signal(data.data);
                p.on('signal', function (data) {
                    document.querySelector('#text-one').setAttribute('value', 'signaled...');
                    SFC.WEBSOCKET.sendCommand(TESTS.mysocket, APP.serverCommands.sendPeerAnswer(data));
                });
            }
        });
    },
    peerOfferUpdate: function () {
        this.mysocket.addEventListener('message', function (m) {
            var data = JSON.parse(m.data);
            if (data.action === 'ask_for_peer_offer') {
                p.signal(data.data);
                //p.on('signal', function (data) {
                //    SFC.WEBSOCKET.sendCommand(TESTS.mysocket, APP.serverCommands.sendPeerAnswer(data));
                //});
            }
        });
        SFC.WEBSOCKET.sendCommand(TESTS.mysocket, APP.serverCommands.askForPeerOffer());
    },
    sendKey: function (keyCode) {
        var as = null;
        for (var i = 0; i < KEYCODE_MAP.length; ++i) {
            if (KEYCODE_MAP[i].key === keyCode) {
                as = KEYCODE_MAP[i].to.robotjs;
                break;
            }
        }
        SFC.WEBSOCKET.sendCommand(TESTS.mysocket, APP.serverCommands.sendKeyboardType({key: as}));
    },
    throttle: false,
    sendMouseMoveBy: function (data) {
        if (!TESTS.throttle) {
            TESTS.throttle = true;
            setTimeout(function () {
                SFC.WEBSOCKET.sendCommand(TESTS.mysocket, APP.serverCommands.sendMouseMoveBy(data));
                TESTS.throttle = false;
            }, 500);
        }
    },
    setupTerminal: function () {
        //var term = new Terminal({ cols: 80, rows: 24 });
        //term.open(document.getElementById('canvas-terminal'));
        this.myptysocket = APP.connectToServer('MSI', 'pty');
        var ss = this.myptysocket;
        this.myptysocket.onopen = function () {
            //new attach.attach(term, this);
            var newPlane = document.createElement('a-plane');
            var theScene = document.querySelector('#the-scene');
            newPlane.setAttribute('id', 'xterm');
            newPlane.setAttribute('width', 3);
            newPlane.setAttribute('height', 3);
            theScene.appendChild(newPlane);
            newPlane.setAttribute('xterm', {});
            newPlane.setAttribute('position', {x: 0, y: 0, z: 1});
            newPlane.setAttribute('vr-border', '');
            var xterm = newPlane.components['xterm'];
            this.onmessage = function (data) {
                console.log('poop', data);
                var x = document.getElementById('xterm');
                var xterm = x.components['xterm'];
                xterm.write(data.data);
            };
            this.onclose = function () {
                xterm.write('\r\nConnection closed\r\n');
            };
            newPlane.addEventListener('xterm-data', function (data) {
                console.log('listening', data);
                ss.send(data.detail);
            });
        };
        this.myptysocket.onerror = function (e) {
            console.error(e);
        }
    }
};

/** Keeping this here because we might need this later for canvas stuff
// TODO: Better way to handle these vars
var anImage = false;
var byArea = false; // Works but super slow
var byBlob = false; // Does not really work
var byArray = false; // Works but slow
var previousBytes = false;
var byArrayImageData = false;
function handleNewCapture(server, sourceId, newSocket) {
    var name = server + '-' + sourceId.replaceAll(':', '-');
    var theAssets = document.querySelector('#the-assets');
    var newImage = document.createElement('img');
    newImage.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D');
    //newImage.setAttribute('width', 800);
    //newImage.setAttribute('height', 600);
    newImage.id = 'source-image-' + name;
    newImage.setAttribute('crossorigin', 'anonymous');
    theAssets.appendChild(newImage);
    var newCanvas = document.createElement('canvas');
    newCanvas.id = 'source-canvas-' + name;
    newCanvas.width = 1920;
    newCanvas.height = 1080;
    theAssets.appendChild(newCanvas);
    //newImage.onload = function () {
    //    console.log(this.width, this.height);
    //}
    var theScene = document.querySelector('#the-scene');
    newSocket.counter = 0;
    newSocket.source = name;
    newSocket.image = newImage;
    newSocket.canvas = newCanvas;
    newSocket.canvasCtx = newCanvas.getContext('2d');
    newSocket.addEventListener('message', function message(m) {
        if (!anImage) {
            var newPlane = document.createElement('a-plane');
            newPlane.setAttribute('id', 'source-plane-' + name);
            newPlane.setAttribute('width', 5);
            newPlane.setAttribute('height', 5);
            //newPlane.setAttribute('imgSrc', '#source-image-'+ name);
            newPlane.setAttribute('material', {side: 'double', src: '#source-image-'+name});
            newPlane.setAttribute('auto-update-image', '');
            theScene.appendChild(newPlane);
            anImage = true;
        }
        //m.data = JSON.parse(m.data);
        //console.log(JSON.parse(m.data));
        ++this.counter;
        if (this.counter >= 500) {
            console.log('HIT', this.image);
            this.counter = 0;
        }
        //var data = m.data;
        if (byArea) {
            var d = JSON.parse(m.data);
            var tempImage = new Image();
            tempImage.width = 320;
            tempImage.height = 320;
            tempImage.src = d.data;
            this.canvasCtx.drawImage(tempImage, d.area[0], d.area[1]);
            //this.image.setAttribute('src', this.canvas.toDataURL('image/png'));
            var thisImage = this.image;
            this.canvas.toBlob(function (blob) {
                var url = URL.createObjectURL(blob);
                thisImage.setAttribute('src', url);
            });
        } else if (byBlob) {
            this.image.setAttribute('src', URL.createObjectURL(m.data));
        } else if (byArray) {
            var bytes = new Uint8Array(m.data);
            if (!byArrayImageData) {
                byArrayImageData = this.canvasCtx.createImageData(this.canvas.width, this.canvas.height);
            }
            for (var i = 8; i < byArrayImageData.data.length; ++i) {
                if (byArrayImageData.data[i] !== previousBytes[i]) {
                    byArrayImageData.data[i] = bytes[i];
                }
            }
            this.canvasCtx.putImageData(byArrayImageData, 0, 0);
            this.image.setAttribute('src', this.canvas.toDataURL('image/png'));
            previousBytes = bytes;
            //var thisImage = this.image;
            //this.canvas.toBlob(function (blob) {
            //    var url = URL.createObjectURL(blob);
            //    thisImage.setAttribute('src', url);
                //URL.revokeObjectURL(url);
            //});
        } else {
            var d = JSON.parse(m.data);
            this.image.setAttribute('src', d.data);
        }
    });
}*/

function _manualLoad() {
    document.querySelector('#dummy').load();
}
