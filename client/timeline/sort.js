define(['Vue'], (Vue) => {
  return {
    timelineOrder (items) {
      return items.sort((a, b) => {
        let c = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (c == 0) {
          c = a.id - b.id
        }
        if (c == 0) {
          c = a.user.id - b.user.id
        }
        return c
      })
    }
  }
})