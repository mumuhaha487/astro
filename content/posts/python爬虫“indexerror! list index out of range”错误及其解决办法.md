---
title: python爬虫“indexerror： list index out of range”错误及其解决办法
published: 2023-06-08
tags: [python,开发语言]
category: python
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E5%9B%A0">前因</a></p>

<p id="%E5%BC%80%E5%A7%8B%E7%9A%84%E8%AE%A4%E4%B8%BA%E5%8E%9F%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E5%BC%80%E5%A7%8B%E7%9A%84%E8%AE%A4%E4%B8%BA%E5%8E%9F%E5%9B%A0">开始的认为原因</a></p>

<p id="%E6%BA%90%E4%BB%A3%E7%A0%81%EF%BC%88%E6%80%BB%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E6%BA%90%E4%BB%A3%E7%A0%81%EF%BC%88%E6%80%BB%EF%BC%89">源代码（总）</a></p>

<p id="%E7%9C%9F%E6%AD%A3%E5%8E%9F%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E7%9C%9F%E6%AD%A3%E5%8E%9F%E5%9B%A0">真正原因</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:40px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93">问题总结</a></p>

<p id="%E4%B8%AA%E4%BA%BA%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E4%B8%AA%E4%BA%BA%E6%80%BB%E7%BB%93">个人总结</a></p>

<hr id="hr-toc" /><p></p>

<h1></h1>

<h1 id="%E5%89%8D%E5%9B%A0">前因</h1>

<p>在写爬虫代码时候代码报错</p>

<blockquote>
<p>indexerror: list index out of range</p>

<p>indexerror:列表索引超出范围</p>
</blockquote>

<h1 id="%E5%BC%80%E5%A7%8B%E7%9A%84%E8%AE%A4%E4%B8%BA%E5%8E%9F%E5%9B%A0">开始的认为原因</h1>

<p>前一期的博客我准备爬取盗版小说的的小说时，因为加载的字数太多</p>

<p>我就想然后就是因为这个报了这个错误</p>

<p></p>

<h2 id="%E6%BA%90%E4%BB%A3%E7%A0%81%EF%BC%88%E6%80%BB%EF%BC%89">源代码（总）</h2>

<p>带上代码</p>

<pre>
<code class="language-python">import requests                            
import re                                  
import numpy as np                         
from bs4 import BeautifulSoup              
#目标url                                     
url='http://www.ibiqu.org/148_148106/'     
#主页网站，不加的话还要后面分离链接                         
url2='http://www.ibiqu.org'                
#定义头文件                                     
head_bqg={                                 
        'User-Agent':'Mozilla/5.0 (Linux; A
}                                          
html_zhuye=requests.get(url,headers=head_bq
html_1=BeautifulSoup(html_zhuye.text,'html.
html_1.select('body &gt; div.cover &gt; ul &gt; a &gt;h
html_1=str(html_1)                         
ex='&lt;dd&gt;&lt;a href="(.*?)".*?'                
ex=re.compile(ex)                          
imglists = re.findall(ex, html_1)          
url_lists=np.array([])                     
for imglist in imglists:                   
        url_max=f'{url2}{imglist}'         
        url_lists=np.append(url_lists,url_m
                                           
print(url_lists)                           
file_1= open('114514.txt','w')             
for url_list in url_lists:                 
        txt_novel=requests.get(url_list,hea
        ex='&lt;div id="content"&gt;(.*?)&lt;/div&gt;' 
        re.compile(ex)                     
        txt_2=re.findall(ex,txt_novel.text)
        ex_1='&lt;p&gt;\u3000\u3000|&lt;/p&gt;'        
        re.compile(ex_1)                   
        txt_2=re.sub(ex_1,'',txt_2[0])     
        txt_2=str(txt_2)[2:-2]             
        file_1.writelines(f'{txt_2}\n')    </code></pre>

<p></p>

<p></p>

<h1 id="%E7%9C%9F%E6%AD%A3%E5%8E%9F%E5%9B%A0">真正原因</h1>

<p>后来我想到那为什么还有其他的文字的python项目爬虫爬取的项目比我长了好几倍，但是它依然不会报错</p>

<p>不对劲，我感觉</p>

<p>后来我联系源码内容</p>

<p>想到是不是因为我的一些数据下标没有（也就是空数组），导致下面代码</p>

<blockquote>
<p>        txt_2=re.sub(ex_1,'',txt_2[0])     <br />
        txt_2=str(txt_2)[2:-2] </p>
</blockquote>

<p>根本找不到下标</p>

<p></p>

<h2 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h2>

<p>最后不图省事了，直接遍历列表，这样空的列表也就会跳过</p>

<p></p>

<pre>
<code class="language-python">        for txt_3 in txt_2:                       
                txt_3=re.sub(ex_1,'',txt_3)       
                file_1.writelines(f'{txt_3}\n')   </code></pre>

<p>结果十分奇怪，它不报错了，但是好像要加载很久，过一段时间再想一想这里还有没有优化的内容</p>

<p>实在不行就直接把需要爬取的链接存取到列表里然后运行一次程序爬取一行链接存储到文档中。</p>

<p>所以最后总代码</p>

<pre>
<code class="language-python">import requests
import re
import numpy as np
from bs4 import BeautifulSoup
#目标url
url='http://www.ibiqu.org/148_148106/'
#主页网站，不加的话还要后面分离链接
url2='http://www.ibiqu.org'
#定义头文件
head_bqg={
        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 Edg/114.0.1823.37'
}
html_zhuye=requests.get(url,headers=head_bqg)
html_1=BeautifulSoup(html_zhuye.text,'html.parser')
html_1.select('body &gt; div.cover &gt; ul &gt; a &gt;href')
html_1=str(html_1)
ex='&lt;dd&gt;&lt;a href="(.*?)".*?'
ex=re.compile(ex)
imglists = re.findall(ex, html_1)
url_lists=np.array([])
for imglist in imglists:
        url_max=f'{url2}{imglist}'
        url_lists=np.append(url_lists,url_max)

print(url_lists)
file_1= open('114514.txt','w')
for url_list in url_lists:
        txt_novel=requests.get(url_list,headers=head_bqg)
        ex='&lt;div id="content"&gt;(.*?)&lt;/div&gt;'
        re.compile(ex)
        txt_2=re.findall(ex,txt_novel.text)
        ex_1='&lt;p&gt;\u3000\u3000|&lt;/p&gt;'
        re.compile(ex_1)
        for txt_3 in txt_2:
                txt_3=re.sub(ex_1,'',txt_3)
                file_1.writelines(f'{txt_3}\n')
        # for txt_3 in txt_2:
        #     file_1.writelines(f'{txt_3}\n')

file_1.close()



</code></pre>

<h1 id="%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93">问题总结</h1>

<p>python列表为空的原因导致索引错误，继而导致找不到索引</p>

<p></p>

<h1 id="%E4%B8%AA%E4%BA%BA%E6%80%BB%E7%BB%93">个人总结</h1>

<p>不要图省事，至少在报错的时候最好用最基础的方法试一遍</p>
