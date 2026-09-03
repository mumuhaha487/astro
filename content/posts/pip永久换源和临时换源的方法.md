---
title: pip永久换源和临时换源的方法
published: 2023-06-06
tags: [pip]
category: python
---

<!--more-->

<h1>为什么要换源</h1>

<blockquote>
<p>因为在pip下载python包时由于服务器架设在国外这样国内访问掉包率和速度会很慢</p>

<p>后一种还好，前一种下载体积大的包不可避免会超时，这样就要用到国内的镜像源了</p>
</blockquote>

<h1>第一种（非永久改源）</h1>

<p>这一种只需要在下载的包名后加一个“<span style="background-color:#a2e043;">-i 镜像链接</span>”</p>

<p>下面是几个常用的镜像</p>

<pre>
<code class="language-bash">清华大学：https://pypi.tuna.tsinghua.edu.cn/simple

阿里云：https://mirrors.aliyun.com/pypi/simple

中国科学技术大学 https://pypi.mirrors.ustc.edu.cn/simple

豆瓣：https://pypi.douban.com/simple
</code></pre>

<p>那么命令就是</p>

<pre>
<code class="language-bash">pip install 包名 -i https://mirrors.aliyun.com/pypi/simple</code></pre>

<h1></h1>

<h1>第二种方法（永久改源）</h1>

<p>在“<span style="background-color:#a2e043;">C:\Users\%username%\AppData\Roaming</span>”目录下（或者直接在地址栏输入<span style="background-color:#a2e043;">%username%</span>）</p>

<p>创建一个<span style="background-color:#a2e043;">pip.ini</span></p>

<p><span style="background-color:#a2e043;">输入以下命令</span></p>

<pre>
<code class="language-bash">[global]
timeout = 6000
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
</code></pre>

<p>其中链接<span style="background-color:#a2e043;">index-url</span>和<span style="background-color:#a2e043;">trusted-host</span>可以改为其他的镜像源</p>

<p>最好重启一下</p>

<p>应该就可以了</p>

<h1>一些改源时候会遇到的问题</h1>

<p></p>

<p>一部分的pip源链接可能是http格式的（不是https格式）这样下载时可能会出警告甚至报错</p>

<blockquote>
<p>ERROR: Could not find a version that satisfies the requirement pandas (from versions: none)<br />
ERROR: No matching distribution found for pandas<br />
 </p>
</blockquote>

<p>注意改为https格式的链接就行</p>

<p>部分镜像源的部分包的部分老版本可能会没有，如果下载不到相应版本还是换成官方的镜像源下载吧。</p>
