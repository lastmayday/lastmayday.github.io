---
layout: default
title: Improve Your Python - 'yield' and Generators Explained
---

[原文地址](http://www.jeffknupp.com/blog/2013/04/07/improve-your-python-yield-and-generators-explained/)

<br>

在辅导课程开始之前, 我叫新生填了一个简单的自评, 这个自评让他们自己评价自己对于各种Python概念的理解. 一些话题("用if/else控制流程"或者"定义并使用函数")在开课之前可以被大多数学生理解. 然而也有少数话题, 绝大多数学生报告说完全不知道或者知道得很少. 在这些话题当中, "`generators`和`yield`关键字"是罪魁祸首之一. 我猜这个情况对于_大多数_Python初学者都适用.

<br>

很多学生反馈说理解`generators`和`yield`关键字有困难, 即使已经很努力地让他们自己理解这个话题. 我想改变这种情况. 在这篇文章中, 我会解释`yield`关键字是_什么_, 它_为什么_有用, 以及_怎样_使用它.

<br>

注意: _最近几年, 生成器已经成长得更加强大, 就像那些已经通过PEP添加的特性一样. 在我的下一篇文章里, 我会通过协程, 协同多任务处理和异步I/O(尤其是它们在GvR(Guido van Rossum)正在做的["tulip"](https://code.google.com/p/tulip/)中的原型实现)探索`yield`的真正力量. 但是在这之前, 我们需要透彻地了解`yield`和`generators`是怎样工作的._

<br>

## 协程和子程序

<br>

当我们调用一个正常的Python函数的时候, 从函数的第一行开始执行并持续到一个`return`语句, `exception`或者函数结尾(可以看作隐式的`return None`). 一旦一个函数把控制权交还给了它的调用者, 函数执行过程就结束了. 函数做的所有工作以及局部变量所存储的东西都没有了. 一个新的函数调用将完全重头开始建立一切.

<br>

当在计算机编程中讨论函数(更普遍地说是[子程序](http://en.wikipedia.org/wiki/Subroutine))的时候这是非常标准的. 但也有时, 如果能够创建一个"函数", 这个函数并不是简单地返回一个值, 而是可以生成一系列的值, 那么也是有益的. 为了达到这个目的, 可以说这样的函数需要可以"保存它的工作".

<br>

我说, "生成一系列的值"因为我们的假想函数并不以常规思维"返回". `return`意味着这个函数把_执行权限返回_给了这个函数调用的地方. 但是"yield"意味着_执行权的转换是暂时的并且自愿的_, 而且我们的函数期望在未来再一次得到执行权.

<br>

在Python中, 有着这些能力的"函数"就叫做`generators`(生成器), 而且生成器相当有用. `generators`(以及`yield`语句)最初是为了给程序员一种更加直接的方法来写出能够产生一系列值的代码. 先前, 想要生成比方说一个随机数产生器的东西需要一个类或者一个模块, 这个类/模块需要既能够生成值又能够在很多调用之间保存状态. 随着`generators`的引入, 这变得简单的多了.

<br>

为了更好地理解`generators`解决的问题, 让我们看一个例子. 通过这个例子, 记住解决的核心问题: 生成一系列的值.

<br>

注意: _在Python之外, 所有但除了最简单的`generators`都被称为`coroutines`(协程). 我会在这篇文章的后面使用后者.需要记住的重要事情是, 在Python里, 每个被描述成一个`coroutine`的仍然是一个`generator`. Python正式地定义了`generator`; `coroutine`被用于讨论但是没有正式的定义._

<br>

## 例子: 素数的乐趣

<br>

假定我们的BOSS要求我们写一个函数, 这个函数接受一个整数列表并返回一些可迭代的对象, 这些对象包含了是素数的元素.

<br>

_记住, 一个[可迭代对象](http://docs.python.org/3/glossary.html#term-iterable)只是一个可以一次返回它的成员的对象.

<br>

"简单", 我们说, 于是我们写了如下的代码:
<pre>
<code class="python">
def get_primes(input_list):
    result_list = list()
    for element in input_list:
        if is_prime(element):
            result_list.append()

    return result_list

# or better yet...

def get_primes(input_list):
    return (element for element in input_list if is_prime(element))

# not germane to the example, but here's a possible implementation of
# is_prime...

def is_prime(number):
    if number > 1:
        if number == 2:
            return True
        if number % 2 == 0:
            return False
        for current in range(3, int(math.sqrt(number) + 1), 2):
            if number % current == 0: 
                return False
        return True
    return False
</code>
</pre>

<br>

上面执行的`get_primes`满足要求, 所以我们告诉BOSS说我们做完了. 她回复说我们的函数可以工作而且就是她想要的.

<br>

## 处理无穷序列

<br>

好吧, 不是十分_准确_. 几天之后, 我们的BOSS回来了, 告诉我们说她遇到了一个小问题: 她想使用我们的`get_primes`函数来处理一个非常大的数组. 实际上, 这个列表太大了导致仅仅生成它就会消耗所有的系统内存. 为了解决这个问题, 她想要使用一个`start`值来调用`get_primes`并且得到所有大于`start`的素数(也许她在解决[Project Euler problem 10](http://projecteuler.net/problem=10)).

<br>

一旦我们思考了这个新的需求, 就会发现它不仅仅是要简单地修改`get_primes`. 明显地, 我们不能返回一个从`start`开始到无穷大的素数列表(_但是处理无穷序列有着非常广泛的应用_). 用常规函数来解决这个问题看起来不大可能.

<br>

在我们放弃之前, 让我们决定阻止我们写出符合BOSS需求的函数的核心障碍. 思考一下, 我们得到了这样的结论: **函数只有一次机会返回结果, 因此必须一次返回所有结果**. 得出如此明显的结论看起来一点用都没有; "函数就是这样工作的", 我们想. 真正有用的是疑问, "但是如果函数不这样工作呢?"

<br>

想象一下, 如果`get_primes`可以简单地返回_下一个_值而不是一次返回所有的值的话我们可以做什么. 根本就不需要生成一个列表. 没有列表, 就没有内存问题. 既然我们的BOSS告诉我们她只是要遍历所有的结果, 她不会知道这个不同.

<br>

不幸的是, 这似乎不可能. 即使我们有了一个很神奇的函数可以允许我们遍历`n`到`无穷大`, 我们也会在得到地一个返回值后陷入困境:
<pre>
<code class="python">
def get_primes(start):
    for element in magical_infinite_range(start):
	    if is(element):
		    return element
</code>
</pre>

<br>
假设`get_primes`是像这样被调用的:
<pre>
<code class="python">
def solve_number_10():
    # She *is* working on Project Euler #10, I knew it!
    total = 2
    for next_prime in get_primes(3):
        if next_prime < 2000000:
            total += next_prime
        else:
            print(total)
            return
</code>
</pre>

<br>
显然, 在`get_primes`函数中, 我们立刻遇到了`number = 3`的情况并且在第四行返回. 不是`return`, 我们需要一种方法可以生成一个值并且当请求下一个值的时候从上次离开的地方继续.

<br>

然而函数不能做到这样. 当函数`return`的时候, 它们就已经很好地完成工作了. 即使我们保证一个函数可以被再次调用, 我们也不能说, "好, 现在不要像正常情况一样从第一行开始, 从上次我们离开的第四行开始." 函数只有一个`entry point`(入口): 第一行.

<br>

## 进入生成器

<br>

这一类问题太普遍了导致新的结构被添加到了Python来解决这类问题: 生成器. 一个生成器"生成"值. 构造生成器就像理解`generator functions`(生成器函数)的概念一样直接因此会同时介绍.

<br>

一个`generator function`像正常的函数一样定义, 但是当它需要产生一个值的时候, 它使用`yield`关键字而不是`return`. 如果一个`def`代码块包含`yield`, 这个函数就自动变成了一个生成器函数(即使它同时含有一个`return`语句). 生成一个生成器函数不用做其他事情啦~

<br>

`generator functions`生成`generator iterators`(生成器迭代器). 这是最后一次你会看见`generator iterators`, 因为它们通常被称作`generators`. 只用记住一个`generator`是`iterator`(迭代器)的特殊类型. 考虑到作为一种迭代器, 生成器必须定义一些方法, 其中一个方法就是`__next__()`. 为了从生成器得到下一个值, 我们使用作为迭代器内置的函数: `next()`.

<br>

这一点值得重复: **为了从一个生成器得到下一个值, 我们使用作为迭代器内置的函数:`next()`**.

<br>

(`next()`负责调用生成器的`__next__()`方法). 既然一个生成器是迭代器的一种, 那么它可以用在`for`循环中.

<br>

所以无论什么时候当`next()`被生成器调用的时候, 生成器负责回传一个值给调用`next()`的任何对象. 这是通过调用伴随着需要回传的值的`yield`来实现的(e.g. `yield 7`). 最简单的记住`yield`做了什么的方法就是把它当作`generator functions`的(加了一点魔法的)`return`.

<br>

再一次, 这值得强调: **`yield`只是`generator functions`的(加了一点魔法的)`return`**.

<br>

下面有一个简单的生成器函数:
<pre>
<code class="python">
&gt;&gt;&gt; def simple_generator_function():
&gt;&gt;&gt;     yield 1
&gt;&gt;&gt;     yield 2
&gt;&gt;&gt;     yield 3
</code>
</pre>

<br>

这里是两种使用它的简单方法:
<pre>
<code class="python">
&gt;&gt;&gt; for value in simple_generator_function():
&gt;&gt;&gt;     print(value)
1
2
3
&gt;&gt;&gt; our_generator = simple_generator_function()
&gt;&gt;&gt; next(our_generator)
1
&gt;&gt;&gt; next(our_generator)
2
&gt;&gt;&gt; next(our_generator)
3
</code>
</pre>

<br>

## 魔法?

<br>

魔法部分是什么? 很高兴你问了! 当一个生成器函数调用`yield`的时候, 这个生成器函数的"状态"就冻住了; 所有变量的值都被保存了而且下一行将要被执行的代码也被记录了直到`next()`被再次调用. 因为这样, 生成器函数只用简单地恢复到离开的地方. 如果`next()`没有被再次调用, 在`yield`调用期间记录的状态(最终)会被抛弃.

<br>

让我们重写`get_primes`为生成器函数. 注意我们不再需要`magical_inifite_range`函数了. 使用一个简单的`while`循环, 我们可以生成我们自己的无穷序列:
<pre>
<code class="python">
def get_primes(number):
    while True:
        if is_prime(number):
            yield number
        number += 1
</code>
</pre>

<br>

如果一个生成器函数调用了`return`或者到达了定义的结尾, 一个`StopIteration`异常就会被抛出. 这个信号给无论哪个调用`next()`的对象说, 生成器已经使用完了(这通常是迭代器的行为). 它也是使用`while True`的原因: 循环在`get_primes`里呈现. 如果没有, 第一次调用`next()`的时候我们会检查这个数字是否是素数并生成它. 如果`next()`再一次被调用, 我们可以无用地把`number`加`1`并且到达生成器函数的末尾(导致了`StopIteration`被抛出). 一旦一个生成器被使用完毕, 在它上面调用`next()`会返回一个错误, 所以你只能消耗生成器的所有值一次. 下面这个不会工作:
<pre>
<code class="python">
&gt;&gt;&gt; our_generator = simple_generator_function()
&gt;&gt;&gt; for value in our_generator:
&gt;&gt;&gt;     print(value)

&gt;&gt;&gt; # our_generator has been exhausted...
&gt;&gt;&gt; print(next(our_generator))
Traceback (most recent call last):
  File "&lt;ipython-input-13-7e48a609051a&gt;", line 1, in &lt;module&gt;
    next(our_generator)
StopIteration

&gt;&gt;&gt; # however, we can always create a new generato
&gt;&gt;&gt; # by calling the generator function again...

&gt;&gt;&gt; new_generator = simple_generator_function()
&gt;&gt;&gt; print(next(new_generator))  # perfectly valid
1
</code>
</pre>

<br>

因此, `while`循环是用来保证我们永远不会到达`get_primes`的末尾. 只要`next()`在生成器中被调用, 它就允许我们生成一个值. 在处理无穷序列(以及生成器)的时候, 这是很惯用的方法.

<br>

## 可视化流程

<br>

让我们回到调用`get_primes`:`solve_number_10`的代码:
<pre>
<code class="python">
def solve_number_10():
    # She *is* working on Project Euler #10, I knew it!
    total = 2
    for next_prime in get_primes(3):
        if next_prime < 2000000:
            total += next_prime
        else:
            print(total)
            return
</code>
</pre>

<br>

当我们调用在`solve_number_10`的`for`循环中的`get_primes`时, 可视化前几个元素是怎么生成的是很有帮助的. 当`for`循环从`get_primes`请求第一个值的时候, 我们就像进入一个普通函数一样进入`get_primes`.

<br>

1. 我们在第3行进入`while`循环
2. 执行`if`条件语句(`3`是素数)
3. 我们生成`3`并且控制权返回给`solve_number_10`

<br>

然后, 回到`solve_number_10`:
<br>

1. `3`回传给`for`循环
2. `for`循环把`next_prime`分配给这个值
3. `next_prime`被加到`total`上
4. `for`循环请求来自`get_primes`的下一个元素

<br>

这次, 相反进入代码顶部的`get_primes`, 我们从第5行开始, 上次我们离开的地方.

<pre>
<code class="python">
def get_primes(number):
    while True:
        if is_prime(number):
            yield number
        number += 1 # &lt;&lt;&lt;&lt;&lt;&lt;
</code>
</pre>

<br>

最终要的是, 当我们调用`yield`(i.e. `3`)的时候`number`仍然有同样的值. 记住, `yield`传值给调用`next()`的任何对象并且保存这个生成器函数的"状态". 显然, `number`增加到了`4`, 我们到达了`while`循环的顶部并且保持增加`number`知道我们遇到下一个素数(`5`). 再一次, 我们`yield`这个值, 到达了`solve_number_10`的`for`循环. 这个循环一直继续知道`for`循环停止(在第一个大于`2,000,000`的素数).

<br>

## Moar幂

<br>

在[PEP342](http://www.python.org/dev/peps/pep-0342/)中, 添加了传值到生成器_里_的支持. [PEP342](http://www.python.org/dev/peps/pep-0342/)给了生成器在单个语句里生成一个值(想之前一样), _接受_一个值, 或者既生成一个值_又_接受一个(可能不同的)值的能力.

<br>

为了论证值是怎样传给生成器的, 让我们回到我们素数的例子. 这次, 不是简单地打印出每个大于`number`的素数, 我们要找出大于一个连续幂值的最小的素数(i.e. 对于10, 我们想要大于10, 100, 1000等等的最小的素数). 我们用`get_primes`同样的方法开始:
<pre>
<code class="python">
def print_successive_primes(iterations, base=10):
    # like normal functions, a generator function
    # can be assigned to a variable

    prime_generator = get_primes(base)
    # missing code...
    for power in range(iterations):
        # missing code...

def get_primes(number):
    while True:
        if is_prime(number):
        # ... what goes here?
</code>
</pre>

<br>
`get_primes`的下一行需要一些解释. 当`yield number`可以生成`number`的值的时候, `other = yield foo`语句意味着, "生成`foo`并且把`other`设为这个值." 你可以使用生成器的`send`方法来"传送"值.
<pre>
<code class="python">
def get_primes(number):
    while True:
        if is_prime(number):
            number = yield number
        number += 1
</code>
</pre>

<br>

这样, 我们可以在每次生成器`yield`的时候设置`number`为不同的值. 我们现在可以写出`print_successive_primes`中缺失的代码了:
<pre>
<code class="python">
def print_successive_primes(iterations, base=10):
    prime_generator = get_primes(base)
    prime_generator.send(None)
    for power in range(iterations):
        print(prime_generator.send(base ** power))
</code>
</pre>

<br>
这里有两个要注意的: 首先, 我们打印的是`generator.send`的结果, 这是可能的因为`send`既传送值给生成器_也_返回生成器产生的值(反映了`yield`是怎样在生成器函数中工作的).

<br>

其次, 注意`prime_generator.send(None)`这一行. 当你使用`send`来"启动"一个生成器的时候(也就是, 从第一行开始执行生成器的代码直到第一个`yield`语句), 你必须`send None`. 这是说得通的, 既然通过定义生成器还没有到达第一个`yield`语句, 所以如果我们传送了一个真正的值给生成器就会没有东西`接受`这个值. 一旦生成器启动了, 我们就可以像上面一样传值了.

<br>

## 查漏补缺

<br>

在这个系列的第二部分, 我们会讨论促进生成器的不同方法以及它们作为结果得到的能量. `yield`已经成为了Python中最有力的关键字之一. 现在我们已经对`yield`怎么工作有了深刻的理解, 我们有了理解一些更加"令人费解"的关于`yield`应用的基础知识.

<br>

不管你信不信, 我们仅仅只了解了`yield`的表层力量. 例如, 当`send`_确实_像上面一样工作的时候, 当生成像我们例子中的简单语句时它几乎从来没有使用过. 下面, 我贴了一个`send`使用的一个小示范. 我不会说更多了, 弄清楚它是怎样工作并且为什么可以工作是对第二部分一个很好的热身.

<pre>
<code class="python">
import random

def get_data():
    """Return 3 random integers between 0 and 9"""
    return random.sample(range(10), 3)

def consume():
    """Displays a running average across lists of integers sent to it"""
    running_sum = 0
    data_items_seen = 0

    while True:
        data = yield
        data_items_seen += len(data)
        running_sum += sum(data)
        print('The running average is {}'.format(running_sum / float(data_items_seen)))

def produce(consumer):
    """Produces a set of values and forwards them to the pre-defined consumer
    function"""
    while True:
        data = get_data()
        print('Produced {}'.format(data))
        consumer.send(data)
        yield

if __name__ == '__main__':
    consumer = consume()
    consumer.send(None)
    producer = produce(consumer)

    for _ in range(10):
        print('Producing...')
        next(producer)
</code>
</pre>

<br>

## 记住

<br>

下面有一些我希望你能从这次讨论中得到的核心想法:

+ 生成器用来_生成_一系列的值

+ `yield`就像是生成器函数的`return`

+ `yield`做的唯一意见事就是保存生成器函数的"状态"

+ 一个生成器是迭代器的特殊类型

+ 像迭代器一样, 我们可以使用`next()`得到生成器的下一个值

  * `for`通过隐式地调用`next()`得到下一个值

<br>

我希望这篇文章能有帮助. 如果你从来没有听说过生成器, 我希望你现在明白了它们是什么, 为什么它们有用以及怎样使用它们. 如果你之前对生成器有点熟悉, 我希望你现在没有任何疑惑了.

<br>

一如既往地, 如果有任何部分不清楚(或者, 更重要的是, 存在错误), 请让我知道. 你可以在下面留言, 给[jeff@jeffknupp.com](mailto:jeff@jeffknupp.com)发邮件, 或者在Twitter上@我[@jeffknupp](http://www.twitter.com/jeffknupp).

<br>
