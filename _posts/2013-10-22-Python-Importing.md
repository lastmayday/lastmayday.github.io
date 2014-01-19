---
layout: default
title: Python Importing
tags: Python Import
---

[原文地址](http://blog.amir.rachum.com/post/63666832095/python-importing)

<br>
当你开始写一个非常基础的Python程序的时候, 通常做的第一件事是[导入一些你要用的包](http://www.dailymotion.com/video/xdcs17_seinfeld-importer-exporter_shortfilms).
导入包和模块的方法有很多-一些非常常见(可以在很多Python文件中见到), 而有些不太常见.
这篇文章会覆盖一些导入或载入模块的各种方法, 关于导入的惯例, import loops以及一些Python里关于导入的彩蛋.

<br>

## 备忘

<br>

<pre>
<code class="python">
import foo
import foo.bar
from foo import bar
from foo import bar, baz
from foo import *
from foo import bar as fizz
from .foo import bar
foo = __import__("foo")
reload(foo)
</code>
</pre>

<br>

## 不同的导入方法

<br>

`import foo`

这是最基本的Python导入方法. `import foo`语句查找一个叫`foo`的模型, 把它载入内存然后创建一个叫`foo`的模块对象
. 但是Python怎么知道去哪里找这个`foo`模块呢?

> 当一个叫`span`的模块被导入的时候, 解释器先寻找是否有内建的模块叫这个名字. 如果没有找到, 再寻找由变量`sys.path`给出的一系列目录下有没有叫`span.py`的文件. `sys.path`是由以下位置初始化的:

> + 这个脚本所在的目录(或当前目录)
> + `PYTHONPATH`(一系列的目录名称, 与shell变量`PATH`的语法一样)
> + 默认的安装依赖目录

<small>[来自文档](http://docs.python.org/2/tutorial/modules.html#the-module-search-path)</small>

<br>
你也可以通过`import foo, bar`在一行导入多个模块. 但是通常认为每行导入一个比较好.

<br>
`from foo import bar`

这句代码导入了`bar`, `bar`可以是这个模块里声明的任何东西. 它可以是一个函数, 一个类(可以是非常规命名的类)或者甚至是一个子模块(这个模块使得`foo`成为一个包). 注意, 如果`bar`是`foo`的一个子模块, 这个声明就会像我们简单地导入了`bar`一样(就像它在Python的搜索路径里一样). 这意味着, 创建了一个`bar`对象, 而且它的类型是`module`. 这句话不会创建一个`foo`对象.

<br>

`foo`的多个成员可以向下面这样一行导入:`from foo import bar, baz` 这句话意义非常直观: 它从模块`foo`中同时导入了`bar`和`baz`. `bar`和`baz`不一定是相同的类型: `baz`可能一个子模块而`bar`可能是一个函数, 等等. 不同于导入不相关的模块, 非常鼓励在同一行导入同一模块的内容.

<br>

`from foo import *`

有时候`foo`包含了太多的东西, 一个个手动导入它们太辛苦了. 这时就可以用`import *`一次导入所有东西.

<br>

**不要这样做, 除非你知道自己在做什么!**

<br>

`import *`

看上去比导入具体的成员方便得多, 但是这样写是不好的. 因为事实上你在"污染"你的全局命名空间. 假设你通过`import *`导入了一个包, 而在这个包里被谁不知不觉地写了如下的函数:
<pre>
<code>
def list():
    raise RuntimeError("I'm rubber, you're glue!")
</code>
</pre>

那么当你用`import *`的时候, 这个`list`定义会**覆盖**全局内建的`list`类型. 然后你就会得到非常非常出乎意料的错误.

<br>
所以最好知道你要导入的是什么的时候再这样做. 如果你从一个特定的包里导入了太多的成员, 你可以把它们聚合起来仅仅导入这个包本身(`import foo`)然后在每次使用的时候加上`foo`限定词.

<br>

`import *`一个很好的用法是[Django的配置文件结构](https://github.com/twoscoops/django-twoscoops-project/tree/develop/project_name/project_name/settings). 这很方便. 因为你正好想要用导入的设置来操纵全局命名空间.

<br>

`from foo import bar as fizz`

这句代码没有以上几句常见, 但是还是很有名. 这就像`from foo import bar`, 但不是创建了一个`bar`对象, 而是创建了一个同样含义的`fizz`模块. 使用这样的声明有两个原因: 一是当你要从两个不同的模块导入两个名字相同的对象时. 你可以使用`import as`来区别它们, 比方说:
<pre>
<code>
from xml import Parser as XmlParser
from json import Parser as JsonParser
</code>
</pre>

第二种情况我也见过几次, 就是, 当你导入一个名字很长的函数(或者类)的时候可以用它来简要地概括你的代码来缩短它的名字.

<br>

`from .foo import bar`

_好吧, 这个升级了_

这句代码对很多人来说相当少见, 因为他们完全没有意识到它. 声明中唯一的不同之处在于, 它为模块使用了一个修改过的搜索路径. 也就是说, 不是查找整个`PYTHONPATH`而是只查找这个导入文件所在的目录. 所以如果你有两个文件叫`fizz.py`和`foo.py`, 你可以在`fizz`中这样导入, 即使你的`PYTHONPATH`中有其他的`foo`模块, 它也会导入正确的文件.

<br>

这有什么好处呢? 有时候, 你创建了一些有着通用名称(比方说`common`)的模块, 但是你在你的项目中也有一个叫`common`的包. 除了换一个名称外, 你可以明确地导入那个离你最近的.

<br>

你也可以多放几个点然后使用这种方法从目录树的一个祖先中导入模块. 例如`from ..foo import Foo`将会查找上一级目录, `from ...foo import Foo`将会查找上两级目录, 等等.

<br>

`foo = __import__("foo")`

有没有想过你怎样才能动态导入一个模块? 就这样就行了. 显然你不会用一个明确的字符串, 而是一个某种类型的变量. 而且, 注意, 你不得不明确地把要导入的模块赋值给一个变量, 否则你将得不到这个模块的属性.

<br>

`reload(foo)`

这句代码就像你看到的一样. 它重载了`foo`模块. 当你开着一个控制台来调整代码而希望在不打断编译的情况下继续执行的时候, 这就会非常有用.

<br>

**注意:** 如果你使用了`from foo import bar`, 那么只`reload foo`来让`bar`更新是不够的. 你需要`reload foo`而且再一次调用`from foo import bar`.

<br>

## Import Loops

<br>

一个import loop可能会在你循环导入了两个或多个模块的时候发生. 例如: 在`foo.py`里你写了`from bar import Bar`而在`bar.py`里写了`from foo import Foo`, 那么你会得到一个import loop:

<pre markdown="1">
<code markdown="1">
Traceback (most recent call last):
    ...
ImportError: cannot import name Bar
</code>
</pre>

当这个发生的时候, 解决办法通常是把`foo.py`和`bar.py`中共同的对象转移到另外一个不同的文件中(例如`common.py`). 然而, 有时候这实际上是一个真正的循环依赖. 例如, `Bar`中的一个方法需要创建一个`Foo`实例而反过来`Foo`中的一个方法也需要一个`Bar`实例. 当这种依赖是在一个有限的范围内时, 你必须记住你可以在任何地方使用`import`命令. 把导入都放在文件的顶部是常见的惯例, 但是有时候你也可以通过在一个更小的范围内导入来解决import loops, 比方说在一个方法定义中.

<br>

## 彩蛋

<br>

如果你不自己试试的话又怎么会知道这是一个彩蛋? 试试这些, 玩得开心!

<pre>
<code>
import antigravity
import this
from __future__ import braces
import __hello__
from __future__ import barry_as_FLUFL
</code>
</pre>

<br>
