function EventEmitter() {
    this.events = new Map();
}

function wrapCallback(fn, once = false) {
    return {
        callback: fn,
        once
    }
}


EventEmitter.prototype.addListener = function (type, fn, once = false) {
    let handler = this.events.get(type);
    if (!handler) {
        // 如果该事件不存在，则为type事件绑定回调
        this.events.set(type, wrapCallback(fn, once));
    } else if (handler && typeof handler.callback === 'function') {
        // 目前type事件只有一个回调
        this.events.set(type, [handler, wrapCallback(fn, once)]);
    } else {
        // 目前回调>2
        handler.push(wrapCallback(fn, once));
    }
}

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
            handler.splice(i, 1);
            // 由于删除了该回调，注意数组塌陷问题，即后面的元素会往前挪一位，所以要减 1
            i--;
            if (handler.length === 1) {
                // 长度为1 就不用数组存了
                this.events.set(type, handler[0]);
            }
        }
    }
}

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
        });
    } else {
        // 只有一个回调则直接执行
        handler.callback.apply(this, args);
        // 标记的 once: true 的项直接移除
        if (handler.once) this.removeListener(type, handler);
    }
    return true;
}

EventEmitter.prototype.removeAllListener = function (type) {
    let handler = this.events.get(type);
    if (!handler) return;
    else this.events.delete(type);
}



// 测试代码
let e = new EventEmitter();
e.addListener("type", () => {
    console.log("type事件触发了！");
});

e.addListener('type', () => {
    console.log("WOW!type事件又触发了！");
})

e.once('type', (item) => {
    console.log("once!!!",item);
})

e.emit('type',11111);
e.emit('type');
e.emit('type');
e.removeAllListener('type');
e.emit('type');