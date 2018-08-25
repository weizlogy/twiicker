define(['Vue', 'component/tweet-editor'], Vue => {
  // アカウントトークン全取得
  let __GetAllUser = () => {
    return Vue.idb.token.orderBy('uid').toArray()
  }
  return new Vue({
    el: '.l-user',
    data: {
      addAccount: 'アカウント追加',
      items: [],
    },
    beforeCreate: function() {
      // アカウント保存 => 再描画はmountedで行われるー
      Vue.socket.on('s2c-req-store-token', token => {
        console.info('アカウント追加依頼...')
        console.debug('s2c-req-store-token', token)
        Vue.idb.token.put({'token': token.token, 'secret': token.secret, 'uid': token.uid})
      })
    },
    mounted: function() {
      console.info('アカウントを復元...')
      __GetAllUser().then(tokens => {
        console.debug('tokens', tokens)
        tokens.forEach(token => {
          // アカウント情報取得依頼を出して描画
          Vue.socket.emit('c2s-req-user', token, res => {
            console.log('c2s-req-user', res)
            this.items.push(Object.assign(res, token))
            // タイムライン取得依頼
            // タイムラインを即時取得＋ポーリング監視する
            // 監視間隔は１５分で１５回なので１分１回
            let tlp = () => { Vue.socket.emit('c2s-req-timeline', token) }
            tlp()
            setInterval(tlp, 60.5 * 1000)
            // 通知取得依頼
            // 通知を即時取得＋ポーリング監視する
            // 監視間隔は１５分で７５回なので１２秒１回
            let ntp = () => { Vue.socket.emit('c2s-req-notify', token) }
            ntp()
            setInterval(ntp, 12.5 * 1000)
            // ダイレクトメッセージ取得依頼
            // ダイレクトメッセージを即時取得＋ポーリング監視する
            // 監視間隔は１５分で１５回なので１分１回
            let dlp = () => { Vue.socket.emit('c2s-req-directmessage', token) }
            dlp()
            setInterval(dlp, 60.5 * 1000)
          })
        })
      }).catch(error => {
        console.error('users mounted', error)
      })
    },
    methods: {
      add: function(e) {
        window.location.href = '/auth/twitter'
      },
      openEditor: function(item) {
        item['editor_open'] = !item['editor_open']
        item['reply_id_str'] = ''
        item['reply_content'] = ''
        item['reply_to'] = ''
        this.$refs['tweet-editor-' + item['id_str']][0].update()
      },
      openEditorInReply: function(item, tweet) {
        this.openEditor(item)
        item['reply_id_str'] = tweet['id_str']
        item['reply_content'] = tweet['full_text']
        item['reply_to'] = tweet['user']['screen_name']
        this.$refs['tweet-editor-' + item['id_str']][0].update()
      },
      isEditorOpen: function(item) {
        if (!item['editor_open']) {
          Vue.set(item, 'editor_open', false)
        }
        return item['editor_open']
      },
    },
    computed: {
      ordered: function() {
        return this.items.sort((a, b) => {
          return a.id - b.id
        })
      }
    }
  })
})