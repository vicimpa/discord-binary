const { Client } = require('discord.js')
const { stdin } = require('../lib/console')

function help() {
  console.log(`Добро пожаловать в SpyChat`)
  console.log(`Список команд:`)
  console.log(`
    add [id человека] - Добавить для слежки
    del [id человека] - Удалить из слежки
    list - Список людей в слежке
    help - Помощь 
  `.trim().split('\n').map(e => '-- '+e.trim()).join('\n'))
}

exports.title = 'SpyChat (Шпионская утилитка за людьми в общих чатах)'

/** @param {Client} client */
exports.model = async function SpyChat(client) {
  let clientsIds = []
  
  stdin.resume()

  console.clear()
  help()

  stdin.on('data', async (d) => {
    try {
      let message = d.toString() + ''
      let [cmd, arg1, arg2] = message.split(/\s+/)
      let user = client.user
    
      switch(cmd) {
        case 'add':
            user = client.users.get(arg1)
            if(!user)
              return console.log(`Не найден пользователь`)

            if(clientsIds.indexOf(arg1) !== -1)
              return console.log(`Пользователь уже добавлен`)

            console.log(`Пользователь "${user.username}" добавлен в шпиона`)

            clientsIds.push(arg1)
          break;
        case 'del':
            let index = clientsIds.indexOf(arg1)

            if(index === -1)
              return console.log(`Данный пользователь не добавлен`)

            user = client.users.get(arg1)
            clientsIds.splice(index, 1)
            console.log(`Пользователь "${user ? user.username : arg1}" добавлен в шпиона`)
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

  client.on('message', (message) => {
    let { id, username } = message.author
    if (clientsIds.indexOf(id) === -1)
      return null

    let { content, guild, channel } = message

    if (/^[01\s]+$/.test(content)) {
      content = toString(content)
    }

    let mess = [username]

    if(guild && guild.name)
      mess.push(`${guild.name}`)

    if(channel && channel.name && channel.guild === guild)
      mess.push(`#${channel.name}`)

    let regExp = /<@\!([0-9]+)>/

    while(regExp.test(content)) {
      let [find,id] = regExp.exec(content)

      let user = client.users.get(id)

      if(!user && guild)
        user = guild.members.get(id)

      if(user)
        content = content.replace(find, '@'+user.username)
      else
        content = content.replace(find, '@'+id)
    }

    console.log(`${mess.join(' - ')}: \n    ${content}`)
  })
}