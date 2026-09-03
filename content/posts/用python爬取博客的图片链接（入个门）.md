---
title: 用python爬取博客的图片链接（入个门）
published: 2023-06-06
tags: [python,开发语言,爬虫,网络安全,http]
category: python
image: /image/c5efa739d57d285b278731cc4574c81f.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E8%AF%B7%E6%B1%82%E7%BD%91%E9%A1%B5%E7%9A%84%E6%BA%90%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E8%AF%B7%E6%B1%82%E7%BD%91%E9%A1%B5%E7%9A%84%E6%BA%90%E4%BB%A3%E7%A0%81">请求网页的源代码</a></p>

<p id="%E5%AE%9A%E4%B9%89%E5%A4%B4%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E5%AE%9A%E4%B9%89%E5%A4%B4%E6%96%87%E4%BB%B6">定义头文件</a></p>

<p id="%E7%88%AC%E5%8F%96%E6%BA%90%E4%BB%A3%E7%A0%81-toc" style="margin-left:40px;"><a href="#%E7%88%AC%E5%8F%96%E6%BA%90%E4%BB%A3%E7%A0%81">爬取源代码</a></p>

<p id="%E5%BC%80%E5%A7%8B%E9%80%89%E5%8F%96%E6%89%80%E9%9C%80%E8%A6%81%E7%9A%84%E9%83%A8%E5%88%86-toc" style="margin-left:0px;"><a href="#%E5%BC%80%E5%A7%8B%E9%80%89%E5%8F%96%E6%89%80%E9%9C%80%E8%A6%81%E7%9A%84%E9%83%A8%E5%88%86">开始选取所需要的部分</a></p>

<p id="%E7%94%A8PyQuery%E9%80%89%E6%8B%A9%E7%9B%B8%E5%BA%94%E7%9A%84%E5%8C%BA%E5%9D%97%EF%BC%88%E5%88%86%E6%94%AF%E5%8F%AF%E7%9C%8B%E5%8F%AF%E4%B8%8D%E7%9C%8B%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E7%94%A8PyQuery%E9%80%89%E6%8B%A9%E7%9B%B8%E5%BA%94%E7%9A%84%E5%8C%BA%E5%9D%97%EF%BC%88%E5%88%86%E6%94%AF%E5%8F%AF%E7%9C%8B%E5%8F%AF%E4%B8%8D%E7%9C%8B%EF%BC%89">用PyQuery选择相应的区块（分支可看可不看）</a></p>

<p id="%E4%BC%98%E7%82%B9-toc" style="margin-left:80px;"><a href="#%E4%BC%98%E7%82%B9">优点</a></p>

<p id="%E7%BC%BA%E7%82%B9-toc" style="margin-left:80px;"><a href="#%E7%BC%BA%E7%82%B9">缺点</a></p>

<p id="%E5%BC%80%E5%A7%8B%E5%AE%9A%E4%BD%8D%E9%93%BE%E6%8E%A5%E7%9A%84%E4%BD%8D%E7%BD%AE%EF%BC%88%E4%BD%BF%E7%94%A8%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E5%BC%80%E5%A7%8B%E5%AE%9A%E4%BD%8D%E9%93%BE%E6%8E%A5%E7%9A%84%E4%BD%8D%E7%BD%AE%EF%BC%88%E4%BD%BF%E7%94%A8%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F%EF%BC%89">开始定位链接的位置（使用正则表达式）</a></p>

<p id="%E5%87%BA%E7%8E%B0%E7%9A%84%E5%A5%87%E6%80%AA%E7%9A%84%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E5%87%BA%E7%8E%B0%E7%9A%84%E5%A5%87%E6%80%AA%E7%9A%84%E9%97%AE%E9%A2%98">出现的奇怪的问题</a></p>

<hr id="hr-toc" /><p></p>

<h1></h1>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>学了一个晚上学了一点点皮毛可能还有很多地方有不足但是思想大概搞懂了（python的re库把我脑袋搞晕了QAQ）</p>

<p></p>

<p>这个大佬轻喷，有什么改进可以指出十分感谢</p>

<p></p>

<h1 id="%E8%AF%B7%E6%B1%82%E7%BD%91%E9%A1%B5%E7%9A%84%E6%BA%90%E4%BB%A3%E7%A0%81">请求网页的源代码</h1>

<h2 id="%E5%AE%9A%E4%B9%89%E5%A4%B4%E6%96%87%E4%BB%B6">定义头文件</h2>

<p>许多网站为了防止有人恶意爬取，网站就会做反爬取</p>

<p></p>

<p>这个时候就要自己定义头文件，以便于可以正常显示源代码</p>

<p></p>

<p>比如csdn不定义User-Agent返回的源代码就为空</p>

<p></p>

<p>按f12打开控制台，打开网络（network）刷新网页，随便点击一个链接在请求的文件里有</p>

<p><img alt="" height="583" src="/image/c5efa739d57d285b278731cc4574c81f.png" width="467" /></p>

<p> <img alt="" height="675" src="/image/4be32b1a0b70d870b507c366b31eb9cf.png" width="467" /></p>

<blockquote>
<p>一般用到的就是User-Agent，host,cookie，Accept和connection</p>
</blockquote>

<p>这边我就定义一个头文件变量</p>

<p></p>

<pre>
<code class="language-python">headers_dict={

        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 Edg/114.0.1823.37'

}</code></pre>

<h2 id="%E7%88%AC%E5%8F%96%E6%BA%90%E4%BB%A3%E7%A0%81">爬取源代码</h2>

<p>然后开始爬取网页源代码</p>

<p>并且把源代码存起来</p>

<p></p>

<pre>
<code class="language-python">response = requests.get('https://blog.csdn.net/mumuemhaha/article/details/131031052?spm=1001.2014.3001.5501',headers=headers_dict)
html_1=response.text</code></pre>

<h1 id="%E5%BC%80%E5%A7%8B%E9%80%89%E5%8F%96%E6%89%80%E9%9C%80%E8%A6%81%E7%9A%84%E9%83%A8%E5%88%86">开始选取所需要的部分</h1>

<h2 id="%E7%94%A8PyQuery%E9%80%89%E6%8B%A9%E7%9B%B8%E5%BA%94%E7%9A%84%E5%8C%BA%E5%9D%97%EF%BC%88%E5%88%86%E6%94%AF%E5%8F%AF%E7%9C%8B%E5%8F%AF%E4%B8%8D%E7%9C%8B%EF%BC%89">用PyQuery选择相应的区块（分支可看可不看）</h2>

<blockquote>
<p>PyQuery可以把源代码中的&lt;div class=" a_1"&gt;...&lt;/div&gt;和&lt;ul id = "b_1 "&gt;&lt;/ul&gt;，&lt;c_1&gt;和&lt;/c_1&gt;的部分筛选出来</p>

<p>可以用</p>

<p>doc = pq(html)</p>

<p>print(doc('.a_1 #b_1').find("c_1"))</p>

<p>其中a_1代表的就是.（英文句号）+div class=" "空的值</p>

<p>b_1代表的就是ul id = " "空的值</p>

<p>c_1代表得到就是两个标签名称上面就"&lt;li&gt;"</p>
</blockquote>

<h3 id="%E4%BC%98%E7%82%B9">优点</h3>

<p>是语法相对比较简单</p>

<p>可以快速选择所需要的区域</p>

<h3 id="%E7%BC%BA%E7%82%B9">缺点</h3>

<p>只凭这个无法定位标签栏里面的元素，尤其是图片链接</p>

<p></p>

<p></p>

<h2 id="%E5%BC%80%E5%A7%8B%E5%AE%9A%E4%BD%8D%E9%93%BE%E6%8E%A5%E7%9A%84%E4%BD%8D%E7%BD%AE%EF%BC%88%E4%BD%BF%E7%94%A8%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F%EF%BC%89">开始定位链接的位置（使用正则表达式）</h2>

<p></p>

<p>这时候就要用re库来选择连接内容了</p>

<p>这里选择一个简单正则表达式的方便理解</p>

<pre>
<code class="language-python">ex = '.*? src="(.*?)" .*?'</code></pre>

<p>这里.*?代表的随机的值</p>

<p></p>

<p>而加个()就是要选择的值</p>

<p></p>

<p>这里的意思就是所有src="x_1"中x_1的值</p>

<p></p>

<p>然后调用re.findall()进行选择并且打印（或者存入txt文件也行）</p>

<pre>
<code class="language-python">ex = 'src="(.*?)"'
imglist = re.findall(ex, html_2)
print(imglist)
#['https://csdnimg.cn/release/blogv2/dist/mobile/img/iconLeftArrow.png', 'https://profile-avatar.csdnimg.cn/7611198b454e45eab7a77034fbc1c227_mumuemhaha.jpg!1']</code></pre>

<p></p>

<h1 id="%E5%87%BA%E7%8E%B0%E7%9A%84%E5%A5%87%E6%80%AA%E7%9A%84%E9%97%AE%E9%A2%98">出现的奇怪的问题</h1>

<pre>
<code class="language-bash">Traceback (most recent call last):
  File "D:\python\os\main_request.py", line 22, in &lt;module&gt;
    imglist = re.findall(ex, html_1)
  File "C:\Users\mumuemhaha\AppData\Local\Programs\Python\Python39\lib\re.py", line 241, in findall
    return _compile(pattern, flags).findall(string)
TypeError: expected string or bytes-like object</code></pre>

<p>这里就是因为PyQuery选取的区域格式不是string的</p>

<p>request获取的源代码时“&lt;class 'str'&gt;”而PyQuery选取出来的区域是&lt;class 'pyquery.pyquery.PyQuery'&gt;不过问题不大</p>

<p>强制格式转换就行</p>

<pre>
<code class="language-python">html_1=str(html_1)</code></pre>

<p></p>

<p></p>

<p>所有源代码（包括我验证PyQuery是不是string的语句也在上面）</p>

<pre>
<code class="language-python">import requests
import re

from pyquery import PyQuery as pq

headers_dict={

        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 Edg/114.0.1823.37'

}
response = requests.get('https://blog.csdn.net/mumuemhaha/article/details/131031052?spm=1001.2014.3001.5501',headers=headers_dict)
html_1=response.text
html_2=response.text

doc=pq(html_1)

html_1=doc('.aside-header-fixed .aside-left')
html_1=str(html_1)
print(type(html_2))
print(type(html_1))
ex = 'src="(.*?)"'
imglist = re.findall(ex, html_1)
print(imglist)
# print(html_1)

</code></pre>

<p></p>
