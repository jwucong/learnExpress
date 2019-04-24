function is(value, type) {
  const c = Object.prototype.toString.call(value).slice(8, -1)
  return typeof type === 'string' ? c.toLowerCase() === type.toLowerCase() : c
}

// 并集
function union() {

}

// 并集
function intersect() {

}

// 并集
function except() {

}

function extend(deep) {
  let args = [].slice.call(arguments, 1).filter(arg => is(arg, 'object'))
  let target = is(deep, 'object') ? deep : args.shift()
  args.forEach(arg => {
    for (let key in arg) {
      if (arg.hasOwnProperty(key)) {
        const val = arg[key]
        target[key] = deep === true && is(val, 'object') ? extend(deep, target[key], val) : val
      }
    }
  })
  return target
}

export {
  is,
  extend
}
