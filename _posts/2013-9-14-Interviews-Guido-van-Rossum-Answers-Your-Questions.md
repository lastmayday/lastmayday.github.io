---
layout: default
title: Interviews-Guido van Rossum Answers Your Questions
tags: Python Guido
---

[原文地址](http://developers.slashdot.org/firehose.pl?op=view&type=story&sid=13/08/25/2115204)



上周你有一个机会来[问Guido van Rossum](http://interviews.slashdot.org/story/13/08/19/1256259/interviews-qa-with-guido-van-rossum?sdsrc=next), Python的BDFL(Benevolent Dictator For Life 生命仁慈的独裁者), 关于Python的问题以及关于他跳槽到Dropbox的事情. Guido迅速地回答了这些问题.



## From Google to Dropbox

by nurhussein


__Guido__: 在Google工作了七年之后我已经准备好换个环境了, 然后就收到了Dropbox的offer. 在很大程度上我的工作并没有多大改变:我仍然

- 花一半的时间来做任何我想对Python做的事情, 作为BDFL的角色
- 是这个组织里的一个普通工程师(不是一个经理甚至连项目组长都不是)
- 做很多的代码重构, 架构和设计工作
- 处理很多的邮件
- 用Python写很多工作中的代码



具体的不同的话.我实际上在Google只做了两件事: 第一年我在写首批线上代码review的工具[Monderian](http://www.youtube.com/watch?v=sMql3Di4Kgc), 这个项目不是开源的. 但是由此衍生出了[Rietveld](https://codereview.appspot.com/), 这个项目是开源的, 而且用在Python, Go和Chromium的社区. 在那以后我加入了Google App Engine, 在那里我做了很多不同的事情. 这些事大多数都是用Python. 我在那里最大的项目是一个新的Python数据存储API, [NDB](https://developers.google.com/appengine/docs/python/ndb/).



我已经在Dropbox工作了七个月, 主要的工作是设计[Dropbox数据存储API](https://www.dropbox.com/developers/datastore). 这有点讽刺但是这个也使用"datastore"的绰号不是我的错---Dropbox Datastores和Google App Engine Datastore之间几乎没有交集.



更加讽刺的是即使我做了很多设计, 而且用Python写了两个原型, 上个月发布的SDKs只支持Java, Object-C和Javascript. 但是我正在修正它, 这个采访让我的速度变慢了.:-)



## 为什么Python避免了一些共同的"OO"特性?

by i_ate_god



_接口, 抽象类, 私有成员, 等等...为什么Python避免了这些?_



**Guido**: 我可以想到两个原因: (a)你并是真正的需要它们, 而且(b)如果没有编译时的类型检查的话很难做到这些. Pythonk开始是作为一个skunkworks project(不被组织拥护或鼓励但是也不反对), 而且我想迅速地看到结果. 这导致我去除了一些并不是真正需要的特性. 我对面向对象没有私心---我只是想要一个简单的语言, 而它成为面向对象语言或多或少是个偶然.



在现代Python中, 已经大致上有了和这些等价的东西, 但是它们并不一定工作得那么好, 或者它们导致了一些执行开销, 所以它们通常被避免了, 但是也有用它们和喜欢它们的人.



## 函数式编程

by ebno-10db



_一些人声称Python是, 只是一部分是, 一种函数式语言. 你不同意, 我也不同意._
_仅仅有一些map和filter类型的函数并不能组成一个函数式语言._
_我的理解是, 这些函数是被一个想家的Lisp用户加到函数库里的, 而且你很多次都试着去废掉它们. 大体上, 你好像并不是一个函数式编程的爱好者, 至少对于Python来说._



_问题: 你是否觉得函数式编程的趋势大体上不是很有用呢? 或者简单地说, 函数式编程不适合Python? 很高兴能听到你任何方面的原因._



**Guido**: 我不是一个对某种概念有着极端信仰的人, 我试着在我的设计选择中做到实用(但不是**太**实用, 看这句话的开始 :-). 我看中实际代码的可读性和可用性. 有些地方`map()`和`filter()`很有意义, 而且在其他地方Python有列表推导. 我结束了讨厌`reduce()`因为它过去几乎完全用来(a)执行`sum()`, 或者(b)来写不可读的代码. 所以我们增加了内置的`sum()`, 同时我们吧`reduce()`从内置的降级到了functools里的(我并不在意这个东西最后在哪里:-).



如果要我说函数式编程, 我通常会想起有着非常强大编译器的语言, 比方说Haskell. 对于这样一个编译器, 函数式范例很有用, 因为它打开了一个大量可能的转换的数组, 包括并行. 但是Python的编译器对你的代码没有概念, 而且这也很有用. 所以, 通常我并不认为试着把"函数式"加到Python上有多大意义, 因为这些在函数式编程语言里工作很好的特性并不适用于Python, 而且对于不习惯使用函数式语言的人(大多数程序员)来说, 它们使得代码相当难读.

我也不认为当前函数式语言的成果已经准备好成为主流了. 诚然, 我对这个领域包括Haskell并不知道很多, 但是任何**没有**Haskell流行的语言都肯定只有很少的实用价值. 而且我从来没有听说哪种函数式语言比Haskell**更**流行. 至于Haskell, 我认为这是一个各种关于编译器技术的想法的很好的试验场, 但是我认为它的"纯度"会永远保持在收养的方式. 不得不处理[Monads](http://en.wikipedia.org/wiki/Monad_(functional_programming))并不适合大多数人.



(同样的评论对Scala也适用. 也许你最好能做的就是试着把函数式和面向对象范例在一种语言里结合起来, 但是结果并不容易使用除非你非常聪明.)



## 多行lambdas

by NeverWorker1

_一个对Python的共同抱怨是, Python局限了它的lambdas, 也就是说只有一行并没有能力做什么事情._
_显然, Python对待的空格方法是这个的一部分主要原因(而且, IIRC, 我读过你对于这个影响的评论)._
_我花了很多时间思考对于多行lambda可能的语法._
_我想出最好的解决办法是硬塞一些没使用的(或很少使用的)符号到C语言风格的大括号里, 但是这会很凌乱._
_有没有更好的方法呢? 你想过添加这个功能吗?_



**Guido**: 真的吗? 我从来没听说过这个抱怨, 除了对Slashdot的采访提问的人.:-)



确实有更好的方法, 使用`def`关键字在local范围内定义一个正常的函数. 这个被定义的函数对象成为local变量, 这个变量有和一个lambda同样的语义, 除了它被绑定到了一个local变量, 而且它没有任何语法约束. 例如, 下面**没有**语义的不同:

{% gist 6560855 %}

这个等价于使用lambda:

{% gist 6560861 %}

(除非当你内省lambda, 需要它的名字的时候, 将会返回''而不是'adder')



Andrew Koenig 曾经向我指出, 有一种情况可以让lambdas真正地更加方便, 那就是如果你有一个长列表或字典(或许是一种交换的定义)包含了很多lambdas, 因为如果你不想用lambda的话你就得定义很多小函数, 给它们名字, 然后在列表或字典里通过名字引用它们. 但是在那种情况下lambdas就非常简单了, 而且如果你有一些异常, 在开始这个列表或字典之前使用'def'是个折中的办法.



## PyPy

by Btrot69



_你认为PyPy有前途吗? 或者你仍然不服气? 如果这样的话为什么呢?_



**Guido**: 我仍然不服气, 有两个原因: (a)它们现在还不能支持Python3, (b)有很多扩展模块(包括第三方的和标准库的), 它们都不能很好地支持. 但是我希望他们将来能修复这些问题. 我认为就是像PyPy, Jython和IronPython这样的项目之间的竞争, 才给了CPython动力.



## Python在浏览器的应用?

by Btrot69



_在过去的几年里, 有很多个尝试创造一个能在web浏览器中安全运行的Python的沙盒版本._
_绝大多数是因为JavaScript的问题. 现在JavaScript工作得很好--而且我们有很好的东西像CoffeeScript--是时候放弃在浏览器中应用Python了吗?_



**Guido**: 我在1995年就放弃它了. 是的. 而且请不要试着把Python编译成JavaScript. 它们的语义非常不同导致你最后会花费大量的时间, 这大大降低了速度.(CoffeeScript的力量在于它被设计得能干净地映射到JavaScript, 而且这两个在共同发展使得映射更加干净.)



## Python3

by MetalliQaZ



_你是觉得现在迁移到Python 3(Py3k)的阶段怎么样?_
_从用户的角度来说, 一些流行的库的转换远远落后了, 这阻碍了过渡._
_在我的工作中, 几乎每个我用过的单个系统都没有安装3.x的版本. 实际上, 2.7是罕见的. 我希望听听你的想法._



**Guido**: 很好奇你在哪里工作. 我同意Python 3的迁移还需要很长一段时间, 但是如果你的系统仍然不能处理Python 2.7的话那他们一定很古老了! 当我离开Google的时候他们正要内部过渡到Python 2.7(在过去的几年里已经成功从2.4过渡到了2.6)而且现在在Dropbox, 无论是在客户端还是服务器端都用的Python 2.7. 两家公司也都在考虑使用Python 3.



回到Python 3的过渡, 我非常乐观. 很多流行的库已经有了一个正在工作的端口或者正在搭建一个.(The Python Softerware Foundation也偶尔出资帮助广泛应用而又没有足够的组织来建立端口的库.)这将会花费很长时间, 但是我看见了很多进步, 而且在未来的几年里我希望大多数新的代码都会用Python 3来写. 完全消除Python 2的使用可能将会花更多的时间. 但是再一次, Windows XP至今也没有完全死亡.:-)



## 对于任何一个语言设计者的关键问题

by dkleinsc



_[在你长胡子以来](http://c2.com/cgi/wiki?LanguageAuthorBeardPattern)Python的前途提高了吗? 胡子长度对于语言的成功影响到什么程度?_



**Guido**: 这绝对非常必要. 看看Perl的命运---Larry Wall就是胡子刮得太干净啦.:-)
