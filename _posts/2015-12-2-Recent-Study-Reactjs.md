---
layout: default
title: 近期学习小结(2015.07 ~ 2015.12)
tags: JavaScript
---

好像很久没写 Blog 了 \_(:3 」∠)\_, 入职之后主要在写前端偶尔写一点 Java.

参加了前端培训, CSS 技能提升了大概一个量级, JavaScript 马马虎虎了解了不少 ES6 的新特性;
学习了 React 并且在用它写项目, 大概用得比较溜了.



当然, 还并不是一个合格的前端(也并不是很喜欢写前端... \_(:3 」∠)\_).

对这几个月作个总结吧. 还是得写点东西才会逼迫自己去思考.



## React



[官网](https://facebook.github.io/react/), 入门看官网教程准没错.
个人理解简单的说是个 View 层的处理复杂交互比较友好的一个框架.



### 使用感受



刚接触的时候非常不习惯, 因为觉得 JSX 这种把 HTML 和 JS 混在一块儿写的语法真是太丑了.
后来读了下[这本书](https://book.douban.com/subject/26378583/), 渐渐觉得可以接受了, 以及觉得 React 好像有点厉害啊!



一段时间的项目写下来, 感觉 React 比较方便的大概有以下几点:

1. **组件化**. 把页面拆分成一个个组件之后, 很多代码都可以复用了. 最明显的是减少了代码量, 另外是有需求更新时只用更新组件就好. 个人感觉是这个功能一些模板引擎也可以实现, 比如 [Jinja2](http://jinja.pocoo.org/docs/dev/) 的 `include`.
2. **事件绑定**. 之前的事件绑定, 因为避免在 HTML 中写 JavaScript 代码, 一般是先在 JavaScript 中选中某个元素然后再对该元素绑定事件. 在 React 中, 又回到了直接对组件进行事件绑定的形式, 不需要选取元素这个步骤. 相应组件的 JavaScript 代码只用写在组件内, 不会污染其他组件.



### 难点



React 上手很容易, 这段时间用起来感觉难点主要在对生命周期的理解, 以及一些数据传递的问题.



下面这张图画了 React 的生命周期, 还是比较容易看懂的.
![生命周期](https://i.imgur.com/PPqIIQa.png)

因为项目中的数据基本都是 AJAX 异步加载, 所以在涉及到父组件传递数据给子组件然后子组件需要根据该数据更新相关内容的情况就会有点复杂.
如果仅仅在子组件的 `componentWillMount` 中获取子组件内容的话那么父组件传递给子组件的值更新之后该内容不会相应地更新.
但如果只是简单地在 `componentWillUpdate` 中重新获取内容的话, 那么由父组件其他更新造成的子组件更新也会重新获取内容, 导致一些不必要的请求.



一种方法是在 `componentWillUpdate(nextProps, nextState)` 中对 `nextProps` 的该数据和当前 `this.props` 中的该数据作对比, 不同则重新获取内容. 另一种方法是在 `shouldComponentUpdate(nextProps, nextState)` 中对该数据作对比, 这种方法不太好的是如果有多个更新获取多种不同的内容时不太好判断.



个人觉得另外一个难点是思维方式的转换. 因为 React 尽量不要去操作 DOM, 所以一些之前会考虑使用 jQuery 直接操作 DOM 的方法需要做些改变.



项目中遇到的一个例子是在使用 [Ant Design](http://ant.design/) 提供的 Table 组件时, 我们的需求是点击某个按钮然后表格中新增一行输入框. 当时自己的第一反应就是, 这不操作 DOM 的话怎么增加输入框?!



这里的背景是 Table 组件有个 `dataSource` 参数作为数据源, 有个 `columns` 参数定义表格的每列取什么数据以及怎么渲染.
思考之后发现可以在数据源的每行数据中插入自定义的一个键`operate`, 根据 `operate` 的不同来对数据作出不同的渲染(是直接展示还是显示输入框).



还有一个可能一开始会不太好理解的地方是数据传递. 如果父组件可以修改某个 `state`, 然后这个数据作为 `props` 传给了子组件, 而子组件也可以修改这个数据, 那么应该怎么通知父组件这个数据被修改了呢?



解决办法是把父组件修改该值的函数传递给子组件, 子组件在需要修改这个值的时候直接调用该函数即可.



### Final



关于 React 自己并没有深入研究, 只是列举了一些在项目开发中遇到的问题和自己的理解.
如果理解有误欢迎探讨~



## Java



要说自己的 Java 有没有进步, 嗯从7月到现在应该是从 0 到 1 的一个巨大飞跃, 因为之前根本不会写 Java \_(:3 」∠)\_...



可是我想不出来有什么好说的... 算了吧... \_(:3 」∠)\_
