const PENDING = "pending"; // 进行中
const FULFILLED = "fulfilled"; // 已完成
const REJECTED = "rejected"; // 已失败

function ywdPromise(fn) {
    let self = this; // 缓存当前promise实例
    self.value = null; // 成功的值
    self.error = null; // 失败的原因
    self.onFullfilled = null; // 成功的回调函数
    self.onRejected = null; // 失败的回调

    self.status = PENDING;

    function resolve(value) {
        if (self.status === PENDING) {
            //利用setTimeout特性将具体执行放到then之后,使之支持同步任务
            setTimeout(() => {
                self.status = FULFILLED; // 让状态改变为已完成
                self.value = value;
                self.onFullfilled(self.value);
            });
        }
    }

    function reject(error) {
        if (self.status = PENDING) {
            setTimeout(() => {
                self.status = REJECTED;
                self.error = error;
                self.onRejected(self.error);
            });
        }
    }
    fn(resolve, reject);
}

ywdPromise.prototype.then = function (onFullfilled, onRejected) {
    switch (this.status) {
        case PENDING:
            // 给promise 实例注册成功和失败的回调
            this.onFullfilled = onFullfilled;
            this.onRejected = onRejected;
            break;
        case FULFILLED:
            onFullfilled(this.value);
            break;
        case REJECTED:
            onRejected(this.error)
            break;
        default:
            break;
    }

}

module.exports = ywdPromise;