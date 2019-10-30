# JavaScript 中的继承：ES3、ES5 和 ES6
[原文链接](https://juejin.im/post/5a4852886fb9a04503106e46)

JavaScript 是一门动态语言，动态意味着高灵活性，而这尤其可以体现在继承上面。JavaScript 中的继承有很多种实现方式，可以分成下面四类：

Mixin 模式，即属性混入，从一个或多个对象中复制属性到新的对象中
方法借用模式，即通过 call 或 apply 实现方法的重用
原型模式，使用 Object.create 方法直接以一个对象为原型创造新的对象
类模式，实际上是使用构造函数或 ES6 class

前三种有一个共同点，就是没有“类”的概念，它们在适当的场景下非常有用，不过也因为没有类，缺失了很多经典面向对象继承的要素。例如父子对象之间没有严格的传承关系，即不一定是 is-a 的关系，这决定了无法将它们直接应用在面向对象分析与设计方面，可以说它们并不是真正的继承，而是介于继承和组合之间的代码复用方案。

而第四种，类式继承，无论是使用构造函数还是 ES6 加入的 class，都能表达明确的继承关系，在需要对继承重度使用的场景下，应该使用类式继承。接下来，本文讨论的都是类式继承。
有一点需要牢记：继承是一种强耦合，应该谨慎使用。

## 用 ES3 实现继承

实现要点：
1. 利用 Person.call(this) 执行“方法借用”，获取 Person 的属性
2. 利用一个空函数将 Person.prototype 加入原型链

```
function Person(name) {
  this.name = name;
}

Person.prototype.printName = function() {
  console.log(this.name);
};

function Bob() {
  Person.call(this, "Bob");
  this.hobby = "Histroy";
}

function inheritProto(Parent, Child) {
  var Fn = function() {};
  Fn.prototype = Parent.prototype;
  Child.prototype = new Fn();
  Child.prototype.constructor = Child;
}

inheritProto(Person, Bob);

Bob.prototype.printHobby = function() {
  console.log(this.hobby);
};

console.dir(new Bob());

```
dir 输出：
```
Bob
  |-- hobby:"Histroy"
  |-- name:"Bob"
  |-- __proto__:Person
      |-- printHobby:ƒ ()
      |-- constructor:ƒ Bob()
      |-- __proto__:
          |-- printName:ƒ ()
          |-- constructor:ƒ Person(name)
          |-- __proto__:Object
```
## 用 ES5 实现继承
实现要点：

1. 利用 Person.call(this) 执行“方法借用”，获取 Person 的属性
2. 利用 ES5 增加的 Object.create 方法将 Person.prototype 加入原型链

```
function Person(name) {
  this.name = name;
}

Person.prototype.printName = function() {
  console.log(this.name);
};

function Bob() {
  Person.call(this, "Bob");
  this.hobby = "Histroy";
}

Bob.prototype  = Object.create(Person.prototype, {
  constructor: {
    value: Bob,
    enumerable: false,
    configurable: true,
    writable: true
  }
});

Bob.prototype.printHobby = function() {
  console.log(this.hobby);
};

console.dir(new Bob());

```
dir 输出：
```
Bob
  |-- hobby:"Histroy"
  |-- name:"Bob"
  |-- __proto__:Person
      |-- printHobby:ƒ ()
      |-- constructor:ƒ Bob()
      |-- __proto__:
          |-- printName:ƒ ()
          |-- constructor:ƒ Person(name)
          |-- __proto__:Object
```
## 用 ES6 实现继承
实现要点：

1. 利用 ES6 增加的 class 和 extends 实现比以前更完善的继承

```
class Person {
  constructor(name) {
    this.name = name;
  }

  printName() {
    console.log(this.name);
  }
}

class Bob extends Person {
  constructor() {
    super("Bob");
    this.hobby = "Histroy";
  }

  printHobby() {
    console.log(this.hobby);
  }
}

console.dir(new Bob());

```
dir 输出：
```
Bob
  |-- hobby:"Histroy"
  |-- name:"Bob"
  |-- __proto__:Person
      |-- constructor:class Bob
      |-- printHobby:ƒ printHobby()
      |-- __proto__:
          |-- constructor:class Person
          |-- printName:ƒ printName()
          |-- __proto__:Object
```

## 从 class 和 super 看 JavaScript 与 Java 的继承
编写代码时，ES6 class 带来的最明显的两个便利是：

1. 隐藏原型链的拼接过程，将代码的重点放在类型之间的传承
2. 使用 super 来实现更简化、更灵活的多态方法

实际上，ES6 围绕 class 增加了很多新功能，比如继承这件事情上，与之前不同的是：用 class 实现的继承，既包括类实例的继承关系，也包括类本身的继承关系。这里的类其实是特殊的 JavaScript 函数，而在 JavaScript 中，函数是对象的子类型，即函数对象，所以也能够体现出原型继承。

例如，用前面的代码来说明就是：
```
// 类实例的继承关系
Bob.prototype.__proto__ === Person.prototype // true

// 类本身的继承关系
Bob.__proto__ === Person // true

```
再来看 ES6 中的 super，子类的方法想借助父类的方法完成一部分工作时，super 就可以派上用场了，这是比继承更为细粒度的代码复用，不过耦合性也也变得更强了。实际上 super 也有很多功能，既可以当作函数使用，也可以当作对象使用。将 class 和 super 结合起来看，就可以领会一下 JavaScript 与 Java 在继承上的异同了。
与 Java 相同或非常类似的是：

- 在子类构造方法中调用父类的构造方法。ES6 中，子类的构造器中必须调用父类的构造器来完成初始化，子类的实例是基于父类实例的加工。正是因此，父类的所有行为都可以继承。所以，ES6 中可以继承原生数据结构的完整功能，在此基础上定义自己的数据结构。就像 Java 中继承 HashMap 类，JavaScript 可以继承 Number、Array 等构造函数。

与 Java 不同的是：

- 在普通方法中，super 可以调用的是父类的原型对象上的方法（可以理解为 super 此时指向父类的原型对象）；在静态方法中，super 可以调用父类的静态方法（可以理解为 super 此时指向父类）。而在 Java 中，通过 super 可以访问父类中被覆盖的同名变量或者方法，要访问静态方法则是通过“类名.方法名”或“对象名.方法名”。

比较后可见，真的是和 Java 非常类似。
结合前面的内容，可以发现从 ES3 到 ES6，JavaScript 中的面向对象部分一直是在向 Java 靠拢的。尤其增加了 class 和 extends 关键字之后，靠拢了一大步。但这些并没有改变 JavaScript 是基于原型这一实质。Java 中的类就像对象的设计图，每次调用 new 创建一个新的对象，就产生一个独立的对象占用独立的内存空间；而在 JavaScript，继承所做工作实际上是在构造原型链，所有子类的实例共享的是同一个原型。所以 JavaScript 中调用父类的方法实际上是在不同的对象上调用同一个方法，即“方法借用”，这种行为实际上是“委托（delegation）”调用。
