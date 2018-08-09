// 環境変数をロード
require('dotenv').config()

// Koa系
const Koa = require('koa')
const _ = require('koa-route')
const app = new Koa()

// socket.io系
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

// ユーザー定義
const Twitter = require('./middleware/twitter').Twitter
const tw = new Twitter()

// === ルーティング関係ロジック ===

app.use(require('koa-bodyparser')())
app.use(require('koa-static')('client'))

/**
 * メインページ
 */
app.use(_.get('/', async (ctx, next) => {
  ctx.body = tw.GetIndexPage()
}))

/**
 * ツイッター認証開始
 * OAUTH認証画面に飛ばすー
 */
app.use(_.get('/auth/twitter', async (ctx, next) => {
  let token = await tw.GetRequestToken()
  ctx.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${token.token}&force_login=true`)
}))

/**
 * 認証完了コールバック
 * アクセストークンを取得して保存する
 */
app.use(_.get('/auth/twitter/callback', async (ctx, next) => {
  let rtoken = ctx.request.query['oauth_token']
  let verifier = ctx.request.query['oauth_verifier']
  let token = await tw.GetAccessToken(rtoken, verifier)
  io.once('connect', socket => {
    socket.on('c2s-ready', () => {
      socket.emit('s2c-req-store-token', token)
    })
  })
  ctx.redirect('/')
}))

// === ソケット通信関係ロジック ===
io.on('connection', socket => {
  // 接続！
  console.log('socket connected !!!')
  // 切断！
  socket.on('disconnect', () => {
    console.log('socket disconnected !!!')
  })
  // バージョン問い合わせ
  socket.on('c2s-version', ack => {
    ack(process.env.npm_package_version)
  })
  // ユーザー情報を問い合わせ
  socket.on('c2s-req-user', (item, ack) => {
    console.log('user info request.', item)
    tw.GetUserInfo(item,
      user => { ack(user) },
      error => { socket.emit('c2s-error', error) }
    )
  })
  // タイムラインを問い合わせ
  socket.on('c2s-req-timeline', (token) => {
    tw.GetHomeTL(token,
      timelines => { socket.emit('c2s-res-timeline', timelines, token.uid) },
      error => { socket.emit('s2c-error', error) }
    )
  })
  // 通知を問い合わせ
  socket.on('c2s-req-notify', (token) => {
    tw.GetNotify(token,
      timelines => { socket.emit('c2s-res-notify', timelines, token.uid) },
      error => { socket.emit('s2c-error', error) }
    )
  })
  // ダイレクトメッセージを問い合わせ
  socket.on('c2s-req-directmessage', (token) => {
    tw.GetDirectMessage(token,
      timelines => { socket.emit('c2s-res-directmessage', timelines, token.uid) },
      error => { socket.emit('s2c-error', error) }
    )
  })
  // リツイート
  socket.on('c2s-req-retweet', (token, tid) => {
    tw.Retweet(tid, token,
      tweet => { socket.emit('c2s-res-timeline', [ tweet ], token.uid) },
      error => { socket.emit('s2c-error', error) }
    )
  })
  socket.on('c2s-req-unretweet', (token, tid) => {
    tw.UnRetweet(tid, token,
      tweet => { socket.emit('c2s-res-timeline', [ tweet ], token.uid) },
      error => { socket.emit('s2c-error', error) }
    )
  })
  // いいね
  socket.on('c2s-req-favorite', (token, tid) => {
    tw.Favorite(tid, token,
      tweet => { socket.emit('c2s-res-timeline', [ tweet ], token.uid) },
      error => { socket.emit('s2c-error', error) }
    )
  })
  socket.on('c2s-req-unfavorite', (token, tid) => {
    tw.UnFavorite(tid, token,
      tweet => { socket.emit('c2s-res-timeline', [ tweet ], token.uid) },
      error => { socket.emit('s2c-error', error) }
    )
  })
  // ツイート（メディア投稿にも対応
  socket.on('c2s-req-tweet', (token, tid, msg, media, ack) => {
    tw.Tweet(msg, tid, media, token,
      tweet => {
        // ツイートしたものを即座にタイムライン上に送る
        socket.emit('c2s-res-timeline', [ tweet ], token.uid)
        // ツイートの返し
        ack(tweet, token.uid)
      },
      error => { socket.emit('s2c-error', error) }
    )
  })
})

// ポート待受開始
// process.env.PORTはheroku対応
const port = process.env.PORT || 3000
server.listen(port)
console.log('twiicker-v%s server is running at %d', process.env.npm_package_version, port)