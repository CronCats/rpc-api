export default {
  Single: `
    type ConfigBalance {
      type: String
      staked: Boolean
      address: String
      denom: String
      amount: String
    }

    type ManagerConfig {
      paused: Boolean
      owner_id: String
      min_tasks_per_agent: Int
      agent_fee: Int
      gas_fraction_numerator: Int
      gas_fraction_denominator: Int
      gas_base_fee: String
      gas_action_fee: String
      proxy_callback_gas: String
      native_denom: String

      balances: [ConfigBalance]
    }
  `,

  Query: `
    managerConfig: ManagerConfig
  `,

  // Mutation: `
  // `,

  // Subscription: `
  // `
}
