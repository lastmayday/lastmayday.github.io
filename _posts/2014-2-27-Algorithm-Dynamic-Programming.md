---
layout: default
title: 算法笔记-动态规划
tags: Algorithm
---

DP好难啊...T_T

智商不够只能慢慢看了...T_T

<br>

## 背包问题

<br>

先把[背包九讲](http://cuitianyi.com/blog/%E3%80%8A%E8%83%8C%E5%8C%85%E9%97%AE%E9%A2%98%E4%B9%9D%E8%AE%B2%E3%80%8B2-0-alpha1/)放在这里镇着.

### 01背包问题

<br>

> 有n个重量和价值分别为w<sub>i</sub>, v<sub>i</sub>的物品. 从这些物品中挑出总重量不超过W的物品. 问能挑出的最大价值为多少.

<br>

最容易想到的方法是对每一个物品是否放入背包试一下.

{% gist 9247240 %}

<br>

DP中貌似分析出状态转移方程是很重要的.(就像高中数学的递推表达式...

那么分析一下这个问题的状态转移. 假定有dp[i][j]表示从前i个物品中选出总重量不超过j的物品时的最大价值. 很显然dp[0][j] = 0. 对于任一i, j, 如果w[i] > j那么dp[i+1][j] = dp[i][j], 否则dp[i+1][j] = max(dp[i][j], dp[i][j-w[i]] + v[i]). 公式如下:

$$

dp[i+1][j] = \left\{ \begin{array}{ll}
dp[i][j] & \textrm{$j<w[i]$}\\
max(dp[i][j], dp[i][j-w[i]] + v[i]) & \textrm{$j>=w[i]$}
\end{array} \right.

$$

<br>

参考代码:

{% gist 9247948 %}

<br>

**感谢kid177** ! 把上面的代码降到了一维~

{% gist 9305980 %}

<br>

### 完全背包问题

<br>

> 有n种重量和价值分别为w<sub>i</sub>, v<sub>i</sub>的物品. 从中挑选总重量不超过W的物品, 求价值总和的最大值. 每种物品可以挑选任意多件.

还是用上面的dp[i][j]那么现在递推关系变成了这样:

$$

dp[i+1][j] = max\{dp[i][j - k \times w[i]] + k \times v[i] | 0 \le k\}

$$

然后注意一下在dp[i+1][j]中选择k(k>=1)个的情况与在dp[i+1][j-w[i]]中选择k+1个情况相同. 所以dp[i+1][j]中k>=1的部分已经在dp[i+1][j-w[i]]中计算过. 上面的式子可以这样变形:

$$

\begin{align}
& max\{dp[i][j - k \times w[i]] + k \times v[i] | 0 \le k\} \\
& = max(dp[i][j], max\{ dp[i][j - k \times w[i]] + k \times v[i] | 1 \le k \}) \\
& = max(dp[i][j], max\{ dp[i][(j - w[i]) - k \times w[i]] + k \times v[i] | 0 \le k \} + v[i]) \\
& = max(dp[i][j], dp[i+1][j-w[i]] + v[i])
\end{align}

$$

参考代码:

{% gist 9306164 %}

<br>

**未完待续**

<br>
