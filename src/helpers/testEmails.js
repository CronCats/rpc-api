import EmailProvider from '../providers/email'
import messages from '../helpers/messageFormatters'

// TODO: Paras, sputnik examples
;(async () => {
  const e = new EmailProvider()
  const options = { to: 'fake@email.me' }
  const settings = {
    referralId: 7777777777,
    balance: '44282939450000000000000000',
    recipient: 'tttt.t.testnet',
  }

  const raw = {
    type: 'Transfer',
    status: 'success',
    txHash: '6kTHVEyHYzinQQQTTowMwaCrgKbmzRvtWp7ctyGDzsg1',
    blockHash: 'EP1d5v5AkGBeUn6c6xLJE5Nd1zULqynLcitAssJoUAG1',
    from: 't.testnet',
    to: 'tttt.t.testnet',
    actions: [{ Transfer: { deposit: '500000000000000000000000000' } }],
    fee: '22318256250000000000',
    value: '1.3374',
    valueUSD: '1.64',
    feeUSD: '0.000027',
    name: 'transactions',
    removeOnComplete: true,
  }
  const msg = messages.transfer(raw, settings)

  // const raw = {
  //   // type: 'DeleteKey',
  //   type: 'AddKey',
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
  // const msg = messages.accesskeys(raw, settings)

  // const raw = {
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
  // const raw = {
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
  // const msg = messages.contractdeploy(raw, settings)

  // const raw = {
  //   type: 'FunctionCall',
  //   status: 'success',
  //   txHash: '5iGkRv7nGBdjWuGpAPo7psJPRSvmvNohJ1gT4VXa1ojE',
  //   blockHash: 'GcBqVgasvvdajiyfsiY5RkngdWhkrqavFWDQSJDPaZab',
  //   from: 'client.kwsantiago.testnet',
  //   to: 'near-link.kwsantiago.testnet',
  //   actions: [{
  //     FunctionCall: {
  //       "method_name": "inc_allowance",
  //       "args": "eyJlc2Nyb3dfYWNjb3VudF9pZCI6Im9yYWNsZS5rd3NhbnRpYWdvLnRlc3RuZXQiLCJhbW91bnQiOiIyMCJ9",
  //       "gas": 100000000000000,
  //       "deposit": "69600000000000000000000"
  //     } } ],
  //   contract: 'near-link.kwsantiago.testnet',
  //   fee: '242809093098400000000',
  //   value: '6.96e+22',
  //   valueUSD: '0.091872',
  //   feeUSD: '0.000321',
  //   logs: [ 'Refunding 36500000000000000000000 tokens for storage' ]
  // }
  // const msg = messages.functioncall(raw, settings)

  // const raw = {
  //   type: 'Referral',
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
  // const msg = messages.referralreward(raw, settings)

  // const raw = {
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
  // const msg = messages.stakedeposit(raw, settings)

  // const raw = {
  //   type: 'FunctionCall',
  //   status: 'success',
  //   txHash: 'HNHqsQSTZLSuuMe42VKzuL4zwAQKuQmMQJvECoJWwUSw',
  //   blockHash: '8AQDw6fP1pHzFKbfBg574P6axtwvEBVQeDx3FA9mUH4K',
  //   from: 'stakewars.testnet',
  //   to: 'rioblocks.pool.f863973.m0',
  //   actions: [ { FunctionCall: [Object] } ],
  //   contract: 'rioblocks.pool.f863973.m0',
  //   fee: '242796348274600000000',
  //   value: '7500.00',
  //   valueUSD: '99000.00',
  //   feeUSD: '0.000320',
  // }
  // const msg = messages.stakewithdraw(raw, settings)

  // const raw = {
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
  // const msg = messages.subaccountcreate(raw, settings)

  // const data = msg.email

  // const data = {
  //   type: 'dappcore',
  //   theme: 'dark',
  //   brandIcon: 'https://uniswap.org/favicon-32x32.png',
  //   brandName: 'Uniswap',
  //   brandUrl: 'https://uniswap.org',
  //   brandTagline: 'Uniswap is a decentralized protocol for automated liquidity provision on NEAR Protocol.',
  //   title: 'Trade Complete',
  //   subtitle: `
  //   <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:22px;text-align:left;color:#29d0c6;">97.45 DAI</div>
  //   <div style="margin:10px 0px 20px;font-family:Futura, Avenir, sans-serif;font-size:21px;font-weight:bold;line-height:22px;text-align:left;">
  //     <a href="https://explorer.mainnet.near.org/accounts/tttt.t.testnet" target="_blank" class="text-primary" style="text-decoration:none">tttt.t.testnet</a>
  //   </div>`,
  //   subject: `Swap trade ${raw.value} to ${raw.to} from ${raw.from}`,
  //   heading: `New trade made with your account`,
  //   message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-secondary">A balance transfer of <span class="text-primary">0Ⓝ </span>($0.000000) moved into your account from <span style="color:#5ab1f1;">mymasterpersona.testnet </span>to <span style="color:#5ab1f1;">mymasterpersona.testnet.</span></div>`,
  //   from: 't.testnet',
  //   to: 'tttt.t.testnet',
  //   recipient: 'tttt.t.testnet',
  //   recipientUrl: 'https://explorer.mainnet.near.org/accounts/tttt.t.testnet',
  //   fee: '22318256250000000000',
  //   value: '1.3374',
  //   valueUSD: '1.64',
  //   feeUSD: '0.000027',
  //   ctaTitle: 'View Transaction',
  //   ctaUrl: `https://explorer.mainnet.near.org/transactions/${'6kTHVEyHYzinQQQTTowMwaCrgKbmzRvtWp7ctyGDzsg1'}`,
  //   referralUrl: 'https://pingbox.app/onboarding?referral=38439849',
  // }
  // const data = {
  //   type: 'dappcore',
  //   theme: 'dark',
  //   // brandIcon: 'https://uniswap.org/favicon-32x32.png',
  //   brandName: 'Paras',
  //   brandUrl: 'https://uniswap.org',
  //   brandTagline: 'All-in-one social DAC marketplace for creators and collectors.',
  //   title: 'Your Artwork Sold!',
  //   subtitle: `
  //   <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:22px;text-align:left;color:#29d0c6;">97.45 Ⓝ</div>
  //   <div style="margin:10px 0px 20px;font-family:Futura, Avenir, sans-serif;font-size:21px;font-weight:bold;line-height:22px;text-align:left;">
  //     <a href="https://explorer.mainnet.near.org/accounts/tttt.t.testnet" target="_blank" class="text-primary" style="text-decoration:none">tttt.t.testnet</a>
  //   </div>`,
  //   subject: `Swap trade ${raw.value} to ${raw.to} from ${raw.from}`,
  //   heading: `New trade made with your account`,
  //   attachment: `https://ipfs-gateway.paras.id/ipfs/QmP2N4YjkppCjqmLfFwQs7vuN8Jz5iEySp3MDsNXM4xEzA`,
  //   message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-secondary">A patron has purchased your NFT for <span class="text-primary">0Ⓝ </span>($0.000000) by <span style="color:#5ab1f1;">mymasterpersona.testnet </span></div>`,
  //   from: 't.testnet',
  //   to: 'tttt.t.testnet',
  //   recipient: 'tttt.t.testnet',
  //   recipientUrl: 'https://explorer.mainnet.near.org/accounts/tttt.t.testnet',
  //   fee: '22318256250000000000',
  //   value: '1.3374',
  //   valueUSD: '1.64',
  //   feeUSD: '0.000027',
  //   ctaTitle: 'View Sale',
  //   ctaUrl: `https://explorer.mainnet.near.org/transactions/${'6kTHVEyHYzinQQQTTowMwaCrgKbmzRvtWp7ctyGDzsg1'}`,
  //   referralUrl: 'https://pingbox.app/onboarding?referral=38439849',
  // }

  // const data = {
  //   type: 'DeleteKey',
  //   status: 'success',
  //   txHash: '2AhbSU9LWaag63ZMY537RYDMXTbgChqJqhq4xqmFSdGG',
  //   blockHash: '6eR2fDFLgeMB2mXjn9PG3nvxEpuEsMe28Q9NaHs6CP4T',
  //   from: 'mymasterpersona.testnet',
  //   to: 'mymasterpersona.testnet',
  //   actions: [{ DeleteKey: [Object] }],
  //   fee: '20300612500000000000',
  //   value: '0',
  //   valueUSD: '0.000000',
  //   feeUSD: '0.000027',
  //   logs: [],
  //   txUrl: `https://explorer.mainnet.near.org/transactions/${'2AhbSU9LWaag63ZMY537RYDMXTbgChqJqhq4xqmFSdGG'}`,
  //   referralUrl: 'https://pingbox.app/onboarding?referral=38439849',
  // }

  // SPUTNIK EMAIL TEMPLATES: https://testnet-v2.sputnik.fund/#/
  // --------------------------------------------------------------------
  const data = {
    type: 'dappcore',
    theme: 'dark',
    // brandIcon: 'https://uniswap.org/favicon-32x32.png',
    brandIcon: '../static/sputnik_logo_color.svg',
    // brandName: 'Sputnik',
    brandUrl: 'https://sputnik.fund',
    brandColor: '#7600FF',
    brandTagline: 'SputnikDAO is a hub of DAOs empowering communities to create a guild for your meaningful project to find allies and monthly funding.',
    title: 'New Proposal',
    subtitle: `
    <div style="font-family:Futura, Avenir, sans-serif;font-size:24px;font-weight:bolder;line-height:22px;text-align:left;color:#29d0c6;">7.45 Ⓝ Payout</div>
    <div style="margin:10px 0px 20px;font-family:Futura, Avenir, sans-serif;font-size:21px;font-weight:bold;line-height:22px;text-align:left;">
      <a href="https://explorer.mainnet.near.org/accounts/tttt.t.testnet" target="_blank" class="text-primary" style="text-decoration:none">david.in.testnet</a>
    </div>`,
    subject: `New payout proposal of ${raw.value} to ${raw.to} from ${raw.from}`,
    heading: `Sputnik Proposal`,
    // attachment: `https://ipfs-gateway.paras.id/ipfs/QmP2N4YjkppCjqmLfFwQs7vuN8Jz5iEySp3MDsNXM4xEzA`,
    message: `<div style="font-family:Futura, Avenir, sans-serif;font-size:16px;line-height:21px;text-align:left;" class="text-secondary">Your review is required to approve a request for payout of <span class="text-primary">7.45Ⓝ </span>($15.64) to <span style="color:#5ab1f1;">david.in.testnet </span></div>`,
    from: 'dao.in.testnet',
    to: 'david.in.testnet',
    recipient: 'david.in.testnet',
    recipientUrl: 'https://explorer.mainnet.near.org/accounts/david.in.testnet',
    fee: '74522318256250000000000',
    value: '7.45',
    valueUSD: '15.64',
    feeUSD: '0.000027',
    ctaTitle: 'Vote Now →',
    ctaUrl: `https://testnet-v2.sputnik.fund/?tx=${'6kTHVEyHYzinQQQTTowMwaCrgKbmzRvtWp7ctyGDzsg1'}`,
    referralUrl: 'https://pingbox.app/onboarding?referral=38439849',
  }

  // BASE EMAIL TEMPLATES:
  // --------------------------------------------------------------------

  // const data = {
  //   type: 'Verify',
  //   to: 'tttt.t.testnet',
  //   ctaTitle: 'Verify Account',
  //   ctaUrl: 'https://pingbox.app/onboarding?verify=38439849',
  //   referralUrl: 'https://pingbox.app/onboarding?referral=38439849',
  // }

  // const data = {
  //   type: 'Welcome',
  //   to: 'tttt.t.testnet',
  //   ctaTitle: '',
  //   ctaUrl: '',
  //   referralUrl: 'https://pingbox.app/onboarding?referral=38439849',
  // }

  await e.send(data, options)
  console.log('TEST EMAIL SENT')
})();