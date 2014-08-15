---
layout: default
title: Seven JavaScript Quirks I Wish I’d Known About
tags: JavaScript
---

[原文地址](http://developer.telerik.com/featured/seven-javascript-quirks-i-wish-id-known-about/)

<br>

如果你刚刚接触 JavaScript, 或者 JavaScript 是你最近的开发工作的一小部分, 你可能会觉得沮丧. 所有的语言都有它们自己的怪癖 - 但是范例从强类型的服务器端语言切换到 JavaScript 的话, 你有时候可能会感到非常困惑. 我就曾经这样! 几年前, 当我投身于全职 JavaScript 开发的时候, 我希望自己当时能知道 _很多_ 东西. 在这篇文章中, 我会分享一些 JavaScript 的这种怪癖, 希望能使你免于遭受我曾经非常头疼的事情. 这篇文章并不会面面俱到 - 它只是一个采样 - 但是希望它能阐释 JavaScript 的一些技巧, 并且希望一旦你跨过了这些障碍就能感受到 JavaScript 的强大.

<br>

接下来会讲的一些怪癖:

1. [Equality](#equality)
2. [Dot Notation vs Bracket Notation](#dot-notation-vs-bracket-notation)
3. [Function Context](#function-context)
4. [Function Declarations vs Function Expressions](#function-expressions-vs-function-declarations)
5. [Named vs Anonymous Functions](#named-vs-anonymous-functions)
6. [Immediately Invoked Function Expressions](#immediately-invoked-function-expressions)
7. [typeof vs Object.prototype.toString](#the-typeof-operator-and-objectprototypetostring)

<br>

## Equality

<br>

因为之前学的是 C#, 所以我对 `==` 操作符非常熟悉. 值类型(以及字符串)要么相等(有相同的值)要么不等. 引用类型要么相等 - 指向同一个东西 - 要么不等. (假设你没有重载 `==` 操作, 也没有使用你自己的 Equals 方法和 GetHashCode 方法.) 当我知道 JavaScript 有两种相等操作: `==` 和 `===` 的时候感到非常惊讶. 我最初看见的大多数代码都使用的 `==`, 所以我也这样做了并且没有意识到 JavaScript 到底做了什么, 直到我运行了这样的代码:
<pre>
<code class="js">
var x = 1;

if(x == "1") {
    console.log("YAY! They're equal!");
}
</code>
</pre>

所以 _这_ 到底是什么黑魔法? 整数`1`怎么会等于字符串`"1"`?

<br>

在 JavaScript 中, 有一种相等`==`, 还有一种 _严格_ 相等`===`. 相等操作符会把操作数强制转换成相同的类型 _然后_ 再进行严格相等比较. 所以在上面的例子中, 字符串`"1"`被转换了, 在这个场景里就是被转成了整数`1`, 然后和我们的变量`x`进行比较.

<br>

严格相等并不会转换类型. 如果操作数的类型不同(就像整数`1`和字符串`"1"`), 那么它们就 _不_ 相等:
<pre>
<code class="js">
var x = 1;

// with strict equality, the types must be the *same* for it to be true
if(x === "1") {
    console.log("Sadly, I'll never write this to the console");
}

if(x === 1) {
    console.log("YES! Strict Equality FTW.")
}
</code>
</pre>

<br>

你可能已经在想强制类型转换发生之后的种种恐怖情形了 - 假如你误传了你的应用中的某个值的真实性质而导致了很难发现的bug. 这经常发生, 经验丰富的 JavaScript 开发者们推荐的做法是 _总是使用严格相等_.

<br>

## Dot Notation vs Bracket Notation

<br>

取决于你赞同哪种语言, 你可能并不会对这些在 JavaScript 中获取一个对象属性以及获取一个数组中元素的方式感到惊讶:
<pre>
<code class="js">
// getting the "firstName" value from the person object:
var name = person.firstName;

// getting the 3rd element in an array:
var theOneWeWant = myArray[2]; // remember, 0-based index
</code>
</pre>

但是, 你知道也可以使用括号来引用一个对象成员吗? 例如:
<pre>
<code class="js">
var name = person["firstName"];
</code>
</pre>

<br>


为什么这会有用呢? 你可能大多数时间都是使用的点号, 然而也有些情况下只能使用括号而不能使用点号. 例如, 我经常把一个大的`switch`语句重构成一个[调度表](https://en.wikipedia.org/wiki/Dispatch_table), 像这样:
<pre>
<code class="js">
var doSomething = function(doWhat) {
    switch(doWhat) {
        case "doThisThing":
            // more code...
        break;
        case "doThatThing":
            // more code...
        break;
        case "doThisOtherThing":
            // more code....
        break;
        // additional cases here, etc.
        default:
            // default behavior
        break;
    }
}
</code>
</pre>

可以被转换成这样:
<pre>
<code class="js">
var thingsWeCanDo = {
    doThisThing      : function() { /* behavior */ },
    doThatThing      : function() { /* behavior */ },
    doThisOtherThing : function() { /* behavior */ },
    default          : function() { /* behavior */ }
};

var doSomething = function(doWhat) {
    var thingToDo = thingsWeCanDo.hasOwnProperty(doWhat) ? doWhat : "default"
    thingsWeCanDo[thingToDo]();
}
</code>
</pre>

<br>
使用`switch`并没有什么本质错误(在很多情况下, 如果你需要考虑很多迭代和性能问题, `switch`可能优于调度表). 然而, 调度表提供了一个漂亮的方式来组织代码并且易于扩展, 而且括号允许你在执行的时候动态地引用某个属性.

<br>

## Function Context

<br>

有很多很好的博客文章都讲解了怎样合适地理解 JavaScript 中的"`this`上下文"(我会在这篇文章的底部贴上部分链接), 它也被马上加入了我的"希望能早点知道的事情"清单. 阅读代码然后理直气壮地说我知道`this`在各种场合的意义真的不难 - 你只需要学会一些规则. 不幸的是, 我之前读过的很多关于`this`的解释只是让我更加迷惑了. 因此, 我试着去给刚接触 JavaScript 的开发者们简单地解释一下`this`.

<br>

### 第一 - 从一个全局的假设开始

<br>

如果没有什么改变了执行的上下文的话, `this`默认是指向一个 _全局对象_ 的. 在浏览器中, 就是`window`对象(或者 node.js 的 `global`).

<br>

### 第二 - 方法中的`this`的值

<br>

如果你有一个对象, 这个对象的某个成员是一个函数, 调用了 _父对象_ 的方法, 这时`this`就是这个父对象. 例如:
<pre>
<code class="js">
var marty = {
    firstName: "Marty",
    lastName: "McFly",
    timeTravel: function(year) {
        console.log(this.firstName + " " + this.lastName + " is time traveling to " + year);
    }
}

marty.timeTravel(1955);
// Marty McFly is time traveling to 1955
</code>
</pre>

你可能已经知道了你可以使用`marty`对象的`timeTravel`方法, 并且从另一个对象创建一个指向它的新的引用. 这确实是 JavaScript 一个非常强大的特性 - 使得我们可以给多个目标实例应用同一种行为(函数).
<pre>
<code class="js">
var doc = {
    firstName: "Emmett",
    lastName: "Brown",
}

doc.timeTravel = marty.timeTravel;
</code>
</pre>

那么当我们调用`doc.timeTravel(1885)`的时候会发生什么?
<pre>
<code class="js">
doc.timeTravel(1885);
// Emmett Brown is time traveling to 1885
</code>
</pre>

又是一个黑魔法. 好吧, 其实并不是. 记住, 当你调用一个 _方法_ 的时候, `this`上下文是它被调用的父对象.

<br>

那么如果我们保存一个对`marty.TimeTravel`方法的引用, 并且调用这个引用的话会发生什么呢? 让我们看一看:
<pre>
<code class="js">
var getBackInTime = marty.timeTravel;
getBackInTime(2014);
// undefined undefined is time traveling to 2014
</code>
</pre>

为什么是"undifined undifined"?! 为什么不是"Marty McFly"?

<br>

让我们问一个很重要的问题: _当我们调用`getBackInTime`函数的时候, 它的父对象是什么?_ `getBackInTime`函数技术上是存在于 window 的, 我们把它作为一个 _函数_ 调用, 而不是一个对象的方法. 当我们像这样调用一个函数的时候 - 没有从属对象 - `this`上下文就会是全局的对象. [David Shariff](http://davidshariff.com/blog/javascript-this-keyword/)对这描述得很棒:

> 无论什么时候一个函数被调用, 我们必须着眼于括号"()"的左边. 如果括号的左边是一个引用, 那么传递给这个函数调用的`this`的值就是这个函数所属的对象, 否则就是全局对象.

<br>

既然`getBackInTime`的`this`上下文是`window` - `window`没有`firstName`和`lastName`属性 - 那么就解释了为什么我们会看到"undifined undifined".

<br>

所以我们知道直接调用一个函数 - 这个没有从属对象 - 结果是`this`上下文是全局对象. 但是我也说过我知道我们的`getBackInTime`函数会存在于`window`. 为什么我会知道这个? 好吧, 除非我把`getBackInTime`包在一个不同的作用域内(当我们讨论立即调用函数表达式的时候会再讲这个), 否则我声明的任何变量都属于`window`. 可以在 Chrome 的 console 中证明:
![getBackInTime](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_1.png)

<br>

现在正好可以讨论`this`迷惑开发者的主要地方之一: 订阅事件句柄.

<br>

### 第三(其实只是#2的扩展) - 异步调用的时候`this`的值

<br>
假设当有人点击按钮的时候需要调用`marty.timeTravel`方法:
<pre>
<code class="js">
var flux = document.getElementById("flux-capacitor");
flux.addEventListener("click", marty.timeTravel);
</code>
</pre>

使用上面的代码的话, 当我们点击按钮, 我们会看见结果是`undefined undefined is time traveling to [object MouseEvent]`. 什么?! 好吧 - 首先, 也是最明显的, 我们没有给`timeTravel`方法提供`year`参数. 相反, 我们把这个方法直接作为了一个事件句柄. 而且`MouseEvent`参数被作为第一个参数传给了这个事件句柄. 这个问题很容易修复, 真正的问题是我们又一次看见了`undifined undifined`. 不要绝望 - 你已经知道为什么会出现这种情况了(即使你还没有意识到). 现在对`timeTravel`函数做一点改动, 把`this`输出到 log 看一下是什么:
<pre>
<code class="js">
marty.timeTravel = function(year) {
    console.log(this.firstName + " " + this.lastName + " is time traveling to " + year);
    console.log(this);
};
</code>
</pre>

现在 - 当我们点击按钮, 我们会在浏览器的 console 中看到类似的输出:
![undifined](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_2.png)

<br>
我们的第二个`console.log`显示了当方法被调用的时候的`this`上下文 - 它正好是订阅这个事件的按钮. 这让你感到惊讶了吗? 就像之前一样 - 当我们把`marty.timeTravel`赋值给`getBackInTime`变量的时候 - 一个指向`marty.timeTravel`的引用也被作为我们的事件句柄保存并且被调用, 但不是从它的"所有者"`marty`对象. 在这种情况下, 它被这个按钮底层的[事件触发](http://en.wikipedia.org/wiki/Event-driven_architecture)异步调用了.

<br>
那么 - 有可能把`this`改成我们需要的吗? 当然! 这种情况下, 解决办法看似很简单. 不把`marty.timeTravel`直接作为事件句柄, 我们可以使用一个异步函数来作为事件句柄, 并且在这个函数里调用`marty.timeTravel`. 这样可以解决缺少`year`参数的问题.
<pre>
<code class="js">
flux.addEventListener("click", function(e) {
    marty.timeTravel(someYearValue);
});
</code>
</pre>

<br>
再点击按钮就会在 console 中看见类似下面的输出:
![Marty](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquicks_afjq_3.png)

<br>

成功啦! 为什么这样可以成功呢? 思考一下我们是怎么调用`timeTravel`方法的. 在我们的第一个点击按钮的例子中, 我们把这个方法 _本身_ 作为了事件句柄, 所以它没有从父对象`marty`被调用. 在第二个例子中, 匿名函数有一个按钮元素的`this`上下文, 当我们调用`marty.timeTravel`的时候, 我们是从`marty`父对象中调用它的, 所以`this`就是`marty`.

<br>

### 第四 - 构造函数里的`this`的值

<br>
当你使用一个构造函数来创建某个对象的新实例的时候, 这个函数里的`this`的值就是这个被创建的新对象. 例如:
<pre>
<code class="js">
var TimeTraveler = function(fName, lName) {
    this.firstName = fName;
    this.lastName = lName;
    // Constructor functions return the
    // newly created object for us unless
    // we specifically return something else
};

var marty = new TimeTraveler("Marty", "McFly");
console.log(marty.firstName + " " + marty.lastName);
// Marty McFly
</code>
</pre>

<br>

### 使用 Call, Apply & Bind

<br>

你可能已经怀疑上面的那些例子了, 觉得应该有某些语言层面的特性可以让我们调用一个函数并且在运行的时候告诉它`this`应该是什么. 你猜对啦. `Function`原型中的`call`和`apply`方法都可以让我们调用一个函数并且传递`this`.

<br>
`call`的方法签名接受`this`参数, 紧接着是被调用的函数的参数, 这些参数都是分开的:
<pre>
<code class="js">
someFn.call(this, arg1, arg2, arg3);
</code>
</pre>

<br>
`apply`把`this`作为第一个参数, 紧接着是其他参数的一个数组:
<pre>
<code class="js">
someFn.apply(this, [arg1, arg2, arg3]);
</code>
</pre>

<br>
我们的`doc`和`marty`实例都可以使用自己的 time travel, 但是[Einstein](http://backtothefuture.wikia.com/wiki/Einstein)在他们的帮助下 time travel. 所以我们给之前的`doc`实例增加一个方法, 这样`doc`可以创建一个`einstein`实例来时光旅行:
<pre>
<code class="js">
doc.timeTravelFor = function(instance, year) {
    this.timeTravel.call(instance, year);
    // alternate syntax if you used apply would be
    // this.timeTravel.apply(instance, [year]);
};
</code>
</pre>

现在可以这样让 Einstein 时光旅行:
<pre>
<code class="js">
var einstein = {
    firstName: "Einstein",
    lastName: "(the dog)"
};
doc.timeTravelFor(einstein, 1985);
// Einstein (the dog) is time traveling to 1985
</code>
</pre>

我知道这是一个瞎编的例子, 但是它足以让你一窥给其他对象调用方法的强大力量了.

<br>

还有一种我们没有探索的可能性. 给`marty`对象一个`goHome`方法, 只用简单地调用`this.timeTravel(1985)`:
<pre>
<code class="js">
marty.goHome = function() {
    this.timeTravel(1985);
}
</code>
</pre>

<br>
然而我们知道如果把`marty.goHome`作为事件句柄绑定到按钮的点击事件的话, `this`就会是按钮 - 而且不幸的是按钮并没有`timeTravel`方法. 我们可以使用之前的方法 - 使用匿名函数作为事件句柄, 这个函数来调用`marty`实例的方法 - 现在我们有了另外一种选择, `bind`函数:
<pre>
<code class="js">
flux.addEventListener("click", marty.goHome.bind(marty));
</code>
</pre>

`bind`函数实际上返回一个 _新的_ 函数, 这个新函数的`this`值被设置成了你提供的那个参数. 如果你要支持比较老的浏览器(例如小于 IE9 的), 那么就需要[给这个`bind`方法垫片](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)(或者, 你要是使用 jQuery 的话可以使用`$.proxy`; underscore 和 lodash 都提供`_.bind`).

<br>

> 要记住的一件重要的事情是, 如果你在原型中使用`bind`方法的话就会创建一个实例层的方法, 这样就会忽略掉原型方法的优点. 这并没有 _错_, 只是需要知道有这么回事. 我在[这篇文章中](http://freshbrewedcode.com/jimcowart/2013/02/12/getting-into-context-binds/)讨论了这个问题.

<br>

## Function Expressions vs Function Declarations

<br>
你经常会看见 JavaScript 有两种定义函数的方法(尽管 ES6 会介绍[另外一种](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope#The_arrow_function_expression_(.3D)): 函数申明和函数表达式.

<br>

函数申明并不需要`var`关键字. 事实上, 正如[ Angus Croll 说的](http://javascriptweblog.wordpress.com/2010/07/06/function-declarations-vs-function-expressions/): "把它们当作变量申明的兄弟非常有用". 例如:
<pre>
<code class="js">
function timeTravel(year) {
    console.log(this.firstName + " " + this.lastName + " is time traveling to " + year);
}
</code>
</pre>

上例中的函数名`timeTravel`不止在它被申明的作用域里可见, 也在这个函数自己内部可见(这对递归的函数调用非常有用). 函数申明自然是有名字的函数, 上面这个函数的名字就是`timeTravel`.

<br>
函数表达式定义一个函数并把它赋值给一个变量. 它们通常看上去像这样:
<pre>
<code class="js">
var someFn = function() {
    console.log("I like to express myself...");
};
</code>
</pre>

当然也可以给函数表达式命名 - 但是, 不像函数申明, 一个有名字的函数表达式并不能在它的作用域内被获取.
<pre>
<code class="js">
var someFn = function iHazName() {
    console.log("I like to express myself...");
    if(needsMoreExpressing) {
        iHazName(); // the function's name can be used here
    }
};

// you can call someFn() here, but not iHazName()
someFn();
</code>
</pre>

<br>

> 讨论函数表达式和函数申明并不能完全不提"hoisting" - 也就是函数和变量申明被解释器移到包含它们的作用域的顶部. 我们在这里并不会讨论 hoisting, 但是可以读一下两篇来自[Ben Cherry](http://www.adequatelygood.com/JavaScript-Scoping-and-Hoisting.html)和[Angus Croll](http://javascriptweblog.wordpress.com/2010/07/06/function-declarations-vs-function-expressions/)的很棒的文章.

<br>

## Named vs Anonymous Functions

<br>

基于我们刚刚讨论的内容, 你可能会猜, 一个"匿名"函数就是没有名字的函数. 大多数 JavaScript 开发者立刻就会认为下面的第二个参数也是匿名函数:
<pre>
<code class="js">
someElement.addEventListener("click", function(e) {
    // I'm anonymous!
});
</code>
</pre>

并且, 我们的`marty.timeTravel`函数也是匿名的:
<pre>
<code class="js">
var marty = {
    firstName: "Marty",
    lastName: "McFly",
    timeTravel: function(year) {
        console.log(this.firstName + " " + this.lastName + " is time traveling to " + year);
    }
}
</code>
</pre>

既然函数申明必须有一个名字, 那么只有函数表达式可以是匿名的.

<br>

## Immediately Invoked Function Expressions

<br>
既然我们在讨论函数表达式, 我希望我能早点正确知道的一个是: 立即调用函数表达式(IIFE). 关于 IIFE 的好文章有很多(我会在结尾列出一些), 但是简而言之, 它是一个函数表达式, 但是没有被赋值给某个变量用来之后调用, 它会被 _立即_ 执行. 在浏览器的控制台里看一下可能会帮助你理解.

<br>

首先 - 输入一个函数表达式 - 但是不要赋值 - 看看会发生什么:
![exp1](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_4.png)

<br>
这并不是有效的 JavaScript 语法 - 它是一个缺少名字的函数申明. 但是, 为了让它变成表达式, 我们只需要用括号把它包裹起来:
![exp2](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_6.png)

<br>
把它变成一个立即表达式就在控制台中返回了我们的匿名函数(记住, 我们没有赋值, 因为它是一个表达式所以我们取回了它的值). 因此 - 我们在"立即调用函数表达式"中有"函数表达式"的部分. 为了获取"立即调用"的部分, 我们在这个表达式的返回值后面再加一对括号并且调用它(就像调用其他函数一样):
![exp3](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_6.png)

<br>
"但是等等, Jim! 我觉得我之前见过这个, 是在表达式括号里使用的括号." 确实, 你可能已经见过 - 它是完全合法的语法(也作为 Douglas Crockford 推荐的语法而被熟知):
![exp4](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_7.png)

<br>
每一种放置括号的方法都是可用的, 但是我强烈推荐读一下关于为什么以及什么时候这两种用法会有区别的[最好的解释](https://github.com/airbnb/javascript/issues/21#issuecomment-10203921).

<br>
ok, 很好 - 现在我们知道 IIFE 是什么了 - 那它为什么有用呢?
<br>
它帮我们控制作用域 - JavaScript 非常必要的一部分! 我们之前看过的`marty`实例创建在 _全局_ 作用域里. 这意味着, window(假设我们在浏览器里), 会有一个`marty`属性. 如果我们一直都这样写 JavaScript 代码, 那么我们很快就会有大量的变量被申明在全局作用域里, 我们的应用代码就会污染 window. 即使在最好的场景, 泄露太多的细节给全局作用域也非常地糟糕, 如果有人给变量命名成了某个 window 里已经存在的变量名会怎么样呢? 之前的就会被覆盖!

<br>
例如, 你喜爱的"Amelia Earhart"粉丝站在全局作用域里申明了一个`navigator`变量, 这是申明之前和之后的:
![exp5](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_8.png)

<br>
OOPS!
<br>

显然 - 污染全局作用域很**糟糕**, JavaScript 使用函数作用域(而不是块作用域, 如果你之前是用 C# 或者 Java 的话, 这一点非常重要!), 因此, 避免我们的代码污染全局作用域的方法就是创建一个 _新_ 作用域, 我们可以使用一个 IIFE 来做这件事因为它的内容会在它自己的函数作用域内部. 在下面的例子中, 我在控制台中展示`window.navigator`的值, 然后我创建一个 IIFE 把这个行为包裹起来并且把数据具体到 Amelia Earhart. 这个 IIFE 正好返回一个对象, 这个对象就作为我们的"应用命名空间". 在`IIFE`里我申明一个`navigator`变量来展示它 _不_ 会覆盖`window.navigator`的值.
![exp6](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_9.png)

<br>
作为额外的奖励, 我们上面创建的 IIFE 是 JavaScript 里的一个模块模式的开始. 我会在结尾增加一些链接, 你可以进一步探索模块模式.

<br>

## The `typeof` Operator and `Object.prototype.toString`

<br>
最终, 你可能会发现自己在某个情况下需要检查传递给一个函数的某个值的类型, 或者需要做类似的事情. `typeof`操作符可能看上去是明显的选择, 然而它并不是非常有用. 例如, 当我们对一个对象, 一个数组, 一个字符串和一个正则表达式调用`typeof`的时候会发生什么?
![type1](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_10.png)

<br>
好吧 - 至少我们可以从对象, 数组和正则表达式中分辨出字符串, 是吧? 谢天谢地, 我们可以用另外一种方法来得到我们要检查的对象的更准确的信息. 我们使用`Object.prototype.toString`函数以及我们之前学到的`call`方法:
![type2](http://tdn.azurewebsites.net/wp-content/uploads/2014/04/jsquirks_afjq_11.png)

<br>
为什么使用`Object.prototype`的`toString`方法? 因为第三方库或者我们自己的代码都有可能用一个实例方法覆盖`toString`方法
. 通过`Object.prototype`, 我们可以强制原始的`toString`表现在一个实例上.

<br>

如果你知道`typeof`会返回什么的话, 你不需要检查它会返回你什么(例如, 你只需要知道某个东西是不是字符串)的话, 那么使用`typeof`就非常好. 然而, 如果你需要从对象中分辨出数组, 分辨出正则等等的话, 就用`Object.prototype.toString`吧.

<br>

## Where to Go Next

<br>
我从其他的 JavaScript 开发者那里获益匪浅, 所以请查看下面的链接, 并感谢这些开发者教会了我们其余的人!

+ Axel Rauschmayer’s great post on [When is it OK to use == in JavaScript](http://www.2ality.com/2011/12/strict-equality-exemptions.html)? (hint: never)
+ [Fixing the typeof Operator](http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/) by Angus Croll
+ [Airbnb Github Issue comment](https://github.com/airbnb/javascript/issues/21#issuecomment-10203921) that’s the single best explanation on IIFE parens placement
+ [Function Declarations vs. Function Expressions](http://javascriptweblog.wordpress.com/2010/07/06/function-declarations-vs-function-expressions/) – by Angus Croll
+ [Getting Into Context Binds](http://freshbrewedcode.com/jimcowart/2013/02/12/getting-into-context-binds/) by yours truly
+ [Immediately-Invoked Function Expression (IIFE)](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) by Ben Alman
+ [Learning JavaScript Design Patterns](http://addyosmani.com/resources/essentialjsdesignpatterns/book/) by Addy Osmani
+ [Understanding the “this” keyword in JavaScript](http://unschooled.org/2012/03/understanding-javascript-this/) by Nicholas Bergson-Shilcock
+ [MDN – Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
+ [MDN – Function.prototype.apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
+ [MDN – Function.prototype.call](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
+ [Named function expressions demystified](http://kangax.github.io/nfe/) by Juriy “kangax” Zaytsev
+ [Basic JavaScript for the impatient programmer](http://www.2ality.com/2013/06/basic-javascript.html) by Axel Rauschmayer
+ [JavaScript Scoping and Hoisting](http://www.adequatelygood.com/JavaScript-Scoping-and-Hoisting.html) by Ben Cherry
+ [JavaScript’s ‘this’ Keyword](http://davidshariff.com/blog/javascript-this-keyword/) by David Shariff
+ [What is the Execution Context & Stack in JavaScript?](http://davidshariff.com/blog/what-is-the-execution-context-in-javascript/) by David Shariff

<br>
