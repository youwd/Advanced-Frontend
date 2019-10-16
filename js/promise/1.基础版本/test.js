let Promise = require("./01promise");
let fs = require("fs");

let promise = new Promise((resolve, reject) => {
    fs.readFile("../file/1.text", "utf8", function (error, data) {
        error ? reject(error) : resolve(data);
    });
});

function successLog(data) {
    console.log(data);
}

function errorLog(error) {
    console.log(error);
}

promise.then(successLog, errorLog);