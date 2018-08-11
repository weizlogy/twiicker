define(['Vue'], Vue => {
  return {
    props: ['media'],
    data: function() {
      return {}
    },
    template: `
      <div class="filtered-media-container" style="width: 25%; max-height: 200px; margin-right: 5px;">
        <a target='_blank' :href="media.media_url_https" v-if="media.type === 'photo'">
          <img :src="media.media_url_https" width="100%">
        </a>
        <a target='_blank' :href="media.video_info.variants[0].url" v-if="media.type === 'video'">
          <video controls :poster="media.media_url_https" width="100%" height="100%">
            <source v-for="variant in media.video_info.variants" :key="variant.url" :src="variant.url" :type="variant.content_type" />
          </video>
        </a>
        <a target='_blank' :href="media.video_info.variants[0].url" v-if="media.type === 'animated_gif'">
          <video controls :poster="media.media_url_https" width="100%" height="100%">
            <source v-for="variant in media.video_info.variants" :key="variant.url" :src="variant.url" :type="variant.content_type" />
          </video>
        </a>
      </div>
    `
  }
})