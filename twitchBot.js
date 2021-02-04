// TODO: verify sigs
require('dotenv').config()
const fetch = require('node-fetch')
var express = require('express')
var app = express()
const tmi = require('tmi.js')
const common = require('./common')
const twitchEventApi = require('./twitchEventApi')
const commandProcessor = require('./commandProcessor')
const ngrok = require('ngrok')
let client
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Handle Callbacks from Twitch api
app.post('/', twitchEventApi.handleEventCall)

app.listen(3000, (err)=>{
  if (err) {
    console.log(err)
    return
  }
  (async function() {
    // Start ngrok to route api callbacks through router
    const url = await ngrok.connect(3000)
    startBot(url)
  })()
})

function startBot(eventCallbackURI) {
  twitchEventApi.createSubscription(eventCallbackURI)
  // Define configuration options
  const opts = {
    identity: {
      username: process.env.TWITCH_BOT_USERNAME,
      password: process.env.TWITCH_AUTH
    },
    channels: [
      process.env.TWITCH_BOT_CHANNEL
    ]
  }

  // Create a client with our options
  client = new tmi.client(opts)

  // Register our event handlers (defined below)
  client.on('message', commandProcessor.onMessageHandler(client))
  client.on('connected', common.onConnectedHandler)

  // Connect to Twitch:
  console.log("Connecting....")
  connectionResult = client.connect()
}

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  shutdown()
});

function shutdown() {
  twitchEventApi.shutdown()
}