const { Client, RichEmbed, TextChannel, CategoryChannel, Message } = require('discord.js')
const { stdin, readLine } = require('../lib/console')

exports.title = 'Поиск закрепленных сообщений'

/** @param {Client} client */
exports.model = async function BineryChat(client) {
  console.clear()
  console.log('Добро пожаловать в Модуль')

  require('fs').writeFileSync('./output', '')

  let clientId = await readLine('Введите id канала?')

  let channel = client.channels.get(clientId)

  /** @type {Message[]} */
  let messages = []

  /** @type {TextChannel[]} */
  let channels = []

  if(channel instanceof CategoryChannel) {
    let guild = channel.guild
    let arr = guild.channels.findAll("parentID", channel.id)

    for(let ch of arr) 
      if(ch instanceof TextChannel)
        channels.push(ch)
  }

  if(channel instanceof TextChannel) {
    channels = [channel]
  }

  let append = (text = '', skip = 0, sym = '') => {
    let {appendFileSync} = require('fs')

    text = text
      .split('\n')
      .map(e => ' '.repeat(skip)+sym+e)
      .join('\n')

    appendFileSync('./output', text + '\n')
    console.log(text)
  }

  for(let channel of channels) {
    let mess = await channel.fetchPinnedMessages()
    messages = mess.array()

    if(messages.length)
      append(`${channel.name}:`)

    for(let mass of messages) {
      append(`${mass.author.username} ${mass.createdAt}`, 3)
      append(`${mass.content}`, 6)

      for(let em of mass.embeds) {
        append(`${em.title}`, 6, '|')
        append(`${em.description}`, 6, '|')
        append(`${em.footer.text}`, 6, '|')
      }
      append(` `)
    }
  }
}