/** ===
 * RequireJS コンフィグレーション
 */
requirejs.config({
  paths: {
    'Vue': '//unpkg.com/vue@latest/dist/vue.min',
    'Dexie': '//unpkg.com/dexie@latest/dist/dexie',
    'io': '//cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.slim',
    'twttr': '//cdn.jsdelivr.net/npm/twitter-text@2.0.4/build/twitter-text.min',
    'punycode': 'https://cdnjs.cloudflare.com/ajax/libs/punycode/1.4.1/punycode.min',
    'moment': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min'
  }
})

/** ===
 * 依存関係ライブラリのコンフィグレーション
 */
require(['Vue', 'Dexie', 'socket'], (Vue, Dexie, socket) => {
  console.info('データベース初期化...')

  let db = new Dexie('twiicker')
  db.version(1).stores({
    token: '&uid, token, secret'
  })

  console.info('VueにDexie, socket.ioを組み込み中...')

  Vue.use((Vue, options) => {
    Vue.idb = db,
    Vue.socket = socket
  })

  /** ===
   * エントリーポイント
   */
  require(['index', 'user/users', 'push'], (index, users) => {
    console.info('エントリーポイントがロードされた')
    // サーバーに完了通知
    Vue.socket.emit('c2s-ready')
  })
})
