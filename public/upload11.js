function base64ToBlob(base64, mime) {
  var reg = /(?:.+:(.+);.+,)?(.+)/
  var match = reg.exec(base64)
  var blob = null
  if (!match) {
    return blob
  }
  var fileType = mime || match[1] || 'images/png'
  var base64Data = match[2] || ''
  var bytes = atob(base64Data);
  var size = bytes.length
  var bytesBuffer = new ArrayBuffer(bytes.length);
  var bytesBufferArray = new Uint8Array(bytesBuffer);

  for (var i = 0; i < size; i++) {
    bytesBufferArray[i] = bytes.charCodeAt(i);
  }
  blob = new Blob([bytesBufferArray], {type: fileType})
  return blob;
}


function fileToBase64(file, callback) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    var base64 = this.result
    typeof callback === 'function' && callback(base64)
  }
}


function imageCompressor(data, options, callback) {
  var defaults = {
    width: 1,
    height: 'auto',
    quality: 75,   // 0 - 100
    maxSize: '',   // bytes or string
    output: 'Blob', // Blob or base64,
  }
  var ops = Object.assign({}, defaults)
  var reg = /^(\d+(?:\.\d+)?)(?:\s*([a-zA-Z]+))?$/
  var match = null
  var quality = 0
  var file = is(data, 'string') ? base64ToBlob(data) : data
  var reader = new FileReader();
  var image = new Image()
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d');
  if (typeof options === 'function') {
    callback = options
    options = void 0
  }
  if (is(options, 'object')) {
    ops = Object.assign(ops, options)
  } else if (is(options, 'string')) {
    options = options.toLowerCase()
    if (options === 'blob' || options === 'base64') {
      ops.output = options
    } else {
      match = reg.exec(options)
      console.log('match: %o', match)
      if(match) {
        if (match[1] && match[2] && indexOfByteUnits(match[2]) > -1) {
          ops.maxSize = options
        } else {
          quality = parseFloat(options)
          ops.quality = quality > 100 ? 100 : quality < 0 ? 0 : quality
        }
      }
    }
  } else if (is(options, 'number')){
    ops.quality = options > 100 ? 100 : options < 0 ? 0 : options
  }
  reader.readAsDataURL(file);
  reader.onload = function() {
    image.src = this.result;
  }
  image.onload = function() {
    var w = this.width;
    var h = this.height;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(this, 0, 0, w, h);
    // var base64 = canvas.toDataURL(file.type, ops.quality / 100);
    var base64 = canvas.toBlob(function(blob) {
      // console.log('upload blob: %o', data)
      typeof callback === 'function' && callback(blob)
    }, file.type, ops.quality / 100);
    // var blob = base64ToBlob(base64)
    // var arg = ops.output === 'base64' ? base64 : blob
    // console.log('aft base64 size: %o', base64.length)
    // console.log('aft blob: %o', blob)
    // console.log('aft blob size: %o', blob.size)
    // typeof callback === 'function' && callback(arg)
  }
  // blob: 554102
  // base64: 738827
  // console.log(ops)
}

function mergeCompressorOptions(options) {
  const type = is(options)
  const defaults = {
    width: 1,        // number or auto ; 0 - 1区间为百分比，大于1为直接设置宽度width
    height: 'auto',  // 同上
    quality: 75,     // 0 - 100 or /^h(eight)?$/: 90 ; /^m(edium)?$/: 60 ;  /^l(ow)?$/: 30
    maxSize: '',     // bytes or string
    output: 'Blob',  // Blob or base64,
  }
  let conf = Object.assign({}, defaults)
  if('Object' === type) {
    return Object.assign(conf, options)
  }
  if(/^\d+(\.\d+)?$/.test(options)) {
    const q = parseFloat(options)
    conf.quality = q > 100 ? 100 : q < 0 ? 0 : q
    return conf
  }
  if('String' === type) {
    const wr = /^w(?:idth)?\s*(\d+(?:\.\d+)?)$/i
    const hr = /^h(?:eight)?\s*(\d+(?:\.\d+)?)$/i
    const qr = /^q(?:uality)?\s*(\d+(?:\.\d+)?)$/i
    const mr = /^(?:m(?:axSize)?\s*)?(\d+(?:\.\d+)?(?:\s*([a-zA-Z]+)))?$/i
    const or = /^(?:o(?:utput)?\s*)?(blob|base64)$/i
    const tr = /^(h(?:eight)?|m(?:edium)?|l(?:ow)?)$/i
    const str = options.toLowerCase()
    const matchs = [wr, hr, qr, mr, or, tr].map(r => r.exec(str))
    const i = matchs.findIndex(m => m)
    const match = matchs[i]
    if(match) {
      switch (match[1]) {
        case 0:
          const w = Math.floor(match[1] / 1)
          conf.width = w <= 0 ? 1 : w
          conf.height = 'auto'
          break;
        case 1:
          const h = Math.floor(match[1] / 1)
          conf.height = h <= 0 ? 1 : h
          conf.width = 'auto'
          break;
        case 2:
          const q = Math.floor(match[1] / 1)
          conf.quality = q > 100 ? 100 : q < 0 ? 0 : q
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


function is(value, type) {
  var c = {}.toString.call(value).slice(8, -1);
  return type ? c.toLowerCase() === type.toLowerCase() : c;
}

function indexOfByteUnits(unit) {
  var units = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'];
  var index = units.findIndex(function (item, i) {
    var str = '^' + item + (i === 0 ? '(?:yte)' : 'b') + '?$';
    var reg = new RegExp(str, 'i');
    return reg.test(unit);
  });
  return index
}

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

function formatBytes(bytes) {
  var base =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1024;
  var digits =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
  var MAX_SIZE = Math.pow(base, 11);
  if (bytes < 0 || bytes > MAX_SIZE) {
    throw new Error(
      bytes < 0
        ? 'Bytes can not be negative'
        : 'The number of bytes is too large'
    );
  }
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB'];
  var n = Math.floor(Math.log(bytes) / Math.log(base));
  var size = (bytes / Math.pow(base, n)).toFixed(digits);
  return size + units[n];
}

