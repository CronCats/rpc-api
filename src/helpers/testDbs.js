import { insertItem, getItem } from '../db/index'

const newUser = {
  user_id: 'pingbox.testnet',
  account_id: 'pingbox.testnet',
  user_referral_id: `ABC_REFERRAL_FOR_ME_${+new Date()}`,
  sub_account_ids: ['sub_acct'],
  subscription_contract_id: 'jkfsd08fd0si.subscription_test.testnet',
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  email: 'fake@email.me',
  sms: '1234567890',
  // productInfoActive: false,
  // rocketChatActive: false,
  // rocketChatChannel: '',
  // rocketChatDomain: '',
  // rocketChatToken: '',
  // slackActive: false,
  // slackChannel: '',
  // slackToken: '',
}

;(async () => {
  const userRes = await insertItem('users', newUser)
  console.log('NEW USER', userRes);
  const userRes2 = await insertItem('users', { ...newUser, user_id: 'pingbox2.testnet', account_id: 'pingbox2.testnet' })
  console.log('NEW USER 2', userRes2);
  const usersRes = await getItem('users')
  console.log('GET USERS', usersRes);
})();