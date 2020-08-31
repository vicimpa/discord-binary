const { Client, DMChannel, GroupDMChannel } = require('discord.js')
const { Token } = require('./lib/token')
const { readLine } = require('./lib/console')
const { DiscordAuth } = require('./lib/discordAuth')
const { promises: { readdir } } = require('fs')
const { existsSync } = require('fs')
const { join: joinPath } = require('path')

/**
 * @returns {Promise<[{title: string, model: (client: Client) => Promise<void>}]>}
 */
async function loadModels() {
  let dir = './models'
  let exts = ['', '.js', '.ts']
  let files = await readdir(dir)
  let models = []

  for(let file of files) {
    for(let ext of exts) {
      let fileName = joinPath(__dirname, dir, file+ext)
      
      if(!existsSync(fileName))
        continue;

      delete require.cache[fileName]

      try {
        let module = require(fileName)
        let {title, model} = module
  
        let isString = typeof title === 'string'
        let isFunct = typeof model === 'function'
  
        if(isString && isFunct)
          models.push({title, model})
      }catch(e) {
        continue;
      }
    }
  }

  return models
}

async function login() {
  let discordAuth = new DiscordAuth()

  try {
    let email = await readLine('Ваш email?')
    let password = await readLine('Ваш пароль?', true)
    let result = await discordAuth.login(email, password)
    let quest = 'Введите ключ авторизации'
    let token = null

    if (typeof result === 'string')
      return result

    while (!token) {
      try {
        if (result.indexOf('sms'))
          quest += ' или sms для получения смс'

        let mfa = await readLine(quest)

        if (mfa === 'sms') {
          let phone = await discordAuth.getSms()

          while (!token) {
            try {
              let sms = await readLine(`Введите код отправленный на ${phone}`)
              let result = await discordAuth.sendSms(sms)

              if (!result)
                console.log('Код неверный!')
              else
                token = result
            } catch (e) {
              console.error(e)
            }
          }

          continue;
        }

        let response = await discordAuth.sendMfa(mfa)

        if (!response)
          console.log('Код неверный!')
        else
          token = response

      } catch (e) {
        console.error(e)
      }
    }

    return token
  } catch (e) {
    console.log(e)
    return login()
  }
}

async function main() {
  let client = new Client()

  client.once('ready', () => {
    console.clear()
    console.log(`Login with ${client.user.username}`)
  })

  while (true) {
    try {
      let token = await Token.readToken()
    
      if (token.length < 10) {
        token = await login()
        Token.writeToken(token)
      }

      await client.login(token)
      break;
    } catch (e) {
      Token.writeToken('')
    }
  }
  
  while (true) {
    let models = await loadModels()

    for(let index in models) {
      let model = models[index]
      let {title} = model

      console.log(`${+index+1} - ${title}`)
    }

    let enterIndex = +(await readLine('Введите номер модуля')) - 1

    if(!models[enterIndex]) {
      console.log('Команда не найдена!')
      continue;
    }

    await models[enterIndex].model(client)
    return null;
  }
}

main().catch(console.error)