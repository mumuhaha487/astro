---
title: PVE（Proxmox）8.0的一些问题汇总（持续更新中
published: 2023-10-18
tags: [linux,运维,服务器,pve]
category: pve
image: /image/3ad487dfdcf5a6a7066643281239a1ea.png
---

<!--more-->

<p id="main-toc" name="tableOfContents"><strong>目录</strong></p>

<p id="%E5%89%8D%E8%A8%80-toc" name="tableOfContents" style="margin-left:0px"><a href="#%E5%89%8D%E8%A8%80" target="_self">前言</a></p>

<p id="%E6%9D%82%E8%B0%88-toc" name="tableOfContents" style="margin-left:0px"><a href="#%E6%9D%82%E8%B0%88" target="_self">杂谈</a></p>

<p id="pvetools%E6%98%AF%E4%B8%AA%E5%A5%BD%E4%B8%9C%E8%A5%BF-toc" name="tableOfContents" style="margin-left:40px"><a href="#pvetools%E6%98%AF%E4%B8%AA%E5%A5%BD%E4%B8%9C%E8%A5%BF" target="_self">pvetools是个好东西</a></p>

<p id="pve%E5%92%8Cesxi%E9%80%89%E5%95%A5-toc" name="tableOfContents" style="margin-left:40px"><a href="#pve%E5%92%8Cesxi%E9%80%89%E5%95%A5" target="_self">pve和esxi选啥</a></p>

<p id="%E5%8D%95pve%E7%B3%BB%E7%BB%9F%E9%97%AE%E9%A2%98%EF%BC%88%E8%BF%99%E4%B8%80%E7%B1%BB%E9%97%AE%E9%A2%98%E6%AF%94%E8%BE%83%E7%8E%84%E5%AD%A6%EF%BC%8C%E6%88%91%E8%87%AA%E5%B7%B1%E6%90%9E%E5%8F%AF%E4%BB%A5%EF%BC%8C%E4%BD%A0%E4%BB%AC%E8%AF%95%E4%B8%80%E8%AF%95%E7%9C%8B%EF%BC%8C%E4%B8%8D%E4%BF%9D%E8%AF%81%E8%A1%8C%EF%BC%89-toc" name="tableOfContents" style="margin-left:0px"><a href="#%E5%8D%95pve%E7%B3%BB%E7%BB%9F%E9%97%AE%E9%A2%98%EF%BC%88%E8%BF%99%E4%B8%80%E7%B1%BB%E9%97%AE%E9%A2%98%E6%AF%94%E8%BE%83%E7%8E%84%E5%AD%A6%EF%BC%8C%E6%88%91%E8%87%AA%E5%B7%B1%E6%90%9E%E5%8F%AF%E4%BB%A5%EF%BC%8C%E4%BD%A0%E4%BB%AC%E8%AF%95%E4%B8%80%E8%AF%95%E7%9C%8B%EF%BC%8C%E4%B8%8D%E4%BF%9D%E8%AF%81%E8%A1%8C%EF%BC%89" target="_self">单pve系统问题（这一类问题比较玄学，我自己搞可以，你们试一试看，不保证行）</a></p>

<p id="pve%E5%AE%89%E8%A3%85%E5%90%8E%E7%BD%91%E7%BB%9C%E8%BF%9E%E6%8E%A5%E4%B8%8D%E4%B8%8A-toc" name="tableOfContents" style="margin-left:40px"><a href="#pve%E5%AE%89%E8%A3%85%E5%90%8E%E7%BD%91%E7%BB%9C%E8%BF%9E%E6%8E%A5%E4%B8%8D%E4%B8%8A" target="_self">pve安装后网络连接不上</a></p>

<p id="%E7%BD%91%E5%8F%A3%E7%81%AF%E4%BA%AE-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E7%BD%91%E5%8F%A3%E7%81%AF%E4%BA%AE" target="_self">网口灯亮</a></p>

<p id="%E5%A6%82%E6%9E%9C%E7%BD%91%E5%8F%A3%E7%81%AF%E4%B8%8D%E4%BA%AE-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%A6%82%E6%9E%9C%E7%BD%91%E5%8F%A3%E7%81%AF%E4%B8%8D%E4%BA%AE" target="_self">如果网口灯不亮</a></p>

<p id="pve%E8%80%81%E6%98%AF%E6%AD%BB%E6%9C%BA%E5%8D%A1%E4%BD%8F-toc" name="tableOfContents" style="margin-left:40px"><a href="#pve%E8%80%81%E6%98%AF%E6%AD%BB%E6%9C%BA%E5%8D%A1%E4%BD%8F" target="_self">pve老是死机卡住</a></p>

<p id="%E7%9B%B4%E9%80%9A%E7%B1%BB-toc" name="tableOfContents" style="margin-left:0px"><a href="#%E7%9B%B4%E9%80%9A%E7%B1%BB" target="_self">直通类</a></p>

<p id="%E7%9B%B4%E9%80%9A%E5%BB%BA%E8%AE%AE-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E7%9B%B4%E9%80%9A%E5%BB%BA%E8%AE%AE" target="_self">直通建议</a></p>

<p id="%E6%98%BE%E5%8D%A1%E6%80%8E%E4%B9%88%E7%9B%B4%E9%80%9A-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%98%BE%E5%8D%A1%E6%80%8E%E4%B9%88%E7%9B%B4%E9%80%9A" target="_self">显卡怎么直通</a></p>

<p id="win10%E6%98%BE%E5%8D%A1%E6%8A%A5%E9%94%9943-toc" name="tableOfContents" style="margin-left:40px"><a href="#win10%E6%98%BE%E5%8D%A1%E6%8A%A5%E9%94%9943" target="_self">win10显卡报错43</a></p>

<p id="%E7%9B%B4%E9%80%9A%E5%90%8E%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F%E6%88%96%E8%80%85%E7%B3%BB%E7%BB%9F%E6%9C%89%E9%97%AE%E9%A2%98%E8%87%AA%E6%95%91-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E7%9B%B4%E9%80%9A%E5%90%8E%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F%E6%88%96%E8%80%85%E7%B3%BB%E7%BB%9F%E6%9C%89%E9%97%AE%E9%A2%98%E8%87%AA%E6%95%91" target="_self">直通后进不去系统或者系统有问题自救</a></p>

<p id="pci%E7%B1%BB-toc" name="tableOfContents" style="margin-left:0px"><a href="#pci%E7%B1%BB" target="_self">pci类</a></p>

<p id="%E6%8B%94%E4%BA%86%E6%98%BE%E5%8D%A1%E5%BC%80%E6%9C%BA%E4%BA%86%E4%BD%86%E6%98%AF%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%8B%94%E4%BA%86%E6%98%BE%E5%8D%A1%E5%BC%80%E6%9C%BA%E4%BA%86%E4%BD%86%E6%98%AF%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F" target="_self">拔了显卡开机了但是进不去系统</a></p>

<p id="%C2%A0%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%B1%BB-toc" name="tableOfContents" style="margin-left:0px"><a href="#%C2%A0%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%B1%BB" target="_self">&nbsp;虚拟机类</a></p>

<p id="%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%98%BE%E7%A4%BA%E9%97%AE%E5%8F%B7%EF%BC%8C%E8%80%8C%E4%B8%94%E5%88%9B%E5%BB%BA%E4%B8%8D%E4%BA%86%E6%96%B0%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BA-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%98%BE%E7%A4%BA%E9%97%AE%E5%8F%B7%EF%BC%8C%E8%80%8C%E4%B8%94%E5%88%9B%E5%BB%BA%E4%B8%8D%E4%BA%86%E6%96%B0%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BA" target="_self">虚拟机显示问号，而且创建不了新的虚拟机</a></p>

<p id="%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAikuai%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E-toc" name="tableOfContents" style="margin-left:40px"><a href="#%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAikuai%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E" target="_self">&nbsp;我想用pve的虚拟机ikuai来连接pve怎么搞</a></p>

<p id="%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAopenwrt%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E-toc" name="tableOfContents" style="margin-left:40px"><a href="#%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAopenwrt%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E" target="_self">&nbsp;我想用pve的虚拟机openwrt来连接pve怎么搞</a></p>

<p id="win10%2F11%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB%EF%BC%88%E5%B0%B1%E4%BD%A0%E4%BA%8B%E5%A4%9A-toc" name="tableOfContents" style="margin-left:40px"><a href="#win10%2F11%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB%EF%BC%88%E5%B0%B1%E4%BD%A0%E4%BA%8B%E5%A4%9A" target="_self">win10/11问题汇总（就你Windows的事多</a></p>

<p id="win11%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85-toc" name="tableOfContents" style="margin-left:80px"><a href="#win11%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85" target="_self">win11可不可以装</a></p>

<p id="%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85windows%20server-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85windows%20server" target="_self">可不可以装windows server</a></p>

<p id="win10%E6%9C%89%E6%97%B6%E6%80%A7%E8%83%BD%E4%BC%9A%E5%BE%88%E5%8D%A1-toc" name="tableOfContents" style="margin-left:80px"><a href="#win10%E6%9C%89%E6%97%B6%E6%80%A7%E8%83%BD%E4%BC%9A%E5%BE%88%E5%8D%A1" target="_self">win10有时性能会很卡</a></p>

<p id="win10%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86%E5%99%A8%E7%9A%84cpu%E6%98%BE%E7%A4%BA%E4%B8%80%E7%9B%B4%E5%9C%A8%E5%9F%BA%E5%87%86%E9%A2%91%E7%8E%87-toc" name="tableOfContents" style="margin-left:80px"><a href="#win10%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86%E5%99%A8%E7%9A%84cpu%E6%98%BE%E7%A4%BA%E4%B8%80%E7%9B%B4%E5%9C%A8%E5%9F%BA%E5%87%86%E9%A2%91%E7%8E%87" target="_self">win10任务管理器的cpu显示一直在基准频率</a></p>

<hr id="hr-toc" name="tableOfContents" />
<p></p>

<h1 id="%E5%89%8D%E8%A8%80" name="%E5%89%8D%E8%A8%80">前言</h1>

<p>pve折腾了快有大半年了，汇总一下我遇到的问题和解决办法（最后更新时间：2025-4-1）</p>

<h1 id="%E6%9D%82%E8%B0%88" name="%E6%9D%82%E8%B0%88">杂谈</h1>

<h2 id="pvetools%E6%98%AF%E4%B8%AA%E5%A5%BD%E4%B8%9C%E8%A5%BF" name="pvetools%E6%98%AF%E4%B8%AA%E5%A5%BD%E4%B8%9C%E8%A5%BF">pvetools是个好东西</h2>

<p>它是可以帮助你省小不少事情的脚本</p>

<p>官方网站</p>

<p><a class="has-card" data-link-desc="proxmox ve tools script(debian9+ can use it).Including email, samba, NFS set zfs max ram, nested virtualization ,docker , pci passthrough etc. for english user,please look the end of readme. - GitHub - ivanhao/pvetools: proxmox ve tools script(debian9+ can use it).Including email, samba, NFS set zfs max ram, nested virtualization ,docker , pci passthrough etc. for english user,please look the end of readme." data-link-icon="/image/003a2ce7eb50c2e24a8c624c260c5930.png" data-link-title="GitHub - ivanhao/pvetools: proxmox ve tools script(debian9+ can use it).Including email, samba, NFS set zfs max ram, nested virtualization ,docker , pci passthrough etc. for english user,please look the end of readme." href="https://github.com/ivanhao/pvetools" title="GitHub - ivanhao/pvetools: proxmox ve tools script(debian9+ can use it).Including email, samba, NFS set zfs max ram, nested virtualization ,docker , pci passthrough etc. for english user,please look the end of readme."><span class="link-card-box" contenteditable="false"><span class="link-title">GitHub - ivanhao/pvetools: proxmox ve tools script(debian9+ can use it).Including email, samba, NFS set zfs max ram, nested virtualization ,docker , pci passthrough etc. for english user,please look the end of readme.</span><span class="link-desc">proxmox ve tools script(debian9+ can use it).Including email, samba, NFS set zfs max ram, nested virtualization ,docker , pci passthrough etc. for english user,please look the end of readme. - GitHub - ivanhao/pvetools: proxmox ve tools script(debian9+ can use it).Including email, samba, NFS set zfs max ram, nested virtualization ,docker , pci passthrough etc. for english user,please look the end of readme.</span><span class="link-link"><img class="link-link-icon" src="https://csdnimg.cn/release/blog_editor_html/release2.3.8/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=P1C7" />https://github.com/ivanhao/pvetools</span></span></a>截图<img alt="" height="474" isbindedload="true" src="/image/3ad487dfdcf5a6a7066643281239a1ea.png" width="996" /></p>

<p>一键安装命令</p>

<pre>
<code class="language-bash">echo "nameserver  8.8.8.8" &gt;&gt; /etc/resolv.conf &amp;&amp; rm -rf pvetools &amp;&amp; rm -rf /etc/apt/sources.list.d/pve-enterprise.list &amp;&amp; export LC_ALL=en_US.UTF-8 &amp;&amp; apt update &amp;&amp; apt -y install git &amp;&amp; git clone https://github.com/ivanhao/pvetools.git &amp;&amp; echo "cd /root/pvetools &amp;&amp; ./pvetools.sh" &gt; pvetools/pvetools &amp;&amp; chmod +x pvetools/pvetools* &amp;&amp; ln -s /root/pvetools/pvetools /usr/local/bin/pvetools &amp;&amp; pvetools</code></pre>

<p>&nbsp;或者可以在github上下载好后传到pve中运行pvetools.sh文件</p>

<h2 id="pve%E5%92%8Cesxi%E9%80%89%E5%95%A5" name="pve%E5%92%8Cesxi%E9%80%89%E5%95%A5">pve和esxi选啥</h2>

<p>想选啥选啥，性能大差不差。</p>

<p>esxi使用起来界面更好看，什么都不懂的人上手比较快，但是对于硬件型号（尤其是网卡型号）有要求，如果是螃蟹网卡不行又想玩那就自己封装驱动，但是也只能到exsi6.9再高了官方就不支持没有教程了，自己搞几乎不可能了，如果实在想玩exsi8.0或者懒得折腾那就去咸鱼花70+搞一张flr331。</p>

<p>pve对硬件型号要求不高，基本都可以安装，由于pve底层是debian中的kvm，所以懂一些linux的后期拓展会非常得心应手</p>

<p>unraid不知道没用过，不评价！</p>

<h1 id="%E5%8D%95pve%E7%B3%BB%E7%BB%9F%E9%97%AE%E9%A2%98%EF%BC%88%E8%BF%99%E4%B8%80%E7%B1%BB%E9%97%AE%E9%A2%98%E6%AF%94%E8%BE%83%E7%8E%84%E5%AD%A6%EF%BC%8C%E6%88%91%E8%87%AA%E5%B7%B1%E6%90%9E%E5%8F%AF%E4%BB%A5%EF%BC%8C%E4%BD%A0%E4%BB%AC%E8%AF%95%E4%B8%80%E8%AF%95%E7%9C%8B%EF%BC%8C%E4%B8%8D%E4%BF%9D%E8%AF%81%E8%A1%8C%EF%BC%89" name="%E5%8D%95pve%E7%B3%BB%E7%BB%9F%E9%97%AE%E9%A2%98%EF%BC%88%E8%BF%99%E4%B8%80%E7%B1%BB%E9%97%AE%E9%A2%98%E6%AF%94%E8%BE%83%E7%8E%84%E5%AD%A6%EF%BC%8C%E6%88%91%E8%87%AA%E5%B7%B1%E6%90%9E%E5%8F%AF%E4%BB%A5%EF%BC%8C%E4%BD%A0%E4%BB%AC%E8%AF%95%E4%B8%80%E8%AF%95%E7%9C%8B%EF%BC%8C%E4%B8%8D%E4%BF%9D%E8%AF%81%E8%A1%8C%EF%BC%89">单pve系统问题（这一类问题比较玄学，我自己搞可以，你们试一试看，不保证行）</h1>

<h2 id="pve%E5%AE%89%E8%A3%85%E5%90%8E%E7%BD%91%E7%BB%9C%E8%BF%9E%E6%8E%A5%E4%B8%8D%E4%B8%8A" name="pve%E5%AE%89%E8%A3%85%E5%90%8E%E7%BD%91%E7%BB%9C%E8%BF%9E%E6%8E%A5%E4%B8%8D%E4%B8%8A">pve安装后网络连接不上</h2>

<p>玄学问题，首先看网口灯亮不亮</p>

<h3 id="%E7%BD%91%E5%8F%A3%E7%81%AF%E4%BA%AE" name="%E7%BD%91%E5%8F%A3%E7%81%AF%E4%BA%AE">网口灯亮</h3>

<p>如果亮的话调配置文件</p>

<pre>
<code class="language-bash">nano /etc/network/nano /etc/network/interfaces
</code></pre>

<p>把网卡中的<span style="color:#ffd900"><span style="background-color:#fe2c24">iface enpxxx inet manual</span></span>的manual改成 dhcp</p>

<h3 id="%E5%A6%82%E6%9E%9C%E7%BD%91%E5%8F%A3%E7%81%AF%E4%B8%8D%E4%BA%AE" name="%E5%A6%82%E6%9E%9C%E7%BD%91%E5%8F%A3%E7%81%AF%E4%B8%8D%E4%BA%AE">如果网口灯不亮</h3>

<p>这个问题特别玄学，我是因为pve安装不是选第一个图形化安装，而是第二个命令行安装；原因是分辨率太低了无法点到同意协议的按钮</p>

<p>解决办法重新安装pve并且选第一个图形化界面，在安装的时候如果同意协议的按钮在下面就利用tab键切换然后回车（后面的一些按钮也是这种方法）。</p>

<h2 id="pve%E8%80%81%E6%98%AF%E6%AD%BB%E6%9C%BA%E5%8D%A1%E4%BD%8F" name="pve%E8%80%81%E6%98%AF%E6%AD%BB%E6%9C%BA%E5%8D%A1%E4%BD%8F">pve老是死机卡住</h2>

<p>这个问题很玄学，非常玄学，提供一个可能可行的方法就是更新CPU微码（intel)</p>

<pre>
<code class="language-bash">apt install intel-microcode
reboot
</code></pre>

<h1 id="%E7%9B%B4%E9%80%9A%E7%B1%BB" name="%E7%9B%B4%E9%80%9A%E7%B1%BB">直通类</h1>

<h2 id="%E7%9B%B4%E9%80%9A%E5%BB%BA%E8%AE%AE" name="%E7%9B%B4%E9%80%9A%E5%BB%BA%E8%AE%AE">直通建议</h2>

<p>直通pci设备的虚拟机最好不要开机自启，这样就算出错重启就可以解决问题</p>

<h2 id="%E6%98%BE%E5%8D%A1%E6%80%8E%E4%B9%88%E7%9B%B4%E9%80%9A" name="%E6%98%BE%E5%8D%A1%E6%80%8E%E4%B9%88%E7%9B%B4%E9%80%9A">显卡怎么直通</h2>

<p>目前pve8.0以上直通很简单，不需要多设置</p>

<p>只需要打开</p>

<pre>
<code class="language-bash">nano /etc/default/grub
</code></pre>

<p>把这个</p>

<pre>
<code class="language-bash"> GRUB_CMDLINE_LINUX_DEFAULT="quiet"</code></pre>

<p>intel的cpu改为这个</p>

<pre>
<code class="language-bash">GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"</code></pre>

<p>amd改为这个</p>

<pre>
<code class="language-bash">GRUB_CMDLINE_LINUX_DEFAULT="quiet amd_iommu=on"</code></pre>

<p>之后打开这个</p>

<pre>
<code class="language-bash">nano /etc/modules</code></pre>

<p>添加</p>

<pre>
<code class="language-bash">vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
</code></pre>

<p>啪！没啦</p>

<p>其他的黑名单都不用设置</p>

<p>官方贴心的自动禁用了</p>

<h2 id="win10%E6%98%BE%E5%8D%A1%E6%8A%A5%E9%94%9943" name="win10%E6%98%BE%E5%8D%A1%E6%8A%A5%E9%94%9943">win10显卡报错43</h2>

<p>网上搜了一圈解决办法如果还不行打不上驱动的话，就只可能是显卡型号问题</p>

<p>首先n卡首当其冲，远古级显卡gt210之类的可以打上驱动，后面的部分gtx750ti后也行。</p>

<p>至于650或者650ti之类的就别折腾了，我都试过了。</p>

<p>A卡不知道，大部分A卡的驱动都好打，我换了RX570（听说HD68XX,RX5XX嘎嘎好打）一试就成了</p>

<h2 id="%E7%9B%B4%E9%80%9A%E5%90%8E%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F%E6%88%96%E8%80%85%E7%B3%BB%E7%BB%9F%E6%9C%89%E9%97%AE%E9%A2%98%E8%87%AA%E6%95%91" name="%E7%9B%B4%E9%80%9A%E5%90%8E%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F%E6%88%96%E8%80%85%E7%B3%BB%E7%BB%9F%E6%9C%89%E9%97%AE%E9%A2%98%E8%87%AA%E6%95%91">直通后进不去系统或者系统有问题自救</h2>

<p>原因可能是再没开启pve的直通的时候就把pci设备加进去，本来没什么事的，但是后面又配置了pve的直通，恰好设置了开机自启，导致系统挂了；注意要先配置pve的直通设置之后再添加pci设备；</p>

<p>解决办法：进bios把VT也就是cpu虚拟化关了这样所有的虚拟机都会停止，然后显示器连接进入pve把有问题的虚拟机的开机自启关了或者删了。</p>

<h1 id="pci%E7%B1%BB" name="pci%E7%B1%BB">pci类</h1>

<h2 id="%E6%8B%94%E4%BA%86%E6%98%BE%E5%8D%A1%E5%BC%80%E6%9C%BA%E4%BA%86%E4%BD%86%E6%98%AF%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F" name="%E6%8B%94%E4%BA%86%E6%98%BE%E5%8D%A1%E5%BC%80%E6%9C%BA%E4%BA%86%E4%BD%86%E6%98%AF%E8%BF%9B%E4%B8%8D%E5%8E%BB%E7%B3%BB%E7%BB%9F">拔了显卡开机了但是进不去系统</h2>

<p>有一种可能事pci设备名混乱</p>

<p>查看我之前写的一个博客</p>

<p><a class="has-card" data-link-desc="前几天装了个​Proxmox​ ve当做一个服务器7*24开机但是由于转好系统后，显卡就不需要了加上它耗电的原因（我的gtx650平时空载有10w左右的功耗）我在想拔显卡拔了，我用xshell进行ssh连接不就可以了然后我一拔，一开机，果然！连接不上后台和ssh看了一眼路由器，发现根本没他的网络地址。" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="debian/PVE安装好后拔显卡后连接不了网络（pve无显卡启动遇到的问题）_木木em哈哈的博客-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/131796920" title="debian/PVE安装好后拔显卡后连接不了网络（pve无显卡启动遇到的问题）_木木em哈哈的博客-CSDN博客"><span class="link-card-box" contenteditable="false"><span class="link-title">debian/PVE安装好后拔显卡后连接不了网络（pve无显卡启动遇到的问题）_木木em哈哈的博客-CSDN博客</span><span class="link-desc">前几天装了个​Proxmox​ ve当做一个服务器7*24开机但是由于转好系统后，显卡就不需要了加上它耗电的原因（我的gtx650平时空载有10w左右的功耗）我在想拔显卡拔了，我用xshell进行ssh连接不就可以了然后我一拔，一开机，果然！连接不上后台和ssh看了一眼路由器，发现根本没他的网络地址。</span><span class="link-link"><img class="link-link-icon" src="https://csdnimg.cn/release/blog_editor_html/release2.3.8/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=P1C7" />https://blog.csdn.net/mumuemhaha/article/details/131796920</span></span></a></p>

<h1 id="%C2%A0%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%B1%BB" name="%C2%A0%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%B1%BB">&nbsp;虚拟机类</h1>

<h2 id="%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%98%BE%E7%A4%BA%E9%97%AE%E5%8F%B7%EF%BC%8C%E8%80%8C%E4%B8%94%E5%88%9B%E5%BB%BA%E4%B8%8D%E4%BA%86%E6%96%B0%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BA" name="%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%98%BE%E7%A4%BA%E9%97%AE%E5%8F%B7%EF%BC%8C%E8%80%8C%E4%B8%94%E5%88%9B%E5%BB%BA%E4%B8%8D%E4%BA%86%E6%96%B0%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BA">虚拟机显示问号，而且创建不了新的虚拟机</h2>

<p>原因可能是之前设置硬盘休眠的时候把pvestatd关了，重新开启就可以了</p>

<pre>
<code>pvestatd start</code></pre>

<p>&nbsp;要整休眠的话不建议用这种方法</p>

<p>要休眠的话试试改个这个行不行</p>

<pre>
<code class="language-bash">nano /etc/lvm/lvm.conf</code></pre>

<p>在这个位置加use_lvmetad = 1</p>

<p><img alt="" height="479" isbindedload="true" src="/image/1a0c15018bc698acd6bae65d4862bf2d.png" width="1024" /></p>

<h2 id="%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAikuai%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E" name="%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAikuai%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E">&nbsp;我想用pve的虚拟机ikuai来连接pve怎么搞</h2>

<p>我之前写的</p>

<p><a class="has-card" data-link-desc="第一个是单拨（就是一个宽带账号拨号一次），第二个就是多拨（一个宽带账号或者是多个宽带账号拨多次，实现宽带叠加（叠加速率上限看光猫的网口速率/拨号成不成功看当地运营商支不支持多拨））之后安装ikuai就是正常的安装其他系统一样，安装过了不上图了（别跟我提这个你也不会操作，接下来安装系统也就两步——选择安装硬盘-&gt;yes）pve安装好后，如果你有不止一个网口,pve连接虚拟机ikuai的网络以及其他虚拟机连接ikuai的网络_pve添加网卡" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="pve安装ikuai并设置，同时把pve的网络连接到ikuai虚拟机_pve添加网卡_木木em哈哈的博客-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/131976028" title="pve安装ikuai并设置，同时把pve的网络连接到ikuai虚拟机_pve添加网卡_木木em哈哈的博客-CSDN博客"><span class="link-card-box" contenteditable="false"><span class="link-title">pve安装ikuai并设置，同时把pve的网络连接到ikuai虚拟机_pve添加网卡_木木em哈哈的博客-CSDN博客</span><span class="link-desc">第一个是单拨（就是一个宽带账号拨号一次），第二个就是多拨（一个宽带账号或者是多个宽带账号拨多次，实现宽带叠加（叠加速率上限看光猫的网口速率/拨号成不成功看当地运营商支不支持多拨））之后安装ikuai就是正常的安装其他系统一样，安装过了不上图了（别跟我提这个你也不会操作，接下来安装系统也就两步&mdash;&mdash;选择安装硬盘-&gt;yes）pve安装好后，如果你有不止一个网口,pve连接虚拟机ikuai的网络以及其他虚拟机连接ikuai的网络_pve添加网卡</span><span class="link-link"><img class="link-link-icon" src="https://csdnimg.cn/release/blog_editor_html/release2.3.8/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=P1C7" />https://blog.csdn.net/mumuemhaha/article/details/131976028</span></span></a>需要注意是配置好后pve虽然可以连接到，但是连接到网络的时间会用到1-6分钟不等。</p>

<blockquote>
<p><strong><span style="color:#ffd900">需要注意：ikuai如果做二层路由然后pve连接ikuai的话，有概率在上层路由器中连接不到pve（可能是获取到ikuai的ip而把上层路由器的ip忽略了【顺提一嘴】），如果ikuai的被上层路由禁ip会导致pve所有虚拟机断网。</span></strong></p>
</blockquote>

<h2 id="%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAopenwrt%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E" name="%C2%A0%E6%88%91%E6%83%B3%E7%94%A8pve%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BAopenwrt%E6%9D%A5%E8%BF%9E%E6%8E%A5pve%E6%80%8E%E4%B9%88%E6%90%9E">&nbsp;我想用pve的虚拟机openwrt来连接pve怎么搞</h2>

<p>如上一个一样，把分配给openwrt的虚拟网卡在pve中改成dhcp或者静态获取地址的模式</p>

<h2 id="win10%2F11%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB%EF%BC%88%E5%B0%B1%E4%BD%A0%E4%BA%8B%E5%A4%9A" name="win10%2F11%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB%EF%BC%88%E5%B0%B1%E4%BD%A0%E4%BA%8B%E5%A4%9A">win10/11问题汇总（就你Windows的事多</h2>

<h3 id="win11%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85" name="win11%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85">win11可不可以装</h3>

<p>要看你cpu支不支持，老的cpu（8代以前）无法通过正常途径安装安装，但是可以通过不正常途径安装，具体方法b站/csdn有。</p>

<h3 id="%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85windows%20server" name="%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%A3%85windows%20server">可不可以装windows server</h3>

<p>可以装上，但是如果要直通显卡的话有一些卡打不上官方显卡驱动（即使用一些很奇妙的方式强行打上了显卡也不工作），我的580不行[悲]，魔改驱动没人做。所以要直通显卡不建议用这个系统。</p>

<h3 id="win10%E6%9C%89%E6%97%B6%E6%80%A7%E8%83%BD%E4%BC%9A%E5%BE%88%E5%8D%A1" name="win10%E6%9C%89%E6%97%B6%E6%80%A7%E8%83%BD%E4%BC%9A%E5%BE%88%E5%8D%A1">win10有时性能会很卡</h3>

<p>打开电源管理然后开启win10的高性能模式。</p>

<p>调好了后还卡应该是win10一个特性（不便之处），不能长时间开机不关机，否则一定会越来越卡，最好半夜的时候重启一下虚拟机，windows server系统可能能解决，但是缺点在上一条。</p>

<h3 id="win10%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86%E5%99%A8%E7%9A%84cpu%E6%98%BE%E7%A4%BA%E4%B8%80%E7%9B%B4%E5%9C%A8%E5%9F%BA%E5%87%86%E9%A2%91%E7%8E%87" name="win10%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86%E5%99%A8%E7%9A%84cpu%E6%98%BE%E7%A4%BA%E4%B8%80%E7%9B%B4%E5%9C%A8%E5%9F%BA%E5%87%86%E9%A2%91%E7%8E%87">win10任务管理器的cpu显示一直在基准频率</h3>

<p>显示问题，实际cpu应该是睿频运行的，可以下载cpuz查看。</p>

<p></p>

<p></p>

<p>好了目前先到这，之后想到啥我会继续加，或者有啥问的我有时间也会回</p>

<p><img alt="" height="166" isbindedload="true" src="/image/450463f39713b9e844de7f6e21dcae6b.jpeg" width="166" /></p>
