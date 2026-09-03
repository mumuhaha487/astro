---
title: python库的etree函数转换源代码时只有一行代码
published: 2023-06-08
tags: [python,开发语言,爬虫,后端]
category: python
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E2%80%99%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E2%80%99%E9%97%AE%E9%A2%98">问题</a></p>

<p id="%E5%8E%9F%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E5%8E%9F%E5%9B%A0">原因</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:0px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E5%8E%9F%E7%90%86-toc" style="margin-left:0px;"><a href="#%E5%8E%9F%E7%90%86">原理</a></p>

<p id="%E4%BB%A3%E7%A0%81-toc" style="margin-left:40px;"><a href="#%E4%BB%A3%E7%A0%81">代码</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<hr id="hr-toc" /><p></p>

<h1></h1>

<h1 id="%E2%80%99%E9%97%AE%E9%A2%98">问题</h1>

<p>附上代码</p>

<pre>
<code class="language-python">from lxml import etree
text = '''
&lt;div&gt;
    &lt;ul&gt;
         &lt;li class="item-0"&gt;&lt;a href="link1.html"&gt;first item&lt;/a&gt;&lt;/li&gt;
         &lt;li class="item-1"&gt;&lt;a href="link2.html"&gt;second item&lt;/a&gt;&lt;/li&gt;
         &lt;li class="item-inactive"&gt;&lt;a href="link3.html"&gt;third item&lt;/a&gt;&lt;/li&gt;
         &lt;li class="item-1"&gt;&lt;a href="link4.html"&gt;fourth item&lt;/a&gt;&lt;/li&gt;
     &lt;/ul&gt;
 &lt;/div&gt;
'''
html_1 = etree.HTML(text)
print(type(html_1))
print(html_1)</code></pre>

<p>打印出来的结果就是</p>

<blockquote>
<p>&lt;class 'lxml.etree._Element'&gt;<br />
&lt;Element html at 0x140a12ac780&gt;</p>
</blockquote>

<h1 id="%E5%8E%9F%E5%9B%A0">原因</h1>

<p>原因也十分简单，因为etree函数需要传递的编码格式为'<span style="background-color:#ed7976;">utf-8'</span></p>

<p>而python中变量的编码格式为<span style="background-color:#ed7976;">Unicode</span>格式</p>

<p>格式不同，传递的时候当然会出错</p>

<p>可以用<span style="background-color:#ed7976;">bs4库中的BeautifulSoup</span>，但是etree基于c语言编写运行的速度一般来说比前者要快</p>

<p>所以我铁了心了要用它有什么办法吗？</p>

<p></p>

<h1 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h1>

<h1 id="%E5%8E%9F%E7%90%86">原理</h1>

<p>当然</p>

<p>有！！！</p>

<p>既然要utf-8，那我就把编码格式转成utf-8不就行了</p>

<p>怎么转呢？</p>

<p>只需要把Unicode的字符转为bytes类型</p>

<p>然后用<span><span style="background-color:#38d8f0;">decode('utf-8')</span><span>函数来解码为utf-8</span></span></p>

<h2 id="%E4%BB%A3%E7%A0%81"><span><span>代码</span></span></h2>

<p><span><span>代码附上</span></span></p>

<pre>
<code class="language-python">bytes_res = etree.tostring(html_1)
str_res = etree.tostring(html_1).decode('utf-8')
print(str_res)</code></pre>

<p>打印出来的结果就是</p>

<blockquote>
<p>&lt;html&gt;&lt;body&gt;&lt;div&gt;<br />
    &lt;ul&gt;<br />
         &lt;li class="item-0"&gt;&lt;a href="link1.html"&gt;first item&lt;/a&gt;&lt;/li&gt;<br />
         &lt;li class="item-1"&gt;&lt;a href="link2.html"&gt;second item&lt;/a&gt;&lt;/li&gt;<br />
         &lt;li class="item-inactive"&gt;&lt;a href="link3.html"&gt;third item&lt;/a&gt;&lt;/li&gt;<br />
         &lt;li class="item-1"&gt;&lt;a href="link4.html"&gt;fourth item&lt;/a&gt;&lt;/li&gt;<br />
         &lt;li class="item-0"&gt;&lt;a href="link5.html"&gt;fifth item&lt;/a&gt; &lt;!--&amp;#27880;&amp;#24847; &amp;#36825;&amp;#37324;&amp;#23569;&amp;#20102;&amp;#19968;&amp;#20010;&lt;li&gt;&amp;#26631;&amp;#31614;--&gt;<br />
     &lt;/li&gt;&lt;/ul&gt;<br />
 &lt;/div&gt;<br />
&lt;/body&gt;&lt;/html&gt;</p>
</blockquote>

<p>这样就打印好了</p>

<p></p>

<h1 id="%E6%B3%A8%E6%84%8F">注意</h1>

<blockquote>
<p>因为为utf-8格式所以在输入中文是打印出来的也不是中文，而是一个诸如<span style="background-color:#38d8f0;">“&amp;#21834”</span><span>的英文代码</span></p>

<p><span>但是问题不大，只要中文不是乱码就应该还能识别回来</span></p>
</blockquote>
