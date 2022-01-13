# oculus-quest-personal-project
My own project using node, three.js and other stuff


# Getting Started

In `server/`
Run `npm install`

In `electron-remote-desktop/`
Run `npm install`

In `client/`
Run `build.sh` & `run.sh`

Navigate to `localhost:8003/index.html` or `localhost:8002/index.html`. You can also try `rds.html`
(which is set by `client/run.sh` line 5)

Update `common/connections.js` with your machines and their internal IP addresses. 

Navigate to `server/` and run `node index.js`

Navigate to `electron-remote-desktop/` and run one of the `npm run {windows_start, mac_start, linux_start}` for your OS.


# Architecture

## Electron 
* Shares the desktop

## Server 
* Facilitates communications between the client and electron
* Can run independently
* Runs ffmpeg deskopt capture (using `ffmpeg`)
