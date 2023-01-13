const baseServerUrl = process.env.NODE_ENV === 'development' ? `http://localhost:3000` : 'https://pingbox.app'

// Alert Configs
export const alertTypes = {
  // dappfunctions: {
  //   title: 'dApp Function Updates',
  //   desc: 'Alerts that are configured per-contract function by the dApp.',
  // },
  // dappevents: {
  //   title: 'dApp Events',
  //   desc: 'Alerts that are configured per-contract, using custom log code by the dApp.',
  // },
  accesskeys: {
    title: 'Access Keys Activity',
    desc: 'Alerts for when an access key changes in some way, supports adding, deleting and functions.',
  },
  account: {
    title: 'Account Activity',
    desc: 'Alerts for when account management activity occurs, primarily useful for when new sub accounts are created.',
  },
  functioncall: {
    title: 'Function Calls',
    desc: 'Alerts for contract function calls, triggers for every known method.',
  },
  contractdeploy: {
    title: 'Deploy Contract',
    desc: 'Alerts for contracts deployed to accounts or any sub accounts owned by the root account.',
  },
  transfer: {
    title: 'Balance Transfers',
    desc: 'Alerts for when your account sends or receives funds.',
  },
  stakewithdraw: {
    title: 'Staking Rewards',
    desc: 'Alerts for delegating, earning, unstaking, rewards & more.',
  },
  referralreward: {
    title: 'Referral Rewards',
    desc: 'Alert for rewards earned from referring friends.',
  },
}

// RPC Settings
// export const activeDapps = ['pingbox.testnet', 'pingbox.pbx.testnet', 'pingbox.near', 'manager_v1.pingbox.near']
export const activeDapps = ['pingbox.pbx.testnet', 'manager_v1.pingbox.near']
export const dappSettings = {
  testnet: {
    // 'pingbox.testnet': {
    //   alertTypes,
    //   ctaUrl: baseServerUrl,
    // },
    'pingbox.pbx.testnet': {
      alertTypes,
      ctaUrl: baseServerUrl,
    },
  },
  mainnet: {
    // 'pingbox.near': {
    //   alertTypes,
    //   ctaUrl: baseServerUrl,
    // },
    'manager_v1.pingbox.near': {
      alertTypes,
      ctaUrl: baseServerUrl,
    },
  },
}

export const getNetworkFromContractId = contractId => {
  let networkId = 'mainnet'

  if (contractId.search('\.testnet') > -1) networkId = 'testnet'
  if (contractId.search('\.guildnet') > -1) networkId = 'guildnet'

  return networkId
}

export default {
  activeDapps,
  dappSettings,
}