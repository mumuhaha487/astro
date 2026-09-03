---
title: debian安装docker（通用方法）
published: 2023-04-24
tags: [docker,容器,运维,linux,缓存]
category: docker
image: /image/51728171a1ccb8cd0cda5d20aaf484c0.png
---

<!--more-->

<p>本教程源于官网教程进行解释<a class="link-info" data-link-title="官网教程" href="https://docs.docker.com/engine/install/debian/" title="官网教程">官网教程</a></p>

<p><img alt="" height="993" src="/image/51728171a1ccb8cd0cda5d20aaf484c0.png" width="1200" /></p>

<p></p>

<p>docker容器是一个可以同时跑青龙（用于挂机脚本）与宝塔（用于便携式部署网站）之类的工具</p>

<p>我安装时在网络上搜索的教程来在部分电脑或者是主机上有时会出错尤其是32位系统的</p>

<p>于是我在疯狂百度总算找到一个我能用的方法</p>

<p><strong><span style="color:#fe2c24;">注意！！！不代表网络上其他的方法没用，我的另一台主机按照教程安装成功了，但是这台不行，如果其他的方法没用并且老是报错安装失败的话不妨试一试我的方法</span></strong></p>

<p>首先要注意的是你的下载源有没有更换过</p>

<p>如果更换过的话我试过有些源是不行的</p>

<p>现在开始教程</p>

<p>首先就是老方法卸载旧版本docker</p>

<pre>
<code>sudo apt-get remove docker docker-engine docker.io containerd runc</code></pre>

<p>之后更新一下索引，再次提醒一下，如果国内源报错请换成官方源</p>

<pre>
<code>sudo apt-get update</code></pre>

<p>安装软件包以允许使用 基于 HTTPS 的存储库</p>

<pre>
<code>sudo apt-get install \
    ca-certificates \
    curl \
    gnupg</code></pre>

<p>添加 Docker 的官方 GPG 密钥：</p>

<pre>
<code>sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg</code></pre>

<p>设置储存库</p>

<pre>
<code>echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release &amp;&amp; echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list &gt; /dev/null</code></pre>

<p>接下来再次更新一下</p>

<pre>
<code>sudo apt-get update
</code></pre>

<p>可能会慢一些，看电脑配置以及网速</p>

<p>然后安装最新版本docker</p>

<pre>
<code>sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin</code></pre>

<p>创建一个helloword容器查看是否安装成功</p>

<pre>
<code>sudo docker run hello-world</code></pre>

<p>没报错就大功告成</p>
