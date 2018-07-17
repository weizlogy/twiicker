define(['Vue'], (Vue) => {
  let mix = function(uid, item) {
    return uid + '-' + item['id_str']
  }

  return {
    created () {
      let targetEvent = this.socketEvents.UpdateTimeline
      Vue.socket.on(targetEvent, (timelines, uid) => {
        // 描画済みのキーをリスト化する
        let indexes = this.items.map(m => mix(uid, m))
        // 未描画のキーのみ描画する
        timelines.forEach(item => {
          // ここでやるのでいいのかな...
          // RTの場合、itemにはRTしたユーザーの情報が入り、retweeted_statusにRT先ツイートの情報が載る
          //  => まあQTと同じなんですがね...
          // RTではRTしたユーザーのツイートがないのでRT先を表示させる（公式と同じ動きを目指す
          if (item.retweeted_status) {
            item['id'] = item.retweeted_status['id']
            item['id_str'] = item.retweeted_status['id_str']
            item['user_RT_twiicker'] = item.user
            item.user = item.retweeted_status.user
          }
          let id = mix(uid, item)
          // データ加工
          // キーはユーザーIDとツイートIDの複合で追加する
          item['id_str_twiicker'] = id
          // ユーザー引き当て用にIDも入れておく
          item['from_user_id'] = uid
          // 重複更新
          let indexOfItem = indexes.indexOf(id)
          if (indexOfItem > -1) {
            console.log(targetEvent + ' update: ', item)
            this.items.splice(indexOfItem, 1, item)
            return
          }
          // 重複してないものはセット
          this.items.push(item)
          console.log(targetEvent + ' new: ', item)
        })
      }
    )},
    computed: {
      ordered: function() {
        return this.items.sort((a, b) => {
          let c = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          if (c == 0) {
            c = a.id - b.id
          }
          if (c == 0) {
            c = a.user.id - b.user.id
          }
          return c
        })
      }
    }
  }
})