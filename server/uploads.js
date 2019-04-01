const multer = require('multer')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    console.log('output file size', file.size)
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    console.log('file: ')
    console.log(file)
    console.log(file.fieldname)
    const m = /(\.\w+)$/.exec(file.originalname)
    const mime = file.mimetype.replace(/.+\/(\w+)$/, '.$1')
    const ext = m ? m[1] : mime
    console.log(m)
    console.log(mime)
    console.log(ext)
    cb(null, '' + file.fieldname + '-' + formatDate(Date.now(), 'yyyyMMddhhmmss') + Math.random().toString().slice(-6) + '.jpg')
  }
})

const upload = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    const mime = file.mimetype
    const isImg = /\/(jpe?g|png|gif)$/.test(mime)
    console.log('file: ')
    console.log(file)
    console.log('mime: %s', mime)
    console.log('isImg: ', isImg)
    console.log('input file size', file.size)
    // cb(null, isImg)
    cb(null, true)
  }
})


function formatDate(date = Date.now(), formatter = 'yyyy-MM-dd hh:mm:ss') {
  const fix = n => n < 10 ? '0' + n : n + ''
  const d = new Date(date)
  const map = {
    'yyyy': d.getFullYear(),
    'MM': d.getMonth() + 1,
    'dd': d.getDate(),
    'hh': d.getHours(),
    'mm': d.getMinutes(),
    'ss': d.getSeconds()
  }
  return Object.keys(map).reduce((acc, key) => {
    return acc.replace(new RegExp(key, 'g'), fix(map[key]))
  }, formatter)
}

module.exports = upload
