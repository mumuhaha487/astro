---
title: 用python来爬取某鱼的商品信息（2/2）
published: 2023-08-13
tags: [python,开发语言,爬虫,selenium,html]
category: python
image: /_image/?href=%2F%40fs%2Fworkspace%2Ffuwari%2Fsrc%2Fassets%2Fimages%2Fdemo-avatar.png%3ForigWidth%3D700%26origHeight%3D700%26origFormat%3Djpg&w=700&h=700&f=webp
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E4%B8%8A%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0-toc" style="margin-left:0px;"><a href="#%E4%B8%8A%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0">上一篇文章</a></p>

<p id="%E6%9C%AC%E7%AB%A0%E5%86%85%E5%AE%B9-toc" style="margin-left:0px;"><a href="#%E6%9C%AC%E7%AB%A0%E5%86%85%E5%AE%B9">本章内容</a></p>

<p id="%E8%AE%BE%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%BA%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9D%9F%E5%90%8E%E4%B8%8D%E5%85%B3%E9%97%AD%EF%BC%88%E5%8F%AF%E9%80%89%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E8%AE%BE%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%BA%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9D%9F%E5%90%8E%E4%B8%8D%E5%85%B3%E9%97%AD%EF%BC%88%E5%8F%AF%E9%80%89%EF%BC%89">设置浏览器为运行结束后不关闭（可选）</a></p>

<p id="%E5%AE%9A%E4%BD%8D%E5%88%B0%E6%90%9C%E7%B4%A2%E6%A1%86%E7%9A%84xpath%E5%9C%B0%E5%9D%80-toc" style="margin-left:40px;"><a href="#%E5%AE%9A%E4%BD%8D%E5%88%B0%E6%90%9C%E7%B4%A2%E6%A1%86%E7%9A%84xpath%E5%9C%B0%E5%9D%80">定位到搜索框的xpath地址</a></p>

<p id="%E6%89%A7%E8%A1%8C%E5%8A%A8%E4%BD%9C-toc" style="margin-left:0px;"><a href="#%E6%89%A7%E8%A1%8C%E5%8A%A8%E4%BD%9C">执行动作</a></p>

<p id="%E8%8E%B7%E5%8F%96cookie-toc" style="margin-left:0px;"><a href="#%E8%8E%B7%E5%8F%96cookie">获取cookie</a></p>

<p id="%E4%BF%9D%E5%AD%98%E4%B8%BAjson%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E4%BF%9D%E5%AD%98%E4%B8%BAjson%E6%96%87%E4%BB%B6">保存为json文件</a></p>

<p id="%E4%BF%AE%E6%94%B9cookie%E7%9A%84sameSite%E5%80%BC%E5%B9%B6%E4%B8%94%E5%AF%BC%E5%85%A5cookie-toc" style="margin-left:0px;"><a href="#%E4%BF%AE%E6%94%B9cookie%E7%9A%84sameSite%E5%80%BC%E5%B9%B6%E4%B8%94%E5%AF%BC%E5%85%A5cookie">修改cookie的sameSite值并且导入cookie</a></p>

<p id="%E5%AF%BC%E5%85%A5cookie%EF%BC%88%E5%87%BA%E9%94%99%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E5%AF%BC%E5%85%A5cookie%EF%BC%88%E5%87%BA%E9%94%99%EF%BC%89">导入cookie（出错）</a></p>

<p id="%E5%AF%BC%E5%85%A5cookie%EF%BC%88%E4%BF%AE%E6%94%B9%E5%90%8E%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E5%AF%BC%E5%85%A5cookie%EF%BC%88%E4%BF%AE%E6%94%B9%E5%90%8E%EF%BC%89">导入cookie（修改后）</a></p>

<p id="%E6%9C%80%E5%90%8E%E5%87%BA%E7%8E%B0%E9%A1%B5%E9%9D%A2-toc" style="margin-left:0px;"><a href="#%E6%9C%80%E5%90%8E%E5%87%BA%E7%8E%B0%E9%A1%B5%E9%9D%A2">最后出现页面</a></p>

<p id="%E9%9C%80%E8%A6%81%E6%B3%A8%E6%84%8F%E7%9A%84%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E9%9C%80%E8%A6%81%E6%B3%A8%E6%84%8F%E7%9A%84%E9%97%AE%E9%A2%98">需要注意的问题</a></p>

<p id="%E6%89%80%E6%9C%89%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E6%89%80%E6%9C%89%E4%BB%A3%E7%A0%81">所有代码</a></p>

<p id="%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E7%BB%93">总结</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E4%B8%8A%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0">上一篇文章</h1>

<p><a class="has-card" data-link-desc="本章讲理论，后面一节讲代码拿来练练手的，练练selenium包，实战一下（本来想拿来练手的，没想到他喵的有挺多防爬的，直接开局就困难难度我靠，凸(艹皿艹 )）找到可以爬取的网站然后添加cookie然后刷新界面就可以发现搜索结果出来了这一次实战经历真的让我遇到了selenium许多奇奇怪怪的反爬手段，也是让我可以大幅度提升自己实战经验的一个经历，前前后后排bug，绕反爬，这一个项目打了整整两天。累diet" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="用python来爬取某鱼的商品信息（1/2）_木木em哈哈的博客-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/132238660?spm=1001.2014.3001.5502" title="用python来爬取某鱼的商品信息（1/2）_木木em哈哈的博客-CSDN博客"><span class="link-card-box"><span class="link-title">用python来爬取某鱼的商品信息（1/2）_木木em哈哈的博客-CSDN博客</span><span class="link-desc">本章讲理论，后面一节讲代码拿来练练手的，练练selenium包，实战一下（本来想拿来练手的，没想到他喵的有挺多防爬的，直接开局就困难难度我靠，凸(艹皿艹 )）找到可以爬取的网站然后添加cookie然后刷新界面就可以发现搜索结果出来了这一次实战经历真的让我遇到了selenium许多奇奇怪怪的反爬手段，也是让我可以大幅度提升自己实战经验的一个经历，前前后后排bug，绕反爬，这一个项目打了整整两天。累diet</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/mumuemhaha/article/details/132238660?spm=1001.2014.3001.5502</span></span></a></p>

<h1 id="%E6%9C%AC%E7%AB%A0%E5%86%85%E5%AE%B9">本章内容</h1>

<p>主要讲的是上一章的代码实现</p>

<p><img alt="" height="300" src="/image/aac993ff566e35f1d2acb7ee2c25c626.gif" width="300" /></p>

<p></p>

<p>导入所需要的程序包</p>

<pre>
<code class="language-python">from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
import time
import json</code></pre>

<h1 id="%E8%AE%BE%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%BA%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9D%9F%E5%90%8E%E4%B8%8D%E5%85%B3%E9%97%AD%EF%BC%88%E5%8F%AF%E9%80%89%EF%BC%89">设置浏览器为运行结束后不关闭（可选）</h1>

<p>之后先设置自己想要搜索的内容，并且把浏览器设置为允许结束后不关闭，并且打开要爬取的咸鱼网站（可设可不设）</p>

<pre>
<code class="language-python">input_1=input('输入想要搜索的内容:')

option = webdriver.ChromeOptions()
option.add_experimental_option("detach", True)

# 注意此处添加了chrome_options参数
driver = webdriver.Chrome(chrome_options=option)
driver.get('https://h5.m.goofish.com/app/idleFish-F2e/fish-mini-pha/search.html?spm=a2170.tb_mini_index.0.0')</code></pre>

<h2 id="%E5%AE%9A%E4%BD%8D%E5%88%B0%E6%90%9C%E7%B4%A2%E6%A1%86%E7%9A%84xpath%E5%9C%B0%E5%9D%80">定位到搜索框的xpath地址</h2>

<pre>
<code class="language-python">driver_1=driver.find_element(by='xpath',value='/html/body/div/div/div[1]/input')</code></pre>

<h1 id="%E6%89%A7%E8%A1%8C%E5%8A%A8%E4%BD%9C">执行动作</h1>

<p>执行动作（调用鼠标api点击刚刚定位的搜索框，然后输入input_1的值并且回车</p>

<pre>
<code class="language-python">ActionChains(driver) \
    .move_to_element(driver_1) \
    .click_and_hold() \
    .pause(1) \
    .send_keys(input_1) \
    .key_down(Keys.ENTER)\
    .perform()

time.sleep(1)</code></pre>

<p>中间的.pause(1)以及time.sleep(1)是等待一秒钟的时间（保险起见，怕网页没有加载好，或者你设置一个selenium等待函数更保险）</p>

<p></p>

<h1 id="%E8%8E%B7%E5%8F%96cookie">获取cookie</h1>

<p>接下来就是获取cookie，获取cookie方法上一章讲了</p>

<p><img alt="" height="670" src="/image/301629a762053c9f072c3db406351779.png" width="701" /></p>

<p> 在你的浏览器上，下载cookie editor插件登录，不要用运行python时跳出的浏览器，正常打开浏览器（这样不会跳验证码。。。即使跳了也可以手动成功过），导出你的cookie</p>

<h2 id="%E4%BF%9D%E5%AD%98%E4%B8%BAjson%E6%96%87%E4%BB%B6">保存为json文件</h2>

<p>然后新建一个json格式的文件并且把它命名为cookie.json</p>

<p><img alt="" height="1030" src="/image/afaa8fe9a424f064ef8422e7bc5c3120.png" width="1200" /></p>

<p></p>

<h1 id="%E4%BF%AE%E6%94%B9cookie%E7%9A%84sameSite%E5%80%BC%E5%B9%B6%E4%B8%94%E5%AF%BC%E5%85%A5cookie">修改cookie的sameSite值并且导入cookie</h1>

<h2 id="%E5%AF%BC%E5%85%A5cookie%EF%BC%88%E5%87%BA%E9%94%99%EF%BC%89">导入cookie（出错）</h2>

<pre>
<code class="language-python">cookies=json.load(open('cookie.json', 'r'))
for cookie in cookies:
    driver.add_cookie(cookie)</code></pre>

<p>但是！！！！</p>

<p>前面讲过直接导入会报错</p>

<pre>
<code class="language-bash"> assert cookie_dict[‘sameSite‘] in [‘Strict‘, ‘Lax‘] AssertionError()</code></pre>

<p>由于这里语法规定sameSite必须为‘Strict‘, ‘Lax‘两个之一，不然就报错</p>

<p>所以我们要遍历字典，并且把字典中的sameSite设置为Strict</p>

<h2 id="%E5%AF%BC%E5%85%A5cookie%EF%BC%88%E4%BF%AE%E6%94%B9%E5%90%8E%EF%BC%89">导入cookie（修改后）</h2>

<p>所以代码改为</p>

<pre>
<code class="language-python">cookies=json.load(open('cookie.json', 'r'))
for cookie in cookies:
    if'sameSite' in cookie:
        cookie['sameSite'] = 'Strict'
    driver.add_cookie(cookie)
driver.refresh()</code></pre>

<p>注意，导入cookie后要用driver.refresh()刷新</p>

<h1>打印源代码</h1>

<p> 然后打印网页的源代码，注意要等3秒加载元素（或者用re库带的筛选，筛选你想要的的元素，比如商品链接，价格，以及介绍）</p>

<pre>
<code class="language-python">time.sleep(3)
print(driver.page_source)</code></pre>

<p></p>

<h1 id="%E6%9C%80%E5%90%8E%E5%87%BA%E7%8E%B0%E9%A1%B5%E9%9D%A2">最后出现页面</h1>

<p><img alt="" height="1030" src="/image/cddc0bfb7e545d6d202ef0214bfe8945.png" width="1200" /></p>

<p></p>

<h1 id="%E9%9C%80%E8%A6%81%E6%B3%A8%E6%84%8F%E7%9A%84%E9%97%AE%E9%A2%98">需要注意的问题</h1>

<ul><li>首先要说的是这个通过python不如通过app抓包来的稳定</li>
	<li>页面中你登录的cookie的失效时间是不确定的，所以你可能需要经常更新cookie（看个人情况）</li>
	<li>无法频繁（比如5分钟一次）搜索，否则会跳滑块验证，或者你有多个账号也可以搞（大概也就这个流程）</li>
	<li>写出来的代码只是提取出来网页源代码——其实都提取出网页源代码了，使用就只有一个筛选了（csdn上有大把的优质博主和大佬教你通过源代码过滤有用的信息）</li>
	<li>当然如果需要的话我可以再水一篇博客<img alt="" height="126" src="/image/079eec9258a8b8fbf25120c6a8fc5798.png" width="107" /></li>
	<li>它理论上可以关联到钉钉机器人或者是QQ机器人上实现定时推送咸鱼信息（啊？你问我为什么不继续写？因为还没学，不然这期标题末尾就不是（2/2）而是（2/3）了；咳咳咳...u1s1，钉钉应该是有教程教的，傻妞机器人应该也可以执行python脚本的，<s>“按理”来说不会很难实现</s>，实在不行我再去学吧（累die...）</li>
</ul><h1 id="%E6%89%80%E6%9C%89%E4%BB%A3%E7%A0%81">所有代码</h1>

<p>所有代码附上吧</p>

<pre>
<code class="language-python">from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
import time
import json

input_1=input('输入想要搜索的内容:')


# 不自动关闭浏览器
option = webdriver.ChromeOptions()
option.add_experimental_option("detach", True)

# 注意此处添加了chrome_options参数
driver = webdriver.Chrome(chrome_options=option)
driver.get('https://h5.m.goofish.com/app/idleFish-F2e/fish-mini-pha/search.html?spm=a2170.tb_mini_index.0.0')


driver_1=driver.find_element(by='xpath',value='/html/body/div/div/div[1]/input')



ActionChains(driver) \
    .move_to_element(driver_1) \
    .click_and_hold() \
    .pause(1) \
    .send_keys(input_1) \
    .key_down(Keys.ENTER)\
    .perform()

time.sleep(1)

cookies=json.load(open('cookie.json', 'r'))
for cookie in cookies:
    if'sameSite' in cookie:
        cookie['sameSite'] = 'Strict'
    driver.add_cookie(cookie)
driver.refresh()

time.sleep(3)
print(driver.page_source)





</code></pre>

<h1 id="%E6%80%BB%E7%BB%93">总结</h1>

<p>这些代码搞得我晕头转向的，尤其是那个内嵌的登录页面让我走了很多弯路，但是对于这个库的学习应该也算是初窥门径吧，如果有大佬有优化的地方欢迎指出（真的没学多深，很容易出错的）</p>

<p><img alt="" height="560" src="/image/74619a29ef5420e46c405704cfa37b2f.gif" width="500" /></p>

<p></p>

<p></p>

<p></p>
