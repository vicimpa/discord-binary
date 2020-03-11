const { Client, Message, TextChannel, DMChannel } = require('discord.js')

const chats = []

function update() {
  console.clear()
  console.log('Добро пожаловать в ClearChat')
  console.log('Просто напишите в любом текстовом канале !clear')
  console.log('Все Ваши сообщения в этом чате будут удалены')
  for(let chat of chats) {
    let {status, name, size, all} = chat
    console.log(`[#${name}] ${status} ${size}${all?`/${all}`:''} сбщ.`)
  }
}

exports.title = 'ClearChat (Утилитка для удаления всех своих сообщений в чатах)'

/** @param {Client} client */
exports.model = async function ClearChat(client) {
  update()

  /**
   * @param {TextChannel | DMChannel} channel 
   * @param {boolean} force 
   */
  async function clearChannel(channel, force = false) {
    let name = channel && channel.name || channel.nicks || (channel.recipient && channel.recipient.username) || 'Что то там'
    let status = 'Запуск...'

    let object = {
      name, status, size: 0, all: 0
    }

    chats.push(object)
    update()

    let result, last = null, find = []

    while ((result = await channel.fetchMessages({before: last, limit: 100})).size) {
      
      last = result.last().id

      for (let messageList of result) {
        for (let message of messageList) {
          try {
            if ((force || message.author.id === client.user.id) && message.deletable) {
              find.push(message)
              object.status = 'Поиск сообщений'
              object.size = find.length
              update()
            }
            
          } catch (e) {
            // console.log(e.message)
          }
        }
      }
    }

    object.size = 0
    object.all = find.length

    for(let message of find) {
      try {
        if (message.deletable) {
          await ( new Promise((resolve) => {
            let to = setTimeout(resolve, 1000)

            message.delete()
              .catch(console.error)
              .then(() => resolve())
              .then(() => clearTimeout(to))
          }))
        }
        object.status = 'Удаление'
        object.size++
        update()
        
      } catch (e) {
        console.log(e.message)
      }
    }

    object.status = 'Готово =)'
    update()
  }

  process.stdin.on('data', async (d) => {
    try {
      let find = await client.fetchUser(d.toString())

      if(find)
        return await clearChannel(find.dmChannel)

      await clearChannel(client.channels.get(d.toString()))

    }catch(e) {
      update()
    }
  })
  process.stdin.resume()
  
  client.on('message', async (message) => {
    let { author, content } = message

    if (author.id !== client.user.id)
      return null

    if (!/\!clear/.test(content))
      return null

    let force = content.indexOf('all') !== -1
    
    await clearChannel(message.channel, force)
  })
}