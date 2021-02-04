require('dotenv').config()
const common = require('./common')
const { v4: uuidv4 } = require('uuid')
const fetch = require('node-fetch')

let eventSubscriptionId
module.exports = {
  createSubscription: createSubscription,
  handleEventCall: handleEventCall,
  shutdown: shutdown
}

function shutdown() {
  common.authenticateWithAPI((accessToken)=>{
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      'client-id': process.env.TWITCH_CLIENT
    }
    let options = {
      method: 'DELETE',
      headers: headers
    }
    fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${eventSubscriptionId}`, options)
    .then(res => {
      process.exit();
    })
    .catch(err=>{
      console.log(err)
      process.exit();
    })
  })
}

function handleEventCall(req, res) {
  switch(req.headers['twitch-eventsub-message-type']){
    case 'webhook_callback_verification':
      if (req.body['subscription']['id'] == eventSubscriptionId){
        let challenge = req.body['challenge']
        res.send(challenge)
        console.log("Subscription active")
        return
      }
      break
    case 'notification':
      if (client) {
        client.say('juicybytes', `${req.body['event']['user_name']}, Thank you for the follow.`)
      }
      break
    default: 
      console.log("non recognized message type")
      console.log(req.headers)
      break
  }
}

function createSubscription(eventCallbackURI) {
  common.authenticateWithAPI((accessToken)=>{
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      'client-id': process.env.TWITCH_CLIENT,
      'content-type': 'application/json'
    }
    let body = {
      "type": "channel.follow",
      "version": "1",
      "condition": {
          "broadcaster_user_id": "467906994"
      },
      "transport": {
          "method": "webhook",
          "callback": eventCallbackURI,
          "secret": uuidv4()
      }
    } 
    let options = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers
    }
    fetch('https://api.twitch.tv/helix/eventsub/subscriptions', options)
    .then(res => res.json())
    .then(response => {
      if (response.error) {
        console.log(response)
      } else {
        eventSubscriptionId = response['data'][0]['id']
      }
    })
    .catch(console.error)
  })
}