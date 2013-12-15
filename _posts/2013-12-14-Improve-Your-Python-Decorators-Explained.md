---
layout: default
title: Improve Your Python - Decorators Explained
---

[原文地址](http://www.jeffknupp.com/blog/2013/11/29/improve-your-python-decorators-explained/)

<br>

我之前写了一篇关于["yield"和生成器](http://www.jeffknupp.com/blog/2013/04/07/improve-your-python-yield-and-generators-explained/)的文章. 在那篇文章中, 我提到了这是一个初学者会感到困惑的话题. **装饰器**是另外一个会让人困惑的话题(但是使用装饰器相当简单). 在这篇文章中, 你会学到装饰器是什么, 它们是怎么生成的, 以及为什么它们很有用.

<br>

## 简要的基本知识

<br>

### 传递函数

<br>

在我们开始之前, 回想一下, Python中的 _任何_ 东西都是一个对象, 可以被当作一个值看待(例如函数, 类, 模块). 你可以给这些对象绑定名字, 然后像参数一样把它们传给函数, 并且(和其他东西一起)从函数返回它们. 下面的代码演示了我正在说的内容:
<pre>
<code class="python">
def is_even(value):
    """Return True if *value* is even."""
    return (value % 2) == 0

def count_occurrences(target_list, predicate):
    """Return the number of times applying the callable *predicate* to a
    list element returns True."""
    return sum([1 for e in target_list if predicate(e)])

my_predicate = is_even
my_list = [2, 4, 6, 7, 9, 11]
result = count_occurrences(my_list, my_predicate)
print(result)
</code>
</pre>

<br>

我们写了一个函数, 这个函数的参数为一个列表和另外一个函数(这个函数正好是 _predicate function_ , 也就是说这个函数基于传给它的参数的某个属性而返回True或者False), 并且返回我们的predicate function对列表中的元素返回True的次数. 如果有内置的函数来完成这个工作的话, 对说明目的很有用.

<br>

神奇的一行是`my_predicate = is_even`. 我们把名字`my_predicate`绑定到了函数自身(而不是调用函数时函数的返回值)并像使用任何"正常"的变量一样使用它. 把它传给`count_occurences`使得`count_occurences`可以把这个函数用到列表的元素上, 即使它并不"知道"`my_predicate`究竟做了什么. 它只是假设这是个有一个参数并且可以被调用的函数, 这个函数返回True或False.

<br>

希望你对这些已经很熟悉了. 如果, 这是你第一次看见这样使用函数, 我推荐你读一下[Drastically Improve Your Python: Understanding Python's Execution Model](http://www.jeffknupp.com/blog/2013/02/14/drastically-improve-your-python-understanding-pythons-execution-model/)再继续.

<br>

## 返回函数

<br>

我们刚刚看见函数可以像参数一样被传递给其他函数. 它们也可以像返回值一样从其他函数 _返回_ . 下面的例子论证了这有什么用:
<pre>
<code class="python">
def surround_with(surrounding):
    """Return a function that takes a single argument and."""
    def surround_with_value(word):
        return '{}{}{}'.format(surrounding, word, surrounding)
    return surround_with_value

def transform_words(content, targets, transform):
    """Return a string based on *content* but with each occurrence 
    of words in *targets* replaced with
    the result of applying *transform* to it."""
    result = ''
    for word in content.split():
        if word in targets:
            result += ' {}'.format(transform(word))
        else:
            result += ' {}'.format(word)
    return result

markdown_string = 'My name is Jeff Knupp and I like Python but I do not own a Python'
markdown_string_italicized = transform_words(markdown_string, ['Python', 'Jeff'],
        surround_with('*'))
print(markdown_string_italicized)
</code>
</pre>

<br>

`transform_words`函数的目的是搜索`content`, 找到是否有单词在`targets`中出现, 如果有的话就对这个单词使用`transform`参数. 在我们的例子中, 我们假设有一个Markdown字符串, 并且需要在所有出现的`Python`或`Jeff`单词用斜体表示(在Markdown的语法中, 如果一个词被星号包围则会被斜体化).

<br>

这里我们使用了函数可以作为另一个函数的返回值这个事实. 在这个过程中, 我们创建了一个 _新_ 函数, 一旦这个函数被调用, 就前置和附加给定的参数. 然后我们把这个新函数当作一个参数传给`transform_word`, 在`transform_word`中新函数就会被用到我们搜索列表的单词上: (`['Python', 'Jeff']`).

<br>

你可以把`surround_with`想象成一个小型的函数"工厂". 它就在那里等着产生一个函数. 你给它一个值, 然后它返回你一个函数, 这个函数将会被你给它的那个值包围. 理解这里发生了什么是理解装饰器的关键. 我们的"函数工厂"并没有 _真正_ 地返回一个"正常"的值; 它只是返回了一个新的函数. 注意`surround_with`也没有真正地包围它本身, 它只是创建了一个当需要的时候就可以使用的函数.

<br>

`surround_with_value`的原理是, 嵌套函数可以访问绑定在创建它们的范围内的名称. 因此, `surround_with_value`并不需要任何特殊的操作来访问`surrounding`(否则就违背了目的). 它简单地"知道"在需要的时候它可以访问并且使用`surrounding`.

<br>

## 把上面讲的东西总结在一起

<br>

我们已经看见了函数既可以被作为参数传递给其他的函数, 又可以作为其他函数的返回值. 那如果我们把这些整合在一起会怎样呢? 我们可以创建一个函数, 这个函数接受一个函数作为参数并且返回一个函数吗. 这会有用吗?

<br>

这当然有用. 假设我们正在使用一个web框架并且有很多货币相关的模块, 比方说`price`, `cart_subtotal`, `saving`等等. 理想情况下, 我们在输出这些之前会在前面添加一个"$". 如果我们可以通过某种方法使得函数可以这样生成值的话将会很棒.

<br>

这正好就是装饰器做的事情. 下面的函数用来显示计算了`tax`之后的`price`.
<pre>
<code class="python">
class Product(db.Model):

    name = db.StringColumn
    price = db.FloatColumn

    def price_with_tax(self, tax_rate_percentage):
        """Return the price with *tax_rate_percentage* applied.
        *tax_rate_percentage* is the tax rate expressed as a float, like
        "7.0" for a 7% tax rate."""
        return price * (1 + (tax_rate_percentage * .01))
</code>
</pre>

<br>

怎么增强这个函数使得它可以返回带有"$"前缀的值? 我们创建了一个装饰器函数, 它有个很有用的简化符号: `@`. 为了生成我们的装饰器函数, 我们创建了一个函数, 这个函数接受一个函数(这个函数会被装饰)作为参数并且返回一个新的函数(被装饰过后的原函数). 下面是怎样在我们的应用中使用:
<pre>
<code class="python">
def currency(f):
    def wrapper(*args, **kwargs):
        return '$' + str(f(*args, **kwargs))

    return wrapper
</code>
</pre>

<br>

在`wrapper`函数中使用`args`和`*kwargs`作为参数, 这样使得它更加灵活. 既然我们不知道我们要包裹的函数有那些参数(`wrapper`需要调用这个函数), 我们就接受所有可能的位置(*args)和关键字(**args)作为参数然后把它们传给函数调用.

<br>

`currency`定义之后, 我们现在可以使用装饰器符号来装饰我们的`price_with_tax`函数:
<pre>
<code class="python">
class Product(db.Model):

    name = db.StringColumn
    price = db.FloatColumn

    @currency
    def price_with_tax(self, tax_rate_percentage):
        """Return the price with *tax_rate_percentage* applied.
        *tax_rate_percentage* is the tax rate expressed as a float, like "7.0"
        for a 7% tax rate."""
        return price * (1 + (tax_rate_percentage * .01))
</code>
</pre>

<br>

现在, 对于其他的代码, 看上去好像`price_with_tax`是一个返回税后价格并且带有美元符号前缀的函数. 注意, 我们并没有改变`price_with_tax`内部的任何代码而达到了这样的效果. 我们只是用一个装饰器"装饰"了这个函数, 给了它额外的功能.

<br>

### 另外的介绍

<br>

有一个问题是用`currency`包裹`price_with_tax`而导致它自己的`__name__`和`__doc__`成了`currency`的, 这当让不是我们想要的. `functools`模块有很多有用的工具, `wraps`会恢复我们期望的这些值. 这样使用它:
<pre>
<code class="python">
from functools import wraps

def currency(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        return '$' + str(f(*args, **kwargs))

    return wrapper
</code>
</pre>

<br>

## 原动力

<br>

不用改变这个函数的代码, 只通过包裹这个函数就可以使用额外的功能, 这个概念真是 _极其_ 有力和有用. 装饰器可以省掉很多样板代码或者做到没有装饰器就不可能做到的事情. 装饰器也可以作为框架和库提供功能的便捷方法. [Flask](http://flaks.pocoo.org/)使用装饰器来给web应用添加新的路由, 就像文档中的这个例子:
<pre>
<code class="python">
@app.route('/')
def hello_world():
    return 'Hello World!'
</code>
</pre>

<br>

注意装饰器(它们本身也是函数)可以接受参数. 我会保留装饰器参数, 以及类装饰器, 作为这个系列的下一篇文章.

<br>

## 快结束了

<br>

今天我们 _使用_ 我们操纵的语言(i.e.Python)学习了装饰器是怎么用处理语言的(很像C的宏). 装饰器有非常强大的应用, 我们会在下一篇文章中探讨. 现在, 你应该对装饰器是怎么生存并使用的有了扎实的了解. 更重要的是, 你应该知道了装饰器是怎么工作的, 以及什么时候装饰器会有用.

<br>
