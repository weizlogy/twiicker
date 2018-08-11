/**
 * 登録済みアカウントのダイレクトメッセージタイムライン.
 */
define(['Vue', 'timeline/tweet-media', 'timeline/tweet-footer', 'timeline/mixin-list'], (Vue, Media, Footer, MixinList) => {
  // タイムライン個々のツイート
  let cTweet = {
    props: ['item'],
    components: {
      'tweet-footer': Footer,
      'tweet-media': Media
    },
    computed: {
      
    },
    template: `
      <div class="timeline--tweet">
        <div>
          <span class="timeline--user-name">{{item.sender.name}}</span>
          <span class="timeline--user-screen_name">@{{item.sender.screen_name}}</span>
        </div>

        <pre v-html="item.text" v-once></pre>

        <hr class="timeline--footer-border">

        <tweet-footer :item="item"></tweet-footer>
      </div>
    `
  }

  return {
    data () {
      return {
        items: [],
        socketEvents: {
          UpdateTimeline: 'c2s-res-directmessage'
        },
        sendNotify: true
      }
    },
    mixins: [
      MixinList
    ],
    components: {
      tweet: cTweet,
    },
    methods: {
      CreateNotifier (item) {
        return {
          'title': item.sender.name,
          'body': item['text']
        }
      }
    },
    template: `
      <div>
        <tweet v-for="item in ordered" :key="item.id_str_twiicker" :item="item"></tweet>
      </div>
    `
  }
})