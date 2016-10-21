---
layout: default
title: 算法笔记-优先队列
tags: Algorithm
---

最近看了一点点 [算法](https://book.douban.com/subject/4854123/), 确实是本非常好的书.

看的是第二部分 Sorting 里的 Priority Queues 一节, 感觉学到不少东西, 记一点笔记.

<br>

## 简介

<br>

优先队列的两个重要方法是 `insert` 插入元素和 `delMax/delMin` 删除最大/最小元素.

一种实现方式是二叉堆.

<br>

> 二叉堆中位置 k 的节点的父节点的位置是 floor(k/2), 它的两个子节点的位置是 2k 和 2k+1.
> 这样通过数组就可以实现.

<br>

插入新元素的时候, 先把这个元素添加到最后一个位置, 并增加二叉堆额大小, 然后为了保持有序这个元素可能需要上浮;

删除最大/最小元素的时候, 先把最后一个元素放到最顶端, 并减少二叉堆的大小, 然后为了保持这个元素需要下沉.

<br>

大堆的上浮和下沉的部分代码如下.

```java
private void swim(int k) {
  while(k > 1 && less(k/2, k)) {
    exch(k/2, k);
    k = k/2;
  }
}

private void sink(int k) {
  while(2*k <= n) {
    int j = 2*k;
    if (j < N && less(j, j+1)) j++;
    if (!less(k, j)) break;
    exch(k, j);
    k = j;
  }
}

public void insert(T k) {
  pq[++n] = k;
  swim(n);
}

public T delMax() {
  T max = pq[1];
  exch(1, n--);
  pq[n+1] = null;
  sink(1);
  return max;
}
```

<br>

## 应用

<br>

优先队列的一个应用场景是找出输入流中 M 个最大/最小的元素.

只用构造一个 MinPQ / MaxPQ, 当元素超过 M 时执行 delMax() / delMin() 再 insert().

直接排序后再取前 M 个元素的缺点是, 如果输入流很大那么效率就会比较低, 而且会浪费不必要的空间存储大于 M 个的元素.

<br>

### 找到输入流的中位数

<br>

问题具体看 [这里](https://www.hackerrank.com/challenges/ctci-find-the-running-median),
大意是说有一个输入流, 每新输入一个数字就计算所有已输入数字的中位数.

<br>

思路:

1. 构造两个优先队列 MinPQ 和 MaxPQ, 对于输入的前两个元素, 较大的一个放入 MinPQ, 较小的一个放入 MaxPQ;
2. 对于后面的每一个元素, 如果小于 MaxPQ 的根节点, 那么放入 MaxPQ; 否则放入 MinPQ;
3. 如果 MinPQ 和 MaxPQ 的节点数相差大于 1, 那么把节点数多的优先队列的根节点删掉并放入另一个里;
4. 如果两个队列的节点数相同的话, `中位数 = (MinPQ 的根节点 + MaxPQ 的根节点) / 2`; 否则, `中位数 = 节点数多的优先队列的根节点`.

<br>

### 多路归并

<br>

如果有多个有序的输入流, 需要整合成一个有序的输出, 那么可以使用索引优先队列.

如果空间足够, 也可以简单地把输入流全部读入一个数组并排序, 但优先队列对无论多长的输入都可以处理.

<br>

> 索引优先队列可以看作是能快速访问其中最小/最大元素的数组. `pq.insert(k, item)` 指把 k 加入这个队列并使得 `pq[k] = item`;
> `pq.change(k, item)` 指令 `pq[k] = item`; `pq.delMin()` 指删除最小元素并返回这个最小元素的索引.

<br>

多路归并举例:

```java

public class MultiWay {
  public static void merge(In[] streams) {
    int n = streams.length;
    IndexMinPQ<String> pq = new IndexMinPQ<String>(n);

    for (int i = 0; i < n; i++) {
      if (!streams[i].isEmpty()) {
        pq.insert(i, streams[i].readString());
      }
    }

    while(!pq.isEmpty()) {
      StdOut.println(pq.min());
      int i = pq.delMin();

      if (!streams[i].isEmpty()) {
        pq.insert(i, streams[i].readString());
      }
    }
  }

  public static void main(String[] args) {
    int n = args.length;
    In[] streams = new In[N];
    for (int i = 0; i < n; i ++) {
      streams[i] = new In(args[i]);
    }
    merge(streams);
  }
}
```

<br>

### 调度

<br>

假设有 M 个相同的处理器以及 N 个任务, 我们的目标是用尽可能短的时间在这些处理器上完成所有的任务.
一种较优的调度方法是最大优先. 先把任务按照耗时降序排列, 将每个任务依次分配给当前可用的处理器.

<br>

思路:

1. 按耗时逆序排列任务
2. 构造一个 M 大小的 MinPQ
3. 对每个任务, 丢给当前 delMin() 得到的处理器处理, 然后再把这个处理器插入优先队列

<br>
