---
title: 用python从零开始做一个最简单的小说爬虫带GUI界面（3/3）
published: 2023-08-25
tags: [python,开发语言]
category: python
image: /_image/?href=%2F%40fs%2Fworkspace%2Ffuwari%2Fsrc%2Fassets%2Fimages%2Fdemo-avatar.png%3ForigWidth%3D700%26origHeight%3D700%26origFormat%3Djpg&w=700&h=700&f=webp
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E4%B8%8A%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9-toc" style="margin-left:0px;"><a href="#%E4%B8%8A%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9">上一章内容</a></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E5%87%BA%E7%8E%B0%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E5%87%BA%E7%8E%B0%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98">出现的一些问题</a></p>

<p id="requests%E5%8C%85%E7%88%AC%E5%8F%96%E5%B0%8F%E8%AF%B4%E7%9A%84%E4%B8%8D%E4%BE%BF%E4%B9%8B%E5%A4%84-toc" style="margin-left:40px;"><a href="#requests%E5%8C%85%E7%88%AC%E5%8F%96%E5%B0%8F%E8%AF%B4%E7%9A%84%E4%B8%8D%E4%BE%BF%E4%B9%8B%E5%A4%84">requests包爬取小说的不便之处</a></p>

<p id="%E5%88%A9%E7%94%A8aiohttp%E5%8C%85%E6%9D%A5%E5%BC%82%E6%AD%A5%E7%88%AC%E5%8F%96%E5%B0%8F%E8%AF%B4-toc" style="margin-left:0px;"><a href="#%E5%88%A9%E7%94%A8aiohttp%E5%8C%85%E6%9D%A5%E5%BC%82%E6%AD%A5%E7%88%AC%E5%8F%96%E5%B0%8F%E8%AF%B4">利用aiohttp包来异步爬取小说</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:40px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E4%BB%A3%E7%A0%81">代码</a></p>

<p id="main.py-toc" style="margin-left:40px;"><a href="#main.py">main.py</a></p>

<p id="%C2%A0test_1.py-toc" style="margin-left:40px;"><a href="#%C2%A0test_1.py"> test_1.py</a></p>

<p id="test_3.py-toc" style="margin-left:40px;"><a href="#test_3.py">test_3.py</a></p>

<p id="%E4%BB%A3%E7%A0%81%E5%A4%A7%E8%87%B4%E8%AE%B2%E8%A7%A3-toc" style="margin-left:0px;"><a href="#%E4%BB%A3%E7%A0%81%E5%A4%A7%E8%87%B4%E8%AE%B2%E8%A7%A3">代码大致讲解</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E7%B3%BB%E5%88%97%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E7%B3%BB%E5%88%97%E6%80%BB%E7%BB%93">系列总结</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E4%B8%8A%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9">上一章内容</h1>

<p><a class="has-card" data-link-desc="前一章博客我们讲了怎么通过PyQt5来制作图形化界面，并且进行一些基本设置接下来两章我们主要讲核心爬虫代码的实现。" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="用python从零开始做一个最简单的小说爬虫带GUI界面（2/3）_木木em哈哈的博客-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/132457770?spm=1001.2014.3001.5501" title="用python从零开始做一个最简单的小说爬虫带GUI界面（2/3）_木木em哈哈的博客-CSDN博客"><span class="link-card-box"><span class="link-title">用python从零开始做一个最简单的小说爬虫带GUI界面（2/3）_木木em哈哈的博客-CSDN博客</span><span class="link-desc">前一章博客我们讲了怎么通过PyQt5来制作图形化界面，并且进行一些基本设置接下来两章我们主要讲核心爬虫代码的实现。</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/mumuemhaha/article/details/132457770?spm=1001.2014.3001.5501</span></span></a></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>本章内容讲的是给出了小说文章链接的情况下，如何爬取小说</p>

<p><img alt="" height="512" src="/image/a25cb3a2e246f09c8d70a24257103ac5.gif" width="512" /></p>

<p></p>

<h1 id="%E5%87%BA%E7%8E%B0%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98">出现的一些问题</h1>

<h2 id="requests%E5%8C%85%E7%88%AC%E5%8F%96%E5%B0%8F%E8%AF%B4%E7%9A%84%E4%B8%8D%E4%BE%BF%E4%B9%8B%E5%A4%84">requests包爬取小说的不便之处</h2>

<p>在最开始的时候包括我前段时间写的博客都是利用requests包进行爬取</p>

<p>但是这回出现一个问题</p>

<p>简单来说就是request是顺序执行的</p>

<p>必须要等到上一个网络的请求返回后才会执行下一个步骤</p>

<p>假设我要爬取的小说有2000个章节</p>

<p>每次返回请求并且处理信息都需要1秒的时间</p>

<p>那么总共就需要2000秒也就是半个多小时</p>

<p>要是中间再来个返回超时出现错误的</p>

<p>心态直接要爆炸</p>

<p>返回超时我们可以设置超时等待时间</p>

<p>但是占据大部分时间的依然是网络请求的延迟</p>

<p>那有什么方法可以解决呢</p>

<h1 id="%E5%88%A9%E7%94%A8aiohttp%E5%8C%85%E6%9D%A5%E5%BC%82%E6%AD%A5%E7%88%AC%E5%8F%96%E5%B0%8F%E8%AF%B4">利用aiohttp包来异步爬取小说</h1>

<p></p>

<h2 id="%E4%BB%8B%E7%BB%8D">介绍</h2>

<blockquote>
<p>异步是一种比多线程高效得多的并发模型，是无序的，为了完成某个任务，在执行的过程中，不同程序单元之间过程中无需通信协调，也能完成任务的方式，也就是说不相关的程序单元之间可以是异步的。</p>
</blockquote>

<p>简单来说就是可以类比小学的一种数学——你可以再烧开水的时候洗菜，在煮饭的时候切菜的那类问题</p>

<p>在python程序中就是你在等待网络回复的数据包时候可以继续发送其他的数据包</p>

<p>起到资源利用趋于最大化的趋势</p>

<h1 id="%E4%BB%A3%E7%A0%81">代码</h1>

<p>具体的代码在这</p>

<p>这里只做初步介绍，具体包的使用不展开细讲</p>

<h2 id="main.py">main.py</h2>

<pre>
<code class="language-python">import sys
# PyQt5中使用的基本控件都在PyQt5.QtWidgets模块中
from PyQt5.QtWidgets import QApplication, QMainWindow
# 导入designer工具生成的login模块
from win import Ui_MainWindow
from test_1 import *
from test_3 import *
import time
class MyMainForm(QMainWindow, Ui_MainWindow):
    def __init__(self, parent=None):
        super(MyMainForm, self).__init__(parent)
        self.setupUi(self)
        self.Button_close.clicked.connect(self.close)
        self.Button_run.clicked.connect(self.F_run)

    def F_run(self):
        link_1=self.line_link.text()
        title_1=F_gettitle(link_1)
        self.text_result.setText(f"标题获取成功——{title_1}")
        # file_1=open(f'{title_1}.txt',mode='w',encoding='utf-8  ')
        test_1=F_getyuan(link_1)
        self.text_result.append("提取源代码成功")
        time.sleep(1)
        search_1=F_searchlink(test_1)
        self.text_result.append("提取文章链接成功")
        pachong(search_1,title_1)

if __name__ == "__main__":
    # 固定的，PyQt5程序都需要QApplication对象。sys.argv是命令行参数列表，确保程序可以双击运行
    app = QApplication(sys.argv)
    # 初始化
    myWin = MyMainForm()
    # 将窗口控件显示在屏幕上
    myWin.show()
    # 程序运行，sys.exit方法确保程序完整退出。
    sys.exit(app.exec_())

</code></pre>

<h2 id="%C2%A0test_1.py"> test_1.py</h2>

<pre>
<code class="language-python">import requests
import re
import numpy as np
from lxml import etree
#获取文章标题
def F_gettitle(link_0):
    head_qb={
        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36'
    }
    test_1=requests.get(url=link_0,headers=head_qb)
    test_yuan=test_1.text
    dom=etree.HTML(test_yuan)
    test_2=dom.xpath('/html/body/article[1]/div[2]/div[2]/h1/text()')
    return test_2[0]


#提取源代码
def F_getyuan(link_1):
    head_qb={
        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36'
    }
    test_1=requests.get(url=link_1,headers=head_qb)
    test_yuan=test_1.text
    test_yuan=str(test_yuan)
    return test_yuan


#查询所有小说章节链接
def F_searchlink(link_2):
    re_1='&lt;a id="haitung" href="(.*?)" rel="chapter"&gt;'
    re_1=re.compile(re_1)
    link_3=re.findall(re_1,link_2)
    link_max=np.array([])
    for link_1 in link_3:
        link_4=f'http://www.biquge66.net{link_1}'
        link_max=np.append(link_max,link_4)

    return link_max


# #输出文章内容
# def F_edittxt(link_3):
#     head_qb={
#         'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36'
#     }
#     trytimes = 3
#     for i in range(trytimes):
#         try:
#             proxies = None
#             test_1=requests.get(url=link_3,headers=head_qb, verify=False, proxies=None, timeout=3)
#             if test_1.status_code == 200:
#                 break
#         except:
#             print(f'requests failed {i} time')
#     #提取文章链接
#     re_2='&lt;p&gt;(.*?)&lt;/p&gt;'
#     re_2=re.compile(re_2)
#     #提取文章标题
#     re_3='&lt;h1 class="bookname"&gt;(.*?)&lt;/h1&gt;'
#     re.compile(re_3)
#     test_2=np.array([])
#     test_3=np.array([])
#     test_2=re.findall(re_2,test_1.text)
#     test_3 = re.findall(re_3, test_1.text)
#     #放在数组的最后一个
#     test_2=np.append(test_3,test_2)
#     return test_2


</code></pre>

<h2 id="test_3.py">test_3.py</h2>

<pre>
<code class="language-python">import asyncio
import aiohttp
import re
import numpy as np

title=''


async def F_2(session,url):
    head_qb = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36'
    }
    async with session.get(url,verify_ssl=False,headers=head_qb) as resqonse:
        global title
        text=await resqonse.text()
        text=str(text)
        re_2 = '&lt;p&gt;(.*?)&lt;/p&gt;'
        re_2 = re.compile(re_2)
        # 提取文章标题
        re_3 = '&lt;h1 class="bookname"&gt;(.*?)&lt;/h1&gt;'
        re.compile(re_3)
        test_2 = np.array([])
        test_3 = np.array([])
        test_2 = re.findall(re_2, text)
        test_3 = re.findall(re_3, text)
        test_2 = np.append(test_3, test_2)
        for test_max in test_2:
            with open(f'{title}.txt',mode='a',encoding='utf-8') as file:
                file.writelines(test_max)


async def F_1(urls):
    async with aiohttp.ClientSession() as session:
        tasks=[asyncio.create_task(F_2(session,url)) for url in urls]
        await asyncio.wait(tasks)



def pachong(urls_1,title_1):
    global title
    title=title_1
    asyncio.run(F_1(urls_1))
    title=title_1

</code></pre>

<h1 id="%E4%BB%A3%E7%A0%81%E5%A4%A7%E8%87%B4%E8%AE%B2%E8%A7%A3">代码大致讲解</h1>

<p>主函数中传入的pachong(）的两个参数，一个是文章链接的总列表，一个是小说的名字（用于创建txt文件的名称）</p>

<p>在等待网络回复时继续发送请求</p>

<p>之后利用re库来提取源代码中的文章文字最后写入txt中</p>

<h1 id="%E6%B3%A8%E6%84%8F">注意</h1>

<p>利用这种方法爬取的内容小说章节是无序的，但是可以通过章节名来进行排序（好难写，不想写了）</p>

<h1 id="%E7%B3%BB%E5%88%97%E6%80%BB%E7%BB%93">系列总结</h1>

<p>本次文章初步了解了GUI图形界面的制作，并且了解了另外一种爬虫爬取的方法——异步爬虫</p>

<p></p>
