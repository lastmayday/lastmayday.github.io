---
layout: default
title: An introduction to parallel programming using Python's multiprocessing module
tags: Python
---

[原文地址](http://sebastianraschka.com/Articles/2014_multiprocessing_intro.html)



**多核CPU已经成为了现代计算机结构发展的标准, 它们不仅在超级计算机设备里, 也在我们家里的台式机和笔记本里; Apple 2013年的 iPhone 5S 甚至都有一个 1.3Ghz 的双核处理器.**



然而, Python 默认的解释器秉承极简的设计并且有一个线程安全机制, 这个机制被称为'GIL'(Global Interpreter Lock). 为了防止线程间的冲突, 它一次只执行一条命令(这种做法叫做串行处理, 或者单线程).



在这篇介绍 Python `multiprocess` 模块的文章里, 我们将学会怎样使用多个子进程来避免 GIL 的一些缺点.



## 多线程 vs. 多进程



根据具体的应用, 并行编程的两种方法分别是通过线程或多进程来运行代码. 如果我们把'任务'交给不同的线程, 这些任务可以被描述为一个进程的'子任务', 并且这些线程通常可以访问同一块内存区域(i.e., 共享的内存). 这个方法很容易因为不当的同步而导致冲突, 比方说, 如果多个线程同时向同一块内存区域写入数据.



更安全的一种方法是(尽管它因为不同的进程间通讯而需要额外的开销)把多个进程完全放在分开的内存区域(i.e., 分布式内存): 每一个进程完全独立于其他的进程在运行.



下面我们看一下 Python 的 [multiprocessing](https://docs.python.org/dev/library/multiprocessing.html) 模块, 以及我们怎样使用它来提交多个进程使得这些进程可以相互独立, 来让我们的 CPU 内核物尽其用.



![processing](http://sebastianraschka.com/Images/multiprocessing_scheme.png)



## `multiprocessing` 模块介绍



Python 标准库中的 [multiprocessing](https://docs.python.org/dev/library/multiprocessing.html) 模块有很多强有力的特性. 如果你想知道更多的技巧和细节, 我推荐你阅读[官方文档](https://docs.python.org/dev/library/multiprocessing.html)作为入口.



下面的部分将会对在并行编程中使用 `multiprocessing` 模块的不同方法做一个大致了解.



## `Process` 类



最基本的用法可能就是使用 `multiprocessing` 模块中的 `Process` 类了. 这里, 我们将会并行地使用一个简单的随机字符串生成器来生成4个随机字符串.
```python
import multiprocessing as mp
import random
import string

# Define an output queue
output = mp.Queue()

# define a example function
def rand_string(length, output):
    """ Generates a random string of numbers, lower- and uppercase chars. """
    rand_str = ''.join(random.choice(
                    string.ascii_lowercase
                    + string.ascii_uppercase
                    + string.digits)
               for i in range(length))
    output.put(rand_str)

# Setup a list of processes that we want to run
processes = [mp.Process(target=rand_string, args=(5, output)) for x in range(4)]

# Run processes
for p in processes:
    p.start()

# Exit the completed processes
for p in processes:
    p.join()

# Get process results from the output queue
results = [output.get() for p in processes]

print(results)

# ['yzQfA', 'PQpqM', 'SHZYV', 'PSNkD']
```



### 怎样用特定的顺序取回结果



获取结果的顺序不需要和处理的顺序相同(在 `processes` 列表中的顺序). 因为我们最终是使用 `.get` 方法来从 `Queue` 中顺序地取回数据, 所以线程结束的顺序决定了我们结果的顺序.



例如, 如果第二个进程正好在第一个进程之前结束了, 那么 `results` 中字符串的顺序就可能是 `['PQpqM', 'yzQfA', 'SHZYV', 'PSNkD']` 而不是 `['yzQfA', 'PQpqM', 'SHZYV', 'PSNkD']`.



如果我们的应用需要以某种特定的顺序取回结果, 一种可能是使用线程的 `._identity` 属性. 这样的话, 我们可以简单地使用 `range` 对象中值作为位置参数. 修改后的代码如下:
```python
# define a example function
def rand_string(length, pos, output):
    """ Generates a random string of numbers, lower- and uppercase chars. """
    rand_str = ''.join(random.choice(
                    string.ascii_lowercase
                    + string.ascii_uppercase
                    + string.digits)
                for i in range(length))
    output.put((pos, rand_str))

# Setup a list of processes that we want to run
processes = [mp.Process(target=rand_string, args=(5, x, output)) for x in range(4)]
```



这样取回的结果就会是元组, 例如, `[(0, 'KAQo6'), (1, '5lUya'), (2, 'nj6Q0'), (3, 'QQvLr')] ` 或者 `[(1, '5lUya'), (3, 'QQvLr'), (0, 'KAQo6'), (2, 'nj6Q0')]`.



为了确保我们取回的结果是有序的, 我们可以简单地对结果排序, 是否抛弃位置参数是可选的:
```python
results.sort()
results = [r[1] for r in results]

# ['KAQo6', '5lUya', 'nj6Q0', 'QQvLr']
```



**保持一个结果是有序列表的更简单的一种方法是使用 `Pool.apply` 和 `Pool.map` 函数, 我们将在下一节讨论.**



## `Pool` 类



另外一种更方便的并行处理任务的方法是使用 `Pool` 类.



有四种方法尤其有趣:

+ `Pool.apply`
+ `Pool.map`
+ `Pool.apply_async`
+ `Pool.map_async`



`Pool.apply` 和 `Pool.map` 方法基本相当于 Python 内置的 `apply` 和 `map` 函数.



在我们遇到 `Pool` 方法的 `async` 变种之前, 先看一下使用 `Pool.apply` 和 `Pool.map` 的简单例子. 这里我们会把进程数设置为4, 这意味着 `Pool` 类将只会允许同时运行4个进程.



这次我们会使用一个简单的立方函数, 这个函数返回输入数字的立方值.
```python
def cube(x):
    return x**3
```



```python
pool = mp.Pool(processes=4)
results = [pool.apply(cube, args=(x,)) for x in range(1,7)]
print(results)

# [1, 8, 27, 64, 125, 216]
```



```python
pool = mp.Pool(processes=4)
results = pool.map(cube, range(1,7))
print(results)

# [1, 8, 27, 64, 125, 216]
```



`Pool.map` 和 `Pool.apply` 会锁住主程序知道一个进程结束, 如果我们想对某个特定的应用以特定的顺序获取结果的话这样是非常有用的.



相反, `async`变种会一次性提交所有进程并且一旦它们完成就取回结果. 例如, 立方的结果序列可能是 [8, 1, 64, 27, 125, 216] 如果立方进程以不同的顺序结束的话.



另一个不同之处是, 在`apply_async()`调用之后我们需要使用 `get` 方法来获取已结束进程的 `return` 值.
```python
pool = mp.Pool(processes=4)
results = [pool.apply_async(cube, args=(x,)) for x in range(1,7)]
output = [p.get() for p in results]
print(output)

# [1, 8, 27, 64, 125, 216]
```



## 内核密度估计作为基准函数



在下面的部分, 我想对串行和多处理方法做一个简单的比较, 我会使用一个比上面我们用过的 `cube` 示例稍微复杂一点的函数.



这里我定义了一个概率密度函数来展现一个内核密度估计, 这个函数使用了 Parzen-window 技术.



我不想说太多关于这个技术的理论细节, 因为我们的终点是看 `multiprocessing` 可以怎样被用来提高性能, 但是很欢迎你阅读我写的这篇关于[这里提到的 Parzen-window 方法](http://sebastianraschka.com/Articles/2014_parzen_density_est.html)的更详细的文章.

```python
import numpy as np

def parzen_estimation(x_samples, point_x, h):
    """
    Implementation of a hypercube kernel for Parzen-window estimation.

    Keyword arguments:
        x_sample:training sample, 'd x 1'-dimensional numpy array
        x: point x for density estimation, 'd x 1'-dimensional numpy array
        h: window width

    Returns the predicted pdf as float.

    """
    k_n = 0
    for row in x_samples:
        x_i = (point_x - row[:,np.newaxis]) / (h)
        for row in x_i:
            if np.abs(row) > (1/2):
                break
        else: # "completion-else"*
            k_n += 1
    return (k_n / len(x_samples)) / (h**point_x.shape[1])
```



**关于"completion else"的简短注释**

之前, 我收到过一些评论关于我是不是故意使用 for-else 的组合或者还是我的误用. 这是一个合法的问题, 因为这种'completion-else'很少被使用(我是这样叫它的, 我不知道对这样上下文中的`else`的更'官方的'叫法; 如果有的话请告诉我).



在我的[这一篇](http://sebastianraschka.com/Articles/2014_deep_python.html#else_clauses)博客中有更加详细的解释, 简而言之: 与一个条件 else 对比(同样是和 if 语句组合), 'completion else' 只在前面的代码块(这里是 `for` 循环)已经结束时被执行.



## Parzen-window 方法概述



那么这个 Parzen-window 函数是做什么的呢? 简单的说: 它计算一个特定区域(被叫做 window)里的点, 并且用总点数除以内部的点来估计某个特定区域里有一个点的可能性.



下面是一个简单的例子, 通过一个原点在中心的超立方体来展示 Parzen-window, 我们想要估计一个点在基于这个超立方体的某一块的中心的可能性.
```python
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
import numpy as np
from itertools import product, combinations
fig = plt.figure(figsize=(7,7))
ax = fig.gca(projection='3d')
ax.set_aspect("equal")

# Plot Points

# samples within the cube
X_inside = np.array([[0,0,0],[0.2,0.2,0.2],[0.1, -0.1, -0.3]])

X_outside = np.array([[-1.2,0.3,-0.3],[0.8,-0.82,-0.9],[1, 0.6, -0.7],
                  [0.8,0.7,0.2],[0.7,-0.8,-0.45],[-0.3, 0.6, 0.9],
                  [0.7,-0.6,-0.8]])

for row in X_inside:
    ax.scatter(row[0], row[1], row[2], color="r", s=50, marker='^')

for row in X_outside:
    ax.scatter(row[0], row[1], row[2], color="k", s=50)

# Plot Cube
h = [-0.5, 0.5]
for s, e in combinations(np.array(list(product(h,h,h))), 2):
    if np.sum(np.abs(s-e)) == h[1]-h[0]:
        ax.plot3D(*zip(s,e), color="g")

ax.set_xlim(-1.5, 1.5)
ax.set_ylim(-1.5, 1.5)
ax.set_zlim(-1.5, 1.5)

plt.show()
```



![plot](http://sebastianraschka.com/Images/multiprocessing_cube.png)



```python
point_x = np.array([[0],[0],[0]])
X_all = np.vstack((X_inside,X_outside))

print('p(x) =', parzen_estimation(X_all, point_x, h=1))

# p(x) = 0.3
```



## 样例数据和 `timeit` 基准



在下面的章节中, 我们将从二元正态分布创建一个随机数据集, 以及一个中心在原点的均值向量和一个单位矩阵作为协方差矩阵.


```python
import numpy as np

np.random.seed(123)

# Generate random 2D-patterns
mu_vec = np.array([0,0])
cov_mat = np.array([[1,0],[0,1]])
x_2Dgauss = np.random.multivariate_normal(mu_vec, cov_mat, 10000)
```



下面我们可以看到, 某一点在分布中心的预期的可能性是~0.15915. 这里我们的目标是使用 Parzen-window 来预测基于上面的样例数据集的密度.



为了通过 Parzen-window 技术做一个'好'预测, 它的 - 在其他事情中 - 关键是选择一个合适的 window 宽度. 这里我们将会使用多进程来预测在二元正太分布中心的密度, 分布使用不同的 window 宽度.

```python
from scipy.stats import multivariate_normal
var = multivariate_normal(mean=[0,0], cov=[[1,0],[0,1]])
print('actual probability density:', var.pdf([0,0]))

# actual probability density: 0.159154943092
```



### 基准测试功能



下面, 我们会给串行和多处理方法设置一些基准函数, 这样我们可以传递给 `timeit` 基准函数.



我们会使用 `Pool.apply_async` 函数来同时利用进程的优势. 这里, 我们不关心因为 window 宽度导致的结果顺序, 我们只需要把每一个结果同它相应的输入 window 宽度联系起来.



因此我们稍微调整一下我们的 Parzen-density-estimation 函数, 返回一个有一对值的元组: window 宽度和估计的密度, 这样我们之后可以对结果排序.

```python
def parzen_estimation(x_samples, point_x, h):
    k_n = 0
    for row in x_samples:
        x_i = (point_x - row[:,np.newaxis]) / (h)
        for row in x_i:
            if np.abs(row) > (1/2):
                break
        else: # "completion-else"*
            k_n += 1
    return (h, (k_n / len(x_samples)) / (h**point_x.shape[1]))
```



```python
def serial(samples, x, widths):
    return [parzen_estimation(samples, x, w) for w in widths]

def multiprocess(processes, samples, x, widths):
    pool = mp.Pool(processes=processes)
    results = [pool.apply_async(parzen_estimation, args=(samples, x, w)) for w in widths]
    results = [p.get() for p in results]
    results.sort() # to sort the results by input window width
    return results
```



想想结果看上去会是什么样(i.e., 不同的 window 宽度对应的预测密度):
```python
widths = np.arange(0.1, 1.3, 0.1)
point_x = np.array([[0],[0]])
results = []

results = multiprocess(4, x_2Dgauss, point_x, widths)

for r in results:
    print('h = %s, p(x) = %s' %(r[0], r[1]))
```



```python
h = 0.1, p(x) = 0.016
h = 0.2, p(x) = 0.0305
h = 0.3, p(x) = 0.045
h = 0.4, p(x) = 0.06175
h = 0.5, p(x) = 0.078
h = 0.6, p(x) = 0.0911666666667
h = 0.7, p(x) = 0.106
h = 0.8, p(x) = 0.117375
h = 0.9, p(x) = 0.132666666667
h = 1.0, p(x) = 0.1445
h = 1.1, p(x) = 0.157090909091
h = 1.2, p(x) = 0.1685
```



基于这个结果, 我们可以说最好的 window 宽度可以是 h = 1.1, 因为这个预计值与实际值~0.15915最接近.



因此, 作为基准, 我们创建100个均匀分布在1.0与1.2之间的 window 宽度.
```python
widths = np.linspace(1.0, 1.2 , 100)
```



```python
import timeit

mu_vec = np.array([0,0])
cov_mat = np.array([[1,0],[0,1]])
n = 10000

x_2Dgauss = np.random.multivariate_normal(mu_vec, cov_mat, n)

benchmarks = []

benchmarks.append(timeit.Timer('serial(x_2Dgauss, point_x, widths)',
        'from __main__ import serial, x_2Dgauss, point_x, widths').timeit(number=1))

benchmarks.append(timeit.Timer('multiprocess(2, x_2Dgauss, point_x, widths)',
        'from __main__ import multiprocess, x_2Dgauss, point_x, widths').timeit(number=1))

benchmarks.append(timeit.Timer('multiprocess(3, x_2Dgauss, point_x, widths)',
        'from __main__ import multiprocess, x_2Dgauss, point_x, widths').timeit(number=1))

benchmarks.append(timeit.Timer('multiprocess(4, x_2Dgauss, point_x, widths)',
        'from __main__ import multiprocess, x_2Dgauss, point_x, widths').timeit(number=1))

benchmarks.append(timeit.Timer('multiprocess(6, x_2Dgauss, point_x, widths)',
        'from __main__ import multiprocess, x_2Dgauss, point_x, widths').timeit(number=1))
```



### 准备绘制结果



```python
import platform

def print_sysinfo():

    print('\nPython version  :', platform.python_version())
    print('compiler        :', platform.python_compiler())

    print('\nsystem     :', platform.system())
    print('release    :', platform.release())
    print('machine    :', platform.machine())
    print('processor  :', platform.processor())
    print('CPU count  :', mp.cpu_count())
    print('interpreter:', platform.architecture()[0])
    print('\n\n')
```



```python
from matplotlib import pyplot as plt
import numpy as np

def plot_results():
    bar_labels = ['serial', '2', '3', '4', '6']

    fig = plt.figure(figsize=(10,8))

    # plot bars
    y_pos = np.arange(len(benchmarks))
    plt.yticks(y_pos, bar_labels, fontsize=16)
    bars = plt.barh(y_pos, benchmarks,
         align='center', alpha=0.4, color='g')

    # annotation and labels

    for ba,be in zip(bars, benchmarks):
        plt.text(ba.get_width() + 1.4, ba.get_y() + ba.get_height()/2,
            '{0:.2%}'.format(benchmarks[0]/be),
            ha='center', va='bottom', fontsize=11)

    plt.xlabel('time in seconds for n=%s' %n, fontsize=14)
    plt.ylabel('number of processes', fontsize=14)
    t = plt.title('Serial vs. Multiprocessing via Parzen-window estimation', fontsize=18)
    plt.ylim([-1,len(benchmarks)+0.5])
    plt.xlim([0,max(benchmarks)*1.1])
    plt.vlines(benchmarks[0], -1, len(benchmarks)+0.5, linestyles='dashed')
    plt.grid()

    plt.show()
```



## 结果



```python
plot_results()
print_sysinfo()
```

![result](http://sebastianraschka.com/Images/multiprocessing_benchmark.png)



```python
Python version  : 3.4.1
compiler        : GCC 4.2.1 (Apple Inc. build 5577)

system     : Darwin
release    : 13.2.0
machine    : x86_64
processor  : i386
CPU count  : 4
interpreter: 64bit
```



## 结论



可以看到如果我们并行提交的话, 可以加速我们的 Parzen-window 函数. 然后, 在我特定的机器上, 提交6个并行的6个进程并没有导致更多的性能提升, 这只对4核的CPU有用.



我们也注意到当我们使用3个而不是2个并行的时候有一个明显的性能提升. 然而当我们使用4个并行进程的时候并没有那么明显的性能提升. 这可以归结为这种情况下的一个事实, CPU只由4核组成, 以及系统进程, 比如操作系统, 也在后台运行. 因此, 第四个内核并没有剩余足够的能力来增加第四个进程的性能. 同时, 我们也需要记住, 每一个额外的进程都会给进程间通信带来一个额外的开销.



而且, 因为并行处理带来的提升只对'CPU约束'的任务有效, 'CPU约束'的任务主要是花费在CPU上, 相反是 I/O 约束的任务, i.e., 从硬盘读取数据进行处理的任务.



---------



### 翻译完的读后感(好傻的名字...



文章里有提到的那个在`for`代码块结束后使用`else`的用法, 正好最近在读[编写高质量代码: 改善Python程序的91个建议](http://book.douban.com/subject/25910544/), 里面也提到了这种用法. 这本书里提到的是使用`else`字句简化循环(异常处理), 当`try`块没有抛出任何异常的时候, 执行`else`块.



后面那部分计算密度还是什么的... 感觉翻译的不好对不住了!(实在是读不下去...
