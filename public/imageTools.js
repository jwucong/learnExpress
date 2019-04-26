;(function () {

  var base64Reg = /^data\:([^\;]+)\;base64,(.+)$/gmi

  function ImageTool() {

  }

  ImageTool.prototype.read = function (input, output, callback) {
    if (typeof output === 'function') {
      callback = output;
      output = void 0;
    }
    output = is(output, 'string') ? output.toLowerCase() : output
    var isFn = is(callback, 'function')

    if (base64Reg.test(input)) {
      if (output === 'buffer') {
        input = this.base64ToArrayBuffer(input);
      }
      isFn && callback(input);
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      isFn && callback(this.result);
    }

    if (output === 'buffer') {
      reader.readAsArrayBuffer(input);
    } else {
      reader.readAsDataURL(input);
    }

  }

  ImageTool.prototype.toBlob = function (input, callback) {
    var match = base64Reg.exec(input);
    var mime = (match ? match[1] : input.type) || 'image/png';
    this.read(input, 'buffer', function (buffer) {
      is(callback, 'function') && callback(new Blob(buffer, mime));
    });
  }

  ImageTool.prototype.base64ToArrayBuffer = function (base64) {
    var match = base64Reg.exec(base64)
    if (!match) {
      return null
    }
    var imageData = match[2];
    var binary = atob(imageData);
    var size = binary.length;
    var buffer = new ArrayBuffer(size);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < size; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  ImageTool.prototype.getStringFromBuffer = function (buffer, offset, length) {
    var view = new DataView(buffer)
    var str = "", end = offset + length;
    for (; offset < end; offset++) {
      str += String.fromCharCode(view.getUint8(offset));
    }
    return str;
  }

  ImageTool.prototype.compress = function () {

  }

  ImageTool.prototype.adjust = function () {

  }

  ImageTool.prototype.getExif = function (input, callback) {
    this.read(input, 'buffer', function (buffer) {
      // console.group('getExif')
      var isFn = is(callback, 'function')
      var view = new DataView(buffer)
      var segments = []
      var offset = 2, markerStart = 0, markerEnd = 0, dataSize
      var current
      if (view.getUint8(0) !== 0xFF && view.getUint8(1) !== 0xD8) {
        console.log('不是JPEG格式的图片')
        isFn && callback(null);
        return;
      }
      while (offset < view.byteLength) {
        // console.log(segments)
        if (view.getUint8(offset) !== 0xFF) {
          console.log('Not a valid marker at offset "' + offset + '", found: ' + view.getUint8(offset))
          isFn && callback(segments);
          return false;
        }
        current = view.getUint8(offset + 1)
        if (current === 0 || current === 0xFF) {
          offset++
          continue;
        }
        dataSize = view.getUint16(offset + 2)
        markerStart = offset
        markerEnd = offset + 2 + dataSize + 1
        segments.push(buffer.slice(markerStart, markerEnd))
        offset = markerEnd
      }
      console.log(segments)
    })
  }

  ImageTool.prototype.insertExif = function () {

  }


  function is(value, type) {
    var c = {}.toString.call(value).slice(8, -1);
    return typeof type === 'string' ? type.toLowerCase() === c.toLowerCase() : c;
  }


  window.ImageTool = ImageTool

})();
