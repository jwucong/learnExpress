// push(element):添加一个或是几个新元素到栈顶。

// pop():移除栈顶的元素，同时返回被移除元素。

// peek():返回栈顶的元素，但并不对栈顶的元素做出任何的修改。

// isEmpty():检查栈内是否有元素，如果有返回true，没有返回false。

// clear():清除栈里的元素。

// size():返回栈的元素个数。

// print():打印栈里的元素。

const Stack = function () {
  Object.defineProperty(this, 'data', {
    get() {
      return this._data
    },
    set(value) {
      this._data = value
    }
  })
  let items = []
  this.push = function(value) {
    items.push(value)
  }
  this.pop = function() {
    items.pop()
  }
  this.peek = function() {
    const size = items.length
    return size === 0 ? null : items[size - 1]
  }
  this.isEmpty = function() {
    return items.length === 0
  }
  this.size = function() {
    return items.length
  }
  this.clear = function() {
    items = []
  }
  this.print = function() {
    return items.join(',')
  }
}

const stack = new Stack()
console.log(stack)
console.log(stack.data = 123)
console.log(stack.data)
