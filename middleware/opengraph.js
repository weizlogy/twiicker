const ogs = require('open-graph-scraper')

module.exports.OpenGraph = class OpenGraph {
  async Read (url) {
    return await ogs({ 'url': url }).then(results => {
      return results
    }).catch(error => {
      return error
    })
  }
}