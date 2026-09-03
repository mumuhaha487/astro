---
title: 用python来爬取某鱼的商品信息（1/2）
published: 2023-08-11
tags: [python,开发语言]
category: python
image: /_image/?href=%2F%40fs%2Fworkspace%2Ffuwari%2Fsrc%2Fassets%2Fimages%2Fdemo-avatar.png%3ForigWidth%3D700%26origHeight%3D700%26origFormat%3Djpg&w=700&h=700&f=webp
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E7%AC%AC%E4%B8%80%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E6%89%BE%E5%88%B0%E7%BD%91%E7%AB%99%E5%85%A5%E5%8F%A3-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%B8%80%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E6%89%BE%E5%88%B0%E7%BD%91%E7%AB%99%E5%85%A5%E5%8F%A3">第一大难题——找到网站入口</a></p>

<p id="%E6%9B%B2%E7%BA%BF%E6%95%91%E5%9B%BD-toc" style="margin-left:40px;"><a href="#%E6%9B%B2%E7%BA%BF%E6%95%91%E5%9B%BD">曲线救国</a></p>

<p id="%C2%A0%E6%A8%A1%E6%8B%9F%E6%90%9C%E7%B4%A2-toc" style="margin-left:0px;"><a href="#%C2%A0%E6%A8%A1%E6%8B%9F%E6%90%9C%E7%B4%A2"> 模拟搜索</a></p>

<p id="%E7%AC%AC%E4%BA%8C%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E7%99%BB%E5%BD%95-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%BA%8C%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E7%99%BB%E5%BD%95">第二大难题——登录</a></p>

<p id="%E6%8F%90%E4%B8%80%E5%98%B4-toc" style="margin-left:40px;"><a href="#%E6%8F%90%E4%B8%80%E5%98%B4">提一嘴</a></p>

<p id="%E7%99%BB%E5%BD%95cookie%E8%8E%B7%E5%8F%96-toc" style="margin-left:40px;"><a href="#%E7%99%BB%E5%BD%95cookie%E8%8E%B7%E5%8F%96">登录cookie获取</a></p>

<p id="%E7%AC%AC%E4%B8%80%E7%A7%8D-toc" style="margin-left:80px;"><a href="#%E7%AC%AC%E4%B8%80%E7%A7%8D">第一种</a></p>

<p id="%E7%AC%AC%E4%BA%8C%E7%A7%8D-toc" style="margin-left:80px;"><a href="#%E7%AC%AC%E4%BA%8C%E7%A7%8D">第二种</a></p>

<p id="%C2%A0%E7%AC%AC%E5%9B%9B%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E6%97%A0%E6%B3%95%E4%BD%BF%E7%94%A8%E5%AF%BC%E5%87%BA%E7%9A%84cookie-toc" style="margin-left:0px;"><a href="#%C2%A0%E7%AC%AC%E5%9B%9B%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E6%97%A0%E6%B3%95%E4%BD%BF%E7%94%A8%E5%AF%BC%E5%87%BA%E7%9A%84cookie"> 第四大难题——无法使用导出的cookie</a></p>

<p id="%C2%A0%E5%8E%9F%E5%9B%A0-toc" style="margin-left:40px;"><a href="#%C2%A0%E5%8E%9F%E5%9B%A0"> 原因</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:40px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E6%9C%80%E5%90%8E-toc" style="margin-left:40px;"><a href="#%E6%9C%80%E5%90%8E">最后</a></p>

<p id="%E5%87%BA%E7%8E%B0%E5%B0%8F%E9%97%AE%E9%A2%98-toc" style="margin-left:40px;"><a href="#%E5%87%BA%E7%8E%B0%E5%B0%8F%E9%97%AE%E9%A2%98">出现小问题</a></p>

<p id="%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E7%BB%93">总结</a></p>

<p id="%E4%B8%8B%E4%B8%80%E7%AF%87%E5%8D%9A%E5%AE%A2%EF%BC%88%E5%A4%A7%E9%83%A8%E5%88%86%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E4%B8%80%E7%AF%87%E5%8D%9A%E5%AE%A2%EF%BC%88%E5%A4%A7%E9%83%A8%E5%88%86%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0%EF%BC%89">下一篇博客（大部分代码实现）</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>本章讲理论，后面一节讲代码</p>

<p>拿来练练手的，练练selenium包，实战一下</p>

<p>（本来想拿来练手的，没想到他喵的有挺多防爬的，直接开局就困难难度我靠，凸(艹皿艹 )）</p>

<p><img alt="" height="255" src="/image/33065d967b99a43320f6ae88395ebc02.gif" width="400" /></p>

<p></p>

<p>找到可以爬取的网站</p>

<h1 id="%E7%AC%AC%E4%B8%80%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E6%89%BE%E5%88%B0%E7%BD%91%E7%AB%99%E5%85%A5%E5%8F%A3">第一大难题——找到网站入口</h1>

<p>但是咸鱼官方的网站已经关闭了（开局就不利）</p>

<p><a class="has-card" data-link-desc="闲鱼.淘宝二手是一个社区化的二手闲置交易市场，不仅支持各种同城及线上的担保交易，更安全，同时还有最专业的放心购二手商家，让你轻松在这买卖二手闲置。" data-link-icon="/image/cea7f95729ad651ebb3629e5c3c5c7c1.png" data-link-title="闲鱼.淘宝二手 - 轻松卖闲置，放心淘二手" href="https://goofish.com/" title="闲鱼.淘宝二手 - 轻松卖闲置，放心淘二手"><span class="link-card-box"><span class="link-title">闲鱼.淘宝二手 - 轻松卖闲置，放心淘二手</span><span class="link-desc">闲鱼.淘宝二手是一个社区化的二手闲置交易市场，不仅支持各种同城及线上的担保交易，更安全，同时还有最专业的放心购二手商家，让你轻松在这买卖二手闲置。</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/cea7f95729ad651ebb3629e5c3c5c7c1.png" />https://goofish.com/</span></span></a></p>

<p></p>

<p> GG</p>

<h2 id="%E6%9B%B2%E7%BA%BF%E6%95%91%E5%9B%BD">曲线救国</h2>

<p>但是后面发现可以通过淘宝手机版网页版的入口直接进入咸鱼网页版的入口（反正都是爬取怎么进的不重要啦！！！）</p>

<p>链接放着里了，怎么进别问我了</p>

<p><a class="has-card" data-link-desc="淘宝网 - 亚洲较大的网上交易平台，提供各类服饰、美容、家居、数码、话费/点卡充值… 数亿优质商品，同时提供担保交易(先收货后付款)等安全交易保障服务，并由商家提供退货承诺、破损补寄等消费者保障服务，让你安心享受网上购物乐趣！" data-link-icon="/image/5071484f8f0a3250da418a9c636455ad.png" data-link-title="淘宝" href="https://main.m.taobao.com/index.html" title="淘宝"><span class="link-card-box"><span class="link-title">淘宝</span><span class="link-desc">淘宝网 - 亚洲较大的网上交易平台，提供各类服饰、美容、家居、数码、话费/点卡充值… 数亿优质商品，同时提供担保交易(先收货后付款)等安全交易保障服务，并由商家提供退货承诺、破损补寄等消费者保障服务，让你安心享受网上购物乐趣！</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/5071484f8f0a3250da418a9c636455ad.png" />https://main.m.taobao.com/index.html</span></span></a><img alt="" height="837" src="/image/d003923f93530bd8f7ceb80410da603d.png" width="485" /></p>

<p></p>

<p> 好了第一大难题（找到网页版入口解决了）</p>

<p><img alt="" height="844" src="/image/4eb196475894ff69c2d992a268f1cca2.png" width="491" /></p>

<h1 id="%C2%A0%E6%A8%A1%E6%8B%9F%E6%90%9C%E7%B4%A2"> 模拟搜索</h1>

<p>接下来就是利用python的selenium包模拟点击</p>

<p>右键搜索款点击检查就可以定位到该元素的xpath的路径（<span style="color:#ffd900;"><strong><span style="background-color:#fe2c24;">新版的selenium有许多不同的用法我会在下一章中进行代码实现，这一章主要讲解理论</span></strong></span>）</p>

<p><img alt="" height="854" src="/image/7676d39887fc621acb86fd94266fcefe.png" width="580" /></p>

<p> 然后在python代码中输入你要搜索的文字内容再回车即可</p>

<h1 id="%E7%AC%AC%E4%BA%8C%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E7%99%BB%E5%BD%95">第二大难题——登录</h1>

<p>在这一个咸鱼网页版中，你必须要登录才可以</p>

<p><img alt="" height="843" src="/image/fb70b35179244411626d9bedefa142aa.png" width="487" /></p>

<p> 这样你就要先登录才可以访问网页</p>

<p>最大难题——登录界面滑块验证</p>

<h2 id="%E6%8F%90%E4%B8%80%E5%98%B4">提一嘴</h2>

<p>在这个登录页面中，登录页面是iframe内嵌入其中的页面的</p>

<p>所以你无法直接定位到登录框（我搞了好久反应过来，真的离谱！！）</p>

<p><img alt="" height="1030" src="/image/5688a0bbde33e000480cc500c649710e.png" width="1200" /></p>

<h2 id="%E7%99%BB%E5%BD%95cookie%E8%8E%B7%E5%8F%96">登录cookie获取</h2>

<p>所以你有两种选择</p>

<h3 id="%E7%AC%AC%E4%B8%80%E7%A7%8D">第一种</h3>

<p>直接在python中打开登录页面进入登录页面然后登录直接用selenium库中的get_cookie获取cookie并保存</p>

<p><a class="has-card" data-link-icon="/image/8c88368107573bc107d47351d13af2b0.png" data-link-title="登录" href="https://passport.goofish.com/mini_login.htm?ttid=h5%40iframe&amp;redirectType=iframeRedirect&amp;returnUrl=%2F%2Fh5.m.goofish.com%2Fapp%2Fvip%2Fh5-webapp%2Flib-login-message.html%3Forigin%3Dhttps%253A%252F%252Fh5.m.goofish.com&amp;appName=xianyu&amp;appEntrance=web&amp;isMobile=true" title="登录"><span class="link-card-box"><span class="link-title">登录</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/8c88368107573bc107d47351d13af2b0.png" />https://passport.goofish.com/mini_login.htm?ttid=h5%40iframe&amp;redirectType=iframeRedirect&amp;returnUrl=%2F%2Fh5.m.goofish.com%2Fapp%2Fvip%2Fh5-webapp%2Flib-login-message.html%3Forigin%3Dhttps%253A%252F%252Fh5.m.goofish.com&amp;appName=xianyu&amp;appEntrance=web&amp;isMobile=true</span></span></a>想法相对来说不这么绕，但是遗憾的是我无法登录（因为登录有滑块验证，我是几乎过不了的，手动都不行）</p>

<h3 id="%E7%AC%AC%E4%BA%8C%E7%A7%8D">第二种</h3>

<p>在正常网页中登入之后用浏览器插件提取出来</p>

<p>我用的是cookie editor </p>

<p><img alt="" height="986" src="/image/b3403c24ac93c63a528e5dfb52e616d1.png" width="1200" /></p>

<p>在网页版中正常登录可以过滑块验证</p>

<p>之后用插件复制出json文件，并且进行粘贴</p>

<p><img alt="" height="603" src="/image/39d5bfad42c8fe2b23f81d4211abfe00.png" width="622" /></p>

<h1 id="%C2%A0%E7%AC%AC%E5%9B%9B%E5%A4%A7%E9%9A%BE%E9%A2%98%E2%80%94%E2%80%94%E6%97%A0%E6%B3%95%E4%BD%BF%E7%94%A8%E5%AF%BC%E5%87%BA%E7%9A%84cookie"> 第四大难题——无法使用导出的cookie</h1>

<p>使用代码导入是报错</p>

<pre>
<code class="language-bash"> assert cookie_dict[‘sameSite‘] in [‘Strict‘, ‘Lax‘] AssertionError()</code></pre>

<h2 id="%C2%A0%E5%8E%9F%E5%9B%A0"> 原因</h2>

<p>提取出来的cookie中samesite的值不为strict以及lax两种中的一种，他就会报错</p>

<h2 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h2>

<p>只需要在json字典中把samesite的值全部改为Strict即可</p>

<h2 id="%E6%9C%80%E5%90%8E">最后</h2>

<p>然后添加cookie然后刷新界面就可以发现搜索结果出来了</p>

<h2 id="%E5%87%BA%E7%8E%B0%E5%B0%8F%E9%97%AE%E9%A2%98">出现小问题</h2>

<p>由于然后短时间内多次请求依旧会有阴间的滑块验证，所以我推荐设置好后半小时爬取一次即可</p>

<h1 id="%E6%80%BB%E7%BB%93">总结</h1>

<p>这一次实战经历真的让我遇到了selenium许多奇奇怪怪的反爬手段，也是让我可以大幅度提升自己实战经验的一个经历，前前后后排bug，绕反爬，这一个项目打了整整两天。累die</p>

<p><img alt="" height="156" src="/image/9e41f357433746b75a7aadfca4339655.gif" width="200" /></p>

<h1 id="%E4%B8%8B%E4%B8%80%E7%AF%87%E5%8D%9A%E5%AE%A2%EF%BC%88%E5%A4%A7%E9%83%A8%E5%88%86%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0%EF%BC%89">下一篇博客（大部分代码实现）</h1>

<p><a class="has-card" data-link-desc="首先要说的是这个通过python不如通过app抓包来的稳定页面中你登录的cookie的失效时间是不确定的，所以你可能需要经常更新cookie（看个人情况）无法频繁（比如5分钟一次）搜索，否则会跳滑块验证，或者你有多个账号也可以搞（大概也就这个流程）写出来的代码只是提取出来网页源代码——其实都提取出网页源代码了，使用就只有一个筛选了（csdn上有大把的优质博主和大佬教你通过源代码过滤有用的信息）当然如果需要的话我可以再水一篇博客。" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="用python来爬取某鱼的商品信息（2/2）_木木em哈哈的博客-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/132260466?spm=1001.2014.3001.5501" title="用python来爬取某鱼的商品信息（2/2）_木木em哈哈的博客-CSDN博客"><span class="link-card-box"><span class="link-title">用python来爬取某鱼的商品信息（2/2）_木木em哈哈的博客-CSDN博客</span><span class="link-desc">首先要说的是这个通过python不如通过app抓包来的稳定页面中你登录的cookie的失效时间是不确定的，所以你可能需要经常更新cookie（看个人情况）无法频繁（比如5分钟一次）搜索，否则会跳滑块验证，或者你有多个账号也可以搞（大概也就这个流程）写出来的代码只是提取出来网页源代码——其实都提取出网页源代码了，使用就只有一个筛选了（csdn上有大把的优质博主和大佬教你通过源代码过滤有用的信息）当然如果需要的话我可以再水一篇博客。</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/mumuemhaha/article/details/132260466?spm=1001.2014.3001.5501</span></span></a></p>
