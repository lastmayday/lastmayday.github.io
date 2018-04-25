---
layout: default
title: Binary Indexed Tree and Segment Tree
tags: Algorithm
---

Binary Indexed Tree (BIT) 是一种数据结构, 看名字就能看出来是个 binary tree. 它可以用来解决数组区间的问题.
比如给定一个数组, 求范围 [i, j] 内所有值的和. 如果每次通过遍历求和, 那么时间复杂度是 O(n);
通过使用 BIT 可以把时间复杂度降低到 O(log(n)).

Segment Tree 和 BIT 比较类似, BIT 能解决的问题一般用 Segment Tree 也能解决.

## Binary Indexed Tree

先给个例子, 比较好理解.

[Range Sum Query - Mutable](https://leetcode.com/problems/range-sum-query-mutable/description/):
给定一个都是整型的数组, 计算出下标 i 到下标 j 这个区间内的所有数字的和, i <= j 并且包含 i 和 j.
`update(i, val)` 函数把下标 i 所在位置的值更新为 val.

假设数组为 [2, 3, 1, 4, 3, 2].

### 构建 BIT

那么通过这个给定的数组我们可以构造一个 BIT 的数据结构, 如下图所示.

<img src="http://oujx0uay0.bkt.clouddn.com/bit.png" style="width:600px;" />

上图的最下层是数组索引, 然后是原数组; 最上层是生成的 Binary Indexed Tree, 下方是表示该 BIT 的数组.

我们在原数组的头部新增加一个空值, 然后忽略索引 0 , 即从 1 开始表示原数组. 新数组 nums[] = [0, 2, 3, 1, 4, 3, 2].

对于奇数索引(如上图中的 1, 3, 5), 在新的 BIT 数组中填入原数组对应的值, 如 tree[1] = nums[1].
对于偶数索引(如上图中的 0, 2, 4), 在新的 BIT 数组中的值, 是它左子树的和加上原数组对应的值得到的.
比如 tree[2] = 5 = tree[1] + nums[2] = nums[1] + nums[2] = 2 + 3 = 5.

### 计算区间和

这样 BIT 构建成功之后, 如果要计算原来的数组区间 [i, j] 的和, 就可以通过 tree[] 数组计算出 [0, i] 的和 sum<sub>i</sub>, 以及 [0, j + 1] 的和 sum<sub>j</sub>, 再用 sum<sub>j</sub> - sum<sub>i</sub> 得到结果.

那么 sum<sub>i</sub> 要怎么计算?
假设 j = 5, 需要计算 sum<sub>5</sub> .即 j + 1 = 6, 6 用二进制表示为 110. 那么使用二进制表示: s[110] =  tree[100] + tree[110] . 即 s[6] = tree[4] + tree[6] = 10 + 5 = 15.

再假设 j = 2, 需要计算 sum<sub>2</sub> . 即 j + 1 = 3, 3 用二进制表示为 011. 那么使用二进制表示: s[011] = tree[010] + tree[011] = 5 + 1 = 6 .

这里计算和 s 其实就是对于某个索引的二进制表示, 从低位到高位依次把 1 变成 0 得到值就是 bit 数组的索引, 直到所有位都变成 0. 再把这些值和该索引在 bit 的值相加. 比如上面的 011 -> 010 -> 000.

从低位到高位依次把 1 变成 0 可以通过补码实现. 对于数字 num 可以表示成 a1b , 其中 1 是最低位的 1, a 表示 1 这一位高位的其他位, b 表示 1 这一位低位的其他位. 因为 1 是最低位的 1, 所以 b 全部由 0 组成, b 的补码 b<sup>-</sup> 全部由 1 组成 . num 的补码 (a1b)<sup>-</sup> . 那么 -num = (a1b)<sup>-</sup> + 1 = a<sup>-</sup>0b<sup>-</sup> + 1 = a<sup>-</sup>0(1...1) + 1 = a<sup>-</sup>1(0...0) = a<sup>-</sup>1b . 即 num & -num = a1b & a<sup>-</sup>1b = (0...0)1(0...0) . 即 num - (num & -num) 就可以把低位的 1 变成 0.

以上计算 BIT 索引 i 的和, 用代码表示为:

```java
public int getTreeSum(int i) {
    int sum = 0;
    while (i > 0) {
        sum += tree[i];
        i -= (i & -i);
    }
    return sum;
}
```

### 更新索引值

另一个需求是数组的在某个索引的值可以被更新. 这样我们生成的 Binary Indexed Tree 也要更新.

从上面的分析中可知, tree[] 只用更新用到这个节点计算和的节点, 即索引大于它的父节点们. 比如如果执行 update(4, 1), 那么原数组变为 [2, 3, 1, 4, 1, 2]. tree[5] 为奇数索引, 直接更新 tree[5] = 1, 另外因为 tree[6] 是由 tree[5] 求和得到, 所以 tree[6] 也需要更新, tree[6] = 3 .

即更新后如下所示(更新的节点用红框表示):

<img src="http://oujx0uay0.bkt.clouddn.com/bit2.png" style="width:600px;" />

上面我们已经知道了 num & -num = a1b & a<sup>-</sup>1b = (0...0)1(0...0) , 那么 num + (num & - num) 就可以得到大于 num 的下一个待更新节点.

用代码表示为:

```java
public void update(int i, int val) {
    int j = i + 1;
    int diff = val - nums[j];
    while (j < nums.length) {
        tree[j] += diff;
        j += (j & -j);
    }
    nums[i + 1] = val;
}
```

### 获取原始数组值

如果我们保存了一份数组 nums[], 那么可以直接获取. 但如果为了减少内存, 我们只保留了 Binary Indexed Tree, 那么要如何获取原始的数组值呢?

假设我们需要获取索引 i 的原始值.

一种方法是通过 `getTreeSum(i + 1) - getTreeSum(i)` 获取, 这种方法的时间复杂度是 2 * O(log(n)) .

另一种方法, 对于任意索引 x, 它的前序节点 y, 可以把 y 表示成 a0b, 其中 b 全部由 1 组成. 那么 x = a1b<sup>-</sup>, 通过之前的算法知道在把最低位的 1 变成 0 之后 x = a0b<sup>-</sup>, 记为 z. 对 y 同样从低位开始把 1 转成 0, 那么 y 会变成 a0b<sup>-</sub> 即 z.

代码表示:

```java
public int getSingle(int i) {
    int idx = i + 1;
    int sum = tree[idx];
    if (i > 0) {
        int z = idx - (idx & -idx);
        idx--;
        if (idx != z) {
            sum -= tree[idx];
        }
    }
    return sum;
}
```

第二种方法, 对于 BIT 奇数索引, 时间复杂度是 O(1); 对于 BIT 偶数索引, 时间复杂度是 c * O(log(n)), c < 1.

### 其他用法

本文最后的参考链接里, topcoder 给了另一个用法.

假设有 n 张牌, 每张牌都是朝下放置的. 有两种操作:
- T(i, j) : 把 [i, j] 区间内的牌翻面, 包含 i 和 j. 即朝上的牌翻面后朝下, 朝下的牌翻面后朝上
- Q(i) : 如果第 i 张牌朝下那么返回 0, 朝上返回 1

最直接的做法是每次翻牌就遍历一遍. 但通过 Binary Indexed Tree 可以把时间复杂度控制到 O(log(n)).

新建一个数组 f[], f[i] 初始化为 0. 当执行 T(i, j) 的时候, 把 f[i]++ 并且 f[j+1]--. 当执行 Q(i) 的时候, 其实是否返回 f[0, i] 区间内的和 sum % 2.

## Segment Tree

TODO...


## Reference

- [Binary Indexed Trees](https://www.topcoder.com/community/data-science/data-science-tutorials/binary-indexed-trees/)
- [BIT: What is the intuition behind a binary indexed tree and how was it thought about?](https://cs.stackexchange.com/questions/10538/bit-what-is-the-intuition-behind-a-binary-indexed-tree-and-how-was-it-thought-a)
