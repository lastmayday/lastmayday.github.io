---
layout: default
title: Extending the requests response class
tags: Python
---

[原文地址](http://jakeaustwick.me/extending-the-requests-response-class/)

<br>

Requests 是一个奇妙的 Python 库, 也是我这些天用得最舒服的几个库之一. 我每天都用它主要是因为我的[爬虫](http://jakeaustwick.me/python-web-scraping-resource/).

<br>

在你的爬虫项目中, 你可能会用到一些很简便的函数, 而且你可能刚刚复制了这些函数并把你的 response 对象作为参数传给它们. **我们可以做得更好**.

<br>

我将会演示怎样给 `Response` 类增加一些简单的方法, 这样你可以在你自己的项目中用你自己的方法来使用这个技巧.

<br>

我们从定义一个 `Response` 类开始, 这个类有几个简单的方法. 最重要的方法是 `doc()`. 它"获得"解析过的 HTML 语法树, 这样我们其他的方法就不用在每次调用的时候都重新解析一遍 HTML.

<pre>
<code class="python">
import requests
from lxml import html
import inspect

class Response(object):
    def doc(self):
        if not hasattr(self, '_doc'):
            self._doc = html.fromstring(self.text)
        return self._doc

    def links(self):
        return self.doc().xpath('//a/@href')

    def images(self, filter_extensions=['jpg', 'jpeg', 'gif', 'png']):
        return [link for link in self.doc().xpath('//img/@src') if link.endswith(tuple(filter_extensions))]

    def title(self):
        title = self.doc().xpath('//title/text()')
        if len(title):
            return title[0].strip()
        else:
            return None
</code>
</pre>

<br>

现在, 我们需要用我们新定义的类来修补 `requests.Response` 类. 我们将使用来自 [inspect 模块](http://docs.python.org/2/library/inspect.html) 的 [getmember()](http://docs.python.org/2/library/inspect.html#inspect.getmembers) 函数, 并把 [ismethod()](http://docs.python.org/2/library/inspect.html#inspect.ismethod) 作为参数.

<pre>
<code class="python">
for method_name, method in inspect.getmembers(Response, inspect.ismethod):  
    setattr(requests.models.Response, method_name, method.im_func)
</code>
</pre>

<br>

这样就完成啦. 现在你可以对任何 reponse 对象使用这些简便的函数, 看下面这个例子:

<pre>
<code class="python">
r = requests.get('http://imgur.com/')
print r.title()
print r.images(filter_extensions=['png'])
</code>
</pre>

<br>

现在我们继续, 把你的 response 对象变得向你想要的一样强大吧. 如果你对其他的爬虫技巧有兴趣, 可以看下我的[python web scraping resource](http://jakeaustwick.me/extending-the-requests-response-class/jakeaustwick.me/python-web-scraping-resource/).

<br>

### 下面是我自己的瞎说

<br>

第一次看到 inspect 模块的用法.

原文很短英文也不难所以推荐直接读原文, 之所以翻译了一下是觉得这文章确实很有意思~

<br>
