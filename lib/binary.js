exports.toBin = function toBin(string = '') {
  let buff = Buffer.from(string)
  let out = ''

  for (let chank of buff) {
    let chankString = chank.toString(2)

    out += ' ' + (`0000000${chankString}`).slice(-8)
  }

  return out.trim()
}

exports.toString = function toString(string = '') {
  let chanks = string.replace(/[^01\s]/g, '').trim()
    .split(/\s+/).map(e => parseInt(e, 2))

  let buff = Buffer.from(chanks)

  return buff.toString('utf-8')
}