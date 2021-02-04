const fetch = require('node-fetch')
require('dotenv').config()

module.exports = {
  authenticateWithAPI: authenticateWithAPI,
  onConnectedHandler: onConnectedHandler,
  msToTime: msToTime,
  getStreamData: getStreamData
}

function getStreamData(callback) {
  authenticateWithAPI((accessToken)=>{
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      'client-id': process.env.TWITCH_CLIENT
    }
    let options = {
      method: 'GET',
      headers: headers
    }
    fetch('https://api.twitch.tv/helix/search/channels?query=juicybytes', options)
    .then(res => res.json())
    .then(response => {
      response['data'].forEach(data =>{
        if (data.broadcaster_login == 'juicybytes'){
          callback(data)
          return
        }
      }) 
    })
    .catch(console.error)
  })
}

function msToTime (duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

function authenticateWithAPI(callback) {
  let body = {
    client_id: process.env.TWITCH_CLIENT,
    client_secret: process.env.TWITCH_SECRET,
    grant_type: 'client_credentials'
  }
  let options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }
  fetch('https://id.twitch.tv/oauth2/token', options)
  .then(res => res.json())
  .then(response => {
    let accessToken = response['access_token']
    // let tokenExpire = response['expires_in']
    callback(accessToken)
  })
  .catch(console.error)
}