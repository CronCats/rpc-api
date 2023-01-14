export default {
  Single: `
    type Balance {
      type: String
      is_reward: Boolean
      address: String
      denom: String
      amount: String
    }

    type Agent {
      address: String
      is_active: Boolean
      payable_account_id: String
      total_tasks_executed: String
      last_executed_slot: String
      register_start: String

      balances: [Balance]
    }
  `,

  Query: `
    agents: [Agent]
  `,

  // Mutation: `
  // `,

  // Subscription: `
  // `
}
