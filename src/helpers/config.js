import { config } from '../config.js'

function getNearConfig (env) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: process.env.NEAR_MAINNET_RPC_URL || 'https://rpc.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        contractNames: config['production'],
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        abis: config.abis
      }
    case 'development':
    case 'testnet':
      return {
        networkId: 'default',
        nodeUrl: process.env.NEAR_TESTNET_RPC_URL || 'https://rpc.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        contractNames: config['development'],
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        abis: config.abis
      }
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`)
  }
}

export default getNearConfig
