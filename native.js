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

console.log(formatBytes(Math.pow(2, 16)))

var a = [1, 2, 3, 4, 5, 6]
console.log(a.slice(1, 3))
