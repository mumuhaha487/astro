---
title: 编译一个基于debian/ubuntu,centos,arhlinux第三方系统的问题解答
published: 2024-04-21
tags: [debian,ubuntu,centos,linux,内核]
category: 宝塔
image: /image/d8262339afae2c982ba795e645371205.png
---

<!--more-->

<p><strong>如果是开机卡boot注意看前面几行会有错误提示，一般会比较好找，下面是过了kernel内核加载后出现的问题</strong></p>

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E4%B8%8A%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0-toc" style="margin-left:0px;"><a href="#%E4%B8%8A%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0">上一篇文章</a></p>

<p id="%E7%AC%AC%E4%B8%80%E4%B8%AA%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%B8%80%E4%B8%AA%E9%97%AE%E9%A2%98">第一个问题</a></p>

<p id="%E9%94%99%E8%AF%AF%E5%8E%9F%E5%9B%A0-toc" style="margin-left:40px;"><a href="#%E9%94%99%E8%AF%AF%E5%8E%9F%E5%9B%A0">错误原因</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:40px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E7%AC%AC%E4%BA%8C%E4%B8%AA%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%BA%8C%E4%B8%AA%E9%97%AE%E9%A2%98">第二个问题</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:40px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E7%AC%AC%E4%B8%89%E4%B8%AA%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%B8%89%E4%B8%AA%E9%97%AE%E9%A2%98">第三个问题</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E4%B8%8A%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0">上一篇文章</h1>

<p><a class="has-card" data-link-desc="文章浏览阅读721次，点赞9次，收藏11次。这边由于操作比较多，整合了许多大佬的教程以及自行的摸索，流程会长一些，可能对于一些程序的错误以及bug可能会忘记提及，不过我印象比较深亦或者是网上几乎找不到答案的bug和错误都会提及。"  data-link-title="编译一个基于debian/ubuntu,centos,arhlinux第三方系统-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/137979943?spm=1001.2014.3001.5502" title="编译一个基于debian/ubuntu,centos,arhlinux第三方系统-CSDN博客"><span class="link-card-box"><span class="link-title">编译一个基于debian/ubuntu,centos,arhlinux第三方系统-CSDN博客</span><span class="link-desc">文章浏览阅读721次，点赞9次，收藏11次。这边由于操作比较多，整合了许多大佬的教程以及自行的摸索，流程会长一些，可能对于一些程序的错误以及bug可能会忘记提及，不过我印象比较深亦或者是网上几乎找不到答案的bug和错误都会提及。</span><span class="link-link"><img alt="" class="link-link-icon"  />https://blog.csdn.net/mumuemhaha/article/details/137979943?spm=1001.2014.3001.5502</span></span></a>没看过的可以去看看，这一篇列出我遇到的问题</p>

<h1 id="%E7%AC%AC%E4%B8%80%E4%B8%AA%E9%97%AE%E9%A2%98">第一个问题</h1>

<p>不打字了直接截图</p>

<p><img alt="" height="550" src="/image/d8262339afae2c982ba795e645371205.png" width="961" /></p>

<p>结尾是</p>

<blockquote>
<p>Try passing init =option to kernel.see Linux Documentation/admin-guide/init.rst for guidance.</p>
</blockquote>

<p>搜了一圈，好家伙，几乎没有解决办法。</p>

<p>这个错误一般出现在你第一次打包镜像时可以进去，但是如果把linux的chroot镜像给安装了一些包时会出现</p>

<h2 id="%E9%94%99%E8%AF%AF%E5%8E%9F%E5%9B%A0">错误原因</h2>

<p>由于开机的信息跳的太快了，我用obs录屏+慢放找到时内存给的不够（写博客的时候视频给我删了，对不起），因为此系统是全部加载到内存之中的。属于虚拟rootfs</p>

<h2 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h2>

<p>尝试把内存调大一些然后重试，或者比较建议用busybox编译的简易linux系统来做虚拟rootfs，之后把实际rootfs挂载到硬盘之中进行打开（挖个坑，有时间会出教程）</p>

<h1 id="%E7%AC%AC%E4%BA%8C%E4%B8%AA%E9%97%AE%E9%A2%98">第二个问题</h1>

<p>我想加bios开机菜单就像这样，怎么做？</p>

<p><img alt="" height="483" src="/image/3ba0c4dd1bdd7a2dd8b6ce79399155f1.png" width="639" /></p>

<p> 编辑你的isobios文件夹中的isolinux.cfg文件</p>

<pre>
<code class="hljs">default vesamenu.c32
prompt 0
timeout 100
menu title Systemback Live (Debain10_GRC_OAI)
menu tabmsg Press TAB key to edit 

label linux
    menu label ^Boot Linux
    kernel vmlinuz
    append initrd=initrd.gz</code></pre>

<p>我给出的文件，照着改就行了</p>

<p>如果想要新建那就新建一个label就行</p>

<h2 id="%E6%B3%A8%E6%84%8F">注意</h2>

<p>看到开头的<span style="color:#ffd900;"><span style="background-color:#fe2c24;">default vesamenu.c32</span></span>吗？</p>

<p>需要你的iso镜像中拥有它，只需将他放入你打包镜像的工作目录即可</p>

<p>同时它还有一些依赖的文件这里全给出来</p>

<pre>
<code class="language-bash">libcom32.c32
libutil.c32</code></pre>

<p>这些文件都可以在syslinux中找到</p>

<p><strong><span style="background-color:#38d8f0;">什么？你找不到？</span></strong></p>

<pre>
<code class="language-bash">find . -name 文件名</code></pre>

<p>就可以找到相应的文件目录</p>

<h1 id="%E7%AC%AC%E4%B8%89%E4%B8%AA%E9%97%AE%E9%A2%98">第三个问题</h1>

<p>博主，我进入系统时都找不到硬盘该怎么办？</p>

<p>缺少驱动文件</p>

<p>可以在你的真机里面（前提是linux），复制一份即可。目录文件是/lib/modules/6.5.0-28-generic，把它复制到你文件的相应目录就可以找到相应的硬盘了。</p>

<p><img alt="" height="861" src="/image/d265ddb51ad3fa7dbaf52ddb016c43e2.png" width="1200" /></p>
