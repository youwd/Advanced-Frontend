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
## 四. 支持链式操作
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
## 五. 支持串行异步任务
我们上一节实现了链式调用，但是目前then方法里只能传入同步任务，但是我们平常用promise，then方法里一般是异步任务，因为我们用promise主要用来解决一组流程化的异步操作，如下面这样的调取接口获取用户id后，再根据用户id调取接口获取用户余额，获取用户id和获取用户余额都需要调用接口，所以都是异步任务，如何使promise支持串行异步操作呢?<br/>
```
getUserId()
    .then(getUserBalanceById)
    .then(function (balance) {
        // do sth 
    }, function (error) {
        console.log(error);
    });
```
### 目标<br/>
使promise支持串行异步操作

### 实现<br/>
这里为方便讲解我们引入一个常见场景：用promise顺序读取文件内容，场景代码如下：<br>
```
let p = new Promise((resolve, reject) => {
    fs.readFile('../file/1.txt', "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
});
let f1 = function(data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        fs.readFile('../file/2.txt', "utf8", function(err, data) {
            err ? reject(err) : resolve(data)
        });
    });
}
let f2 = function(data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        fs.readFile('../file/3.txt', "utf8", function(err, data) {
            err ? reject(err) : resolve(data)
        });
    });
}
let f3 = function(data) {
    console.log(data);
}
let errorLog = function(error) {
    console.log(error)
}
p.then(f1).then(f2).then(f3).catch(errorLog)

//会依次输出
//this is 1.txt
//this is 2.txt
//this is 3.txt
```
上面场景，我们读取完1.txt后并打印1.txt内容，再去读取2.txt并打印2.txt内容，再去读取3.txt并打印3.txt内容，而读取文件都是异步操作，所以都是返回一个promise，我们上一节实现的promise可以实现执行完异步操作后执行后续回调，但是本节的回调读取文件内容操作并不是同步的，而是异步的，所以当读取完1.txt后，执行它回调onFulfilledCallbacks里面的f1，f2，f3时，异步操作还没有完成，所以我们本想得到这样的输出：
```
this is 1.txt
this is 2.txt
this is 3.txt
```
但是实际上却会输出
```
this is 1.txt
this is 1.txt
this is 1.txt
```
所以要想实现异步操作串行，我们不能将回调函数都注册在初始promise的onFulfilledCallbacks里面，而要将每个回调函数注册在对应的异步操作promise的onFulfilledCallbacks里面，用读取文件的场景来举例，f1要在p的onFulfilledCallbacks里面，而f2应该在f1里面return的那个Promise的onFulfilledCallbacks里面，因为只有这样才能实现读取完2.txt后才去打印2.txt的结果。<br/>

但是，我们平常写promise一般都是这样写的: `promise.then(f1).then(f2).then(f3)`，一开始所有流程我们就指定好了，而不是在f1里面才去注册f1的回调，f2里面才去注册f2的回调。<br/>

如何既能保持这种链式写法的同时又能使异步操作衔接执行呢？我们其实让then方法最后不再返回自身实例，而是返回一个新的promise即可，我们可以叫它bridgePromise，它最大的作用就是衔接后续操作，我们看下具体实现代码：
```
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this;
    let bridgePromise;
    //防止使用者不传成功或失败回调函数，所以成功失败回调都给了默认回调函数
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : error => { throw error };
    if (self.status === FULFILLED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onFulfilled(self.value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        })
    }
    if (self.status === REJECTED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onRejected(self.error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
    if (self.status === PENDING) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            self.onFulfilledCallbacks.push((value) => {
                try {
                    let x = onFulfilled(value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
            self.onRejectedCallbacks.push((error) => {
                try {
                    let x = onRejected(error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
}
//catch方法其实是个语法糖，就是只传onRejected不传onFulfilled的then方法
MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}
//用来解析回调函数的返回值x，x可能是普通值也可能是个promise对象
function resolvePromise(bridgePromise, x, resolve, reject) {
   //如果x是一个promise
    if (x instanceof MyPromise) {
        //如果这个promise是pending状态，就在它的then方法里继续执行resolvePromise解析它的结果，直到返回值不是一个pending状态的promise为止
        if (x.status === PENDING) {
            x.then(y => {
                resolvePromise(bridgePromise, y, resolve, reject);
            }, error => {
                reject(error);
            });
        } else {
            x.then(resolve, reject);
        }
        //如果x是一个普通值，就让bridgePromise的状态fulfilled，并把这个值传递下去
    } else {
        resolve(x);
    }
}
```
首先，为防止使用者不传成功回调函数或不失败回调函数，我们给了默认回调函数，然后无论当前promise是什么状态，我们都返回一个bridgePromise用来衔接后续操作。<br/>

另外执行回调函数时,因为回调函数既可能会返回一个异步的promise也可能会返回一个同步结果，所以我们把直接把回调函数的结果托管给bridgePromise，使用resolvePromise方法来解析回调函数的结果，如果回调函数返回一个promise并且状态还是pending，就在这个promise的then方法中继续解析这个promise reslove传过来的值，如果值还是pending状态的promise就继续解析，直到不是一个异步promise，而是一个正常值就使用bridgePromise的reslove方法将bridgePromise的状态改为fulfilled，并调用onFulfilledCallbacks回调数组中的方法，将该值传入，到此异步操作就衔接上了。<br/>

这里很抽象，我们还是以文件顺序读取的场景画一张图解释一下流程：<br/>

当执行`p.then(f1).then(f2).then(f3)`时:<br/>
1. 先执行p.then(f1)返回了一个bridgePromise（p2），并在p的onFulfilledCallbacks回调列表中放入一个回调函数，回调函数负责执行f1并且更新p2的状态.
2. 然后.then(f2)时返回了一个bridgePromise（p3），这里注意其实是p2.then(f2)，因为p.then(f1)时返回了p2。此时在p2的onFulfilledCallbacks回调列表中放入一个回调函数，回调函数负责执行f2并且更新p3的状态.
3. 然后.then(f3)时返回了一个bridgePromise（p4），并在p3的onFulfilledCallbacks回调列表中放入一个回调函数，回调函数负责执行f3并且更新p4的状态.
到此，回调关系注册完了，如图所示：
![演示](https://user-gold-cdn.xitu.io/2018/6/6/163d462a70a813f6?w=1111&h=594&f=png&s=9331)
4. 然后过了一段时间，p里面的异步操作执行完了，读取到了1.txt的内容，开始执行p的回调函数，回调函数执行f1，打印出1.txt的内容“this is 1.txt”，并将f1的返回值放到resolvePromise中开始解析。resolvePromise一看传入了一个promise对象，promise是异步的啊，得等着呢，于是就在这个promise对象的then方法中继续resolvePromise这个promise对象resolve的结果，一看不是promise对象了，而是一个具体值“this is 2.txt”，于是调用bridgePromise(p2)的reslove方法将bridgePromise(p2)的状态更新为fulfilled，并将“this is 2.txt”传入p2的回调函数中去执行。
5. p2的回调开始执行，f2拿到传过来的“this is 2.txt”参数开始执行，打印出2.txt的内容，并将f2的返回值放到resolvePromise中开始解析，resolvePromise一看传入了一个promise对象，promise是异步的啊，又得等着呢........后续操作就是不断的重复4,5步直到结束。

到此，reslove这一条线已经我们已经走通，让我们看看reject这一条线，reject其实处理起来很简单:
1. 首先执行fn及执行注册的回调时都用try-catch包裹，无论哪里有异常都会进入reject分支。
2. 一旦代码进入reject分支直接将bridge promise设为rejected状态，于是后续都会走reject这个分支，另外如果不传异常处理的onRejected函数，默认就是使用throw error将错误一直往后抛，达到了错误冒泡的目的。
3. 最后可以实现一个catch函数用来接收错误。
```
MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}
```
到此，我们已经可以愉快的使用`promise.then(f1).then(f2).then(f3).catch(errorLog)`来顺序读取文件内容了。