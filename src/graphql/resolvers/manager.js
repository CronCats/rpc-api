require('dotenv').config()
import db from '../../db/index'
import { config } from '../../config'

export default {
  Query: {
    async managerConfig() {
      const managerContractAddr = config[process.env.NODE_ENV].juno.manager
      // const managerContractAddr = 'juno1ds4zngqcmaxyxp39zp40lphsezwu553mr5m2jtnxykpuu6z5g03sm9zqqu'
      console.log('managerContractAddr', managerContractAddr);
      const startBlock = '669130'
      const endBlock = '669197'
      let managerConfig = {}
      let balances

      try {
        const raw = await db.getRaw('js_config', `SELECT * FROM js_config INNER JOIN js_config_balances ON js_config.id = js_config_balances.fk_config_id WHERE js_config.id IN (SELECT DISTINCT(js_config.id) FROM js_config INNER JOIN js_contract_block_piv as cb ON js_config.fk_cb_id = cb.id INNER JOIN js_blocks as b ON cb.fk_block_id = b.id INNER JOIN js_contracts as c ON c.id = cb.fk_contract_id INNER JOIN js_chain_network as cn ON cn.id = c.fk_chain_network_id INNER JOIN js_chain_network ON js_chain_network.id = b.fk_chain_network_id WHERE cn.chain_id_prefix = 'uni' AND b.height BETWEEN ${startBlock} AND ${endBlock} AND c.address = '${managerContractAddr}');`)
        console.log('raw', raw);
        managerConfig = raw[0]
      } catch (e) {
        throw e
      }
      if (!managerConfig) return

      // try {
      //   balances = await db.getItemById('js_config_balances', { id: managerContractAddr })
      // } catch (e) {
      //   // throw e
      // }
      // if (balances) managerConfig.balances = balances

      return managerConfig
    },
  },

  // Mutation: {
  // },

  // Subscription: {
  //   // updateUserSettings: {
  //   //   subscribe: () => pubsub.asyncIterator(EVENTS.USER_SETTINGS_UPDATED),
  //   // },
  // },
}
