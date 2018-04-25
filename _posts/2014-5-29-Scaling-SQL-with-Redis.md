---
layout: default
title: Scaling SQL with Redis
tags: Redis
---

[原文地址](http://cramer.io/2014/05/12/scaling-sql-with-redis/)



我爱Redis. 它是会让你觉得相见恨晚的技术之一. 可预测, 高性能, 适应性强, 它让我我近几年来用的越来越多. [Sentry](https://github.com/getsentry/sentry) 主要是用PostgreSQL也不是秘密了(尽管它现在也依赖许多其他的技术).



一个多星期之前我在 [Python Nordeste](http://2014.pythonnordeste.org/) 发表了一个演讲. 它建议我做一个简短的演讲. 所以我决定我们用来扩展 Sentry 的一些很酷的hacks, 特别是使用Redis的技术. 这篇文章是这个五分钟演讲的一个扩展版本.



## 缓解行竞争



在 Sentry 早期开发的时候, 我们采用的技术现在已经成为了 [sentry.buffers](https://github.com/getsentry/sentry/blob/master/src/sentry/buffer/redis.py). 它是一个简单的系统, 可以允许我们用一个简单的 [Last Write Wins](http://en.wikipedia.org/wiki/Eventual_consistency) 策略来实现一些非常高效的缓冲计数器. 需要注意的是我们使用这种方法完全消除了任何形式的耐久力(它非常适合 Sentry 工作的方法).



操作非常的简单直白, 每当有一个更新的时候我们就采取如下操作:

1. 创建绑定到给定实体的散列键
2. 使用 `HINCRBY` 增加 'counter'
3. `HSET` 各个 LWW 数据(例如"最后一次看见")
4. 使用当前的时间戳 `ZADD` 这个散列键到一个 'pending' 的集合



现在每个刻度(Sentry 是10秒), 我们就会转存这些缓冲区并扇出这些写入的数据. 看上去像下面这样:

1. 使用 `ZRANGE` 获取所有的键
2. 对每个 'pending' 的键都在 RabbitMQ 中新建一个任务
3. `ZREM` 给定的键



现在 RabbitMQ 的工作可以获取并且清除这个散列, 'pending' 的更新已经从集合中弹出了. 这里有一些需要注意的:

+ 我们使用了一个有序集合. 因为我们只希望某个数量的数据弹出(例如我们想要最旧的100个).

+ 一旦我们在处理完某个键的时候, 队列中还有多个任务都是处理这个键的, 这些多余的任务不会做任何操作, 因为其他任务已经处理过并且把这个散列移除了.

+ 这个系统持续在很多 Redis 节点上扩展, 通过在每个节点上放一个 'pending' 的键.



这个模型几乎保证了SQL中一次只有一行被更新, 这缓解了大多数锁竞争. 这对 Sentry 十分有利, 因为它处理了一组突发数据最后被分到同一个计数器的情况.



## 速率限制



因为 Sentry 的性质, 我们需要一直处理 [denail-of-service attack](http://en.wikipedia.org/wiki/Denial-of-service_attack). 我们使用了很多速率限制器来对抗它, 其中之一就是使用的 Redis. 它是最直截了当的应用之一, 在 [sentry.quotas](https://github.com/getsentry/sentry/blob/master/src/sentry/quotas/redis.py) 中使用.



逻辑非常直白, 看上去是下面这样:
```python
def incr_and_check_limit(user_id, limit):
    key = '{user_id}:{epoch}'.format(user_id, int(time() / 60))

    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, 60)
    current_rate, _ = pipe.execute()

    return int(current_rate) > limit
```



我们处理速率限制的方法说明了 Redis 优于 memcache 的最基本的好处之一: 可以对空键使用 `incr`. 在 memcache 中为了实现同样的功能必须采用下面这样的方法:

```python
def incr_and_check_limit_memcache(user_id, limit):
    key = '{user_id}:{epoch}'.format(user_id, int(time() / 60))

    if cache.add(key, 0, 60):
        return False

    current_rate = cache.incr(key)

    return current_rate > limit
```



实际上, 我们最终采用这种方法在 Sentry 中一些不同的事情上来做短期的数据跟踪. 在一个这样的情况下, 我们可以在一个有序集合里存放用户数据, 然后我们可以很快找出在某个短期时间内最活跃的用户.



## 基本的锁



因为 Redis 没有高可用性, 我们对锁的使用使得它成为这个工作的好工具. 我们不再会在 Sentry 的核心使用它们, 但是一个使用示例是, 我们想要最小化并发并且减少空操作. 它对 cron-like 的任务, 也就是需要经常执行但是不需要强协作的任务非常有用.



在 Redis 中这样做非常简单, 只用使用 `SETNX` 操作:
```python
from contextlib import contextmanager

r = Redis()

@contextmanager
def lock(key, nowait=True):
    while not r.setnx(key, '1'):
        if nowait:
            raise Locked('try again soon!')
        sleep(0.01)

    # limit lock time to 10 seconds
    r.expire(key, 10)

    # do something crazy
    yield

    # explicitly unlock
    r.delete(key)
```



既然 [Lock() within Sentry](https://github.com/getsentry/sentry/blob/master/src/sentry/utils/cache.py) 使用的 memcached, 显然我们可以把它移到 Redis.



## 时间序列数据



最近我们写了一个新的机制来存储 Sentry 中时间序列的数据(在 [sentry.tsdb](https://github.com/getsentry/sentry/blob/master/src/sentry/tsdb/redis.py) 中). 这受到了 RRD 模型很大的启发, 尤其是 Graphite. 我们想要一个简单并且快速的方法来存储短期(e.g. 一个月)的时间序列数据, 它需要允许对写入有比较高的吞吐量, 并且允许我们计算短期速率极低的延迟. 这是第一个我们实际上想使用 Redis 持久化数据的模型, 也是另外一个使用计数器的简单例子.



我们目前的模型在单个散列表中存储了整个间隔的系列. 例如, 这意味着对于某个给定的键类型和某个给定的 1-second 的所有计数都在同一个散列键中. 它看上去像这样:

```json
{
    "<type enum>:<epoch>:<shard number>": {
        "<id>": <count>
    }
}
```



这样在我们的例子中, 假设我们正在跟踪事件的数量. 我们的枚举映射数据类型为"1". 决议是 1s 所以我们的时期是以秒计的当前时间. 这个散列最后看上去是这样的:

```json
{
    "1:1399958363:0": {
        "1": 53,
        "2": 72,
    }
}
```



另外一个可选的模型可以使用简单的键, 只用显示在这些键里增加数据:
```json
"1:1399958363:0:1": 53
```



我们选择这个散列表有两个原因:

+ 我们可以一次性 TTL 整个键(这也有缺点, 但是至今为止还是稳定的的).

+ 键得到了**很好的压缩**, 这是一个效果相当显著的方法.



另外, 分片数字键允许我们分配一个 bucket 给一个固定数量的虚拟片(我们使用64, 它映射到32个物理节点).



现在使用 [Nydus](https://github.com/disqus/nydus) 和`map()`来查询数据. 这段代码对于这个操作相当重了, 但是希望它不是过于庞大:
```python
def get_range(self, model, keys, start, end, rollup=None):
    """
    To get a range of data for group ID=[1, 2, 3]:

    Start and end are both inclusive.

    >>> now = timezone.now()
    >>> get_keys(tsdb.models.group, [1, 2, 3],
    >>>          start=now - timedelta(days=1),
    >>>          end=now)
    """
    normalize_to_epoch = self.normalize_to_epoch
    normalize_to_rollup = self.normalize_to_rollup
    make_key = self.make_key

    if rollup is None:
        rollup = self.get_optimal_rollup(start, end)

    results = []
    timestamp = end
    with self.conn.map() as conn:
        while timestamp >= start:
            real_epoch = normalize_to_epoch(timestamp, rollup)
            norm_epoch = normalize_to_rollup(timestamp, rollup)

            for key in keys:
                model_key = self.get_model_key(key)
                hash_key = make_key(model, norm_epoch, model_key)
                results.append((real_epoch, key, conn.hget(hash_key, model_key)))

            timestamp = timestamp - timedelta(seconds=rollup)

    results_by_key = defaultdict(dict)
    for epoch, key, count in results:
        results_by_key[key][epoch] = int(count or 0)

    for key, points in results_by_key.iteritems():
        results_by_key[key] = sorted(points.items())
    return dict(results_by_key)
```



它归结为如下几步:

+ 生成所有需要的键.
+ 使用一个工作池, 获取最低限度的网络操作的情况下的所有结果(Nydus 介意这个).
+ 给出结果, 把它们映射到一个结果集, 这个结果集显示了在给定的间隔和给定的键的buckets.



## 简单的选择



我对通过简单的方法解决问题有很大的兴趣, 而 Redis 无疑适合这个. 它的[文档](http://redis.io/commands)非常神奇, 而且如果你想要弄懂类似 memcached 的东西的话, Redis 的门槛是最低的. 但是它也有需要权衡的地方(主要是如果你打算使用它持久化存储的话), 它们是先锋而且非常直白.



Redis 可以为你解决什么?
