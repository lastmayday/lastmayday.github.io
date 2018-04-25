---
layout: default
title: Improve Your Python - Understanding Unit Testing
tags: ["Python", "Unit Testing"]
---

[原文地址](http://jeffknupp.com/blog/2013/12/09/improve-your-python-understanding-unit-testing/)



新手开发者很容易困惑的一个问题就是测试. 他们隐约知道"单元测试"是很好的事情而且他们应该这样做, 但是他们不明白这样做到底是为了什么. 如果你也是这样, 不要怕! 在这篇文章中, 我会解释`unit testing`是什么, 为什么它有用, 以及怎样`unit test`Python代码.



## 什么是测试?



在讨论 _为什么_ 测试很有用以及 _怎样_ 测试之前, 让我们先花几分钟看一下`unit testing`的真正定义是什么. "测试", 在一般的编程术语中, 是编写代码的惯例(不同于你真正的应用代码), 它包括的代码用来帮助检测是不是有错误. 它**不保证**代码是正确的(这只在非常严格的条件下有可能). 它只是报告测试者想到的条件是不是被正确处理了.




_注意: 当我使用"测试"这个词的时候, 我通常是指的"自动化测试", 也就是说测试是由机器来执行的. "手动测试", 也就是手动运行程序并与之交互来找bug, 是另外一个独立的话题._



在测试中, 有哪些东西可以被发现呢? **Syntax errors**(语法错误)是对语言无意的误用, 比方说在`my_list..append(foo)`中多余的`.`. **Logic errors**(逻辑错误)是在算法(可以被认为是"解决问题的方法")不正确的时候出现的. 也许程序员忘了Python是"从零开始索引"的而试着用`print(my_string[len(my_string)])`来打印出字符串的最后一个字符(这会抛出`IndexError`). 再大一点, 可以检查出更多的系统错误. 也许一个程序在用户输入大于`100`的数字时总是崩溃, 或者当它正在获取的网站不存在时被挂起.



这些错误都可以被代码中仔细的测试所捕获. `Unit testing`, 主要是用来隔离地测试单个的代码"单元". 一个`unit`可以是一个完整的模块, 单个类或者函数, 或者是这些中的任何东西. 更重要的是, 这些代码是独立于我们没有测试的代码的(否则这些没有测试的代码可能会有错误而导致测试结果有问题). 考虑下面的例子:

```python
def is_prime(number):
    """Return True if *number* is prime."""
    for element in range(number):
        if number % element == 0:
            return False

    return True

def print_next_prime(number):
    """Print the closest prime number larger than *number*."""
    index = number
    while True:
        index += 1
        if is_prime(index):
            print(index)
```



我们有两个函数, `is_prime`和`print_next_prime`. 如果我们想要测试`print_next_prime`, 我们需要先保证`is_prime`是正确的, 因为`print_next_prime`使用了它. 这样的话, `print_next_prime`函数是一个单元, `is_prime`是另外一个单元. 既然单元测试一次只测试一个**单独**的单元, 我们需要再仔细想想应该怎样正确地测试`print_next_prime`(更多关于这是怎么实现的内容会在后面讲解).



那么测试代码看起来是什么样呢? 如果之前的例子保存在`primes.py`的文件中, 我们可以在一个叫做`test_primes.py`的文件中写测试代码. 这是`test_primes.py`的最基本内容, 作为示例测试:

```python
import unittest
from primes import is_prime

class PrimesTestCase(unittest.TestCase):
    """Tests for `primes.py`."""

    def test_is_five_prime(self):
        """Is five successfully determined to be prime?"""
        self.assertTrue(is_prime(5))

if __name__ == '__main__':
    unittest.main()
```



这个文件用单个`test case`创建了一个单元测试: `test_is_five_prime`. 使用Python内置的`unittest`, 当`unittest.main()`被调用的时候, `unittest.TestCase`子类中的任何函数名是以`test`开头的函数都会被执行, 然后它的断言会被检查. 如果我们运行`python test_primes.py`来执行测试, 我们会看到`unittest`在控制台打印出的结果:
```python
$ python test_primes.py
E
======================================================================
ERROR: test_is_five_prime (__main__.PrimesTestCase)
----------------------------------------------------------------------
Traceback (most recent call last):
File "test_primes.py", line 8, in test_is_five_prime
    self.assertTrue(is_prime(5))
File "/home/jknupp/code/github_code/blug_private/primes.py", line 4, in is_prime
    if number % element == 0:
ZeroDivisionError: integer division or modulo by zero

----------------------------------------------------------------------
Ran 1 test in 0.000s
```


单个的"E"代表了我们单个测试的结果(如果成功的话会打印出一个"."). 我们可以看到我们的测试失败了, 有一行导致了失败并抛出了异常.



## 为什么要测试?



在我们继续之前的例子之前, 有一个问题很重要, 那就是"为什么测试值得我花时间?". 这是个好问题, 也是不熟悉测试的程序员经常会问的问题. 尽管如此, 如果不花时间测试的话更多时间就会花在写代码上, 那么测试不是很有效率的事情么?



这个问题有很多答案. 我列举了一些:



### 测试使得你的代码在一系列给定的条件下正确运行



在一系列基本的条件下测试可以保证正确性. 语法错误几乎可以肯定会被测试检查出来, 代码单元的基本逻辑也可以被测试来保证在特定条件下的正确性. 再一次, 测试并不保证 _在任何条件下_ 代码是正确的. 我们只是针对一些合理并且完整的可能条件(i.e. 你可以为调用`my_addition_function(3, 'refrigerator')`时会发生什么写一个测试, 但是你不必把参数可能的情况都测试一遍).



### 测试允许你保证修改代码并不会破坏已有的功能



这对重构代码尤其有用. 如果没有测试, 你不能保证你代码的改变没有破坏之前运行正常的代码功能. **如果你想改变或者重写你的代码并且知道你不要破坏任何东西, 适当的单元测试是很有必要的.**



### 测试强迫你在特殊的条件下思考代码, 这样可能暴露出一些逻辑错误



写测试可以强迫你思考你的代码可能遇到的不正常情况. 在上面的例子中, `my_addition_funcion` 加了两个数字. 一个简单的用来测试正确性的测试可能会调用`my_addition_function(2, 2)`并且断言结果是`4`. 更进一步测试, 可能通过运行`my_addition_function(2.0, 2.0)`来测试函数对浮点数是否正确. _防御性编码_ 原则建议你的代码必须能在输入错误的时候优雅地失败, 所以要测试当字符串被当作参数传给函数的时候是否能合适地抛出异常.



### 好的测试需要模块化, 解耦合的代码, 这是很好的系统设计的标志



单元测试的最佳实践对松散耦合的代码要容易得多. 如果你的应用代码有直接的数据库调用, 举个例子, 测试你应用的逻辑就取决于数据库的有效连接, 而且测试数据会展示在数据库中. 相反, 独立外部资源的代码, 可以很容易地使用 _模拟对象(mock objects)_ 来取代它们. 考虑到测试能力的应用设计通常会出于需要而模块化和松耦合.



## 剖析一个单元测试



接下来我们会继续之前的例子, 学习如何编写以及组织单元测试. 回想一下`primes.py`包含下面的代码:
```python
def is_prime(number):
    """Return True if *number* is prime."""
    for element in range(number):
        if number % element == 0:
            return False

    return True

def print_next_prime(number):
    """Print the closest prime number larger than *number*."""
    index = number
    while True:
        index += 1
        if is_prime(index):
            print(index)
```



同时`test_primes.py`包含下面的代码:

```python
import unittest
from primes import is_prime

class PrimesTestCase(unittest.TestCase):
    """Tests for `primes.py`."""

    def test_is_five_prime(self):
        """Is five successfully determined to be prime?"""
        self.assertTrue(is_prime(5))

if __name__ == '__main__':
    unittest.main()
```



## 作出断言



`unittest`是Python标准库的一部分, 也是我们开始单元测试的一个好地方. 一个单元测试由一个或多个 _断言(assertions, 断言被测试代码的某些属性是正确的声明)_ 组成. 想一下你读书的时候"assert"单词的理论解释, "陈述为事实". 这也是单元测试中断言所做的事情.



`self.assertTrue`就是字面意思, 它断言用传给它的参数计算结果是`True`. `unittest.TestCase`类包含很多[断言方法](http://docs.python.org/3/library/unittest.html#assert-methods), 所以一定要看一下方法列表并且为你的测试选择合适的方法. 使用`assertTrue`. 对每个测试都使用`assertTrue`可以被当作一种反模式, 因为它增加了阅读测试代码的认知负担. 合理的使用`assert`方法明确地陈述了什么是需要被测试断言的(e.g. 很明显`assertIsInstance`是在说仅仅通过方法名来判断它的参数).



每个测试都应该测试一个单独而且具体的代码属性, 并且根据属性命名. 为了被`unittest`的发现机制(对于Python 2.7+和3.2+)发现, 测试方法应该以`test_`(这是可以配置的, 但是这样做的目的是为了将测试方法与非测试的实用方法区别开)开头. 如果我们让`test_is_five_prime`重命名为`is_five_prime`, 那么执行`python test_primes.py`的时候会得到如下结果:
```python
$ python test_primes.py

----------------------------------------------------------------------
Ran 0 tests in 0.000s

OK
```



不要被上面输出结果的"OK"迷惑了. 只出现"OK"是因为实际上没有运行测试! 我认为运行0个测试应该输出错误结果, 但是把个人感觉放在一边, 你应该意识到这种行为, 尤其是当程序运行以及检查测试结果的时候(e.g. 使用像[TravisCI](http://travis-ci.org/)这样 _持续集成_ 的工具).



## 异常



返回`test_primers.py`的 _真正的_ 内容, 回想一下`python test_primes.py`的输出如下:

```python
$ python test_primes.py
E
======================================================================
ERROR: test_is_five_prime (__main__.PrimesTestCase)
----------------------------------------------------------------------
Traceback (most recent call last):
File "test_primes.py", line 8, in test_is_five_prime
    self.assertTrue(is_prime(5))
File "/home/jknupp/code/github_code/blug_private/primes.py", line 4, in is_prime
    if number % element == 0:
ZeroDivisionError: integer division or modulo by zero

----------------------------------------------------------------------
Ran 1 test in 0.000s
```



这个输出显示我们的测试失败了, **不是**因为一个断言失败而是因为一个没有被捕捉的异常抛出了. 事实上, `unittest`并没有得到运行测试的机会因为在返回之前就已经抛出了一个异常.



这里的问题很清楚, 我们将某个范围内的数作为取模运算的模数, 这些数里面也包括0, 这使得0成为了除数. 为了修复这个问题, 我们可以简单地把范围改成从`2`开始而不是从`0`开始, 任何数被`0`模都会报错而被`1`模都会为真(而且一个素数是只能被它本身和1整除的数, 所以我们不需要检查`1`).



## 修复问题



测试的失败使我们修改了代码. 一旦我们修复了这个错误(把`is_prime`中的那一行改为`for element in range(2, number):`), 我们得到了如下的输出:

```python
$ python test_primes.py
.
----------------------------------------------------------------------
Ran 1 test in 0.000s
```



现在错误已经被修复了, 这意味着我们应该删除测试方法`test_is_five_prime`(既然测试将会总是通过了)了吗? **不**. 单元测试应该很少被删除, 因为通过测试是最终的目标. 我们已经测试了`is_prime`的语法是正确的, 至少在这一个情况下, 它返回了合适的值. 我们的目标是构造了 _一套_ (一组逻辑的单元测试)可以通过的测试, 即使一开始可能会失败.



`test_is_five_prime`对于一个"非特殊"的素数是有用的. 让我们保证它对合数也有用. 把下面的方法添加到`PrimesTestCase`类中:
```python
def test_is_four_non_prime(self):
    """Is four correctly determined not to be prime?"""
    self.assertFalse(is_prime(4), msg='Four is not prime!')
```



注意这次我们对`assert`的调用添加了可选的参数`msg`. 如果这个测试失败了, 我们的信息就会被打印在控制台上, 把额外的信息显示给运行测试的人.



## 边缘情况



我们已经成功地测试了两个普通的情况. 现在让我们考虑下 _边缘情况_ , 或者有不正常或无法预料的输入. 当用某个范围内都是正整数的参数来测试的时候, 边缘情况就是`0`, `1`, 一个负数, 或者非常大的数字这样的情况. 现在让我们测试一下这些情况.



直接添加对0的测试. 我们期望`is_prime(0)`返回`False`, 因为根据定义, 素数必须大于1:

```python
def test_is_zero_not_prime(self):
    """Is zero correctly determined not to be prime?"""
    self.assertFalse(is_prime(0))
```



唉, 输出是这样的:

```python
python test_primes.py
..F
======================================================================
FAIL: test_is_zero_not_prime (__main__.PrimesTestCase)
Is zero correctly determined not to be prime?
----------------------------------------------------------------------
Traceback (most recent call last):
File "test_primes.py", line 17, in test_is_zero_not_prime
    self.assertFalse(is_prime(0))
AssertionError: True is not false

----------------------------------------------------------------------
Ran 3 tests in 0.000s

FAILED (failures=1)
```



0被不正确地判断为素数. 我们忘了决定在`range`中跳过对`0`的检查. 让我们对0和1加一个特殊的检查:
```python
def is_prime(number):
    """Return True if *number* is prime."""
    if number in (0, 1):
        return False

    for element in range(2, number):
        if number % element == 0:
            return False

    return True
```



测试现在通过了. 那如果处理负数的话我们的函数会发生什么? _在写测试之前_ 知道输出 _应该_ 是什么是很重要的. 这种情况下, 任何负数都应该返回`False`:
```python
def test_negative_number(self):
    """Is a negative number correctly determined not to be prime?"""
    for index in range(-1, -10, -1):
        self.assertFalse(is_prime(index))
```



这里, 我们决定检查`-1`到`-9`的数. 用一个循环来调用测试方法是非常合理的, 这样可以在一个单一的测试中多次调用断言方法. 我们用下面(更详细)的方式重写:
```python
def test_negative_number(self):
    """Is a negative number correctly determined not to be prime?"""
    self.assertFalse(is_prime(-1))
    self.assertFalse(is_prime(-2))
    self.assertFalse(is_prime(-3))
    self.assertFalse(is_prime(-4))
    self.assertFalse(is_prime(-5))
    self.assertFalse(is_prime(-6))
    self.assertFalse(is_prime(-7))
    self.assertFalse(is_prime(-8))
    self.assertFalse(is_prime(-9))
```



这两者是等价的. 除了当我们运行循环的那个版本时, 我们会得到更少的信息:
```python
python test_primes.py
...F
======================================================================
FAIL: test_negative_number (__main__.PrimesTestCase)
Is a negative number correctly determined not to be prime?
----------------------------------------------------------------------
Traceback (most recent call last):
File "test_primes.py", line 22, in test_negative_number
    self.assertFalse(is_prime(index))
AssertionError: True is not false

----------------------------------------------------------------------
Ran 4 tests in 0.000s

FAILED (failures=1)
```



呃, 我们知道测试失败了, _但是是在哪个负数失败的呢_ ? 而无助的是, Python的`unittest`并没有打印出 _期望_ 的值和 _实际_ 的值. 我们可以用两种方法来一步步解决这个问题: 通过`msg`参数或者使用第三方的测试工具.



对`assertFalse`使用`msg`参数, 我们意识到可以使用字符串格式化来解决问题:
```python
def test_negative_number(self):
    """Is a negative number correctly determined not to be prime?"""
    for index in range(-1, -10, -1):
        self.assertFalse(is_prime(index), msg='{} should not be determined to be prime'.format(index))
```



这样会有如下的输出:

```python
python test_primes
...F
======================================================================
FAIL: test_negative_number (test_primes.PrimesTestCase)
Is a negative number correctly determined not to be prime?
----------------------------------------------------------------------
Traceback (most recent call last):
File "./test_primes.py", line 22, in test_negative_number
    self.assertFalse(is_prime(index), msg='{} should not be determined to be prime'.format(index))
AssertionError: True is not false : -1 should not be determined to be prime

----------------------------------------------------------------------
Ran 4 tests in 0.000s

FAILED (failures=1)
```



## _合理地_ 修复代码



我们看到失败的负数是第一个测试:`-1`. 为了修复这个问题, 我们对负数增加一个特殊的检查, 但是写单元测试的目的不是盲目地增加代码来检查边缘情况. 当一个测试失败了, 回退一步并且决定修复问题的 _最好_ 方法. 这种情况下, 相比与增加额外的`if`:
```python
def is_prime(number):
    """Return True if *number* is prime."""
    if number < 0:
        return False

    if number in (0, 1):
        return False

    for element in range(2, number):
        if number % element == 0:
            return False

    return True
```



下面的应该会更好:
```python
def is_prime(number):
    """Return True if *number* is prime."""
    if number <= 1:
        return False

    for element in range(2, number):
        if number % element == 0:
            return False

    return True
```



后者中, 我们注意到两个`if`语句可以被合并为一个如果参数小于1就返回`False`的语句. 这既更加简洁也合适地符合了素数的定义(一个 _大于1_ 并且只能被1和它自身整除的数).



## 第三方的测试框架



我们也可以使用第三方的测试框架来解决测试失败的信息太少的问题. 两个最常用的测试框架是[py.test](http://pytest.org/)和[nose](http://nose.readthedocs.org/). 使用`py.test -l`(`-l` "显示局部变量的值")来运行我们的测试可以得到下面的结果:
```python
#! bash

py.test -l test_primes.py
============================= test session starts ==============================
platform linux2 -- Python 2.7.6 -- pytest-2.4.2
collected 4 items

test_primes.py ...F

=================================== FAILURES ===================================
_____________________ PrimesTestCase.test_negative_number ______________________

self = <test_primes.PrimesTestCase testMethod=test_negative_number>

    def test_negative_number(self):
        """Is a negative number correctly determined not to be prime?"""
        for index in range(-1, -10, -1):
>           self.assertFalse(is_prime(index))
E           AssertionError: True is not false

index      = -1
self       = <test_primes.PrimesTestCase testMethod=test_negative_number>

test_primes.py:22: AssertionError
```



就像你看到的这样, 更加有用了. 这些框架提供了更多的功能, 不止更详细的输出, 但重点是要意识到有这些框架并且扩展内置的`unittest`包的功能.



## 结束语



在这篇文章中, 你知道了单元测试是 _什么_ , _为什么_ 它们很重要, 以及 _怎样_ 编写它们. 也就是说, 我们只是了解了测试方法的表层. 更高级的话题例如 _组织测试用例_ , _持续集成_ , 以及 _管理测试用例_ 都是很好的话题, 如果你对深入学习Python测试有兴趣的话.
