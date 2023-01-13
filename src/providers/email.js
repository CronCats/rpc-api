require('dotenv').config()
import path from 'path'
import Email from 'email-templates'
import nodemailer from 'nodemailer'
import mg from 'nodemailer-mailgun-transport'

const isDebug = process.env.EMAIL_MODE === 'development'
const FROM_EMAIL = process.env.FROM_EMAIL || 'Pingbox <no_reply@mg.pingbox.app>'
const TO_EMAIL = process.env.TO_EMAIL || 'fake@email.me'

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_API_DOMAIN || '',
  }
}

const mgInstance = nodemailer.createTransport(mg(auth));

const debugData = !isDebug ? { preview: false } : { preview: { open: { app: 'firefox', wait: false } } }

const defaultParams = {
  views: {
    root: path.join(__dirname, '../emails')
  },
  message: {
    from: FROM_EMAIL
  },
  transport: mgInstance
}

export default class EmailProvider {
  constructor() {}

  send(data, options) {
    const template = this.getTemplateFromData(data)
    const config = {
      ...debugData,
      ...defaultParams,
      send: true,
      transport: mgInstance,
    }
    const payload = {
      template,
      locals: data,
      message: {
        to: options.email || TO_EMAIL,
      },
    }

    const email = new Email(config)

    return email
      .send(payload)
      // .then(isDebug ? console.log : () => {})
      .then(() => {})
      .catch(console.error)
  }

  getTemplateFromData(data) {
    return `${data.type}`.toLowerCase() || 'default'
  }
}