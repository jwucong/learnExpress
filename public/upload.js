function Uploader(options) {
  this.onProgress = null
}

Uploader.prototype.upload = function (data, url) {
  const that = this
  const cb = f => typeof f === 'function' && f.apply(null, [].slice.call(arguments, 1))
  const xhr = new XMLHttpRequest()

  xhr.open('POST', url, true)
  xhr.onprogress = function (event) {
    const
      loaded = event.loaded,
      total = event.total,
      percent = loaded / total
    cb(that.onProgress, {loaded, total, percent, event})
  };

  xhr.send(data)
}


/**
 * images/jpeg图片压缩
 * @param data       Object|String         // File、Blob、base64图片文件
 * @param options    Object|String|Number  // 压缩配置
 * @param callback   Function              // 压缩完成后的回调
 */
function compressor(data, options, callback) {
  if (is(options, 'function')) {
    callback = options
    options = void 0
  }
  const
    conf = compressorOptions(options),
    file = is(data, 'string') ? base64ToBlob(data) : data,
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    reader = new FileReader(),
    image = new Image(),

    runcb = v => {
      if (is(callback, 'function')) {
        conf.output === 'base64' ? blobToBase64(v, callback) : callback(v)
      }
    },

    compress = (cb, limit, min = 0, max = 1) => {
      const q = min + (max - min) / 2
      const f = blob => {
        if (q <= 0.01 || Math.abs(max - min) <= 0.01) {
          cb(blob)
          return
        }
        blob.size > limit ? compress(cb, limit, min, q) : compress(cb, limit, q, max)
      }
      canvas.toBlob(f, file.type, q);
    }

  reader.onload = function () {
    image.src = this.result;
  }

  image.onload = function () {
    const size = canvasSize(conf, this.naturalWidth, this.naturalHeight)
    canvas.width = size.width
    canvas.height = size.height
    ctx.drawImage(this, 0, 0, size.width, size.height);
    if (!conf.maxSize) {
      canvas.toBlob(runcb, file.type, conf.quality / 100)
    } else {
      compress(runcb, toBytes(conf.maxSize))
    }
  }

  reader.readAsDataURL(file);
}


/**
 * 生成压缩器compressor的配置
 * @param options Object|String|Number
 * @return {Object}
 */
function compressorOptions(options) {
  const type = is(options)
  const defaults = {
    width: '100%',
    height: 'auto',
    quality: 75,
    maxSize: '',
    output: 'blob',
    sxy: [0, 0],
    dxy: [0, 0]
  }
  let conf = Object.assign({}, defaults)
  if ('Object' === type) {
    return Object.assign(conf, options)
  }
  if (/^\d+(\.\d+)?$/.test(options)) {
    const q = parseFloat(options)
    conf.quality = q > 100 ? 100 : q < 0 ? 0 : q
    return conf
  }
  if ('String' === type) {
    const wr = /^w(?:idth)?\s*(\d+(?:\.\d+)?%?)$/i
    const hr = /^h(?:eight)?\s*(\d+(?:\.\d+)?%?)$/i
    const qr = /^(?:q(?:uality)?)?\s*(\d+(?:\.\d+)?%?)$/i
    const mr = /^(?:m(?:axSize)?)?\s*(\d+(?:\.\d+)?(?:\s*([a-zA-Z]+)))?$/i
    const or = /^(?:o(?:utput)?\s*)?(blob|base64)$/i
    const tr = /^(h(?:eight)?|m(?:edium)?|l(?:ow)?)$/i
    const str = options.toLowerCase()
    const matchs = [wr, hr, qr, mr, or, tr].map(r => r.exec(str))
    const i = matchs.findIndex(m => m)
    const match = matchs[i]
    if (match) {
      switch (i) {
        case 0:
          const wm = match[1]
          conf.width = /%$/.test(wm) ? wm : Math.floor(wm / 1)
          conf.height = 'auto'
          break;
        case 1:
          const hm = match[1]
          conf.height = /%$/.test(hm) ? hm : Math.floor(hm / 1)
          conf.width = 'auto'
          break;
        case 2:
          conf.quality = match[1]
          break;
        case 3:
          conf.maxSize = indexOfByteUnits(match[2]) < 0 ? '' : match[1]
          break;
        case 4:
          conf.output = match[1]
          break;
        case 5:
          const t = match[1], m = {h: 90, m: 60, l: 30}
          conf.quality = m[t[0]] || conf.quality
          break;
      }
    }
  }
  return conf;
}


/**
 * 计算canvas的宽高
 * @param conf  Object   // compressor的配置
 * @param w0    Number   // 图片的宽度
 * @param h0    Number   // 图片的高度
 * @return {{width: (number), height: (number)}}
 */
function canvasSize(conf, w0, h0) {
  const
    per = v => /%$/.test(v),
    w = conf.width,
    h = conf.height,
    r = h0 / w0
  let cw = 0, ch = 0
  if (w === 'auto' && h === 'auto') {
    cw = w0
    ch = h0
  } else if (w !== 'auto' && h !== 'auto') {
    cw = Math.floor(per(w) ? parseFloat(w) * w0 / 100 : parseFloat(w))
    ch = Math.floor(per(h) ? parseFloat(h) * h0 / 100 : parseFloat(h))
  } else if (w === 'auto') {
    ch = Math.floor(per(h) ? parseFloat(h) * h0 / 100 : parseFloat(h))
    cw = Math.floor(ch / r)
  } else {
    cw = Math.floor(per(w) ? parseFloat(w) * w0 / 100 : parseFloat(w))
    ch = Math.floor(cw * r)
  }
  return {width: cw, height: ch}
}


/**
 * base64编码字符串转Blob二进制大对象数据
 * @param base64    String base64
 * @param mime      String mime类型
 * @return {null|Blob}   Blob 二进制大对象数据
 */
function base64ToBlob(base64, mime) {
  const
    reg = /(?:.+:(.+);.+,)?(.+)/,
    match = reg.exec(base64);

  if (!match) {
    return null
  }

  const
    fileType = mime || match[1] || 'images/png',
    base64Data = match[2] || '',
    bytes = atob(base64Data),
    size = bytes.length,
    bytesBuffer = new ArrayBuffer(bytes.length),
    bytesBufferArray = new Uint8Array(bytesBuffer);

  for (var i = 0; i < size; i++) {
    bytesBufferArray[i] = bytes.charCodeAt(i);
  }

  return new Blob([bytesBufferArray], {type: fileType});
}


/**
 * Blob二进制大对象数据转base64编码
 * @param blob       Blob
 * @param callback   callback将接收到一个base64参数
 */
function blobToBase64(blob, callback) {
  var reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = function () {
    typeof callback === 'function' && callback(this.result)
  }
}


/**
 * 检测是否是字节单位，并范围位置，类似于数组的indexOf
 * @param unit        String  // 字节单位
 * @return {number}
 */
function indexOfByteUnits(unit) {
  var units = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'];
  var index = units.findIndex(function (item, i) {
    var str = '^' + item + (i === 0 ? '(?:yte)' : 'b') + '?$';
    var reg = new RegExp(str, 'i');
    return reg.test(unit);
  });
  return index
}


/**
 * 将一个带字节单位的字符串转成字节数
 * @param size        String  // 214k、214kb、150m 150mb ...
 * @return {number}
 */
function toBytes(size) {
  var base =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1024;
  var valReg = /^\s*\+?((?:\.\d+)|(?:\d+(?:\.\d+)?))(?!\.|\d)\s*([a-zA-Z]*)/i;
  var match = valReg.exec(size);
  if (!match) {
    throw new Error('Unresolvable value: '.concat(size));
  }
  var value = +match[1];
  var unit = match[2] || 'B';
  var index = indexOfByteUnits(unit);
  if (index < 0) {
    throw new Error('Unresolvable unit: '.concat(unit));
  }
  return Math.ceil(value * Math.pow(base, index));
}


/**
 * 字节数格式化
 * @param bytes
 * @return {String}
 */
function formatBytes(bytes) {
  if (bytes <= 0) {
    return 0;
  }
  var unit = 1024;
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB'];
  var exponent = Math.floor(Math.log(bytes) / Math.log(unit));
  var size = (bytes / Math.pow(unit, exponent)).toFixed(2);
  return exponent < units.length ? [size, units[exponent]].join('') : '1000+DB';
}

function is(value, type) {
  var c = {}.toString.call(value).slice(8, -1);
  return type ? c.toLowerCase() === type.toLowerCase() : c;
}

// 切片
function cut(startX, startY, width, height) {

}
