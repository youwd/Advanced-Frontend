function ywdPromise(fn) {
    let self = this; // 缓存当前promise实例
    self.value = null; // 成功的值
    self.error = null; // 失败的原因
    self.onFullfilled = null; // 成功的回调函数
    self.onRejected = null; // 失败的回调

    function resolve(value) {
        self.value = value;
        self.onFullfilled(self.value);
    }

    function reject(error) {
        self.error = error;
        self.onRejected(self.error);
    }

    fn(resolve, reject);
}

ywdPromise.prototype.then = function (onFullfilled, onRejected) {
    // 给promise 实例注册成功和失败的回调
    this.onFullfilled = onFullfilled;
    this.onRejected = onRejected;
}

module.exports = ywdPromise;