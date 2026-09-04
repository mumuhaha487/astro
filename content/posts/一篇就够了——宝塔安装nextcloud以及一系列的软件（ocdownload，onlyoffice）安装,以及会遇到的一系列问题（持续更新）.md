---
title: 一篇就够了——宝塔安装nextcloud以及一系列的软件（ocdownload，onlyoffice）安装,以及会遇到的一系列问题（持续更新）
published: 2023-05-27
tags: [php,linux,docker,服务器,容器]
category: 宝塔
image: /images/demo-avatar.webp
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E4%BB%80%E4%B9%88%E6%98%AF%E5%AE%9D%E5%A1%94-toc" style="margin-left:40px;"><a href="#%E4%BB%80%E4%B9%88%E6%98%AF%E5%AE%9D%E5%A1%94">什么是宝塔</a></p>

<p id="%E4%BB%80%E4%B9%88%E6%98%AFnextcloud-toc" style="margin-left:40px;"><a href="#%E4%BB%80%E4%B9%88%E6%98%AFnextcloud">什么是nextcloud</a></p>

<p id="%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E7%94%A8docker%E6%9D%A5%E5%AE%89%E8%A3%85nextcloud-toc" style="margin-left:40px;"><a href="#%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E7%94%A8docker%E6%9D%A5%E5%AE%89%E8%A3%85nextcloud">为什么不用docker来安装nextcloud</a></p>

<p id="%E4%B8%8B%E8%BD%BD-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E8%BD%BD">下载</a></p>

<p id="%E7%89%88%E6%9C%AC%E9%80%89%E6%8B%A9%E5%92%8C%E4%B8%8B%E8%BD%BD%E9%93%BE%E6%8E%A5-toc" style="margin-left:40px;"><a href="#%E7%89%88%E6%9C%AC%E9%80%89%E6%8B%A9%E5%92%8C%E4%B8%8B%E8%BD%BD%E9%93%BE%E6%8E%A5">版本选择和下载链接</a></p>

<p id="%E5%B0%8F%E6%8F%90%E7%A4%BA-toc" style="margin-left:40px;"><a href="#%E5%B0%8F%E6%8F%90%E7%A4%BA">小提示</a></p>

<p id="%C2%A0%E5%AE%89%E8%A3%85-toc" style="margin-left:0px;"><a href="#%C2%A0%E5%AE%89%E8%A3%85"> 安装</a></p>

<p id="%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E5%BA%93-toc" style="margin-left:40px;"><a href="#%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E5%BA%93">选择数据库</a></p>

<p id="%E4%B8%8B%E8%BD%BDocdown-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E8%BD%BDocdown">下载ocdown</a></p>

<p id="%E9%85%8D%E7%BD%AEaira2c-toc" style="margin-left:0px;"><a href="#%E9%85%8D%E7%BD%AEaira2c">配置aira2c</a></p>

<p id="%E5%AE%89%E8%A3%85onlyoffice-toc" style="margin-left:0px;"><a href="#%E5%AE%89%E8%A3%85onlyoffice">安装onlyoffice</a></p>

<p id="%E6%8F%92%E4%BB%B6%E5%AE%89%E8%A3%85-toc" style="margin-left:40px;"><a href="#%E6%8F%92%E4%BB%B6%E5%AE%89%E8%A3%85">插件安装</a></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E7%9B%AE%E5%89%8D%E5%87%BA%E7%8E%B0%E7%9A%84%E9%97%AE%E9%A2%98%EF%BC%88%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E7%9B%AE%E5%89%8D%E5%87%BA%E7%8E%B0%E7%9A%84%E9%97%AE%E9%A2%98%EF%BC%88%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0%EF%BC%89">目前出现的问题（持续更新）</a></p>

<p id="%E6%97%A0%E6%B3%95%E5%88%A0%E9%99%A4%E5%92%8C%E7%A7%BB%E5%8A%A8%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E6%97%A0%E6%B3%95%E5%88%A0%E9%99%A4%E5%92%8C%E7%A7%BB%E5%8A%A8%E6%96%87%E4%BB%B6">无法删除和移动文件</a></p>

<p id="%E7%89%B9%E5%88%AB%E6%84%9F%E8%B0%A2-toc" style="margin-left:0px;"><a href="#%E7%89%B9%E5%88%AB%E6%84%9F%E8%B0%A2">特别感谢</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<h2 id="%E4%BB%80%E4%B9%88%E6%98%AF%E5%AE%9D%E5%A1%94">什么是宝塔</h2>

<blockquote>
<p>宝塔是一款用于 Linux 服务器管理的开源面板软件，其提供了网站管理、数据库管理、FTP管理、SSL证书申请等功能，可以方便地进行服务器管理和网站运营。它支持多语言界面，易于安装和使用，受到了广大开发者和网站管理员的喜爱。</p>
</blockquote>

<p>尽管宝塔相比于其他一些方式建站占用的空间和cpu资源会比较大</p>

<p>但是其简单的部署方式和一体化的管理十分方便后续管理和拓展</p>

<h2 id="%E4%BB%80%E4%B9%88%E6%98%AFnextcloud">什么是nextcloud</h2>

<blockquote>
<p>Nextcloud是一种开源的云存储平台，它可以让你在自己的服务器上存储、同步和分享文件、日历、联系人等信息。它提供了类似于Google Drive和Dropbox的功能，但你完全掌控你自己的数据。你可以在你的服务器上安装Nextcloud，或者使用Nextcloud提供的托管服务。</p>
</blockquote>

<p>宝塔下载完成现在可以搭建一个自己的网盘</p>

<h2 id="%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E7%94%A8docker%E6%9D%A5%E5%AE%89%E8%A3%85nextcloud">为什么不用docker来安装nextcloud</h2>

<p>之前用过可道云的云盘，那个桌面和文档流畅度确实好用不过内网上传速度10m/s下载速度40m/s,而且上传文件时的cpu占用率特别特别高。</p>

<p></p>

<p></p>

<p></p>

<p><strong><span style="color:#fe2c24;">（2023年5月30日更新！！！）博主搞清楚原因了，现在如果使用的人不超过10个，比较推荐可道云，安装好后参考下面教程</span></strong></p>

<p><span style="color:#fe2c24;"><a class="link-info has-card" data-link-icon="/image/afc75ef7a19515ef99afd7110f014acd.png" data-link-title="可道云优化下载速度和性能教程" href="https://blog.csdn.net/mumuemhaha/article/details/130956982?spm=1001.2014.3001.5502" title="可道云优化下载速度和性能教程"><span class="link-card-box"><span class="link-title">可道云优化下载速度和性能教程</span><span class="link-link"><img class="link-link-icon" src="/image/afc75ef7a19515ef99afd7110f014acd.png" alt="icon-default.png?t=N4P3" />https://blog.csdn.net/mumuemhaha/article/details/130956982?spm=1001.2014.3001.5502</span></span></a></span></p>

<p></p>

<p></p>

<p>nextcloud可以用docker来部署，但是docker中部署的话如果要用到数据库会比较麻烦，之前废了好大的劲部署好结果一个重启直接干废了，网站直接报错。就放弃了</p>

<p></p>

<p>相反宝塔可以非常方便的部署数据库和管理数据库（不过好像docker部署的nextcloud本地上传速度有40m/s，而宝塔部署的只有20m/s不到的速度，不知道是不是宝塔限制了网速反正我调了但还是比较满）</p>

<p></p>

<h1 id="%E4%B8%8B%E8%BD%BD">下载</h1>

<h2 id="%E7%89%88%E6%9C%AC%E9%80%89%E6%8B%A9%E5%92%8C%E4%B8%8B%E8%BD%BD%E9%93%BE%E6%8E%A5">版本选择和下载链接</h2>

<p>首先下载好网站文件<a class="link-info" data-link-icon="/image/afc75ef7a19515ef99afd7110f014acd.png" data-link-title=" 下载链接" href="https://download.nextcloud.com/server/releases/" title=" 下载链接"> 下载链接</a></p>

<p></p>

<p>选择一个版本，不要太新了，不然安装的插件可能会报错，也不要太老了，原因同上。</p>

<p></p>

<p>然后就是一样安装网站的步骤，下载上传解压，然后最后设置端口和域名。</p>

<p></p>

<p><span style="color:#ff9900;">需要注意的是不同版本的nextcloud需要的php可能不会一样不过问题不大，下载发现出错。就下载相应的php版本然后记得调回相应的php就行</span></p>

<p></p>

<p><img alt="" height="955" src="/image/6fcb10305eebff7964676e8ad5cd560e.png" width="976" /></p>

<p></p>

<h2 id="%E5%B0%8F%E6%8F%90%E7%A4%BA">小提示</h2>

<p>记得把防跨站攻击关了，以防报错</p>

<p><img alt="" height="952" src="/image/389ac124ab32330886a2763e3c91f1b5.png" width="961" /></p>

<p></p>

<p></p>

<h1 id="%C2%A0%E5%AE%89%E8%A3%85"> 安装</h1>

<p>这里没有图片借用一下这个博主的图片        <a class="link-info" data-link-icon="/image/afc75ef7a19515ef99afd7110f014acd.png" data-link-title="乐乐呀168" href="https://blog.csdn.net/qq_43009710/article/details/105038413?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522168518440616800186546108%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&amp;request_id=168518440616800186546108&amp;biz_id=0&amp;utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-3-105038413-null-null.142%5Ev88%5Econtrol,239%5Ev2%5Einsert_chatgpt&amp;utm_term=nextcloud%E5%AE%9D%E5%A1%94&amp;spm=1018.2226.3001.4187" title="乐乐呀168">乐乐呀168</a></p>

<p>（侵删）</p>

<p><img alt="" height="686" src="/image/c6ce7a6563634995ff4382f8bbc57011.png" width="771" /></p>

<p></p>

<h2 id="%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E5%BA%93">选择数据库</h2>

<p>如果要多用户使用的话还是强烈推荐选择MYSQL的数据库</p>

<p></p>

<p>但是如果单独几个人使用的话差别也不是很大</p>

<p></p>

<p>有人会觉得那这样的话docker和宝塔部署不就一样了？docker还会更方便。</p>

<p>但是docker管理文件会比较麻烦尤其是云盘类文件管理会比较简单</p>

<p></p>

<p>数据库的账号密码就输之前创建的</p>

<p></p>

<h1 id="%E4%B8%8B%E8%BD%BDocdown">下载ocdown</h1>

<p></p>

<p>然后就是下载插件</p>

<p><img alt="" height="992" src="/image/0e302bdb8a4e09dcb937a1b58d9b1d75.png" width="1200" /></p>

<p>搜索ocdownload</p>

<p><img alt="" height="992" src="/image/381a55175d6bba6b84510cb224dfaf8c.png" width="1200" /></p>

<p></p>

<p>然后下载【现在还是用不了了需要配置】</p>

<p></p>

<h1 id="%E9%85%8D%E7%BD%AEaira2c">配置aira2c</h1>

<p></p>

<p>打开登录ssh下载（这里是debian其他的类推）</p>

<pre>
<code class="language-bash">apt-get install aria2</code></pre>

<p></p>

<p>创建配置文件目录并且赋予权限</p>

<pre>
<code class="language-bash">mkdir /etc/aria2</code></pre>

<pre>
<code class="language-bash">chmod 777 /etc/aria2</code></pre>

<p>创建配置文件</p>

<pre>
<code class="language-bash">touch /etc/aria2/aria2.conf</code></pre>

<pre>
<code class="language-bash">touch /etc/aria2/aria2.session</code></pre>

<pre>
<code class="language-bash">chmod 777 /etc/aria2/aria2.conf</code></pre>

<pre>
<code class="language-bash">nano /etc/aria2/aria2.conf</code></pre>

<p>复制黏贴就行</p>

<pre>
<code class="language-bash">#用户名

#rpc-user=user

#密码

#rpc-passwd=passwd

#上面的认证方式不建议使用,建议使用下面的token方式

#设置加密的密钥

#rpc-secret=token

#允许rpc

enable-rpc=true

#允许所有来源, web界面跨域权限需要

rpc-allow-origin-all=true

#允许外部访问，false的话只监听本地端口

rpc-listen-all=true

#RPC端口, 仅当默认端口被占用时修改

rpc-listen-port=6800

#最大同时下载数(任务数), 路由建议值: 3

max-concurrent-downloads=1000

#断点续传

continue=true

#同服务器连接数

max-connection-per-server=5

#最小文件分片大小, 下载线程数上限取决于能分出多少片, 对于小文件重要

min-split-size=10M

#单文件最大线程数, 路由建议值: 5

split=10

#从会话文件中读取下载任务
input-file=/etc/aria2/aria2.session

#在Aria2退出时保存错误的、未完成的下载任务到会话文件
save-session=/etc/aria2/aria2.session

#定时保存会话, 0为退出时才保存, 需1.16.1以上版本, 默认:0
save-session-interval=60

#下载速度限制

max-overall-download-limit=0

#单文件速度限制

max-download-limit=0

#上传速度限制

max-overall-upload-limit=0

#单文件速度限制

max-upload-limit=0

#断开速度过慢的连接

#lowest-speed-limit=0

#验证用，需要1.16.1之后的release版本

#referer=*

#文件保存路径, 默认为当前启动位置

dir=/data/downloads

#文件缓存, 使用内置的文件缓存, 如果你不相信Linux内核文件缓存和磁盘内置缓存时使用

#disk-cache=0

#另一种Linux文件缓存方式

#enable-mmap=true

#文件预分配, 能有效降低文件碎片, 提高磁盘性能. 缺点是预分配时间较长

file-allocation=prealloc

#最小做种时间, 分钟

seed-time=30

#bt服务器设置

#bt-tracker=
</code></pre>

<p></p>

<p>以“www”用户启动</p>

<pre>
<code class="language-bash">sudo -u www aria2c --conf-path=/etc/aria2/aria2.conf -D</code></pre>

<p>创建自启动文件</p>

<pre>
<code class="language-bash">touch /lib/systemd/system/aria2.service</code></pre>

<pre>
<code class="language-bash">nano /lib/systemd/system/aria2.service</code></pre>

<p>老规矩，复制黏贴</p>

<pre>
<code class="language-bash">[Unit]
Description=Aria2c download manager
Requires=network.target
After=dhcpcd.service

[Service]
Type=forking
User=root
RemainAfterExit=yes
ExecStart=/usr/bin/aria2c --conf-path=/etc/aria2/aria2.conf --daemon
ExecReload=/usr/bin/kill -HUP $MAINPID
RestartSec=1min
Restart=on-failure

[Install]
WantedBy=multi-user.target</code></pre>

<p>设置aria2服务开机自启动</p>

<pre>
<code class="language-bash">systemctl enable aria2</code></pre>

<pre>
<code class="language-bash">systemctl start aria2</code></pre>

<p>然后添加下载任务就可以了</p>

<h1 id="%E5%AE%89%E8%A3%85onlyoffice">安装onlyoffice</h1>

<h2 id="%E6%8F%92%E4%BB%B6%E5%AE%89%E8%A3%85">插件安装</h2>

<p>首先还是安装ocdownload的方法安装onlyoffice</p>

<p></p>

<p>一如既往的还是用不了（恼）</p>

<p></p>

<p>因为你自己还要部署一个本地的docker服务器来访问（还是逃不过docker（悲））</p>

<p></p>

<p><span style="color:#9c8ec1;">博客上的一些教程是安装老版本的onlyoffice，而新版onlyoffice新加了令牌机制导致每次重启令牌都会变，都要重新输入命令查看令牌很麻烦</span></p>

<p></p>

<p>但是可以在创建容器时固定密码</p>

<p></p>

<pre>
<code class="language-bash">sudo docker run -i -t -d -p 8044:80 --restart=always --name onlyoffice --env JWT_SECRET=123456 onlyoffice/documentserver </code></pre>

<p></p>

<blockquote>
<p>确保8044端口时开放的如果要改就把8044:80的8044改为你想要的端口，其中的JWT_SECRET=123456中的123456代表的是你的密码</p>
</blockquote>

<p>  </p>

<p>然后打开设置</p>

<p><img alt="" height="992" src="/image/27ee92d7886ea15cfcb2d63e3007fe79.png" width="1200" /></p>

<p></p>

<p></p>

<p> 下滑找到onlyoffice</p>

<p></p>

<p><img alt="" height="992" src="/image/1606b655819ffa5e73a0ebe875f5eb4a.png" width="1200" /></p>

<p></p>

<blockquote>
<p>这里如果你只是本地访问服务器的话那就填写你的“本地ip:8044”密码就写“123456”</p>
</blockquote>

<p>最后打开文档就会加载成功</p>

<p><span style="color:#ffd900;">（没有可道云的文档编辑好用，也没有他的流畅【迫真.jpg】）</span></p>

<h1></h1>

<h1 id="%E7%9B%AE%E5%89%8D%E5%87%BA%E7%8E%B0%E7%9A%84%E9%97%AE%E9%A2%98%EF%BC%88%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0%EF%BC%89">目前出现的问题（持续更新）</h1>

<h2 id="%E6%97%A0%E6%B3%95%E5%88%A0%E9%99%A4%E5%92%8C%E7%A7%BB%E5%8A%A8%E6%96%87%E4%BB%B6">无法删除和移动文件</h2>

<p><img alt="" height="992" src="/image/8848f6dc9efce36928f0a79216e108db.png" width="1200" /></p>

<blockquote>
<p>删除文件 "【酷漫V3】蜘蛛侠3.英雄无归.Spider-Man.No.Way.Home.2021.HD1080P.IMAX.h265.10bit.AAC.English.CHS-ENG.mp4" 时出错</p>
</blockquote>

<p><span style="color:#fe2c24;">原因是ocdownload下载的文件的权限是root的</span>，</p>

<p>www用户只允许下载，不允许删除和移动</p>

<p><img alt="" height="330" src="/image/6d00c9d815668f9d16f19a8edee81060.png" width="1200" /></p>

<p></p>

<p></p>

<h1 id="%E7%89%B9%E5%88%AB%E6%84%9F%E8%B0%A2">特别感谢</h1>

<p><a class="link-info" data-link-icon="/image/afc75ef7a19515ef99afd7110f014acd.png" data-link-title="参考文章" href="https://blog.csdn.net/zhouqi621/article/details/123974625" title="参考文章">参考文章</a></p>

<p><a class="link-info" data-link-icon="/image/afc75ef7a19515ef99afd7110f014acd.png" data-link-title="参考文章_1" href="https://blog.csdn.net/qq_43009710/article/details/105038413?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522168518440616800186546108%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&amp;request_id=168518440616800186546108&amp;biz_id=0&amp;utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-3-105038413-null-null.142%5Ev88%5Econtrol,239%5Ev2%5Einsert_chatgpt&amp;utm_term=nextcloud%E5%AE%9D%E5%A1%94&amp;spm=1018.2226.3001.4187" title="参考文章_1">参考文章_1</a></p>

<p><a class="link-info" data-link-icon="/image/afc75ef7a19515ef99afd7110f014acd.png" data-link-title="参考文章_2" href="https://blog.csdn.net/u011901825/article/details/127734273?ops_request_misc=&amp;request_id=&amp;biz_id=102&amp;utm_term=%E4%B8%BA%20OnlyOffice%20%E8%AE%BE%E7%BD%AE%E5%AF%86%E9%92%A5&amp;utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-3-127734273.142%5Ev88%5Econtrol,239%5Ev2%5Einsert_chatgpt&amp;spm=1018.2226.3001.4187" title="参考文章_2">参考文章_2</a></p>
