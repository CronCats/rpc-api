export default {
  Single: `
    type System {
      currencies: [String]
      timezones: [String]
    }
  `,

  Query: `
    system: System
  `,

  // Mutation: `
  // `,

  // Subscription: `
  // `
}
