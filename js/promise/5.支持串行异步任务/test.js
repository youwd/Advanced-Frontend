let Promise = require("./05promise");
let fs = require("fs");

// 异步操作
let promise = new Promise((resolve, reject) => {
    fs.readFile("../file/1.text", "utf8", function (err, data) {
        err ? reject(err) : resolve(data);
    });
});

let f1 = function (data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        fs.readFile('../file/2.text', "utf8", function (err, data) {
            err ? reject(err) : resolve(data)
        });
    });
}
let f2 = function (data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        fs.readFile('../file/3.text', "utf8", function (err, data) {
            err ? reject(err) : resolve(data)
        });
    });
}
let f3 = function (data) {
    console.log("f3" + data)
}
let errorLog = function (error) {
    console.log(error)
}
promise.then(f1).then(f2).then(f3).catch(errorLog)