let Promise = require("./04promise");
let fs = require("fs");

// 异步操作
let promise = new Promise((resolve, reject) => {
    fs.readFile("../file/1.text", "utf8", function (error, data) {
        error ? reject(error) : resolve(data);
    });
});

let f1 = function(data) {
    console.log("f1" + data)
}
let f2 = function(data) {
    console.log("f2" + data)
}
let f3 = function(data) {
    console.log("f3" + data)
}
promise.then(f1).then(f2).then(f3)