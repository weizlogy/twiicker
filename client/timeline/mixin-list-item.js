define(['Vue', 'user/users'], (Vue, Users) => {
  // 共通アクション
  let actionInContent = function(item, messagekey, checkKey) {
    Vue.idb.token.get(item.from_user_id, token => {
      // メッセージを作成
      //  c2s-req-retweet / c2s-req-unretweet
      //  c2s-req-favorite / c2s-req-unfavorite
      let message = 'c2s-req-'
      if (item[checkKey]) {
        message = message + '-un'
      }
      message = message + messagekey
      console.log(message, item.id_str)
      Vue.socket.emit(message, token, item.id_str)
    })
  }

  // コンポーネント：リプライ
  let cReply = {
    props: ['item'],
    methods: {
      Reply: function(item) {
        let foundUser = Users.items.find(user => user.id_str === item.from_user_id) || {}
        console.log(foundUser)
        Users.openEditorInReply(foundUser, item)
      }
    },
    template: `
      <span class="timeline--actions--comment" title="リプライ" @click="Reply(item)">
        <!-- Comment icon by Icons8 -->
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" viewBox="0 0 32 32" class="icon icons8-Comment"><path d="M26.664 4.82H5.336c-1.178 0-2.132.955-2.132 2.133V20.82c0 1.18.955 2.134 2.132 2.134h14.968l4.226 4.226v-4.226h2.134c1.178 0 2.133-.955 2.133-2.133V6.954c0-1.178-.955-2.133-2.133-2.133zm1.066 16c0 .59-.48 1.067-1.066 1.067h-3.2v2.718l-2.718-2.718H5.336c-.588 0-1.066-.478-1.066-1.066V6.954c0-.588.48-1.066 1.066-1.066h21.328c.588 0 1.066.478 1.066 1.066V20.82z"></path><path d="M16 12.824c-.59 0-1.066.478-1.066 1.066s.477 1.066 1.066 1.066 1.066-.477 1.066-1.066c0-.588-.477-1.066-1.066-1.066zM20.265 12.824c-.59 0-1.066.478-1.066 1.066s.476 1.066 1.065 1.066 1.066-.477 1.066-1.066c0-.588-.476-1.066-1.065-1.066zM11.835 12.824c-.59 0-1.066.478-1.066 1.066s.476 1.066 1.065 1.066S12.9 14.48 12.9 13.89c0-.588-.476-1.066-1.065-1.066z"></path></svg>
      </span>
    `
  }
  // コンポーネント：RT
  let cRT = {
    props: ['item'],
    methods: {
      Retweet: function(item) {
        actionInContent(item, 'retweet', 'retweeted')
      }
    },
    template: `
      <span class="timeline--actions--retweet" title="RT" @click="Retweet(item)" :class="{ 'is-retweeted': item.retweeted }">
        <!-- Retweet icon by Icons8 -->
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" viewBox="0 0 1894 2545.2094" class="icon icons8-Retweet"><path d="M3.5 1424q11.5-19 43.5-19h129V701q0-65 45-110.5T331 545h983l-212 314H487v546h130q32 0 43 19t-6 45l-294 480q-12 16-29 16-7 0-14-4t-11-8l-3-4L9 1469q-17-26-5.5-45zM581 1965l211-313h615v-547h-130q-32 0-43-19t6-44l294-480q11-17 28-17 7 0 14.5 4t11.5 8l3 5 294 480q17 25 5.5 44t-43.5 19h-129v704q0 65-45.5 110.5T1562 1965H581z"></path></svg>
        <span class="timeline--actions--retweet--count">{{item.retweet_count}}</span>
      </span>
    `
  }
  // コンポーネント：QT
  let cQT = {
    props: ['item'],
    methods: {
      Quote: function(item) {
        // actionInContent(item, 'retweet', 'retweeted')
      }
    },
    template: `
      <span class="timeline--actions--quote" title="引用RT" @click="Quote(item)">
        <!-- Quote icon by Icons8 -->
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" viewBox="0 0 640 1026" class="icon icons8-Quote" ><path d="M0 513v256h256V513H128s0-128 128-128V257S0 257 0 513zm640-128V257s-256 0-256 256v256h256V513H512s0-128 128-128z"></path></svg>
      </span>
    `
  }
  // コンポーネント：いいね
  let cFavorite = {
    props: ['item'],
    methods: {
      Favorite: function(item) {
        actionInContent(item, 'favorite', 'favorited')
      }
    },
    template: `
      <span class="timeline--actions--favorite" title="いいね" @click="Favorite(item)" :class="{ 'is-favorited': item.favorited }">
        <!-- Ios Heart Outline icon by Icons8 -->
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" viewBox="0 0 448 512" class="icon icons8-Ios-Heart-Outline"><path d="M327 80c69 0 121 43 121 116 0 31-13 71-41 105s-45 52-100 88-83 43-83 43-28-7-83-43-72-54-100-88S0 227 0 196C0 123 52 80 121 80c39 0 82 18 103 53 21-35 64-53 103-53zm68 211c12-14 22-31 28-49 6-16 9-31 9-46 0-30-10-56-29-74-9-8-20-15-33-19-13-5-28-7-43-7-38 0-73 18-89 45l-14 23-14-23c-16-27-51-45-89-45-15 0-30 2-43 7-13 4-24 11-33 19-19 18-29 44-29 74 0 15 3 30 9 46 6 18 16 35 28 49 27 32 42 49 97 85 40 27 65 36 74 39 9-3 34-12 74-39 55-36 70-53 97-85z"></path></svg>
        <span class="timeline--actions--favorite--count">{{item.favorite_count}}</span>
      </span>
    `
  }

  return {
    components: {
      'reply': cReply,
      'retweet': cRT,
      'quote': cQT,
      'favorite': cFavorite,
    },
    methods: {
      autoLinkText (item) {
        let text = item['full_text'] || item['text'] || ''
        // RT
        if (item.retweeted_status) {
          return this.autoLinkText(item.retweeted_status)
        }
        // QT
        if (item.quoted_status) {
          item.quoted_status['full_text_twiicker'] = this.autoLinkText(item.quoted_status)
          text = text.replace(item.quoted_status_permalink.url, '')
        }
        // ハッシュタグ
        (item.entities.hashtags || []).reverse().forEach(tag => {
          let regex = new RegExp('#' + tag.text, 'y')
          regex.lastIndex = tag.indices[0]
          text = text.replace(regex, '<a href="#">#' + tag.text + ' </a>')
        });
        // メンション
        (item.entities.user_mentions || []).reverse().forEach(mention => {
          text = text.replace(new RegExp('@' + mention.screen_name, 'g'), `@<a href="#">${mention.screen_name}</a>`)
        });
        // メディア
        ((item.extended_entities || {}).media || []).reverse().forEach(media => {
          text = text.replace(media.url, '')
        });
        // URL
        (item.entities.urls || []).reverse().forEach(url => {
          text = text.replace(new RegExp(url.url, 'g'), `<a target='_blank' href="${url.expanded_url}">` + url.display_url + "</a>")
        });
        return text
      },
    },
    computed: {
      content () {
        return this.autoLinkText(this.item)
      }
    }
  }
})