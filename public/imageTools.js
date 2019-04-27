;(function () {
  
  var base64Reg = /^data\:([^\;]+)\;base64,(.+)$/gmi
  
  var tiffTags = {
    0x0100: 'ImageWidth',
    0x0101: 'ImageLength',
    0x0102: 'BitsPerSample',
    0x0103: 'Compression',
    0x0106: 'PhotometricInterpretation',
    0x0112: 'Orientation',
    0x0115: 'SamplessPerPixel',
    0x011C: 'PlanarConfiguration',
    0x0212: 'YCbCrSubSampling',
    0x0213: 'YCbCrPositioning',
    0x011A: 'XResolution',
    0x011B: 'YResolution',
    0x0128: 'ResolutionUnit',
    
    0x0111: 'StripOffsets',
    0x0116: 'RowsPerStrip',
    0x0117: 'StripByteCounts',
    0x0201: 'JPEGInterchangeFormat',
    0x0202: 'JPEGInterchangeFormatLength',
    
    0x012D: 'TransferFunction',
    0x013E: 'WhitePoint',
    0x013F: 'PrimaryChromaticities',
    0x0211: 'YCbCrCoefficients',
    0x0214: 'ReferenceBlackWhite',
    
    0x0132: 'DateTime',
    0x010E: 'ImageDescription',
    0x010F: 'Make',
    0x0110: 'Model',
    0x0131: 'Software',
    0x013B: 'Artist',
    0x8298: 'Copyright',
  }
  
  var ifdTags = {
    0x9000: 'ExifVersion',
    0xA000: 'FlashpixVersion',
    
    0xA001: 'ColorSpace',
    0xA500: 'Gamma',
    
    0x9101: 'ComponentsConfiguration',
    0x9102: 'CompressedBitsPerPixel',
    0xA002: 'PixelXDimension',
    0xA003: 'PixelYDimension',
    
    0x927C: 'MakerNote',
    0x9286: 'UserComment',
    
    0xA004: 'RelatedSoundFile',
    
    0x9003: 'DateTimeOriginal',
    0x9004: 'DateTimeDigitized',
    0x9290: 'SubSecTime',
    0x9291: 'SubSecTimeOriginal',
    0x9292: 'SubSecTimeDigitized',
    
    0xA420: 'ImageUniqueID',
    0xA430: 'CameraOwnerName',
    0xA431: 'BodySerialNumber',
    0xA432: 'LensSpecification',
    0xA433: 'LensMake',
    0xA434: 'LensModel',
    0xA435: 'LensSerialNumber',
    
    0x829A: 'ExposureTime',
    0x829D: 'FNumber',
    0x8822: 'ExposureProgram',
    0x8824: 'SpectralSensitivity',
    0x8827: 'PhotographicSensitivity',
    0x8828: 'OECF',
    0x8830: 'SensitivityType',
    0x8831: 'StandardOutputSensitivity',
    0x8832: 'RecommendedExposureIndex',
    0x8833: 'ISOSpeed',
    0x8834: 'ISOSpeedLatitudeyyy',
    0x8835: 'ISOSpeedLatitudezzz',
    0x9201: 'ShutterSpeedValue',
    0x9202: 'ApertureValue',
    0x9203: 'BrightnessValue',
    0x9204: 'ExposureBiasValue',
    0x9205: 'MaxApertureValue',
    0x9206: 'SubjectDistance',
    0x9207: 'MeteringMode',
    0x9208: 'LightSource',
    0x9209: 'Flash',
    0x920A: 'FocalLength',
    0x9214: 'SubjectArea',
    0xA20B: 'FlashEnergy',
    0xA20C: 'SpatialFrequencyResponse',
    0xA20E: 'FocalPlaneXResolution',
    0xA20F: 'FocalPlaneYResolution',
    0xA210: 'FocalPlaneResolutionUnit',
    0xA214: 'SubjectLocation',
    0xA215: 'ExposureIndex',
    0xA217: 'SensingMethod',
    0xA300: 'FileSource',
    0xA301: 'SceneType',
    0xA302: 'CFAPattern',
    0xA401: 'CustomRendered',
    0xA402: 'ExposureMode',
    0xA403: 'WhiteBalance',
    0xA404: 'DigitalZoomRatio',
    0xA405: 'FocalLengthIn35mmFilm',
    0xA406: 'SceneCaptureType',
    0xA407: 'GainControl',
    0xA408: 'Contrast',
    0xA409: 'Saturation',
    0xA40A: 'Sharpness',
    0xA40B: 'DeviceSettingDescription',
    0xA40C: 'SubjectDistanceRange',
    
    0x0001: 'InteroperabilityIndex'
  }
  
  var colorCfaTags = {
    0x00: 'RED',
    0x01: 'GREEN',
    0x02: 'BLUE',
    0x03: 'CYAN',
    0x04: 'MAGENTA',
    0x05: 'YELLOW',
    0x06: 'WHITE'
  }
  
  var gpsTags = {
    0x00: 'GPSVersionID',
    0x01: 'GPSLatitudeRef',
    0x02: 'GPSLatitude',
    0x03: 'GPSLongitudeRef',
    0x04: 'GPSLongitude',
    0x05: 'GPSAltitudeRef',
    0x06: 'GPSAltitude',
    0x07: 'GPSTimeStamp',
    0x08: 'GPSSatellites',
    0x09: 'GPSStatus',
    0x0A: 'GPSMeasureMode',
    0x0B: 'GPSDOP',
    0x0C: 'GPSSpeedRef',
    0x0D: 'GPSSpeed',
    0x0E: 'GPSTrackRef',
    0x0F: 'GPSTrack',
    0x10: 'GPSImgDirectionRef',
    0x11: 'GPSImgDirection',
    0x12: 'GPSMapDatum',
    0x13: 'GPSDestLatitudeRef',
    0x14: 'GPSDestLatitude',
    0x15: 'GPSDestLongitudeRef',
    0x16: 'GPSDestLongitude',
    0x17: 'GPSDestBearingRef',
    0x18: 'GPSDestBearing',
    0x19: 'GPSDestDistanceRef',
    0x1A: 'GPSDestDistance',
    0x1B: 'GPSProcessingMethod',
    0x1C: 'GPSAreaInformation',
    0x1D: 'GPSDateStamp',
    0x1E: 'GPSDifferential',
    0x1F: 'GPSHPositioningError'
  }
  
  var segments = {
    0xFFD8: 'SOI',
    0xFFE1: 'APP1',
    0xFFE2: 'APP2',
    0xFFDB: 'DQT',
    0xFFC4: 'DHT',
    0xFFDD: 'DRI',
    0xFFC0: 'SOF',
    0xFFDA: 'SOS',
    0xFFD9: 'EOI'
  }
  
  
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
  
  ImageTool.prototype.concatArrayBuffer = function () {
    var arrayBuffers = [].slice.call(arguments).filter(function (arg) {
      return is(arg, 'ArrayBuffer');
    })
    var size = arrayBuffers.reduce(function (acc, item) {
      return acc + item.byteLength;
    }, 0)
    var buffer = new ArrayBuffer(size)
    var typed = new Uint8Array(buffer)
    var offset = 0
    arrayBuffers.forEach(function (buffer) {
      typed.set(new Uint8Array(buffer), offset)
      offset += buffer.byteLength
    })
    return buffer
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
  
  ImageTool.prototype.getSegements = function (input, callback) {
    this.read(input, 'buffer', getSegements)
    
    function getSegements(buffer) {
      var
        view = new DataView(buffer),
        size = buffer.byteLength,
        offset = 2,
        current,
        next,
        end,
        dataSize,
        segements = [];
      
      function exec() {
        is(callback, 'function') && callback(segements);
      }
      
      // "image/jpge" Coding mode
      // ^0xFF-0xD8-[0xFF-XX-S1-S2-DATASIZE](repeat)-IMAGEDATA-0xFF-0xD9$
      if (view.getUint8(0) !== 0xFF && view.getUint8(1) !== 0xD8) {
        return exec();
      }
      
      while (offset < size) {
        current = view.getUint8(offset)
        next = view.getUint8(offset + 1)
        dataSize = 1
        if (current !== 0xFF) {
          return exec();
        }
        if (next === 0 || next === 0xFF) {
          offset++
        } else {
          dataSize = view.getUint16(offset + 2)
          end = offset + 2 + dataSize + 1
          end = end > size ? size : end
          segements.push(buffer.slice(offset, end))
          offset += (2 + dataSize)
        }
      }
      
    }
  }
  
  ImageTool.prototype.insertExif = function () {
  
  }
  
  
  function is(value, type) {
    var c = {}.toString.call(value).slice(8, -1);
    return typeof type === 'string' ? type.toLowerCase() === c.toLowerCase() : c;
  }
  
  
  window.ImageTool = ImageTool
  
})();
