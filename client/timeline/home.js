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
      <div class="timeline--tweet">
        <div class="timeline--retweet" v-if="item.retweeted_status">
          RT：
          <span class="timeline--user-name">{{item.user_RT_twiicker.name}}</span>
          <span class="timeline--user-screen_name">@{{item.user_RT_twiicker.screen_name}}</span>
        </div>

        <div>
          <span class="timeline--user-name">{{item.user.name}}</span>
          <span class="timeline--user-screen_name">@{{item.user.screen_name}}</span>
        </div>

        <pre v-html="content" v-once></pre>

        <div v-if="item.extended_entities" class="timeline--media">
          <tweet-media v-for="media in item.extended_entities.media" :key="media.media_url_https" :media="media"></tweet-media>
        </div>

        <div class="timeline--cards" v-for="card in twitterCards" :key="card.ogUrl">
          <hr class="timeline--inner-url-border">
          <div style="display: flex; flex-direction: row; flex: 1">
            <div class="filtered-media-container" style="max-width: 200px; max-height: 150px;">
              <a target='_blank' :href="card.ogUrl" style="text-decoration: none;">
                <img :src="card.ogImage.url"></img>
              </a>
            </div>
            <div style="display: flex; flex-direction: column; margin-left: 10px; flex: 2">
              <div style="margin-bottom: 5px;">
                <a target='_blank' :href="card.ogUrl" style="text-decoration: none;">{{card.ogTitle}}</a>
              </div>
              <div style="color: lightgray; font-size: 12px; overflow-y: hidden; max-height: 90px;">{{card.ogDescription}}</div>
            </div>
          </div>
        </div>

        <div class="timeline--quote" v-if="item.quoted_status">
          <hr class="timeline--inner-tweet-border">
          <div>
            <span class="timeline--user-name">{{item.quoted_status.user.name}}</span>
            <span class="timeline--user-screen_name">@{{item.quoted_status.user.screen_name}}</span>
          </div>

          <div v-if="item.quoted_status">
            <pre v-html="item.quoted_status.full_text_twiicker" v-once></pre>
          </div>

          <div v-if="item.quoted_status.extended_entities" class="timeline--media">
            <tweet-media v-for="media in item.quoted_status.extended_entities.media" :key="media.media_url_https" :media="media"></tweet-media>
          </div>
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