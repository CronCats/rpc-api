import axios from 'axios'

class Slack {
  constructor() {
    return this
  }

  getHookUrl(options) {
    if (!options || !options.slackToken) return
    const id = options.slackToken
    return `https://hooks.slack.com/services/${id}`
  }

  send(options = {}) {
    const url = this.getHookUrl(options)
    if (!url) return
    const data = {
      channel: options.slackChannel ? `#${options.slackChannel}` : '#general',
      username: 'Pingbox',
      // Example: 'Alert! You need to do something! <https://url.com|Click here>'
      text: options.text || 'Alert Update!',
      icon_emoji: options.icon || ':incoming_envelope:',
      // icon_url: 'https://url.com/image.png'
      ...options,
    }
    return axios.post(url, JSON.stringify(data)).then(res => (res), err => {
      console.log('err', err)
    })
  }
}

export default new Slack()
