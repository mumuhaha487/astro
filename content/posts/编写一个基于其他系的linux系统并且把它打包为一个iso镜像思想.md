---
title: 编写一个基于其他系的linux系统并且把它打包为一个iso镜像思想
published: 2024-06-27
tags: [debian,运维,linux,系统架构]
category: 宝塔
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E9%9D%A2%E5%86%99%E7%9A%84%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E9%9D%A2%E5%86%99%E7%9A%84%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0">前面写的一篇文章</a></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="isolinux%E5%BC%95%E5%AF%BC%E6%A8%A1%E5%BC%8F%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B-toc" style="margin-left:0px;"><a href="#isolinux%E5%BC%95%E5%AF%BC%E6%A8%A1%E5%BC%8F%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B">isolinux引导模式启动流程</a></p>

<p id="%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81initramdisk%E6%93%8D%E4%BD%9C%E8%80%8C%E4%B8%8D%E7%9B%B4%E6%8E%A5%E5%8A%A0%E8%BD%BD%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F-toc" style="margin-left:0px;"><a href="#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81initramdisk%E6%93%8D%E4%BD%9C%E8%80%8C%E4%B8%8D%E7%9B%B4%E6%8E%A5%E5%8A%A0%E8%BD%BD%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F">为什么要initramdisk操作而不直接加载文件系统</a></p>

<p id="%E7%BC%96%E5%86%99%E7%B3%BB%E7%BB%9F%E7%9A%84%E6%80%9D%E6%83%B3-toc" style="margin-left:0px;"><a href="#%E7%BC%96%E5%86%99%E7%B3%BB%E7%BB%9F%E7%9A%84%E6%80%9D%E6%83%B3">编写系统的思想</a></p>

<p id="%E5%8F%AF%E8%83%BD%E9%97%AE%E9%A2%98-toc" style="margin-left:40px;"><a href="#%E5%8F%AF%E8%83%BD%E9%97%AE%E9%A2%98">可能问题</a></p>

<p id="%E4%B8%80%E8%88%AC%E7%9A%84iso%E9%95%9C%E5%83%8F%E7%9B%AE%E5%89%8D%E5%8F%AA%E6%94%AF%E6%8C%81%E6%9C%80%E5%A4%A74G%E7%9A%84%E5%A4%A7%E5%B0%8F%EF%BC%8C%E9%9C%80%E8%A6%81%E6%80%8E%E4%B9%88%E8%A7%A3%E5%86%B3%EF%BC%9F-toc" style="margin-left:80px;"><a href="#%E4%B8%80%E8%88%AC%E7%9A%84iso%E9%95%9C%E5%83%8F%E7%9B%AE%E5%89%8D%E5%8F%AA%E6%94%AF%E6%8C%81%E6%9C%80%E5%A4%A74G%E7%9A%84%E5%A4%A7%E5%B0%8F%EF%BC%8C%E9%9C%80%E8%A6%81%E6%80%8E%E4%B9%88%E8%A7%A3%E5%86%B3%EF%BC%9F">一般的iso镜像目前只支持最大4G的大小，需要怎么解决？</a></p>

<p id="%E5%A6%82%E4%BD%95%E5%8E%BB%E6%89%BE%E9%A9%B1%E5%8A%A8-toc" style="margin-left:80px;"><a href="#%E5%A6%82%E4%BD%95%E5%8E%BB%E6%89%BE%E9%A9%B1%E5%8A%A8">如何去找驱动</a></p>

<p id="%E6%9C%A8%E6%9C%A8em%E5%93%88%E5%93%88%E6%83%B3%E8%AF%B4%E7%9A%84%E8%AF%9D%EF%BC%88%E4%B8%8E%E6%9C%AC%E5%8D%9A%E6%96%87%E6%97%A0%E5%85%89%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E6%9C%A8%E6%9C%A8em%E5%93%88%E5%93%88%E6%83%B3%E8%AF%B4%E7%9A%84%E8%AF%9D%EF%BC%88%E4%B8%8E%E6%9C%AC%E5%8D%9A%E6%96%87%E6%97%A0%E5%85%89%EF%BC%89">木木em哈哈想说的话（与本博文无光）</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E9%9D%A2%E5%86%99%E7%9A%84%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0">前面写的一篇文章</h1>

<p><a class="has-card" data-link-desc="文章浏览阅读988次，点赞19次，收藏14次。这边由于操作比较多，整合了许多大佬的教程以及自行的摸索，流程会长一些，可能对于一些程序的错误以及bug可能会忘记提及，不过我印象比较深亦或者是网上几乎找不到答案的bug和错误都会提及。"  data-link-title="编译一个基于debian/ubuntu,centos,arhlinux第三方系统-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/137979943?spm=1001.2014.3001.5501" title="编译一个基于debian/ubuntu,centos,arhlinux第三方系统-CSDN博客"><span class="link-card-box"><span class="link-title">编译一个基于debian/ubuntu,centos,arhlinux第三方系统-CSDN博客</span><span class="link-desc">文章浏览阅读988次，点赞19次，收藏14次。这边由于操作比较多，整合了许多大佬的教程以及自行的摸索，流程会长一些，可能对于一些程序的错误以及bug可能会忘记提及，不过我印象比较深亦或者是网上几乎找不到答案的bug和错误都会提及。</span><span class="link-link"><img alt="" class="link-link-icon"  />https://blog.csdn.net/mumuemhaha/article/details/137979943?spm=1001.2014.3001.5501</span></span></a></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>我们可能做不到从零开始写一个Linux，或者说我们可以做到写一个十分简单的Linux系统但是后续的驱动，以及软件编译会遇到诸多的问题，此时我们可以基于debian，redhat等等系的linux系统去编写另外一个系统。</p>

<p>诸如Ubuntu（乌班图），centos，pve，都是基于上面的debian或者是redhat系进行编写而来，他们也在市场上或多或少取得了很大的成功以及名气</p>

<p>当然我们没必要做的像他这么好我们只需要复制一个最简单的debian系统，之后在它的基础上装上我们所需要的软件。并且把它打包为iso镜像即可。</p>

<p>在上一篇的文章中我们已经可以编写一个debian的系统并且把它打包为一个ISO的镜像，但是问题是在那个镜像中我们里面的Linux系统是全部加载到内存中的。</p>

<h1 id="isolinux%E5%BC%95%E5%AF%BC%E6%A8%A1%E5%BC%8F%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B">isolinux引导模式启动流程</h1>

<p>这里我要讲一讲在isolinux引导模式中linux的启动流程</p>

<ul><li>首先主机的主板启动，电脑会先加载系统主板的bios文件，读取硬盘或者是iso镜像文件</li>
	<li>主板bios从主板的硬盘或者是iso镜像中读取0磁道1扇区的 512 字节，把它加载到内存中的某一个位置，这就是硬盘或者是镜像的MBR</li>
	<li>那512字节所能存储和做到的事情很少，所以它一般不会去做什么事情，他的主要工作就是去磁盘（镜像）读取另一段代码，这里我们把这一段代码叫做bootloader，而真正加载系统的是bootloader</li>
	<li>在bootloader中会把内核中的代码加载到内存中，之后再加载根文件系统，因为再Linux中一切皆文件，文件系统都是要挂载到某个目录上的。</li>
	<li>注意，现在由于没有指定根目录文件，此时需要把iso镜像中的一个压缩包/镜像（这个需要自己创建）解压到内存中运行，也就是initramdisk（或 initramfs），这里的文件全部存储在你的内存中，本质是把你的内存当作硬盘来用，一但重启，<span style="color:#fe2c24;"><span style="background-color:#ffd900;">内存中的改动</span></span>不做保存。</li>
	<li>如果不需要安装系统——在initramdisk中系统根目录找到init文件，加载所需要的驱动：比如sata驱动，网卡驱动，显卡驱动......之后把根目录切换到硬盘目录中即可</li>
	<li>如果需要安装系统——在initramdisk中系统根目录找到init文件，加载所需要的驱动：比如sata驱动，网卡驱动，显卡驱动......以及后续的把另外一个iso镜像写入到硬盘之中。</li>
</ul><h1 id="%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81initramdisk%E6%93%8D%E4%BD%9C%E8%80%8C%E4%B8%8D%E7%9B%B4%E6%8E%A5%E5%8A%A0%E8%BD%BD%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F">为什么要initramdisk操作而不直接加载文件系统</h1>

<p>因为在内核中所拥有的驱动十分少，甚至没有nvme，sata驱动，如果直接启动会找不到硬盘或者是网卡...</p>

<p>而如果把所有驱动编入内核的话内核会十分的臃肿而且有一些硬件或者使用场景（比如嵌入式系统）根本用不上一些启动，而这些更大的内核会占用更多宝贵的存储空间，并且把一些驱动（诸如显卡驱动）写入内核会不方便驱动更新</p>

<p>这时候我们给出的办法是只需要在内核加载少量可以保证linux开机的驱动，之后后续在initramfs中加载驱动，你也可以自定义在initramfs中的脚本。</p>

<h1 id="%E7%BC%96%E5%86%99%E7%B3%BB%E7%BB%9F%E7%9A%84%E6%80%9D%E6%83%B3">编写系统的思想</h1>

<p>我想的步骤首先是利用initramfs加载一些必要的驱动，比如硬盘驱动和其他驱动之类的，之后把需要备份的系统给打包为iso镜像,然后在initramfs执行写入到硬盘之中。</p>

<h2 id="%E5%8F%AF%E8%83%BD%E9%97%AE%E9%A2%98">可能问题</h2>

<h3 id="%E4%B8%80%E8%88%AC%E7%9A%84iso%E9%95%9C%E5%83%8F%E7%9B%AE%E5%89%8D%E5%8F%AA%E6%94%AF%E6%8C%81%E6%9C%80%E5%A4%A74G%E7%9A%84%E5%A4%A7%E5%B0%8F%EF%BC%8C%E9%9C%80%E8%A6%81%E6%80%8E%E4%B9%88%E8%A7%A3%E5%86%B3%EF%BC%9F">一般的iso镜像目前只支持最大4G的大小，需要怎么解决？</h3>

<p>只需要在initramfs中加载网络驱动，然后编写一个脚本运行，在网络上下载所需要的文件即可。</p>

<h3 id="%E5%A6%82%E4%BD%95%E5%8E%BB%E6%89%BE%E9%A9%B1%E5%8A%A8">如何去找驱动</h3>

<p>可以把最小化的debian，centos或者redhat系统作为initramfs，之后安装一些你想要的驱动然后打包为third.img作为initramfs</p>

<h1 id="%E6%9C%A8%E6%9C%A8em%E5%93%88%E5%93%88%E6%83%B3%E8%AF%B4%E7%9A%84%E8%AF%9D%EF%BC%88%E4%B8%8E%E6%9C%AC%E5%8D%9A%E6%96%87%E6%97%A0%E5%85%89%EF%BC%89">木木em哈哈想说的话（与本博文无光）</h1>

<p>博主马上大四了，现在准备考研，csdn目前暂时随缘更新，偶尔回答一些问题。半年之后搞毕设看看能不能搞个好玩的东西（滑稽.jpg）</p>
