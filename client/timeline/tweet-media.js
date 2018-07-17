define(['Vue'], Vue => {
  return {
    props: ['media'],
    data: function() {
      return {}
    },
    template: `
      <div>
        <a target='_blank' :href="media.media_url_https" v-if="media.type === 'photo'">
          <img class="is-filtered" :src="media.media_url_https" width="100%">
        </a>
        <a target='_blank' :href="media.video_info.variants[1].url" v-if="media.type === 'video'">
          <video controls playsinline class="is-filtered" :src="media.video_info.variants[1].url" :poster="media.media_url_https" width="100%" height="100%"></video>
        </a>
        <a target='_blank' :href="media.video_info.variants[0].url" v-if="media.type === 'animated_gif'">
          <video controls playsinline class="is-filtered" :src="media.video_info.variants[0].url" :poster="media.media_url_https" width="100%" height="100%"></video>
        </a>
      </div>
    `
  }
})