---
title: 【分享】linux下安装sunshine串流配置进行远程办公
published: 2024-04-15
tags: [linux,运维,服务器]
category: 宝塔
---

<!--more-->

<p><span style="color:#fe2c24;"><strong>前排提示教程内容比较短，废话比较多，需要看教程的建议直接跳目录</strong></span></p>

<p></p>

<p id="main-toc"><strong>目录</strong></p>

<p id="%E5%89%8D%E8%A8%80%EF%BC%88%E5%8E%9F%E5%9B%A0%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80%EF%BC%88%E5%8E%9F%E5%9B%A0%EF%BC%89">前言（原因）</a></p>

<p id="%E9%80%89%E6%8B%A9%E8%BF%9C%E7%A8%8B%E8%BF%9E%E6%8E%A5%E8%BD%AF%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E9%80%89%E6%8B%A9%E8%BF%9C%E7%A8%8B%E8%BF%9E%E6%8E%A5%E8%BD%AF%E4%BB%B6">选择远程连接软件</a></p>

<p id="%E4%B8%89%E7%A7%8D%E8%BF%9E%E6%8E%A5%E8%BD%AF%E4%BB%B6%E7%9A%84%E4%BC%98%E5%8A%A3%E4%BB%A5%E5%8F%8A%E4%BD%93%E9%AA%8C-toc" style="margin-left:40px;"><a href="#%E4%B8%89%E7%A7%8D%E8%BF%9E%E6%8E%A5%E8%BD%AF%E4%BB%B6%E7%9A%84%E4%BC%98%E5%8A%A3%E4%BB%A5%E5%8F%8A%E4%BD%93%E9%AA%8C">三种连接软件的优劣以及体验</a></p>

<p id="sunshine%E6%94%AF%E6%8C%81%E6%98%BE%E5%8D%A1-toc" style="margin-left:0px;"><a href="#sunshine%E6%94%AF%E6%8C%81%E6%98%BE%E5%8D%A1">sunshine支持显卡</a></p>

<p id="%E6%95%99%E7%A8%8B-toc" style="margin-left:0px;"><a href="#%E6%95%99%E7%A8%8B">教程</a></p>

<p id="%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9">注意事项</a></p>

<p id="%E6%98%BE%E7%A4%BA%E5%99%A8-toc" style="margin-left:40px;"><a href="#%E6%98%BE%E7%A4%BA%E5%99%A8">显示器</a></p>

<p id="%E5%A6%82%E6%9E%9C%E4%B8%BA%E8%BF%9C%E7%A8%8B%E9%83%A8%E7%BD%B2-toc" style="margin-left:40px;"><a href="#%E5%A6%82%E6%9E%9C%E4%B8%BA%E8%BF%9C%E7%A8%8B%E9%83%A8%E7%BD%B2">如果为远程部署</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E8%A8%80%EF%BC%88%E5%8E%9F%E5%9B%A0%EF%BC%89">前言（原因）</h1>

<p>由于新买了一块平板，作为一个  <s>大号手机/泡面搭档</s>  小号电脑，当然可以用它来做很多事情，作为一个经常玩linux的，首先想到的是可不可以用我的平板来远程操控我的Ubuntu系统，这样可以用它来远程编写代码或者是远程编译一些linux特有的软件环境。</p>

<p>其实之前使用termux来跑proot/chroot容器，实现本地运行linux系统，这里推荐一下酷安里目前有两位大佬做了一键安装包（名字分别是：小小电脑，安卓/鸿蒙补完计划）。这两个项目都是搭建好了环境可以实现在手机上运行vscode/wps/qq/微信......。</p>

<p>但是我自己有我的服务器，仅仅凭借手机的性能编写一些简单的代码或者是做做ppt还可以流畅运行，但是一旦要运行一些复杂的项目亦或者是搭建一些不兼容arm处理器的环境，就会各种出错。</p>

<p>目前对于我来讲最大的作用的就可以编写一些简单的c或者是python代码了。</p>

<h1 id="%E9%80%89%E6%8B%A9%E8%BF%9C%E7%A8%8B%E8%BF%9E%E6%8E%A5%E8%BD%AF%E4%BB%B6">选择远程连接软件</h1>

<p>既然要用我这一台小服务器跑Linux并远程连接，那么选择相应的远程连接软件就尤为重要。</p>

<p>我当时我想到的有三个连接软件（vnc，rdp，moonlight/sunshine）</p>

<p>他们分别具有以下特点</p>

<blockquote>
<ol><li>
	<p>VNC连接（Virtual Network Computing）： VNC是一种基于图形化界面的远程桌面协议，它允许用户通过网络远程控制另一台计算机。VNC连接的工作原理是将远程计算机的屏幕图像传输到本地计算机，并将本地计算机的输入传输到远程计算机。VNC连接的优点是跨平台支持广泛，可以在不同操作系统之间进行远程控制。然而，VNC连接的缺点是传输速度较慢，对网络带宽要求较高。</p>
	</li>
	<li>
	<p>RDP连接（Remote Desktop Protocol）： RDP是一种由微软开发的远程桌面协议，用于在Windows操作系统上进行远程控制。RDP连接通过将远程计算机的桌面图像传输到本地计算机，并将本地计算机的输入传输到远程计算机来实现。RDP连接的优点是在Windows系统上具有较好的性能和稳定性，支持远程音频和打印功能。然而，RDP连接只适用于Windows系统之间的远程控制。</p>
	</li>
	<li>
	<p>Moonlight串流： Moonlight是一种开源的游戏串流技术，它允许用户通过网络将游戏从主机设备（如PC或游戏主机）流式传输到其他设备上进行游玩。Moonlight串流的优点是可以在不同平台上进行游戏串流，如将PC游戏流式传输到移动设备上进行游玩。然而，Moonlight串流对网络带宽和延迟要求较高，对游戏的图形质量和性能也有一定的影响。</p>
	</li>
</ol></blockquote>

<h2 id="%E4%B8%89%E7%A7%8D%E8%BF%9E%E6%8E%A5%E8%BD%AF%E4%BB%B6%E7%9A%84%E4%BC%98%E5%8A%A3%E4%BB%A5%E5%8F%8A%E4%BD%93%E9%AA%8C">三种连接软件的优劣以及体验</h2>

<p>实际测试下来vnc在局域网连接效果非常好，并且不会出现图像bug，但是由于是传输的是解码后的图像，一旦离开局域网网速的劣势就体香了出来，利用公网ip进行连接时候，画面传输就会明显卡顿。</p>

<p>rdp得益于传输的是解码前的数据流，图像的解码交给客户端来操作，大小对比与图像会小很多，对于带宽的要求比较低，方式传输方式在局域网和公网都表现得到还不错。但是只是在windows端表现的很好，在Linux安装时，Windows电脑可以正常连接，但是平板连接会出现花屏，可能时兼容性问题。</p>

<p>moonlight串流与rdp有一点点类似，并且得益于开源，在兼容性以及流畅度方面都做得相当不错。不过试了试在Windows下连接延迟比较大，在平板上并不会出现这个问题。</p>

<p>经过权衡利弊后我选择了sunshine串流</p>

<h1 id="sunshine%E6%94%AF%E6%8C%81%E6%98%BE%E5%8D%A1">sunshine支持显卡</h1>

<p>得益于开源，sunshine的显卡支持非常好，从a卡，n卡，再到核显都可以完美运行。（不过i卡没有博主不知道行不行）</p>

<h1 id="%E6%95%99%E7%A8%8B">教程</h1>

<p>在官方网站下下载相应型号的sunshine</p>

<p><a class="has-card" data-link-desc="Self-hosted game stream host for Moonlight. Contribute to LizardByte/Sunshine development by creating an account on GitHub." data-link-title="Releases · LizardByte/Sunshine · GitHub" href="https://github.com/LizardByte/Sunshine/releases" title="Releases · LizardByte/Sunshine · GitHub"><span class="link-card-box"><span class="link-title">Releases · LizardByte/Sunshine · GitHub</span><span class="link-desc">Self-hosted game stream host for Moonlight. Contribute to LizardByte/Sunshine development by creating an account on GitHub.</span><span class="link-link"><img class="link-link-icon" alt="icon-default.png?t=N7T8" />https://github.com/LizardByte/Sunshine/releases</span></span></a>下载好后直接安装即可</p>

<pre>
<code class="language-bash">dpkg -i 包名.deb</code></pre>

<p>安装好后会出现依赖缺失</p>

<p>问题不大</p>

<p>运行一遍修复命令即可</p>

<pre>
<code class="language-bash">sudo apt-get install -f</code></pre>

<p>运行好后直接运行sunshine命令打开</p>

<pre>
<code class="language-bash">sunshine</code></pre>

<p>此时进入其显示出来的地址 https://localhost:47990</p>

<h1 id="%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9">注意事项</h1>

<h2 id="%E6%98%BE%E7%A4%BA%E5%99%A8">显示器</h2>

<p>此时注意显示器不能关，否则就会连接不上，并且强烈建议买一个5块钱的显卡欺骗器。否则就需要虚拟一块虚拟屏幕才可以连接。同时注意修改息屏时间为从不。</p>

<p><img alt="" height="671" src="/image/bbbc6b92a8514c4ee8615f47c8bbd4c9.png" width="1050" /></p>

<p>这时候我的sunshine的地址是<a  data-link-title="https://localhost:47990" href="https://localhost:47990" title="https://localhost:47990">https://localhost:47990</a>，</p>

<h2 id="%E5%A6%82%E6%9E%9C%E4%B8%BA%E8%BF%9C%E7%A8%8B%E9%83%A8%E7%BD%B2">如果为远程部署</h2>

<p>注意，如果用非本机连接ip地址是连接不上去的，需要先关闭sunshine文件，然后修改Ubuntu的hosts文件</p>

<pre>
<code class="language-bash">nano /etc/hosts</code></pre>

<p>把localhost的值改为0.0.0.0</p>

<p>之后再次打开sunshine。</p>

<p>此时打开Ubuntu的ip后面跟上端口，这边是47990。</p>

<p>进去后设置密码以及用户名。</p>

<p>同时连接输入pin码就行了。</p>

<p>配置连接好后为了电脑安全，需要再次进入hosts文件把localhosts文件改回来</p>

<pre>
<code class="language-bash">nano /etc/hosts</code></pre>

<p>把localhost的值改为127.0.0.1即可</p>
