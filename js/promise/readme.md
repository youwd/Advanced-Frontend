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

