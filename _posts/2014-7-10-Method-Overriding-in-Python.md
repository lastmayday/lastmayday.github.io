---
layout: default
title: Method Overriding in Python
tags: Python
---

[原文地址](http://lgiordani.com/blog/2014/05/19/method-overriding-in-python/)

<br>

什么是重载? 重载是类的一种能力, 它可以改变由它的祖先提供的方法的应用.

<br>

重载是面向对象中非常重要的一部分, 因为它可以利用继承的全部力量. 尽管重载类的一个方法可能"复制"另一个类, 但是可以避免重复的代码, 同时也提高或者定制了类的一部分. 方法重载是继承机制的严格的一部分.

<br>

## 继承一瞥

<br>

对于大部分的面向对象语言, Python继承的工作方式是通过隐式委托: 当一个对象不能满足某个请求的时候, 它首先尝试去找它的祖先, 在多重继承的情况下遵循特定语言下的规则.

<br>

一个例子:
<pre>
<code class="python">
class Parent(object):
    def __init__(self):
        self.value = 5

    def get_value(self):
        return self.value

class Child(Parent):
    pass
</code>
</pre>

<br>

可以看到`Child`类是空的, 单色因为它继承自`Parent`, Python负责路由所有方法的调用. 所以你可以使用`Child`对象的`get_value()`方法并且一切都会如期执行.
<pre>
<code class="python">
&gt;&gt;&gt; c = Child()
&gt;&gt;&gt; c.get_value()
5
</code>
</pre>

<br>

准确地说`get_value()`并不是`Child`类的一部分, 它与我们在`Child`类中定义的不一样.
<pre>
<code class="python">
&gt;&gt;&gt; p = Parent()
&gt;&gt;&gt; c = Child()
&gt;&gt;&gt;
&gt;&gt;&gt; dir(p)
['__class__', '__delattr__', '__dict__', '__doc__', '__format__',
 '__getattribute__', '__hash__', '__init__', '__module__', '__new__',
 '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__',
 '__str__', '__subclasshook__', '__weakref__', 'get_value', 'value']
&gt;&gt;&gt;
&gt;&gt;&gt; dir(c)
['__class__', '__delattr__', '__dict__', '__doc__', '__format__',
 '__getattribute__', '__hash__', '__init__', '__module__', '__new__',
 '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__',
 '__str__', '__subclasshook__', '__weakref__', 'get_value', 'value']
&gt;&gt;&gt;
&gt;&gt;&gt; dir(Parent)
['__class__', '__delattr__', '__dict__', '__doc__', '__format__',
 '__getattribute__', '__hash__', '__init__', '__module__', '__new__',
 '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__',
 '__str__', '__subclasshook__', '__weakref__', 'get_value']
&gt;&gt;&gt;
&gt;&gt;&gt; dir(Child)
['__class__', '__delattr__', '__dict__', '__doc__', '__format__',
 '__getattribute__', '__hash__', '__init__', '__module__', '__new__',
 '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__',
 '__str__', '__subclasshook__', '__weakref__', 'get_value']
&gt;&gt;&gt;
&gt;&gt;&gt; Parent.__dict__
dict_proxy({'__module__': '__main__',
            'get_value': &lt;function get_value at 0xb69a656c&gt;,
            '__dict__': &lt;attribute '__dict__' of 'Parent' objects&gt;,
            '__weakref__': &lt;attribute '__weakref__' of 'Parent' objects&gt;,
            '__doc__': None,
            '__init__': &lt;function __init__ at 0xb69a6534&gt;})
&gt;&gt;&gt;
&gt;&gt;&gt; Child.__dict__
dict_proxy({'__module__': '__main__', '__doc__': None})
</code>
</pre>

<br>

这显示了`Child`类并没有真正包含`get_value()`方法, 并且这种自动委托的机制执行了. 想再看看关于这种机制的内容的话请阅读[这篇文章](http://lgiordani.com/blog/2014/03/05/oop-concepts-in-python-2-dot-x-part-1/).

<br>

## 方法重载实战

<br>

Python的方法重载简单地表现为, 在子类中用与父类中相同的名字重新定义这个方法. 当你在对象中定义一个方法的时候, 你使得后者能够满足这个方法调用, 所以并没有调用它的祖先的方法实现.
<pre>
<code class="python">
class Parent(object):
    def __init__(self):
        self.value = 5

    def get_value(self):
        return self.value

class Child(Parent):
    def get_value(self):
        return self.value + 1
</code>
</pre>

<br>

现在`Child`对象表现不同了:
<pre>
<code class="python">
&gt;&gt;&gt; c = Child()
&gt;&gt;&gt; c.get_value()
6
</code>
</pre>

<br>

让我们看一下类的内部有哪些不同
<pre>
<code class="python">
&gt;&gt;&gt; Parent.__dict__
dict_proxy({'__module__': '__main__',
            'get_value': &lt;function get_value at 0xb69a656c&gt;,
            '__dict__': &lt;attribute '__dict__' of 'Parent' objects&gt;,
            '__weakref__': &lt;attribute '__weakref__' of 'Parent' objects&gt;,
            '__doc__': None,
            '__init__': &lt;function __init__ at 0xb69a6534&gt;})
&gt;&gt;&gt;
&gt;&gt;&gt; Child.__dict__
dict_proxy({'__module__': '__main__',
            'get_value': &lt;function get_value at 0xb69a65a4&gt;,
            '__doc__': None})
</code>
</pre>

<br>

现在`Child`类真正包含了一个有着不同行为的`get_value()`方法(两个函数的 id 不一样).

<br>

这在 Python 中非常重要. 继承授权自动发生, 但是如果一个方法被重载了, 那么它祖先的实现压根就没有被考虑. 所以, 如果你想要执行你的类的祖先的一个或者多个实现, 你就需要明确地调用它们.

<br>

为什么你应该调用类层次中更深层次的对象实现?

<br>

你可能想要调用它因为很多时候你重载一个方法来增强它的性质是为了提高结果的"质量", 而且为了提高某种东西, 你首先需要能访问到它. 因此, 通过调用原始的实现, 你可以得到之后想要提高的结果.

<br>

然而, 这里有一个明确的理由为什么**你应该总是调用原始的实现**. 这个原因可以被叫做"隐藏的副作用".
<br>

当你继承一个类, 你实际上继承了一整个类的层次结构, 而这个层次结构是(或者被认为是)不知道的. 这意味着, 任何方法调用都可能会隐藏整个类层次中的一组复杂操作, 而它们中的一些可能对你在使用的库或框架非常重要.

<br>

Python 使你明确地调用一个被重载的方法的原始实现(和其他面向对象的语言一样). 这确实是遵循了 Python 的观点"Explicit is better than implicit"([The Zen of Python](http://legacy.python.org/dev/peps/pep-0020/)), 但是这个建议不止是一个品味问题或者是某种编程的怪癖.

<br>

当你重载的时候需要思考你是否想要过滤原始实现的参数, 是否想要过滤它的结果, 或者都是. 如果你想改变父类实现会处理的数据的话, 通常想要过滤参数(pre-filter); 如果想要添加一个额外的处理层的话, 你会过滤结果(post-filter). 显然这些也可以一起在同一个方法里完成. 既然你不得不明确地调用父类实现, 你可以自由选择在新方法的哪儿做这些事情: 你想要实现的过滤类型的决定影响到这个调用的位置.

<br>

### pre-filtering 的一个例子

<pre>
<code class="python">
import datetime

class Logger(object):
    def log(self, message):
        print message

class TimestampLogger(Logger):
    def log(self, message):
        message = "{ts} {msg}".format(ts=datetime.datetime.now().isoformat(),
                                      msg=message)
        super(TimestampLogger, self).log(message)
</code>
</pre>

<br>

在调用原始的`log()`方法之前, `TimestampLogger`对象给消息字符串增加了一些信息.

<pre>
<code class="python">%
&gt;&gt;&gt; l = Logger()
&gt;&gt;&gt; l.log('hi!')
hi!
&gt;&gt;&gt;
&gt;&gt;&gt; t = TimestampLogger()
&gt;&gt;&gt; t.log('hi!')
2014-05-19T13:18:53.402123 hi!
&gt;&gt;&gt;
</code>
</pre>

<br>

### post-filtering 的一个例子

<pre>
<code class="python">
import os

class FileCat(object):
    def cat(self, filepath):
        f = file(filepath)
        lines = f.readlines()
        f.close()
        return lines

class FileCatNoEmpty(FileCat):
    def cat(self, filepath):
        lines = super(FileCatNoEmpty, self).cat(filepath)
        nonempty_lines = [l for l in lines if l != '\n']
        return nonempty_lines
</code>
</pre>

<br>

当你使用`FileCatNoEmpty`对象的时候, 你就得到了去掉了空白行的`FileCat`对象的结果.

<br>

可以看到在第一个例子中, 原始实现被作为最后一件事情调用, 而在第二个例子中它被第一个调用. 这就是原始方法的调用没有固定位置的原因, 它取决于你想做什么.

<br>

## 总是调用`super()`?

<br>

我们需要 _总是_ 调用原始方法的实现吗? 理论上一个设计得很好的 API 必须使得我们总是可以调用原始方法, 但是我们知道存在边界情况: 原始方法可能有你想要避免的副作用, 而且有时候 API 不能被重构来避免这些副作用. 在这样的情况下, 你可能更愿意跳过这些方法的原始实现; Python 并没有强制规定, 所以随便做吧只要你觉得某种情况需要这么做. 确保你自己知道自己在做什么, 而且, 把你为什么要完全重载这个方法写成文档.

<br>

## 总结

<br>

+ 无论什么时候, 只要有可能就要调用你正在重载的方法的原始调用. 这使得相关的 API 正常工作. 当确实需要跳过调用的时候, 一定要把原因写成文档.
+ 总是在 Python 2.x 中使用`super(cls, self)`或者在 Python 3.x 中使用`super()`来调用这个方法的原始实现. 这样尊重了多重继承的解析顺序, 并且在 Python 3.x 中, 防止了类层次的改变.
+ 如果你调用一个方法的原始实现, 那么只要拥有所有需要执行的数据就立刻调用这个方法.

<br>

