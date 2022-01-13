var UI = {
    bus: false,
    websocket: false,
    captures: {},

    // WebRTC === UI === data
    load: function () {
        UI.elements.message = document.getElementById('message');
        UI.elements.action = document.getElementById('action');

        UI.elements.action.innerText = 'Attempting to establish websocket connection to localhost';
        APP.websocket = APP.connectToServer();
        if (APP.websocket !== false && APP.websocket !== {}) {
            // TODO: This seems weird to be here
            APP.listenToPeers();
            APP.bus = SFC.EVENTS.listenToEvent(APP.bus, 'peer-close', function (peer) {
                for (var i in UI.captures) {
                    var haveListener = false;
                    // TODO: Cleanup these nested fors
                    for (var x = 0; x < APP.peers.length; ++x) {
                        for (var y = 0; y < APP.peers[x]._listeningTo.length; ++y) {
                            if (APP.peers[x]._listeningTo[y] === i) {
                                haveListener = true;
                                break;
                            }
                        }
                        if (haveListener) { break; }
                    }
                    if (!haveListener) {
                        for (var x = 0; x < UI.captures[i].tracks.length; ++x) {
                            UI.captures[i].tracks[x].stop();
                        }
                        delete UI.captures[i];
                    }
                }
            });
            // TODO: Maybe should be moved to APP.listenToSocket?
            // TODO: Also, should use this: SFC.WEBSOCKET.bus = SFC.EVENTS.listenToEvent(SFC.WEBSOCKET.bus, 'open', function (info) {})
            APP.websocket.addEventListener('error', function (error) {
                SFC.LOG.error('websocket error', error);
                UI.elements.message.innerText = 'Failed to connect via websocket';
                UI.elements.action.innerText = '';
            });
            APP.websocket.addEventListener('open', function () {
                SFC.LOG.info('websocket open');
                // TODO: Ask for list of existing clients and offer peer
            });
            APP.websocket.addEventListener('close', function () {
                SFC.LOG.info('websocket closed');
                UI.elements.message.innerText = 'Websocket connection closed';
                UI.elements.action.innerText = '';
            });
            APP.websocket.addEventListener('message', function (message) {
                SFC.LOG.info('websocket message', message);

                var message = JSON.parse(message.data);
                if (message.action === 'peer_answer') {
                    for (var i = 0; i < APP.peers.length; ++i) {
                        var peer = APP.peers[i];
                        if (peer._uuid === message.data._uuid) {
                            peer.signal(message.data.signal);
                            break;
                        }
                    }
                } else if (message.action === 'get_sources') {
                    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
                        SFC.LOG.info('Sources:', sources);
                        navigator.mediaDevices.enumerateDevices().then(function (devices) {
                            SFC.LOG.info('Devices:', devices);
                            APP.websocket.send(JSON.stringify({
                                action: 'get_sources',
                                data: {sources, devices, _uuid: message.data._uuid}
                            }));
                        });
                    });
                } else if (message.action === 'attach_to_source') {
                    // TODO: Clean this puppy up
                    if (!UI.captures[message.data.id]) {
                        UI.captureSource(message.data.id, message.data._uuid);
                    } else {
                        for (var i = 0; i < APP.peers.length; ++i) {
                            var peer = APP.peers[i];
                            if (peer._uuid === message.data._uuid) {
                                peer.waitForAnswer = false;
                                peer._listeningTo.push(message.data.id);
                                // TODO: This stuff is duplicated somewhere else. Put into a common function
                                peer.addTrack(UI.captures[message.data.id].tracks[0], UI.captures[message.data.id].stream);
                                var videoSettings = UI.captures[message.data.id].stream.getVideoTracks()[0].getSettings();
                                // TODO: Per track stuff
                                peer.send(JSON.stringify({
                                    action: 'video_settings',
                                    data: { videoSettings: videoSettings }
                                }));
                                break;
                            }
                        }
                    }
                } else if (message.action === 'new_client_connected') {
                    SFC.LOG.info('New client jumped on server. Setup a peer for them in case they want something', message);
                    var peer = APP.setupNewPeer(message.data._uuid);
                    APP.peers.push(peer);
                } else if (message.action === 'your_uuid') {
                    APP.websocket._uuid = message.data._uuid;
                }
            });
            UI.elements.message.innerText = 'Successfully connected to local websocket...';
            UI.elements.action.innerText = 'Attempting to establish peer connection...';
        } else {
            UI.elements.message.innerText = 'Failed to connect to local websocket...';
        }
    },

    elements: {},

    showConnections: function () {
        var ul = document.createElement('ul');
        ul.id = 'connections-list';
        UI.elements.connectionList = ul;

        var li = document.createElement('li');
        li.id = 'local';
        li.innerText = 'local';
        // li.innerHTML = '<a href="https://0.0.0.0:9090">do it!</a>';
        li.classList.add('selectable');
        li.addEventListener('click', function (evt) {
            UI.bus = SFC.EVENTS.emitEvent(UI.bus, 'server-connection-clicked', evt);
        });
        ul.appendChild(li);

        document.getElementById('loading').remove();
        document.body.appendChild(ul);
    },

    captureSource: function (targetId, _uuid) {
        // TODO: This function needs an update. To grab audio&video from desktop, you cannot use media source id. For anything else, though, you have to give an id
        // NOTE: https://www.electronjs.org/docs/api/desktop-capturer#caveats
        if (!UI.captures[targetId]) {
            try {
                var settings = {
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            // chromeMediaSourceId: targetId
                        }
                    }
                };
                if (process.platform === 'win32') {
                    // NOTE: Doing this because Mac cannot capture audio due to kernel issue and if you try it fails outright
                    /*settings.audio = {
                        mandatory: {
                            chromeMediaSource: 'desktop'
                        }
                    };*/
                }
                navigator.mediaDevices.getUserMedia(settings).then(function (videoStream) {
                    videoStream._id = targetId;
                    UI.captures[targetId] = {
                        stream: videoStream,
                        tracks: [],
                        audioTracks: [],
                        videoTracks: []
                    };
                    var theTrack = videoStream.getVideoTracks()[0];
                    UI.captures[targetId].tracks.push(theTrack);
                    UI.captures[targetId].videoTracks = videoStream.getVideoTracks();
                    UI.captures[targetId].audioTracks = videoStream.getAudioTracks();
                    for (var i = 0; i < APP.peers.length; ++i) {
                        var peer = APP.peers[i];
                        if (peer._uuid === _uuid) {
                            peer.waitForAnswer = false;
                            peer._listeningTo.push(targetId);
                            peer.addTrack(UI.captures[targetId].tracks[0], UI.captures[targetId].stream);
                            var videoSettings = UI.captures[targetId].stream.getVideoTracks()[0].getSettings();
                            peer.send(JSON.stringify({
                                action: 'video_settings',
                                data: { videoSettings: videoSettings }
                            }));
                            // TODO: Update client to accept this then enable accordingly
                            // var videoTrackSettings = [];
                            // var audioTrackSettings = [];
                            // for (var i = 0; i < UI.captures[targetId].videoTracks.length; ++i) {
                            //     var track = UI.captures[targetId].videoTracks[i];
                            //     videoTrackSettings.push(track.getSettings());
                            // }
                            // for (var i = 0; i < UI.captures[targetId].audioTracks.length; ++i) {
                            //     var track = UI.captures[targetId].audioTracks[i];
                            //     audioTrackSettings.push(track.getSettings());
                            // }
                            // peer.send(JSON.stringify({
                            //     action: 'stream_settings',
                            //     data: { videoSettings: videoTrackSettings, audioSettings: audioTrackSettings, id: targetId }
                            // });
                            break;
                        }
                    }
                }).catch((e) => { console.error(e); });
            } catch (e) {
                console.error(e);
            }
        }
    }
};
