define(['Vue', 'moment', 'user/users'], (Vue, moment, Users) => {
  return {
    props: ['item'],
    data () {
      return {}
    },
    fromNow: function(item) {
      return moment(new Date(item.created_at)).fromNow()
    },
    computed: {
      fromUser () {
        let foundUser = Users.items.find(user => user.id_str === this.item.from_user_id) || {}
        return foundUser.name
      },
      fromNow () {
        return moment(new Date(this.item.created_at)).fromNow()
      },
    },
    template: `
      <div class="timeline--footer">
        <span class="timeline--footer--from-user">{{fromUser}}</span>,
        <span class="timeline--footer--source" v-html="item.source"></span>,
        <span class="timeline--footer--created-at">{{fromNow}}</span>
      </div>
    `
  }
})