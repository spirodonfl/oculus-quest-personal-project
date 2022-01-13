

global.appRoot = window.appRoot = __dirname;
const {ipcRenderer, desktopCapturer, clipboard} = require('electron');
function init() {
    // add global variables to your web page
    window.isElectron = true;
    window.ipcRenderer = ipcRenderer;
    window.desktopCapturer = desktopCapturer;
}
init();


// var fs = require('fs');
// eval(fs.readFileSync('../common/simplepeer.min.js', 'utf8'));
// eval(fs.readFileSync('../common/strings.js', 'utf8'));
// eval(fs.readFileSync('../common/connections.js', 'utf8'));
// eval(fs.readFileSync('../common/functional.js', 'utf8'));
// eval(fs.readFileSync('../common/functional-log.js', 'utf8'));
// eval(fs.readFileSync('../common/functional-error.js', 'utf8'));
// eval(fs.readFileSync('../common/functional-events.js', 'utf8'));
// eval(fs.readFileSync('../common/functional-websocket.js', 'utf8'));
// eval(fs.readFileSync('../common/schemas.js', 'utf8'));
// eval(fs.readFileSync('../common/schemas-data_server.js', 'utf8'));

// var WebSocket = false;
// var APP = {
//     bus: false,
//     websocket: false,
//     listenToWebsocket: function () {
//         SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'error', function (data) {
//             SFC.LOG.error('Websocket error!', data);
//         });
//         SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'close', function (data) {
//             SFC.LOG.error('Websocket close', data);
//         });
//         SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'open', function (data) {
//             SFC.LOG.error('Websocket open', data);

//             // Create a peer now
//             // Listen to when new clients are added and offer a peer
//             // Ask server for list of existing clients and offer them all peer {ask_for_list_of_clients}
//         });
//         SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'message', function (data) {
//             var messageData = JSON.parse(data.message.data);
//         });
//     },
//     listenToPeer: function () {
//         APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-connected', function (peer) {})
//     },
//     connectToServer: function () {
//         var data = {
//             url: 'wss://localhost:8334'
//         };
//         APP.websocket = SFC.WEBSOCKET.create(data);
//     },
//     load: function () {
//         WebSocket = window.WebSocket;

//         APP.listenToWebsocket();
//         APP.listenToPeer();
//         APP.connectToServer();
//     }
// };







/***
// TODO: Check the "add stream" portion later on to see if we actually need this simplepeer instance here
var SPSignal = false;
var SimplePeer = require('../common/simplepeer.min');
var p = [];
// TODO: This is very bad
var currentClient = false;
var tracks = [];
var streams = [];
function setupNewPeer(ws) {
    var newp = new SimplePeer({initiator: true, trickle: false, config: { iceServers: [] }});
    newp.ws = ws;
    newp.on('error', function (error) {
        console.error(error);
    });
    newp.on('close', function () {
        console.log('connection closed');
    });
    newp.on('signal', function (data) {
        console.trace('signal', data);
        SPSignal = data;
        this.ws.send(JSON.stringify({action: 'peer_offer', data: data}));
    });
    newp.on('connect', function () {
        console.log('connected');
        for (var i = 0; i < streams.length; ++i) {
            for (var x = 0; x < tracks.length; ++x) {
                this.addTrack(tracks[x], streams[i]);
            }
        }
        // p.send('Cool!');
    });
    newp.on('data', function (data) {
        console.log('data', data);
    });
    p.push(newp);
    return newp;
}

global.appRoot = window.appRoot = __dirname;
const {ipcRenderer, desktopCapturer, clipboard} = require('electron');

// The good thing about this is that it proves we can load a non-electron built add-on through IPC
const wmc = require('./custom_modules/wmc.node');
function wmcHit() {
    wmc.my_function();
}
function init() {
  // add global variables to your web page
  window.isElectron = true
  window.ipcRenderer = ipcRenderer
  window.wmcHit = wmcHit;
  window.p = p;
}
init();

var fs = require('fs');
var os = require('os');
var platform = os.platform();
var Pty = require('node-pty');

const https = require('https');
const pem = require('https-pem');
const WebSocket = require('ws');
const httpsDesktopCaptureServer = https.createServer(pem);
const httpsDataServer = https.createServer(pem);
const httpsPTYServer = https.createServer(pem);

const defaultSize = 32 * 256;
const perMessageDeflate = {
    zlibDeflateOptions: { // See zlib defaults.
        chunkSize: (defaultSize/2),
        memLevel: 9,
        level: 9
    },
    zlibInflateOptions: {
        chunkSize: 10 * (defaultSize/2)
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    clientMaxWindowBits: 15,       // Defaults to negotiated value. Might need to play with this on Firefox
    serverMaxWindowBits: 15,       // Defaults to negotiated value. Might need to play with this on Firefox
    // Below options specified as default values.
    concurrencyLimit: 15,          // Limits zlib concurrency for perf.
    threshold: (defaultSize/2),               // Size (in bytes) below which messages
    // should not be compressed.
}

var wsClients = {
    'desktopCapture': {
        'waiting': [],
        // 'someId': [wsClient1, wsClient2, ...]
    },
    // 'audio' ??
    'data': [],
    'rds': []
};

var wsServers = {
    'desktopCapture': new WebSocket.Server({ server: httpsDesktopCaptureServer, perMessageDeflate }),
    // 'audio' ?
    'data': new WebSocket.Server({ server: httpsDataServer, perMessageDeflate }),
    'pty': new WebSocket.Server({ server: httpsPTYServer, perMessageDeflate })
};

httpsDesktopCaptureServer.on('request', (req, res) => {
    res.writeHead(200);
    res.end('hello HTTPS world\n');
});
httpsDataServer.on('request', (req, res) => {
    res.writeHead(200);
    res.end('hello HTTPS world\n');
});
httpsPTYServer.on('request', (req, res) => {
    res.writeHead(200);
    res.end('hello HTTPS world\n');
});

wsServers.data.on('connection', function connection(ws) {
    console.log('Someone connected to data server', ws);
    ws.peer = setupNewPeer(ws);
    ws.on('message', function incoming(message) {
        const _message = JSON.parse(message);
        if (_message.action === 'peer_answer') {
            console.log('nice');
            ws.peer.signal(_message.data);
        } else if (_message.action === 'ask_for_peer_offer') {
            console.log('returning peer offer');
            if (p.length === 0) {
                setupNewPeer();
                p[0].on('connect', function () {
                    ws.send(JSON.stringify({action: 'peer_connected'}));
                });
            }
            p[0].justAnswered = false;
            p[0].on('signal', function (signalData) {
                if (p[0]._pc.connectionState !== 'stable' && p[0].justAnswered === false) {
                    ws.send(JSON.stringify({action: 'ask_for_peer_offer', data: signalData}));
                }
            });
        } else if (_message.action === 'send_peer_answer') {
            console.log('peer answer received');
            if (p[0]._pc.connectionState !== 'stable') {
                p[0].justAnswered = true;
                p[0].signal(_message.data);
            }
        } else if (_message.action === 'get_sources') {
            // TODO: Also pass navigator.mediaDevices.enumerateDevices().then(function (devices) {console.log(devices)}); as well
            desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
                console.log(sources);
                navigator.mediaDevices.enumerateDevices().then(function (devices) {
                    console.log(devices);
                    var everything = [];
                    for (var i = 0; i < sources.length; ++i) { everything.push(sources[i]); }
                    for (var i = 0; i < devices.length; ++i) { everything.push(devices[i]); }
                    ws.send(JSON.stringify({action: 'get_sources', data: everything}));
                });
            });
        } else if (_message.action === 'attach_to_source') {
            console.log('Attaching to source!', _message);
            if (!wsClients.desktopCapture[_message.data.id]) {
                currentClient = ws;
                wsClients.desktopCapture[_message.data.id] = [];
                captureSource(_message.data.id);
            } //else {
                ws.send(JSON.stringify({action: 'attach_to_source', status: true}));
            //}
        } else if (_message.action === 'mouse_move_to') {
            const { exec } = require('child_process');
            // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
            if (platform === 'win32') {
                var script = fs.readFileSync('Move-Mouse.ps1');
                exec(script + '; Move-Mouse MoveTo ' + _message.data.x + ' ' + _message.data.y, {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
                    // TODO: do whatever with stdout
                    console.log(stdout);
                    console.log(error);
                    console.log(stderr);
                });
            } else if (platform === 'darwin') {
                exec('osascript Move-Mouse-To.scpt ' + _message.data.x + ' ' + _message.data.y, {cwd: process.cwd()},
                    (error, stdout, stderr) => {
                        // TODO: Whatever
                        console.log(stdout);
                        console.log(error);
                        console.log(stderr);
                    }
                );
            } else if (platform === 'linux') {
                // ...
            }
        } else if (_message.action === 'mouse_move_by') {
            // const { exec } = require('child_process');
            // if (platform === 'win32') {
            //     // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
            //     var fs = require('fs');
            //     var script = fs.readFileSync('Move-Mouse.ps1');
            //     exec(script + '; Move-Mouse MoveBy ' + _message.data.x + ' ' + _message.data.y, {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
            //         // TODO: do whatever with stdout
            //         console.log(stdout);
            //         console.log(error);
            //         console.log(stderr);
            //     });
            // } else if (platform === 'darwin') {
            //     // ...
            // } else if (platform === 'linux') {
            //     // ...
            // }
            var robot = require('robotjs');
            var mouse = robot.getMousePos();
            mouse.x += _message.data.x;
            mouse.y += _message.data.y;
            robot.moveMouse(mouse.x, mouse.y);
        } else if (_message.action === 'mouse_left_click') {
            // const { exec } = require('child_process');
            // // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
            // var fs = require('fs');
            // var script = fs.readFileSync('Move-Mouse.ps1');
            // exec(script + '; Move-Mouse LeftClick', {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
            //     // TODO: do whatever with stdout
            //     console.log(stdout);
            //     console.log(error);
            //     console.log(stderr);
            // });
            var robot = require('robotjs');
            robot.mouseClick();
        } else if (_message.action === 'mouse_right_click') {
            // const { exec } = require('child_process');
            // // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
            // var fs = require('fs');
            // var script = fs.readFileSync('Move-Mouse.ps1');
            // exec(script + '; Move-Mouse RightClick', {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
            //     // TODO: do whatever with stdout
            //     console.log(stdout);
            //     console.log(error);
            //     console.log(stderr);
            // });
            var robot = require('robotjs');
            robot.mouseClick('right');
        } else if (_message.action === 'keyboard_type') {
            // var fs = require('fs');
            // var script = fs.readFileSync('Send-Keys.ps1');
            // const {exec} = require('child_process');
            // exec(script + '; Send-Keys "' + _message.data.app + '" "' + _message.data.keys + '"', {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
            //     // do whatever with stdout
            //     console.log(stdout);
            //     console.log(error);
            //     console.log(stderr);
            // });
            // ROBOT ALTERNATIVE
            var robot = require('robotjs');
            robot.keyToggle(_message.data.key, 'down');
            robot.keyToggle(_message.data.key, 'up');
        } else if (_message.action === 'special_command') {
            // TODO: Execute a special command here (like maybe paste where the command is different in different operating systems)
        } else if (_message.action === 'read_clipboard') {
            let clipboardStr = clipboard.readText();
            ws.send(clipboardStr);
        } else if (_message.action === 'write_clipboard') {
            console.log(_message);
            clipboard.writeText(_message.data);
        }
        console.log('data server received:', [message, _message]);
    });
    wsClients.data.push(ws);
});
wsServers.data.on('close', function close() {
    // TODO: remove from wsClients.data list
    console.log('data server connection closed');
});
wsServers.data.on('error', function error(e) {
    console.error('data server error', e);
});
wsServers.data.on('listening', function listening() {
    console.log('data websocket server is listening');
});

wsServers.desktopCapture.on('connection', function connection(ws) {
    console.log('Someone connected to desktop capture server', ws);
    ws.on('message', function incoming(message) {
        const _message = JSON.parse(message.toString());
        if (_message.action === 'attach_to_source') {
            console.log('attaching!');
            if (!wsClients.desktopCapture[_message.data.id]) {
                wsClients.desktopCapture[_message.data.id] = [];
            }
            wsClients.desktopCapture[_message.data.id].push(ws);
            console.log(wsClients);
            // TODO: remove from wsClients.desktopCapture.waiting array
        }
        console.log('desktop capture server received:', message);
    });
    wsClients.desktopCapture.waiting.push(ws);
});
wsServers.desktopCapture.on('close', function close(ws) {
    // TODO: remove from wsClients.desktopCapture list
    console.log('desktop capture server connection closed');
});
wsServers.desktopCapture.on('error', function error(e) {
    console.error('desktop capture server error', e);
});
wsServers.desktopCapture.on('listening', function listening() {
    console.log('desktop capture websocket server is listening');
});

wsServers.pty.on('connection', function connection (ws) {
    console.log('Someone connected to pty server', ws);
    // TODO: Can also be wsl.exe in win32 so let's add a condition for that
    var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    ws.tty = Pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.PWD,
        env: process.env,
        encoding: 'utf8'
    });
    ws.tty.on('exit', function (code, signal) {
        ws.tty = null;
        ws.close();
    });
    ws.tty.on('data', function (data) {
        ws.send(data);
    });
    ws.on('message', function (message) {
        if (ws.tty) {
            ws.tty.write(message);
        }
    });
});
wsServers.pty.on('close', function close() {
    if (ws.tty) {
        ws.tty.kill(9);
        ws.tty = null;
    }
    // TODO: remove from wsClients.data list
    console.log('pty server connection closed');
});
wsServers.pty.on('error', function error(e) {
    if (ws.tty) {
        ws.tty.kill(9);
        ws.tty = null;
    }
    console.error('pty server error', e);
});
wsServers.pty.on('listening', function listening() {
    console.log('pty websocket server is listening');
});

// Note: You have to be careful because WSL will own certain ports that you cannot piggyback on at 0.0.0.0
httpsDesktopCaptureServer.listen(8334, '0.0.0.0', function running(err) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('desktop capture server is running on port 8334!');
    }
});
httpsDataServer.listen(9090, '0.0.0.0', function running(err) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('data server is running on port 9090!');
    }
});
httpsPTYServer.listen(8335, '0.0.0.0', function running(err) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('pty server is running on port 8335!');
    }
});

// TODO: Look at main.js for an alternate way to capture what's on the electron browser. Possible usage here.
var captures = {
    'videos': [],
    'canvases': [],
    'contexts': [],
    'streams': [],
    'buffers': [],
}
function captureSource(targetId) {
    if (!captures.videos[targetId]) {
        try {
            navigator.mediaDevices.getUserMedia({
                // TODO: This works but needs to be a separate stream -> audio: {deviceId: {exact: "default"}},
                // Then for simplepeer, you have to use "streams" and not "stream" to pass everything in one shot
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: targetId,
                        //minWidth: 1280,
                        //maxWidth: 1920,
                        //minHeight: 720,
                        //maxHeight: 1200,
                    }
                }
            }).then(function (videoStream) {
                //setupNewPeer(videoStream);
                streams.push(videoStream);
                var theTrack = videoStream.getVideoTracks()[0];
                tracks.push(theTrack);
                for (var i = 0; i < p.length; ++i) {
                    p[i].addTrack(theTrack, videoStream);
                }

                console.log('added stream');
                // TODO: If not using WebRTC then you can use this
                // if (!captures.videos[targetId]) {
                //     captures.videos[targetId] = null;
                //     captures.streams[targetId] = videoStream;
                //     captures.buffers[targetId] = [];
                // }
                // if (!captures.canvases[targetId]) {
                //     captures.canvases[targetId] = null;
                // }
                // if (!captures.contexts[targetId]) {
                //     captures.contexts[targetId] = null;
                // }
                // captures.videos[targetId] = document.createElement('video');
                // captures.canvases[targetId] = document.createElement('canvas');
                // var width = videoStream.getVideoTracks()[0].getSettings().width;
                // var height = videoStream.getVideoTracks()[0].getSettings().height;
                // //console.log(videoStream.getVideoTracks()[0].getSettings());
                // //console.log(videoStream.getVideoTracks()[0].getConstraints());
                // //console.log(videoStream.getVideoTracks()[0].getCapabilities());
                // captures.canvases[targetId].width = width;
                // captures.canvases[targetId].height = height;
                // document.body.appendChild(captures.canvases[targetId]);
                // captures.contexts[targetId] = captures.canvases[targetId].getContext('2d');
                // captures.videos[targetId].srcObject = videoStream;
                // captures.videos[targetId].onloadedmetadata = (e) => captures.videos[targetId].play();
            }).catch((e) => { console.error(e); });
        } catch (e) {
            console.error(e);
        }
    }
}
// TODO: Better way to handle these vars
var byArea = false;
var byBlob = false;
var byArray = false;
var byArrayBuffer = false;
var byArrayBytes = false;
function updateCanvases() {
    for (var targetId in captures.videos) {
        var videoSettings = captures.streams[targetId].getVideoTracks()[0].getSettings();
        captures.canvases[targetId].width = videoSettings.width;
        captures.canvases[targetId].height = videoSettings.height;
        captures.contexts[targetId].drawImage(captures.videos[targetId], 0, 0, captures.canvases[targetId].width, captures.canvases[targetId].height);
        var clients = wsClients.desktopCapture[targetId];

        if (byArea) {
            var divideBy = 320;
            var srcOffsetX = 0;
            var srcOffsetY = 0;
            var row = 0;
            var column = 0;
            var columns = captures.canvases[targetId].width / divideBy;
            var rows = captures.canvases[targetId].height / divideBy;
            while (column <= columns) {
                row = 0;
                while (row <= rows) {
                    var buffer = document.createElement('canvas');
                    buffer.width = divideBy;
                    buffer.height = divideBy;
                    var bufferCtx = buffer.getContext('2d');
                    var source = captures.canvases[targetId];
                    var srcOffsetX = column * divideBy;
                    var srcOffsetY = row * divideBy;
                    var srcWidth = divideBy;
                    var srcHeight = divideBy;
                    var dstX = 0;
                    var dstY = 0;
                    bufferCtx.drawImage(source, srcOffsetX, srcOffsetY, srcWidth, srcHeight, dstX, dstY, buffer.width, buffer.height);
                    var bufferToDataURL = buffer.toDataURL('image/png');
                    if (captures.buffers[targetId] !== bufferToDataURL) {
                        captures.buffers[targetId] = bufferToDataURL;
                        var send = {area: [srcOffsetX, srcOffsetY], data: bufferToDataURL};
                        for (var i = 0; i < clients.length; ++i) {
                            clients[i].send(JSON.stringify(send));
                        }
                    }
                    ++row;
                }
                ++column;
            }
        } else if (byBlob) {
            var source = captures.canvases[targetId];
            source.toBlob(function (blob) {
                for (var i = 0; i < clients.length; ++i) {
                    clients[i].send(blob);
                }
            });
        } else if (byArray) {
            var image = captures.contexts[targetId].getImageData(0, 0, captures.canvases[targetId].width, captures.canvases[targetId].height);
            if (!byArrayBuffer) {
                byArrayBuffer = new ArrayBuffer(image.data.length);
                byArrayBytes = new Uint8Array(byArrayBuffer);
            }
            for (var i = 0; i < byArrayBytes.length; ++i) {
                if (byArrayBytes[i] !== image.data[i]) {
                    byArrayBytes[i] = image.data[i];
                }
            }
            for (var i = 0; i < clients.length; ++i) {
                console.log('send');
                clients[i].send(byArrayBytes);
            }
        } else {
            var imagePngData = captures.canvases[targetId].toDataURL('image/png');
            for (var i = 0; i < clients.length; ++i) {
                clients[i].send(JSON.stringify({data: imagePngData}));
            }
        }
    }
}
setInterval(function () { updateCanvases(); }, 100);

window.addEventListener('load', function () {
    const sourcesListEl = document.querySelector('#sources');
    var sourceEls = [];
    desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
        for (const source of sources) {
            var sourceEl = document.createElement('li');
            sourceEl.id = source.id;
            sourceEl.innerHTML = source.name;
            sourceEls.push(sourceEl);
            sourcesListEl.appendChild(sourceEl);
        }
    });

    function stopVideo() {
        video.pause();
        video.currentTime = 0;
        video.srcObject = null;
    }

    function clearSourceEls() {
        for (var i = 0; i < sourceEls.length; ++i) {
            sourceEls[i].remove();
            sourceEls[i] = null;
        }
        sourceEls = [];
    }

//     var htmlCanvas = document.getElementById("canvas");
//      var offscreen = htmlCanvas.transferControlToOffscreen();

//      var worker = new Worker("offscreencanvas.js");
//      worker.postMessage({canvas: offscreen}, [offscreen]);
//      offscreencanvas.js (worker code):

//      onmessage = function(evt) {
//   var canvas = evt.data.canvas;
//   var gl = canvas.getContext("webgl");

//   // ... some drawing using the gl context ...
// };

    function updateCanvas() {
        videoCanvasCtx.drawImage(video, 0, 0, 800, 600);
        ipcRenderer.send('send_source', videoCanvasEl.toDataURL('image/png'));
        // if (webSocketClient !== null) {
        //     // var someData = videoCanvasCtx.getImageData(0, 0, 800, 600);
        //     // var data = someData.data;
        //     // var buffer = new ArrayBuffer(data.length);
        //     // var binary = new Uint8Array(buffer);
        //     // for (var i = 0; i < binary.length; ++i) {
        //     //     binary[i] = data[i];
        //     // }
        //     // webSocketClient.send(buffer);
        //     // console.log(someData);
        //     // webSocketClient.send(someData.data.buffer);
        //     webSocketClient.send(videoCanvasEl.toDataURL('image/png')); //WORKING!
        //     //webSocketClient.send(videoCanvasCtx.getImageData(0, 0, 800, 600).data); //WORKS but stupid slow
        // }
        //window.requestAnimationFrame(updateCanvas);
    }

    const mediaRecorder = null;

    function handleStream(stream) {
        // const mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 3 * 1024 * 1024});
        // mediaRecorder.start(1000/30);
        // mediaRecorder.addEventListener('dataavailable', function (e) {
        //     if (webSocketClient !== null) {
        //         // var buffer = new ArrayBuffer(e.data.length);
        //         // var binary = new Uint8Array(buffer);
        //         // for (var i = 0; i < binary.length; ++i) {
        //         //     binary[i] = e.data[i];
        //         // }
        //         e.data.arrayBuffer().then(function (data) {
        //             webSocketClient.send(data);
        //         });
        //     }
        // });
        video.srcObject = stream;
        // stream.addEventListener('dataavailable', function (e) {
        //     if (webSocketClient !== null) {
        //         // var buffer = new ArrayBuffer(e.data.length);
        //         // var binary = new Uint8Array(buffer);
        //         // for (var i = 0; i < binary.length; ++i) {
        //         //     binary[i] = e.data[i];
        //         // }
        //         e.data.arrayBuffer().then(function (data) {
        //             webSocketClient.send(data);
        //         });
        //     }
        // });
        //video.requestVideoFrameCallback(updateCanvas);
        setInterval(updateCanvas, 1);
        video.onloadedmetadata = (e) => video.play();
    }
});
//window.requestAnimationFrame(updateCanvas);

console.log('preload done');
*/