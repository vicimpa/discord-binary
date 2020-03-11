const { Client, RichEmbed } = require('discord.js')
const { stdin, readLine } = require('../lib/console')

exports.title = 'RichChat (test) (Утилитка для создания объявлений)'

/** @param {Client} client */
exports.model = async function BineryChat(client) {
  console.clear()
  console.log('Добро пожаловать в RichChat')
  let clientId = await readLine('Введите id канала?')

  let channel = client.channels.get(clientId) || client.users.get(clientId)

  if (!channel) {
    console.log('Канал не найден!')
    return BineryChat(client)
  }

  console.log(`Открыт диалог с ${channel.name}`)

  let color = 0xFFFFFF
  let title = ''
  let footer = ''

  while (true) {
    let text = ''

    console.log(' ')
    console.log('title - заголовок\ncolor - цвет\nfooter - подвал\nsend - отправить')

    while (true) {
      let added = await readLine('')


      switch(added.trim()) {
        case 'send':
          let rich = new RichEmbed()

          rich.color = color
          rich.description = text
          rich.title = title
          rich.footer = {
            text: footer
          }

          try {
            await channel.send(rich)
          }catch(e) {
            console.log('Ошибка отправки: ' + e.message)
          }
          break

        case 'title':
          title = await readLine('Введите заголовок объявления?')

          break

        case 'footer':
          footer = await readLine('Введите текст подвала объявления?')
          break
        
        case 'color':
          color = eval('0x' + (await readLine('Введите цвет объявления?('+color.toString(16)+')') || 'ffffff'))

          break

        default: 
          text += added + '\n'
          continue
      }

      if(added === 'send')
        break;
    }
  }
}