import Big from 'big.js'

const addCommas = x => {
  if (!x) return 0
  const tmp = x.toString().split('.')
  tmp[0] = tmp[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return tmp.join('.')
}

// converts NEAR amount into Yocto NEAR (10^−24)
// BigInt() allows JavaScript to handle these large numbers
export function formatAmount(amount) {
  const ONE_NEAR = Big(1e24)
  const a = typeof amount !== 'string' ? amount.toString() : amount
  return addCommas(Big(a).div(ONE_NEAR).toFixed())
}

export function formatCurrencyAmount(amount, rate) {
  const ONE_NEAR = Big(1e24)
  const a = typeof amount !== 'string' ? amount.toString() : amount
  return addCommas(Big(a).div(ONE_NEAR).times(rate).toFixed(2))
}

export function parseAmount(amount) {
  return BigInt(utils.format.parseNearAmount(amount.toString()))
}

export function percentChange(o, n) {
  return Math.abs(((o - n) / o) * 100).toFixed(2)
}

export const supportedCurrencies = ['btc', 'eth', 'ltc', 'bch', 'bnb', 'eos', 'xrp', 'xlm', 'link', 'dot', 'yfi', 'usd', 'aed', 'ars', 'aud', 'bdt', 'bhd', 'bmd', 'brl', 'cad', 'chf', 'clp', 'cny', 'czk', 'dkk', 'eur', 'gbp', 'hkd', 'huf', 'idr', 'ils', 'inr', 'jpy', 'krw', 'kwd', 'lkr', 'mmk', 'mxn', 'myr', 'ngn', 'nok', 'nzd', 'php', 'pkr', 'pln', 'rub', 'sar', 'sek', 'sgd', 'thb', 'try', 'twd', 'uah', 'vef', 'vnd', 'zar', 'xdr', 'xag', 'xau'].sort().map(c => `${c}`.toUpperCase())

export const splitDot = str => {
  const all = str.split('.')
  return `${all[all.length - 2]}.${all[all.length - 1]}`
}

export const getRootAccountIds = data => {
  let from, to, all = [];

  if (data.from) from = splitDot(data.from)
  if (data.to) to = splitDot(data.to)

  if (from) all.push(from)
  if (to) all.push(to)

  return { from, to, all }
}

export const rootContainsDapp = (roots, dapps) => {
  let bool = false

  roots.forEach(r => {
    if (dapps.includes(r)) bool = true
  })

  return bool
}

export const getNetworkFromContractId = contractId => {
  let networkId = 'mainnet'

  if (contractId.search('\.testnet') > -1) networkId = 'testnet'
  if (contractId.search('\.guildnet') > -1) networkId = 'guildnet'

  return networkId
}

export const baseServerUrl = account_id => {
  let url = 'http://localhost:8080'

  if (account_id.search('\.near') > -1) url = 'https://pingbox.app'
  if (account_id.search('\.testnet') > -1) url = 'https://testnet.pingbox.app'
  if (account_id.search('\.guildnet') > -1) url = 'https://guildnet.pingbox.app'

  return `${url}`
}

export const parseBas64ToJson = args => {
  // attempt to parse base64 args
  try {
    const tmpArgs = Buffer.from(args, 'base64').toString()
    return JSON.parse(tmpArgs)
  } catch (e) {
    return null
  }
}