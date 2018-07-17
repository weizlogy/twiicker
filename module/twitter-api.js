const OAuth = require('oauth').OAuth

module.exports.TwitterAPI = class TwitterAPI {
  
  // OAuthオブジェクトを初期化
  constructor() {
    this.o = new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      "1.0A",
      'http://127.0.0.1:3000/auth/twitter/callback',
      "HMAC-SHA1"
    )
    this.API_PREFIX = 'https://api.twitter.com/1.1'
  }

  // １．リクエストトークンの取得
  async GetRequestToken() {
    return await (() => new Promise(resolve => {
      this.o.getOAuthRequestToken((error, token, secret, results) => {
        if (error) {
          console.log(error)
          return
        }
        console.log('getting token.', token)
        this.rtoken = token
        this.rsecret = secret
        resolve({ 'token': token, 'secret': secret })
      })
    }))()
  }

  // ２．アクセストークンの取得
  async GetAccessToken(rtoken, verifier) {
    if (this.rtoken != rtoken) {
      console.log('request token unmatch.')
      return
    }
    return await (() => new Promise(resolve => {
      this.o.getOAuthAccessToken(this.rtoken, this.rsecret, verifier, (error, atoken, asecret) => {
        this.rtoken = ''
        this.rsecret = ''
        if (error) {
          console.log(error)
          return
        }
        console.log('getting access token.', atoken)
        let uid = atoken.match(/(\d.+?)\-/)[1]
        resolve({ 'token': atoken, 'secret': asecret, 'uid': uid })
      })
    }))()
  }

  __CommonGetRequest(url, token, secret, callback, ecallback) {
    console.log(' GET: ', url)
    this.o.get(url, token, secret, (error, result) => {
      if (error) {
        ecallback(error)
        return
      }
      callback(JSON.parse(result))
    })
  }

  __CommonPostRequest(url, token, secret, body, callback, ecallback) {
    console.log('POST: ', url)
    console.log('....: ', body)
    this.o.post(url, token, secret, body, (error, result) => {
      if (error) {
        ecallback(error)
        return
      }
      callback(JSON.parse(result))
    })
  }

  // アカウント情報取得
  async GetUserInfo(uid, token, secret, callback, ecallback) {
    let overrideCallback = user => {
      user['token'] = { 'token': token, 'secret': secret }
      callback(user)
    }
    let url = `${this.API_PREFIX}/users/show.json?user_id=${uid}`
    this.__CommonGetRequest(url, token, secret, overrideCallback, ecallback)
  }

  // アカウントタイムライン取得
  async GetHomeTL(uid, token, secret, callback, ecallback) {
    let url = `${this.API_PREFIX}/statuses/home_timeline.json?tweet_mode=extended`
    this.__CommonGetRequest(url, token, secret, callback, ecallback)
  }
  // アカウント通知取得
  async GetNotify(uid, token, secret, callback, ecallback) {
    let url = `${this.API_PREFIX}/statuses/mentions_timeline.json`
    this.__CommonGetRequest(url, token, secret, callback, ecallback)
  }
  // アカウントダイレクトメッセージ取得
  async GetDirectMessage(uid, token, secret, callback, ecallback) {
    let url = `${this.API_PREFIX}/direct_messages.json`
    this.__CommonGetRequest(url, token, secret, callback, ecallback)
  }

  // リツイート
  async Retweet(tid, token, secret, callback, ecallback) {
    let url = `${this.API_PREFIX}/statuses/retweet/${tid}.json`
    this.__CommonPostRequest(url, token, secret, {}, callback, ecallback)
  }
  async UnRetweet(tid, token, secret, callback, ecallback) {
    let url = `${this.API_PREFIX}/statuses/unretweet/${tid}.json`
    this.__CommonPostRequest(url, token, secret, {}, callback, ecallback)
  }

  // いいね
  async Favorite(tid, token, secret, callback, ecallback) {
    let url = `${this.API_PREFIX}/favorites/create.json`
    this.__CommonPostRequest(url, token, secret, { 'id': tid }, callback, ecallback)
  }
  async UnFavorite(tid, token, secret, callback, ecallback) {
    let url = `${this.API_PREFIX}/favorites/destroy.json`
    this.__CommonPostRequest(url, token, secret, { 'id': tid }, callback, ecallback)
  }

  // ツイート
  async Tweet(msg, tid, token, secret, callback, ecallback) {
    let body = { 'status': msg }
    if (tid) {
      body['in_reply_to_status_id'] = tid
    }
    let url = `${this.API_PREFIX}/statuses/update.json`
    this.__CommonPostRequest(url, token, secret, body, callback, ecallback)
  }
}
