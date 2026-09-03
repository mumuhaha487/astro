---
title: 数据处理——用numpy的empty等方法把许多numpy数组变为一个大的每个独立的数组
published: 2023-05-19
tags: [numpy,python,机器学习]
category: python
image: /image/469b729defc8d0f010babd004ebb4f53.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%9C%A8%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86%E7%9A%84%E8%BF%87%E7%A8%8B%E6%9C%89%E6%97%B6%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BA%86%E6%96%B9%E4%BE%BF%E7%AE%A1%E7%90%86%E4%BC%9A%E6%8A%8A%E5%A4%9A%E4%B8%AA%E5%B0%8F%E6%95%B0%E7%BB%84%E5%90%88%E5%B9%B6%E4%B8%BA%E4%B8%80%E4%B8%AA%E5%A4%A7%E6%95%B0%E7%BB%84-toc" style="margin-left:0px;"><a href="#%E5%9C%A8%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86%E7%9A%84%E8%BF%87%E7%A8%8B%E6%9C%89%E6%97%B6%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BA%86%E6%96%B9%E4%BE%BF%E7%AE%A1%E7%90%86%E4%BC%9A%E6%8A%8A%E5%A4%9A%E4%B8%AA%E5%B0%8F%E6%95%B0%E7%BB%84%E5%90%88%E5%B9%B6%E4%B8%BA%E4%B8%80%E4%B8%AA%E5%A4%A7%E6%95%B0%E7%BB%84">数据处理的问题</a></p>

<p id="%E5%88%A9%E7%94%A8reshape%E5%87%BD%E6%95%B0%E7%94%A8%E6%9D%A5%E4%BF%AE%E6%94%B9%E5%BD%A2%E7%8A%B6-toc" style="margin-left:0px;"><a href="#%E5%88%A9%E7%94%A8reshape%E5%87%BD%E6%95%B0%E7%94%A8%E6%9D%A5%E4%BF%AE%E6%94%B9%E5%BD%A2%E7%8A%B6">利用reshape函数用来修改形状</a></p>

<p id="%C2%A0%E5%88%A9%E7%94%A8empty%E6%9D%A5%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E6%95%B0%E7%BB%84%E7%94%A8%E6%9D%A5%E5%AD%98%E5%82%A8%E5%A4%9A%E4%B8%AA%E6%95%B0%E6%8D%AE-toc" style="margin-left:0px;"><a href="#%C2%A0%E5%88%A9%E7%94%A8empty%E6%9D%A5%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E6%95%B0%E7%BB%84%E7%94%A8%E6%9D%A5%E5%AD%98%E5%82%A8%E5%A4%9A%E4%B8%AA%E6%95%B0%E6%8D%AE"> 利用empty来创建一个数组用来存储多个数据</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%9C%A8%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86%E7%9A%84%E8%BF%87%E7%A8%8B%E6%9C%89%E6%97%B6%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BA%86%E6%96%B9%E4%BE%BF%E7%AE%A1%E7%90%86%E4%BC%9A%E6%8A%8A%E5%A4%9A%E4%B8%AA%E5%B0%8F%E6%95%B0%E7%BB%84%E5%90%88%E5%B9%B6%E4%B8%BA%E4%B8%80%E4%B8%AA%E5%A4%A7%E6%95%B0%E7%BB%84">数据处理的问题</h1>

<p>在数据处理的过程有时我们为了方便管理会把多个小数组合并为一个大数组，但是初学者用简单的多个array[]合并会遇到一个问题</p>

<p></p>

<p></p>

<p></p>

<pre>
<code>import numpy as np

a=np.array([1,2])
b=np.array([3,4])
a=np.append(a,b)
print(a)
</code></pre>

<p><img alt="" height="248" src="/image/469b729defc8d0f010babd004ebb4f53.png" width="1200" /></p>

<p> 这样也许不是我们想要的，我们想要的是多个二维数组而不是一个单一的一维数组</p>

<p></p>

<p></p>

<p></p>

<p></p>

<h1 id="%E5%88%A9%E7%94%A8reshape%E5%87%BD%E6%95%B0%E7%94%A8%E6%9D%A5%E4%BF%AE%E6%94%B9%E5%BD%A2%E7%8A%B6">利用reshape函数用来修改形状</h1>

<p>还是刚刚的代码只需要稍作修改</p>

<pre>
<code>import numpy as np

a=np.array([1,2])
b=np.array([3,4])
a=np.append(a,b)
a=np.reshape(a,(-1,2))          #np.reshape(array,shape)其中-1代表的就是空，这里的意思就是行数数随便列数必须为2的二维数组必须对应的上不然就会报错
print(a)
</code></pre>

<p></p>

<p></p>

<p>出来的结果：<img alt="" height="244" src="/image/2494d857df9db604e68882cad7042829.png" width="1200" /></p>

<p><span style="color:#a2e043;">同样你可以在输入数据的时候就把多少个存储下来然后用其他的函数去修改形状也行</span></p>

<h1 id="%C2%A0%E5%88%A9%E7%94%A8empty%E6%9D%A5%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E6%95%B0%E7%BB%84%E7%94%A8%E6%9D%A5%E5%AD%98%E5%82%A8%E5%A4%9A%E4%B8%AA%E6%95%B0%E6%8D%AE"> 利用empty来创建一个数组用来存储多个数据</h1>

<p>利用empty来固定数组的维度</p>

<p></p>

<p>优点是比较简便</p>

<p></p>

<p>缺点是他好像他只可以用来固定1*n维的数组（有知道的评论区说一下）</p>

<p></p>

<pre>
<code>import numpy as np
a=np.array([[1,2]],dtype=float)
b=np.array([[3,4]],dtype=float)
c=np.empty([0,2],dtype=float) #np.empty([x,y],dtype=float)应该数创建x个固定为1*y类型为float类型的数组
c=np.append(c,a,axis=0)
c=np.append(c,b,axis=0)
print(c)</code></pre>

<p><span style="color:#fe2c24;">需要注意的是在empty中如果np.empty([x,y])x不为0的话新生成x个1*y维数组，值随机所以最好用0</span></p>

<p><span style="color:#fe2c24;">之前不为0给我创建了x个1*y的随机值</span></p>

<p></p>

<p>结果：</p>

<p><img alt="" height="238" src="/image/e23a822dddd65802aa649d022c19485f.png" width="1200" /></p>

<p></p>
