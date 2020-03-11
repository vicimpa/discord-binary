const { Client } = require('discord.js')
const { toString, toBin } = require('../lib/binary')
const { stdin, readLine } = require('../lib/console')

exports.title = 'BinaryChat (test) (Утилитка для общения бинарным кодом)'

/** @param {Client} client */
exports.model = async function BineryChat(client) {
  console.clear()
  console.log('Добро пожаловать в BinaryChat')
  let clientId = await readLine('С кем Вы будете общаться(id)?')

  let user = client.users.get(clientId) || client.channels.get(clientId)

  if(!user) {
    console.log('Пользователь не найден! Повторите ввод id!')
    return BineryChat(client)
  }

  console.log(`Открыт диалог с ${user.username}`)
  console.log('Пишите сообщения через > для перевода в бинарник')

  stdin.resume()

  stdin.on('data', async (d) => {
    try {
      let user = client.users.get(clientId)
      let message = d.toString().trim()

      if(message[0] === '>')
        message = toBin(message.slice(1))

      user.send(message)
    }catch(e) {

    }
  })

  client.on('message', (message) => {
    let { id, username } = message.author
    if (id !== clientId)
      return null

    let { content } = message

    let regExpBin = /^[01\s]+$/
    let regExpHex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/i

    // if (regExpHex.test(content)) {
    //   content = Buffer.from(content, 'base64').toString('utf-8')
    // }
    
    if (regExpBin.test(content)) {
      content = toString(content)
    }

    console.log(`${username}: \n    ${content}`)
  })
}