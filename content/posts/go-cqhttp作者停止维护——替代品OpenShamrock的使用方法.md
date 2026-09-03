---
title: go-cqhttp作者停止维护——替代品OpenShamrock的使用方法
published: 2024-01-05
tags: [python,机器人,gpt,学习]
category: 杂谈
image: /image/003a2ce7eb50c2e24a8c624c260c5930.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:0px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E9%85%8D%E7%BD%AE%E8%A6%81%E6%B1%82-toc" style="margin-left:0px;"><a href="#%E9%85%8D%E7%BD%AE%E8%A6%81%E6%B1%82">配置要求</a></p>

<p id="%E5%AE%9E%E6%93%8D-toc" style="margin-left:0px;"><a href="#%E5%AE%9E%E6%93%8D">实操</a></p>

<p id="%E5%88%B7%E5%85%A5%E9%9D%A2%E5%85%B7-toc" style="margin-left:40px;"><a href="#%E5%88%B7%E5%85%A5%E9%9D%A2%E5%85%B7">刷入面具</a></p>

<p id="%E5%AE%89%E8%A3%85lsp%E6%A1%86%E6%9E%B6-toc" style="margin-left:40px;"><a href="#%E5%AE%89%E8%A3%85lsp%E6%A1%86%E6%9E%B6">安装lsp框架</a></p>

<p id="%E5%AE%89%E8%A3%85OpenShamrock%E5%92%8CQQ-toc" style="margin-left:40px;"><a href="#%E5%AE%89%E8%A3%85OpenShamrock%E5%92%8CQQ">安装OpenShamrock和QQ</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:80px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E5%A4%A7%E5%8A%9F%E5%91%8A%E6%88%90-toc" style="margin-left:0px;"><a href="#%E5%A4%A7%E5%8A%9F%E5%91%8A%E6%88%90">大功告成</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>由于QQ官方针对协议库的围追堵截，go-cqhttp已经无力维护下去了</p>

<p>原文连接</p>

<p><a class="has-card" data-link-icon="/image/003a2ce7eb50c2e24a8c624c260c5930.png" data-link-title="QQ Bot的未来以及迁移建议 · Issue #2471 · Mrs4s/go-cqhttp (github.com)" href="https://github.com/Mrs4s/go-cqhttp/issues/2471" title="QQ Bot的未来以及迁移建议 · Issue #2471 · Mrs4s/go-cqhttp (github.com)"><span class="link-card-box"><span class="link-title">QQ Bot的未来以及迁移建议 · Issue #2471 · Mrs4s/go-cqhttp (github.com)</span><span class="link-link"><img class="link-link-icon" src="/image/003a2ce7eb50c2e24a8c624c260c5930.png" alt="icon-default.png?t=N7T8" />https://github.com/Mrs4s/go-cqhttp/issues/2471</span></span></a>目前签名服务器挂了，也就只有手表协议勉强可以跑，但是手表协议只要一天发了20多条消息就会风控发不了消息，这显然不能满足我们的需求。</p>

<p>那么还有没有解决办法呢？</p>

<h1 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h1>

<p>答案是有，可以借助OpenShamrock软件进行配置，当作qq的接收端以及发送端</p>

<p>OpenShamrock官网连接</p>

<p><a class="has-card" data-link-icon="/image/003a2ce7eb50c2e24a8c624c260c5930.png" data-link-title="首页 | OpenShamrock (whitechi73.github.io)" href="https://whitechi73.github.io/OpenShamrock/" title="首页 | OpenShamrock (whitechi73.github.io)"><span class="link-card-box"><span class="link-title">首页 | OpenShamrock (whitechi73.github.io)</span><span class="link-link"><img class="link-link-icon" src="/image/003a2ce7eb50c2e24a8c624c260c5930.png" alt="icon-default.png?t=N7T8" />https://whitechi73.github.io/OpenShamrock/</span></span></a></p>

<p><img alt="" height="990" src="/image/6159ae28253ebbf6785f07117af2b2bb.png" width="1200" /></p>

<h1 id="%E9%85%8D%E7%BD%AE%E8%A6%81%E6%B1%82">配置要求</h1>

<p>这里要求的配置要比之前部署的要高得多</p>

<p>首先部署的条件以及思想的利用手机app（需要lsp框架）来获取qq的消息以及发送消息</p>

<p>那么必然是需要完整的安卓环境的</p>

<p>那么有四个方法</p>

<ul><li>利用pve来虚拟一个BlissOS虚拟机（安卓系统）并且root刷入lsp框架后安装OpenShamrock</li>
	<li>在windows10中安装模拟器root后刷入lsp框架，安装OpenShamrock，然后登录qq获取消息</li>
	<li>pve系统中安装windows并且开启嵌套虚拟化（用pvetools一键实现），再安装模拟器（最好有显卡直通，不然性能一言难尽），然后如上一个方法一样即可</li>
	<li>有多余的手机root后刷入lsp安装OpenShamrock获取消息</li>
</ul><p>当然不一定要root，LSPatch的免root也是一个不错的选择</p>

<h1 id="%E5%AE%9E%E6%93%8D">实操</h1>

<h2 id="%E5%88%B7%E5%85%A5%E9%9D%A2%E5%85%B7">刷入面具</h2>

<p>这里我已经安装好了mumu模拟器了</p>

<p>首先就要root需要打开设置然后设置以下两项</p>

<p><img alt="" height="720" src="/image/85b8f970429daccdf7fec1096b2ca084.png" width="1120" /></p>

<p><img alt="" height="720" src="/image/6af861fa6c248615c8431bd808d2fcf0.png" width="1120" /></p>

<p>重启，然后下载面具app（其他的类面具的app诸如狐狸面具一样的操作）</p>

<p><img alt="" height="766" src="/image/da67428de90e8285860040fdc008ba2b.png" width="1200" /></p>

<p> <img alt="" height="766" src="/image/aab5114092bf4cdfce84466b3785986c.png" width="1200" /></p>

<p>安装好后重启（别按重启按钮——没啥用），关掉重新打开就行</p>

<p> 再次进入时会显示弹窗</p>

<p><img alt="" height="766" src="/image/cb3839d9e2e65f8c4f271ce87c9dbea0.png" width="1200" /></p>

<p>不用理会即可</p>

<p>设置打开开启Zygisk</p>

<p><img alt="" height="766" src="/image/528b370293e241e564ac050692f7a66c.png" width="1200" /></p>

<p><img alt="" height="766" src="/image/a539b832f5bcb597237a3dc9232504de.png" width="1200" /> 然后重启</p>

<h2 id="%E5%AE%89%E8%A3%85lsp%E6%A1%86%E6%9E%B6">安装lsp框架</h2>

<p>安装Zygisk版的lsp框架</p>

<p><a class="has-card" data-link-desc="123云盘为您提供LSPosed-v1.9.2-7055-zygisk-release.zip最新版正式版官方版绿色版下载,LSPosed-v1.9.2-7055-zygisk-release.zip安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装" data-link-icon="/image/003a2ce7eb50c2e24a8c624c260c5930.png" data-link-title="LSPosed-v1.9.2-7055-zygisk-release.zip官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘" href="https://www.123pan.com/s/HrkuVv-F2wX.html" title="LSPosed-v1.9.2-7055-zygisk-release.zip官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘"><span class="link-card-box"><span class="link-title">LSPosed-v1.9.2-7055-zygisk-release.zip官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘</span><span class="link-desc">123云盘为您提供LSPosed-v1.9.2-7055-zygisk-release.zip最新版正式版官方版绿色版下载,LSPosed-v1.9.2-7055-zygisk-release.zip安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装</span><span class="link-link"><img class="link-link-icon" src="/image/003a2ce7eb50c2e24a8c624c260c5930.png" alt="icon-default.png?t=N7T8" />https://www.123pan.com/s/HrkuVv-F2wX.html</span></span></a>刷入即可</p>

<h2 id="%E5%AE%89%E8%A3%85OpenShamrock%E5%92%8CQQ">安装OpenShamrock和QQ</h2>

<p>之后去官网（上面有）下载OpenShamrock并且安装</p>

<p>然后下载QQ并且登录账号</p>

<p>再lsp框架中开启OpenShamrock作用范围改为系统和QQ即可</p>

<h3 id="%E6%B3%A8%E6%84%8F">注意</h3>

<p>需要注意的是雷电模拟器应用市场下载的QQ会显示QQ版本过低（目前是），在官网下载的QQ登录的时候会死机（目前是），需要下载QQ8.9.83版本的（连接如下）</p>

<p><a class="has-card" data-link-desc="123云盘为您提供com.tencent.mobileqq_fe151f88-gp.apk最新版正式版官方版绿色版下载,com.tencent.mobileqq_fe151f88-gp.apk安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装" data-link-icon="/image/003a2ce7eb50c2e24a8c624c260c5930.png" data-link-title="com.tencent.mobileqq_fe151f88-gp.apk官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘" href="https://www.123pan.com/s/HrkuVv-Y2wX.html" title="com.tencent.mobileqq_fe151f88-gp.apk官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘"><span class="link-card-box"><span class="link-title">com.tencent.mobileqq_fe151f88-gp.apk官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘</span><span class="link-desc">123云盘为您提供com.tencent.mobileqq_fe151f88-gp.apk最新版正式版官方版绿色版下载,com.tencent.mobileqq_fe151f88-gp.apk安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装</span><span class="link-link"><img class="link-link-icon" src="/image/003a2ce7eb50c2e24a8c624c260c5930.png" alt="icon-default.png?t=N7T8" />https://www.123pan.com/s/HrkuVv-Y2wX.html</span></span></a>模拟器的如果要连接局域网的onebot之类的项目，网络需要改成桥接才可以连接。</p>

<h1 id="%E5%A4%A7%E5%8A%9F%E5%91%8A%E6%88%90">大功告成</h1>

<p>后面进入就可以选择了，基于onebot的反向代理地址/正向代理地址填写正确即可了，目前可以算的上是go-cqhttp效果的平替（速度会慢一点点)。异常的时候上模拟器处理会更加方便。</p>

<p>其他的手机按照这个教程改一下即可（你们应该会的......)。</p>

<p>博主是一台pve上开了ubuntu（机器人服务器）+win10（模拟器）来挂机的。QAQ。</p>

<p></p>

<p></p>

<p></p>
