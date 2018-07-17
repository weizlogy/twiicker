const crypto = require('crypto')

const TwitterAPI = require('../module/twitter-api').TwitterAPI
const twAPI = new TwitterAPI()

module.exports.Twitter = class Twitter {

  constructor() {
    // プライベート変数
    this.htmlEncode = 'utf-8'
    this.tokenSalt = new Buffer(require('os').hostname()).toString('base64')
    console.log('SALT: ', this.tokenSalt)

    // secret復号共通
    this.decryptToken = function (secret) {
      let decipher = crypto.createDecipher(process.env.CRYPT_ACCOUNT_ALGORITHM, this.tokenSalt)
      secret = decipher.update(secret, 'hex', 'utf8')
      secret += decipher.final('utf8')
      return secret
    }
  }

  GetIndexPage() {
    return require('fs').readFileSync('./page/index.html', this.htmlEncode)
  }

  async GetRequestToken() {
    return await twAPI.GetRequestToken()
  }

  async GetAccessToken(rtoken, verifier) {
    // 認証トークンを取得して（生データ）
    let token = await twAPI.GetAccessToken(rtoken, verifier)
    // secretは暗号化する
    let cipher = crypto.createCipher(process.env.CRYPT_ACCOUNT_ALGORITHM, this.tokenSalt)
    token.secret = cipher.update(token.secret, 'utf8', 'hex')
    token.secret += cipher.final('hex')
    // おしまい
    return token
  }

  async GetUserInfo(item, cb, ecb) {
    return await twAPI.GetUserInfo(item.uid, item.token, this.decryptToken(item.secret), cb, ecb)
  }

  async GetHomeTL(item, cb, ecb) {
    return await twAPI.GetHomeTL(item.uid, item.token, this.decryptToken(item.secret), cb, ecb)
  }
  async GetNotify(item, cb, ecb) {
    return await twAPI.GetNotify(item.uid, item.token, this.decryptToken(item.secret), cb, ecb)
  }
  async GetDirectMessage(item, cb, ecb) {
    return await twAPI.GetDirectMessage(item.uid, item.token, this.decryptToken(item.secret), cb, ecb)
  }

  async Retweet(tid, token, cb, ecb) {
    return await twAPI.Retweet(tid, token.token, this.decryptToken(token.secret), cb, ecb)
  }

  async UnRetweet(tid, token, cb, ecb) {
    return await twAPI.UnRetweet(tid, token.token, this.decryptToken(token.secret), cb, ecb)
  }

  async Favorite(tid, token, cb, ecb) {
    return await twAPI.Favorite(tid, token.token, this.decryptToken(token.secret), cb, ecb)
  }

  async UnFavorite(tid, token, cb, ecb) {
    return await twAPI.UnFavorite(tid, token.token, this.decryptToken(token.secret), cb, ecb)
  }

  async Tweet(msg, tid, token, cb, ecb) {
    return await twAPI.Tweet(msg, tid, token.token, this.decryptToken(token.secret), cb, ecb)
  }

}
