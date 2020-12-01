const { Client, PermissionOverwrites, User } = require('discord.js')
const { readLine } = require('../lib/console')

exports.title = 'UserInfo (Утилитка получения информации о пользователе)'

function update() {
  console.log('Добро пожаловать в UserInfo')
  console.log('Просто напишите сюда ID пользователя')
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

/** 
 * @param {User} user 
 * @param {Client} client
 * */
function getInfoUser(client, user) {
  toOut(`
    ID: ${user.id}
    Name: ${user.username}
    CreatedAt: ${user.createdAt}
  `)

  let header = false

  for(let [id, guild] of client.guilds) {
    if(!guild.members.has(user.id))
      continue

    if(!header) {
      toOut(`
        Servers:
      `)
      header = true
    }

    let member = guild.member(user)

    toOut(`
      - Member of ${guild.name} (${member.nickname} | ${member.joinedAt})
    `)
  }
}

/** @param {Client} client */
exports.model = async function ChannelInfo(client) {
  console.clear()
  update()

  while(true) {
    let userID = await readLine('Введите ID пользователя')

    if(!userID) {
      console.log('Вы не ввели ID пользователя!')
      continue
    }

    console.log('')

    let find = await client.users.get(userID)
    
    if (find)
      getInfoUser(client, find)
    else
      console.log('Пользователь не найден!')

    console.log('')
  }
}