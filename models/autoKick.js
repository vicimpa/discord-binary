const { Client, VoiceChannel } = require('discord.js')
const cache = require('../lib/cache')
const { stdin } = require('../lib/console')
const { delay } = require('../lib/delay')

/**
 * 
 * @param {{list: {id: string, name: string}[]}} [users]
 */
function help(users = []) {
  console.log(`Добро пожаловать в AutoKick`)
  console.log(`Список команд:`)
  console.log(`
    add [id человека] - Добавить в список
    del [id человека] - Удалить из списка
    list - Список людей в автокике
    help - Помощь
  `.trim().split('\n').map(e => '-- '+e.trim()).join('\n'))
  console.log(users && users.length
    ? `Текущий список\n${users.map(({id, name}, i) => `${i+1}. [${id}] ${name}`).join('\n')}` 
    : "")
}

exports.title = 'AutoKick (Автоматический кик персонажей по ID)'

/** @param {Client} client */
exports.model = async function AutoKick(client) {
  /**
   * @type {{list: {id: string, name: string}[]}}
   */
  const { list: clientsIds } = await cache('list', "AUTOKICK") || {list: []};
  
  stdin.resume()

  console.clear()
  const _help = help.bind(null, clientsIds)
  _help()
  /**
   * 
   * @param {{id: string, name: string}[]} clients 
   */
  const pushToCache = (clients) => {
    return cache('list', "AUTOKICK", { list: clients });
  }

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

            if(clientsIds.some(({id}) => id === arg1))
              return console.log(`Пользователь уже добавлен`)

            console.log(`Пользователь "${user.username}" добавлен в список`)
            clientsIds.push({id: arg1, name: user.username});
            await pushToCache(clientsIds);
          break;
        case 'del':
            const index = clientsIds.findIndex(({id}) => arg1 === id);

            if(index === -1)
              return console.log(`Данный пользователь не добавлен`);

            const { name } = clientsIds[index];

            clientsIds.splice(index, 1);

            await pushToCache(clientsIds);
            console.log(`Пользователь "${name}" удален из списка`);
          break;
        case 'list':
          console.log(`Список людей в автокике:`)
          clientsIds.forEach(({id, name}, i) => console.log(`${i+1}. [${id}] ${name}`));
          break;

        case 'help':
          _help()
          break;
      }
    } catch(e) {}
  })

  /**
   * @type {VoiceChannel[]}
   */
  const handledVoiceChannels = client.channels
    .filter(v => v.type === "voice")
    .filter(v => v.memberPermissions(client.user)?.has('MANAGE_CHANNELS'));

  client.addListener("voiceStateUpdate", (_, newState) => {
    const { voiceChannelID = "" } = newState;
    const voiceChannel = handledVoiceChannels.find(v => v.id === voiceChannelID);

    if (!voiceChannel) return;

    voiceChannel
      .members
      .filter(m => clientsIds.some(({id}) => id === m.id))
      .forEach(member => member.setVoiceChannel(null).catch(() => {}));
  });

  client.voiceConnections?.forEach(v => v.members
    .filter(m => clientsIds.some(({id}) => id === m.id))
    .forEach(member => member.setVoiceChannel(null).catch(() => {})))
  
  while(true) {
    await delay(1000)
  }
  // client.removeListener("voiceStateUpdate")
}