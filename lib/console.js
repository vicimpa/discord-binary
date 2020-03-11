const { Writable } = require('stream')
const { createInterface } = require('readline')

const { stdin, stdout } = process

exports.readLine = async function readLine(question = '', hide = false) {
  let mutableStdout = new Writable({
    write: function (chunk, encoding, callback) {
      if (this.muted) 
        return callback()

      stdout.write(chunk, encoding)
      callback()
    }
  })

  return new Promise(resolve => {
    let interface = createInterface({
      input: stdin,
      output: mutableStdout,
      terminal: true
    })

    mutableStdout.muted = false

    let quest = `${question}: `
    
    interface.question(quest, answer => {
      if(hide)
        stdout.write('\n')

      interface.close()
      resolve(answer)
    })
    
    mutableStdout.muted = hide === true
  })
}

exports.stdin = stdin
exports.stdout = stdout