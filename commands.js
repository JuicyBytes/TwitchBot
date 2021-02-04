const common = require('./common')
const obsConnection = require('./obsConnection')
const fs = require('fs');

var running = false

module.exports = {
  runCommand: runCommand
}

function commands() {
  return JSON.parse(fs.readFileSync('commands.json'))
}

function runCommand(command,client,context,target) {
  if (running) {
    return
  }
  //load commands file everytime to allow changes while running
  let comms = commands()
  if (comms[command]) {
    running = true
    processResponse(comms[command]["response"],context,(response)=>{
      client.say(target, response)
      let source = comms[command]["source"]
      // TODO: Create source rather than set visibility
      // Also get the runtime from the length of the clip
      let runtime = comms[command]["runtime"]
      if (source && runtime) {
        obsConnection.sendCommand(source, runtime,()=>{
          running = false
        })
      } else {
        running = false
      }
    })
  }
}

function processResponse(str,context,callback) {
  // Swap out variables
  //TODO: Allow multiple variables within a single string
  if (str.indexOf("{") >= 0 && str.indexOf("}") >= 0) {
    let variableName = str.split("{")[1].split("}")[0]
    let variableValue = str
    //TODO: Refactor this
    switch(variableName) {
      case "username":
        variableValue = context.username
        callback(str.split("{" + variableName + "}").join(variableValue))
        break
      case "uptime":
        uptime((up)=>{
          callback(str.split("{" + variableName + "}").join(up))
        })
        break
      case "commands":
        variableValue = "!" + Object.keys(commands()).join(' !')
        callback(str.split("{" + variableName + "}").join(variableValue))
        break
      default:
        console.log("Undefined variable used in commands.json response field. " + variableName)
        callback(str.split("{" + variableName + "}").join(variableValue))
        break
    }
  }
}

function uptime(callback) {
  common.getStreamData((data=>{
    if (data['is_live']) {
      callback(common.msToTime(Date.now() - Date.parse(data['started_at'])))
    } else {
      callback("00:00:00")
    }
  }))
}