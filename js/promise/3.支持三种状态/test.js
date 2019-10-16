let Promise = require("./03promise");
let fs = require("fs");

// 异步操作
let promise = new Promise((resolve, reject) => {
    fs.readFile("../file/1.text", "utf8", function (error, data) {
        error ? reject(error) : resolve(data);
    });
});

function f1(data) {
    console.log("f1:" + data)
}

function f2(data) {
    console.log("f2:" + data)
}

function errorLog(error) {
    console.log(error)
}

promise.then(f1, errorLog)
setTimeout(() => {
    promise.then(f2, errorLog)
}, 2000)