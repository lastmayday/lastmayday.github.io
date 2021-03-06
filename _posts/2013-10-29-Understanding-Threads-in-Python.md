---
layout: default
title: Understanding Threads in Python
tags: Python Threads
---

[原文地址](http://agiliq.com/blog/2013/09/understanding-threads-in-python/)



你会看到一些在Python中使用线程的例子以及怎样避免竞态条件:

你需要多次执行每个例子来注意到线程是不可预测的, 你得到的结果每次都不同.

免责声明: 请暂时忘掉你听说过的关于GIL的任何东西, 因为GIL不会影响我想要展示的情况.



## Example 1

我们想要获取五个不同的urls:

### 单线程方法

```python
def get_responses():
    urls = ['http://www.google.com', 'http://www.amazon.com', 'http://www.ebay.com',
        'http://www.alibaba.com', 'http://www.reddit.com']
    start = time.time()
    for url in urls:
        print url
        resp = urllib2.urlopen(url)
        print resp.getcode()
    print "Elapsed time:%s" % (time.time()-start)

get_responses()

```

输出的结果是:

```text
http://www.google.com 200
http://www.amazon.com 200
http://www.ebay.com 200
http://www.alibaba.com 200
http://www.reddit.com 200
Elapsed time: 3.0814409256
```

**解释**:

+ 这些urls都是按顺序获取的.

+ 除非处理器从一个url那里得到了响应, 否则它不会获取下一个url

+ 网络操作会消耗时间, 所以在处理器等着url响应的期间它是闲置的.

即使在一个单线程的程序中, 也只有一个执行线程. 我们叫它`主线程`. 所以, 上一个例子只有一个线程, 也就是主线程.



### 多线程方法

你需要创建Thread类的一个子类:

```python
import time
import urllib2

from threading import Thread


class GetUrlThread(Thread):
    def __init__(self, url):
        self.url = url
        super(GetUrlThread, self).__init__()

    def run(self):
        resp = urllib2.urlopen(self.url)
        print self.url, resp.getcode()


def get_responses():
    urls = ['http://www.google.com', 'http://www.amazon.com', 'http://www.ebay.com',
        'http://www.alibaba.com', 'http://www.reddit.com']
    start = time.time()
    threads = []
    for url in urls:
        t = GetUrlThread(url)
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    print "Elapsed time: %s" % (time.time()-start)


get_responses()
```

输出:
```python
http://www.reddit.com 200
http://www.google.com 200
http://www.amazon.com 200
http://www.alibaba.com 200
http://www.ebay.com 200
Elapsed time: 0.689890861511
```

**解释**:

+ 这个程序的执行时间是令人惊喜的.

+ 我们写了一个多线程的程序来减少处理器的空闲时间. 当处理器在等待某个特定线程的url响应的时候, 处理器可以在其他的线程上工作来获取其他线程的url.

+ 我们希望一个线程运行处理url, 所以重写了thread类的构造方法来给它传递一个url参数.

+ 执行一个线程意味着执行一个线程的`run()`函数.

+ 所以无论我们想要一个线程干什么都必须在它的`run()`函数里进行.

+ 为每一个url创建一个线程然后对它调用`start()`函数. 这告诉处理器可以执行这个线程了, 也就是可以`run()`这个线程了.

+ 我们希望所有线程都被执行后再计算已用时间, 所以`join()`出现了.

+ 在一个线程中调用`join()`函数是用来告诉`主线程`等到这个线程结束了再执行下一步指令.

+ 我们对所有的线程都调用`join()`所以已用时间只会在所有线程都执行以后才被打印出来.



**关于线程的一些东西**:

+ 处理器可能不会在`start()`之后就立即执行`run()`.

+ 你不能断定不同的线程会以怎样的顺序被执行.

+ 对于一个特定的线程, `run()`里的声明一定会按顺序执行.

+ 这意味着和这个线程有关的url会首先被获取然后才收到的响应会被打印出来.



## Example 2

我们会用一个程序来演示竞态条件然后修复它:

先读一下[维基百科的例子](http://en.wikipedia.org/wiki/Race_condition#Example)来理解下竞态条件是什么意思.

```python
from threading import Thread

#define a global variable
some_var = 0


class IncrementThread(Thread):
    def run(self):
        #we want to read a global variable
        #and then increment it
        global some_var
        read_value = some_var
        print "some_var %s is %d" % (self.name, read_value)
        some_var = read_value + 1
        print "some_var in %s after increment is %d" % (self.name, some_var)


def use_increment_thread():
    threads = []
    for i in range(50):
        t = IncrementThread()
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    print "After 50 modifications, some_var should have become 50"
    print "After 50 modifications, some_var is %d" % (some_var, )


use_increment_thread()
```

多次运行这个程序, 你会发现你每次得到的值都不一样.

**解释**:

+ 这里有一个全局变量, 所有的线程都会改变它.

+ 所有的线程都应该在这个变量已有值的基础上给变量的值加1

+ 这里有50个线程, 所以最后`some_var`的值应该是50, 但是并不是这样.



**为什么some_var的值不到50?**

+ 在某个时候线程t1读取了some_var的值为15, 然后处理器控制了这个线程并把它交给了线程t2.

+ t2也读取了some_var的值为15.

+ t1和t2都把some_var的值重置为15加1, 即16.

+ 但是当两个线程都作用在some_var的时候, 我们期望的是some_var的值加2.

+ 所以, 这里就有了一个竞态条件.

+ 同样的竞态条件也可能发生多次, 所以`some_var`的值最后是41或42这样小于50的值.



**修复这个竞态条件**

把IncrementThread中的`run()`修改为:

```python
from threading import Lock

lock = Lock()


class IncrementThread(Thread):
    def run(self):
        #we want to read a global variable
        #and then increment it
        global some_var
        lock.acquire()
        read_value = some_var
        print "some_var %s is %d" % (self.name, read_value)
        some_var = read_value + 1
        print "some_var in %s after increment is %d" % (self.name, some_var)
        lock.release()
```

再运行一次use_increment_thread就会得到期望的结果了.

**解释**:

+ Lock被用来防止竞态条件.

+ 如果thread1在一系列操作被执行之前就获得了锁, 那么不会有其他的线程可以执行同样的操作, 直到t1释放了锁.

+ 我们想保证一旦t1已经读取了some_var, 那么直到t1已经修改完了some_var的值, 其他的线程就才能读取some_var.

+ 所以读取some_var并且修改它的值是逻辑上相互关联的操作.

+ 这就是为什么我们要保持some_var的读取与修改部分被Lock实例看守.

+ Lock是一个单独的对象, 如果有线程的内容调用了它, 它就会被线程获取.



## Example 3

在上一个例子中我们看到了一个全局变量会在一个多线程中受到影响. 让我们再来看一个例子来确认一个线程不能影响其他线程中的实例变量.

这个例子中引入了`time.sleep()`函数. 它会确保一个线程处于暂停状态, 因此强制线程交换发生.

```python
import time
from threading import Thread


class CreateListThread(Thread):
    def run(self):
        self.entries = []
        for i in range(10):
            time.sleep(1)
            self.entries.append(i)
        print self.entries


def use_create_list_thread():
    for i in range(3):
        t = CreateListThread()
        t.start()


use_create_list_thread()
```

运行几次之后发现列表并没有被合适地打印出来.



可能是某个线程的`entries`正在打印的时候处理器切换到了其他线程并且开始打印其他线程的`entries`. 我们想要确保对于每个单独的线程, `entries`都是一个打印完了再开始下一个.



用lock来改变CreateListThread的`run()`:

```python
class CreateListThread(Thread):
    def run(self):
        self.entries = []
        for i in range(10):
            time.sleep(1)
            self.entries.append(i)
        lock.acquire()
        print self.entries
        lock.release()
```

所以, 我们把打印操作放到了一个lock里面. 当一两个线程获得锁并且在打印它的entries时, 其他的线程都不能打印它们的entries. 这样你就会看到不同线程的entries在各行被打印出来了.



这会显示所有线程的entries, 它是一个实例变量, 从0到9的一个列表. 所以线程交换不会影响某个线程的实例变量.



**相关文章**

+ [Writing thread-safe django - get_or_create](http://agiliq.com/blog/2013/08/writing-thread-safe-django-code/)

+ [Process and Threads for Beginners](http://agiliq.com/blog/2013/09/process-and-threads-for-beginners/)

+ [Producer-consumer problem in Python](http://agiliq.com/blog/2013/10/producer-consumer-problem-in-python/)
