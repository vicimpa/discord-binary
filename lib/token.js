const { readFileSync, writeFileSync } = require('fs')

exports.Token = class Token {
  static readToken() {
    try {
      return readFileSync('./token', 'utf-8')
    }catch(e) {
      return false
    }
  }

  static writeToken(token = '') {
    writeFileSync('./token', token, 'utf-8')
    return token
  }
}