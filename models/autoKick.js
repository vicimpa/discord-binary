const { Client, VoiceChannel } = require('discord.js')
const { stdin } = require('../lib/console')
const { delay } = require('../lib/delay')

function help() {
  console.log(`Добро пожаловать в AutoKick`)
  console.log(`Список команд:`)
  console.log(`
    add [id человека] - Добавить в список
    del [id человека] - Удалить из списка
    list - Список людей в списке
    help - Помощь 
  `.trim().split('\n').map(e => '-- '+e.trim()).join('\n'))
}

exports.title = 'AutoKick (Автоматический кик персонажей по ID)'

/** @param {Client} client */
exports.model = async function AutoKick(client) {
  let clientsIds = []
  
  stdin.resume()

  console.clear()
  help()

  stdin.on('data', async (d) => {
    try {
      let message = d.toString() + ''
      let [cmd, arg1, arg2] = message.trim().split(/\s+/)
      let user = client.user
    
      switch(cmd) {
        case 'add':
            user = client.users.get(arg1)
            if(!user)
              return console.log(`Не найден пользователь`)

            if(clientsIds.indexOf(arg1) !== -1)
              return console.log(`Пользователь уже добавлен`)

            console.log(`Пользователь "${user.username}" добавлен в список`)

            clientsIds.push(arg1)
          break;
        case 'del':
            let index = clientsIds.indexOf(arg1)

            if(index === -1)
              return console.log(`Данный пользователь не добавлен`)

            user = client.users.get(arg1)
            clientsIds.splice(index, 1)
            console.log(`Пользователь "${user ? user.username : arg1}" удален из списка`)
          break;
        case 'list':
          console.log(`Список пользователей в списке:`)
          for(let clientid of clientsIds) {
            let index = clientsIds.indexOf(clientid)
            user = client.users.get(clientid)
            console.log(`${index + 1} ${user ? user.username : clientid}`)
          }
          break;

        case 'help':
          help()
          break;
      }
    }catch(e) {}
  })

  while(true) {
    for(let [,guild] of client.guilds) {
      const myMember = guild.member(client.user)

      for(let [,channel] of guild.channels) {
        if(!(channel instanceof VoiceChannel))
          continue

        if(!channel.memberPermissions(myMember).has('MANAGE_CHANNELS'))
          continue


        for(let [,member] of channel.members) {
          const {id} = member

          if(clientsIds.indexOf(id) == -1)
            continue
            
          await member.setVoiceChannel(null)
        }
      }
    } 

    await delay(1000)
  }
}