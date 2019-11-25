# 实现 node 中回调函数的机制
原文：https://juejin.im/post/5dd8b3a851882572f56b578f#heading-30

node 的事件 `event` 实现: https://github.com/Gozala/events/blob/master/events.js

`回调函数`的方式其实内部利用了`发布-订阅`模式，在这里我们以模拟实现 node 中的 Event 模块为例来写实现回调函数的机制。

```js
function EventEmitter() {
  this.events = new Map();
}
```
这个 `EventEmitter` 一共需要实现这些方法: `addListener`, `removeListener`, `once`, `removeAllListener`, `emit`。

首先是`addListener`：

```js
// once 参数表示是否只是触发一次
const wrapCallback = (fn, once = false) => ({ callback: fn, once });

EventEmitter.prototype.addListener = function (type, fn, once = false) {
  let handler = this.events.get(type);
  if (!handler) {
    // 为 type 事件绑定回调
    this.events.set(type, wrapCallback(fn, once));
  } else if (handler && typeof handler.callback === 'function') {
    // 目前 type 事件只有一个回调
    this.events.set(type, [handler, wrapCallback(fn, once)]);
  } else {
    // 目前 type 事件回调数 >= 2
    handler.push(wrapCallback(fn, once));
  }
}
```


`removeLisener` 的实现如下:

```js
EventEmitter.prototype.removeListener = function (type, listener) {
  let handler = this.events.get(type);
  if (!handler) return;
  if (!Array.isArray(handler)) {
    if (handler.callback === listener.callback) this.events.delete(type);
    else return;
  }
  for (let i = 0; i < handler.length; i++) {
    let item = handler[i];
    if (item.callback === listener.callback) {
      // 删除该回调，注意数组塌陷的问题，即后面的元素会往前挪一位。i 要 -- 
      handler.splice(i, 1);
      i--;
      if (handler.length === 1) {
        // 长度为 1 就不用数组存了
        this.events.set(type, handler[0]);
      }
    }
  }
}
```
`once` 实现思路很简单，先调用 `addListener` 添加上了`once`标记的回调对象, 然后在 `emit` 的时候遍历回调列表，将标记了`once: true`的项remove掉即可。

```js
EventEmitter.prototype.once = function (type, fn) {
  this.addListener(type, fn, true);
}

EventEmitter.prototype.emit = function (type, ...args) {
  let handler = this.events.get(type);
  if (!handler) return;
  if (Array.isArray(handler)) {
    // 遍历列表，执行回调
    handler.map(item => {
      item.callback.apply(this, args);
      // 标记的 once: true 的项直接移除
      if (item.once) this.removeListener(type, item);
    })
  } else {
    // 只有一个回调则直接执行
    handler.callback.apply(this, args);
    // 标记的 once: true 的项直接移除
    if (handler.once) this.removeListener(type, handler);
  }
  return true;
}
```

最后是 `removeAllListener`：
```js
EventEmitter.prototype.removeAllListener = function (type) {
  let handler = this.events.get(type);
  if (!handler) return;
  else this.events.delete(type);
}
```

现在我们测试一下:
```js
let e = new EventEmitter();
e.addListener('type', () => {
  console.log("type事件触发！");
})
e.addListener('type', () => {
  console.log("WOW!type事件又触发了！");
})

function f() { 
  console.log("type事件我只触发一次"); 
}
e.once('type', f)
e.emit('type');
e.emit('type');
e.removeAllListener('type');
e.emit('type');

// type事件触发！
// WOW!type事件又触发了！
// type事件我只触发一次
// type事件触发！
// WOW!type事件又触发了！
```
复制代码OK，一个简易的 `Event` 就这样实现完成了，为什么说它简易呢？因为还有很多细节的部分没有考虑:

- 在参数少的情况下，`call` 的性能优于 `apply`，反之 `apply` 的性能更好。因此在执行回调时候可以根据情况调用 `call` 或者 `apply`。
- 考虑到内存容量，应该设置回调列表的最大值，当超过最大值的时候，应该选择部分回调进行删除操作。
- 鲁棒性有待提高。对于参数的校验很多地方直接忽略掉了。
