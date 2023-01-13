import axios from 'axios'
import nacl from 'tweetnacl'
import { utils } from 'near-api-js'
import getNearConfig from './config'
require('dotenv').config()

// string to uint array
// REF: https://coolaj86.com/articles/unicode-string-to-a-utf-8-typed-array-buffer-in-javascript/
function unicodeStringToTypedArray(s) {
  const escstr = encodeURIComponent(s)
  const binstr = escstr.replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1)
  });
  let ua = new Uint8Array(binstr.length)
  Array.prototype.forEach.call(binstr, function (ch, i) {
    ua[i] = ch.charCodeAt(0)
  })
  return ua
}

// NOTE: https://github.com/near/near-api-js/blob/master/src/utils/key_pair.ts#L133-L135
// If that could change to accept a public key, it would be much more useful
// All paramters are Uint8Array
function validateMessageSignature(message, signature, publicKey) {
  return nacl.sign.detached.verify(message, signature, publicKey)
}

// RPC Call to get all the public keys for a specific account
// Returns boolean
const validatePublicKeyByAccountId = async (accountId, pkArray) => {
  const currentPublicKey = utils.serialize.base_encode(pkArray)
  // {"jsonrpc":"2.0","method":"query","params":["access_key/pingbox.testnet", ""],"id":1}
  const config = getNearConfig(process.env.NODE_ENV || 'development')
  const { data } = await axios({
    method: 'post',
    url: config.nodeUrl || 'https://rpc.mainnet.near.org',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    data: `{"jsonrpc":"2.0","method":"query","params":["access_key/${accountId}", ""],"id":1}`
  })

  if (!data || !data.result || !data.result.keys) return false
  let valid = false
  data.result.keys.forEach(key => {
    if (key.public_key.replace('ed25519:', '') === currentPublicKey) valid = true
  })

  return valid
}

// Validate an authentication token
// Payload Example:
// {
//   message: {
//     key: 'pingbox',
//     accountId: 'pingbox.testnet',
//     t: +new Date(),
//   },
//   signature: [...],
//   publicKey: [...],
// }
const validateAuthenticationPayload = async str => {
  if (!str) return
  const keys = ['message', 'signature', 'publicKey']
  const args = Buffer.from(utils.serialize.base_decode(str.replace('NEAR:', ''))).toString()
  const parts = args.split('|')
  const payload = {}

  parts.forEach((p, idx) => {
    if (p) payload[keys[idx]] = idx === 0 ? JSON.parse(p) : p.split(',')
  })

  // Verify signed message is recent (not older than 1hr)
  if (payload.message.t < (+new Date() - (60 * 60 * 1000))) throw new Error('Authentication Expired')
  if (!payload.message.accountId) throw new Error('Authentication Account Missing')

  // Verify message signature
  const uintMessage = unicodeStringToTypedArray(JSON.stringify(payload.message))
  const validSignature = validateMessageSignature(
    uintMessage,
    new Uint8Array(payload.signature),
    new Uint8Array(payload.publicKey),
  )
  if (!validSignature) throw new Error('Authentication Signature Invalid')

  // Verify account does have public key
  const validPublicKey = validatePublicKeyByAccountId(payload.message.accountId, payload.publicKey)
  if (!validPublicKey) throw new Error('Authentication Public Key Invalid')

  return payload.message
}

// simply adjust which piece being looked at
export const authContext = async ({ req }) => {
  // No headers could mean websockets
  if (!req || !req.headers) return
  let valid
  try {
    valid = await validateAuthenticationPayload(req.headers.authorization)
  } catch (e) {
    throw new Error(e || 'Could not authenticate session!')
  }
  // if (!valid) throw new Error('Could not authenticate session!')
  return valid
}

// TODO: Change to work with Chain context!!!
export const wsAuthContext = async connectionParams => {
  return true
  // if (connectionParams.authToken) return validateAndReturnUser(connectionParams.authToken)
  // throw new Error('Missing auth token!')
}

export default {
  authContext,
  wsAuthContext,
}
