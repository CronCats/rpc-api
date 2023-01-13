import NearProvider from '../providers/near'
import { getNetworkFromContractId } from '../helpers/utils'

// REF: https://github.com/near-daos/sputnik-dao-ui
// REF: https://github.com/near-daos/sputnik-dao-contract
// ProposalKind::ChangeConfig { .. } => "config",
// ProposalKind::ChangePolicy { .. } => "policy",
// ProposalKind::AddMemberToRole { .. } => "add_member_to_role",
// ProposalKind::RemoveMemberFromRole { .. } => "remove_member_from_role",
// ProposalKind::FunctionCall { .. } => "call",
// ProposalKind::UpgradeSelf { .. } => "upgrade_self",
// ProposalKind::UpgradeRemote { .. } => "upgrade_remote",
// ProposalKind::Transfer { .. } => "transfer",
// ProposalKind::SetStakingContract { .. } => "set_vote_token",
// ProposalKind::AddBounty { .. } => "add_bounty",
// ProposalKind::BountyDone { .. } => "bounty_done",
// ProposalKind::Vote => "vote",

// Action::VoteApprove => Vote::Approve,
// Action::VoteReject => Vote::Reject,
// Action::VoteRemove => Vote::Remove,

// Dapp specifics
const metadata_testnet = {
  type: 'dappcore',
  theme: 'dark',
  // brandIcon: 'https://uniswap.org/favicon-32x32.png',
  brandIcon: '../static/sputnik_logo_color.svg',
  brandLogo: '../static/sputnik_logo_color.svg',
  brandName: 'Sputnik',
  brandUrl: 'https://sputnik.fund',
  brandColor: '#7600FF',
  brandTagline: 'SputnikDAO is a hub of DAOs empowering communities to create a guild for your meaningful project to find allies and monthly funding.',
  ctaTitle: 'Vote Now →',
  ctaUrl: `https://testnet-v2.sputnik.fund/`,
}
const metadata = {
  type: 'dappcore',
  theme: 'dark',
  // brandIcon: 'https://uniswap.org/favicon-32x32.png',
  brandIcon: '../static/sputnik_logo_color.svg',
  brandLogo: '../static/sputnik_logo_color.svg',
  brandName: 'Sputnik',
  brandUrl: 'https://sputnik.fund',
  brandColor: '#7600FF',
  brandTagline: 'SputnikDAO is a hub of DAOs empowering communities to create a guild for your meaningful project to find allies and monthly funding.',
  ctaTitle: 'Vote Now →',
  ctaUrl: `https://v2.sputnik.fund/`,
}

// Alert Configs
export const alertTypes = {
  transfer: {
    title: 'Payout Proposals',
    desc: 'Alerts are sent to council members when a new payout proposal is submitted.',
    dataType: 'bool',
  },
  addmembertorole: {
    title: 'Add Council Member Proposals',
    desc: 'Alerts are sent to council members when a new member is requesting to join a DAO role.',
    dataType: 'bool',
  },
  removememberfromrole: {
    title: 'Remove Council Member Proposals',
    desc: 'Alerts are sent to council members when a member is requesting to remove another member from a DAO role.',
    dataType: 'bool',
  },
  functioncall: {
    title: 'Contract Function Call Proposals',
    desc: 'Alerts are sent to council members when a contract function is configured to call another contract via DAO.',
    dataType: 'bool',
  },
  functioncalltoken: {
    title: 'Governance Token Proposals',
    desc: 'Alerts are sent to council members when a token issuance proposal is submitted.',
    dataType: 'bool',
  },
  actproposal: {
    title: 'Proposal Results',
    desc: 'Alerts are sent to the proposal owner, informing the outcome of the proposal.',
    dataType: 'bool',
  },
}

// RPC Settings
export const activeDapps = ['sputnik.testnet', 'sputnikv2.testnet', 'sputnikdao.near', 'sputnik-dao.near']
const tokenFactories = ['tokenfactory.testnet']

export const dappSettings = {
  testnet: {
    // 'sputnik.testnet': {
    //   alertTypes,
    //   metadata,
    //   ctaUrl: 'https://testnet-v2.sputnik.fund/',
    // },
    'sputnikv2.testnet': {
      alertTypes,
      metadata: metadata_testnet,
    },
  },
  mainnet: {
    // 'sputnikdao.near': {
    //   alertTypes,
    //   metadata,
    //   ctaUrl: 'https://old.sputnik.fund/',
    // },
    'sputnik-dao.near': {
      alertTypes,
      metadata,
    },
  },
}

// Only supports ABIs for v2
export const ABIS = {
  mainnet: {
    viewMethods: [
      'get_policy',
      'get_council',
      'get_bond',
      'get_proposal',
      'get_num_proposals',
      'get_proposals',
      'get_vote_period',
      'get_purpose',
    ],
    changeMethods: [
      'vote',
      'add_proposal',
      'act_proposal',
      'finalize'
    ],
  },
  testnet: {
    viewMethods: [
      'get_policy',
      'get_council',
      'get_bond',
      'get_proposal',
      'get_num_proposals',
      'get_proposals',
      'get_vote_period',
      'get_purpose',
    ],
    changeMethods: [
      'vote',
      'add_proposal',
      'act_proposal',
      'finalize'
    ],
  },
}

// generic contract setup
export async function initContract({ contractId, userAccountId }) {
  const networkId = getNetworkFromContractId(contractId)
  const ABI = ABIS[networkId]
  const near = new NearProvider({ networkId })

  return near.contractInstance(contractId, ABI)
}

export const getContractFunctionMethods = actions => {
  return actions.map(a => {
    if (typeof a === 'object' && a.key === 'FunctionCall') {
      if (a.args && a.args.kind && a.args.kind === 'FunctionCall') {
        if (a.args && a.args.receiver_id && tokenFactories.includes(a.args.receiver_id)) return `${a.args.kind}token`.toLowerCase()
        return `${a.args.kind}`.toLowerCase()
      }
      if (a.args && a.args.kind) return `${a.args.kind}`.toLowerCase()
      if (a.method_name && a.method_name === 'act_proposal') return `actproposal`
      return `${a.key}`.toLowerCase()
    }
    if (typeof a === 'object' && a.key === 'FunctionCall') return a.method_name
    return `${a}`
  })
}

export const flattenActionPayloads = actions => {
  let tmp = []

  // top level actions
  actions.forEach(action => {
    if (action.args && action.args.proposal) {
      const tmpAction = { ...action }
      let args = {}
      if (action.args.proposal && action.args.proposal.description) args.description = action.args.proposal.description
      if (action.args.proposal && action.args.proposal.kind) {
        args.kind = Object.keys(action.args.proposal.kind)[0]
        args = { ...args, ...action.args.proposal.kind[args.kind] }
      }
      tmpAction.args = args
      tmp.push(tmpAction)
    } else tmp.push(action)
  })

  return tmp
}

// Generalized function that allows custom logic per-dapp
export function getMethodAndActions(data) {
  const actions = flattenActionPayloads(data.actions)
  // NOTE: This will change to dapp configuration in future
  const methods = getContractFunctionMethods(actions)
  // NOTE: no batch examples i've seen need to be handled, wait for users.
  const method = methods[0]

  return {
    actions,
    method,
  }
}

// Generalized function that allows custom logic per-dapp
export async function getRecipients(contractId, userAccountId, data) {
  const { actions, method } = getMethodAndActions(data)
  let recipients = []

  // because there are so many diff methods within function call, we need to split them up here, and apply method based templates
  if (method === 'actproposal') {
    // ID is the proposal ID
    const id = actions && actions[0] && actions[0].args && actions[0].args.id ? actions[0].args.id : null
    if (!id) return []
    const proposal = await getProposalData(contractId, userAccountId, id)
    recipients.push(proposal.proposer)
  } else {
    const council = await getPolicy(contractId, userAccountId)
    recipients = recipients.concat(council)
  }

  return recipients
}

export async function getPolicy(contractId, userAccountId) {
  const contract = await initContract({ contractId, userAccountId })

  // get council from: near view dao.sputnikv2.testnet get_policy
  const policy = await contract.get_policy()
  let council = []

  // {
  //   roles: [
  //     {
  //       name: 'all',
  //       kind: 'Everyone',
  //       permissions: ['*:AddProposal'],
  //       vote_policy: {}
  //     },
  //     {
  //       name: 'council',
  //       kind: {
  //         Group: ['in.testnet', 't.testnet', 'hobbyhodlrtest.testnet']
  //       },
  //       permissions: [
  //         '*:Finalize',
  //         '*:AddProposal',
  //         '*:VoteApprove',
  //         '*:VoteReject',
  //         '*:VoteRemove'
  //       ],
  //       vote_policy: {}
  //     }
  //   ],
  //   default_vote_policy: { weight_kind: 'RoleWeight', quorum: '0', threshold: [1, 2] },
  //   proposal_bond: '1000000000000000000000000',
  //     proposal_period: '604800000000000',
  //       bounty_bond: '1000000000000000000000000',
  //         bounty_forgiveness_period: '86400000000000'
  // }
  // filter to only council members with voting power
  if (policy && policy.roles) {
    policy.roles.forEach(role => {
      const perms = role.permissions.join('')
      if (perms.search('Vote') > -1) {
        if (role.kind && role.kind.Group) council = council.concat(role.kind.Group)
      }
    })
  }

  return council
}

export async function getProposalData(contractId, userAccountId, id) {
  const contract = await initContract({ contractId, userAccountId })

  // get council from: near view dao.sputnikv2.testnet get_policy
  const proposal = await contract.get_proposal({ id })

  // {
  //   id: 7,
  //   proposer: 'in.testnet',
  //   description: 'thanks for being here',
  //   kind: {
  //     Transfer: {
  //       token_id: '',
  //       receiver_id: 't.testnet',
  //       amount: '1337000000000000000000000',
  //       msg: null
  //     }
  //   },
  //   status: 'InProgress',
  //   vote_counts: { council: [ 1, 0, 0 ] },
  //   votes: { 'in.testnet': 'Approve' },
  //   submission_time: '1628475355426728878'
  // }
  return proposal
}

export default {
  activeDapps,
  getRecipients,
  dappSettings,
}