var print = (message) => log(message,new Date());

var log = (message,timestamp) => console.log(`${timestamp.toString()}:${message}`);

module.exports = print