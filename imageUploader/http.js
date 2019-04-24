
import {is, extend} from "./util";

function allIs(list, type) {
    return list.every(item => is(item, type))
}

function http(url, options, callback) {
  const defaults = {
    url: '',
    method: 'get',
    async: true,
    data: {},
    headers: {},
    timeout: 0,
    success: null,
    error: null,
    complete: null
  }
  const conf = extend(true, {}, defaults, options)
  const headers = conf.headers
  const cbs = [conf.success, conf.error, conf.complete]
  const xhr = new XMLHttpRequest()
  let p
  xhr.onload = function() {
    const status = this.status
    const success = status >= 200 && status < 300 || status === 304
    if(success) {
      is(conf.success, 'function') && conf.success()
    } else {
      is(conf.error, 'function') && conf.error()
    }
    is(conf.complete, 'function') && conf.complete()
  }

  xhr.open(conf.method.toUpperCase(), url, conf.async)
  for (let key in headers) {
    if (headers.hasOwnProperty(key)) {
      xhr.setRequestHeader(key, headers[key])
    }
  }
  xhr.send(data)
  return p
}


