const commands = require('./commands')

module.exports = {
  onMessageHandler: onMessageHandler
}

function handleCommand(commandName, client, context, target) {
  if (commandName.startsWith("!")) {
      commands.runCommand(commandName.substring(1), client, context, target)
  }
} 

function onMessageHandler(client){
  return function (target, context, msg, self) {
    if (self) { return } // Ignore messages from the bot
    // Remove whitespace from chat message
    const commandName = msg.trim()
    handleCommand(commandName, client, context, target)
  }
}