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
      hide (event) {
        this.$parent.openEditor(this.user)
      },
      pasted (event) {
        document.execCommand('insertHTML', false, event.clipboardData.getData('text/plain'))
        this.$nextTick(() => { this.contentChanged(event) })
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
        this.$nextTick(() => document.querySelectorAll('.tweet-editor').forEach(element => {
          if (element.style.display != 'none') {
            element.focus()
          }
        }))
      }
    },
    computed: {
      counter () {
        return twttr.parseTweet(this.content)
      }
    },
    template: `
      <div>
        <div>{{reply.text}}</div>
        <div class="tweet-editor" contenteditable="true"
          @input="contentChanged" @keyup.esc="hide" @paste.prevent="pasted" 
          :style="{ 'border-color': '#' + user.profile_link_color }"></div>
        <span class="tweet-editor-container--tweet-counter" :class="{ 'is-text-invalid': !counter.valid }">{{counter.weightedLength}}</span>
        <span class="tweet-editor-container--tweet-action">
          <span @click="tweet" :class="{ 'is-action-disabled': !counter.valid }" style="cursor: pointer;">
            Send
          </span>
        </span>
      </div>
    `
  })
})