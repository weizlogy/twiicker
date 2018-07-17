define(['Vue', 'timeline/home', 'timeline/notify', 'timeline/directmessage'], (Vue, Home, Notify, DM) => { 
  return new Vue({
    el: '.l-timeline',
    data: {
      currentView: 'home'
    },
    components: {
      'home': Home,
      'notify': Notify,
      'direct-message': DM,
    }
  })
})