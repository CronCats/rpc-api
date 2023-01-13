import * as sputnik from './sputnik';
import * as pingbox from './pingbox';

export const dappSettings = {
  testnet: {
    ...pingbox.dappSettings.testnet,
    ...sputnik.dappSettings.testnet,
  },
  mainnet: {
    ...pingbox.dappSettings.mainnet,
    ...sputnik.dappSettings.mainnet,
  },
}

  // NOTE: pingbox can be excluded for this
export const activeDapps = {
  all: [...sputnik.activeDapps],
  sputnik: sputnik.activeDapps,
  pingbox: pingbox.activeDapps,
}

export async function getRecipients(dapp, contractId, userAccountId, data) {
  if (dapp.search('sputnik') > -1) return sputnik.getRecipients(contractId, userAccountId, data)
  return Promise.resolve()
}

export function populateAlertDetails(data) {
  if (!data || !data.type) return data
  const { network, app_id } = data
  if (!dappSettings[network] || !dappSettings[network][app_id] || !dappSettings[network][app_id].alertTypes) return data
  const alertData = dappSettings[network][app_id].alertTypes[data.type]

  return {
    ...data,
    ...alertData,
  }
}

export default getRecipients