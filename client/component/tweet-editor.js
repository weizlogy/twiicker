define(['Vue', 'twttr', 'punycode'], (Vue, twttr) => {
  Vue.component('tweet-editor', {
    props: ['user'],
    data () {
      return {
        content: '',
        media: [],
        reply: {
          text: ''
        },
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
      async tweet (event) {
        if (!twttr.parseTweet(this.content).valid) {
          return
        }
        let mediaParam = {
          'size': 0
        }
        // メディアファイル指定がある
        if (this.media.length > 0) {
          // メディアのチェックは、APIに任せよ（ぉ
          // 非同期のFileReaderによるファイル読み込みを...
          let tasks = this.media.map(file => {
            return new Promise(resolve => {
              let reader = new FileReader()
              reader.onload = f => {
                // data:image/png;base64,iVBORw....という謎フォーマットからbase64部分を抜き取るため
                file.binary = reader.result.split(',')[1]
                resolve(file)
              }
              // base64で読み込む
              // すでに読んでいたらスキップ
              if (file.binary) {
                resolve(file)
                return
              }
              reader.readAsDataURL(file)
            })
          })
          // 全部揃うの待ってから次に移る
          await Promise.all(tasks).then(media => {
            console.log('Convert media file to base64 encoded strings.', media)
          })
          // socket.ioでArrayをそのままemitできないの？でオブジェクト化
          mediaParam = {
            'size': this.media.reduce((prev, cur) => prev + cur.size, 0),
            'type': this.media[0].type
          }
          console.log(mediaParam)
          mediaParam.binary = this.media.map(m => m.binary).join('')
        }
        let tid = this.user['reply_id_str']
        Vue.idb.token.get(this.user.id_str, token => {
          Vue.socket.emit('c2s-req-tweet', token, tid, this.content, mediaParam, (tweet, uid) => {
            console.log(`${uid} tweeted.`, tweet)
          })
        })
      },
      selectMedia (event) {
        this.$refs['select-media-' + this.user.id_str].click()
      },
      selectedMedia (event) {
        // filesはFileListオブジェクトでforEach未実装とか...
        Array.from(event.target.files).forEach(file => {
          if (file.type.startsWith('image/')) {
            console.log(file)
            file.previewSrc = window.URL.createObjectURL(file)
            this.media.push(file)
          }
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
        let parsed = twttr.parseTweet(this.content)
        // 画像だけでも投稿できるように小細工
        if (parsed.weightedLength == 0 && this.media.length > 0) {
          parsed.valid = true
        }
        return parsed
      }
    },
    template: `
      <div :style="{ 'background-color': '#' + user.profile_link_color }" style="padding: 10px; border-radius: 10px; box-shadow: 0 0 1px 1px;">
        <div style="margin-bottom: 10px;">{{reply.text}}</div>
        <div class="tweet-editor" contenteditable="true"
          @input="contentChanged" @keyup.esc="hide" @paste.prevent="pasted" 
          :style="{ 'border-color': '#' + user.profile_link_color }"></div>
        <span class="tweet-editor-container--tweet-counter" :class="{ 'is-text-invalid': !counter.valid }">{{counter.weightedLength}}</span>
        <span class="tweet-editor-container--tweet-action">
          <span @click="selectMedia" style="cursor: pointer;">
            Media
            <input :ref="'select-media-' + user.id_str" type="file" @change.prevent="selectedMedia" style="display: none;" multiple>
            </input>
          </span>
          <span @click="tweet" :class="{ 'is-action-disabled': !counter.valid }" style="cursor: pointer;">
            Send
          </span>
        </span>
        <div style="display: flex; flex-direction: row;">
          <div v-for="m in media" style="margin-right: 10px;">
            <img :src="m.previewSrc" :alt="m.name" style="width: 20vw;">
          </div>
        </div>
      </div>
    `
  })
})