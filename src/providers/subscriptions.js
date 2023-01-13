import db from '../db/index'
import { getMd5, encrypt } from '../db/encrypter'
import EmailProvider from './email'
import { baseServerUrl } from '../helpers/utils'

export const getUserSettings = async (args) => {
  if (!args || !args.user_id) throw 'Arguments missing!'
  const user_id = getMd5(args.user_id)
  let user
  let alerts

  try {
    const raw = await db.getItemById('users', { user_id })
    user = raw[0]
  } catch (e) {
    throw e
  }
  if (!user) return

  try {
    alerts = await db.getItemById('users_alerts_configs', { user_id, active: true })
  } catch (e) {
    // throw e
  }
  if (alerts) user.alerts = alerts

  return user
}

export const sendVerifyEmail = async data => {
  if (!data || !data.user_id) throw 'Subscription User ID missing!'
  const item = {
    user_id: data.user_id,
    account_id: data.user_id,
  }

  // Get email, and make sure it exists!
  let tmpUser
  try {
    const user_id = getMd5(data.user_id)
    const raw = await db.getItemById('users', { user_id })
    tmpUser = raw[0]
  } catch(e) {
    return;
  }
  if (!tmpUser || !tmpUser.email) throw 'Subscription Email missing!'

  // Verify code:
  item.verifyToken = getMd5(`${+new Date()}${data.user_id}`)
  item.email = tmpUser.email

  try {
    await db.insertItem('users', item)
  } catch (e) {
    throw e
  }

  // Send verify email!
  const p = new EmailProvider()
  const emailData = {
    type: 'Verify',
    theme: 'dark',
    to: item.user_id,
    ctaTitle: 'Verify Account',
    ctaUrl: `${baseServerUrl(item.user_id)}/onboarding?verify=${item.verifyToken}`,
  }

  try {
    return p.send(emailData, item)
  } catch (e) {
    console.log('sendVerifyEmail', e)
  }

  return { type: 'done' }
}

export const sendReferralRewardMessage = async (log, data) => {
  if (!log || !log.user_referral_id) throw 'Referral ID missing!'
  const item = {}

  // Get email, and make sure it exists!
  let tmpUser
  try {
    const user_referral_id = encrypt(log.user_referral_id)
    const raw = await db.getItemById('users', { user_referral_id })
    tmpUser = raw[0]
    console.log('DB GET sendReferralRewardMessage', user_referral_id, tmpUser)
    item.user_id = tmpUser.account_id
    item.account_id = tmpUser.account_id
    item.email = tmpUser.email
  } catch(e) {
    return;
  }
  // if (!item.email) throw 'Referral Email missing!'
  if (!item.email) console.log('Referral Email missing!', item);

  try {
    const refData = {
      ...item,
      timestamp: data.timestamp || +new Date(),
      hash: data.txHash,
      ref_user_id: item.account_id,
      ref_amount: '1',
    }
    await setUserReferralTxn(refData)
  } catch (e) {
    throw e
  }

  // Send referral success email!
  const p = new EmailProvider()
  const emailData = {
    ...data,
    type: 'Referral',
    theme: 'dark',
    ref_user_id: item.account_id,
    ref_amount: '1',
  }

  try {
    return p.send(emailData, item)
  } catch (e) {
    console.log('ERR: sendReferralRewardMessage', e)
  }
}

// INPUT:
// {
//   user_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv52v',
//   timestamp: 'Jan 1st. 2021',
//   hash: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
//   contract_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
//   amount: '12',
//   ref_user_id: 'friend.testnet',
//   ref_amount: '1',
//   // NOTE: Needs adding in future
//   period: 'yearly',
//   title: 'Epic Alerts',
//   desc: 'Fully decentralized, customizable notifications for wallet & blockchain activity.',
// },
export const setUserReferralTxn = async data => {
  // REWARD: store new row in user_rewards table
  // {
  //   uuid: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv52v',
  //   user_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv52v',
  //   account_id: 'person.testnet',
  //   amount: '1',
  // },
  try {
    const reward = {
      uuid: getMd5(`${+new Date()}${data.ref_user_id}${data.user_id}`),
      user_id: getMd5(data.ref_user_id),
      amount: data.ref_amount,
      account_id: data.user_id,
    }
    await db.insertItem('users_rewards', reward)
    console.log(reward);
  } catch (e) {
    console.log(e);
    // throw e
  }

  // REWARD: store new row in user_transactions table
  // {
  //   user_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv52v',
  //   hash: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv52v',
  //   amount: '1',
  //   status: 'Success',
  //   type: 'reward',
  //   timestamp: 'Jan 1st. 2021',
  //   title: 'Reward Earned',
  // },
  try {
    const ref_txn = {
      amount: data.ref_amount,
      user_id: getMd5(data.ref_user_id),
      timestamp: data.timestamp,
      hash: data.hash,
      type: 'reward',
      status: 'Success',
      title: 'Reward Earned',
    }
    await db.insertItem('users_transactions', ref_txn)
    console.log(ref_txn);
  } catch (e) {
    console.log(e);
    // throw e
  }
}

// INPUT:
// {
//   user_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv52v',
//   timestamp: 'Jan 1st. 2021',
//   hash: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
//   contract_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
//   amount: '12',
//   ref_user_id: 'friend.testnet',
//   ref_amount: '1',
//   period: 'yearly',
//   title: 'Epic Alerts',
//   desc: 'Fully decentralized, customizable notifications for wallet & blockchain activity.',
// },
export const setSubscription = async data => {
  const user_id = getMd5(data.user_id)
  console.log('setSubscription user_id', user_id);

  // NEW: store new row in subscriptions table
  // {
  //   user_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv52v',
  //   timestamp: 'Jan 1st. 2021',
  //   hash: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
  //   type: 'recurring',
  //   active: true,
  //   contract_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
  //   status: 'Success',
  //   amount: '12',
  //   period: 'yearly',
  //   title: 'Epic Alerts',
  //   desc: 'Fully decentralized, customizable notifications for wallet & blockchain activity.',
  // },
  try {
    const subscription = {
      amount: data.amount,
      timestamp: data.timestamp,
      hash: data.hash,
      contract_id: data.contract_id,
      user_id,
      active: true,
      period: 'yearly',
      status: 'Success',
      title: 'Epic Alerts',
      desc: 'Fully decentralized, customizable notifications for wallet & blockchain activity.',
    }
    await db.insertItem('subscriptions', subscription)
  } catch (e) {
    console.log(e);
    throw e
  }

  // PAID: store new row in user_transactions table
  // {
  //   user_id: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
  //   hash: 'D3VDXNTSzdsRkmwjZnTzr9Aj6PcRGfuK5LBSbMPJv51v',
  //   amount: '12',
  //   status: 'Success',
  //   type: 'payment',
  //   timestamp: 'Jan 1st. 2021',
  //   title: 'Payed',
  // },
  try {
    const txn = {
      amount: data.amount,
      timestamp: data.timestamp,
      hash: data.hash,
      user_id,
      type: 'payment',
      status: 'Success',
      title: 'Payed',
    }
    await db.insertItem('users_transactions', txn)
  } catch (e) {
    console.log(e);
    // throw e
  }
}
