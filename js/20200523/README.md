# 类
    以前JS没有类的概念，类型的定义是通过函数完成的。首先创建一个函数，然后通过原型（prototype）在函数对象上定义方法：
```js
    function Vacation(des,location){
        this.des = des;
        this.location = location;
    }
    Vacation.prototype.print = function(){
        console.log(`${this.des} +++ ${this.location}`);
    }
    const mani = new Vacation("weq","aaaa");
    mani.print();
```

    ES6引入神明类的语法，函数即是对象，继承是通过原型机制实现的：
```js
    class Vacation2 {
        constructor(des,location){
            this.des = des;
            this.location = location;
        }
        print(){
            console.log(`${this.des} +++ ${this.location}`);
        }
    }
```
    类的继承 extends
```js
    class EVacation2 extends Vacation2 {
        constructor(des,location,gear){
            super(des,location);
            this.gear = gear;
        }
        print(){
            super.print()
            console.log(`bring your ${this.gear}`);
        }
    }
    const emani = new EVacation2(111,222,333);
    emani.print();
```

# ES6 模块
    JS一个模块表示可以轻松地集成到其他JS文件中的一段可复用代码，使用JS模块的唯一方法是通过集成一个代码库来处理模块的导入与导出。

```js
    export const print = (message) => log(message,new Date());
    export const log = (message,timestamp) => console.log(`${timestamp.toString()}:${message}`);

    import { print } from './module';
    print(1111);

    /// ES5
    var print = (message) => log(message,new Date());
    var log = (message,timestamp) => console.log(`${timestamp.toString()}:${message}`);
    module.exports = print

    const print = require('./module')
    print(1111);
```

# 函数式编程

## 高阶函数
    一个以上的箭头函数 ====》 高阶函数
```js
const insideFn = logger => message => logger(message.toUpperCase() + "!!!");
const scream = insideFn(message => console.log(message));
scream("deqweqewq");
```

## 命令式与声明式
- 命令式：重点关注达成目标的具体过程，关注如何完成一个任务
- 声明式：易于解释具体用途，更易读，因为每个类函数的具体实现细节都被封装起来。

# 函数式编程核心概念
    不可变性，纯函数，数据转换，高阶函数和递归