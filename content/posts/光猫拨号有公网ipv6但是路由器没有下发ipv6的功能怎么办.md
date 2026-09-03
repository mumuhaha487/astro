---
title: 光猫拨号有公网ipv6但是路由器没有下发ipv6的功能怎么办
published: 2023-07-02
tags: [网络,智能路由器]
category: 软件报错
image: /image/2f4cb045b0543e145cad156695c9c15e.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E8%B5%B7%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E8%B5%B7%E5%9B%A0">起因</a></p>

<p id="%E6%93%8D%E4%BD%9C-toc" style="margin-left:0px;"><a href="#%E6%93%8D%E4%BD%9C">操作</a></p>

<p id="%E7%AC%AC%E4%B8%80-toc" style="margin-left:40px;"><a href="#%E7%AC%AC%E4%B8%80">第一</a></p>

<p id="%E7%AC%AC%E4%BA%8C-toc" style="margin-left:40px;"><a href="#%E7%AC%AC%E4%BA%8C">第二</a></p>

<p id="%E7%AC%AC%E4%B8%89-toc" style="margin-left:40px;"><a href="#%E7%AC%AC%E4%B8%89">第三</a></p>

<p id="%E7%AC%AC%E5%9B%9B-toc" style="margin-left:40px;"><a href="#%E7%AC%AC%E5%9B%9B">第四</a></p>

<p id="%E7%AC%AC%E4%BA%94%EF%BC%88%E6%9C%80%E9%87%8D%E8%A6%81%E7%9A%84%E4%B8%80%E6%AD%A5%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E7%AC%AC%E4%BA%94%EF%BC%88%E6%9C%80%E9%87%8D%E8%A6%81%E7%9A%84%E4%B8%80%E6%AD%A5%EF%BC%89">第五（最重要的一步）</a></p>

<p id="%E6%9C%80%E5%90%8E%E4%B8%80%E6%AD%A5-toc" style="margin-left:40px;"><a href="#%E6%9C%80%E5%90%8E%E4%B8%80%E6%AD%A5">最后一步</a></p>

<hr id="hr-toc" /><p></p>

<h1></h1>

<h1 id="%E8%B5%B7%E5%9B%A0">起因</h1>

<p>因为家里的路由器没有ipv6；但是当我连接光猫的时候，我发现我居然有ipv6的公网。</p>

<p>然后我在路由器上找开启ipv6的选项，遗憾的是我没有找到</p>

<h1 id="%E6%93%8D%E4%BD%9C">操作</h1>

<h2 id="%E7%AC%AC%E4%B8%80">第一</h2>

<p>连接光猫的wifi或者连接光猫的网口，在cmd中输入ipconfig（linux输入ifconfig）</p>

<p>查看默认网关</p>

<p><img alt="" height="263" src="/image/2f4cb045b0543e145cad156695c9c15e.png" width="1200" /></p>

<p></p>

<h2 id="%E7%AC%AC%E4%BA%8C">第二</h2>

<p>连接路由器的wifi并且同样的方法查看默认网关</p>

<h2 id="%E7%AC%AC%E4%B8%89">第三</h2>

<p>在浏览器中输入该路由器的网关地址</p>

<p>然后调整ip地址</p>

<p>把他的地址调整到光猫的ip网关地址</p>

<p>子网掩码不变</p>

<p><img alt="" height="763" src="/image/199a46999928f81fb3d9fee1d8819662.png" width="1200" /></p>

<p></p>

<p> 点击提交</p>

<h2 id="%E7%AC%AC%E5%9B%9B">第四</h2>

<p>在地址栏输入刚刚改的ip网关地址</p>

<p>把DHCP服务关掉（现在就由路由器分配内网ipv4以及公网ipv6地址）</p>

<h2 id="%E7%AC%AC%E4%BA%94%EF%BC%88%E6%9C%80%E9%87%8D%E8%A6%81%E7%9A%84%E4%B8%80%E6%AD%A5%EF%BC%89">第五（最重要的一步）</h2>

<p>把光猫的网口接到路由器的lan口上（注意是lan口而不是wan口，就是很多个一起的）</p>

<h2 id="%E6%9C%80%E5%90%8E%E4%B8%80%E6%AD%A5">最后一步</h2>

<p>重启路由器过五分钟，就可以看到自己有ipv6的地址了</p>

<p><img alt="" height="245" src="/image/8440a57c9d0e47cd47b30e2cdda70cba.png" width="820" /></p>

<p></p>
