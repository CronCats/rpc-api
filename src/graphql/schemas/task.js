export default {
  Single: `
    type Coin {
      amount: String
      denom: String
    }

    type Boundary {
      Height {
        start: Int
        end: Int
      }
      Time {
        start: String
        end: String
      }
    }

    type Task {
      task_hash: String
      owner_id: String
      stop_on_fail: Boolean
      interval: String
      boundary: Boundary

      total_deposit: [Coin]
      total_cw20_deposit: [Coin]
      amount_for_one_task_native: [Coin]
      amount_for_one_task_cw20: [Coin]

      queries: [String]

      transforms: [String]

      actions: [String]
    }
  `,

  Query: `
    tasks: [Task]
    task(task_hash: String): Task
  `,

  // Mutation: `
  // `,

  // Subscription: `
  // `
}
