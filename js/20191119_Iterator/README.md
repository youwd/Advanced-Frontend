### Iterator  
原文 ： https://github.com/sunyongjian/blog/issues/18
#### 背景
生成器概念在Java，Python等语言中都是具备的，ES6也添加到了JavaScript中。Iterator可以使我们不需要初始化集合，以及索引的变量，而是使用迭代器对象的next方法，返回集合的下一项的值，偏向程序化。

ES5中遍历集合通常都是for循环，数组还有forEach方法，对象就是for-in，而迭代器可以统一处理所有集合数据的方法。迭代器是一个接口，只要你这个数据结构暴露了一个iterator的接口，那就可以完成迭代。ES6创造了一种新的遍历命令for...of循环，Iterator接口主要供for...of消费。

#### ES5中的loop
* for循环
  ```js
  var arr = [1, 2, 3];
  for(var i = 0, len = arr.length; i < len; i++) {
    console.log(arr[i]);
  }
  ```
  
  
  这是标准for循环的写法，字符串也支持，定义一个变量i作为索引，以跟踪访问的位置，len是数组的长度，条件就是i不能超过len。
  这种写法看起来算是比较简单明了的，只不过for里面要写一大坨，而且当出现嵌套的时候，要定义多个变量去维护不同集合的索引，增加复杂度，容易出错。
* forEach
  forEach是数组内置方法，写起来比较简洁，问题就是不能中断，跳出循环。而这个是我们经常会遇见的，达到某个条件就不需要往后遍历了。
  
  
  ```
  var arr = [1, 2, 3];
  arr.forEach(item =console.log(item))
  ```
* for-in
  常用来遍历对象，可以获得对象的key值，但是只能提取key，value需要我们自己obj[key]的形式去访问。
  
  
  ```js
   var obj = {
     name: 'syj',
     age: 24,
     sex: 'male',
     hobby: 'girl',
   }
     
  for(var key in obj) {
    console.log(key);
  }
  ```

#### 什么是迭代器
迭代器是带有特殊接口的对象。含有一个next()方法，调用返回一个包含两个属性的对象，分别是value和done，value表示当前位置的值，done表示是否迭代完，当为true的时候，调用next就无效了。

ES5模拟一个迭代器

```js
function createIterator(ary) {
  var i = 0;
  return {
    next: function() {
      return {
        value: ary[i++],
        done: i ary.length
      }
    }
  }
}
var iterator = createIterator(['a', 'b', 'c'])
var done = false;

while (!done) {
  var result = iterator.next();
  console.log(result);
  done = result.done;
}
//{ value: 'a', done: false }
//{ value: 'b', done: false }
//{ value: 'c', done: false }
//{ value: undefined, done: true }
```

createIterator可以看做一个返回迭代器对象的工厂函数，通过while循环调用返回的iterator.next()会得到result，直到done变为true。用ES5写还是比较麻烦的，而且我们这样写并不支持for...of。很快就会看到ES6真正的写法啦。

![timg1](https://cloud.githubusercontent.com/assets/18378034/24701437/0db7b65e-1a2d-11e7-962e-04804ac31f28.gif)

#### 迭代器协议(Iteration protocols)
迭代器对象不是新的语法或新的内置对象，而一种协议（ 迭代器协议），所有遵守这个协议的对象，都可以称之为迭代器。也就是说我们上面ES5的写法得到的对象遵循迭代器协议，即包含next，调用next返回一个result{value，done}。

#### 可迭代类型
ES6还引入了一个新的Symbol对象，symbol值是唯一的。定义了一个Symbol.iterator属性，只要对象中含有这个属性，就是可迭代的，可用于for...of。在ES6中，所有的集合对象，包括数组，Map和Set，还有字符串都是可迭代的，因为他们都有默认的迭代器。
不了解Symbol的可以移步[Symbol对象是什么](https://github.com/sunyongjian/blog/issues/17)

* 尝试使用for...of
  ```js
  let ary = ['a', 'b', 'c']; //数组
  
  let str = 'str'; //字符串
  
  let set = new Set(); //Set
  set.add('s');
  set.add('s');
  set.add('e');
  set.add('t');
  
  let map = new Map(); //Map
  let o = {};
  map.set('m', 'm');
  map.set(o, 'object');
  
  let obj = {   //对象
    name: 'syj',
    age: 24
  }
  
  function forOf(list) {
    for(var value of list) {
      console.log(value);
    }
  }
  
  forOf(ary); //a b c
  forOf(str); // s t r
  forOf(set); // s e t
  forOf(map); //[ 'm', 'm' ], [ {}, 'object' ]
  forOf(obj); //TypeError: list[Symbol.iterator] is not a function
  ```
  
  
  通过结果可以看出，确实集合类型和字符串都可以用默认的for...of来迭代。但是对象却不可以，内部抛出一个错误，找不到迭代器的接口，证实了上面的言论。
  也许你不了解Set，Map，Set通常是类似于数组的，无重复项的集合，Map是类似于对象的，但是他的key可以是任何类型，增强版的“键值对”的数据结构。详情了解可以移步[Set-Map](http://es6.ruanyifeng.com/#docs/set-map)。
* 可以访问默认的iterator
  数组中默认的iterator我们是可以访问的，用法是一样的。
  
  
  ```js
  let ary = ['a', 'b', 'c'];
  let iterator = ary[Symbol.iterator]();
  console.log(iterator.next()); //{ value: 'a', done: false }
  console.log(iterator.next()); //{ value: 'b', done: false }
  console.log(iterator.next()); //{ value: 'c', done: false }
  console.log(iterator.next()); //{ value: undefined, done: true }
  ```

#### 使对象可迭代
前面说了只要对象包含[Symbol.iterator]的属性，就可以通过for...of遍历。我们也可以在对象中添加该属性。

```
 我们用两种方式
```

```js
 const obj = {
   b: 2
 }
 const a = 'a'
 obj.a = 1;
 Object.defineProperty(obj, Symbol.iterator, {
   enumerable: false,
   writable: false,
   configurable: true,
   value: function () {
     const that = this;
     let index = 0;
     const ks = Object.keys(that);
     return {
       next: function() {
         return {
           value: that[ks[index++]],
           done: (index ks.length)
         }
       }
     }
   }
 })
 for(const v of obj) {
   console.log(v); //  2 , 1
 }
```

通过defineProperty向obj对象中添加[Symbol.iterator]，我们在对应的value做的就是通过Object.keys取出它的key，然后调用一次next就往后找一位，可以通过next()尝试一下。因为obj有了[Symbol.iterator]，for...of可以找到，并且调用。

```js
 const fibonacci = {
   [Symbol.iterator]: function () {
     let [pre, next] = [0, 1];
     return {
       next() {
         [pre, next] = [next, pre + next];
         return {
           value: next,
           done: next 1000
         }
       }
     }
   }
 }
 
 for(var n of fibonacci) {
   console.log(n)
 }
 // 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610,987
```

通过直接声明给对象定义一个iterator。这里是iterator经典的用法。当这个数据集合特别大，甚至无限的时候，我们要把它定义好，取出来都是很庞大的操作，这时候iterator的优势就很明显了。只有调用一次next，才返回下一个值，不调用就没有。假如说我们给done没加限制条件，这个迭代器就永远没有done=true，就会永远可以next。为了防止for...of ，调用next的时候，有可能让我的电脑卡死，限制在1000以内。

#### 还有一些值得关注的点
* 拓展运算符与iterator关系密切
  借用我们fibonacci的例子，只有含有[Symbol.iterator]属性的对象，才可以使用... 展开。
  
  
  ```js
  const fibonacci = {
     a: 'a',
     b: 'b',
  }
  console.log(...fibonacci); //TypeError:
  //(var)[Symbol.iterator] is not a function
  
  fibonacci[Symbol.iterator] = function () {
    let [pre, next] = [0, 1];
    return {
      next() {
        [pre, next] = [next, pre + next];
        return {
          value: next,
          done: next 1000
        }
      }
    }
  }    
  console.log(...fibonacci);//
  ```
  
  
  第一次log我们尝试把fibonacci使用... 展开，但是会报错。把这行console注释掉以后，给这个对象添加一个Symbol.iterator属性，再次使用... ，就会得到之前的斐波那契数列了。 由于ES6的数组等集合默认有Symbol.iterator属性，所以我们都是可以直接使用扩展运算符。
* 类数组
  ES6中对于类数组，也添加了默认迭代器，比如NodeList，它和数组的默认迭代器的用法是一样的。这意味着你可以使用 for...of 循环或在任何对象默认迭代器的内部来迭代 NodeList
  
  
  ```js
  var divs = document.getElementsByTagName("div");
  
  for (const element of divs) {
    console.log(element.id);
  }
  ```

#### 总结
ES6提出迭代器的概念，契合了JS语言发展的趋势，统一处理数据结构。迭代器是ES6中很重要的部分，我们仅仅使用是很方便的，但是自定义一些iterator，或者更复杂的方式运行迭代器，还需要我们继续学习。
而定义一个对象的迭代器，又与Symbol对象有关，它采用了Symbol里面的一个默认属性iterator，用来访问对象的迭代器。最后可迭代的数据类型，我们都可以用for...of方法循环遍历，而且集合和字符串内置迭代器，我们可以轻松方便的访问。拓展运算符也是基于iterator的拓展，通过...我们可以把其他数据类型转化为数组，因为...通过执行迭代器，并读取返回的value。

