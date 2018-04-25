---
layout: default
title: Python 201-Properties
tags: Python
---

[原文地址](http://www.blog.pythonlibrary.org/2014/01/20/python-201-properties/)



Python有一个整洁的小概念叫做**property**, property可以做很多有用的事情. 在这篇文章里, 我们将会看到怎样做如下的事情:

+ 把类方法转变成只读的属性
+ 重新实现setters和getters为一个属性



## 开始



使用property最简单的方法是把它作为某个类方法的装饰器. 这允许你把一个类方法变成一个类属性. 我发现当我需要联合一些值的时候这个方法很有用. 让我们看一个简单的例子:

```python
class Person(object):

    def __init__(self, first_name, last_name):
        """Constructor"""
        self.first_name = first_name
        self.last_name = last_name

    @property
    def full_name(self):
        """
        Return the full name
        """
        return "%s %s" % (self.first_name, self.last_name)
```

在上面的代码中, 我们创建了两个类属性: `self.first_name` 和 `self.last_name`. 接着我们创建了一个`full_name`方法, 这个方法有一个`@property`装饰器. 这允许我们在一个解释器会话中这样做:

```python
>>> person = Person("Mike", "Driscoll")
>>> person.full_name
'Mike Driscoll'
>>> person.first_name
'Mike'
>>> person.full_name = "Jackalope"
Traceback (most recent call last):
  File "&lt;string>>>", line 1, in &lt;fragment>>>
AttributeError: can't set attribute
```

你可以看到, 因为我们把这个方法变成了一个熟悉, 我们可以用正常的点符号来取得它. 然而, 如果我们尝试把这个属性设置成其他的东西, 我们会导致一个`AttributeError`被抛出. 唯一能改变`full_name`属性的方法是这样直接做:

```python
>>> person.first_name = "Dan"
>>> person.full_name
'Dan Driscoll'
```

这是一种限制, 所以让我们看看另一个例子, 这个例子中我们可以让propery**确实**允许我们设置值.



## 用Python的property代替setters和getters



假设我们有一些遗留代码, 而写这些代码的人对Python掌握得并不是很好. 如果你跟我一样, 你之前可能已经见到过这种代码:

```python
from decimal import Decimal

class Fees(object):

    def __init__(self):
        """Constructor"""
        self._fee = None

    def get_fee(self):
        """
        Return the current fee
        """
        return self._fee

    def set_fee(self, value):
        """
        Set the fee
        """
        if isinstance(value, str):
            self._fee = Decimal(value)
        elif isinstance(value, Decimal):
            self._fee = value
```

为了使用这个类, 我们不得不使用定义过的setters和getters:

```python
>>> f = Fees()
>>> f.set_fee("1")
>>> f.get_fee()
Decimal('1')
```

如果你希望使用正常的点符号来获取这段代码的属性, 而不破坏这段代码的所有应用, 你可以简单地添加一个property:

```python
from decimal import Decimal

class Fees(object):

    def __init__(self):
        """Constructor"""
        self._fee = None

    def get_fee(self):
        """
        Return the current fee
        """
        return self._fee

    def set_fee(self, value):
        """
        Set the fee
        """
        if isinstance(value, str):
            self._fee = Decimal(value)
        elif isinstance(value, Decimal):
            self._fee = value

    fee = property(get_fee, set_fee)
```

我们在代码的最后加了一行代码. 现在我们可以这样做了:

```python
>>> f = Fees()
>>> f.set_fee("1")
>>> f.fee
Decimal('1')
>>> f.fee = "2"
>>> f.get_fee()
Decimal('2')
```

你可以看到, 当我们这样使用`property`的时候, 它允许`fee`属性设置和获取值, 而不破坏这段遗留代码. 让我们用property装饰器重写这段代码, 然后看看我们是否可以让它允许设置.

```python
from decimal import Decimal

class Fees(object):

    def __init__(self):
        """Constructor"""
        self._fee = None

    @property
    def fee(self):
        """
        The fee property - the getter
        """
        return self._fee

    @fee.setter
    def fee(self, value):
        """
        The setter of the fee property
        """
        if isinstance(value, str):
            self._fee = Decimal(value)
        elif isinstance(value, Decimal):
            self._fee = value

if __name__ == "__main__":
    f = Fees()
```

上面的代码示例了怎样给`fee`属性创建一个`setter`. 你可以通过用叫做`@fee.setter`的装饰器来装饰一个也叫做`fee`的第二方法. 当你这样做的时候这个setter会被调用:

```python
>>> f = Fees()
>>> f.fee = "1"
```

如果你看一下`property`的参数, 会发现它有`fget`, `fset`, `fdel`以及`doc`. 如果你想捕获这个属性的`del`命令的话, 可以使用同一个名字创建另一个被`@fee.deleter`装饰的方法来对应一个删除方法.



## 结束语



现在你知道怎么在你自己的类中使用Python的properties了. 希望你可以在自己的代码中发现更多有用的方式.



## 额外阅读

+ [Getters and setter in Python](http://eli.thegreenplace.net/2009/02/06/getters-and-setters-in-python/)
+ Official Python [documentation on property](http://docs.python.org/2/library/functions.html#property)
+ A discussion on adding docstrings to a Python property on [StackOverflow](https://stackoverflow.com/questions/16025462/what-is-the-right-way-to-put-a-docstring-on-python-property)
