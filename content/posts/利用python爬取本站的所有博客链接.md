---
title: 利用python爬取本站的所有博客链接
published: 2024-02-29
tags: [python,开发语言]
category: python
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E5%9B%A0">前因</a></p>

<p id="%E9%A6%96%E5%85%88%E7%9A%84%E5%B0%9D%E8%AF%95-toc" style="margin-left:0px;"><a href="#%E9%A6%96%E5%85%88%E7%9A%84%E5%B0%9D%E8%AF%95">首先的尝试</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:0px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E5%AF%BC%E5%85%A5%E5%8C%85-toc" style="margin-left:40px;"><a href="#%E5%AF%BC%E5%85%A5%E5%8C%85">导入包</a></p>

<p id="%E5%AE%9A%E4%B9%89%E4%B8%80%E4%B8%AAjson%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E5%AE%9A%E4%B9%89%E4%B8%80%E4%B8%AAjson%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6">定义一个json配置文件</a></p>

<p id="%E6%89%93%E5%BC%80%E6%B5%8F%E8%A7%88%E5%99%A8%E6%89%A7%E8%A1%8C%E6%93%8D%E4%BD%9C-toc" style="margin-left:40px;"><a href="#%E6%89%93%E5%BC%80%E6%B5%8F%E8%A7%88%E5%99%A8%E6%89%A7%E8%A1%8C%E6%93%8D%E4%BD%9C">打开浏览器执行操作</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:80px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E6%8F%90%E5%8F%96%E6%BA%90%E4%BB%A3%E7%A0%81%E5%B9%B6%E4%B8%94%E8%BF%9B%E8%A1%8C%E7%AD%9B%E9%80%89%E9%93%BE%E6%8E%A5-toc" style="margin-left:40px;"><a href="#%E6%8F%90%E5%8F%96%E6%BA%90%E4%BB%A3%E7%A0%81%E5%B9%B6%E4%B8%94%E8%BF%9B%E8%A1%8C%E7%AD%9B%E9%80%89%E9%93%BE%E6%8E%A5">提取源代码并且进行筛选链接</a></p>

<p id="%E6%89%A7%E8%A1%8C%E7%BB%93%E6%9E%9C-toc" style="margin-left:0px;"><a href="#%E6%89%A7%E8%A1%8C%E7%BB%93%E6%9E%9C">执行结果</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E5%9B%A0">前因</h1>

<p>由于自己要把csdn的博客同步到hugo中，把博客转为md格式已经搞好了，但是由于csdn的图片具有防盗链，所以打算把所有的图片爬取下来，然后保存在本地</p>

<p>刚好本人略懂一些python，所以自己先写了一个脚本用来爬取各个博客的链接，如果不想听我多bb的直接去我的github看源码</p>

<p><a class="has-card" data-link-desc="Contribute to mumuhaha487/Get_csdn development by creating an account on GitHub." data-link-title="GitHub - mumuhaha487/Get_csdn" href="https://github.com/mumuhaha487/Get_csdn" title="GitHub - mumuhaha487/Get_csdn"><span class="link-card-box"><span class="link-title">GitHub - mumuhaha487/Get_csdn</span><span class="link-desc">Contribute to mumuhaha487/Get_csdn development by creating an account on GitHub.</span><span class="link-link"><img class="link-link-icon"  alt="icon-default.png?t=N7T8" />https://github.com/mumuhaha487/Get_csdn</span></span></a></p>

<h1 id="%E9%A6%96%E5%85%88%E7%9A%84%E5%B0%9D%E8%AF%95">首先的尝试</h1>

<p>首先的尝试就是利用简单好用的request包进行爬取。</p>

<p>但是由于csdn的博客是不显示全部，滑动底部时更新一部分</p>

<p><s>request包可能做不了这么复杂的工作QAQ</s></p>

<p>好像<a class="link-info" data-link-title="https://blog.csdn.net/你的名字/article/list/" href="https://blog.csdn.net/%E4%BD%A0%E7%9A%84%E5%90%8D%E5%AD%97/article/list/" title="https://blog.csdn.net/你的名字/article/list/">https://blog.csdn.net/你的名字/article/list/</a>链接可以用request包进行爬取</p>

<h1 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h1>

<p>那么恰好我有学过一点点的selenium包，所以搞了一个自动化的形式通过模拟鼠标滑动到文章的底部来获取到所有的文章链接</p>

<h2 id="%E5%AF%BC%E5%85%A5%E5%8C%85">导入包</h2>

<p>各个包都有解释用途</p>

<pre>
<code class="language-python">from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains    #用于自动化框架执行动作
import time     #延时操作，方便网站加载完全
import json     #用于读取配置信息
import re   #从源代码中提取文章的链接</code></pre>

<h2 id="%E5%AE%9A%E4%B9%89%E4%B8%80%E4%B8%AAjson%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6">定义一个json配置文件</h2>

<p>定义一个json配置文件方便管理</p>

<p>现在文件只有用户名称,后续可加配置</p>

<pre>
<code class="language-bash">{
  "blog_id": "mumuemhaha"
}</code></pre>

<p>读取用户名称，并且将其拼接成csdn个人博客链接</p>

<pre>
<code class="language-python">with open("./config.json",'r') as file_1:
    data_1=json.load(file_1)

blog_id=data_1["blog_id"]
url_1=f"https://blog.csdn.net/{blog_id}?type=blog"</code></pre>

<h2 id="%E6%89%93%E5%BC%80%E6%B5%8F%E8%A7%88%E5%99%A8%E6%89%A7%E8%A1%8C%E6%93%8D%E4%BD%9C">打开浏览器执行操作</h2>

<h3 id="%E6%B3%A8%E6%84%8F">注意</h3>

<p>这里由于不知道要下滑多少次，所以可以设定一个很大的数字然后每滑动十次判断源代码是否更新，然后源代码没有变化则跳出循环即可（</p>

<pre>
<code class="language-python">driver = webdriver.Chrome()
driver.get(url_1)
for i in range(10000):
    time.sleep(0.5)
    actions = ActionChains(driver)
    actions.send_keys(Keys.PAGE_DOWN)  # 可以多次发送 PAGE_DOWN 来实现滚动的距离
    actions.perform()
    if i % 10 == 0:  # 每滑动 10 次进行判断
        prev_page_source = driver.page_source  # 获取前一次滑动后的页面源码
        time.sleep(2)  # 等待页面加载
        current_page_source = driver.page_source  # 获取当前页面源码

        if prev_page_source == current_page_source:
            print("网站滑倒底了，跳出循环...")
            break</code></pre>

<h2 id="%E6%8F%90%E5%8F%96%E6%BA%90%E4%BB%A3%E7%A0%81%E5%B9%B6%E4%B8%94%E8%BF%9B%E8%A1%8C%E7%AD%9B%E9%80%89%E9%93%BE%E6%8E%A5">提取源代码并且进行筛选链接</h2>

<pre>
<code class="language-python">req_1=driver.page_source
re_1='&lt;a data-v-6fe2b6a7="" href="(.*?)"'
blog_urls=re.findall(re_1,req_1)</code></pre>

<h1 id="%E6%89%A7%E8%A1%8C%E7%BB%93%E6%9E%9C">执行结果</h1>

<p>我加了一个打印链接个数的代码来判断是否全部爬取下来了</p>

<pre>
<code class="language-python">print(f"文章个数为{len(blog_urls)}（看看是不是全爬下来了）")</code></pre>

<p><img alt="" height="1021" src="/image/dfd547c86bb40913d6a79c46e7e08dd6.png" width="1200" /></p>

<p> 全部代码为</p>

<pre>
<code class="language-python">from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains    #用于自动化框架执行动作
import time     #延时操作，方便网站加载完全
import json     #用于读取配置信息
import re   #从源代码中提取文章的链接
with open("./config.json",'r') as file_1:
    data_1=json.load(file_1)

blog_id=data_1["blog_id"]
url_1=f"https://blog.csdn.net/{blog_id}?type=blog"
driver = webdriver.Chrome()
driver.get(url_1)
for i in range(10000):
    time.sleep(0.5)
    actions = ActionChains(driver)
    actions.send_keys(Keys.PAGE_DOWN)  # 可以多次发送 PAGE_DOWN 来实现滚动的距离
    actions.perform()
    if i % 10 == 0:  # 每滑动 10 次进行判断
        prev_page_source = driver.page_source  # 获取前一次滑动后的页面源码
        time.sleep(2)  # 等待页面加载
        current_page_source = driver.page_source  # 获取当前页面源码

        if prev_page_source == current_page_source:
            print("网站滑倒底了，跳出循环...")
            break

req_1=driver.page_source
re_1='&lt;a data-v-6fe2b6a7="" href="(.*?)"'
blog_urls=re.findall(re_1,req_1)
print(f"文章个数为{len(blog_urls)}（看看是不是全爬下来了）")
</code></pre>

<p></p>
