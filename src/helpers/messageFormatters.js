import Big from 'big.js'
import getNearConfig from './config'
import { percentChange, formatAmount, getNetworkFromContractId } from './utils'
import { dappSettings } from '../dapps/pingbox'

// TODO: change this!!
const PINGBOX_WEBSITE_URL = 'https://pingbox.app'
const PINGBOX_REFERRAL_URL = `${PINGBOX_WEBSITE_URL}/onboarding?referral=`
const config = getNearConfig(process.env.NODE_ENV || 'development')

// Template vars:
const colors = {
  success: '0eb5ac', // turquoise 500
  error: 'e13a61', // blush 600
}

const hasAlertType = (alertSetting, type) => {
  return alertSetting && alertSetting[type] === true
}

// NOTE: this assumes the dapp settings have been removed?
const returnActivePayloads = (payload, type, data, settings) => {
  if (process.env.DUMMY_RPC_POLLING === 'true') return payload
  const network = getNetworkFromContractId(data.to)
  const activeIds = Object.keys(dappSettings[network])
  if (!settings.alerts) return {}
  const activeMethods = settings.alerts.map(s => s.active ? s.type : null).filter(s => s !== null)

  // Stop if the method is not active
  if (!activeMethods.includes(type)) return {}
  const activeAlerts = settings.alerts.map(s => s.type === type && activeIds.includes(s.app_id) ? s : null).filter(s => s !== null)
  const alertSetting = activeAlerts && activeAlerts.length > 0 ? activeAlerts[0] : activeAlerts

  const response = {}
  if (hasAlertType(alertSetting, 'email')) response.email = payload.email
  if (hasAlertType(alertSetting, 'slack')) response.slack = payload.slack
  if (hasAlertType(alertSetting, 'rocketchat')) response.rocketchat = payload.rocketchat
  return response
}

const getDefaults = (data, settings) => {
  return {
    // Template
    type: 'nearcore',
    theme: 'dark',
    ctaTitle: 'View receipt',
    ctaUrl: `${config.explorerUrl}/transactions/${data.txHash}`,
    referralUrl: `${PINGBOX_REFERRAL_URL}${settings.referralId}`,
    recipientUrl: `${config.explorerUrl}/accounts/${settings.recipient}`,
  }
}

const getSubtitle = data => `
<div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:22px;text-align:left;color:#${data.valueColor};">${data.valueOperator}${formatAmount(data.value)}Ⓝ</div>
<div style="margin:10px 0px 20px;font-family:Futura, Avenir, sans-serif;font-size:21px;font-weight:bold;line-height:22px;text-align:left;color:#e2e2e2;">
  <a href="${config.explorerUrl}/accounts/${data.account}" target="_blank" class="text-primary" style="text-decoration:none">${data.account}</a>
</div>`

const getContractFunctionMethods = transaction => {
  return transaction.actions.map(a => {
    if (typeof a === 'object' && a.FunctionCall) return a.FunctionCall.method_name
    if (a && a.method_name) return a.method_name
    return `${a}`
  })
}

// RAW DATA:
// data: {
//   type: 'Transfer',
//   status: 'success',
//   txHash: 'G4451kRsRvNUkvGhMumvox1bjiihfqB5rW8b9LUqTViB',
//   blockHash: 'HEYvg5TRtospSx2YNan7VTkC5Y2k4trb8YoZ679A21RG',
//   from: 't.testnet',
//   to: 'tttt.t.testnet',
//   actions: [ [Object] ],
//   fee: '22318256250000000000',
//   value: '1.002e+24',
//   valueUSD: '1.232460',
//   feeUSD: '0.000027',
//   logs: [],
//   name: 'transactions',
//   removeOnComplete: true
// },
// settings: {
//   referralId: 1234567890,
// },
const transfer = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const recipient = data.recipient || data.to || data.from
  const incoming = data.to === recipient
  const valueOperator = !incoming ? '-' : ''
  const valueColor = !incoming ? colors.error : colors.success
  const formattedValue = formatAmount(data.value)
  const payload = {
    ...defaults,
    // Email headlines
    subject: `New transfer to your account`,
    heading: incoming
      ? `${data.from} sent ${formattedValue}Ⓝ to your account ${recipient}`
      : `Your transfer of ${formattedValue}Ⓝ to ${data.from} was successful`,
    // Email body
    title: 'Balance Transfer',
    subtitle: getSubtitle({ ...data, valueOperator, valueColor, account: recipient }),
    message: incoming
      ? `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        <span style="color:#5ab1f1;">${data.from} </span> 
        sent 
        <span class="text-primary">${formattedValue}Ⓝ </span>
        ($${data.valueUSD}) 
        to your account 
        <span style="color:#5ab1f1;">${data.to}.</span>
      </div>`
      : `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        Your transfer of 
        <span class="text-primary">${formattedValue}Ⓝ </span>
        ($${data.valueUSD}) 
        to 
        <span style="color:#5ab1f1;">${data.from} </span>
        was successful
      </div>`,
  }

  const link = `<https://explorer.mainnet.near.org/transactions/${data.txHash}|View receipt →>`
  const text = incoming
    ? `*${data.from}* sent *${formattedValue}Ⓝ* ($${data.valueUSD}) to your account *${recipient}*!\n ${link}`
    : `Your transfer of *${formattedValue}Ⓝ* ($${data.valueUSD}) to *${data.from}* was successful!\n ${link}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'transfer', data, settings)
}

// RAW DATA:
// deposit_and_stake.json {
//   type: 'FunctionCall',
//   status: 'success',
//   txHash: 'HNHqsQSTZLSuuMe42VKzuL4zwAQKuQmMQJvECoJWwUSw',
//   blockHash: '8AQDw6fP1pHzFKbfBg574P6axtwvEBVQeDx3FA9mUH4K',
//   from: 'stakewars.testnet',
//   to: 'rioblocks.pool.f863973.m0',
//   actions: [ { FunctionCall: [Object] } ],
//   contract: 'rioblocks.pool.f863973.m0',
//   fee: '242796348274600000000',
//   value: '7.5e+28',
//   valueUSD: '99000.000000',
//   feeUSD: '0.000320',
//   logs: [
//     'Epoch 42: Contract received total rewards of 1394298492229200000000 tokens. New total staked balance is 450001394298491229200000000. Total number of shares 450000139429459410347155043',
//     'Total rewards fee is 139429460410347155043 stake shares.',
//     '@stakewars.testnet deposited 75000000000000000000000000000. New unstaked balance is 75000000000000000000000000000',
//     '@stakewars.testnet staking 74999999999999999999999999999. Received 74999790855809384478802670311 new staking shares. Total 1 unstaked balance and 74999790855809384478802670311 staking shares',
//     'Contract total staked balance is 75450001394298491229200000000. Total number of shares 75449790995238843889149825354'
//   ]
// }
// settings: {
//   referralId: 1234567890,
// },
const stakedeposit = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const valueOperator = ''
  const valueColor = colors.success
  const formattedValue = formatAmount(data.value)
  const payload = {
    ...defaults,
    // Email headlines
    subject: `Staking amount deposited and earning rewards!`,
    heading: `You have started staking ${formattedValue}Ⓝ with ${data.to}`,
    // Email body
    title: 'Stake Deposit',
    subtitle: getSubtitle({ ...data, valueOperator, valueColor, account: data.from }),
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
      Your funds are now staking with 
      <span style="color:#5ab1f1;">${data.to}</span>, 
      earning compounding rewards until you decide to stop.
    </div>`,
  }

  const text = payload.heading
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'stakedeposit', data, settings)
}

// RAW DATA:
// withdraw_all.json {
//   type: 'FunctionCall',
//   status: 'success',
//   txHash: 'HNHqsQSTZLSuuMe42VKzuL4zwAQKuQmMQJvECoJWwUSw',
//   blockHash: '8AQDw6fP1pHzFKbfBg574P6axtwvEBVQeDx3FA9mUH4K',
//   from: 'stakewars.testnet',
//   to: 'rioblocks.pool.f863973.m0',
//   actions: [ { FunctionCall: [Object] } ],
//   contract: 'rioblocks.pool.f863973.m0',
//   fee: '242796348274600000000',
//   value: '7.5e+28',
//   valueUSD: '99000.000000',
//   feeUSD: '0.000320',
// }
// settings: {
//   referralId: 1234567890,
// },
const stakewithdraw = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const valueOperator = '+'
  const valueColor = colors.success
  const initBalance = formatAmount(settings.balance)
  const finBalance = Big(initBalance).plus(data.value).toFixed(2)
  const increasePercent = percentChange(
    parseFloat(initBalance),
    parseFloat(finBalance),
  )
  const payload = {
    ...defaults,
    // Email headlines
    subject: `Staking reward available for withdrawal`,
    heading: `Your rewards of ${Big(data.value).toPrecision(4)}Ⓝ are available to claim`,
    // Email body
    title: 'Stake Reward',
    subtitle: getSubtitle({ ...data, valueOperator, valueColor, account: data.from }),
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
      Your staking reward of 
      <span class="text-primary">${Big(data.value).toPrecision(4)}Ⓝ </span> 
      is available to withdraw! <br/>
      You earned $${Big(data.valueUSD).toPrecision(2)}, thats an increase of ${increasePercent}%!
    </div>`,
  }

  const text = payload.heading
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'stakewithdraw', data, settings)
}

// RAW DATA:
// referral_reward.json {
//   type: 'FunctionCall',
//   status: 'success',
//   txHash: 'HNHqsQSTZLSuuMe42VKzuL4zwAQKuQmMQJvECoJWwUSw',
//   blockHash: '8AQDw6fP1pHzFKbfBg574P6axtwvEBVQeDx3FA9mUH4K',
//   from: 'stakewars.testnet',
//   to: 'rioblocks.pool.f863973.m0',
//   actions: [ { FunctionCall: [Object] } ],
//   contract: 'rioblocks.pool.f863973.m0',
//   fee: '242796348274600000000',
//   value: '7.5e+28',
//   valueUSD: '99000.000000',
//   feeUSD: '0.000320',
// }
// settings: {
//   referralId: 1234567890,
// },
const referralreward = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const valueOperator = '+'
  const valueColor = colors.success
  const payload = {
    ...defaults,
    // Email headlines
    subject: `You earned a referral reward!`,
    heading: `Thanks for sharing pingbox with your friends`,
    // Email body
    title: 'Referral Reward Earned',
    subtitle: getSubtitle({ ...data, valueOperator, valueColor, account: data.to }),
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
      You earned 
      <span class="text-primary">1Ⓝ </span>
      by referring your friend 
      <span style="color:#5ab1f1;">${data.from}</span> 
      to pingbox! Keep up the great work!
    </div>`,
  }

  const text = `You earned a referral reward! Thanks for sharing pingbox with your friends`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'referralreward', data, settings)
}

// RAW DATA:
// access_keys_functions.json, access_keys_delete.json {
//   type: 'DeleteKey', || type: 'AddKey',
//   status: 'success',
//   txHash: 'HNHqsQSTZLSuuMe42VKzuL4zwAQKuQmMQJvECoJWwUSw',
//   blockHash: '8AQDw6fP1pHzFKbfBg574P6axtwvEBVQeDx3FA9mUH4K',
//   from: 'stakewars.testnet',
//   to: 'rioblocks.pool.f863973.m0',
//   actions: [ { FunctionCall: [Object] } ],
//   contract: 'rioblocks.pool.f863973.m0',
//   fee: '242796348274600000000',
//   value: '7.5e+28',
//   valueUSD: '99000.000000',
//   feeUSD: '0.000320',
// }
// settings: {
//   referralId: 1234567890,
// },
const accesskeys = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const isDel = data.type === 'DeleteKey'
  const accessType = data.type.replace('Key', ' Key')
  const recipient = data.recipient || data.to
  const payload = {
    ...defaults,
    // Email headlines
    subject: `Access Key Changed`,
    heading: `Please confirm this access key update was intentional`,
    // Email body
    title: 'Access Key Change',
    subtitle: '',
    message: isDel
      ? `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        An access key was removed from your account 
        <span style="color:#5ab1f1;">${recipient}</span>
      </div>`
      : `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
        New access key added to your account 
        <span style="color:#5ab1f1;">${recipient}</span>
      </div>`,
  }

  const text = `New ${accessType} key added to your account ${recipient}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'accesskeys', data, settings)
}

// RAW DATA:
// deploy_contract.json {
//   type: 'DeployContract',
//   status: 'success',
//   txHash: '746uBfSEKzp8KA42VLjyr2ZAd6Go6724EzVkc8Zaa7Qm',
//   blockHash: '8CvSi61xbS9hVx5FxzD1gzHJ4GyKGjgnqu3ifDiqnHRc',
//   from: 'zodtv.testnet',
//   to: 'zodtv.testnet',
//   actions: [ { DeployContract: [Object] } ],
//   contract: 'zodtv.testnet',
//   fee: '49562097823400000000',
//   value: '0',
//   valueUSD: '0.000000',
//   feeUSD: '0.000065',
//   logs: []
// }
// deploy_contract_with_args.json {
//   type: 'DeployContract',
//   status: 'success',
//   txHash: '5mCdRT6gDUxgawXZWaVJUrEuEGhVRzx3jFtobrBgaz4C',
//   blockHash: 'CVsmaWPMqqEvo12EKYVQ8Ciw6wSuNuicrdVVhp5n6toN',
//   from: 'client.kwsantiago.testnet',
//   to: 'client.kwsantiago.testnet',
//   actions: [ { DeployContract: [Object] }, { FunctionCall: [Object] } ],
//   contract: 'client.kwsantiago.testnet',
//   fee: '375048762371200000000',
//   value: '0',
//   valueUSD: '0.000000',
//   feeUSD: '0.000495',
//   logs: []
// }
// settings: {
//   referralId: 1234567890,
// },
const contractdeploy = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const accountVerb = data.to.split('.').length > 2 ? 'sub-account' : 'account'
  const payload = {
    ...defaults,
    // Email headlines
    subject: `Contract Deployed`,
    heading: `An account you own has contract code updates`,
    // Email body
    title: 'Contract Deployed',
    subtitle: '',
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
      New contract deployed to your ${accountVerb} 
      <span style="color:#5ab1f1;">${data.to}</span>
    </div>`,
  }

  const text = `Contract deployed to your ${accountVerb} ${data.to}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'contractdeploy', data, settings)
}

// RAW DATA:
// create_sub_account.json {
//   type: 'CreateAccount',
//   status: 'success',
//   txHash: '6WEkJL9psLgA3TqrfAUwdFyMeM3mWas1DjpJvZfSLh8L',
//   blockHash: 'BZMN2pvQzz1jQqB4bozxE4DRvzYACYu1u6c1HZanpczK',
//   from: 't.testnet',
//   to: 'tttt.t.testnet',
//   actions: [ 'CreateAccount', { Transfer: [Object] }, { AddKey: [Object] } ],
//   fee: '42455506250000000000',
//   value: '1e+24',
//   valueUSD: '1.320000',
//   feeUSD: '0.000056',
//   logs: []
// }
// settings: {
//   referralId: 1234567890,
// },
const subaccountcreate = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const payload = {
    ...defaults,
    // Email headlines
    subject: `New Sub Account Created`,
    heading: `A new account is available under your root account ${data.from}`,
    // Email body
    title: 'Sub Account Created',
    subtitle: '',
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
      New account 
      <span style="color:#5ab1f1;">${data.to}</span>
      created under your account 
      <span style="color:#5ab1f1;">${data.from}</span>
    </div>`,
  }

  const text = `A new account "${data.to}" is available under your root account ${data.from}`
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'subaccountcreate', data, settings)
}

// RAW DATA:
// contract_function_call.json {
//   type: 'FunctionCall',
//   status: 'success',
//   txHash: '9eESRnvrAMuyzQWPLnSiGa9YA7kSk2NzvjXm1y5ikLY2',
//   blockHash: '9Q9Z59bfjK2FihM2p4JXqXogFTSr2QJJnjojzoDppaE8',
//   from: 'std_reference_basic.price_oracle.testnet',
//   to: 'std_reference_basic.price_oracle.testnet',
//   actions: [ { FunctionCall: [Object] } ],
//   contract: 'std_reference_basic.price_oracle.testnet',
//   fee: '242870804876800000000',
//   value: '0',
//   valueUSD: '0.000000',
//   feeUSD: '0.000321',
//   logs: [
//     'relay: BTC,23798604825000,1608498885000000000,345580',
//     'relay: ETH,649430000000,1608498885000000000,345580',
//     'relay: XRP,573188000,1608498885000000000,345580',
//     'relay: BCH,356580000000,1608498885000000000,345580',
//     'relay: LTC,116225000000,1608498885000000000,345580',
//     'relay: PBTC,25358183200000,1608498837000000000,345573'
//   ]
// }
// contract_function_call_2.json {
//   type: 'FunctionCall',
//   status: 'success',
//   txHash: '5iGkRv7nGBdjWuGpAPo7psJPRSvmvNohJ1gT4VXa1ojE',
//   blockHash: 'GcBqVgasvvdajiyfsiY5RkngdWhkrqavFWDQSJDPaZab',
//   from: 'client.kwsantiago.testnet',
//   to: 'near-link.kwsantiago.testnet',
//   actions: [ { FunctionCall: [Object] } ],
//   contract: 'near-link.kwsantiago.testnet',
//   fee: '242809093098400000000',
//   value: '6.96e+22',
//   valueUSD: '0.091872',
//   feeUSD: '0.000321',
//   logs: [ 'Refunding 36500000000000000000000 tokens for storage' ]
// }
// settings: {
//   referralId: 1234567890,
// },
const functioncall = (data, settings) => {
  const defaults = getDefaults(data, settings)
  const methods = getContractFunctionMethods(data)
  const method = methods[0]
  const valueColor = colors.success
  const payload = {
    ...defaults,
    // Email headlines
    subject: `Contract Call on ${data.to}`,
    heading: `Your contract was called by ${data.from} using method ${method}`,
    // Email body
    title: 'Contract Call',
    subtitle: `<div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:22px;text-align:left;color:#${valueColor};">${method}</div>
      <div style="margin:10px 0px 20px;font-family:Futura, Avenir, sans-serif;font-size:21px;font-weight:bold;line-height:22px;text-align:left;color:#e2e2e2;">
        <a href="${config.explorerUrl}/accounts/${data.to}" target="_blank" class="text-primary" style="text-decoration:none">${data.to}</a>
      </div>`,
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-tertiarary">
      <span style="color:#5ab1f1;">${data.from}</span>
      called method 
      <span class="text-primary">${method} </span>
      on your contract
      <span style="color:#5ab1f1;">${data.to}</span>
    </div>`,
  }

  const text = payload.heading
  return returnActivePayloads({
    email: { ...data, ...payload },
    slack: { text },
    rocketchat: { text: text.replace(/\n/g, ' ') },
  }, 'functioncall', data, settings)
}

export default {
  accesskeys,
  contractdeploy,
  functioncall,
  referralreward,
  stakedeposit,
  stakewithdraw,
  subaccountcreate,
  transfer,
}