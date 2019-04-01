const CONTENT_TYPE = require('./contentTypes')


function text2json(text) {

}

function xml2json(xml) {

}

function urlencoded2json(urlencoded) {
  const reg = /&?([^=&]+)=([^&]*)/ig
  const result = {}
  let p = null
  while (p = reg.exec(urlencoded)) {
    var key = decodeURIComponent(p[1])
    var val = decodeURIComponent(p[2])
    result[key] = /^\d+$/.test(val) ? +val : val
  }
  return result;
}

function parserBody(req, res) {
  let body = ''
  let json = null
  const contentType = req.headers['content-type']
  return new Promise((resolve, reject) => {
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      try {
        if(contentType === CONTENT_TYPE.urlencoded) {
          json = urlencoded2json(body)
        } else {
          json = JSON.parse(JSON.stringify(body))
        }
      }catch (e) {
        reject(json)
      }
      resolve(json)
    })
  })
}


module.exports = parserBody
