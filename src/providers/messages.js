import EmailProvider from './email'
import Rocketchat from './rocketchat'
import Slack from './slack'
import messages from '../helpers/messageFormatters'
import appMessages from '../helpers/appMessageFormatters'
import { getNetworkFromContractId } from '../helpers/utils'
import { dappSettings, activeDapps } from '../dapps'

// Message Format
//  {
//   account_id: 't.testnet',
//   subscription: {
//     active: true,
//     verified: false,
//     account: 't.testnet',
//     subscribe_block: 30401357,
//     balance: 1.25e+25,
//     referral_code: '-',
//     account_hash: [ 0, 1, 2 ],
//     unsubscribe_block: null,
//     data_hash: null
//   },
//   data: {
//     type: 'Transfer',
//     status: 'success',
//     txHash: 'G4451kRsRvNUkvGhMumvox1bjiihfqB5rW8b9LUqTViB',
//     blockHash: 'HEYvg5TRtospSx2YNan7VTkC5Y2k4trb8YoZ679A21RG',
//     from: 't.testnet',
//     to: 'tttt.t.testnet',
//     actions: [ [Object] ],
//     fee: '22318256250000000000',
//     value: '1.002e+24',
//     valueUSD: '1.232460',
//     feeUSD: '0.000027',
//     logs: [],
//     name: 'transactions',
//     removeOnComplete: true
//   },
//   settings: {
//     email: 'fake@email.me',
//     rocketChatToken: 'bLQGZZmu2E.../...AT9',
//     rocketChatDomain: 'chat.awesome.club',
//     rocketChatChannel: 'alertsnear',
//     slackToken: 'T4.../.../...7I',
//     slackChannel: 'alertsnear',
//   },
//   name: 'messages',
//   removeOnComplete: true
// }
// 
// simple functions to format raw txn data into message payloads and send to external providers
export default class Messages {
  constructor() {
    return this
  }

  isSubscriptionDone(subscription) {
    return !subscription.active // || subscription.unsubscribe_block
  }

  getFormattedMessage(type, data, settings, isDappMessage) {
    const t = `${type}`.toLowerCase()

    // Filter to known dapps OR just regular
    if (isDappMessage) {
      if (!appMessages[t]) return
      return appMessages[t](data, settings)
    } else {
      if (!messages[t]) return
      return messages[t](data, settings)
    }
  }

  // TODO: Do i need to filter only to pingbox settins if is NOT dapp?
  filterMessageBySettings({ type, settings, data, isDappMessage }) {
    if (!settings || !settings.alerts) return
    const network = getNetworkFromContractId(data.to)
    const app_ids = settings.alerts.map(s => {
      // if its a dapp, filter to only settings that are a dapp
      if (isDappMessage)
        return Object.keys(dappSettings[network]).includes(s.app_id) &&
          !activeDapps.pingbox.includes(s.app_id)
            ? s.app_id
            : null
      // otherwise, return only pingbox settings
      return activeDapps.pingbox.includes(s.app_id)
        ? s.app_id
        : null
    }).filter(s => s !== null)

    // Doesnt apply to dapps
    const rootTypes = settings.alerts.map(s => s.type)

    // Filter out settings to only those that apply
    // Rules: 
    // - active network
    // - active app ID
    // - active type
    // - active account id, including specific sub-account IDs
    //   - TODO: respect sub-account IDs settings (if on, filter to only listed ids)
    return settings.alerts.filter(s => {
      const rightNetwork = network === s.network
      const rightApp = app_ids.includes(s.app_id)
      const rightType = isDappMessage ? true : rootTypes.includes(s.type)
      return (rightNetwork && rightApp && rightType)
    })
  }

  send({ type, settings, data, subscription }, isDappMessage) {
    if (process.env.DUMMY_RPC_POLLING !== 'true') {
      if (this.isSubscriptionDone(subscription)) return;
      const alertSettings = this.filterMessageBySettings({ type, settings, data, isDappMessage })
      if (!alertSettings || alertSettings.length <= 0) return;
      settings.alerts = alertSettings
    }

    const payloads = this.getFormattedMessage(type, data, settings, isDappMessage)
    if (!payloads) return;

    // per settings, send to each external provider
    if (payloads.email) this.sendEmail(payloads.email, settings)
    if (payloads.slack) this.sendSlack(payloads.slack, settings)
    if (payloads.rocketchat) this.sendRocketchat(payloads.rocketchat, settings)
  }

  sendEmail(data, settings) {
    const p = new EmailProvider()
    
    try {
      return p.send(data, settings)
    } catch(e) {
      console.log('sendEmail', e)
    }
  }

  sendSlack(data, settings) {
    try {
      return Slack.send({ ...settings, ...data })
    } catch (e) {
      console.log('sendSlack', e)
    }
  }

  sendRocketchat(data, settings) {
    try {
      return Rocketchat.send({ ...settings, ...data })
    } catch (e) {
      console.log('sendRocketchat', e)
    }
  }
}