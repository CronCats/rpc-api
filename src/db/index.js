import knex from 'knex'
import { encrypt, decrypt, getMd5 } from './encrypter'

let connection;

const md5Fields = [
  // 'uuid',
  'user_id',
]

const encryptedFields = [
  'hash',
]

const getConnection = () => {
  if (!connection) connection = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
      searchPath: ['public'],
    })
  return connection
}

// loop each field and encrypt
const encryptObject = data => {
  const secretPayload = {}
  Object.keys(data).forEach(key => {
    if (encryptedFields.includes(key)) {
      if (Array.isArray(data[key])) secretPayload[key] = encrypt(data[key].join(','))
      else secretPayload[key] = typeof data[key] === 'boolean' ? data[key] : encrypt(data[key])
    }
    else if (md5Fields.includes(key)) secretPayload[key] = getMd5(data[key])
    else secretPayload[key] = typeof data[key] === 'boolean' ? data[key] : data[key]
  })
  return secretPayload
}

// loop each field and decrypt
const decryptObject = data => {
  const unsecretPayload = {}
  Object.keys(data).forEach(key => {
    if (data[key] === null || typeof data[key] === 'boolean') unsecretPayload[key] = data[key]
    else if (!encryptedFields.includes(key) && `${data[key]}`.search('.') < 0) unsecretPayload[key] = data[key]
    else if (encryptedFields.includes(key)) unsecretPayload[key] = decrypt(data[key])
    else unsecretPayload[key] = data[key]
  })
  return unsecretPayload
}

const getEncryptedPayload = data => {
  let secretPayload

  if (Array.isArray(data)) {
    secretPayload = []
    data.forEach(d => {
      secretPayload.push(encryptObject(d))
    })
    return secretPayload
  }

  return encryptObject(data)
}

const getDecryptedPayload = data => {
  let unsecretPayload

  if (Array.isArray(data)) {
    unsecretPayload = []
    data.forEach(d => {
      unsecretPayload.push(decryptObject(d))
    })

    return unsecretPayload
  }

  return decryptObject(data)
}

// export const insertItem = async (table, data, conflictField = 'user_id') => {
//   const db = getConnection()
//   const payload = getEncryptedPayload(data)
//   const result = await db(table).insert(payload).onConflict(conflictField).merge()
//   return result.rows || result.error
// }

// export const getItem = async (table, limit = 100) => {
//   const db = getConnection()
//   const res = await db(table).select('*').limit(limit)
//   return getDecryptedPayload(res)
// }

// export const getItemById = async (table, where, limit = 100) => {
//   const db = getConnection()
//   const res = await db(table).select('*').where(where).limit(limit)
//   return getDecryptedPayload(res)
// }

export const insertItem = async (table, data, conflictField = 'user_id') => {
  const db = getConnection()
  const result = await db(table).insert(data).onConflict(conflictField).merge()
  return result.rows || result.error
}

export const getItem = async (table, limit = 100) => {
  const db = getConnection()
  const res = await db(table).select('*').limit(limit)
  return res
}

export const getItemById = async (table, where, limit = 100) => {
  const db = getConnection()
  const res = await db(table).select('*').where(where).limit(limit)
  return res
}

export const getRaw = async (table, raw) => {
  const db = getConnection()
  const res = await db.raw(raw)
  return res
}

export default {
  insertItem,
  getItem,
  getItemById,
  getRaw,
}