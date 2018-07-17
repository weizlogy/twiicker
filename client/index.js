define(['Vue', 'timeline/timelines'], (Vue, timelines) => {
  return new Vue({
    el: 'header',
    data: {
      title: 'twiicker',
      version: '',
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
      gohome: function(event) {
        timelines.currentView = 'home'
      },
      gonotify: function(event) {
        timelines.currentView = 'notify'
      },
      godm: function(event) {
        timelines.currentView = 'direct-message'
      },
    }
  })
})