
function correct(image, callback) {
  console.group('autoOrientation')
  console.log('image: ', image)
  // console.log('callback: ', callback)
  console.groupEnd()
  var reader = new FileReader()
  var img = new Image()
  var mimeType = 'image/png';
  img.onload = function() {
    console.group('img.onload')
    var w0 = this.naturalWidth
    var h0 = this.naturalHeight
    var r = h0 / w0
    var width = 300
    var height = 300 * r
    console.log('w0: ', w0)
    console.log('h0: ', h0)
    console.log('r: ', r)
    console.log('width: ', width)
    console.log('height: ', height)
    console.groupEnd()
    EXIF.getData(this, function() {
      console.group('EXIF.getData')
      var canvas = doc.createElement('canvas')
      var ctx = canvas.getContext('2d')
      var allTags = EXIF.getAllTags(this);
      var orientation = EXIF.getTag(this, 'Orientation');
      var flag = orientation > 4;
      console.log('orientation: ', orientation)
      console.log('allTags: ', allTags)

      canvas.width = flag ? height : width;
      canvas.height = flag ? width : height;
      switch (orientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, width, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, width, height);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, height);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, height, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, height, width);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, width);
          break;
        default:
          ctx.transform(1, 0, 0, 1, 0, 0);
      }
      ctx.drawImage(this, 0, 0, width, height);
      console.groupEnd()
      typeof callback === 'function' && callback(canvas.toDataURL(mimeType))
    })
  }
  reader.onload = function() {
    var base64 = this.result
    var p = /^data:([^;]+);/.exec(base64)
    img.src = base64
    if(p) {
      mimeType = p[1]
      console.log('mimeType: ', mimeType)
    }
  }
  reader.readAsDataURL(image)
}
