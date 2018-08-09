const crypto = require('crypto')

const TwitterAPI = require('../module/twitter-api').TwitterAPI
const twAPI = new TwitterAPI()

module.exports.Twitter = class Twitter {

  constructor() {
    this.htmlEncode = 'utf-8'
    // herokuにデプロイするとなぜかdecryptできなくなるので、もしかしてちょいちょい変わる？
    this.tokenSalt = process.env.CRYPT_SALT || new Buffer(require('os').hostname()).toString('base64')
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

  // メディアの有無でAPIの呼び出しを制御する
  // 頑張るミドル
  async Tweet(msg, tid, media, token, cb, ecb) {
    // メディアがないとき
    if (media.size == 0) {
      return await twAPI.Tweet(msg, tid, '', token.token, this.decryptToken(token.secret), cb, ecb)
    }
    // メディアがあるとき
    // カテゴリー選択（取り敢えず適当に...）
    let category = 'tweet_image'
    if (media.type == 'video/mp4') {
      category = 'tweet_video'
    } else if (media.type == 'image/gif') {
      category = 'tweet_gif'
    }
    console.log('request media upload size=%d, type=%s.', media.size, media.type)
    // INIT
    // media.typeはURLエンコード忘れずに
    await twAPI.InitUploadImage(encodeURIComponent(media.type), media.size, category, token.token, this.decryptToken(token.secret), async init => {
      console.log(init)
      let mediaID = init['media_id_string']
      console.log('Media appending... ', mediaID)
      // APPEND
      // BASE64エンコーデッドをchunkして送っていく
      let tasks = media.binary.match(/.{1,1024000}/g).map((binary, index) => {
        return new Promise(resolve => {
          let media = {
            'id': mediaID,
            'media_data': binary,
            'segment_index': index
          }
          // APPENDは成功しても200を返すだけでボディはない
          twAPI.AppendUploadImage(media, token.token, this.decryptToken(token.secret), append => {
            console.log('Media append...%s => %d', mediaID, binary.length)
            resolve(binary.length)
          }, ecb)
        })
      })
      // FINALIZE
      await Promise.all(tasks).then(async append => {
        console.log('Media appended. ', mediaID)
        await twAPI.FinalizeUploadImage(mediaID, token.token, this.decryptToken(token.secret), async finalize => {
          console.log('Media finalize.', finalize)
          // やっとツイートできる...
          return await twAPI.Tweet(msg, tid, mediaID, token.token, this.decryptToken(token.secret), cb, ecb)
        }, ecb)
      })
    }, ecb)
  }

}
