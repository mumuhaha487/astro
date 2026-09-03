---
title: 什么是docker以及一些有趣的docker项目
published: 2023-06-21
tags: [docker,运维,容器]
category: 宝塔
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="docker%E7%9A%84%E4%BB%8B%E7%BB%8D-toc" style="margin-left:0px;"><a href="#docker%E7%9A%84%E4%BB%8B%E7%BB%8D">docker的介绍</a></p>

<p id="%E4%BB%80%E4%B9%88%E6%98%AFdocker-toc" style="margin-left:40px;"><a href="#%E4%BB%80%E4%B9%88%E6%98%AFdocker">什么是docker</a></p>

<p id="%E9%82%A3%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8docker%E8%80%8C%E4%B8%8D%E7%94%A8%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%91%A2%EF%BC%9F-toc" style="margin-left:40px;"><a href="#%E9%82%A3%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8docker%E8%80%8C%E4%B8%8D%E7%94%A8%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%91%A2%EF%BC%9F">那为什么我们要用docker而不用虚拟机呢？</a></p>

<p id="%E5%90%AF%E5%8A%A8%E4%BC%98%E5%8A%BF-toc" style="margin-left:80px;"><a href="#%E5%90%AF%E5%8A%A8%E4%BC%98%E5%8A%BF">启动优势</a></p>

<p id="docker%E8%B5%84%E6%BA%90%E6%B6%88%E8%80%97%E4%BC%9A%E6%9B%B4%E5%B0%91-toc" style="margin-left:80px;"><a href="#docker%E8%B5%84%E6%BA%90%E6%B6%88%E8%80%97%E4%BC%9A%E6%9B%B4%E5%B0%91">docker资源消耗会更少</a></p>

<p id="docker%E5%85%B7%E6%9C%89%E4%B8%80%E9%94%AE%E9%83%A8%E7%BD%B2%E7%9A%84%E7%AE%80%E4%BE%BF%E6%80%A7-toc" style="margin-left:80px;"><a href="#docker%E5%85%B7%E6%9C%89%E4%B8%80%E9%94%AE%E9%83%A8%E7%BD%B2%E7%9A%84%E7%AE%80%E4%BE%BF%E6%80%A7">docker具有一键部署的简便性</a></p>

<p id="docker%E7%9A%84%E5%8D%B8%E8%BD%BD%E7%AE%80%E4%BE%BF%E6%80%A7-toc" style="margin-left:80px;"><a href="#docker%E7%9A%84%E5%8D%B8%E8%BD%BD%E7%AE%80%E4%BE%BF%E6%80%A7">docker的卸载简便性</a></p>

<p id="docker%E7%9A%84%E5%8F%AF%E7%A7%BB%E6%A4%8D%E6%80%A7-toc" style="margin-left:80px;"><a href="#docker%E7%9A%84%E5%8F%AF%E7%A7%BB%E6%A4%8D%E6%80%A7">docker的可移植性</a></p>

<p id="docker%E7%9B%B8%E6%AF%94%E4%BA%8E%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%9A%84%E5%B1%80%E9%99%90%E6%80%A7-toc" style="margin-left:40px;"><a href="#docker%E7%9B%B8%E6%AF%94%E4%BA%8E%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%9A%84%E5%B1%80%E9%99%90%E6%80%A7">docker相比于虚拟机的局限性</a></p>

<p id="docker%E7%9A%84%E9%9A%94%E7%A6%BB%E6%80%A7%E4%B8%8D%E5%A6%82%E8%99%9A%E6%8B%9F%E6%9C%BA-toc" style="margin-left:80px;"><a href="#docker%E7%9A%84%E9%9A%94%E7%A6%BB%E6%80%A7%E4%B8%8D%E5%A6%82%E8%99%9A%E6%8B%9F%E6%9C%BA">docker的隔离性不如虚拟机</a></p>

<p id="docker%E7%9A%84%E5%AE%89%E5%85%A8%E6%80%A7%E4%B8%8D%E5%A6%82%E8%99%9A%E6%8B%9F%E6%9C%BA-toc" style="margin-left:80px;"><a href="#docker%E7%9A%84%E5%AE%89%E5%85%A8%E6%80%A7%E4%B8%8D%E5%A6%82%E8%99%9A%E6%8B%9F%E6%9C%BA">docker的安全性不如虚拟机</a></p>

<p id="%E9%83%A8%E5%88%86docker%E9%A1%B9%E7%9B%AE%E7%9A%84%E4%BB%8B%E7%BB%8D-toc" style="margin-left:0px;"><a href="#%E9%83%A8%E5%88%86docker%E9%A1%B9%E7%9B%AE%E7%9A%84%E4%BB%8B%E7%BB%8D">部分docker项目的介绍</a></p>

<p id="alist-toc" style="margin-left:40px;"><a href="#alist">alist</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:80px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4-toc" style="margin-left:80px;"><a href="#%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4">部署命令</a></p>

<p id="nextcloud-toc" style="margin-left:40px;"><a href="#nextcloud">nextcloud</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:80px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4-toc" style="margin-left:80px;"><a href="#%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4">部署命令</a></p>

<p id="%E9%9D%92%E9%BE%99%E9%9D%A2%E6%9D%BF-toc" style="margin-left:40px;"><a href="#%E9%9D%92%E9%BE%99%E9%9D%A2%E6%9D%BF">青龙面板</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:80px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4-toc" style="margin-left:80px;"><a href="#%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4">部署命令</a></p>

<p id="%E7%BD%91%E5%BF%83%E4%BA%91-toc" style="margin-left:40px;"><a href="#%E7%BD%91%E5%BF%83%E4%BA%91">网心云</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:40px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4-toc" style="margin-left:80px;"><a href="#%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4">部署命令</a></p>

<p id="kodbox%EF%BC%88%E5%8F%AF%E9%81%93%E4%BA%91%EF%BC%89-toc" style="margin-left:40px;"><a href="#kodbox%EF%BC%88%E5%8F%AF%E9%81%93%E4%BA%91%EF%BC%89">kodbox（可道云）</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:40px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4-toc" style="margin-left:80px;"><a href="#%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4">部署命令</a></p>

<p id="%E5%AE%9D%E5%A1%94-toc" style="margin-left:40px;"><a href="#%E5%AE%9D%E5%A1%94">宝塔</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:80px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4-toc" style="margin-left:80px;"><a href="#%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4">部署命令</a></p>

<p id="%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E7%BB%93">总结</a></p>

<hr id="hr-toc" /><p></p>

<h1></h1>

<h1 id="docker%E7%9A%84%E4%BB%8B%E7%BB%8D">docker的介绍</h1>

<h2 id="%E4%BB%80%E4%B9%88%E6%98%AFdocker">什么是docker</h2>

<blockquote>
<p>Docker是基于linux内核的一个自由开发，打包，运行程序的平台，Dcoker可以让我们将程序从环境中分离出来从而实现快速迁移我们的项目。通过Docker，管理我们的应用就像管理我们的环境一样简单（我觉得在实际开发中哪个都不简单，对于刚毕业的我来说），通过利用docker技术可以快速打包，测试，部署我们的代码，你可以显著的减少在编写代码以及将它运行在生产环境中的时间损耗。</p>
</blockquote>

<p><em>他是真正让我意识到linux方便之处的开始</em></p>

<p><span style="background-color:#38d8f0;">简单狭义的来说docker就是一个轻量的虚拟机</span></p>

<h2 id="%E9%82%A3%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8docker%E8%80%8C%E4%B8%8D%E7%94%A8%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%91%A2%EF%BC%9F">那为什么我们要用docker而不用虚拟机呢？</h2>

<p></p>

<h3 id="%E5%90%AF%E5%8A%A8%E4%BC%98%E5%8A%BF">启动优势</h3>

<p>docker的启动速度方面要比虚拟机快的多得多</p>

<p></p>

<h3 id="docker%E8%B5%84%E6%BA%90%E6%B6%88%E8%80%97%E4%BC%9A%E6%9B%B4%E5%B0%91">docker资源消耗会更少</h3>

<p>docker在操作系统级别进⾏虚拟化，他与硬件内核的交互利用率<span style="color:#fe2c24;">几乎是100%</span></p>

<p>而Hypervisor层与内核层的虚拟化有时<span style="color:#fe2c24;">只能达到50%</span></p>

<p></p>

<h3 id="docker%E5%85%B7%E6%9C%89%E4%B8%80%E9%94%AE%E9%83%A8%E7%BD%B2%E7%9A%84%E7%AE%80%E4%BE%BF%E6%80%A7">docker具有一键部署的简便性</h3>

<p>大多数的docker项目只需要一段命令就可以完美安装好他人提供的镜像</p>

<p>无需再次安装其他依赖</p>

<p></p>

<h3 id="docker%E7%9A%84%E5%8D%B8%E8%BD%BD%E7%AE%80%E4%BE%BF%E6%80%A7">docker的卸载简便性</h3>

<p>相比于把一堆垃圾软件安装到系统上然后难以删除（尤其是linux系统）</p>

<p><span style="background-color:#ed7976;">docker就是一种十分简单的安装与卸载的形式</span></p>

<p></p>

<h3 id="docker%E7%9A%84%E5%8F%AF%E7%A7%BB%E6%A4%8D%E6%80%A7">docker的可移植性</h3>

<p>你不仅可以下载别人的镜像与此同时，你也可以发布你自己做好的镜像以供他人使用。</p>

<p>他人也可以用几段代码拉取你制作的镜像</p>

<p></p>

<h2 id="docker%E7%9B%B8%E6%AF%94%E4%BA%8E%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%9A%84%E5%B1%80%E9%99%90%E6%80%A7">docker相比于虚拟机的局限性</h2>

<h3 id="docker%E7%9A%84%E9%9A%94%E7%A6%BB%E6%80%A7%E4%B8%8D%E5%A6%82%E8%99%9A%E6%8B%9F%E6%9C%BA">docker的隔离性不如虚拟机</h3>

<p>与系统隔离的虚拟机相比，docker只是进程间的隔离。</p>

<p></p>

<h3 id="docker%E7%9A%84%E5%AE%89%E5%85%A8%E6%80%A7%E4%B8%8D%E5%A6%82%E8%99%9A%E6%8B%9F%E6%9C%BA">docker的安全性不如虚拟机</h3>

<p>由于docker的隔离性不行，所以当他测试一些恶意软件时他的安全性不如虚拟机</p>

<p></p>

<h1 id="%E9%83%A8%E5%88%86docker%E9%A1%B9%E7%9B%AE%E7%9A%84%E4%BB%8B%E7%BB%8D">部分docker项目的介绍</h1>

<p></p>

<h2 id="alist">alist</h2>

<h3 id="%E4%BB%8B%E7%BB%8D">介绍</h3>

<p>这一个项目<span style="background-color:#ed7976;">可以挂载市面上几乎任何的网盘</span>（百度云盘，阿里云盘，123云盘...）</p>

<p>并且可以通过webdav来挂载阿里云视频到本地文件夹，之后通过emby来实现播放搭建自己的私人影院</p>

<p>或者你也可以配合aria2来实现获取网盘文件的快速下载链接，比如阿里云盘在我电脑上用客户端下载时10m/s而用aria2可以实现30m/s 的下载速度</p>

<h3 id="%E9%83%A8%E7%BD%B2%E5%91%BD%E4%BB%A4">部署命令</h3>

<pre>
<code class="language-bash">docker run -d --restart=always -v 你缓存的文件夹位置:/opt/alist/data -p 5244:5244 --name="alist" xhofe/alist:latest</code></pre>

<p> 运行下面命令获得密码</p>

<pre>
<code class="language-bash">docker exec -it alist ./alist admin</code></pre>

<p>网站在<span style="background-color:#ed7976;">服务器ip:5244</span></p>

<p></p>

<h2 id="nextcloud">nextcloud</h2>

<h3>介绍</h3>

<p>它是一个私人云盘服务，并且可以提供下载上传以及挂载等多方面的功能（PS：私人云盘如果在内网搭建的话，网口配置只要不要太烂，内网之间的传输速率是非常非常快的，我这边是60m/s，并且不占用局域网内其他电脑的宽带）</p>

<h3>部署命令</h3>

<pre>
<code class="language-bash">docker run -d --restart=always --name nextcloud -p 80:80 -v /root/nextcloud:/data rootlogin/nextcloud
</code></pre>

<p>网站在<span style="background-color:#ed7976;">服务器ip:80</span></p>

<p>这里要说明其中的80:80中前面的80可以变（后面的绝对不行）变成81的话</p>

<p>网站就在<span style="background-color:#ed7976;">服务器ip:81</span></p>

<p></p>

<h2 id="%E9%9D%92%E9%BE%99%E9%9D%A2%E6%9D%BF">青龙面板</h2>

<h3>介绍</h3>

<p>这也是我接触docker的第一款项目，它可以定时的执行一些pyhton或者是nodejs的一些小任务</p>

<p>比如最有名的就是京东自动定时薅羊毛（京豆，红包）</p>

<p>以及自动签到之类的脚本</p>

<h3>部署命令</h3>

<pre>
<code class="language-bash"> docker run -dit \
   -v $PWD/ql/config:/ql/config \
   -v $PWD/ql/log:/ql/log \
   -v $PWD/ql/db:/ql/db \
   -v $PWD/ql/repo:/ql/repo \
   -v $PWD/ql/raw:/ql/raw \
   -v $PWD/ql/scripts:/ql/scripts \
   -v $PWD/ql/jbot:/ql/jbot \
   -p 5700:5700 \
   --name qinglong \
   --hostname qinglong \
   --restart unless-stopped \
   whyour/qinglong:latest</code></pre>

<p></p>

<h2 id="%E7%BD%91%E5%BF%83%E4%BA%91">网心云</h2>

<h2>介绍</h2>

<p>如果你家里有闲置宽带又经常晚上因为加班用不着或者用的宽带大多数时候很少那不妨试试看用闲置宽带赚一些零花钱（过了一个星期后平均100m上行一天5块钱可以把宽带钱挣回来，但是晚上高峰期时如果打部分游戏的话会变得比较卡）</p>

<h3>部署命令</h3>

<pre>
<code class="language-bash">docker pull registry.hub.docker.com/onething1/wxedge</code></pre>

<pre>
<code class="language-bash">docker run -d --name=wxedge --restart=always --privileged --net=host --tmpfs /run --tmpfs /tmp -v 磁盘路径:/storage:rw registry.hub.docker.com/onething1/wxedge</code></pre>

<h2 id="kodbox%EF%BC%88%E5%8F%AF%E9%81%93%E4%BA%91%EF%BC%89">kodbox（可道云）</h2>

<h2>介绍</h2>

<p>这也是一款私人云盘，但是相比nextcloud他的内置的pdf阅读器非常的优秀，并且它拥有的桌面系统也十分方便操作，缺点就是没有nextcloud的强大的离线下载功能，虽然经过优化后也可以到达相应的水平</p>

<h3>部署命令</h3>

<pre>
<code class="language-bash">docker run -d --name kodbox --restart=always -v 你云盘存放文件的目录:/var/www/html -p 80:80 aeert/kodbox:latest</code></pre>

<p>还是老样子80:80这行命令看着改就行（端口别被占用了）</p>

<h2 id="%E5%AE%9D%E5%A1%94">宝塔</h2>

<h3>介绍</h3>

<blockquote>
<p>宝塔（Baota）是一款免费的服务器管理面板，它提供了简单易用的图形界面，可以帮助用户快速地安装、配置和管理服务器上的各种应用程序，例如Web服务器、数据库、FTP等等。宝塔支持多种操作系统和软件环境，包括Linux、Windows、Nginx、Apache、MySQL、PHP等等。它的功能十分强大，包括网站管理、FTP管理、数据库管理、文件管理、日志管理、安全管理等等，而且宝塔的界面设计也非常美观和易用。</p>
</blockquote>

<p>他可以非常简单的搭建一些网站以及一键部署一些网站</p>

<p><span style="background-color:#38d8f0;">有趣的是你也可以在宝塔中再次安装docker来套娃</span></p>

<h3>部署命令</h3>

<pre>
<code class="language-bash">docker pull ubuntu</code></pre>

<pre>
<code class="language-bash">docker run -i -t -d --name bt -p 2000:20 -p 2100:21 -p 8000:80 -p 4430:443 -p 8880:888 -p 8888:8888 --privileged=true -v 宝塔中网站的挂载的本地目录:/www/wwwroot ubuntu</code></pre>

<pre>
<code class="language-bash">docker exec -it bt /bin/bash</code></pre>

<pre>
<code class="language-bash">apt-get update
apt-get -y install sudo
apt-get -y install wget
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh &amp;&amp; sudo bash install.sh ed8484bec</code></pre>

<p></p>

<p>最后输入bt 14查看网站管理的网址（不同电脑不一样的端口）</p>

<p></p>

<h1 id="%E6%80%BB%E7%BB%93">总结</h1>

<p>docker作为一个工具它拥有极其简单的部署操作以及移植操作，并且对于一些刚开始入门linux的人来说可以激发学习兴趣，并且在不断的尝试与好奇之中学习。</p>
