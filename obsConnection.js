const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

module.exports = {
  sendCommand: sendCommand
}

function idleAvatarCallback(val, callback) {
  return ()=>{
    obs.sendCallback('SetSceneItemProperties', 
    {
      "item": 'Avatar Idle',
      "visible": val
    }, callback)
  }
}

function commandCallback(command, val, callback) {
  return () => {
    obs.sendCallback('SetSceneItemProperties', 
    {
      "item": command,
      "visible": val
    }, callback)
  }
}

// WHY DID I DO THIS WITH CALLBACKS
// TODO refactor and Use .then
// UGLY AS HECK
function connectionOpenedCallback(command,runtime,callback) {
  return (event) =>{
    idleAvatarCallback(
      false,
      commandCallback(
        command,
        true,
        ()=>{
          setTimeout(
            commandCallback(
              command,
              false,
              idleAvatarCallback(
                true, 
                () => {
                  obs.removeAllListeners()
                  obs.disconnect()
                  callback()
                }
              )
            ),
            runtime
          )
        }
      )
    )()
  }
}

function sendCommand(command,runtime,callback) {
  obs.on('ConnectionOpened', connectionOpenedCallback(command,runtime, callback));
  obs.connect()
}