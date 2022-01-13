var crypto = require('crypto');
crypto.getRandomValues = require('get-random-values');
var fs = require('fs');
eval(fs.readFileSync('../common/strings.js', 'utf8'));
eval(fs.readFileSync('../common/connections.js', 'utf8'));
eval(fs.readFileSync('../common/pty-settings.js', 'utf8'));
eval(fs.readFileSync('../common/settings.js', 'utf8'));
eval(fs.readFileSync('../common/shortcuts.js', 'utf8'));
eval(fs.readFileSync('../common/functional.js', 'utf8'));
eval(fs.readFileSync('../common/functional-log.js', 'utf8'));
eval(fs.readFileSync('../common/functional-error.js', 'utf8'));
eval(fs.readFileSync('../common/functional-events.js', 'utf8'));
eval(fs.readFileSync('../common/functional-uuid.js', 'utf8'));
eval(fs.readFileSync('../common/schemas.js', 'utf8'));
eval(fs.readFileSync('../common/schemas-data_server.js', 'utf8'));
var os = require('os');
var platform = os.platform();
var Pty = require('node-pty');
var https = require('https');
var pem = require('https-pem');
var WebSocket = require('ws');
var robot = require('robotjs');

var defaultSize = 32 * 256;
var perMessageDeflate = {
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
    threshold: (defaultSize/2),               // Size (in bytes) below which messages should not be compressed
};

var wsClients = {
    'data': [],
    'pty': [],
    'ffmpeg': []
};

var httpsDataServer = https.createServer(pem);
var httpsPTYServer = https.createServer(pem);
var httpsFFMPEGServer = https.createServer(pem);
var httpsDataServerPort = 9090;
var httpsPTYServerPort = 8335;
var httpsFFMPEGServerPort = 8334;

var wsServers = {
    'data': new WebSocket.Server({ server: httpsDataServer, perMessageDeflate }),
    'pty': new WebSocket.Server({ server: httpsPTYServer, perMessageDeflate }),
    'ffmpeg': new WebSocket.Server({ server: httpsFFMPEGServer, perMessageDeflate })
};

httpsDataServer.on('request', (req, res) => {
    res.writeHead(200);
    res.end('hello HTTPS world\n');
});
httpsPTYServer.on('request', (req, res) => {
    res.writeHead(200);
    res.end('hello HTTPS world\n');
});
httpsFFMPEGServer.on('request', (req, res) => {
    res.writeHead(200);
    res.end('hello HTTPS world\n');
});

var _mouse = {
    isClickDown: false,
    lastClicked: ''
};

SFC.LOG.to.console = true;
SFC.LOG.to.file = false;

// TODO: Notes
// TODO: Models (3d)
// TODO: Library (saved html with meta like url, date and screenshot)
// TODO: Files with get content
wsServers.data.on('connection', function connection(ws) {
    SFC.LOG.info('New connection', ws);
    ws.on('message', function incoming(message) {
        const _message = JSON.parse(message);
        if (_message.action === 'ask_for_sources') {
            var spawn = require("child_process").spawn,child;
            child = spawn("powershell.exe", ["Get-Process | Where-Object {$_.MainWindowTitle -ne \"\"} | Select-Object MainWindowTitle"]);
            var output = '';
            child.stdout.on("data", function (data) {
                console.log("Powershell Data: " + data);
                output += data;
            });
            child.stderr.on("data", function (data) {
                console.log("Powershell Errors: " + data);
            });
            child.on("exit", function () {
                // TODO: This section needs serious cleanup with the data and whatnot
                console.log("Powershell Script finished");
                output = output.split("\r\n");
                for (var i = 0; i < output.length; ++i) {
                    output[i] = {id: output[i].trim(), name: output[i].trim(), deviceId: null};
                }
                _message.data = {sources: output, devices: []};
                for (var i = 0; i < wsClients.data.length; ++i) {
                    if (wsClients.data[i] === ws) {
                        // if (_message.data._uuid === undefined) {
                        //     _message.data._uuid = ws._uuid;
                        //     message = JSON.stringify(_message);
                        // }
                        wsClients.data[i].send(JSON.stringify(_message));
                    }
                }
            });
            child.stdin.end(); //end input
        } else if (_message.action === 'peer_answer') {
            for (var i = 0; i < wsClients.data.length; ++i) {
                if (wsClients.data[i] !== ws) {
                    if (_message.data._uuid === undefined) {
                        _message.data._uuid = ws._uuid;
                        message = JSON.stringify(_message);
                    }
                    wsClients.data[i].send(message);
                }
            }
        } else if (_message.action === 'get_sources') {
            for (var i = 0; i < wsClients.data.length; ++i) {
                if (wsClients.data[i] !== ws) {
                    if (_message.data._uuid === undefined) {
                        _message.data._uuid = ws._uuid;
                        message = JSON.stringify(_message);
                    }
                    wsClients.data[i].send(message);
                }
            }
        } else if (_message.action === 'attach_to_source') {
            for (var i = 0; i < wsClients.data.length; ++i) {
                if (wsClients.data[i] !== ws) {
                    if (_message.data._uuid === undefined) {
                        _message.data._uuid = ws._uuid;
                        message = JSON.stringify(_message);
                    }
                    wsClients.data[i].send(message);
                }
            }
        } else if (_message.action === 'peer_offer') {
            for (var i = 0; i < wsClients.data.length; ++i) {
                if (wsClients.data[i]._uuid === _message.data._uuid) {
                    wsClients.data[i].send(message);
                    break;
                }
            }
        } else if (_message.action === 'sources_list') {
            for (var i = 0; i < wsClients.data.length; ++i) {
                if (wsClients.data[i] !== ws) {
                    if (_message.data._uuid === undefined) {
                        _message.data._uuid = ws._uuid;
                        message = JSON.stringify(_message);
                    }
                    wsClients.data[i].send(message);
                }
            }
        } else if (_message.action === 'ask_for_list_of_clients') {
            ws.send(JSON.stringify({message: 'list_of_clients', data: wsClients.data}));
        } else if (_message.action === 'mouse_move_to') {
            // NOTE: On mac devices, when you first run electron and server, you need to watch the screen to enable accessibility stuff
            // const { exec } = require('child_process');
            // // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
            // if (platform === 'win32') {
            //     var script = fs.readFileSync('Move-Mouse.ps1');
            //     exec(script + '; Move-Mouse MoveTo ' + _message.data.x + ' ' + _message.data.y, {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
            //         // TODO: do whatever with stdout
            //         console.log(stdout);
            //         console.log(error);
            //         console.log(stderr);
            //     });
            // } else if (platform === 'darwin') {
            //     exec('osascript Move-Mouse-To.scpt ' + _message.data.x + ' ' + _message.data.y, {cwd: process.cwd()},
            //         (error, stdout, stderr) => {
            //             // TODO: Whatever
            //             console.log(stdout);
            //             console.log(error);
            //             console.log(stderr);
            //         }
            //     );
            // } else if (platform === 'linux') {
            //     // ...
            // }
            try {
                SFC.LOG.info('Mouse move');
                if (_mouse.isClickDown === false) {
                    robot.moveMouse(parseInt(_message.data.x), parseInt(_message.data.y));
                    // robot.moveMouseSmooth(parseInt(_message.data.x), parseInt(_message.data.y)); // TODO: WAY TOO SLOW
                } else {
                    robot.dragMouse(parseInt(_message.data.x), parseInt(_message.data.y));
                }
            } catch (err) {
                SFC.LOG.error(err);
            }
        } else if (_message.action === 'mouse_click_down') {
            if (_mouse.isClickDown === true) {
                robot.mouseToggle('up', _mouse.lastClicked);
            }
            robot.mouseToggle('down', _message.data.leftOrRight);
            _mouse.isClickDown = true;
            _mouse.lastClicked = _message.data.leftOrRight;
        } else if (_message.action === 'mouse_click_up') {
            if (_mouse.isClickDown === true) {
                robot.mouseToggle('up', _message.data.leftOrRight);
                _mouse.isClickDown = false;
            }
        } else if (_message.action === 'mouse_move_by') {
            /*const { exec } = require('child_process');
            if (platform === 'win32') {
                // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
                var fs = require('fs');
                var script = fs.readFileSync('Move-Mouse.ps1');
                exec(script + '; Move-Mouse MoveBy ' + _message.data.x + ' ' + _message.data.y, {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
                    // TODO: do whatever with stdout
                    console.log(stdout);
                    console.log(error);
                    console.log(stderr);
                });
            } else if (platform === 'darwin') {
                // ...
            } else if (platform === 'linux') {
                // ...
            }*/
            var mouse = robot.getMousePos();
            mouse.x += _message.data.x;
            mouse.y += _message.data.y;
            if (_mouse.isClickDown === false) {
                robot.moveMouse(mouse.x, mouse.y);
                // robot.moveMouseSmooth(mouse.x, mouse.y); // TODO: WAY TOO SLOW
            } else {
                robot.dragMouse(mouse.x, mouse.y);
            }
        } else if (_message.action === 'mouse_left_click') {
            /*const { exec } = require('child_process');
            // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
            var fs = require('fs');
            var script = fs.readFileSync('Move-Mouse.ps1');
            exec(script + '; Move-Mouse LeftClick', {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
                // TODO: do whatever with stdout
                console.log(stdout);
                console.log(error);
                console.log(stderr);
            });*/
            try {
                SFC.LOG.info('Mouse click');
                robot.mouseClick();
            } catch (err) {
                SFC.LOG.error(err);
            }
        } else if (_message.action === 'mouse_right_click') {
            /*const { exec } = require('child_process');
            // powershell "Start-Process -Verb RunAs cmd.exe '/c start wt.exe'"
            var fs = require('fs');
            var script = fs.readFileSync('Move-Mouse.ps1');
            exec(script + '; Move-Mouse RightClick', {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
                // TODO: do whatever with stdout
                console.log(stdout);
                console.log(error);
                console.log(stderr);
            });*/
            try {
                SFC.LOG.info('Mouse right click');
                robot.mouseClick('right');
            } catch (err) {
                SFC.LOG.error(err);
            }
        } else if (_message.action === 'mouse_wheel_scroll') {
            try {
                SFC.LOG.info('Mouse wheel scroll');
                robot.scrollMouse(_message.data.x, _message.data.y);
            } catch (err) {
                SFC.LOG.error(err);
            }
        } else if (_message.action === 'keyboard_type') {
            /*var fs = require('fs');
            var script = fs.readFileSync('Send-Keys.ps1');
            const {exec} = require('child_process');
            exec(script + '; Send-Keys "' + _message.data.app + '" "' + _message.data.keys + '"', {cwd: process.cwd(), 'shell':'powershell.exe'}, (error, stdout, stderr)=> {
                // do whatever with stdout
                console.log(stdout);
                console.log(error);
                console.log(stderr);
            });*/
            // ROBOT ALTERNATIVE
            try {
                robot.keyTap(_message.data.key, _message.data.modifiers);
            } catch (err) {
                SFC.LOG.error(err, _message.data.key);
            }
        } else if (_message.action === 'keyboard_down') {
            try {
                robot.keyToggle(_message.data.key, 'down');
            } catch (err) {
                SFC.LOG.error(err);
            }
        } else if (_message.action === 'keyboard_up') {
            try {
                robot.keyToggle(_message.data.key, 'up');
            } catch (err) {
                SFC.LOG.error(err);
            }
        } else if (_message.action === 'shortcut') {
            if (SHORTCUTS[_message.data.id]) {
                if (_message.data.id === 'ctrl-tab') {
                    robot.keyTap('tab', ['control']);
                } else if (_message.data.id === 'ctrl-alt-delete') {
                    robot.keyTap('delete', ['control', 'alt']);
                } else if (_message.data.id === 'ctrl-t') {
                    robot.keyTap('t', ['control']);
                } else if (_message.data.id === 'ctrl-r') {
                    robot.keyTap('r', ['control']);
                } else if (_message.data.id === 'ctrl-w') {
                    robot.keyTap('w', ['control']);
                } else if (_message.data.id === 'ctrl-shift-tab') {
                    robot.keyTap('tab', ['control', 'shift']);
                } else if (_message.data.id === 'write-clipboard') {
                    // TODO: Fix clipboard because it only works on electron
                    // clipboard.writeText(_message.data.text);
                } else if (_message.data.id === 'read-clipboard') {
                    // let clipboardText = clipboard.readText();
                    // ws.send(clipboardText);
                }
            } else {
                SFC.LOG.info('Bad shortcut id', _message.data.id);
            }
        }
        SFC.LOG.info('Data server received message from client', [message, _message]);
    });
    ws.on('close', function () {
        for (var i = 0; i < wsClients.data.length; ++i) {
            if (wsClients.data[i]._uuid === ws._uuid) {
                wsClients.data.splice(i, 1);
            }
        }
    });
    SFC.UUID.ids.v4 = SFC.UUID.generatev4(SFC.UUID.ids.v4);
    var newId = SFC.UUID.ids.v4[(SFC.UUID.ids.v4.length - 1)];
    ws._uuid = newId;
    ws.send(JSON.stringify({action: 'your_uuid', data: {_uuid: newId}}));
    wsClients.data.push(ws);
    for (var i = 0; i < wsClients.data.length; ++i) {
        if (wsClients.data[i] !== ws) {
            wsClients.data[i].send(JSON.stringify({action: 'new_client_connected', data: {_uuid: newId}}));
        }
    }
});
wsServers.data.on('close', function close(client) {
    SFC.LOG.info('A data client dropped off', client);
});
wsServers.data.on('error', function error(e) {
    SFC.LOG.error('Error on data server', e);
});
wsServers.data.on('listening', function listening() {
    SFC.LOG.info('Data websocket is listening');
});

wsServers.pty.on('connection', function connection (ws) {
    SFC.LOG.info('Someone connected to pty server');
    // TODO: Can also be wsl.exe in win32 so let's add a condition for that
    var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    //var shell = os.platform() === 'win32' ? 'wsl.exe' : 'bash';
    ws.tty = Pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: PTYSettings.cols,
        rows: PTYSettings.rows,
        cwd: process.env.PWD,
        env: process.env,
        //encoding: 'utf8' not supported on windows
    });
    ws.tty.on('exit', function (code, signal) {
        ws.tty = null;
        ws.close();
    });
    ws.tty.on('data', function (data) {
        ws.send(data);
    });
    ws.on('close', function () {
        SFC.LOG.info('closing and killing tty');
        if (ws.tty) {
            if (os.platform() === 'win32') {
                ws.tty.kill();
            } else {
                ws.tty.kill(9);
            }
        }
        for (var i = 0; i < wsClients.pty.length; ++i) {
            if (wsClients.pty[i]._uuid === ws._uuid) {
                wsClients.pty.splice(i, 1);
            }
        }
    });
    ws.on('message', function (message) {
        // TODO: This needs cleanup. It's so strange. Numbers like 0 - 9 on keyboard won't work unless the code is like this.
        try {
            var _message = JSON.parse(message);
            if (_message) {
                if (_message.action === 'resize') {
                    ws.tty.resize(_message.data.cols, _message.data.rows);
                } else {
                    ws.tty.write(message);
                }
            } else {
                ws.tty.write(message);
            }
        } catch (err) {
            // Assuming that message is not a json stringifiable object
            if (ws.tty) {
                ws.tty.write(message);
            }
        }
    });
    SFC.UUID.ids.v4 = SFC.UUID.generatev4(SFC.UUID.ids.v4);
    var newId = SFC.UUID.ids.v4[(SFC.UUID.ids.v4.length - 1)];
    ws._uuid = newId;
    wsClients.pty.push(ws);
});
wsServers.pty.on('close', function close(client) {
    SFC.LOG.info('pty server connection closed');
});
wsServers.pty.on('error', function error(e) {
    SFC.LOG.error('pty server error', e);
});
wsServers.pty.on('listening', function listening() {
    SFC.LOG.info('pty websocket server is listening');
});

const _SOI = Buffer.from([0xff, 0xd8]);
const _EOI = Buffer.from([0xff, 0xd9]);
var number = 0;
var chunks = [];
var jpegInst = null;
var size = 0;
wsServers.ffmpeg.on('connection', function connection (ws) {
    SFC.LOG.info('Someone connected to ffmpeg server');
    ws.on('close', function () {
        for (var i = 0; i < wsClients.ffmpeg.length; ++i) {
            if (wsClients.ffmpeg[i]._uuid === ws._uuid) {
                wsClients.ffmpeg.splice(i, 1);
            }
        }
    });
    ws.on('message', function (message) {
        console.log(message);
        try {
            var _message = JSON.parse(message);
            if (_message && _message.data) {
                if (_message.data.window) {
                    const child_process = require('child_process');
                    var cmd = [];
                    cmd.push('C:\\Users\\spiro\\Downloads\\ffmpeg-2021-12-27-git-617452ce2c-full_build\\bin\\ffmpeg.exe');
                    cmd.push('-f');
                    cmd.push('gdigrab');
                    // cmd.push(`-i`);
                    // cmd.push(`title=Telegram (10)`);
                    // cmd.push('-vsync');
                    // cmd.push('vfr');
                    // cmd.push('-indexmem');
                    // cmd.push('3M');
                    // cmd.push('-rtbufsize');
                    // cmd.push('10M');
                    // cmd.push(`-draw_mouse`);
                    // cmd.push(`1`);
                    // cmd.push('-max_probe_packets');
                    // cmd.push('10k');
                    // cmd.push('-threads');
                    // cmd.push('3');

                    // // cmd.push('-pix_fmt');
                    // // cmd.push('yuv422p');
                    
                    // cmd.push('-probesize');
                    // cmd.push('32');
                    
                    // // cmd.push('-bsf:v');
                    // // cmd.push('null');
                    // // cmd.push(`-b:v`);
                    // // cmd.push(`3M`);
                    // // cmd.push('-vcodec');
                    // // cmd.push('libx264');
                    // // cmd.push('copy');
                    
                    // cmd.push('-c:v');
                    // cmd.push('libx264');
                    
                    // cmd.push('-crf');
                    // cmd.push('25');
                    
                    // // cmd.push('-flags');
                    // // cmd.push('low_delay');
                    
                    // cmd.push('-analyzeduration');
                    // cmd.push('0');
                    // cmd.push(`-tune`);
                    // cmd.push(`zerolatency`);
                    // cmd.push(`-fflags`);
                    // cmd.push(`nobuffer`);
                    // cmd.push(`-preset`);
                    // cmd.push(`ultrafast`);
                    // cmd.push('-f');
                    // // cmd.push('null');
                    // // cmd.push('matroska');
                    // // cmd.push('flv');
                    // // cmd.push('h264');
                    // // cmd.push('rawvideo');
                    // // cmd.push('mjpeg');
                    // cmd.push('-r');
                    // cmd.push('30');
                    // // cmd.push(`-`); // NOTE: Use this if pipe:1 does not work

                    cmd.push('-re');
                    cmd.push(`-i`);
                    cmd.push(`title=${_message.data.window}`);
                    cmd.push('-y');
                    cmd.push('-framerate');
                    cmd.push('30');
                    cmd.push('-preset');
                    cmd.push('ultrafast');
                    cmd.push('-q:v');
                    cmd.push('4');
                    cmd.push('-f');
                    cmd.push('mjpeg');
                    cmd.push('pipe:1');
                    console.log('');
                    console.log(cmd);

                    var child = child_process.spawn(cmd[0], cmd.splice(1), {
                        stdio: ['ignore', 'pipe', process.stderr]
                    });

                    // child.stdio[1].pipe(res);
                    child.stdout.on('data', function (chunk) {
                        for (var i = 0; i < wsClients.ffmpeg.length; ++i) {
                            if (wsClients.ffmpeg[i]._uuid === ws._uuid) {
                                // wsClients.ffmpeg[i].send(new Buffer(chunk).toString('base64'));
                            }
                        }
                        // for (var i = 0; i < wsClients.ffmpeg.length; ++i) {
                        //     if (wsClients.ffmpeg[i]._uuid === ws._uuid) {
                        //         wsClients.ffmpeg[i].send(new Buffer(data));
                        //     }
                        // }
                        const chunkLength = chunk.length;
                        let pos = 0;
                        while (true) {
                            if (size) {
                                const eoi = chunk.indexOf(_EOI);
                                if (eoi === -1) {
                                    chunks.push(chunk);
                                    size += chunkLength;
                                    break;
                                } else {
                                    pos = eoi + 2;
                                    const sliced = chunk.slice(0, pos);
                                    chunks.push(sliced);
                                    size += sliced.length;
                                    jpegInst = Buffer.concat(chunks, size);
                                    chunks = [];
                                    size = 0;
                                    for (var i = 0; i < wsClients.ffmpeg.length; ++i) {
                                        if (wsClients.ffmpeg[i]._uuid === ws._uuid) {
                                            wsClients.ffmpeg[i].send(new Buffer(jpegInst).toString('base64'));
                                        }
                                    }
                                    if (pos === chunkLength) {
                                        break;
                                    }
                                }
                            } else {
                                const soi = chunk.indexOf(_SOI, pos);
                                if (soi === -1) {
                                    break;
                                } else {
                                    pos = soi + 500;
                                }
                                const eoi = chunk.indexOf(_EOI, pos);
                                if (eoi === -1) {
                                    const sliced = chunk.slice(soi);
                                    chunks = [sliced];
                                    size = sliced.length;
                                    break;
                                } else {
                                    pos = eoi + 2;
                                    jpegInst = chunk.slice(soi, pos);
                                    for (var i = 0; i < wsClients.ffmpeg.length; ++i) {
                                        if (wsClients.ffmpeg[i]._uuid === ws._uuid) {
                                            wsClients.ffmpeg[i].send(new Buffer(jpegInst).toString('base64'));
                                        }
                                    }
                                    if (pos === chunkLength) {
                                        break;
                                    }
                                }
                            }
                        }
                    });

                    // Need to do child.kill() at some point
                } else {
                    SFC.LOG.error("No window chosen");
                }
            } else {
                SFC.LOG.error("No message");
            }
        } catch (err) {
            // Assuming that message is not a json stringifiable object
            SFC.LOG.error(err);
        }
    });
    SFC.UUID.ids.v4 = SFC.UUID.generatev4(SFC.UUID.ids.v4);
    var newId = SFC.UUID.ids.v4[(SFC.UUID.ids.v4.length - 1)];
    ws._uuid = newId;
    wsClients.ffmpeg.push(ws);
});
wsServers.ffmpeg.on('close', function close(client) {
    SFC.LOG.info('A ffmpeg client dropped off', client);
});
wsServers.ffmpeg.on('error', function error(e) {
    SFC.LOG.error('Error on ffmpeg server', e);
});
wsServers.ffmpeg.on('listening', function listening() {
    SFC.LOG.info('FFMPEG websocket is listening');
});

httpsDataServer.listen(httpsDataServerPort, '0.0.0.0', function running(err) {
    if (err) {
        SFC.LOG.error('Data server error:', err);
    } else {
        SFC.LOG.info('Data server is running on port ' + httpsDataServerPort + '!');
    }
});
httpsPTYServer.listen(httpsPTYServerPort, '0.0.0.0', function running(err) {
    if (err) {
        SFC.LOG.error('PTY server error:', err);
    } else {
        SFC.LOG.info('PTY server is running on port ' + httpsPTYServerPort + '!');
    }
});
httpsFFMPEGServer.listen(httpsFFMPEGServerPort, '0.0.0.0', function running(err) {
    if (err) {
        SFC.LOG.error('FFMPEG server error:', err);
    } else {
        SFC.LOG.info('FFMPEG server is running on port ' + httpsFFMPEGServerPort + '!');
    }
});
