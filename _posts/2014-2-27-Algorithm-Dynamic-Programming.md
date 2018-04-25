---
layout: default
title: 算法笔记-动态规划
tags: Algorithm
---

DP好难啊...T_T

智商不够只能慢慢看了...T_T



## 背包问题



先把[背包九讲](http://cuitianyi.com/blog/%E3%80%8A%E8%83%8C%E5%8C%85%E9%97%AE%E9%A2%98%E4%B9%9D%E8%AE%B2%E3%80%8B2-0-alpha1/)放在这里镇着.

### 01背包问题



> 有n个重量和价值分别为w<sub>i</sub>, v<sub>i</sub>的物品. 从这些物品中挑出总重量不超过W的物品. 问能挑出的最大价值为多少.



最容易想到的方法是对每一个物品是否放入背包试一下.

{% gist 9247240 %}



DP中貌似分析出状态转移方程是很重要的.(就像高中数学的递推表达式...

那么分析一下这个问题的状态转移. 假定有dp[i][j]表示从前i个物品中选出总重量不超过j的物品时的最大价值. 很显然dp[0][j] = 0. 对于任一i, j, 如果w[i] > j那么dp[i+1][j] = dp[i][j], 否则dp[i+1][j] = max(dp[i][j], dp[i][j-w[i]] + v[i]). 公式如下:

$$

dp[i+1][j] = \left\{ \begin{array}{ll}
dp[i][j] & \textrm{$j<w[i]$}\\
max(dp[i][j], dp[i][j-w[i]] + v[i]) & \textrm{$j>=w[i]$}
\end{array} \right.

$$



参考代码:

{% gist 9247948 %}



**感谢kid177** ! 把上面的代码降到了一维~



{% gist 9305980 %}



### 完全背包问题



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



## 多重部分和问题



> 有n种不同大小的数字a<sub>i</sub>, 每种各m<sub>i</sub>个. 判断是否可以从这些数字中选出若干使它们的和恰好为K.



用dp[i][j]表示前i种数相加得到j的时候第i种数最多能剩余多少个(不能得到j的时候为-1). 那么如果前i-1种数相加能得到j的话, 第i个数就可以留下m<sub>i</sub>个; 如果前i种数加和为j-a<sub>i</sub>时时第i种数还剩下k(k>0)个的话, 那么dp[i][j]就等于k-1. 这样可以得到下面的递推式:

$$

dp[i+1][j] = \left\{ \begin{array}{ll}
m_i & \textrm{$dp[i][j]>=0$}\\
-1 & \textrm{$j<a_i 或者 dp[i+1][j-a_i] <= 0$}\\
dp[i+1][j-a_i]-1 & \textrm{$其他$}
\end{array} \right.

$$



{% gist 9502688 %}



## 最长上升子序列



序列和字符串不同不需要连续.

> 长为n的数列a<sub>0</sub>, a<sub>1</sub>, ... , a<sub>n-1</sub>. 求出这个序列中的最长上升子序列的长度. 最长上升子序列是指对于任意的i&lt;j都有a<sub>i</sub>&lt;a<sub>j</sub>. 限制条件1 &lt;= n &lt;= 1000, 0 &lt;= a<sub>i</sub> &lt;= 1000000.



dp[i]为长度为i的最长上升子序列的末尾元素的最小值(不存在即为INF).

{% gist 9503169 %}
