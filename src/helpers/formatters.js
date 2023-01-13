import Big from 'big.js'
import { formatCurrencyAmount } from './utils'

// Message Format
// {
//   type: '',
//   subject: '',
//   body: {},
//   referral: {},
// }
// 
// simple functions to format raw txn data into flattened message payloads
export default class Formatters {
  constructor() {
    return this
  }

  isContract(type) {
    if (!type) return false
    return ['FunctionCall', 'AddKey', 'DeployContract'].includes(type)
  }

  getValueFromTxn(items) {
    if (!items || items.length < 1) return 0
    let value = Big('0')

    items.forEach(i => {
      if (typeof i !== 'string') {
        // loop the action objects to look for deposits
        Object.keys(i).forEach(item => {
          if (i[item].deposit) value = Big(i[item].deposit).plus(value)
          // if (i[item].deposit) value = BigNumber(i[item].deposit).plus(value).toString()
          // if (i[item].deposit) value = BigNumber(utils.format.formatNearAmount(i[item].deposit)).plus(value).toString()
        })
      }
    })

    return value.toString()
  }

  getQuoteForValue(num, rate) {
    if (!num || !rate) return
    return formatCurrencyAmount(num, rate)
  }

  // Returns type of txn based on raw data
  getTxnType(raw) {
    if (!raw || !raw.transaction || !raw.transaction.actions || raw.transaction.actions.length < 1) return 'Unknown'

    // return first action type
    return raw.transaction.actions.map(item => {
      if (typeof item === 'string') return item
      return Object.keys(item)[0]
    })[0]
  }

  // TODO: How to support: referralreward, stakewithdraw, stakedeposit
  // Normalize to types that are okay for our definitions
  normalizeType(type) {
    let t = type
    if (['AddKey', 'DeleteKey'].includes(type)) t = 'accesskeys'
    if (['DeployContract'].includes(type)) t = 'contractdeploy'
    if (['CreateAccount'].includes(type)) t = 'subaccountcreate'
    return `${t}`.toLowerCase()
  }

  // Returns actions of txn
  getCrontractActions(rawActions = [], rawOutcomes = []) {
    if (!rawActions || rawActions.length === 0 || !rawActions[0]) return
    const actions = []

    // return first action method name
    rawActions.forEach((item, idx) => {
      let action = {}
      const receipt = rawOutcomes[idx]
      if (typeof item === 'string') {
        action.key = item
      } else {
        if (Object.keys(item).length) {
          action.key = Object.keys(item)[0]
          const payload = item[action.key]
          action = { ...action, ...payload }

          // attempt to parse base64 args
          try {
            if (payload && payload.args) {
              const tmpArgs = Buffer.from(payload.args, 'base64').toString()
              action.args = JSON.parse(tmpArgs)
            }
          } catch (e) {
            delete action.args
          }

          // attempt to attach the outcome payload
          try {
            if (receipt && receipt.outcome && receipt.outcome.status) {
              Object.keys(receipt.outcome.status).forEach(sk => {
                action[sk] = Buffer.from(receipt.outcome.status[sk], 'base64').toString()
              })
            }
          } catch (e) {
            
          }
        }
      }

      actions.push(action)
    })

    return actions
  }

  // txn Format
  // {
  //   raw: {},
  //   type: '',
  //   method: '',
  //   blockHash: '',
  //   chunkHash: '',
  //   txHash: '',
  //   actionType: '', // Contract Deployed, Balance Transfer, etc...
  //   actions: [],
  //   to: '',
  //   from: '',
  //   contract: '',
  //   status: '', // success, fail
  //   value: '',
  //   fee: '',
  //   valueUSD: '',
  //   valueBTC: '',
  //   feeUSD: '',
  //   feeBTC: '',
  // }
  // 
  // Options
  // {
  //   prices: { near: { usd: 1.05, ... }}
  // }
  transaction(transaction, options = {}) {
    if (!transaction) return
    const raw = transaction.result || transaction
    const tx = { type: this.getTxnType(raw) }

    if (raw.status) tx.status = raw.status && Object.keys(raw.status).includes('SuccessValue') ? 'success': 'fail'
    if (raw.transaction && raw.transaction.hash) tx.txHash = raw.transaction.hash
    if (raw.transaction_outcome && raw.transaction_outcome.block_hash) tx.blockHash = raw.transaction_outcome.block_hash
    if (raw.transaction && raw.transaction.signer_id) tx.from = raw.transaction.signer_id
    if (raw.transaction && raw.transaction.receiver_id) tx.to = raw.transaction.receiver_id
    if (raw.transaction && raw.transaction.actions && raw.transaction.actions.length > 0) tx.actions = this.getCrontractActions(raw.transaction.actions, raw.receipts_outcome)

    // contract if has action: FunctionCall, AddKey, DeployContract...
    if (this.isContract(tx.type)) tx.contract = tx.to

    // value & fees
    if (raw.transaction_outcome && raw.transaction_outcome.outcome && raw.transaction_outcome.outcome.tokens_burnt) tx.fee = raw.transaction_outcome.outcome.tokens_burnt
    if (raw.transaction && raw.transaction.actions && raw.transaction.actions.length > 0) tx.value = this.getValueFromTxn(raw.transaction.actions)

    // Calculate all the prices for every value, currently only supports native chain prices
    if (options.prices && options.prices.near) {
      Object.keys(options.prices.near).forEach(quote => {
        const rate = options.prices.near[quote]
        if (tx.value) tx[`value${quote.toUpperCase()}`] = this.getQuoteForValue(tx.value, rate)
        if (tx.fee) tx[`fee${quote.toUpperCase()}`] = this.getQuoteForValue(tx.fee, rate)
      })
    }

    // logs
    tx.logs = []
    if (raw.transaction_outcome && raw.transaction_outcome.outcome && raw.transaction_outcome.outcome.logs) raw.transaction_outcome.outcome.logs.map(t => tx.logs.push(t))
    if (raw.receipts_outcome) raw.receipts_outcome.forEach(ro => {
      if (ro.outcome && ro.outcome.logs) ro.outcome.logs.map(t => tx.logs.push(t))
    })

    return tx
  }
}