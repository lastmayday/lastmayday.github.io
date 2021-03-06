---
layout: default
title: Why Are There So Many Pythons
tags: Python
---

[原文地址](http://www.toptal.com/python/why-are-there-so-many-pythons?)

Python十分奇妙.



令人惊讶的是, 这是一个相当模糊的说法. 我说'Python'的时候是什么意思? 我是说Python是一个抽象_接口_吗? 还是说我的意思是CPython, 常用的Python(而且没有被名字相似的Cython弄混淆)吗? 或者我的意思完全是其他的东西? 也许我更倾向于Jython, 或者IronPython, 或者PyPy. 又或许我已经真的到了更深的层次, 我说的是RPython或者RubyPython(这些是非常非常不同的东西).



虽然上面提到的技术都是常用命名或者常用参考, 它们中的一些为着完全不同的目的服务(或者, 至少用完全不同的方式工作).



在我与Python一起工作的生涯中, 我遇到过非常多的这些.*ython的工具. 但是直到最近我才花时间来理解它们都是什么, 它们是怎么工作的, 以及(以它们自己的方式)为什么它们是必须的.



在这篇文章中, 我将从最简单的一直讲到不同的Python实现, 并且全面地介绍PyPy, 我认为PyPy将会是Python的未来.



首先从理解Python究竟是什么开始.



_如果你对机器语言, 虚拟机之类的有很好的理解, 请跳到[前面](#pypy)._



## "Python是解释型语言还是编译型语言?"



对Python初学者来说这是很容易混淆的一点.



我们首先需要意识到'Python'是一个_接口_. 这里有一个[规范](http://docs.python.org/2/reference/index.html)关于Python_应该_干什么, (与任何接口一样)_应该_怎么运行. 而且(与任何接口一样)有很多_实现_.



我们要意识到的第二件事是, '解释型'和'编译型'是一种_实现_的特性, 而不是一个_接口_的特性.



所以, 这个问题本身就不是一个准确的问题.

> Is Python interpreted or compiled? The question isn't really well-formed.

这意味着, 对于大多数常用的实现(CPython: 用C写的, 通常简称'Python', 如果你不明白我在说什么的话那这个就是你正在用的), 这个答案是: 有一点编译的**解释型**. CPython把Python源码编译<sup>*</sup>成字节码, 然后解释这个字节码, 执行它.



*注意: 这不是传统意义上的"编译". 通常, 我们说的"编译"是把高级语言转成机器码. 但这也是各种"编译"的一种.



让我们更进一步看这个问题, 它将帮助我们理解在这篇文章后面出现的一些概念.



## 字节码 vs. 机器码



理解字节码和机器码(或者原生代码)的不同非常重要, 最好是通过例子来说明:
+ C编译成机器码, 然后在你的处理器中直接运行. 每条指令都指示你的CPU移动周围的东西.
+ Java编译成字节吗, 然后在Java虚拟机(JVM)中运行, 一个抽象的执行程序的计算机. 每一条指令都被JVM处理, JVM与你的计算机交互.



简单地说: **机器码更快, 但字节码更可移植而且安全**.



你的机器不同决定了机器码的不同, 但是字节码在所有机器上都一样. 有人可能说机器码优化了你的设置.



回到CPython, 工具链的过程如下:

1. CPython把你的Python源码编译成字节码.

2. 然后在CPython虚拟机里执行那个字节码.

> 初学者通常认为Python被编译了因为.pyc文件. 这里有一些事实: .pyc文件是被编译后的字节码, 它之后会被解释. 所以如果你在有.pyc文件之前执行你的Python代码, 那么第二次执行会更快, 因为第二次不需要重新编译字节码.



## 可选的虚拟机: Jython, IronPython, 以及更多

我之前提到过, Python有_很多_的实现. 再一次, 就像之前提到的, 最常用的是CPython. 这个Python的实现是用C语言写的, 而且是"默认"的实现.



但是其他可选的有哪些呢? 更突出的一个是[Jython](http://www.jython.org/archive/21/docs/whatis.html), 一种用Java写的Python实现, 利用了JVM. 为了在CPython虚拟机中运行, CPython生成了字节码. 为了在JVM中运行, Jython生成了Java字节码(当你编译Java程序的时候也会生成同样的东西).


<img markdown="1" src="http://i.imgur.com/JSvsQvA.png" title="Hosted by imgur.com"/>



"为什么要用另外一种实现?" 你可能会问. 好吧, 其中一个理由就是**这些不同的实现在不同的技术栈中表现得很好**.



CPython使得为你的Python代码写C扩展非常容易, 因为它最终是由C解释器执行的. Jython, 在另一方面, 使得很容易与其他Java程序一起工作: 你可以好不费力地导入_任何_Java类, 在你的Jython程序中导入和利用你的Java类.(_此外: 如果你没有更深入地想过它, 那这正好是个难点. 我们正在讨论你可以混合不同的语言然后把他们编译成相同的东西(就像[Rostin](http://www.reddit.com/user/Rostin)说过的, 混合Fortran和C的代码已经出现一段时间了. 所以, 这并不一定是新出现的. 但是它仍然很酷.))



下面是一个Jython代码的例子:
{% gist 6729619 %}



[IronPython](http://ironpython.net/)是另外一个流行的Python实现, 完全用C#写的并且旨在用于.NET技术中. 特别的, 它在你可能叫做.NET虚拟机的东西上运行, 微软的[Common Language Runtime(CLR)](http://en.wikipedia.org/wiki/Common_Language_Runtime), 和JVM类似.



你可能会说, _Jython:Java::IronPython:C#_. 他们都运行在各自相同的虚拟机上, 你可以从你的IronPython代码中导入C#的类, 从Jython代码中导入Java类等等.



这完全是可能的, 如果从来没有接触过非CPython的Python实现. 但是, 在转换中需要有一些优点, 它们中欧你的大多数都取决于你的技术栈. 使用太多基于JVM的语言? Jython可能会适合你. 都是关于.NET技术的? 那也许你该试试IronPython(或许你已经在用了).


<img markdown="1" src="http://i.imgur.com/HOX5rZW.png" title="Hosted by imgur.com"/>


顺便说一句: 这并不是使用不同实现的一个_理由_, 注意这些实现只在它们对待你的Python源码时存在不同. 然而, 这些不同都非常微小, 而且随着时间的推移, 这些实现都在活跃地发展, 而这些不同也可能会出现或消失. 例如, IronPython[默认使用Unicode](http://ironpython.codeplex.com/wikipage?title=IPy1.0.xCPyDifferences&referringTitle=Home); 而CPython的2.x版本[默认是ASCII](http://docs.python.org/2/howto/unicode.html#encodings)(对于非ASCII编码的字符串会出现UnicodeError), 但是[对于3.x版本默认为Unicode](http://docs.python.org/3/howto/unicode.html#python-s-unicode-support).



## PyPy

所以我们有一个用C写的Python实现, 一个用Java写的, 以及一个用C#写的. 下一步的逻辑: 一个用---Python写的Python实现. (受过教育的读者会注意到这里有一点点误导.)



这里有一些可能会混淆的东西. 首先, 我们来讨论just-in-time(JIT)编译.



### JIT: The Why and How

再一次提到原生的机器码比字节码要快得多. _好吧, 如果我们可以编译一些我们的字节码然后像原生代码一样运行它?_ 我们可能不得不花一些代价来编译字节码(例如时间), 但是如果最后结果会更快, 这真是极好的! 这就是JIT编译的动机, 一个结合了解释器和编译器的优点的混合动力技术. 基本来说, JIT想要利用编译来加速一个解释系统.



例如, JITs普遍采用的一个方法是:

1. 识别频繁执行的字节码.

2. 把它编译成原生的机器码.

3. 缓存结果.

4. 每当相同的字节码要运行的时候, 抓取预编译的机器码并从中获益(例如速度提升).



这就是PyPy的一切: 把JIT带给Python(之前的努力参见_附录_). 当然, 也有其他的目标: PyPy旨在成为跨平台的, 低内存的以及stackless-supportive. 但是JIT才是它真正的卖点. 在一堆时间测试之后得出的平均水平表明, PyPy比CPython快[0.16-6.3](http://speed.pypy.org/)倍. 休息一下, 来看看来自[PyPy Speed Center](http://speed.pypy.org/)的图表:



<img markdown="1" src="http://i.imgur.com/d7INrRu.png" title="Hosted by imgur.com"/>



### PyPy很难理解

PyPy拥有强大的潜力, 在这一点上它和CPython[高度兼容](http://doc.pypy.org/en/latest/faq.html#is-pypy-a-drop-in-replacement-for-cpython)(所以[它可以运行Flask, Django](http://pypy.org/compat.html)等等.).



但是, 对于PyPy仍然有很多疑惑(例如, [PyPyPy...](http://stackoverflow.com/questions/2591879/pypy-how-can-it-possibly-beat-cpython)是个荒谬的提议). 在我看来, 仅仅是因为PyPy其实是两样东西:

1. 一个用RPython写的Python解释器(不是Python(我之前撒谎了)). RPython是静态类型的Python的一个子集. 在Python里, [最有可能](http://doc.pypy.org/en/latest/faq.html#can-rpython-compile-normal-python-programs-to-c)的关于类型的推理(为什么它这么严格? 让我们看看这个事实:` x = random.choice([1, "foo"])`在Python代码里是可行的(感谢[Ademan](http://www.reddit.com/user/Ademan)). 那`x`的类型是什么? 当类型不是严格执行的时候我们怎么推断出变量的类型?). 对于RPython, 你牺牲了一些灵活性, 但是使得推断内存控制更加容易, 以及诸如此类的东西, 这允许了优化.

2. 一个编译器为了不同的目标编译RPython的代码并加在JIT上. [默认的平台是C](http://doc.pypy.org/en/latest/translation.html#overview), 例如, 一个RPython-to-C的编译器, 但是你也可以指定目标为JVM或者其他的东西.



为了方便起见, 我把以上称为PyPy(1)和PyPy(2).



为什么你需要这两件东西, 以及为什么在相提并论? 这样想想: PyPy(1)是一个用RPython写的解释器. 所以它吸收用户的Python代码并把代码编译成字节码. 但是这个解释器本身(用RPython写的)必须被另一个Python解释器编译才能执行, 不是吗?



好吧. 我们可以仅[用CPython](http://www.stavros.io/posts/what-is-pypy/)来运行这个解释器, 但是这不会很快.



相反地, 我们使用PyPy(2)(被称作[RPython工具链](http://doc.pypy.org/en/latest/translation.html))来为另一个平台(例如C, JVM或者CLI)编译PyPy的解释器, 来在我们的机器上运行, 添加到JIT上也是一样的. 这很神奇: PyPy动态地把JIT添加到一个解释器, 继承它自己的编译器!(_再一次, 这是个难点: 我们在编译一个解释器, 加入另一个独立的编译器._)



最后, 结果是一个独立的可执行文件, 它解释了Python的源代码然后利用JIT优化. 这正是我们想要的! 这很拗口, 也许下面这张表可以帮忙:

<img markdown="1" src="http://i.imgur.com/zwysIgb.png" title="Hosted by imgur.com"/>


要重申的是, PyPy真正的美丽之处是, 我们可以用RPython写很多不同的Python解释器而不用担心JIT(除非[一些提示](http://doc.pypy.org/en/latest/jit/pyjitpl5.html#jit-hints)). _PyPy可以为我们实施JIT_通过使用RPython工具链/PyPy(2).



事实上, 如果我们得到更多的抽象, 你可以理论上为_任何_语言写一个解释器, 将其提供给PyPy, 然后为那个语言得到一个JIT. 这是因为PyPy关注于优化实际的解释器, 而不是这个语言解释的细节.

> You could theoretically write an interpreter for any language, feed it to PyPy, and get a JIT for that language.



简短的题外话, 我很乐意提起, JIT本身是绝对迷人的. 它使用一个叫做tracing的技术, 这个技术按如下执行:

1. 运行解释器并且解释任何东西(没有加入JIT).

2. 对解释过的代码做一点轻的分析.

3. 确定你之前执行的操作.

4. 把这些代码位编译成机器码.


_如果想了解更多, [这篇文章](https://bitbucket.org/pypy/extradoc/src/tip/talk/icooolps2009/bolz-tracing-jit-final.pdf)很好读而且很有趣._



总结: 我们使用PyPy的RPython-to-C(或者其他的目标平台)编译器来编译PyPy的RPython实施的解释器.



## 总结



为什么这非常棒? 为什么这是一个值得追求的疯狂想法? 我想[Alex Gaynor](http://pypy.org/people.html#alex-gaynor)在他的[博客](http://alexgaynor.net/2010/may/15/pypy-future-python/)里说得好: "[PyPy就是未来]因为[它]提供了更好的速度, 更多的灵活性, 而且对Python的成长更好的平台."



简单地说:

+ **它很快因为它把源码编译成原生代码**(使用JIT).

+ **它很灵活因为它把JIT添加到你的解释器里**而只需要很少的额外工作.

+ **它很灵活(再一次)因为你可以用RPython写你自己的解释器**, 这使得它比C容易扩展(事实上, 这太简单了导致这里有一个[编写你自己的解释器的教程](http://morepypy.blogspot.com/2011/04/tutorial-writing-interpreter-with-pypy.html)).



## 附件: 其他你可能听过的名字
