---
layout: defalt
title: Advanced Use of Python Decorators and Metaclasses
tags: Python
---

[原文地址](http://lgiordani.com/blog/2014/10/14/decorators-and-metaclasses/)

<br>

## 摘要

<br>
在给大家介绍 Python 元类的时候, 我发现有时候 Python 一些最强大的特性有一个大问题, 那就是程序员没有感觉到他们可以怎样简化他们的日常任务. 因此, 除了标准的面向对象语言之外, 像元类这样的特性被认为是花哨且无用的, 而不是一个真正的游戏改变者.

<br>

这篇文章想展示怎样使用元类和装饰器来构造一个功能强大的类, 这个类可以轻易地通过添加装饰器方法来继承和定制.

<br>

## 元类和装饰器: 太空中的一场比赛

<br>
元类是一个复杂的话题, 大多数时候即使是高级程序员也没有见过元类被广泛的实际使用. 很有可能这是 Python (或者其他支持元类的语言, 比如 Smalltalk 和 Ruby) 最不符合"标准"面向对象模式或者 C++ 和 Java 中的解决办法的部分, 嗯这里只是提到两个大玩家.

<br>

的确, 元类通常只有在编写高级库或框架的时候才会出场, 高级库和框架里需要提供很多自动化的东西. 例如, Django Forms 系统严重依赖于元类来实现它所有的魔法.

<br>

然而也要注意到, 我们通常会把不熟悉的技术叫做"魔法"或者"技巧", 因此 Python 中的很多东西都被这样叫, 相比于其他语言, 这些技术的应用经常显得很奇特.

<br>

现在是给你的编程加点香料的时候了: 让我们练习一些 Python 的巫术, 开发这个语言的力量!

<br>

在这篇文章中, 我想展示一个装饰器和元类结合起来的有趣应用. 我会向你展示怎样使用装饰器来标记方法, 这样当执行一个给定的操作时, 这些方法可以自动地被类使用.

<br>

更详细一点, 我会实现一个类, 这个类可以被用来"处理"一个字符串, 并且向你展示怎样通过简单的装饰器方法来实现不同的"过滤器". 我想实现的东西有点像这样:
<pre>
<code class="python">
class MyStringProcessor(StringProcessor):
    @stringfilter
    def capitalize(self, str):
        [...]

    @stringfilter
    def remove_double_spaces(self, str):
        [...]

msp = MyStringProcessor()
"A test string" == msp("a test  string")
</code>
</pre>

这个模块定义了一个`StringProcessor`类, 我可以继承它并且给它添加自定义方法, 这些方法有一个标准的签名`(self, str)`并且被`@stringfilter`装饰. 这个类之后可以被实例化, 然后实例可以被直接用来处理一个字符串并返回结果. 类的内部自动地执行了所有继承的装饰器方法. 我也希望类可以遵守我定义的过滤器顺序: 先定义, 先执行.

<br>

## 元类搭车客指南

<br>
元类怎么帮助我们达到这个目标呢?

<br>
简单的说, 元类是被实例化来得到类的. 这意味着, 无论何时我使用一个类, 例如实例化它, 首先 Python 使用元类 _构建_ 这个类, 然后是我们写的类定义. 例如, 你知道你可以在`__dict__`属性中找到这个类的成员: 这个属性就是由标准元类`type`创建的.

<br>
鉴于此, 元类是一个很好的起点, 我们插入一些代码来标识类的定义内部的功能的一个子集. 也就是说, 我们想要这个元类的输出(也就是类)就像在标准情况下一样被构建, 但是有一个附加: 一部分方法被`@stringfilter`装饰.

<br>
大家知道一个类有一个 _命名空间_, 它是在类的内部定义的一些东西的一个字典. 所以, 当标准`type`元类被用来创建类的时候, 类的内容被解析然后一个`dict()`对象被用来收集这个命名空间.

<br>

然而我们感兴趣的是怎么保证定义的顺序, 一个 Python 字典是无序结构, 所以我们利用`__prepare__`钩子的优点, 这个钩子在 Python 3 的类创建处理中引进. 在目前的元类中, 这个函数是被用用来预处理类并且返回用来保存命名空间的结构. 所以, 跟着这个官方文档中的例子, 我们可以这样定义一个元类:
<pre>
<code class="python">
class FilterClass(type):
    def __prepare__(name, bases, **kwds):
        return collections.OrderedDict()
</code>
</pre>

这样, 当类被创建的时候, 一个`OrderedDict`将会被用来保存命名空间, 这样就允许我们保持定义的顺序. 请注意签名`__prepare__(name, bases, **kwds)`是被语言强制执行的. 如果你想把元类作为第一个参数(因为方法中的代码需要使用它的话), 你需要把签名变成`__prepare__(metacls, name, bases, **kwds)`并且用`@classmethod`装饰它.

<br>

我们想在元类中定义的第二个函数是`__new__`. 就像类的实例化发生的, 这个方法被 Python 调用用来获取这个元类的一个新的实例, 并且在`__init__`之前执行它. 它的签名必须是`__new__(metacls, name, bases, namespace, **kwds)`, 并且返回值必须是这个元类的一个实例. 至于它的正常类副本(毕竟所有的元类都是一个类), `__new__()`通常包装父类的相同方法, 这里是`type`, 加上它自己的自定义内容.

<br>

我们需要的自定义是创建一个方法列表, 这些方法是被用某种方式(被装饰的过滤器)标记过的. 简单起见, 被装饰的方法有一个`_filter`属性.

<br>

完整的元类就是:
<pre>
<code class="python">
class FilterClass(type):
    @classmethod
    def __prepare__(name, bases, **kwds):
        return collections.OrderedDict()

    def __new__(metacls, name, bases, namespace, **kwds):
        result = type.__new__(metacls, name, bases, dict(namespace))
        result._filters = [
            value for value in namespace.values() if hasattr(value, '_filter')]
        return result
</code>
</pre>


现在我们需要找到一种用`_filter`属性标记所有的过滤器方法的方式.

<br>

## 紫色装饰器的剖析

<br>

**装饰**: 把某样东西加到一个对象或地方, 特别是为了使它更有吸引力(剑桥词典)

<br>

如同名字显示的, 装饰器是增强函数或方法的最好方式. 记住, 一个装饰器基本上是可以接受另一个调用的调用, 另一个调用处理它并且返回它.

<br>

和元类结合使用, 装饰器变得非常强大并且是实现我们代码高级行为的表现方式. 这样, 我们可以轻松地使用它们来给装饰器方法增加一个属性, 这是装饰器最基本的用途之一.

<br>

我决定把`@stringfilter`装饰器作为函数使用, 即使我通常更愿意把它们作为类使用. 原因是一个装饰器类在没有参数的时候和有参数的时候行为不同. 这样这种不同会强制我们写一些复杂的代码, 而解释这些会使得现在矫枉过正. 在以后关于装饰器的文章中, 你会发现所有血淋淋的细节, 但同时你可以查看引用部分的三篇 Bruce Eckel 的文章.

<br>

装饰器非常简单:
<pre>
<code class="python">
def stringfilter(func):
    func._filter = True
    return func
</code>
</pre>

可以看到装饰器只是给函数创建了一个`_filter`属性(记住函数也是对象). 这个属性的真实值在这里并不重要, 因为我们感兴趣的只是对告知类成员要包含它.

<br>

## 可调用对象的动态性

<br>
我们过去常常把函数当作特殊的语言组件, 它们可以被"调用"或执行. 在 Python 中, 像其他的所有东西一样函数也是对象, 允许它们被执行的特性来自`__call__()`方法的存在. Python 被设计成多态并且基于委托, 所以在代码中发生的(几乎)任何东西都依赖于目标对象的一些特性.

<br>
这种概括的结果是每一个有`__call__()`方法的对象都可以像函数一样被执行, 并且得到 _可调用对象_ 的名字.

<br>
`StringProcessor`类因此应该包含这个方法并且用所有被包含的过滤器执行字符串处理. 代码是:
<pre>
<code class="python">
class StringProcessor(metaclass=FilterClass):

    def __call__(self, string):
        _string = string
        for _filter in self._filters:
            _string = _filter(self, _string)

        return _string
</code>
</pre>
快速回顾一下这个简单的函数, 展示了它接受字符串作为一个参数, 把它存到一个局部变量里并且循环过滤器, 依次在前一个过滤器得到的结果上对局部字符串变量执行操作.

<br>
过滤器函数从`self._filters`列表中提取, 这被我们已经讨论过的`FilterClass`元类编译.

<br>


现在我们需要做的是继承`StringProcessor`来得到元类以及`__call__()`方法, 并且定义需要的方法, 用`@stringfilter`装饰器装饰这些方法.

<br>

注意, 感谢装饰器和元类, 你可以在你的类中定义其他的方法, 只要这些方法没有被装饰器装饰的话就不会被字符串处理干扰.

<br>

一个简单的衍生类可能如下:
<pre>
<code class="python">
class MyStringProcessor(StringProcessor):

    @stringfilter
    def capitalize(self, string):
        return string.capitalize()

    @stringfilter
    def remove_double_spaces(self, string):
        return string.replace('  ', ' ')
</code>
</pre>

这两个`capitalize()`和`remove_double_spaces()`方法被装饰了, 所以当调用这个类的时候它们会被用来处理任何传给它们的字符串. 上一个类的简单例子如下:
<pre>
<code class="python">
&gt;&gt;&gt; import strproc
&gt;&gt;&gt; msp = strproc.MyStringProcessor()
&gt;&gt;&gt; input_string = "a test  string"
&gt;&gt;&gt; output_string = msp(input_string)
&gt;&gt;&gt; print("INPUT STRING:", input_string)
INPUT STRING: a test  string
&gt;&gt;&gt; print("OUTPUT STRING:", output_string)
OUTPUT STRING: A test string
&gt;&gt;&gt;
</code>
</pre>

就是这样!

<br>

## 最后的话

<br>
显然还有其他的方法达到完成这个任务, 这篇文章只是想给一个元类有什么好处的实际例子, 以及为什么我认为它们应该是任何 Python 程序员的兵工厂.

<br>

[更新] 在 [Redit](http://www.reddit.com/r/Python/comments/2jbi2f/advanced_use_of_python_decorators_and_metaclasses/) 和 Linkedin 上的一些开发者反对这篇文章, 主要是这个例子不是用元类也可以完美地应用以及元类的危险性质. 因为我尝试从每一个人学习, 所以我感谢他们的建议.

<br>

非常有趣的是知道一些开发者认为使用元类是一个很冒险的事, 因为它们隐藏了很多类的结构以及下底层机制. 这是对的, 所以(就像你对其他技术应该做的), 认真思考驱使你使用元类的原因并且保证你非常了解它们.

<br>

## 本书花絮

<br>

每小节的标题来自下列书籍: A Match Made in Space - George McFly, The Hitchhiker’s Guide To the Galaxy - Various Authors, The Anatomy of Purple Dragons - Unknown, The Dynamics of an Asteroid - James Moriarty.

<br>

## 源码

[strproc.py](http://lgiordani.com/downloads/code/metaclasses/strproc.py) 文件包含这篇文章中用到的所有源代码.

<br>

## 在线资源

<br>
下面的资源可能会有用:

<br>

### 元类

+ Python 3 的官方文档: [自定义类的创建](https://docs.python.org/3.4/reference/datamodel.html#customizing-class-creation)
+ [这篇博客](http://lgiordani.com/blog/2014/09/01/python-3-oop-part-5-metaclasses)的 Python 3 面向对象第五部分-元类
+ [元编程例子和模式](http://python-3-patterns-idioms-test.readthedocs.org/en/latest/Metaprogramming.html) (还是用的一些 Python 2 的代码但是很有用)

<br>

### 装饰器

+ [Bruce Eckel](http://www.artima.com/weblogs/viewpost.jsp?thread=240808) 关于装饰器(一系列的三篇文章, 6年前的了但仍然有效)
+ 解释装饰器的[一种不同的方法](http://simeonfranklin.com/blog/2012/jul/1/python-decorators-in-12-steps/)
+ [Jeff Knupp](http://www.jeffknupp.com/blog/2013/11/29/improve-your-python-decorators-explained/) 深入函数概念

<br>

### 可调用对象

+ [Rafe Kettler](http://www.rafekettler.com/magicmethods.html#callable) 提供了一个非常详细的关于 Python "魔法"方法的指南

<br>
