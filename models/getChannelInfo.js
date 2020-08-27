const { Client, Channel, VoiceChannel, GroupDMChannel, TextChannel, PermissionOverwrites } = require('discord.js')
const { readLine } = require('../lib/console')

exports.title = 'ChannelInfo (Утилитка получения информации о канале)'

function update() {
  console.log('Добро пожаловать в ChannelInfo')
  console.log('Просто напишите сюда ID канала')
}

function toOut(data = '') {
  console.log(data.trim().split('\n').map(e => e.trim()).filter(e => !!e).join('\n'))
}

/** @param {PermissionOverwrites} perm */
function getInfoPermission(perm) {
  if(perm.type == 'member') {
    return `
      MemberName: ${perm?.channel?.client?.users?.get(perm.id)?.username}
    `.trim()
  }

  if(perm.type == 'role') {
    return `
      RoleName: ${perm?.channel?.guild?.roles?.get(perm.id)?.name}
    `.trim()
  }
 
  return ''
}

/** @param {Channel} channel */
function getInfoChannel(channel) {
  toOut(`
    ID: ${channel.id}
    Type: ${channel.type}
    CreatedAt: ${channel.createdAt}
  `)

  if(channel instanceof VoiceChannel || channel instanceof TextChannel) {
    toOut(`
      Name: ${channel.name}
      Position: ${channel.position}
      ParentID: ${channel.parentID}

      PERMISSIONS:
    `)

    toOut(channel.permissionOverwrites.filter(e => e.type =='member').map((value, key) => {
      return `
        = ID: ${value.id}
        = Type: ${value.type}
        = ${getInfoPermission(value)}
        = Allow: ${value.allow}
        = Deny: ${value.deny}
        =-------------------------
      `.trim()
    }).join('\n'))
  }


}

/** @param {Client} client */
exports.model = async function ChannelInfo(client) {
  console.clear()
  update()

  while(true) {
    let channelId = await readLine('Введите ID канала')

    if(!channelId) {
      console.log('Поиск канала, где вы сидите...')
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
    }

    console.log('')

    let find = await client.channels.get(channelId)
    
    if (find)
      getInfoChannel(find)
    else
      console.log('Канал не найден!')
  }
}