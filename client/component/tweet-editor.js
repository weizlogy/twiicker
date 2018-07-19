define(['Vue', 'twttr', 'punycode'], (Vue, twttr) => {
  Vue.component('tweet-editor', {
    props: ['user'],
    data () {
      return {
        content: '',
        reply: {
          text: ''
        }
      }
    },
    methods: {
      contentChanged (event) {
        this.content = event.target.innerText
      },
      hide () {
        this.$parent.openEditor(this.user)
      },
      tweet (event) {
        if (!twttr.parseTweet(this.content).valid) {
          return
        }
        let tid = this.user['reply_id_str']
        Vue.idb.token.get(this.user.id_str, token => {
          Vue.socket.emit('c2s-req-tweet', token, tid, this.content, (tweet, uid) => {
            console.log(`${uid} tweeted.`, tweet)
          })
        })
      },
      update () {
        this.reply.text = this.user['reply_content']
        this.$nextTick(() => document.querySelector('.tweet-editor').focus())
      }
    },
    computed: {
      counter () {
        return twttr.parseTweet(this.content)
      }
    },
    template: `
      <div style="width: 100%; height: 100%;">
        <div>{{reply.text}}</div>
        <div class="tweet-editor" contenteditable="true"
          @input="contentChanged" @keyup.esc="hide" 
          :style="{ 'border-color': '#' + user.profile_link_color }"></div>
        <span :class="{ 'is-text-invalid': !counter.valid }" style="position:relative; right: -50 vw; top: -9px;">{{counter.weightedLength}}</span>
        <span class="tweet-editor-container--tweet-action">
          <span @click="tweet">
            <!-- Forward icon by Icons8 -->
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" viewBox="0 0 512 512" class="icon icons8-Forward" style="width: 30px; height: 30px;" :class="{ 'is-text-invalid': !counter.valid }" ><path d="M256 171V85l171 171-171 171v-86H85V171h171z"></path></svg>
          </span>
        </span>
      </div>
    `
  })
})