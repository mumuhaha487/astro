---
title: 如何查看自己的ssh端口是否被攻击
published: 2023-06-21
tags: [ssh,运维]
category: 宝塔
image: /image/b5c5b98b2f9b0359656e1ffca01f917d.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E7%8E%AF%E5%A2%83-toc" style="margin-left:0px;"><a href="#%E7%8E%AF%E5%A2%83">环境</a></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E8%B5%B7%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E8%B5%B7%E5%9B%A0">起因</a></p>

<p id="%E6%9F%A5%E7%9C%8Bssh%E6%97%A5%E5%BF%97-toc" style="margin-left:0px;"><a href="#%E6%9F%A5%E7%9C%8Bssh%E6%97%A5%E5%BF%97">查看ssh日志</a></p>

<p id="%E7%94%A8%E5%91%BD%E4%BB%A4%E7%9B%B4%E6%8E%A5%E6%9F%A5%E7%9C%8B-toc" style="margin-left:0px;"><a href="#%E7%94%A8%E5%91%BD%E4%BB%A4%E7%9B%B4%E6%8E%A5%E6%9F%A5%E7%9C%8B">用命令直接查看</a></p>

<p id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:0px;"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p id="%E5%85%B3%E9%97%ADssh%E5%AF%86%E7%A0%81%E7%99%BB%E5%BD%95%E5%90%AF%E7%94%A8%E7%A7%98%E9%92%A5%E7%99%BB%E5%BD%95-toc" style="margin-left:40px;"><a href="#%E5%85%B3%E9%97%ADssh%E5%AF%86%E7%A0%81%E7%99%BB%E5%BD%95%E5%90%AF%E7%94%A8%E7%A7%98%E9%92%A5%E7%99%BB%E5%BD%95">关闭ssh密码登录启用秘钥登录</a></p>

<p id="%E7%BC%BA%E7%82%B9%C2%A0-toc" style="margin-left:80px;"><a href="#%E7%BC%BA%E7%82%B9%C2%A0">缺点 </a></p>

<p id="%E6%94%B9%E7%AB%AF%E5%8F%A3%EF%BC%88%E6%8E%A8%E8%8D%90%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E6%94%B9%E7%AB%AF%E5%8F%A3%EF%BC%88%E6%8E%A8%E8%8D%90%EF%BC%89">改端口（推荐）</a></p>

<p id="ip%E9%BB%91%E5%90%8D%E5%8D%95%EF%BC%88%E4%B8%AA%E4%BA%BA%E7%94%A8%E6%88%B7%E4%B8%8D%E6%8E%A8%E8%8D%90%EF%BC%89-toc" style="margin-left:0px;"><a href="#ip%E9%BB%91%E5%90%8D%E5%8D%95%EF%BC%88%E4%B8%AA%E4%BA%BA%E7%94%A8%E6%88%B7%E4%B8%8D%E6%8E%A8%E8%8D%90%EF%BC%89">ip黑名单（个人用户不推荐）</a></p>

<p id="%E7%BC%BA%E7%82%B9-toc" style="margin-left:80px;"><a href="#%E7%BC%BA%E7%82%B9">缺点</a></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E9%AA%8C%E8%AF%81%2F%E5%85%B6%E4%BB%96%E7%9A%84%E4%B8%80%E4%BA%9B%E5%91%BD%E4%BB%A4-toc" style="margin-left:0px;"><a href="#%E9%AA%8C%E8%AF%81%2F%E5%85%B6%E4%BB%96%E7%9A%84%E4%B8%80%E4%BA%9B%E5%91%BD%E4%BB%A4">验证/其他的一些命令</a></p>

<p id="%E6%9F%A5%E8%AF%A2ip%E5%9C%B0%E5%9D%80%E7%9A%84%E6%9C%80%E5%90%8E%E7%99%BB%E5%85%A5%E6%97%B6%E9%97%B4-toc" style="margin-left:40px;"><a href="#%E6%9F%A5%E8%AF%A2ip%E5%9C%B0%E5%9D%80%E7%9A%84%E6%9C%80%E5%90%8E%E7%99%BB%E5%85%A5%E6%97%B6%E9%97%B4">查询ip地址的最后登入时间</a></p>

<p id="%E6%9F%A5%E8%AF%A2ip%E5%9C%B0%E5%9D%80%E7%9A%84%E5%BC%80%E5%A7%8B%E7%99%BB%E5%85%A5%E6%97%B6%E9%97%B4-toc" style="margin-left:40px;"><a href="#%E6%9F%A5%E8%AF%A2ip%E5%9C%B0%E5%9D%80%E7%9A%84%E5%BC%80%E5%A7%8B%E7%99%BB%E5%85%A5%E6%97%B6%E9%97%B4">查询ip地址的开始登入时间</a></p>

<p id="%E6%9F%A5%E8%AF%A2%E6%81%B6%E6%84%8Fip%E7%99%BB%E5%85%A5%E5%A4%B1%E8%B4%A5%E6%97%B6%E6%9C%80%E5%B8%B8%E7%94%A8%E7%9A%84%E8%B4%A6%E5%8F%B7%E5%90%8D%E7%A7%B0-toc" style="margin-left:40px;"><a href="#%E6%9F%A5%E8%AF%A2%E6%81%B6%E6%84%8Fip%E7%99%BB%E5%85%A5%E5%A4%B1%E8%B4%A5%E6%97%B6%E6%9C%80%E5%B8%B8%E7%94%A8%E7%9A%84%E8%B4%A6%E5%8F%B7%E5%90%8D%E7%A7%B0">查询恶意ip登入失败时最常用的账号名称</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E7%8E%AF%E5%A2%83">环境</h1>

<ul><li>debian 11_64</li>
	<li>宝塔面板</li>
</ul><h1></h1>

<h1 id="%E8%B5%B7%E5%9B%A0">起因</h1>

<p>之前在进入宝塔后台的时候发现一个惊讶的点</p>

<p><img alt="" height="185" src="/image/b5c5b98b2f9b0359656e1ffca01f917d.png" width="1200" /></p>

<p>我的ssh端口好像一直被别人用弱密码爆破</p>

<p>虽然密码设计的很复杂</p>

<p>但是每次看到这个东西一天加个几千次失败有些看不顺眼</p>

<h1 id="%E6%9F%A5%E7%9C%8Bssh%E6%97%A5%E5%BF%97">查看ssh日志</h1>

<p>不知道为什么我安装网上的教程来做</p>

<p>当我输入</p>

<pre>
<code class="language-bash">cat /var/log/auth.log | grep "Failed password"</code></pre>

<p> 时它什么也不显示，好像我本来没有这个文件</p>

<p>看到一些开启日志的解决方法，但是我也懒得搞了</p>

<h1 id="%E7%94%A8%E5%91%BD%E4%BB%A4%E7%9B%B4%E6%8E%A5%E6%9F%A5%E7%9C%8B">用命令直接查看</h1>

<p>于是我直接用命令进行查看</p>

<pre>
<code class="language-bash">lastb | awk '{ print $3}' | sort | uniq -c | sort -n
</code></pre>

<blockquote>
<p>    109 113.140.8.194<br />
    109 45.95.147.218<br />
    113 185.224.128.141<br />
    118 185.217.1.246<br />
    121 170.210.208.108<br />
    127 141.98.11.110<br />
    134 89.39.246.21<br />
    144 167.99.89.165<br />
    193 101.42.25.236<br />
    209 222.138.252.23<br />
    283 104.248.123.223<br />
    516 113.195.227.183<br />
    518 113.57.92.188<br />
    558 157.245.42.2<br />
    649 64.227.176.74<br />
    682 170.64.150.41<br />
    682 170.64.163.254<br />
    682 170.64.172.227<br />
    682 170.64.188.86<br />
   1364 170.64.134.101<br />
   1364 170.64.162.66<br />
   1364 170.64.171.0<br />
   1601 170.64.163.255<br />
   1878 61.247.57.24</p>
</blockquote>

<p>一看，好家伙！！！有几个ip登录了1000+次</p>

<p>ip一搜索</p>

<p><img alt="" height="549" src="/image/c10f4635f61f9a6b581f88ea49bc1568.png" width="906" /></p>

<p></p>

<p>还是臭名昭著的嘞</p>

<h1 id="%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</h1>

<p>解决办法有三个</p>

<h2 id="%E5%85%B3%E9%97%ADssh%E5%AF%86%E7%A0%81%E7%99%BB%E5%BD%95%E5%90%AF%E7%94%A8%E7%A7%98%E9%92%A5%E7%99%BB%E5%BD%95">关闭ssh密码登录启用秘钥登录</h2>

<p><img alt="" height="260" src="/image/6c310deb41d38a1017c495fd044e2343.png" width="1200" /></p>

<p>这一栏吧ssh秘钥开启并且把ssh密码登录关闭</p>

<h3 id="%E7%BC%BA%E7%82%B9%C2%A0">缺点 </h3>

<p> 这么做缺点就是如果到一台新的电脑上，你没有备份密钥的话登录就比较麻烦。</p>

<h2 id="%E6%94%B9%E7%AB%AF%E5%8F%A3%EF%BC%88%E6%8E%A8%E8%8D%90%EF%BC%89">改端口（推荐）</h2>

<p>恶意ip往往是批量扫描ip的22号端口来判断是否开启ssh登入</p>

<p>如果改了ssh端口的话，一般情况下恶意ip不会花这么多的时间成本来扫描ip开放端口然后再一个一个端口试。</p>

<h1 id="ip%E9%BB%91%E5%90%8D%E5%8D%95%EF%BC%88%E4%B8%AA%E4%BA%BA%E7%94%A8%E6%88%B7%E4%B8%8D%E6%8E%A8%E8%8D%90%EF%BC%89">ip黑名单（个人用户不推荐）</h1>

<p>或者可以把恶意的ip拉入黑名单，这样就可以禁止它访问我们的ip地址</p>

<h3 id="%E7%BC%BA%E7%82%B9">缺点</h3>

<p>恶意ip会变化所以要经常更新ip地址</p>

<p>而且由于黑客可以换ip地址，所以即使经常更新ip黑名单被黑入的概率还是挺大的</p>

<h1></h1>

<h1 id="%E9%AA%8C%E8%AF%81%2F%E5%85%B6%E4%BB%96%E7%9A%84%E4%B8%80%E4%BA%9B%E5%91%BD%E4%BB%A4">验证/其他的一些命令</h1>

<h2 id="%E6%9F%A5%E8%AF%A2ip%E5%9C%B0%E5%9D%80%E7%9A%84%E6%9C%80%E5%90%8E%E7%99%BB%E5%85%A5%E6%97%B6%E9%97%B4">查询ip地址的最后登入时间</h2>

<pre>
<code class="language-bash">lastb | grep ip地址 |tac
</code></pre>

<p>可以用来判断恶意ip有无停止进攻</p>

<p></p>

<h2 id="%E6%9F%A5%E8%AF%A2ip%E5%9C%B0%E5%9D%80%E7%9A%84%E5%BC%80%E5%A7%8B%E7%99%BB%E5%85%A5%E6%97%B6%E9%97%B4">查询ip地址的开始登入时间</h2>

<pre>
<code class="language-bash">lastb | grep ip地址</code></pre>

<p>可以用来查询恶意ip什么时候开始发起的进攻</p>

<p></p>

<h2 id="%E6%9F%A5%E8%AF%A2%E6%81%B6%E6%84%8Fip%E7%99%BB%E5%85%A5%E5%A4%B1%E8%B4%A5%E6%97%B6%E6%9C%80%E5%B8%B8%E7%94%A8%E7%9A%84%E8%B4%A6%E5%8F%B7%E5%90%8D%E7%A7%B0">查询恶意ip登入失败时最常用的账号名称</h2>

<pre>
<code class="language-bash">lastb | awk '{ print $1}' | sort | uniq -c | sort -n </code></pre>

<p></p>

<p></p>

<blockquote>
<p>    138 jenkins<br />
    146 dev<br />
    148 centos<br />
    150 deploy<br />
    150 sftp<br />
    154 node<br />
    155 user1<br />
    164 steam<br />
    169 ubnt<br />
    180 testuser<br />
    194 vagrant<br />
    222 dolphins<br />
    232 es<br />
    243 pi<br />
    266 hadoop<br />
    272 ftpuser<br />
    282 git<br />
    400 postgres<br />
    438 oracle<br />
    452 test<br />
    595 user<br />
    737 ubuntu<br />
   1186 admin<br />
   9292 root</p>
</blockquote>

<p>可以看到用到的最多的是root和admin的账号名</p>

<p>所以在开启ssh之后一定要及时修改账号与密码</p>
