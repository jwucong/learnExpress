function fileToBase64(file, callback) {
  var reader = new FileReader()
  reader.onload = function () {
    typeof callback === 'function' && callback(this.result)
  }
  reader.readAsDataURL(file)
}

function fileToArrayBuffer(file, callback) {
  fileToBase64(file, function (base64) {
    var buffer = base64ToArrayBuffer(base64)
    typeof callback === 'function' && callback(buffer)
  })
}

function base64ToArrayBuffer(base64) {
  base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
  var binary = atob(base64);
  var size = binary.length;
  var buffer = new ArrayBuffer(size);
  var view = new Uint8Array(buffer);
  for (var i = 0; i < size; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function getExif(file) {
  var dataView = new DataView(file);

  if (debug) console.log("Got file of length " + file.byteLength);
  if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
    if (debug) console.log("Not a valid JPEG");
    return false; // not a valid jpeg
  }

  var offset = 2,
    length = file.byteLength,
    marker;

  while (offset < length) {
    if (dataView.getUint8(offset) != 0xFF) {
      if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
      return false; // not a valid marker, something is wrong
    }

    marker = dataView.getUint8(offset + 1);
    if (debug) console.log(marker);

    // we could implement handling for other markers here,
    // but we're only looking for 0xFFE1 for EXIF data

    if (marker == 225) {
      if (debug) console.log("Found 0xFFE1 marker");

      return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

      // offset += 2 + file.getShortAt(offset+2, true);

    } else {
      offset += 2 + dataView.getUint16(offset + 2);
    }

  }

}

function getStringFromDB(buffer, start, length) {
  var outstr = "";
  for (var n = start; n < start + length; n++) {
    outstr += String.fromCharCode(buffer.getUint8(n));
  }
  return outstr;
}

function readTags(file, tiffStart, dirStart, strings, bigEnd) {
  var entries = file.getUint16(dirStart, !bigEnd),
    tags = {},
    entryOffset, tag,
    i;

  for (i = 0; i < entries; i++) {
    entryOffset = dirStart + i * 12 + 2;
    tag = strings[file.getUint16(entryOffset, !bigEnd)];
    if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
    tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
  }
  return tags;
}

function readEXIFData(file, start) {
  if (getStringFromDB(file, start, 4) != "Exif") {
    if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
    return false;
  }

  var bigEnd,
    tags, tag,
    exifData, gpsData,
    tiffOffset = start + 6;

  // test for TIFF validity and endianness
  if (file.getUint16(tiffOffset) == 0x4949) {
    bigEnd = false;
  } else if (file.getUint16(tiffOffset) == 0x4D4D) {
    bigEnd = true;
  } else {
    if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
    return false;
  }

  if (file.getUint16(tiffOffset + 2, !bigEnd) != 0x002A) {
    if (debug) console.log("Not valid TIFF data! (no 0x002A)");
    return false;
  }

  var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);

  if (firstIFDOffset < 0x00000008) {
    if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset + 4, !bigEnd));
    return false;
  }

  tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

  if (tags.ExifIFDPointer) {
    exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
    for (tag in exifData) {
      switch (tag) {
        case "LightSource" :
        case "Flash" :
        case "MeteringMode" :
        case "ExposureProgram" :
        case "SensingMethod" :
        case "SceneCaptureType" :
        case "SceneType" :
        case "CustomRendered" :
        case "WhiteBalance" :
        case "GainControl" :
        case "Contrast" :
        case "Saturation" :
        case "Sharpness" :
        case "SubjectDistanceRange" :
        case "FileSource" :
          exifData[tag] = StringValues[tag][exifData[tag]];
          break;

        case "ExifVersion" :
        case "FlashpixVersion" :
          exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
          break;

        case "ComponentsConfiguration" :
          exifData[tag] =
            StringValues.Components[exifData[tag][0]] +
            StringValues.Components[exifData[tag][1]] +
            StringValues.Components[exifData[tag][2]] +
            StringValues.Components[exifData[tag][3]];
          break;
      }
      tags[tag] = exifData[tag];
    }
  }

  if (tags.GPSInfoIFDPointer) {
    gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
    for (tag in gpsData) {
      switch (tag) {
        case "GPSVersionID" :
          gpsData[tag] = gpsData[tag][0] +
            "." + gpsData[tag][1] +
            "." + gpsData[tag][2] +
            "." + gpsData[tag][3];
          break;
      }
      tags[tag] = gpsData[tag];
    }
  }

  // extract thumbnail
  tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd);

  return tags;
}
