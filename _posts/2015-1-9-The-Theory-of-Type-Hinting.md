---
layout: default
title: The Theory of Type Hinting
tags: Python
---

[原文地址](https://quip.com/r69HA9GhGa7J)



## 概述



这篇文档列举了为 Python 3.5 提出的新的类型约束的理论.
它并不是完整的提议或规范因为很多细节还需要讨论.
但是它奠定了理论基础, 没有理论的话很难去讨论更具体的规范.
我们从解释进阶类型(gradual typing)开始; 然后我们说明一些约定和基本规则;
然后我们定义新的特殊类型(例如 Union), 这些类型可以在注释中使用;
最后我们定义泛型类型的方法.(后一部分需要进一步充实; 抱歉!)



## 进阶类型综述



我们定义一个新的关系, 与...一致(is-consistent-with), 它和是...的子类(is-subclass-of)类似,
除了在涉及新类型**Any**的时候它是未传递的.(这两种关系都不是对称的.)
如果 x 的类型和 y 的类型一致那么把 x 赋值给 y 是可以的.
(和"如果 x 的类型是 y 的子类"对比, 它声明了面向对象编程的基础之一.)
这个 is-consistent-with 关系由三条规则定义:

1. 如果 t1 是 t2 的子类那么 t1 的类型与 t2 一致.(但反过来不是.)
2. **Any** 与任意类型一致.(但是 **Any** 不是任何类型的子类.)
3. 任意类型都是 **Any** 的子类.(这使得任意类型都与 **Any** 一致, 根据规则1.)

就是这些! 可以看 Jeremy Siek 的博文 [What is Gradual Typing](http://wphomes.soic.indiana.edu/jsiek/what-is-gradual-typing/) 来获得更长的解释.
注意规则3把 **Any** 放在了这个类图的根部. 这使得它和**对象(object)**非常相似.
不同之处是**对象**不和大部分类型一致(e.g. 当需要一个 int 的时候你就不能使用一个 object() 实例).
换句话说, **Any** 和 **object** 都意味着"允许任意类型"当它们被用来注释参数的时候,
但是只有 **Any** 可以被传给任意期望类型(在本质上, **Any** 关闭了静态检查的报错).



这里有一个例子展示实际中这些规则是怎么使用的:

+ 假如我们有一个 Employee 类, 以及一个 Manager 子类:
    - `class Employee: ...`
    - `class Manager(Employee): ...`
+ 假设变量`e`用`Employee`类型声明:
    - `e = Employee()  # type: Employee`
+ 现在可以把一个`Manager`实例赋值给`e`(规则1):
    - `e = Manager()`
+ 不能把一个`Employee`实例赋值给用`Manager`类型声明的变量:
    - `m = Manager()  # type: Manager`
    - `m = Employee()  # Fails static check`
+ 然而, 假设我们有个类型是 **Any** 的变量:
    - `a = some_func()  # type: Any`
+ 现在可以把它赋值给`e`(规则2):
    - `e = a  # OK`
+ 当然也可以把`e`赋值给`a`(规则3), 但是这里我们不需要一致性的概念:
    - `a = e  # OK `



## 符号约定



+ `t1`, `t2`等以及`u1`, `u2`等是类型或者类. 有时候我们用`ti`或者`tj`来指代"任意的t1, t2等等"
+ `X`, `Y`等是类型变量(使用`Var()`定义, 见下).
+ `C`, `D`等是使用类声明语句定义的类.
+ `x`, `y`等是对象或者实例.
+ 我们使用术语类型和类互换, 并且我们假设`type(x)`就是`x.__class__`.



## 一般规则



+ Instance-ness 派生自 class-ness, 例如如果`type(x)`是`t1`的子类的话那么`x`是`t1`的一个实例
+ 下面定义的类型(i.e. Any, Union 等)都不能被实例化.(但是 Generic 的非抽象的子类可以.)
+ 下面定义的类型不能被子类, 除了 Generic 和派生自它的类.
+ 当需要 type 的时候, `None`可以取代`type(None)`; 例如`Union[t1, None] == Union[t1, type(None)]`.



## 类型



+ **Any**. 每一个类都是`Any`的子类; 然而对于静态类型检查器来说它也和每一个类一致(见上).
+ **Union[t1, t2, ...]**. 至少是t1等其中一个子类的类都是这个的子类(译注: 好绕口啊...). 所以它的组件都是t1等等的子类.
(例如: `Union[int, str]` 是 `Union[int, float, str]` 的子类.) 参数的顺序没有影响. (例如: `Union[int, str] == Union[str, int]`.)
如果`ti`自己是一个 Union 那么结果可以扁平化. (例如: `Union[int, Union[float, str]] == Union[int, float, str]`.)
如果`ti`和`tj`有一个子类关系, 那么以更具体的类型为准. (例如: `Union[Employee, Manager] == Union[Employee]`.)
`Union[t1]`只返回`t1`. `Union[]`是不合法的, 应当是`Union[()]`.
推出: `Union[..., Any, ...]`返回`Any`; `Union[..., object, ...]`返回`object`; `Union[Any, object] == Union[object, Any] == Any`.
+ **Optional[t1]**. `Union[t1, None]`的别名, 如`Union[t1, type(None)]`.
+ **Tuple[t1, t2, ..., tn]**. 成员都是t1等实例的元组.
例如: `Tuple[int, float]`的意思是一个两个成员的元组, 第一个成员是 int 类型, 第二个是 float 类型; 如(42, 3.14).
`Tuple[u1, u2, ..., um]`是`Tuple[t1, t2, ..., tn]`的子类, 如果它们有相同的长度(n == m)并且每个 ui 都是 ti 的子类的话.
空元组的类是`Tuple[()]`. 没有方法定义一个可变参数的元组类型.(TODO: 也许 `Tuple[t1, ...]` 使用字面上的省略号?)
+ **Callable[[t1, t2, ..., tn], tr]**. 有着t1等类型的位置参数的函数, 并且返回 tr 类型.
参数列表可以为空(n == 0). 没有方法表明可选或关键字参数, 可变参数也不行(我们并不需要经常拼写这些复杂的语法 - 然而, 网状 Python 在这里很有用.)
返回类型是协变的, 但是参数是逆变的. "协变"在这里的意思是对于两个只在返回类型不同的可调用类型, 可调用类型的子类关系与返回类型的一样.
(例如: `Callable[[], Manager]`是`Callable[[], Employee]`的子类.)
"逆变"在这里的意思是对于两个只有一个参数类型不同的可调用类型,可调用类型的子类关系与这个参数类型的相反.
(例如: `Callable[[Employee], None]`是`Callable[[Mananger], None]`的子类. 对, 你没看错.)

我们可能会增加:

+ `Intersection[t1, t2, ...]`. 每一个是t1等子类的类都是这个的子类.(和`Union`对比, `Union`是至少一个而不是每一个.)
参数的顺序不重要. 嵌套的交集被扁平化, 如`Intersection[int, Intersection[float, str]] == Intersection[int, float, str]`.
一个较少类型的交集是一个较多类型的交集的子类, 如`Intersection[int, str]`是`Intersection[int, float, str]`的子类.
一个参数的交集就是这个参数, 如`Intersection[int]`就是`int`.
当参数有子类关系的时候, 以更具体参数的为准, 如`Intersection[str, Employee, Manager]`就是`Intersection[str, Manager]`.
`Intersection[]`是合法的, `Intersection[()]`也是.
可推出: `Any`可以从参数列表中消失, 如`Intersection[int, str, Any] == Intersection[int, str]`. `Intersection[Any, object]`是对象.
Intersection 和 Union 之间的相互作用很复杂, 但是不应该感到奇怪如果你理解了集合理论中交集和并集的相互作用的话
(注意类型的集合在数量上可能是无限的, 既然对新的子类没有数目限制).



## 语用



一些和理论不相干的东西但是使得实际使用更加方便.(这不是完整的列表; 我可能掉了一点并且有些还有争论或者没有完全确定.)

+ 类型别名, 如:
    - `point = Tuple[float, float]`
    - `def distance(p: point) -> float: ...`
+ 通过字符串转发引用, 如:
    - `class C:`
        + `def compare(self, other: “C”) -> int: ...`
+ 如果没有指定的默认值, 类型是隐式可选的, 如:
    - `def get(key: KT, default: VT = None) -> VT: ...`
+ 不要使用动态类型表达式; 只使用内置类型和外部类型. 不要使用`if`.
    - `def display(message: str if WINDOWS else bytes):  # NOT OK`
+ 在注释中做类型声明, 如:
    - `x = []  # type: Sequence[int]`
+ 使用`Undefined`做类型声明, 如:
    - `x = Undefined(str)`
+ 其他的, 如 cast, overloading 以及 stub modules; 最好留给正式的 PEP.



## 泛型类型



(TODO: 解释更多. 参考[mypy docs on generics](http://mypy.readthedocs.org/en/latest/generics.html).)

+ **X = Var('X')**. 声明一个独特的类型变量. 名字必须和变量名一致.
+ **Y = Var('Y', t1, t2, ...)**. 同上, 受限于t1等等. 大多数情况下像`Union[t1, t2, ...]`一样,
但是当作为类型变量使用时, t1等的子类被t1等中大部分衍生的基类替换.
+ 受限类型变量的例子:
    - `AnyStr = Var('AnyStr', str, bytes)`
    - `def longest(a: AnyStr, b: AnyStr) -> AnyStr:`
        + `return a if len(a) >= len(b) else b`
    - `x = longest('a', 'abc')  # The inferred type for x is str`
    - `y = longest('a', b'abc')  # Fails static type check`
    - 在这个例子中, `longst()`的两个参数都必须有相同的类型(str 或者 bytes), 另外, 及时参数是一个共同的 str 子类的实例, 返回值仍然是 str, 而不是子类(见下一个例子).
+ 作为对比, 如果类型变量是不受约束的, 共同的子类会被选为返回值, 如:
    - `S = Var('S')`
    - `def longest(a: S, b: S) -> S:`
        + `return a if len(a) >= b else b`
    - `class MyStr(str): ...`
    - `x = longest(MyStr('a'), MyStr('abc'))`
    - 推断出`x`的类型是`MyStr`(而在`AnyStr`例子中是`str`).
+ 同样作为对比, 如果使用了一个 Union, 返回值也必须是 Union:
    - `U = Union[str, bytes]`
    - `def longest(a: U, b: U) -> U:`
        + `return a if len(a) >- b else b`
    - `x = longest('a', 'abc')`
    - 推断`x`的类型还是`Union[str, bytes]`, 及时两个参数都是`str`.
+ `class C(Generic[X, Y, ...]): ...` 在类型变量 X 等之上定义一个泛型类 C. C 本身参数化, 如`C[int, str, ...]`是用`X->int`替换的具体类.
+ TODO: 解释在函数签名中使用泛型类型. 如`Sequence[X], Sequence[int], Sequence[Tuple[X, Y, Z]]`以及混合方法.
没有噱头比方说从`Sequence[Union[int, str]]`或者`Sequence[Union[int, X]]`派生.
+ **协议**. 和泛型相似但是使用结构等价.(TODO: 解释, 并且想想协方差)



## 预定义的泛型类型以及 TYPING.PY 中的协议



(参考[mypy typing.py module](https://github.com/JukkaL/typing/blob/master/typing.py))

+ 来自 collections.abc 的每一个东西(但是 Set 改为了 AbstractSet).
+ Dict, List, Set, 更多.(FrozenSet?)
+ Pattern, Match.(为什么?)
+ IO, TextIO, BinaryIO.(为什么?)
