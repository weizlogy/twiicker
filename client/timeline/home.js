/**
 * 登録済みアカウントのホームタイムライン.
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
      <div class="timeline--tweet" ontouchstart>
        <div class="timeline--retweet" v-if="item.retweeted_status">
          RT：
          <span class="timeline--user-name">{{item.user_RT_twiicker.name}}</span>
          <span class="timeline--user-screen_name">@{{item.user_RT_twiicker.screen_name}}</span>
        </div>

        <div>
          <span class="timeline--user-name">{{item.user.name}}</span>
          <span class="timeline--user-screen_name">@{{item.user.screen_name}}</span>
        </div>

        <tweet-content :item="item" :render="__render" v-once></tweet-content>

        <div v-if="item.extended_entities" class="timeline--media">
          <tweet-media v-for="media in item.extended_entities.media" :key="media.media_url_https" :media="media"></tweet-media>
        </div>

        <twiter-cards :card="card" v-for="card in twitterCards" :key="card.ogUrl"></twiter-cards>

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
          UpdateTimeline: 'c2s-res-timeline'
        },
        sendNotify: false
      }
    },
    mixins: [
      MixinList
    ],
    components: {
      tweet: cTweet,
    },
    template: `
      <div>
        <tweet v-for="item in ordered" :key="item.id_str_twiicker" :item="item"></tweet>
      </div>
    `
  }
})