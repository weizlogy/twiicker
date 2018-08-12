define(['Vue', 'timeline/home', 'timeline/notify', 'timeline/directmessage', 'timeline/search'], (Vue, Home, Notify, DM, Search) => { 
  return new Vue({
    el: '.l-timeline',
    data: {
      currentView: 'home'
    },
    components: {
      'home': Home,
      'notify': Notify,
      'direct-message': DM,
      'search': Search,
    },
    watch: {
      currentView (value) {
        if (value == 'search') {
          // あまりいい手ではないが...
          this.$children[3].Clear()
        }
      }
    }
  })
})