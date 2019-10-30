//---------------------------ES3实现继承----------------------------//
function Person(name){
    this.name = name;
}

Person.prototype.printName = function(){
    console.log(this.name);
}

function Bob(){
    Person.call(this,"Bob");
    this.hobby = "Histroy";
}

function inheritProto(Parent,Child){
    var fn = function(){};
    fn.prototype = Parent.prototype;
    Child.prototype = new fn();
    Child.prototype.constructor = Child;
}

inheritProto(Person,Bob);
Bob.prototype.printHobby = function(){
    console.log(this.hobby);
}

console.log("ES3实现",new Bob());


//---------------------------ES5实现继承----------------------------//
function Person_es5(name) {
    this.name = name;
  }
  
  Person_es5.prototype.printName = function() {
    console.log(this.name);
  };
  
  function Bob_es5() {
    Person_es5.call(this, "Bob");
    this.hobby = "Histroy";
  }
  
  // Bob_es5.prototype  = Object.create(Person_es5.prototype, {
  //   constructor: {
  //     value: Bob_es5,
  //     enumerable: false,
  //     configurable: true,
  //     writable: true
  //   }
  // });

  Bob_es5.prototype  = Object.create(Person_es5.prototype);
  Bob_es5.prototype.constructor = Bob_es5;

  Bob_es5.prototype.printHobby = function() {
    console.log(this.hobby);
  };
  
  console.log("ES5实现：",new Bob_es5());


//---------------------------ES6实现继承----------------------------//
class Person_es6 {
    constructor(name) {
      this.name = name;
    }
  
    printName() {
      console.log(this.name);
    }
  }
  
  class Bob_es6 extends Person_es6 {
    constructor() {
      super("Bob");
      this.hobby = "Histroy";
    }
  
    printHobby() {
      console.log(this.hobby);
    }
  }
  
  console.log("ES6实现：",new Bob_es6());