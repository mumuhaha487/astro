---
title: 编译一个基于debian/ubuntu,centos,arhlinux第三方系统
published: 2024-04-20
tags: [debian,ubuntu,centos]
category: pve
image: /image/d8262339afae2c982ba795e645371205.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C-toc" style="margin-left:0px;"><a href="#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C">准备工作</a></p>

<p id="%E4%B8%8B%E8%BD%BDlinux%E6%BA%90%E7%A0%81%E8%BF%9B%E8%A1%8C%E7%BC%96%E8%AF%91-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E8%BD%BDlinux%E6%BA%90%E7%A0%81%E8%BF%9B%E8%A1%8C%E7%BC%96%E8%AF%91">下载linux源码进行编译</a></p>

<p id="linux%E6%BA%90%E7%A0%81%E4%B8%8B%E8%BD%BD-toc" style="margin-left:40px;"><a href="#linux%E6%BA%90%E7%A0%81%E4%B8%8B%E8%BD%BD">linux源码下载</a></p>

<p id="%E7%BD%91%E7%AB%99-toc" style="margin-left:80px;"><a href="#%E7%BD%91%E7%AB%99">网站</a></p>

<p id="%E9%97%AE%E9%A2%98-toc" style="margin-left:80px;"><a href="#%E9%97%AE%E9%A2%98">问题</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:80px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E7%BC%96%E8%AF%91-toc" style="margin-left:40px;"><a href="#%E7%BC%96%E8%AF%91">编译</a></p>

<p id="%E5%8F%AF%E8%83%BD%E4%BC%9A%E9%81%87%E5%88%B0%E7%9A%84%E9%97%AE%E9%A2%98-toc" style="margin-left:80px;"><a href="#%E5%8F%AF%E8%83%BD%E4%BC%9A%E9%81%87%E5%88%B0%E7%9A%84%E9%97%AE%E9%A2%98">可能会遇到的问题</a></p>

<p id="chroot%E4%B8%8B%E8%BD%BDdebian%E7%8E%AF%E5%A2%83-toc" style="margin-left:0px;"><a href="#chroot%E4%B8%8B%E8%BD%BDdebian%E7%8E%AF%E5%A2%83">chroot下载debian环境</a></p>

<p id="%E8%BF%9B%E5%85%A5%E8%99%9A%E6%8B%9F%E7%8E%AF%E5%A2%83-toc" style="margin-left:0px;"><a href="#%E8%BF%9B%E5%85%A5%E8%99%9A%E6%8B%9F%E7%8E%AF%E5%A2%83">进入虚拟环境</a></p>

<p id="%E6%8A%8Achroot%E7%9A%84%E6%A0%B9%E7%9B%AE%E5%BD%95%E6%96%87%E4%BB%B6%E6%89%93%E5%8C%85%E4%B8%BA.gz%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E6%8A%8Achroot%E7%9A%84%E6%A0%B9%E7%9B%AE%E5%BD%95%E6%96%87%E4%BB%B6%E6%89%93%E5%8C%85%E4%B8%BA.gz%E6%96%87%E4%BB%B6">把chroot的根目录文件打包为.gz文件</a></p>

<p id="%E7%BC%96%E8%AF%91init%E6%96%87%E4%BB%B6%EF%BC%88%E7%94%A8%E4%BA%8E%E7%B3%BB%E7%BB%9F%E5%90%AF%E5%8A%A8%E6%97%B6%E7%9A%84%E4%B8%80%E7%B3%BB%E5%88%97%E5%BC%95%E5%AF%BC%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E7%BC%96%E8%AF%91init%E6%96%87%E4%BB%B6%EF%BC%88%E7%94%A8%E4%BA%8E%E7%B3%BB%E7%BB%9F%E5%90%AF%E5%8A%A8%E6%97%B6%E7%9A%84%E4%B8%80%E7%B3%BB%E5%88%97%E5%BC%95%E5%AF%BC%EF%BC%89">编译init文件（用于系统启动时的一系列引导）</a></p>

<p id="%E7%BB%99%E4%BA%88%E6%96%87%E4%BB%B6%E5%A4%B9%E6%9D%83%E9%99%90-toc" style="margin-left:0px;"><a href="#%E7%BB%99%E4%BA%88%E6%96%87%E4%BB%B6%E5%A4%B9%E6%9D%83%E9%99%90">给予文件夹权限</a></p>

<p id="%E5%88%9B%E5%BB%BAbios%E5%BC%95%E5%AF%BC-toc" style="margin-left:0px;"><a href="#%E5%88%9B%E5%BB%BAbios%E5%BC%95%E5%AF%BC">创建bios引导</a></p>

<p id="%E4%B8%8B%E8%BD%BDsyslinux%E8%A7%A3%E5%8E%8B-toc" style="margin-left:40px;"><a href="#%E4%B8%8B%E8%BD%BDsyslinux%E8%A7%A3%E5%8E%8B">下载syslinux解压</a></p>

<p id="%E5%88%9B%E5%BB%BAiso%E6%96%87%E4%BB%B6%E5%A4%B9%E6%96%B9%E4%BE%BF%E7%AE%A1%E7%90%86-toc" style="margin-left:40px;"><a href="#%E5%88%9B%E5%BB%BAiso%E6%96%87%E4%BB%B6%E5%A4%B9%E6%96%B9%E4%BE%BF%E7%AE%A1%E7%90%86">创建iso文件夹方便管理</a></p>

<p id="%E6%8A%8A%E4%B8%80%E7%B3%BB%E5%88%97%E6%96%87%E4%BB%B6%E5%A4%8D%E5%88%B6%E5%88%B0%E5%85%B6%E4%B8%AD-toc" style="margin-left:40px;"><a href="#%E6%8A%8A%E4%B8%80%E7%B3%BB%E5%88%97%E6%96%87%E4%BB%B6%E5%A4%8D%E5%88%B6%E5%88%B0%E5%85%B6%E4%B8%AD">把一系列文件复制到其中</a></p>

<p id="%E7%BC%96%E8%BE%91%E5%BC%95%E5%AF%BC%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E7%BC%96%E8%BE%91%E5%BC%95%E5%AF%BC%E6%96%87%E4%BB%B6">编辑引导文件</a></p>

<p id="%E7%94%9F%E6%88%90%E9%95%9C%E5%83%8F-toc" style="margin-left:0px;"><a href="#%E7%94%9F%E6%88%90%E9%95%9C%E5%83%8F">生成镜像</a></p>

<p id="%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:0px;"><a href="#%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">一些问题以及解决办法</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>这边由于操作比较多，整合了许多大佬的教程以及自行的摸索，流程会长一些，可能对于一些程序的错误以及bug可能会忘记提及，不过我印象比较深亦或者是网上几乎找不到答案的bug和错误都会提及</p>

<h1 id="%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C">准备工作</h1>

<ul><li>一台装有linux的电脑或者虚拟机用于编译（博主的环境是ubuntu23.10）debian系的都也可以（理论上其他系的也可以，但是部分安装软件的命令要做改变，这边不多做阐述）。</li>
	<li>一台装有VMware的虚拟机用于验证安装镜像（或者其他装有可以进行虚拟化软件/系统(pve,exsi...)都行</li>
	<li>一个善于发现问题解决问题的心（</li>
</ul><h1 id="%E4%B8%8B%E8%BD%BDlinux%E6%BA%90%E7%A0%81%E8%BF%9B%E8%A1%8C%E7%BC%96%E8%AF%91">下载linux源码进行编译</h1>

<h2 id="linux%E6%BA%90%E7%A0%81%E4%B8%8B%E8%BD%BD">linux源码下载</h2>

<h3 id="%E7%BD%91%E7%AB%99">网站</h3>

<p><a class="has-card" data-link-icon="/image/003a2ce7eb50c2e24a8c624c260c5930.png" data-link-title="The Linux Kernel Archives" href="https://kernel.org/" title="The Linux Kernel Archives"><span class="link-card-box"><span class="link-title">The Linux Kernel Archives</span><span class="link-link"><img class="link-link-icon" src="/image/003a2ce7eb50c2e24a8c624c260c5930.png" alt="icon-default.png?t=N7T8" />https://kernel.org/</span></span></a></p>

<h3 id="%E9%97%AE%E9%A2%98">问题</h3>

<p>由于部分版本的linux内核编译的有些设置冲突会出错，非常难以调整。</p>

<h3 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h3>

<p>这边我试了几个版本的内核，最终确定为6.6.17</p>

<p>官网可能会没有这边给出123云盘链接</p>

<p><a class="has-card" data-link-desc="123云盘为您提供linux-6.6.17.tar.xz最新版正式版官方版绿色版下载,linux-6.6.17.tar.xz安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装" data-link-icon="/image/003a2ce7eb50c2e24a8c624c260c5930.png" data-link-title="linux-6.6.17.tar.xz官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘" href="https://www.123pan.com/s/HrkuVv-X9FX.html" title="linux-6.6.17.tar.xz官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘"><span class="link-card-box"><span class="link-title">linux-6.6.17.tar.xz官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘</span><span class="link-desc">123云盘为您提供linux-6.6.17.tar.xz最新版正式版官方版绿色版下载,linux-6.6.17.tar.xz安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装</span><span class="link-link"><img class="link-link-icon" src="/image/003a2ce7eb50c2e24a8c624c260c5930.png" alt="icon-default.png?t=N7T8" />https://www.123pan.com/s/HrkuVv-X9FX.html</span></span></a></p>

<h2 id="%E7%BC%96%E8%AF%91">编译</h2>

<p>更新软件源</p>

<pre>
<code>apt update</code></pre>

<pre>
<code class="language-bash">apt install -y make 
apt install -y make-guile
apt install -y gcc
apt install -y flex
apt install -y bison
apt install -y libelf-dev
apt install -y openssl
apt install -y libncurses-dev
apt install -y libssl-dev</code></pre>

<p>(灵性一点，其他诸如红帽系的linux改一下安装命令后面不多讲了）</p>

<p>把下载好的源码通过xftp传到linux中（我这边的目录为/mnt，之后解压好），并且修改名称方便管理</p>

<pre>
<code class="language-bash">tar -xvf linux-6.6.17.tar.xz
mv linux-6.6.17 linux_kenel</code></pre>

<p>接下来进入文件夹然后编译</p>

<pre>
<code class="language-bash">mv linux_kenel
make defconfig    #使用默认配置
make bzImage -j 4    #使用4个核心编译（没有这么多减几个，核心够加几个），并且编译为bzImage格式</code></pre>

<blockquote>
<p>bzImage 是 Linux 内核的一种格式，它是压缩过的内核镜像，包含了启动时所需的所有代码和数据。</p>
</blockquote>

<p>最后执行好后内核在<span style="background-color:#ffd900;">/mnt/linux_kenel/arch/x86/boot</span>目录下的bzImage也就是相对路径的<span style="background-color:#ffd900;">./arch/x86/boot</span></p>

<h3 id="%E5%8F%AF%E8%83%BD%E4%BC%9A%E9%81%87%E5%88%B0%E7%9A%84%E9%97%AE%E9%A2%98">可能会遇到的问题</h3>

<p>可能会有一些文件缺失，不过百度一下错误都会有，就是打几遍apt命令就是了</p>

<h1 id="chroot%E4%B8%8B%E8%BD%BDdebian%E7%8E%AF%E5%A2%83">chroot下载debian环境</h1>

<p>放回mnt目录下</p>

<p>输入以下命令</p>

<pre>
<code class="language-bash">apt install debootstrap
mkdir debian
debootstrap stable ./debian http://deb.debian.org/debian</code></pre>

<p>这里面要等的久一些</p>

<p>安装好后进入mnt下的debian目录如下</p>

<p><img alt="" height="722" src="/image/0bc2b05357e46cca887a263d1c60830c.png" width="984" /></p>

<p> 像啊！很像我们debian目录下的文件（其实就是）</p>

<h1 id="%E8%BF%9B%E5%85%A5%E8%99%9A%E6%8B%9F%E7%8E%AF%E5%A2%83">进入虚拟环境</h1>

<p>接下里进入这个chroot虚拟环境</p>

<pre>
<code class="language-bash">chroot /mnt/debian</code></pre>

<p>可以看到我们以及借用chroot虚拟出来了一个debian环境（主要是获取其中的环境以及文件）</p>

<p><img alt="" height="722" src="/image/3913de377ca583648686f288535a8c58.png" width="984" /></p>

<p>接下来就是要安装其他的软件或者是桌面环境了，这里和其他的网上教程一样，不多做赘述。</p>

<p>建议新建立一个用户</p>

<pre>
<code class="language-bash">useradd 用户名</code></pre>

<p>之后设定密码之类的就不多说了 </p>

<p>然后退出虚拟环境</p>

<pre>
<code class="language-bash">exit</code></pre>

<h2 id="%E6%8A%8Achroot%E7%9A%84%E6%A0%B9%E7%9B%AE%E5%BD%95%E6%96%87%E4%BB%B6%E6%89%93%E5%8C%85%E4%B8%BA.gz%E6%96%87%E4%BB%B6">把chroot的根目录文件打包为.gz文件</h2>

<p>在mnt文件夹中新建一个文件夹rootfs,并且进入</p>

<pre>
<code class="language-bash">mkdir /mnt/rootfs
cd /mnt/rootfs</code></pre>

<p>把chroot根目录下所有文件拷贝到rootfs中</p>

<pre>
<code class="language-bash">cp -r ../chroot-debian/* ./
</code></pre>

<h1 id="%E7%BC%96%E8%AF%91init%E6%96%87%E4%BB%B6%EF%BC%88%E7%94%A8%E4%BA%8E%E7%B3%BB%E7%BB%9F%E5%90%AF%E5%8A%A8%E6%97%B6%E7%9A%84%E4%B8%80%E7%B3%BB%E5%88%97%E5%BC%95%E5%AF%BC%EF%BC%89">编译init文件（用于系统启动时的一系列引导）</h1>

<pre>
<code class="language-bash">nano /mnt/rootfs/init</code></pre>

<pre>
<code class="language-bash">#!/bin/sh
dmesg -n 1
mount -t devtmpfs none /dev
mount -t proc none /proc
mount -t sysfs none /sys
setsid cttyhack /bin/sh</code></pre>

<h1 id="%E7%BB%99%E4%BA%88%E6%96%87%E4%BB%B6%E5%A4%B9%E6%9D%83%E9%99%90">给予文件夹权限</h1>

<pre>
<code class="language-bash">cd ../
chmod 777 /mnt/rootfs</code></pre>

<p>将一个目录打包为一个压缩的root文件系统映像文件。</p>

<pre>
<code class="language-bash">cd /mnt/rootfs
find . | cpio -R root:root -H newc -o | gzip &gt; ../rootfs.gz</code></pre>

<h1 id="%E5%88%9B%E5%BB%BAbios%E5%BC%95%E5%AF%BC">创建bios引导</h1>

<h2 id="%E4%B8%8B%E8%BD%BDsyslinux%E8%A7%A3%E5%8E%8B">下载syslinux解压</h2>

<pre>
<code class="language-bash">wget https://mirrors.edge.kernel.org/pub/linux/utils/boot/syslinux/syslinux-6.03.tar.gz
gunzip syslinux-6.03.tar.gz
tar -xvf syslinux-6.03.tar</code></pre>

<h2 id="%E5%88%9B%E5%BB%BAiso%E6%96%87%E4%BB%B6%E5%A4%B9%E6%96%B9%E4%BE%BF%E7%AE%A1%E7%90%86">创建iso文件夹方便管理</h2>

<pre>
<code class="language-bash">mkdir isobios
cd isobios
</code></pre>

<h2 id="%E6%8A%8A%E4%B8%80%E7%B3%BB%E5%88%97%E6%96%87%E4%BB%B6%E5%A4%8D%E5%88%B6%E5%88%B0%E5%85%B6%E4%B8%AD">把一系列文件复制到其中</h2>

<pre>
<code class="language-bash">cp ../rootfs.gz .
cp ../linux_kenel/arch/x86/boot/bzImage kernel.gz
cp ../syslinux-6.03/bios/core/isolinux.bin .
cp ../syslinux-6.03/bios/com32/elflink/ldlinux/ldlinux.c32 .</code></pre>

<h2 id="%E7%BC%96%E8%BE%91%E5%BC%95%E5%AF%BC%E6%96%87%E4%BB%B6">编辑引导文件</h2>

<pre>
<code class="language-bash">nano isolinux.cfg</code></pre>

<p>编辑如下 </p>

<pre>
<code>default kernel.gz initrd=rootfs.gz</code></pre>

<h1 id="%E7%94%9F%E6%88%90%E9%95%9C%E5%83%8F">生成镜像</h1>

<pre>
<code>sudo apt install -y xorriso -y
xorriso -as mkisofs -o ../mybios.iso -b isolinux.bin -c boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table ./</code></pre>

<p> 在目录/mnt下有mybios.iso文件</p>

<p>用该镜像文件生成虚拟机</p>

<p>虚拟机截图（注意现在时不带安装界面的，需要可以写一个刻录脚本即可）</p>

<p><img alt="" height="1039" src="/image/71ea41283595ae5a2ba5feed17af2e1e.png" width="1200" /></p>

<h1 id="%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">一些问题以及解决办法</h1>

<p><a class="has-card" data-link-desc="这边由于操作比较多，整合了许多大佬的教程以及自行的摸索，流程会长一些，可能对于一些程序的错误以及bug可能会忘记提及，不过我印象比较深亦或者是网上几乎找不到答案的bug和错误都会提及。目录文件是/lib/modules/6.5.0-28-generic，把它复制到你文件的相应目录就可以找到相应的硬盘了。由于开机的信息跳的太快了，我用obs录屏+慢放找到时内存给的不够（写博客的时候视频给我删了，对不起），因为此系统是全部加载到内存之中的。需要你的iso镜像中拥有它，只需将他放入你打包镜像的工作目录即可。"  data-link-title="编译一个基于debian/ubuntu,centos,arhlinux第三方系统的问题解答-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/138040554?spm=1001.2014.3001.5502" title="编译一个基于debian/ubuntu,centos,arhlinux第三方系统的问题解答-CSDN博客"><span class="link-card-box"><span class="link-title">编译一个基于debian/ubuntu,centos,arhlinux第三方系统的问题解答-CSDN博客</span><span class="link-desc">这边由于操作比较多，整合了许多大佬的教程以及自行的摸索，流程会长一些，可能对于一些程序的错误以及bug可能会忘记提及，不过我印象比较深亦或者是网上几乎找不到答案的bug和错误都会提及。目录文件是/lib/modules/6.5.0-28-generic，把它复制到你文件的相应目录就可以找到相应的硬盘了。由于开机的信息跳的太快了，我用obs录屏+慢放找到时内存给的不够（写博客的时候视频给我删了，对不起），因为此系统是全部加载到内存之中的。需要你的iso镜像中拥有它，只需将他放入你打包镜像的工作目录即可。</span><span class="link-link"><img alt="" class="link-link-icon" />https://blog.csdn.net/mumuemhaha/article/details/138040554?spm=1001.2014.3001.5502</span></span></a>正在归纳了一小部分会遇到的问题（看我遇到多少就写多少吧）</p>
