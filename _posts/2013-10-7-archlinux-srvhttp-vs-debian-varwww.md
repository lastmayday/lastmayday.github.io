---
layout: default
title: Archlinux /srv/http vs Debian /var/www
tags: Linux
---

[原文地址](http://www.wulf.co.nz/archlinux-srvhttp-vs-debian-varwww/)

## 两者的联系



Debian以及一些其它较老的系统仍然使用`/var/www`作为web服务的默认根目录, 然而Arch却使用的是`/srv/http`. `/var`现在确实有点凌乱, 但是由于心理作用, 我每次都按如下的方式在我的笔记本/台式机上建立符号连接: `sudo ln -s /srv/http/ /var/www`



## 两者的不同



简单地说, 你的服务是从`/srv`得到的, 而`/var`放的是可变的内容.



### /srv

指定`/srv`的主要目的是为了让用户可以找到特定服务的文件所在的位置, 因此这些需要一个单独的目录来存放只读的数据, 可写的数据以及脚本(例如cgi scripts)的服务就能够放在合理的位置. 某个特定用户感兴趣的数据应该适用于所有用户的home目录.



命名`/srv`子目录的方法没有具体指定, 因为对于应该如何命名现在还没有达成共识. 其中一种方法是通过协议来组织`/srv`目录下的数据, 例如ftp, rsync, www以及cvs. 对于大型的系统, 通过管理环境来组织`/srv`是很有用的, 例如`/srv/physics/www`, `/srv/compsci/cvs`等等. 这一步因服务器不同而不同. 因此, 任何程序都不能依靠一种具体的`/srv`的组织结构而存在, 任何数据也不能必须被存储在`/srv`目录下. 但是在FHS标准的系统里, `/srv`目录应该总是存在的, 而且也应该作为这些数据存放的默认目录.



各个发行版一定要注意, 在没有管理员权限的情况下是不能把本地文件放入这些目录里的.



### /var
`/var`存放的是可变的数据文件. 包括spool目录和文件, 管理和日志数据, 以及临时文件.



`/var`的一些部分在不同的系统间是不共享的. 比方说, `/var/log`, `/var/lock`以及`/var/run`. 其他的部分是可以共享的, 特别是`/var/mail`, `/var/cache/man`, `/var/cache/fonts`以及`/var/spool/news`.



指定`/var`是为了有可能只读地挂载`/usr`. 如果有文件一旦到了`/usr`里, 在系统运行期间就是可写的(相对于安装和软件维护)了的话, 那这个文件一定要放在`/var`里.



如果`/var`不能成为独立的一部分, 那么比较好的方法是, 把根目录下的`/var`移到`/usr`里.(这有时候用来减少根目录的大小, 或者根目录的空间没剩多少时也可以这样做.) 但是, `/var`一定不能连接到`/usr`, 因为这使得分开`/usr`和`/var`更加困难了, 而且很可能会导致命名冲突. 相反, 把`/var`连接到`/usr/var`.



应用通常都不会在`/var`的顶级目录下增加新的目录. 只有当这些目录有系统范围的应用的时候, 并且咨询了FHS的邮件列表之后才能被添加.



例如:

`/var/log` for logs

`/var/tmp` for temporary files

`/var/cache` for cache

`/var/lock` for lock files
