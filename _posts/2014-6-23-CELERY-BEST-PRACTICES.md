---
layout: default
title: CELERY - BEST PRACTICES
tags: Python Celery
---

[原文地址](https://denibertovic.com/posts/celery-best-practices/)

<br>

如果你使用 [Django](https://www.djangoproject.com/), 那么你可能会需要处理一些在后台长时间运行的任务. 你可能已经使用了一些任务队列, [Celery](http://www.celeryproject.org/) 是目前 Python (以及 Django) 世界中用来处理这类任务最流行的项目 (但是也有其他的项目).

<br>

在使用 Celery 作为任务队列的一些项目的过程中, 我收集了一些最佳实践并决定把它们写成文档. 虽然这么说, 但是这篇文章更像是我自己的胡言乱语, 关于我认为使用 Celery 的合适方式, 以及一些 Celery 生态系统提供的但还没有被充分利用的特性.

<br>

## No.1: 不要使用数据库作为你的 AMQP Broker

<br>

让我解释下为什么我认为这是错误的(除了 celery 文档中指出的[限制](http://docs.celeryproject.org/en/latest/getting-started/brokers/django.html#limitations)之外).

<br>

数据库不是为了像 RabbitMQ 那样一个合适的 AMQP broker 而设计的. 它可能会在某个时候崩坏, 也许是在某个没有那么多流量/用户群的生产环境中.

<br>

我猜人们决定使用数据库作为 AMQP broker 的最流行的原因是, 他们的 web 应用已经有了一个数据库, 那么为什么不重用它呢. 设置非常容易而且你不需要担心其他的组件(像 RabbitMQ).

<br>

假设这么一个情况: 你有4个后台 workers 在处理你放在数据库里的任务. 这意味着你有4个进程相当频繁地轮询数据库来获取新的任务, 更不要说这4个进程每个都可以有多个并发的线程. 某些时候你注意到, 你在你的任务处理上远远落后了, 更多的任务正在源源不断地涌来而仍有很多任务没有完成, 所以自然地, 你增加了处理任务的 worker 数目. 由于很多 workers 都在轮询数据库的新任务, 你的数据库突然分崩离析, 你的硬盘 IO 已经到了极限, 同时, 因为这些 workers 实际上是在 DDOS 数据库所以你的 webapp 也开始被影响.

<br>

如果你使用合适的 AMQP 比如 [RabbitMQ](http://www.rabbitmq.com/) 的话, 这些就不会发生. 因为一方面, 队列在内存里所以你没有伤害硬盘. 消费者(这些 workers)不需要求助于轮询, 因为队列有一种把新任务推送给消费者的方法, 而且如果 AMQP 确实因为某些其他的原因不堪负重的话, 至少它不会破坏用户使用的 web 应用.

<br>

我会尽量去劝说你不要使用数据库作为一个 broker, 即使是在开发环境中. 像 Docker 以及其他的很多预构建的镜像都已经在[容器之外](https://registry.hub.docker.com/search?q=rabbitmq) 提供了 RabbitMQ.

<br>

## No.2: 使用更多的队列(例如不要只使用默认的一个)

<br>

Celery 相对容易设置, 而且它默认把所有的任务放在一个队列里, 除非你指明. 你经常会看见下面的东西:
<pre>
<code class="python">
@app.task()
def my_taskA(a, b, c):
    print("doing something here...")

@app.task()
def my_taskB(x, y):
    print("doing something here...")
</code>
</pre>

<br>

这里会发生的是 _两个_ 任务都在同一个队列里结束(如果没有在 `celeryconfig.py` 文件里指明的话). 我无疑可以看到这样做的吸引力, 因为只用一个装饰器你就已经得到了一些甜蜜的后台任务. 我在这里担心的是, taskA 和 taskB 可能正在做完全不同的事情, 而它们中的一个可能比另外一个重要得多, 那么为什么要把它们放在同一个篮子里? 假设你已经有了一个 worker 处理这两个任务, 要是不重要的 taskB 数量上非常大导致更重要的 taskA 没有得到 worker 的足够重视, 这样会发生什么呢? 在这一点上, 增加 workers 的数量可能不会解决你的问题因为所有的进程仍然需要处理所有的任务, 如果 taskB 数量很大的话 taskA 还是不会得到它应有的重视. 这把我们带到了下一个问题.

<br>

## No.3: 使用优先 workers

<br>

解决上面这个问题的方法是使 taskA 在一个队列, taskB 在另外一个队列并且分配 `x` 个 workers 来处理 Q1 而其他所有的 workers 去处理更加紧张的 Q2 因为它有更多的任务. 这样你可以保证 taskB 一直有有足够的 workers, 同时也有一些优先 workers 去处理 taskA, 当 taskA 有任务的时候不用在处理上等待太久.

<br>

因此, 手动定义你的队列:
<pre>
<code class="python">
CELERY_QUEUES = (
    Queue('default', Exchange('default'), routing_key='default'),
    Queue('for_task_A', Exchange('for_task_A'), routing_key='for_task_A'),
    Queue('for_task_B', Exchange('for_task_B'), routing_key='for_task_B'),
)
</code>
</pre>

<br>

然后你的 `routes` 会决定哪一个任务会去哪里:
<pre>
<code class="python">
CELERY_ROUTES = {
    'my_taskA': {'queue': 'for_task_A', 'routing_key': 'for_task_A'},
    'my_taskB': {'queue': 'for_task_B', 'routing_key': 'for_task_B'},
}
</code>
</pre>

<br>

这样你可以对每一个任务运行 workers:
<pre>
<code class="python">
celery worker -E -l INFO -n workerA -Q for_task_A
celery worker -E -l INFO -n workerB -Q for_task_B
</code>
</pre>

<br>

## No.4: 使用 Celery 的错误处理机制

<br>

我见过的很多任务压根就没有错误处理的概念. 如果一个任务失败了, 它就失败了. 这对某些用户情形可能有用, 然而, 我见过的大多数任务都需要与第三方的 API 通话, 然后因为某种网络错误失败了, 或者因为其他的"资源可用性"错误失败了. 我们可以处理这些错误的最简单的方法是重试一遍这个任务, 因为第三方的 API 可能正好有一些服务器/网络问题而且它很快就会恢复, 为什么不给它点时间呢?
<pre>
<code class="python">
@app.task(bind=True, default_retry_delay=300, max_retries=5)
def my_task_A():
    try:
        print("doing stuff here...")
    except SomeNetworkException as e:
        print("maybe do some clenup here....")
        self.retry(e)
</code>
</pre>

<br>

我喜欢定义每一个任务再一次尝试之前等待时间的默认值, 以及在最终放弃之前再一次尝试的次数(分别是 `default_retry_delay` 和 `max_retries` 参数). 这是最基本的一种错误处理, 然而我几乎没有看见它被用过. 当然 Celery 在错误处理方面提供了更多的方法, 我把它们留给你自己去 celery 文档里阅读.

<br>

## No.5: 使用 Flower

<br>

[Flower](http://celery.readthedocs.org/en/latest/userguide/monitoring.html#flower-real-time-celery-web-monitor) 项目是用来管理你的 celery 任务和 workers 的一个非常棒的工具. 它是基于 web 的并且允许你做一些管理, 比方说查看任务进程和详细信息, worker 状态, 生成新的 worker 等等. 在提供的链接中可以查看所有特性.

<br>

## No.6: 只有你真的需要的时候才追踪结果

<br>

任务状态是关于任务成功退出或者任务失败的信息. 它对某些之后的统计会有用. 这里需要注意的是退出状态并不是这个任务执行的结果, 这个信息更像是被写入数据库的某种副作用(例如更新某个用户的朋友列表).

<br>

我见过的大多数项目并不是真的关心在任务退出之后任务状态的持续追踪, 但他们中的大多数要么使用默认的 sqlite 数据库保存这个信息, 要么更甚者花费了时间去使用他们的正常数据库( postgres 或者其他).

<br>

为什么要没有原因地伤害你的 web 应用的数据库? 在你的 `celeryconfig.py` 中使用 `CELERY_IGNORE_RESULT = True` 来抛弃这些结果.

<br>

## No.7: 不要把数据库/ORM 对象传递给任务

<br>

在本地的 Python 聚会上讲了这个之后, 一些人建议我把这个也加到列表里. 它是关于什么的呢? 你不应该传递数据库对象(例如你的 User model)给一个后台任务, 因为这个序列化对象可能保留着陈旧的数据. 你想要做的是把 User id 给任务, 然后这个任务再请求数据库来获取新的 User 对象.

<br>
