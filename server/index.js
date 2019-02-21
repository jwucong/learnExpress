const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const config = require('./config')

const resolve = file => path.join(__dirname, '..', file)

const app = express();
app.use(express.static(resolve('public')))


// hello world
app.get('/', (req, res) => {
  res.sendFile(resolve('public/index.html'))
})

app.get('/index.html', (req, res) => {
  res.sendFile(resolve('public/index.html'))
})

app.post('/api/getp1', (req, res) => {
  res.json({
    id: 214,
    name: 'jwucong'
  })
})

const server = app.listen(config.port, () => {
  console.log("express服务启动成功，访问地址为: http://localhost:%s", config.port)
})
