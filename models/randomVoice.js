const { Client, VoiceChannel } = require('discord.js')
const { stdin, readLine } = require('../lib/console')
const { delay } = require('../lib/delay')

function log(string = '') {
  string.trim().split('\n').map(e => console.log('-- ' + e.trim()))
}

exports.title = 'RandomVoice (Выбор рандомного человека в войсе)'

/** @param {Client} client */
exports.model = async function RandomVoice(client) { 
  console.clear()
  console.log('Добро пожаловать в RandomVoice')
  

  while(true) {
    let channelId = await readLine('Введите id канала')

    console.log('')

    log()

    await delay(100)

    if(!channelId) {
      log('Поиск вашего канала...')
      for(let [,guild] of client.guilds) {
        for(let [,channel] of guild.channels) {
          if(!(channel instanceof VoiceChannel))
            continue
  
          if(channel.members.get(client.user.id))
            channelId = channel.id
  
          if(channelId) break
        }
  
        if(channelId) break
      }
    }else {
      log('Выбор канала ' + channelId)
    }

    log()
  
    /** @type {VoiceChannel} */
    let channel = client.channels.get(channelId)
  
    if(!channel || !(channel instanceof VoiceChannel)) {
      log('Голосовой канал не найден!')
      continue
    }

    log('Выборка людей в канале ' + channel.name)
  
    const members = channel.members.array()//.filter(e => e.id !== client.user.id)
  
    if(!members.length) {
      log('В голосовом канале нет людей!')
      continue
    }

    await delay(200)

    log('В канале: ' + members.length + ' чел')

    for(let member of members) {
      log(`= ${(members.indexOf(member) + 1)}) ` + (member.nickname || member.user.username))
    }

    await delay(100)

    log()

    const random = Math.floor(Math.random() * members.length)

    log('Рандомное число: ' + (random + 1))

    await delay(200)

    const randomMember = members[random]

    if(!randomMember) {
      log('Не удалось выбрать случайного человека!')
      continue
    }

    log('= Найден человек: ' + (randomMember.nickname || randomMember.user.username))
    log('== Id: ' + randomMember.id)
    log('== Color: ' + randomMember.displayColor)

    log()

    console.log('')
  }
}