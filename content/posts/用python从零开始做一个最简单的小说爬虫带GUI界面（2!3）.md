---
title: 用python从零开始做一个最简单的小说爬虫带GUI界面（2/3）
published: 2023-08-24
tags: [python,爬虫,开发语言,服务器,算法,c++]
category: python
image: /_image/?href=%2F%40fs%2Fworkspace%2Ffuwari%2Fsrc%2Fassets%2Fimages%2Fdemo-avatar.png%3ForigWidth%3D700%26origHeight%3D700%26origFormat%3Djpg&w=700&h=700&f=webp
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E4%B8%80%E7%AB%A0%E5%8D%9A%E5%AE%A2-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E4%B8%80%E7%AB%A0%E5%8D%9A%E5%AE%A2">前一章博客</a></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E4%B8%BB%E5%87%BD%E6%95%B0%E7%9A%84%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0-toc" style="margin-left:0px;"><a href="#%E4%B8%BB%E5%87%BD%E6%95%B0%E7%9A%84%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0">主函数的代码实现</a></p>

<p id="%E9%80%90%E8%A1%8C%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90-toc" style="margin-left:40px;"><a href="#%E9%80%90%E8%A1%8C%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90">逐行代码解析</a></p>

<p id="%E8%8E%B7%E5%8F%96%E9%93%BE%E6%8E%A5-toc" style="margin-left:80px;"><a href="#%E8%8E%B7%E5%8F%96%E9%93%BE%E6%8E%A5">获取链接</a></p>

<p id="%E8%8E%B7%E5%8F%96%E6%A0%87%E9%A2%98-toc" style="margin-left:80px;"><a href="#%E8%8E%B7%E5%8F%96%E6%A0%87%E9%A2%98">获取标题</a></p>

<p id="%E8%8E%B7%E5%8F%96%E7%BD%91%E9%A1%B5%E6%BA%90%E4%BB%A3%E7%A0%81-toc" style="margin-left:80px;"><a href="#%E8%8E%B7%E5%8F%96%E7%BD%91%E9%A1%B5%E6%BA%90%E4%BB%A3%E7%A0%81">获取网页源代码</a></p>

<p id="%E8%8E%B7%E5%8F%96%E5%90%84%E4%B8%AA%E6%96%87%E7%AB%A0%E7%9A%84%E9%93%BE%E6%8E%A5-toc" style="margin-left:80px;"><a href="#%E8%8E%B7%E5%8F%96%E5%90%84%E4%B8%AA%E6%96%87%E7%AB%A0%E7%9A%84%E9%93%BE%E6%8E%A5">获取各个文章的链接</a></p>

<p id="%E5%87%BD%E6%95%B0%E7%9A%84%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E5%87%BD%E6%95%B0%E7%9A%84%E4%BB%A3%E7%A0%81">函数的代码</a></p>

<p id="%E5%AF%BC%E5%85%A5%E5%BA%93%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E5%AF%BC%E5%85%A5%E5%BA%93%E6%96%87%E4%BB%B6">导入库文件</a></p>

<p id="%E8%8E%B7%E5%8F%96%E6%96%87%E7%AB%A0%E7%9A%84%E6%A0%87%E9%A2%98-toc" style="margin-left:40px;"><a href="#%E8%8E%B7%E5%8F%96%E6%96%87%E7%AB%A0%E7%9A%84%E6%A0%87%E9%A2%98">获取文章的标题</a></p>

<p id="%E8%8E%B7%E5%8F%96%E6%96%87%E7%AB%A0%E7%9A%84%E6%BA%90%E4%BB%A3%E7%A0%81-toc" style="margin-left:40px;"><a href="#%E8%8E%B7%E5%8F%96%E6%96%87%E7%AB%A0%E7%9A%84%E6%BA%90%E4%BB%A3%E7%A0%81">获取文章的源代码</a></p>

<p id="-toc" style="margin-left:40px;"></p>

<p id="%E6%8F%90%E5%8F%96%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E7%9A%84%E5%90%84%E4%B8%AA%E6%96%87%E7%AB%A0%E7%9A%84%E9%93%BE%E6%8E%A5-toc" style="margin-left:40px;"><a href="#%E6%8F%90%E5%8F%96%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E7%9A%84%E5%90%84%E4%B8%AA%E6%96%87%E7%AB%A0%E7%9A%84%E9%93%BE%E6%8E%A5">提取文章目录的各个文章的链接</a></p>

<p id="%E6%80%BB%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E4%BB%A3%E7%A0%81">总代码</a></p>

<p id="%E4%B8%8B%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9">下一章内容</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E4%B8%80%E7%AB%A0%E5%8D%9A%E5%AE%A2">前一章博客</h1>

<p><a class="has-card" data-link-desc="而且当时的爬虫代码有许多问题但是最近学了PyQt5想着搞个带界面的爬虫玩玩那就啥也不说开搞！！！" data-link-icon="" data-link-title="用python从零开始做一个最简单的小说爬虫带GUI界面（1/3)_木木em哈哈的博客-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/132394257?spm=1001.2014.3001.5501" title="用python从零开始做一个最简单的小说爬虫带GUI界面（1/3)_木木em哈哈的博客-CSDN博客"><span class="link-card-box"><span class="link-title">用python从零开始做一个最简单的小说爬虫带GUI界面（1/3)_木木em哈哈的博客-CSDN博客</span><span class="link-desc">而且当时的爬虫代码有许多问题但是最近学了PyQt5想着搞个带界面的爬虫玩玩那就啥也不说开搞！！！</span><span class="link-link"><img alt="" class="link-link-icon" src="" />https://blog.csdn.net/mumuemhaha/article/details/132394257?spm=1001.2014.3001.5501</span></span></a></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>前一章博客我们讲了怎么通过PyQt5来制作图形化界面，并且进行一些基本设置</p>

<p>接下来两章我们主要讲核心爬虫代码的实现</p>

<p><img alt="" height="512" src="/image/6cc7e60e6062eacb51e9c1b292922fcb.gif" width="512" /></p>

<h1 id="%E4%B8%BB%E5%87%BD%E6%95%B0%E7%9A%84%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0">主函数的代码实现</h1>

<p> 前一章中的代码</p>

<pre>
<code class="language-python">self.Button_run.clicked.connect(self.F_run)</code></pre>

<p>代表点击按钮执行F_run函数（注意这里不要打括号）</p>

<p>那么我们就需要定义这个函数</p>

<p>思路大概就是这样</p>

<pre>
<code class="language-python">    def F_run(self):
        link_1=self.line_link.text()
        title_1=F_gettitle(link_1)
        self.text_result.setText(f"标题获取成功——{title_1}")
        # file_1=open(f'{title_1}.txt',mode='w',encoding='utf-8  ')
        test_1=F_getyuan(link_1)
        self.text_result.setText("提取源代码成功")
        time.sleep(1)
        search_1=F_searchlink(test_1)
        self.text_result.append("提取文章链接成功")
        pachong(search_1,title_1)</code></pre>

<h2 id="%E9%80%90%E8%A1%8C%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90">逐行代码解析</h2>

<h3 id="%E8%8E%B7%E5%8F%96%E9%93%BE%E6%8E%A5">获取链接</h3>

<p>首先通过</p>

<pre>
<code class="language-python">self.line_link.text()</code></pre>

<p>命令获取在输入框中输入的链接</p>

<p>并且把它赋值到link_1中</p>

<h3 id="%E8%8E%B7%E5%8F%96%E6%A0%87%E9%A2%98">获取标题</h3>

<p>同时我会通过爬取网页链接的源代码进行提取关键字获得文章的标题</p>

<p>也就是小说的名字</p>

<pre>
<code class="language-python">title_1=F_gettitle(link_1)</code></pre>

<h3 id="%E8%8E%B7%E5%8F%96%E7%BD%91%E9%A1%B5%E6%BA%90%E4%BB%A3%E7%A0%81">获取网页源代码</h3>

<p>爬取小说文章目录网页的源代码并且赋值为test_1（用于后续提取各个文章的链接）</p>

<pre>
<code class="language-python">test_1=F_getyuan(link_1)</code></pre>

<h3 id="%E8%8E%B7%E5%8F%96%E5%90%84%E4%B8%AA%E6%96%87%E7%AB%A0%E7%9A%84%E9%93%BE%E6%8E%A5">获取各个文章的链接</h3>

<pre>
<code class="language-python">search_1=F_searchlink(test_1)</code></pre>

<p>把得到的源代码进行提取筛选获得各个文章的链接</p>

<p>其中self.text_result.setText以及self.text_result.append是在下面红圈中显示的东西</p>

<p>（美观用，可以不加）</p>

<p><img alt="" height="524" src="/image/51f36ef63de135c3f02ccca4ed49cf1a.png" width="681" /></p>

<h1 id="%E5%87%BD%E6%95%B0%E7%9A%84%E4%BB%A3%E7%A0%81">函数的代码</h1>

<p>这里为了不让代码过于长，我自己有单独新建了两个python文件用于存放python函数</p>

<h2 id="%E5%AF%BC%E5%85%A5%E5%BA%93%E6%96%87%E4%BB%B6">导入库文件</h2>

<pre>
<code class="language-python">import requests
import re
import numpy as np
from lxml import etree</code></pre>

<p>  request用于网络请求</p>

<p>re以及lxml用于过滤源代码的信息</p>

<p>而numpy用于存储元素</p>

<h2 id="%E8%8E%B7%E5%8F%96%E6%96%87%E7%AB%A0%E7%9A%84%E6%A0%87%E9%A2%98">获取文章的标题</h2>

<pre>
<code class="language-python">def F_gettitle(link_0):
    head_qb={
        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36'
    }
    test_1=requests.get(url=link_0,headers=head_qb)
    test_yuan=test_1.text
    dom=etree.HTML(test_yuan)
    test_2=dom.xpath('/html/body/article[1]/div[2]/div[2]/h1/text()')
    return test_2[0]</code></pre>

<p>很简单的一个的结构</p>

<p>由requests来获取源代码</p>

<p>之后用lxml中的tree来筛选源代码</p>

<p>（用xpath路径时最后要加text（）输出文本形式，不然出不了源代码）</p>

<p>xpath路径可以通过按f12控制台来提取</p>

<p><img alt="" height="921" src="/image/97c07fcda3005bd7c31313782f66c774.png" width="1200" /></p>

<h2 id="%E8%8E%B7%E5%8F%96%E6%96%87%E7%AB%A0%E7%9A%84%E6%BA%90%E4%BB%A3%E7%A0%81">获取文章的源代码</h2>

<p>应该很好理解，就直接写代码了</p>

<pre>
<code class="language-python">def F_getyuan(link_1):
    head_qb={
        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36'
    }
    test_1=requests.get(url=link_1,headers=head_qb)
    test_yuan=test_1.text
    test_yuan=str(test_yuan)
    return test_yuan</code></pre>

<h2></h2>

<h2 id="%E6%8F%90%E5%8F%96%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E7%9A%84%E5%90%84%E4%B8%AA%E6%96%87%E7%AB%A0%E7%9A%84%E9%93%BE%E6%8E%A5">提取文章目录的各个文章的链接</h2>

<pre>
<code class="language-python">def F_searchlink(link_2):
    re_1='&lt;a id="haitung" href="(.*?)" rel="chapter"&gt;'
    re_1=re.compile(re_1)
    link_3=re.findall(re_1,link_2)
    link_max=np.array([])
    for link_1 in link_3:
        link_4=f'http://www.biquge66.net{link_1}'
        link_max=np.append(link_max,link_4)

    return link_max</code></pre>

<p>这里我直接用re库的正则来进行匹配了匹配的链接</p>

<p><span style="color:#ffd900;"><span style="background-color:#fe2c24;">注意由于匹配的链接不是完整链接</span></span></p>

<p>所以还需要进行拼接</p>

<p><img alt="" height="979" src="/image/2849728925c025f19fb2de54798aff7a.png" width="1200" /></p>

<p> 拼接完成后便可以直接打开</p>

<p>在这里我先存储到数组中方便之后爬取各个文章的源代码</p>

<p>然后进行返回</p>

<p></p>

<h1 id="%E6%80%BB%E4%BB%A3%E7%A0%81">总代码</h1>

<p>main.py</p>

<pre>
<code class="language-python">import sys
# PyQt5中使用的基本控件都在PyQt5.QtWidgets模块中
from PyQt5.QtWidgets import QApplication, QMainWindow
# 导入designer工具生成的login模块
from win import Ui_MainWindow
from test_1 import *
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

<p>test_1.py</p>

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

<h1 id="%E4%B8%8B%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9">下一章内容</h1>

<p>最后获取了所有的章节链接了，接下来就要爬取文章了</p>

<p>本来可以一起写的（可以看到我test_1.py中注释掉的部分），但是后面发现出了一些问题</p>

<p>才有了下一章内容</p>

<p>下一章会详细说明的</p>
