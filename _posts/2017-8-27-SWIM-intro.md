---
layout: default
title: 一种分布式健康检测和节点变更的协议 - SWIM 介绍
tags: Distribution
---

[Consul](https://www.consul.io/docs/internals/gossip.html) 里使用一种 gossip 协议来管理节点以及向集群广播消息. 底层功能通过 [Serf](https://www.serf.io/docs/internals/gossip.html) 来提供.

Serf 使用的这个 gossip 协议是基于 [SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol](http://www.cs.cornell.edu/~asdas/research/dsn02-swim.pdf) 协议来实现的.



这里主要介绍一下 SWIM 协议的具体内容以及 Serf 对此做的一些优化.



## 传统的心跳检测



传统的心跳协议一般是, 其他节点向一个中心节点不停地发送心跳. 这样会导致这个中心节点成为单点, 并且这个单点会成为 hotspot. 随着节点的增加, 中心节点无法随之扩容.

另外一种心跳协议是, 集群里的各个节点向其他所有节点广播心跳, 这样会使得网络负载随着节点的增加而增大. 并且当有多个节点挂掉之后, 故障检测的时间会无法预料.



## SWIM 协议



SWIM 协议主要由两个部分组成:

1. 节点状态更新的传播: 在集群中传播节点加入/离开/失败等状态信息
2. 故障检测: 检测已经存在的节点是否发生故障



在之前的一些研究里, 表明了分布式故障检测协议一般都要如下属性:

1. 强一致性: 集群里任意节点的 crash 都可以被所有正常的节点检测到
2. 故障检测的速度: 指的是一个节点发生故障到故障被集群里的*某些*节点检测到时间间隔
3. 准确性: 故障检测的误报率
4. 网络消息负载: 协议每秒生成的字节数



### 基本的 SWIM



![swim1](http://qiniu.lastmayday.com/swim1)



如上图所示, 在每个故障检测周期 T<sup>'</sup> 内, 从 M<sub>i</sub> 的节点列表里随机选择一个节点, 假设为 M<sub>j</sub>.
从 M<sub>i</sub> 向 M<sub>j</sub> 发送一个 `ping`. 然后 M<sub>i</sub> 等待 M<sub>j</sub> 返回 `ack`.

如果在指定的时间内没有收到 `ack` 那么 M<sub>i</sub> 会开始调查 M<sub>j</sub> 是否故障.
此时, M<sub>i</sub> 从几点列表里随机选择 k 个节点发送 `ping-req(Mj)`. 这 k 个节点接收到消息后对 M<sub>j</sub> 再从发送 `ping`, 如果 M<sub>j</sub> 返回了 `ack` 就把这个 ack 消息转发给 M<sub>i</sub> .

最后 M<sub>i</sub>判断是否有收到 `ack`, 无论是从 M<sub>j</sub> 直接返回的还是其他节点转发的 `ack`.
如果没有收到, 那么在它本地的节点列表里把 M<sub>j</sub> 标记为故障, 然后把故障信息转交给传播组件处理.



上述协议里使用其他节点给 M<sub>j</sub> 发消息而不是直接让 M<sub>i</sub> 多发几次消息的原因是, 避免是 Mi 和 Mj 之间的网络拥堵造成的超时.



检测到节点故障之后, 故障信息会广播给集群里的其他节点. 其他节点接收到之后会把 M<sub>j</sub> 从本地的节点列表里移除.

新加入的节点信息或自愿退出的节点信息通过同样的方式广播给其他节点.



### 增强的 SWIM



#### 传播机制优化



在上述协议的传播组件里, 需要广播故障或新节点等信息.

在大多数网络环境或操作系统里可以使用硬件广播和 IP 地址广播, 但出于管理考虑, 一般不会开放使用.

这样基本的 SWIM 协议需要使用更昂贵的广播或者很没有效率的 P2P 传播.



增强的 SWIM 协议通过在故障检测组件的 ping, ping-req 以及 ack 消息中捎带(piggyback)信息, 消除了对广播原语的外部依赖.

叫做感染式传播机制, 因为很像人群中的谣言传播或者传染病传播.



每个节点 Mi 会在维护一个最近节点更新的 buffer 以及每个 buffer 元素在本地一个 count.
每个 buffer 元素的本地 count 指明了到目前为止, 这个元素被 Mj 携带的次数.
用来判断下一次捎带哪个元素.

如果 buffer 大小超过了单个 ping 或 ack 可以捎带的最大大小, 那么会优先捎带次数最少的元素.



#### 故障检测优化



基本的 SWIM 协议可能会因为某个节点缓冲区溢出而大量丢包, 或者机器负载过高导致没有及时响应 ping 请求. 从而被误判为故障节点.



改进的协议里增加了怀疑(suspicion)机制. 当 M<sub>j</sub> 没有响应 M<sub>i</sub> 的 ping 消息时, M<sub>i</sub> 会把 M<sub>j</sub> 标记为可疑, 并通过传播组件在集群内传播 {Suspect M<sub>j</sub>: M<sub>i</sub> supects M<sub>j</sub> } 消息.
任意节点 M<sub>l</sub> 接受到怀疑消息之后也会把 M<sub>j</sub> 标记为可疑.

可疑的节点仍然会留在节点列表中, 并会像对待正常节点一样.



如果节点 M<sub>l</sub> 成功地 ping 了可疑节点 M<sub>j</sub>, 会移除节点列表里 M<sub>j</sub> 的可疑标签, 并在集群中传播 {Alive M<sub>j</sub>: M<sub>l</sub> knows M<sub>j</sub> is alive} 消息. 收到消息的节点都会把 M<sub>j</sub> 的可疑标签移除.

注意, 如果 M<sub>j</sub> 收到了自己可疑的消息, 会开始传播一个 Alive 消息表明自己还活着.



在特定的超时时间之后, 如果 M<sub>h</sub> 中的 M<sub>j</sub> 被标记为可疑, 那么 M<sub>h</sub> 会把 M<sub>j</sub> 从节点列表中移除, 并向集群中传播 {Confirm M<sub>j</sub>: M<sub>h</sub> declares M<sub>j</sub> as faulty} 消息.

这个故障确认消息会覆盖之前的怀疑消息或存活消息, 并从所有的节点列表中删除 M<sub>j</sub>.



怀疑机制减少了故障误判率.



对于同一个节点的多次 Suspect 或 Alive 消息通过唯一的标识符来区分. 这些标识符通过节点列表里每个元素的一个虚拟生命周期数(incarnation number)提供. 这个数字对于节点来说是全局的.



节点 M<sub>i</sub> 的初始生命周期数为 0, 当它加入到集群后, 这个值只能被它自己增加. 当它接受到在当前生命周期数里自己被怀疑的消息, M<sub>i</sub> 会用它的标识符和递增的生命周期数生成一个 Alive 信息, 并在集群中广播.



#### 故障检测目标选择



基本的 SWIM 协议保证最终能检测某个节点的故障, 但对于节点开始故障和检测出故障之间的时间间隔没有明确保证.



M<sub>i</sub> 会维护一个当前的节点列表, 但不是随机选择一个节点作为 ping 的目标, 而是使用 round-robin.

新加入的节点会随机地选择列表里的一个位置插入.

一旦完成了整个列表的一个遍历, M<sub>i</sub> 会再次随机地对列表重新排序.



如果成员列表的大小不超过 n<sub>i</sub>, 这样保证了节点从失败到被检测出失败不会超过 (2n<sub>i</sub> - 1) 个协议周期.



### Serf 优化



Serf 对 SWIM 的修改主要是为了增加传播速度和提高收敛率.

修改如下.



+ Serf 会定期通过 TCP 执行一次完整的状态同步. 而 SWIM 只是通过 gossip 协议传播状态变化. 虽然都会达到最终一致性, 但 Serf 可以更快地收敛以及从网络分区中恢复.
+ Serf 从故障检测协议里独立出了一个专用的 gossip 层. 而 SWIM 只在检测消息顶层携带 gossip 消息. Serf 与专用的 gossip 消息一起携带. 这样会有更高的 gossip 率(比如 200ms 一次), 以及更低的故障探测率(如每秒一次). 即更快的收敛率和数据传播速度.
+ Serf 会保存故障节点的状态一段时间, 这样当请求完整的状态同步时, 请求者也会收到故障节点的信息. 因为 SWIM 没有完整同步, 所以 SWIM 是在节点收到故障通知之后就直接把故障节点删除了. 这个修改可以帮助集群更快恢复.
