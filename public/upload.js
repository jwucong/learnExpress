function compressor(data, options, callback) {
  if (is(options, 'function')) {
    callback = options
    options = void 0
  }
  const
    runcb = v => is(callback, 'function') && callback(v),
    conf = compressorOptions(options),
    file = is(data, 'string') ? base64ToBlob(data) : data,
    reader = new FileReader(),
    image = new Image(),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');
  
  reader.readAsDataURL(file);
  reader.onload = function () {
    image.src = this.result;
  }
  image.onload = function () {
    const
      size = canvasSize(conf, this.naturalWidth, this.naturalHeight)
    
    canvas.width = size.width
    canvas.height = size.height
    ctx.drawImage(this, 0, 0, size.width, size.height);
    if(!conf.maxSize) {
      canvas.toBlob(runcb, file.type, conf.quality)
    } else {
      compress(runcb, 0.5, toBytes(conf.maxSize), 0)
    }
  }
  
  // TODO 此处终止条件如何确定，终止时调用cb
  // 逐步逼近法
  function compress(cb, q, ms, min, max){
    min = d || 0
    max = max || q
    canvas.toBlob(function (blob){
      if(q <= 0 || Math.abs(min - max) < 10) {
        cb(blob)
        return
      }
      if(blob.size > ms) {
        compress(cb, Math.floor(min + (q - min) / 2), ms, 0, q)
      } else {
        compress(cb, Math.floor(q + q / 2), ms, q, max)
      }
    }, file.type, q);
  }
  
  // q50 d0 >
  // q25 d0 <
  // q37 d37 <
  //
  
  
}




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

function compressorOptions(options) {
  const type = is(options)
  const defaults = {
    width: '100%',   // number or auto ; 0 - 1区间为百分比，大于1为直接设置宽度width
    height: 'auto',  // 同上
    quality: 75,     // 0 - 100 or /^h(eight)?$/: 90 ; /^m(edium)?$/: 60 ;  /^l(ow)?$/: 30
    maxSize: '',     // bytes or string
    output: 'blob',  // Blob or base64,
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

function is(value, type) {
  var c = {}.toString.call(value).slice(8, -1);
  return type ? c.toLowerCase() === type.toLowerCase() : c;
}
