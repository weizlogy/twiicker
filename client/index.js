define(['Vue', 'timeline/timelines'], (Vue, Timelines) => {
  return new Vue({
    el: 'header',
    data: {
      title: 'twiicker',
      version: '',
      sidemenu: 'メニュー',
      home: 'ホーム',
      notify: '通知',
      dm: 'DM',
    },
    created () {
      Vue.socket.emit('c2s-version', version => {
        console.log('c2s-version: ', version)
        this.version = version
      })
    },
    methods: {
      toggleMenu (event) {
        // 美しくない...
        let target = document.querySelector('.l-user')
        if (target.style.display == '') {
          target.style.display = 'unset'
          return
        }
        target.style.display = ''
      },
      gohome (event) {
        Timelines.currentView = 'home'
      },
      gonotify (event) {
        Timelines.currentView = 'notify'
      },
      godm (event) {
        Timelines.currentView = 'direct-message'
      },
    }
  })
})