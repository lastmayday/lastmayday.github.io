---
layout: default
title: The Java Memory Model, synchronization and volatile
tags: Java
---

一篇关于 Java 内存模型的笔记.

<br>

## Memory Model

<br>

在了解 Java Memory Model 之前先了解一下什么是 Memory Model.

<br>

多处理器的系统中通常会有一层或多层内存缓存, 可以提高获取数据的速度, 减少共享内存总线的数据交换. 但是如果正好有两个处理器同时在检查同一个内存位置的话, 它们怎样才能得到相同的值值呢?

<br>

在处理器的角度, 内存模型定义了一些条件和限制, 使得其他处理器写到内存里的数据可以被当前线程获取, 当前线程写的数据可以被其他处理器获取.

<br>

## Java Memory Model

<br>

Java Memory Model 描述的是在多线程的情况下什么样的行为是合法的, 以及多线程如何通过内存交互. 它用来描述程序里的变量与底层的计算机系统的关系, 怎样把变量保存到计算机系统的内存或寄存器里以及怎样把它们从内存或寄存器里取出来.

<br>

JMM 定义了 `volatile`, `synchronized` 等的行为, 并且保证 `synchronized` 的 Java 程序能在所有架构的处理器上正确运行.

<br>

### Shared Variables

<br>

可以在线程间共享的内存叫做 shared memory 或者 heap memory.

所有的 instance fields, static fields, 以及 array elements 都保存在堆内存.

local variables, formal method parameters 以及 exception handler parameters 都不会在线程间共享, 也不会影响到内存模型.

<br>

### reorder

<br>

编译器可以因为优化重排序某些指令; 处理器也可能在某些情况下不按顺序执行指令. 所以数据可能不是按程序里写的顺序在寄存器, 处理器缓存和主存中移动.

<br>

### happen before

<br>

JMM 在内存操作(如 read field, write field, lock, unlock)和线程操作(如 start, join)设置了部分顺序, 也就是说某些操作 _happen before_ 其他操作. 如果一个操作 happens before 另一个操作, 那么第一个操作的顺序一定保证是在第二个之前, 并且对第二个可见.

<br>

happen before 顺序的规则:

- 程序次序规则(Program Order Rule): 在**一个线程**内, 按照程序顺序, 写在前面的操作先于写在后面的操作
- 管程锁定规则(Monitor Lock Rule): 对于**同一个锁**, 一个 unlock 操作先于后面的 lock 操作
- `volatile` 变量规则(Volatile Variable Rule): 对于**一个 volatile 变量**的写操作先于后面对这个变量的读操作
- 线程启动规则(Thread Start Rule): `Thread` 对象的 `start()` 方法先于该线程的每一个动作
- 线程终止规则(Thread Termination Rule): 线程中的所有操作都先于对该线程的终止检测, 可以通过 `Thread.join()` 方法结束, `Thread.isAlive()` 的返回值等方式检测到线程已终止执行
- 线程中断规则(Thread Interruption Rule): 对线程的 `interrupt()` 方法调用先于被中断线程的代码检测到中断事件发生, 可以通过 `Thread.interrupted()` 方法检测是否有中断发生
- 对象终结规则(Finalizer Rule): 一个对象的初始化完成(构造函数执行结束)先于它的 `finalize()` 方法的开始
- 传递性(Transitivity): 如果操作 A 先于操作 B, 操作 B 先于操作 C, 那么可以得出操作 A 先于操作 C

<br>

### Synchronization

<br>

Java synchronization 是通过 _monitors(locks)_ 实现的.

<br>

Java 的每一个对象都与一个 monitor 相关联, thread 可以对这个 monitor 执行 _lock_ 或者 _unlock_ .  一次只能有一个线程持有这个 monitor 的 lock, 其他尝试获取锁的线程只能阻塞直到它们能获取到这个锁.

- `synchronized` statement 是对这个对象的 monitor 加锁. 如果 `synchronized` 语句的内容执行退出了, 无论是正常退出还是异常退出, 这个 monitor 都会自动执行释放锁的操作.

- `synchronized` method 在它被调用的时候执行加锁; 如果这个方法是实例方法(instance method), 那么会锁住它被调用这个实例的 monitor (即在执行方法时的 `this` 对象); 如果这个方法是 `static` 方法, 那么会锁住这个方法被定义时代表这个类的 `Class` 对象的 monitor. 同样无论内部方法是正常还是异常退出, monitor 的锁都会自动释放.

<br>

#### no-op synchronized

<br>

注意下面这种方式可能会被编译器完全移除.

<pre>
<code class="java">
synchronized (new Object()) {}
</code>
</pre>

因为被加锁的是 `new Object()`, 也就是说在操作之前这个 monitor 不会被加锁, 并且当这个锁释放之后, 不会再有其他线程请求这把锁. 所以编译器可以把这一部分完全移除.

<br>

### volatile

<br>

`volatile` 的变量有两个特性:
- 保证变量对所有线程的可见性
- 禁止指令重排序优化

<br>

> The compiler and runtime are prohibited from allocating them in registers. They must also ensure that after they are written, they are flushed out of the cache to main memory, so they can immediately become visible to other threads. Similarly, before a volatile field is read, the cache must be invalidated so that the value in main memory, not the local processor cache, is the one seen. 

编译器和运行时环境被禁止在寄存器中分配 `volatile` 变量. 同时一旦 `volatile` 被写入就会立刻被刷入主存. 同样在读取 `volatile` 变量之前, 处理器的缓存会被置为失效从而保证从主存里获取值.

<br>

volatile 变量只能保证可见性, 在不符合以下两台规则的运算场景中, 仍然需要通过加锁(使用 `synchronized` 或 `java.util.concurrent` 中的原子类) 来保证原子性:
- 运算结果不依赖变量的当前值, 或者能够确保只有单一的线程修改变量的值
- 变量不需要与其他的状态变量共同参与不变约束

<br>

## Reference

- [Java Language Specification - Chapter 17. Threads and Locks](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html)
- [The Java Memory Model](http://www.cs.umd.edu/~pugh/java/memoryModel/)
- [Why is `synchronized (new Object()) {}` a no-op?](https://stackoverflow.com/questions/37142411/why-is-synchronized-new-object-a-no-op)
- [深入理解 Java 虚拟机](https://book.douban.com/subject/24722612/)


