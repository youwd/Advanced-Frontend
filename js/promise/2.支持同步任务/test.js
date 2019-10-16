let Promise = require("./02promise");
let fs = require("fs");

// 异步操作
// let promise = new Promise((resolve, reject) => {
//     fs.readFile("../file/1.text", "utf8", function (error, data) {
//         error ? reject(error) : resolve(data);
//     });
// });

// 同步操作
let promise = new Promise((resolve, reject) => {
    resolve("同步任务执行")
});

function successLog(data) {
    console.log(data);
}

function errorLog(error) {
    console.log(error);
}

promise.then(successLog, errorLog);