从零开始写一个符合Promises/A+规范的promise
# 前言
Promise 是异步编程的一种解决方案，比传统的解决方案回调函数和事件更合理更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了Promise对象。本篇不注重讲解promise的用法，关于用法，可以看阮一峰老师的ECMAScript 6系列里面的Promise部分：<br/>

[ECMAScript 6 : Promise对象](http://es6.ruanyifeng.com/#docs/promise)<br/>

# 开始
本文promise里用到的异步操作的示例都是使用的node里面的fs.readFile方法，在浏览器端可以使用setTimeout方法进行模拟异步操作。<br/>
## 一. 基础版本
### 目标<br/>
1. 可以创建promise对象实例。<br/>
2. promise实例传入的异步方法执行成功就执行注册的成功回调函数，失败就执行注册的失败回调函数。<br/>
### 实现<br/>
```
function MyPromise(fn) {
    let self = this; // 缓存当前promise实例
    self.value = null; //成功时的值
    self.error = null; //失败时的原因
    self.onFulfilled = null; //成功的回调函数
    self.onRejected = null; //失败的回调函数

    function resolve(value) {
        self.value = value;
        self.onFulfilled(self.value);//resolve时执行成功回调
    }

    function reject(error) {
        self.error = error;
        self.onRejected(self.error)//reject时执行失败回调
    }
    fn(resolve, reject);
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    //在这里给promise实例注册成功和失败回调
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
}
module.exports = MyPromise
```
代码很短，逻辑也非常清晰，在then中注册了这个promise实例的成功回调和失败回调，当promise reslove时，就把异步执行结果赋值给promise实例的value，并把这个值传入成功回调中执行，失败就把异步执行失败原因赋值给promise实例的error，并把这个值传入失败回调并执行。<br/>

## 二. 支持同步任务

es6 promise是支持传入一个异步任务，也可以传入一个同步任务，但是我们的上面基础版代码并不支持同步任务，如果我们这样写就会报错：
```
let promise = new Promise((resolve, reject) => {
    resolve("同步任务执行")
});
```
为什么呢？因为是同步任务，所以当我们的promise实例reslove时，它的then方法还没执行到，所以回调函数还没注册上，这时reslove中调用成功回调肯定会报错的。<br/>
### 目标<br/>
使promise支持同步方法<br/>
### 实现
```
function resolve(value) {
    //利用setTimeout特性将具体执行放到then之后
    setTimeout(() => {
        self.value = value;
        self.onFulfilled(self.value)
    })
}

function reject(error) {
    setTimeout(() => {
        self.error = error;
        self.onRejected(self.error)
    })
}
```
实现很简单，就是在reslove和reject里面用setTimeout进行包裹，使其到then方法执行之后再去执行，这样我们就让promise支持传入同步方法，另外，关于这一点，Promise/A+规范里也明确要求了这一点。<br>
`2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code.`<br>

## 三. 支持三种状态
es6 promise有三种状态：pending(进行中)、fulfilled(已成功)和rejected(已失败)。只有异步操作的结果可以决定当前是哪一种状态，任何操作都无法改变这个状态。promise一旦状态改变，就不会再变。任何时候都可以得到这个结果promise对象的状态改变，只有两种可能：从pending变为fulfilled和从pending变为rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，如果改变已经发生了，你再对promise对象添加回调函数，也会立即得到这个结果。<br/>
### 目标
1. 实现promise的三种状态。<br/>
2. 实现promise对象的状态改变，改变只有两种可能：从pending变为fulfilled和从pending变为rejected。<br/>
3. 实现一旦promise状态改变，再对promise对象添加回调函数，也会立即得到这个结果。<br/>
### 实现<br/>
```
//定义三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(fn) {
    let self = this;
    self.value = null;
    self.error = null;
    self.status = PENDING;
    self.onFulfilled = null;
    self.onRejected = null;

    function resolve(value) {
        //如果状态是pending才去修改状态为fulfilled并执行成功逻辑
        if (self.status === PENDING) {
            setTimeout(function() {
                self.status = FULFILLED;
                self.value = value;
                self.onFulfilled(self.value);
            })
        }
    }

    function reject(error) {
        //如果状态是pending才去修改状态为rejected并执行失败逻辑
        if (self.status === PENDING) {
            setTimeout(function() {
                self.status = REJECTED;
                self.error = error;
                self.onRejected(self.error);
            })
        }
    }
    fn(resolve, reject);
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    if (this.status === PENDING) {
        this.onFulfilled = onFulfilled;
        this.onRejected = onRejected;
    } else if (this.status === FULFILLED) {
        //如果状态是fulfilled，直接执行成功回调，并将成功值传入
        onFulfilled(this.value)
    } else {
        //如果状态是rejected，直接执行失败回调，并将失败原因传入
        onRejected(this.error)
    }
    return this;
}
module.exports = MyPromise
```
首先，我们建立了三种状态"pending","fulfilled","rejected",然后我们在reslove和reject中做判断，只有状态是pending时，才去改变promise的状态，并执行相应操作，另外，我们在then中判断，如果这个promise已经变为"fulfilled"或"rejected"就立刻执行它的回调，并把结果传入。 <br/>

我们平时写promise一般都是对应的一组流程化的操作，如这样：<br/>
`promise.then(f1).then(f2).then(f3)`<br/>
但是我们之前的版本最多只能注册一个回调，这一节我们就来实现链式操作。
### 目标<br/>
使promise支持链式操作
### 实现<br/>
想支持链式操作，其实很简单，首先存储回调时要改为使用数组
```
self.onFulfilledCallbacks = [];
self.onRejectedCallbacks = [];
```
当然执行回调时，也要改成遍历回调数组执行回调函数
```
self.onFulfilledCallbacks.forEach((callback) => callback(self.value));
```
最后，then方法也要改一下,只需要在最后一行加一个return this即可，这其实和jQuery链式操作的原理一致，每次调用完方法都返回自身实例，后面的方法也是实例的方法，所以可以继续执行。
```
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(onFulfilled);
        this.onRejectedCallbacks.push(onRejected);
    } else if (this.status === FULFILLED) {
        onFulfilled(this.value)
    } else {
        onRejected(this.error)
    }
    return this;
}
```
