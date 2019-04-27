var field = `ExposureTime FNumber ExposureProgram SpectralSensitivity PhotographicSensitivity OECF
SensitivityType StandardOutputSensitivity RecommendedExposureIndex ISOSpeed ISOSpeedLatitudeyyy ISOSpeedLatitudezzz ShutterSpeedValue ApertureValue BrightnessValue ExposureBiasValue MaxApertureValue SubjectDistance MeteringMode
LightSource
Flash
FocalLength
SubjectArea
FlashEnergy SpatialFrequencyResponse FocalPlaneXResolution FocalPlaneYResolution FocalPlaneResolutionUnit SubjectLocation ExposureIndex SensingMethod
FileSource
SceneType
CFAPattern CustomRendered ExposureMode WhiteBalance DigitalZoomRatio FocalLengthIn35mmFilm SceneCaptureType GainControl
Contrast
Saturation
Sharpness DeviceSettingDescription SubjectDistanceRange`


var key = `829A 829D 8822 8824 8827 8828 8830 8831 8832 8833 8834 8835 9201 9202 9203 9204 9205 9206 9207 9208 9209 920A 9214 A20B A20C A20E A20F A210 A214 A215 A217 A300 A301 A302 A401 A402 A403 A404 A405 A406 A407 A408 A409 A40A A40B A40C`


var s1 = `RED
00.H
GREEN
01.H
BLUE
02.H
CYAN
03.H
MAGENTA
04.H
YELLOW
05.H
WHITE
06.H`
var s2 = `GPSVersionID GPSLatitudeRef
GPSLatitude GPSLongitudeRef GPSLongitude GPSAltitudeRef GPSAltitude GPSTimeStamp GPSSatellites GPSStatus GPSMeasureMode GPSDOP GPSSpeedRef GPSSpeed GPSTrackRef GPSTrack GPSImgDirectionRef GPSImgDirection GPSMapDatum GPSDestLatitudeRef GPSDestLatitude GPSDestLongitudeRef GPSDestLongitude GPSDestBearingRef GPSDestBearing GPSDestDistanceRef GPSDestDistance GPSProcessingMethod GPSAreaInformation GPSDateStamp GPSDifferential GPSHPositioningError`

var k2 = `0 1 2 3 4 5 6 7 8 9 A B C D E F 10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F`

var s3 = `SOI
FFD8.H
APP1
FFE1.H
APP2
FFE2.H
DQT
FFDB.H
DHT
FFC4.H
DRI
FFDD.H
SOF
FFC0.H
SOS
FFDA.H
EOI
FFD9.H`


var a = s3.split(/\s+/)
// var vals = s2.split(/\s+/)
// var keys = k2.split(/\s+/).map(k => (k.length === 1 ? '0x0' : '0x') + k)
var vals = a.filter((item, i) => i % 2 === 0)
var keys = a.filter((item, i) => i % 2 === 1).map(item => item.replace(/(\w+)\.H/i, '0x$1'))
// console.log(parseInt('0x0001', 16))
console.log(vals)
console.log(keys)
var obj = {}

keys.forEach((item, i) => {
  // var k = '0x' + (item.length % 2 === 0 ? '' : '0') + item
  obj[item] = vals[i]
})

console.log(obj)
