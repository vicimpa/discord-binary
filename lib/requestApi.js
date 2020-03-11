
const { request } = require('https')
const { parse: parseUrl } = require('url')
const { stringify: objData } = require('querystring')

exports.Request = class Request {
  constructor(base = '') {
    this.base = base
    this.data = ''

    this.headers = {
      "Content-Type": "application/json"
    }

    this.gettingData = this.gettingData.bind(this)
    this.parseGettingData = this.parseGettingData.bind(this)
  }

  getUrl(url = '') {
    let { base } = this
    return parseUrl(`${base}${url}`)
  }

  gettingData(d = Buffer.from('')) {
    this.data += d.toString('utf-8')
  }

  parseGettingData() {
    let data = this.data
    this.data = ''

    try {
      let parsed = JSON.parse(data)
      return parsed
    } catch (e) {
      return data
    }
  }

  get(url = '', data = {}) {
    let { host, path, query } = this.getUrl(url)
    let sendData = Object.assign({}, query | {}, data)
    let sendDataString = objData(sendData)

    let { gettingData, parseGettingData } = this

    if (sendDataString)
      path += `?${sendDataString}`

    return new Promise((resolve, reject) => {
      let req = request({ host, path, headers }, (res) => {
        res.on('error', reject)
        res.on('data', gettingData)
        res.on('end', () => resolve(parseGettingData()))
      })

      req.end()
    })
  }

  post(url = '', data = {}, json = true) {
    let { host, path, query } = this.getUrl(url)
    let sendData = Object.assign({}, query | {})
    let sendDataString = objData(sendData)

    let { gettingData, parseGettingData, headers } = this

    if (sendDataString)
      path += `?${sendDataString}`

    return new Promise((resolve, reject) => {
      let req = request({ host, path, method: "POST", headers }, (res) => {
        res.on('error', reject)
        res.on('data', gettingData)
        res.on('end', () => resolve(parseGettingData()))
      })

      req.write(json ? JSON.stringify(data) : objData(data), (err) => {
        if (err)
          return reject(err)

        req.end()
      })

    })
  }
}