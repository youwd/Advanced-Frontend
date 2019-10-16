const PENDING = "pending"; // 进行中
const FULFILLED = "fulfilled"; // 已完成
const REJECTED = "rejected"; // 已失败

function ywdPromise(fn) {
    let self = this; // 缓存当前promise实例
    self.value = null; // 成功的值
    self.error = null; // 失败的原因

    self.onFulfilledCallbacks = []; // 支持链式操作
    self.onRejectedCallbacks = [];

    self.status = PENDING;

    function resolve(value) {
        if (self.status === PENDING) {
            //利用setTimeout特性将具体执行放到then之后,使之支持同步任务
            setTimeout(() => {
                self.status = FULFILLED; // 让状态改变为已完成
                self.value = value;
                // 支持链式操作
                self.onFulfilledCallbacks.forEach((callback) => callback(self.value));
            });
        }
    }

    function reject(error) {
        if (self.status = PENDING) {
            setTimeout(() => {
                self.status = REJECTED;
                self.error = error;

                self.onRejectedCallbacks.forEach((callback) => callback(self.error));
            });
        }
    }
    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}


function resolvePromise(bridgepromise, x, resolve, reject) {
    if (bridgepromise === x) {
        return reject(new TypeError('Circular reference'));
    }

    let called = false;
    if (x instanceof ywdPromise) {
        if (x.status === PENDING) {
            x.then(y => {
                resolvePromise(bridgepromise, y, resolve, reject);
            }, error => {
                reject(error);
            });
        } else {
            x.then(resolve, reject);
        }
    } else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise(bridgepromise, y, resolve, reject);
                }, error => {
                    if (called) return;
                    called = true;
                    reject(error);
                })
            } else {
                resolve(x);
            }
        } catch (e) {
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}


ywdPromise.prototype.then = function (onFulfilled, onRejected) {
    const self = this;
    let bridgePromise;
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : error => {
        throw error
    };

    switch (this.status) {
        case PENDING:
            return bridgePromise = new ywdPromise((resolve, reject) => {
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
        case FULFILLED:
            return bridgePromise = new ywdPromise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(self.value);
                        resolvePromise(bridgePromise, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            })
        case REJECTED:
            return bridgePromise = new ywdPromise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let x = onRejected(self.error);
                        resolvePromise(bridgePromise, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            });
    }

}
ywdPromise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
}
ywdPromise.deferred = function() {
    let defer = {};
    defer.promise = new ywdPromise((resolve, reject) => {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    return defer;
}
try {
    module.exports = ywdPromise
} catch (e) {}