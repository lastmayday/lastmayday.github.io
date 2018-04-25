---
layout: default
title: Improve Your Python - Metaclasses and Dyanamic Classes With Types
tags: Python
---

[原文链接](http://www.jeffknupp.com/blog/2013/12/28/improve-your-python-metaclasses-and-dynamic-classes-with-type/)



`metaclasses` 和 `type` 关键字都很少被使用到(因此并没有很好地被大多数Python构造理解). 在这篇文章中, 我们将会探索不同类型的`type()`以及怎么使用鲜为人知的与`metaclasses`相关的`type`的使用.



## 你是我的菜(type)吗?



`type()`的第一种用法就是最广为人知的: 决定一个对象的类型. 这里, Python初学者通常会打断并且说: "但是我以为Python没有类型呢!" 相反, Python里的 _任何东西_ 都是有类型的(即使是`type`!) 因为 _任何东西_ 都是一个对象. 让我们看几个例子:
```python
>>> type(1)
<class 'int'>
>>> type('foo')
<class 'str'>
>>> type(3.0)
<class 'float'>
>>> type(float)
<class 'type'>
```



### `type`的类型



一切都和预期的一样, 直到我们检查了`float`的类型. `<class 'type'>`? 这是什么? 好吧, 很奇怪, 但是让我们继续:
```python
>>> class Foo(object):
...     pass
...
>>> type(Foo)
<class 'type'>
```

啊! 又是`<class 'type'>`. 显然所有类自己的类型都是`type`(不管它们是内置的还是用户定义的类). 那`type`自己的类型是什么呢?
```python
>>> type(type)
<class 'type'>
```

好吧, 它不得不在某个地方结束. `type`是所有类型的类型, 包括它自己. 实际上, `type`是一个`metaclass`(元类), 或者说是"一个构造类的东西". 类, 就像`list()`使用`my_list = list()`这样, 构造那个类的实例. 同样的, `metaclasses`构造类型, 就像`Foo`这样:
```python
class Foo(object):
    pass
```



### 构造你自己的元类



和正常的类一样, `metaclasses`可以是用户自己定义的. 为了使用这样的元类, 你可以把一个类的`__metaclass__`属性设置为你自己构造的`metaclass`. 一个`metaclass`可以是任何调用, 只要它返回一个类型. 通常, 你会指定一个类的`__metaclass__`为一个函数, 这样在某些时候就可以使用我们还没有讨论到的`type`的一个变体: 使用三个参数来创建类.



## `type`的阴暗面



如前所述, 当使用三个参数调用的时候`type`有一个完全独立的使用. `type(name, bases, dict)`以编程的方式创建了一个 _新的_ 类型.如果我有如下的代码:
```python
class Foo(object):
    pass
```

那么我们可以用如下的方式实现同样的效果:

```python
Foo = type('Foo', (), {})
```

`Foo`现在就是一个叫做"Foo"的类了, 它的基类是`object`(使用`type`创建的类, 如果没有指定基类, 就自动创建为新式类).



这样很好, 但是如果我们想给Foo添加成员函数该怎么办呢? 这可以很容易地通过设置Foo的属性来实现, 就像这样:
```python
def always_false(self):
    return False

Foo.always_false = always_false
```

我们可以使用如下的方法一气呵成:
```python
Foo = type('Foo', (), {'always_false': always_false})
```

当然, `bases`参数是`Foo`的一系列基类. 我们已经让它为空了, 但是创建一个源自`Foo`的新类也是完全有效的, 再一次使用`type`来创建它:
```python
FooBar = type('FooBar', (Foo), {})
```



### 这种方式什么时候有用呢?



一旦跟某人解释了某些话题, 下一个问题就很可能是"好, 那么我什么时候使用它?", `type`和`metaclass`就是这些话题之一. 答案是, 一点都不常用. 但是, 确实 _存在_ 有时候动态地使用`type`来创建类是最合适的方法. 让我看一个例子.



[sandman](http://www.github.com/jeffknupp/sandman)是我写的一个库, 它可以为已经存在的数据库自动生成一个REST API和基于web的管理界面(不需要任何样板代码). 大多数繁重的工作都是由SQLAlchemy完成, SQLAlchemy是一个ORM框架.



使用SQLAlchemy只有一种方法来注册一个数据库的表: 创建一个描述了这张表的`Model`类(和Django的models没有什么不同). 为了让SQLAlechemy认识这个表, 必须以某种方式创建这个表的类. 既然`sandman`没有任何关于数据库结构的高级知识, 它不能依赖预先创建的模型类来注册表. 而是, 它需要内省这个数据库然后在内省过程中创建这些类. 听起来很熟悉? 任何你需要动态地创建新类的时候, `type`就是正确的/唯一的选择.



这是来自[sandman](https://www.github.com/jeffknupp/sandman)的相关代码:
```python
if not current_app.endpoint_classes:
    db.metadata.reflect(bind=db.engine)
    for name in db.metadata.tables():
        cls = type(str(name), (sandman_model, db.Model),
                {'__tablename__': name})
        register(cls)
```

就像你看到的, 如果用户没有手动为一张表创建一个模型类, 它会自动被创建, 并且`__tablename__`属性会被设置成这张表的表名(被SQLAlchemy用来匹配表和类).



## 总结



在这篇文章中, 我们讨论了`type`和`metaclasses`的用法, 以及什么时候需要使用`type`的特殊用法. 尽管`metaclasses`是有些模糊不清的概念, 希望你现在为以后的学习打下了良好的基础.
