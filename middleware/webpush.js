const webpush = require('web-push')

module.exports.WebPush = class WebPush {
  constructor () {
    // https://web-push-codelab.glitch.me/
    this.keys = {
      'publicKey': process.env.WEBPUSH_PUBLIC_KEY,
      'privateKey': process.env.WEBPUSH_PRIVATE_KEY,
    }
    console.log('WebPush generateVAPIDKeys: ', this.keys)
    webpush.setVapidDetails(
      process.env.WEBPUSH_SUBJECT,
      this.keys.publicKey,
      this.keys.privateKey
    )
  }

  GetPublicKey () {
    return this.keys.publicKey
  }
  SetSubscription (subscription) {
    return this.subscription = subscription
  }

  SendNotify (notifier) {
    if (!this.subscription) {
      console.log('Push notify is not ready.')
      return
    }
    webpush.sendNotification(this.subscription, JSON.stringify(notifier), {})
  }
}