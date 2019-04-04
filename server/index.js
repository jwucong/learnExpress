const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const config = require('./config')
const CONTENT_TYPE = require('./contentTypes')
const utils = require('./utils')
const upload = require('./uploads')
const mmulter = multer({dest: 'uploads/'})
let fragmentCount = 0
let fragmentData = null

const resolve = file => path.join(__dirname, '..', file)


const app = express();
app.use(express.static(resolve('public')))

// hello world
app.get('/', (req, res) => {
  res.sendFile(resolve('public/index.html'))
})

// application/json
app.post('/api/submit', bodyParser.json(), (req, res) => {
  utils(req).then(json => {
    console.log('application/json then:')
    console.log(json)
    res.send(json)
  }).catch(e => {
    console.log('application/json e:')
    console.log(e)
    e ? res.send(e) : res.end()
  })
})

// text/plain
// app.post('/api/submit', bodyParser.text(), (req, res) => {
//   console.log('text/plain req.body:')
//   console.log(req.body)
//   res.send(JSON.stringify(req.body))
// })


// upload
app.post('/upload', function(req, res, next) {
  console.log('req: ', req)
  console.log('body: ', req.files)
  // next()
  res.end()
}, upload.any(), function (req, res, next) {
  // req.body contains the text fields
  console.log('req: ', req.body)
  // console.log('req.files: ')
  // console.log(req.files)
  res.send(JSON.stringify({
    code: 1,
    msg: 'OK',
    data: 'success'
  }))
})


// chunks upload
// app.post('/upload', bodyParser.json(), function (req, res, next) {
//   // req.body contains the text fields
//   console.log('body: ', req.body)
//   console.log('body.chunks: ', req.body.chunks)
//   res.send(JSON.stringify({
//     code: 1,
//     msg: 'OK',
//     data: 'success'
//   }))
// })

// app.post('/upload', mmulter.any(), function (req, res, next) {
//   // req.body contains the text fields
//   console.log('req.files: ')
//   console.log(req.files)
//   res.send(JSON.stringify({
//     code: 1,
//     msg: 'OK',
//     data: 'success'
//   }))
// })

// app.post('/upload',function (req, res, next) {
//   // req.body contains the text fields
//   let chunks = ''
//   req.on('data', chunk => {
//     chunks += chunk
//   })
//   req.on('end', () => {
//     console.log('end chunks:')
//     console.log(chunks)
//     fs.writeFile('uploads/')
//     res.send(JSON.stringify({
//       code: 1,
//       msg: 'OK',
//       data: 'success'
//     }))
//   })
// })

const server = app.listen(config.port, () => {
  console.log("express服务启动成功，访问地址为: http://localhost:%s", config.port)
})
