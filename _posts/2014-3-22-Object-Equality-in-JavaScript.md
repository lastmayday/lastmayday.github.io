---
layout: default
title: Object Equality in JavaScript
tags: JavaScript
---

[原文地址](http://designpepper.com/blog/drips/object-equality-in-javascript.html)



相等是 JavaScript 中最初令人迷惑的概念之一. `==` 与 `===` 的行为, 强制类型转换的顺序等等, 都与这个复杂的主题有关. 今天我们将看一下另外一个方面: 对象是怎么相等的.



你可能会认为如果两个对象有同样的属性, 而且它们所有的属性都有同样的值, 那么它们就会是相等的. 让我们看一下发生了什么.

```javascript
var jangoFett = {
    occupation: "Bounty Hunter",
    genetics: "superb"
};

var bobaFett = {
    occupation: "Bounty Hunter",
    genetics: "superb"
};

// Outputs: false
console.log(bobaFett === jangoFett);
```



`bobaFett` 和 `jangoFett` 的属性都是相同的, 然而对象本身却并不相等. 也许是因为我们使用了三重等号? 让我们验证一下.

```javascript
// Outputs: false
console.log(bobaFett == jangoFett);
```



原因是 JavaScript 内部其实有两种不同的相等验证机制. 像字符串, 数字这样的原语, 比较的是它们的值是否相同. 但是像数组, 日期, 以及普通的对象, 比较的是它们的引用是否相同. 引用的比较基本上是检查对象是否指向内存中的同一个地址. 这里有一个简单的例子.

```javascript
var jangoFett = {
    occupation: "Bounty Hunter",
    genetics: "superb"
};

var bobaFett = {
    occupation: "Bounty Hunter",
    genetics: "superb"
};

var callMeJango = jangoFett;

// Outputs: false
console.log(bobaFett === jangoFett);

// Outputs: true
console.log(callMeJango === jangoFett);
```



一方面, `jangoFett` 和 `bobaFett` 变量指向的是两个有着相同属性的对象, 但是它们是两个不同的实例. 另一方面, `jangoFett` 和 `callMeJango` 都指向同一个实例.



因为这个原因, 当你尝试去检查对象的相等时, 你需要弄清楚你感兴趣的是哪一种相等. 你是想检查这两个东西是否是同一个实例呢? 那么你就可以使用 JavaScript 内置的相等操作符. 还是你想检查这两个对象是否有"相同的值"呢? 如果是这样, 那么你就需要再做点工作.



这里有一个非常基本的方法来检查一个对象的"值相等".

```javascript
function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

// Outputs: true
console.log(isEquivalent(bobaFett, jangoFett));
```



可以看到, 为了检查对象的"值相等", 我们需要迭代对象的每一个属性来看它们是否相等. 这个简单的应用对我们的例子是有效的, 但是有很多情况它处理不了. 例如:

+ 如果有一个属性的值本身就是对象怎么办?
+ 如果一个属性的值是`NaN`(JavaScript中唯一自己不等于自己的值)怎么办?
+ 如果`a`有一个属性的值是`undefined`, 但是`b`没有这个属性(这样就等于`undefined`了)怎么办?



检查对象的"值相等"的一个健壮的方法是使用一个测试良好的库, 这个库需要包含了各种边缘情况. [Underscore](http://underscorejs.org/#isEqual) 和 [Lo-Dash](http://lodash.com/docs#isEqual) 都有叫做 `_.isEqual` 的应用, 可以很好地处理对象的比较. 你可以这样使用它们:

```javascript
// Outputs: true
console.log(_.isEqual(bobaFett, jangoFett));
```



我希望这个 drip of JavaScript 帮助你更好地掌握了对象的相等是怎么工作的.



------------------



### 翻译完毕下面还是自己的瞎说



有次去蹭前端会, 周聪讲了一个JavaScript中对象的复制. JavaScript 中的复制也与上面的比较一样有两套机制, 基本类型(undifined, string, number, boolean, null)的值, `=` 复制的是值; 引用类型(数组, 对象), `=` 复制的是引用的地址, 也就是两个变量指向的是同一个对象.



那么我要得到一个属性相同的另一个对象(也就是深复制)怎么办呢? 上面我们知道了 `=` 是不行的, 还是同一个对象.

有一种取巧的方法是先序列化成字符串, 然后复制字符串再反序列化成对象.

另外 Google 到一种方法, 分日期, 数组, 对象三种类型复制遇到属性值还是对象则递归调用.



深浅复制的参考:

+ [Most efficient way to clone an object?](http://stackoverflow.com/questions/122102/most-efficient-way-to-clone-an-object)
+ [Most elegant way to clone a JavaScript object](http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object)
