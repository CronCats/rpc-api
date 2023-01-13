import crypto from 'crypto'

const algorithm = 'aes-256-ctr'
const secretKey = `${process.env.FIELD_ENCRYPTION_KEY || 'PINGBOX0000000000000000000000000'}`.slice(0, 32)
const saltLength = 16

export const getMd5 = str => crypto.createHash('md5').update(str, 'utf-8').digest('hex').toLowerCase()

export const encrypt = pepper => {
  const salt = crypto.randomBytes(saltLength)
  const cipher = crypto.createCipheriv(algorithm, secretKey, salt);
  const encrypted = Buffer.concat([cipher.update(pepper), cipher.final()]);
  return `${salt.toString('hex')}${encrypted.toString('hex')}`
}

export const decrypt = pepper => {
  const p = pepper.slice(0, saltLength * 2)
  const q = pepper.slice(saltLength * 2)
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(p, 'hex'))
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(q, 'hex')), decipher.final()])
  return decrpyted.toString()
}
