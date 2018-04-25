---
layout: default
title: 近期学习小结(2016.01 ~ 2016.07)
tags: Java
---

又半年了, 再来写个小结.



### 工作流水



年初写了一部分 Angular 1, 相比 React , 不是很喜欢 Angular.

主要是觉得 Angular 写起来很麻烦, controller ,  directives 还有 HTML , 整个结构显得很复杂; scope 也不是很清晰.

不过更可能是因为我学艺不精才会这样觉得, 并没有比较多地去了解 Angular, 能实现功能就可以.



之后写了两三周的 React Native, 撸了一个内部用的非常简单的 iOS APP.

好使! 开发起来也特别方便. 不过还是缺少一些组件, 比如 radio button, checkbox 等这些就得自己实现.

以及 Navigator 还是不尽人意, 大部门 UED 团队开发的另一个 React Native 应用还是选择了自己实现 route 机制.

这个项目并不是团队的需求, 也不算我的 KPI, PD 也不懂设计手机 APP, 落得匆匆收场, 只当自己玩了一把 React Native.



再之后被转组了, 到了现在这个组. 写我们组应用的后台管理, 偶尔写写控制台的前端.

比之前写的 Java 稍微多了一点点. 以及两个组的 Java 架构有略微不同, 之前组里使用 Spring , 这个组里用的是 Spring Boot;
之前组里使用 MyBatis , 现在组里使用 JPA.



关于 Java, 目前还没踩到特别的坑. 记录两个用过的方法.



### Spring ThreadPoolTaskExecutor



需求是要使用RPC发送日志记录, 这不是一个需要实时返回的需求, 而且为了避免阻塞原来的线程, 所以考虑使用 Spring 的 `ThreadPoolTaskExecutor` 执行日志操作.



在 `application-context.xml` 中增加 `ThreadPoolTaskExecutor` 的 bean:

```xml
<bean id="taskExecutor" class="org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor">
  <property name="corePoolSize" value="5" />
  <property name="maxPoolSize" value="10" />
  <property name="queueCapacity" value="25" />
</bean>
```

然后在需要使用线程池的代码中:

```java
@Component
public class XXX {

  @Autowired
  private TaskExecutor taskExecutor;

  // ...

  public void log(...) {
    taskExecutor.execute(new YYY(...));
  }

  private class YYY implements Runnable {

    // ...

    public YYY(...) {
      // 初始化日志参数
    }

    @Override
    public void run() {
      // RPC发送日志
    }
  }
}
```

最后在需要记录日志的代码中调用 `xxx.log(...)` 即可.



### SpringBoot Aspect



需求同样是记录日志, 和上面不同的是, 这里只有部分操作需要记录日志, 并且不是 RPC 发送日志请求, 而是直接往自己的数据库里写数据.

另外由于原代码较复杂, 为了不破坏原代码, 这里选择了 Aspect , 把需要记录日志的函数做为切入点.



先在 pom.xml 中增加 AspectJ 和 SpringBoot AOP 依赖:

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-aop</artifactId>
	<version>${spring.boot.aop.version}</version>
</dependency>
<dependency>
	<groupId>org.aspectj</groupId>
	<artifactId>aspectjtools</artifactId>
	<version>${aspectj.version}</version>
</dependency>
```

然后创建 Aspect 类:

```java
@Aspect
@Component
public class XXX {

  // ...

  // 创建切入点
  @Pointcut("execution(* com.aaa.bbb.controller.cccController.ddd(..))")
  public void dddCall() {}

  // 切入操作, 切入函数返回后执行
  @AfterReturning(value = "dddCall()", returning = "rvt")
  public void dddCallAfterReturning(JoinPoint joinPoint, Object rvt) {
    // 记录日志写入数据库
  }

  // 如果要记录修改, 那么需要获取修改前和修改后的值
  @Around(value = "dddCall()")
  public Object dddCallAround(ProceedingJoinPoint pjp) {
    // 获取之前的值
    Object rvt = pjp.proceed(); // 执行函数
    // 获取之后的值, 并记录日志
    return rvt;
  }
}
```

关于 Aspect 的更多用法可以参考文档 [Aspect Oriented Programming with Spring](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/aop.html).



### 其他



对于公共对象, 公共服务等有进一步理解. 当多个系统需要用到同样的对象和功能的时候, 就需要提取出公共类.
或者需要其中一个系统提供 RPC 供其他系统使用. 否则代码耦合太紧, 一份代码写几遍等等非常不利于维护.



对于后台管理系统, 权限控制和操作记录非常重要.
对于没有权限的用户, 可以直接向他们隐藏掉这些页面或功能, 而不是等到他们点击的时候再提醒他们没权限.



如果是提供 API 的话, 返回值最好统一.
使用静态方法 `AbcResult.success(...)` 或 `AbcResult.fail(...)` 返回成功的结果或失败结果.

这一点在 [Effective Java](https://book.douban.com/subject/3360807/) 的"考虑用静态方法代替构造器"小节里也有提到.

```java
public class AbcResult {

  // ...

  private AbcResult(...) {
    // ...
  }

  public static AbcResult success(...) {
    AbcResult result = new AbcResult(...);
    result.setXXX(...);
    return result;
  }
}
```



另外, 在大公司呆着, 务必注意信息安全. 数据泄漏啊高危操作啊什么的, 可能一次 root 登录服务器都会被安全的人找... (苦笑...)



### 感受



从六月到现在, 值班了一个多月. 对自己的影响不小, 几个非技术上的感受:

1. 永远不要指望用户会主动去看文档(即使是偏技术型的产品, 用户可能也是技术人员)

2. 产品能做得简单就千万不要做复杂, 把用户能想得多傻逼就要想得多傻逼

3. 涉及到收费的服务, 用户就是大爷, 计费务必谨慎



对目前的工作状态仍然说不上满意, 感觉自己在大团队里已经被定性了: 写前端的.

所以一旦要有需要做出去宣传用或者怎么的前端页面的时候, 就要找我做, 毕竟团队里没有个专门的前端写页面.
而自己前一年的时间有大半年在写前端.

现在干的活儿说白了也还是前端的活儿, 写 Java 的时候大部分也只是写写 API.



这样的感觉非常不好.
