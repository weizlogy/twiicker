/**
 * 登録済みアカウントの通知タイムライン.
 */
define(['Vue', 'timeline/tweet-media', 'timeline/tweet-footer', 'timeline/mixin-list', 'timeline/mixin-list-item'], (Vue, Media, Footer, MixinList, MixinListItem) => {
  // タイムライン個々のツイート
  let cTweet = {
    props: ['item'],
    components: {
      'tweet-footer': Footer,
      'tweet-media': Media
    },
    mixins: [
      MixinListItem
    ],
    template: `
      <div class="timeline--tweet">
        <div>
          <span class="timeline--user-name">{{item.user.name}}</span>
          <span class="timeline--user-screen_name">@{{item.user.screen_name}}</span>
        </div>

        <pre v-html="content" v-once></pre>

        <div v-if="item.extended_entities" class="timeline--media">
          <tweet-media v-for="media in item.extended_entities.media" :key="media.media_url_https" :media="media"></tweet-media>
        </div>

        <hr class="timeline--action-border">

        <div class="timeline--actions">
          <reply :item="item"></reply>
          <retweet :item="item"></retweet>
          <quote :item="item"></quote>
          <favorite :item="item"></favorite>
        </div>

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
          UpdateTimeline: 'c2s-res-notify'
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
          'title': item.user.name,
          'body': item['full_text']
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