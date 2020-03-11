const { Request } = require('./requestApi')

exports.DiscordAuth = class DiscordAuth {
  constructor() {
    this.ticket = ''
    this.api = new Request('https://discordapp.com/api/v6/auth/')
  }

  async login(email = '', password = '') {
    let captcha_key = null
    let undelete = false
    let options = { captcha_key, email, password, undelete }
    let result = await this.api.post('login', options)

    if (result.token)
      return result.token

    if (!result.ticket)
      throw new Error('Что то вы ввели не так!')

    this.ticket = result.ticket

    return Object.keys(result).filter(key => result[key] === true)
  }

  async sendMfa(code = '') {
    let {ticket} = this
    let options = {ticket, code}
    let result = await this.api.post('mfa/totp', options)

    if(!result.token)
      throw new Error('Код не верный!')
    
    return result.token
  }    
  
  async sendSms(code = '') {
    let {ticket} = this
    let options = {ticket, code}
    let result = await this.api.post('mfa/sms', options)

    if(!result.token)
      throw new Error('Код не верный!')
    
    return result.token
  }
  
  async getSms() {
    let {ticket} = this
    let options = {ticket}
    let result = await this.api.post('mfa/sms/send', options)

    return result.phone
  }
}

