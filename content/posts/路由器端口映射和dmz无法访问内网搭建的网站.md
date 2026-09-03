---
title: 路由器端口映射和dmz无法访问内网搭建的网站
published: 2023-04-21
tags: [智能路由器,网络,linux,网络安全,网络协议]
category: 宝塔
image: /image/6b0ed8d52858613c6df5fd3c651ebc0d.png
---

<!--more-->

<p>昨天想着不用内网穿透用路由器端口映射打开或者路由器dmz做全端口映射</p>

<p>结果外网访问不了我宝塔搭建的网站</p>

<p>内网可以进（用的也是公网ip）</p>

<p>但是外网访问不了，后来我想是不是我的路由器是不是不是公网ip</p>

<p>结果百度搜索ip出现的ip和我路由器的wlan ip一样</p>

<p>嘶~不对啊，那为啥访问不了</p>

<p>然后我在手机开流量用我公网的ip用ssh链接了一下</p>

<p><img alt="" height="537" src="/image/6b0ed8d52858613c6df5fd3c651ebc0d.png" width="775" /></p>

<p>成功了，证明确实做了端口映射</p>

<p>为什么访问不了我的网站</p>

<p>然后匪夷所思的是搭建宝塔网站外网可以访问</p>

<p><img alt="" height="1038" src="/image/e64195ee204218f19b74e6e3a0827bd4.png" width="1200" /></p>

<p> </p>

<p>然后我找到一个链接<a class="link-info" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.2.5/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N3I4" data-link-title=" 测试端口" href="https://canyouseeme.org/" title=" 测试端口"> 测试端口</a>（注意：依旧用外网或者流量访问）查看我开放的端口</p>

<p>结果发现</p>

<p></p>

<p>22506端口可以访问 </p>

<p><img alt="" height="952" src="/image/db8282a48d6d88503fae646063bb1780.png" width="1200" /></p>

<p>80端口不能</p>

<p> </p>

<p><img alt="" height="952" src="/image/87a8bad01eea52909d384ed013ac8580.png" width="1200" /></p>

<p>结果显而易见</p>

<p>路由器把80端口封了，要开启就要去备案了（改成其他的端口外网应该也访问不了）</p>

<p>但是宝塔网站好像就能访问不知道为什么。有知道的可以解释一下。</p>

<p> </p>

<p> </p>
