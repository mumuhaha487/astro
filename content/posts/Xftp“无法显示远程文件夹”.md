---
title: Xftp“无法显示远程文件夹”
published: 2023-06-04
tags: [linux,运维,服务器]
category: 软件报错
image: /image/6c7997610515726a2895ae8c3a2187d9.png
---

<!--more-->

<h2></h2>

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:40px;"></p>

<p id="-toc" style="margin-left:40px;"></p>

<p id="%E9%97%AE%E9%A2%98-toc" style="margin-left:40px;"><a href="#%E9%97%AE%E9%A2%98">问题</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:40px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E6%97%A0%E5%85%B3%E7%9F%A5%E8%AF%86%E6%8F%90%E4%B8%80%E5%98%B4-toc" style="margin-left:40px;"><a href="#%E6%97%A0%E5%85%B3%E7%9F%A5%E8%AF%86%E6%8F%90%E4%B8%80%E5%98%B4">无关知识提一嘴</a></p>

<p id="-toc" style="margin-left:40px;"></p>

<hr id="hr-toc" /><p></p>

<h2></h2>

<h2 id="%E9%97%AE%E9%A2%98">问题</h2>

<p>如图打开xftp点开root文件夹或者是其他的一些目录准备传输文件时会出现，无法显示远程文件夹</p>

<p><img alt="" height="749" src="/image/6c7997610515726a2895ae8c3a2187d9.png" width="1200" /></p>

<p>这是因为xftp没有访问目录权限导致的</p>

<p><span style="color:#ff9900;">（csdn上一些的博主说是要改为被动模式，当时xftp默认就是开启的被动模式所以目前问题不在这里，至少我不是）</span></p>

<p></p>

<h2 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h2>

<p></p>

<p>那就在xftp上重新打开xshell，注意！！！必须是在xftp上重新打开</p>

<p> <img alt="" height="749" src="/image/6c44b19911517a56e28396033381da0c.png" width="1200" /></p>

<p></p>

<p>然后在新的xshell中进入管理员模式</p>

<pre>
<code>sudo -i</code></pre>

<p><img alt="" height="720" src="/image/0bc260cf457d3d5f799b10cf2651a509.png" width="984" /></p>

<p>给予目录权限的命令</p>

<p>比如我要xftp访问/root文件夹就输入</p>

<pre>
<code class="language-bash">chmod 777 /root</code></pre>

<p></p>

<p> 后面的/root文件夹可以改为你要访问文件的绝对路径</p>

<p></p>

<h2 id="%E6%97%A0%E5%85%B3%E7%9F%A5%E8%AF%86%E6%8F%90%E4%B8%80%E5%98%B4">无关知识提一嘴</h2>

<h2></h2>

<p></p>

<p>要注意的是普通模式默认进入的是/home/你的主机名称</p>

<p>root模式下目录是"/root"，不是“/”根目录</p>
