import Big from 'big.js'
import getNearConfig from './config'
import * as cache from './cache'
import { formatAmount, parseBas64ToJson, getRootAccountIds, getNetworkFromContractId } from './utils'
import { dappSettings } from '../dapps'
import { activeDapps } from '../dapps/pingbox'
import { getMethodAndActions } from '../dapps/sputnik'

// TODO: change this!!
const PINGBOX_WEBSITE_URL = 'https://pingbox.app'
const PINGBOX_REFERRAL_URL = `${PINGBOX_WEBSITE_URL}/onboarding?referral=`
const config = getNearConfig(process.env.NODE_ENV || 'development')

const dappTemplates = {}

// Template vars:
const colors = {
  success: '0eb5ac', // turquoise 500
  error: 'e13a61', // blush 600
}

const hasAlertType = (alertSetting, type) => {
  return alertSetting && alertSetting[type] === true
}

// NOTE: this assumes the dapp settings have been removed?
const returnActivePayloads = (payload, method, data, settings) => {
  if (process.env.DUMMY_RPC_POLLING === 'true') return payload
  const pbxIds = activeDapps
  const activeIds = settings.alerts.map(s => s.active && !pbxIds.includes(s.app_id) ? s.app_id : null).filter(s => s !== null)
  const activeMethods = settings.alerts.map(s => s.active ? s.type : null).filter(s => s !== null)

  // Stop if the method is not active
  if (!activeMethods.includes(method)) return {}
  const activeAlerts = settings.alerts.map(s => s.type === method && activeIds.includes(s.app_id) ? s : null).filter(s => s !== null)
  const alertSetting = activeAlerts && activeAlerts.length > 0 ? activeAlerts[0] : activeAlerts

  const response = {}
  if (hasAlertType(alertSetting, 'email')) response.email = payload.email
  if (hasAlertType(alertSetting, 'slack')) response.slack = payload.slack
  if (hasAlertType(alertSetting, 'rocketchat')) response.rocketchat = payload.rocketchat
  return response
}

const getDefaults = (data, settings) => {
  // const dappSettings = cache.get('dappSettings')
  const network = getNetworkFromContractId(data.to)
  const dappId = getRootAccountIds(data).to || ''
  const dappConfig = dappSettings[network][dappId] || {}
  const dappCtaUrl = dappConfig && dappConfig.metadata && dappConfig.metadata.ctaUrl

  return {
    // Template
    type: 'dappcore',
    theme: 'dark',
    brandIcon: 'https://pingbox.app/dapps/sputnik_logo_color_black.png',
    // brandName: 'Sputnik',
    brandUrl: 'https://sputnik.fund',
    brandColor: '#7600FF',
    brandTagline: 'SputnikDAO is a hub of DAOs empowering communities to create a collective governance centered around decisions, funding & more.',
    ctaTitle: 'View →',
    ctaUrl: dappCtaUrl || `${config.explorerUrl}/transactions/${data.txHash}`,
    referralUrl: `${PINGBOX_REFERRAL_URL}${settings.referralId}`,
    recipientUrl: `${config.explorerUrl}/accounts/${settings.recipient}`,
  }
}

const getSubtitle = data => `
<div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:22px;text-align:left;color:#${data.valueColor};">${data.valueOperator}${formatAmount(data.value)}Ⓝ</div>
<div style="margin:10px 0px 20px;font-family:Futura, Avenir, sans-serif;font-size:21px;font-weight:bold;line-height:22px;text-align:left;color:#e2e2e2;">
  <a href="${config.explorerUrl}/accounts/${data.account}" target="_blank" class="text-primary" style="text-decoration:none">${data.account}</a>
</div>`

// {
//   "type": "FunctionCall",
//   "status": "success",
//   "txHash": "EE6SMeCDnkG2WVvYnHfZgi1gSZiQ47GFDa8p9AdJwJaT",
//   "blockHash": "GJmSM6KMijVQQc2Xy6TLj93P7gmWTT6YqrtGUrT6vzau",
//   "from": "in.testnet",
//   "to": "dao.sputnikv2.testnet",
//   "actions": [
//     {
//       "key": "FunctionCall",
//       "args": {
//         "proposal": {
//           "description": "thanks for being here",
//           "kind": {
//             "Transfer": {
//               "token_id": "",
//               "receiver_id": "t.testnet",
//               "amount": "1337000000000000000000000"
//             }
//           }
//         }
//       },
//       "deposit": "1000000000000000000000000",
//       "gas": 30000000000000,
//       "method_name": "add_proposal"
//       "SuccessValue": '7'
//     }
//   ],
//   "contract": "dao.sputnikv2.testnet",
//   "fee": "242828545724200000000",
//   "value": "1e+24",
//   "logs": []
// }
// 
// New Proposal: payout (Transfer)
// - title: Action Required: Payout Proposal
// - Message: Vote on the transfer of 1.337 N to pay t.testnet. Note: "thanks for being here"
dappTemplates.transfer = (data, actions, settings) => {
  const defaults = getDefaults(data, settings)
  const recipient = actions && actions[0] && actions[0].args && actions[0].args.receiver_id ? actions[0].args.receiver_id : data.to
  const valueOperator = ''
  const valueColor = colors.success
  // https://testnet-v2.sputnik.fund/#/dao.sputnikv2.testnet/11
  const pid = actions && actions[0] && actions[0].SuccessValue ? `/${actions[0].SuccessValue}` : ''
  const ctaUrl = `${defaults.ctaUrl}#/${data.to}${pid}`
  const link = `<${ctaUrl}|Vote Now →>`
  const note = actions && actions[0].args && actions[0].args && actions[0].args.description ? `<br><br>Note: "${actions[0].args.description}"` : ''
  let amount = '0'

  // Find the sub-function call details
  if (actions && actions[0] && actions[0].args) {
    const subArgs = actions[0].args
    if (subArgs && subArgs.amount) amount = subArgs.amount
  }
  const subtitleData = { ...data, value: amount }

  const payload = {
    ...defaults,
    ctaUrl,
    ctaTitle: 'Vote Now →',
    // Email headlines
    subject: `Action Required: Payout Proposal`,
    heading: `Vote on the transfer of ${formatAmount(amount)}Ⓝ to ${recipient}.`,
    // Email body
    title: 'Payout Proposal',
    subtitle: getSubtitle({ ...subtitleData, valueOperator, valueColor, account: recipient }),
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.from} </span>
        is requesting your vote for a payment of
        <span class="text-primary">${formatAmount(amount)}Ⓝ </span>
        ($${Big(data.valueUSD).toPrecision(2)}) 
        to 
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${recipient}.</span>
        from 
        <span>${data.to}.</span> 
        DAO.
        ${note}
      </div>`,
  }

  const text = `*Action Required:*\n*${data.from}* is requesting your vote for a payment of *${formatAmount(amount)}Ⓝ* ($${data.valueUSD}) to *${recipient}* from ${data.to} DAO \n ${link}`
  console.log('transfer text', text);
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'transfer', data, settings)
}

// {
//   "type": "FunctionCall",
//   "status": "success",
//   "txHash": "5mLSwLkgbYVhXsd5cs1aun6HrWg9pT2mp1EgDogX1D4V",
//   "blockHash": "9jPuZKTSoFmB2Pby5tUBCzGmqSHp7TopFTefneTFiuSi",
//   "from": "in.testnet",
//   "to": "dao.sputnikv2.testnet",
//   "actions": [
//     {
//       "key": "FunctionCall",
//       "args": {
//         "proposal": {
//           "description": "i like them, but only short term",
//           "kind": {
//             "AddMemberToRole": {
//               "member_id": "pa.testnet",
//               "role": "council"
//             }
//           }
//         }
//       },
//       "deposit": "1000000000000000000000000",
//       "gas": 30000000000000,
//       "method_name": "add_proposal"
//     }
//   ],
//   "contract": "dao.sputnikv2.testnet",
//   "fee": "242824744636400000000",
//   "value": "1e+24",
//   "logs": []
// }
// 
// New Proposal: new_council (AddMemberToRole)
// - title: Action Required: Add Council Member Proposal
// - Message: Vote on adding t.testnet to the council. Note: "i like them, but only short term"
dappTemplates.addmembertorole = (data, actions, settings) => {
  const defaults = getDefaults(data, settings)
  const recipient = actions && actions[0] && actions[0].args && actions[0].args.member_id ? actions[0].args.member_id : data.to
  const role = actions && actions[0] && actions[0].role ? actions[0].role : 'council'
  // https://testnet-v2.sputnik.fund/#/dao.sputnikv2.testnet/11
  const pid = actions && actions[0] && actions[0].SuccessValue ? `/${actions[0].SuccessValue}` : ''
  const ctaUrl = `${defaults.ctaUrl}#/${data.to}${pid}`
  const link = `<${ctaUrl}|Vote Now →>`
  const note = actions && actions[0].args && actions[0].args && actions[0].args.description ? `<br><br>Note: "${actions[0].args.description}"` : ''

  let subtitle = `
    <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:28px;text-align:left;color:rgba(255,255,255,0.6);">Account: <span style="color:${defaults.brandColor || '#5ab1f1'};">${recipient}</span></div>
    <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:28px;text-align:left;color:rgba(255,255,255,0.6);">Role: <span style="color:${defaults.brandColor || '#5ab1f1'};">${role}</span></div>
  `

  const payload = {
    ...defaults,
    ctaUrl,
    ctaTitle: 'Vote Now →',
    // Email headlines
    subject: `Action Required: Add Member Proposal`,
    heading: `Vote on ${recipient} becoming part of ${data.to}.`,
    // Email body
    title: `Add Member Proposal`,
    subtitle,
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.from} </span>
        is requesting your vote to add
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${recipient} </span>
        to 
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.to}.</span>
        ${note}
      </div>`,
  }

  const text = `*Action Required:*\n*${data.from}* is requesting your vote to add *${recipient}* to ${data.to} as a ${role} member.\n ${link}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'addmembertorole', data, settings)
}

// {
//   "type": "FunctionCall",
//   "status": "success",
//   "txHash": "2ZeGfcfMPmsbpfy9CrnRHJ8i7g3rbq6Ls9XJDiGBW2Fc",
//   "blockHash": "57HAtUuvrbQGUNhbas6AUimgQKrAyBZpgEVN79Ta3frz",
//   "from": "in.testnet",
//   "to": "dao.sputnikv2.testnet",
//   "actions": [
//     {
//       "key": "FunctionCall",
//       "args": {
//         "proposal": {
//           "description": "no whales alloweds",
//           "kind": {
//             "RemoveMemberFromRole": {
//               "member_id": "t.testnet",
//               "role": "council"
//             }
//           }
//         }
//       },
//       "deposit": "1000000000000000000000000",
//       "gas": 30000000000000,
//       "method_name": "add_proposal"
//     }
//   ],
//   "contract": "dao.sputnikv2.testnet",
//   "fee": "242822508702400000000",
//   "value": "1e+24",
//   "logs": []
// }
// 
// New Proposal: remove_council (RemoveMemberFromRole)
// - title: Action Required: Remove Council Member Proposal
// - Message: Vote on removing t.testnet from the council. Note: "no whales alloweds"
dappTemplates.removememberfromrole = (data, actions, settings) => {
  const defaults = getDefaults(data, settings)
  const recipient = actions && actions[0] && actions[0].args && actions[0].args.member_id ? actions[0].args.member_id : data.to
  const role = actions && actions[0] && actions[0].role ? actions[0].role : 'council'
  // https://testnet-v2.sputnik.fund/#/dao.sputnikv2.testnet/11
  const pid = actions && actions[0] && actions[0].SuccessValue ? `/${actions[0].SuccessValue}` : ''
  const ctaUrl = `${defaults.ctaUrl}#/${data.to}${pid}`
  const link = `<${ctaUrl}|Vote Now →>`
  const note = actions && actions[0].args && actions[0].args && actions[0].args.description ? `<br><br>Note: "${actions[0].args.description}"` : ''

  let subtitle = `
    <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:28px;text-align:left;color:rgba(255,255,255,0.6);">Account: <span style="color:${defaults.brandColor || '#5ab1f1'};">${recipient}</span></div>
    <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:28px;text-align:left;color:rgba(255,255,255,0.6);">Role: <span style="color:${defaults.brandColor || '#5ab1f1'};">${role}</span></div>
  `

  const payload = {
    ...defaults,
    ctaUrl,
    ctaTitle: 'Vote Now →',
    // Email headlines
    subject: `Action Required: Remove Member Proposal`,
    heading: `Vote on removing ${recipient} from ${data.to}.`,
    // Email body
    title: `Remove Member Proposal`,
    subtitle,
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.from} </span>
        is requesting your vote to remove
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${recipient} </span>
        from 
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.to}.</span>
        ${note}
      </div>`,
  }

  const text = `*Action Required:*\n*${data.from}* is requesting your vote to remove the ${role} member *${recipient}* from ${data.to}.\n ${link}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'removememberfromrole', data, settings)
}

// {
//   "type": "FunctionCall",
//   "status": "success",
//   "txHash": "6bZLtqBLkuKQN6w2qKF8G6hcoFzB4D7XSTK7od9M5asz",
//   "blockHash": "2u3wpgLWxW566etaZNQFZ49K1y4uWLFAzraV1Fvqy1iq",
//   "from": "in.testnet",
//   "to": "dao.sputnikv2.testnet",
//   "actions": [
//     {
//       "key": "FunctionCall",
//       "args": {
//         "proposal": {
//           "description": "do not approve this",
//           "kind": {
//             "FunctionCall": {
//               "receiver_id": "cron.in.testnet",
//               "actions": [
//                 {
//                   "method_name": "create_task",
//                   "args": {
//                     "contract_id": "crud.in.testnet",
//                     "function_id": "tick",
//                     "cadence": "0 */2 * * * *",
//                     "recurring": true,
//                     "deposit": "0"
//                   },
//                   "deposit": "1000000000000000000000000",
//                   "gas": "150000000000000"
//                 }
//               ]
//             }
//           }
//         }
//       },
//       "deposit": "1000000000000000000000000",
//       "gas": 250000000000000,
//       "method_name": "add_proposal"
//     }
//   ],
//   "contract": "dao.sputnikv2.testnet",
//   "fee": "242877512678800000000",
//   "value": "1e+24",
//   "logs": []
// }
// 
// New Proposal: function_call (FunctionCall, cron.in.testnet, create_task)
// - title: Action Required: Contract Function Call Proposal
// - Message: Vote on allowing dao.sputnikv2.testnet to make a contract call to cron.in.testnet using the method "create_task". Note: "do not approve this"
dappTemplates.functioncall = (data, actions, settings) => {
  const defaults = getDefaults(data, settings)
  // https://testnet-v2.sputnik.fund/#/dao.sputnikv2.testnet/11
  const pid = actions && actions[0] && actions[0].SuccessValue ? `/${actions[0].SuccessValue}` : ''
  const ctaUrl = `${defaults.ctaUrl}#/${data.to}${pid}`
  const link = `<${ctaUrl}|Vote Now →>`
  const note = actions && actions[0].args && actions[0].args && actions[0].args.description ? `<br><br>Note: "${actions[0].args.description}"` : ''
  let method, deposit = '0', recipient = data.to

  // Find the sub-function call details
  if (actions && actions[0] && actions[0].args && actions[0].args.actions && actions[0].args.actions[0]) {
    const subActions = actions[0].args.actions[0]
    if (subActions && subActions.deposit) deposit = subActions.deposit
    if (subActions && subActions.method_name) method = subActions.method_name
    if (subActions && subActions.receiver_id) recipient = subActions.receiver_id
  }
  if (actions && actions[0] && actions[0].args) {
    const subArgs = actions[0].args
    if (subArgs && subArgs.receiver_id) recipient = subArgs.receiver_id
  }

  const payload = {
    ...defaults,
    ctaUrl,
    ctaTitle: 'Vote Now →',
    // Email headlines
    subject: `Action Required: DAO Function Call Proposal`,
    heading: `Vote on allowing ${data.to} to trigger ${recipient}.${method}(...)`,
    // Email body
    title: `Function Call Proposal`,
    subtitle: '',
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.from} </span>
        is requesting your vote to trigger
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${recipient}.${method}(...) </span>
        with 
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.to}.</span> 
        Trigger will also transfer a deposit of  
        <span class="text-primary">${formatAmount(deposit)}Ⓝ </span>
        ${note}
      </div>`,
  }

  const text = `*Action Required:*\n*${data.from}* is requesting your vote to trigger *${recipient}.${method}(...)* from ${data.to}.\n ${link}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'functioncall', data, settings)
}

// {
//   "type": "FunctionCall",
//   "status": "success",
//   "txHash": "99t3pKwmHLaNXQ2QesKuAuPLev455bxgJtsSf87hw9uB",
//   "blockHash": "3hTUPZ7Xku4tKX1UGvnjHkhg4WEFacLj6Pqmi9hmLZva",
//   "from": "in.testnet",
//   "to": "dao.sputnikv2.testnet",
//   "actions": [
//     {
//       "key": "FunctionCall",
//       "args": {
//         "proposal": {
//           "description": "its just a token so what",
//           "kind": {
//             "FunctionCall": {
//               "receiver_id": "tokenfactory.testnet",
//               "actions": [
//                 {
//                   "method_name": "create_token",
//                   "args": {
//                     "args": {
//                       "owner_id": "dao.sputnikv2.testnet",
//                       "total_supply": "1337000000000000000000",
//                       "metadata": {
//                         "spec": "ft-1.0.0",
//                         "name": "Dao Funds",
//                         "symbol": "DAO",
//                         "icon": "",
//                         "decimals": 18
//                       }
//                     }
//                   },
//                   "deposit": "5000000000000000000000000",
//                   "gas": "150000000000000"
//                 }
//               ]
//             }
//           }
//         }
//       },
//       "deposit": "1000000000000000000000000",
//       "gas": 200000000000000,
//       "method_name": "add_proposal"
//     }
//   ],
//   "contract": "dao.sputnikv2.testnet",
//   "fee": "242898754051800000000",
//   "value": "1e+24",
//   "logs": []
// }
// 
// New Proposal: function_call_create_token (FunctionCall, tokenfactory.testnet, create_token)
// - title: Action Required: Governance Token Proposal
// - Message: Vote on issuing a governance token to be used by dao.sputnikv2.testnet. Token will be called "Dao Funds" and have a supply of 1337 $DAO. Note: "its just a token so what"
dappTemplates.functioncalltoken = (data, actions, settings) => {
  const defaults = getDefaults(data, settings)
  // https://testnet-v2.sputnik.fund/#/dao.sputnikv2.testnet/11
  const pid = actions && actions[0] && actions[0].SuccessValue ? `/${actions[0].SuccessValue}` : ''
  const ctaUrl = `${defaults.ctaUrl}#/${data.to}${pid}`
  const link = `<${ctaUrl}|Vote Now →>`
  const note = actions && actions[0].args && actions[0].args && actions[0].args.description ? `<br><br>Note: "${actions[0].args.description}"` : ''
  let tokenName, tokenSymbol, icon, decimals, total_supply, deposit = '0'
  // if (actions && actions[0] && actions[0].deposit) deposit = actions[0].deposit

  // Find the sub-function call details
  if (actions && actions[0] && actions[0].args && actions[0].args.actions && actions[0].args.actions[0]) {
    const subActions = actions[0].args.actions[0]
    if (subActions && subActions.deposit) deposit = subActions.deposit
    let subArgs = subActions.args ? parseBas64ToJson(subActions.args) : null
    if (subArgs.args && subArgs.args && subArgs.args.metadata) {
      const meta = subArgs.args.metadata
      total_supply = subArgs.args.total_supply
      tokenName = meta.name
      tokenSymbol = meta.symbol
      decimals = meta.decimals
      icon = meta.icon
    }
  }

  let subtitle = `
    <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:28px;text-align:left;color:rgba(255,255,255,0.6);">Name: <span style="color:${defaults.brandColor || '#5ab1f1'};">${tokenName}</span></div>
    <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:28px;text-align:left;color:rgba(255,255,255,0.6);">Symbol: <span style="color:${defaults.brandColor || '#5ab1f1'};">${tokenSymbol}</span></div>
  `

  // if (total_supply) subtitle += `<div style="margin:10px 0px 20px;font-family:Futura, Avenir, sans-serif;font-size:21px;font-weight:bold;line-height:22px;text-align:left;color:#e2e2e2;">Supply: ${total_supply}</div>`

  const payload = {
    ...defaults,
    ctaUrl,
    ctaTitle: 'Vote Now →',
    // Email headlines
    subject: `Action Required: Governance Token Proposal`,
    heading: `Vote on issuing a governance token to be used by ${data.to}`,
    // Email body
    title: `Issue Governance Token`,
    subtitle,
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.from} </span>
        is requesting you to approve the issuance of 
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${tokenName} (${tokenSymbol}) </span>
        token for 
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.to}.</span> 
        Upon approval, ${data.to} will transfer an initial supply balance of 
        <span class="text-primary">${formatAmount(deposit)}Ⓝ </span>
        ${note}
      </div>`,
  }

  const text = `*Action Required:*\n*${data.from}* is requesting your vote on issuing the *${tokenName} (${tokenSymbol})* governance token to be used by the *${data.to}* DAO.\n ${link}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'functioncalltoken', data, settings)
}

// Act Proposal - Triggers to the original proposer only, to tell them its done.
//   * approve (VoteApprove)
//   * reject  (VoteReject)
//   * remove  (VoteRemove)
dappTemplates.actproposal = (data, actions, settings, method) => {
  const defaults = getDefaults(data, settings)
  // https://testnet-v2.sputnik.fund/#/dao.sputnikv2.testnet/11
  const pid = actions && actions[0] && actions[0].SuccessValue ? `/${actions[0].SuccessValue}` : ''
  const ctaUrl = `${defaults.ctaUrl}#/${data.to}${pid}`
  const link = `<${ctaUrl}|View Outcome →>`
  let actionType

  if (actions && actions[0] && actions[0].args) {
    const subArgs = actions[0].args
    if (subArgs && subArgs.action) actionType = subArgs.action
  }

  let status = 'Approved'
  if (actionType === 'VoteReject') status = 'Rejected'
  if (actionType === 'VoteRemoved') status = 'Removed'

  let proposalType = 'payment'
  if (method === 'functioncall') proposalType = 'contract function call'
  if (method === 'functioncalltoken') proposalType = 'governance token'
  if (method === 'addmembertorole') proposalType = 'add member'
  if (method === 'removememberfromrole') proposalType = 'remove member'

  const payload = {
    ...defaults,
    ctaUrl,
    ctaTitle: 'View Outcome →',
    // Email headlines
    subject: `Proposal ${status}`,
    heading: `Your proposal to ${data.to} has finalized.`,
    // Email body
    title: `Proposal ${status}`,
    subtitle: '',
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        Your 
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${proposalType} </span>
        proposal to
        <span style="color:${defaults.brandColor || '#5ab1f1'};">${data.to}</span> 
        has finalized.
      </div>`,
  }

  const text = `*Proposal ${status}:*\nYour ${proposalType} proposal to ${data.to} has finalized.\n ${link}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'actproposal', data, settings)
}

// TODO: Support Bounty type once its available
// 1. Setup logic split for "functioncall" type, split by method & payload params
// 2. Setup triggers for sputnik actions
// 3. get council from dao.sputnikv2.testnet, dapp specific pre-reqs for messages, generic method that then uses sputnik logic to query council
const functioncall = (data, settings) => {
  const { actions, method } = getMethodAndActions(data)

  if (process.env.DUMMY_RPC_POLLING !== 'true') {
    const activeMethods = settings.alerts.map(s => s.active ? s.type : null).filter(s => s !== null)

    // Stop if the method is not active
    if (!activeMethods.includes(method)) return {}
  }

  // TODO: Filter to methods active on settings
  // find an available template, and format!
  if (method && dappTemplates[method]) return dappTemplates[method](data, actions, settings, method)
  return {}
}

// NOTE: Eventually this will move into ceramic.network or similar, and be configured by dapps
export default {
  functioncall,
}