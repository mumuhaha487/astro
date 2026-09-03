---
title: 玩客云安装好armbian5.9后后续安装宝塔7.x版本
published: 2023-04-22
tags: [linux,经验分享,笔记]
category: 宝塔
image: /image/d6b16bb46c973dea93c97c4c9e9cb9bf.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E4%B8%8B%E8%BD%BD%E8%84%9A%E6%9C%AC-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E8%BD%BD%E8%84%9A%E6%9C%AC">下载脚本</a></p>

<p id="%E5%8F%AF%E8%83%BD%E5%BE%97%E6%8A%A5%E9%94%99%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:0px;"><a href="#%E5%8F%AF%E8%83%BD%E5%BE%97%E6%8A%A5%E9%94%99%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">可能得报错以及解决办法</a></p>

<p id="%E6%9B%BF%E6%8D%A2%E5%AE%98%E6%96%B9%E6%BA%90-toc" style="margin-left:0px;"><a href="#%E6%9B%BF%E6%8D%A2%E5%AE%98%E6%96%B9%E6%BA%90">替换官方源</a></p>

<p id="%C2%A0%E4%BF%AE%E6%94%B9%E5%8C%BA%E6%97%B6%E9%97%B4-toc" style="margin-left:0px;"><a href="#%C2%A0%E4%BF%AE%E6%94%B9%E5%8C%BA%E6%97%B6%E9%97%B4"> 修改区时间</a></p>

<p id="%E6%8E%A5%E4%B8%8B%E7%9A%84%E6%AD%A5%E9%AA%A4-toc" style="margin-left:0px;"><a href="#%E6%8E%A5%E4%B8%8B%E7%9A%84%E6%AD%A5%E9%AA%A4">接下的步骤</a></p>

<p id="%E5%85%A8%E4%BF%AE%E5%A4%8D%E8%84%9A%E6%9C%AC-toc" style="margin-left:0px;"><a href="#%E5%85%A8%E4%BF%AE%E5%A4%8D%E8%84%9A%E6%9C%AC">全修复脚本</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>在通过烧录u盘安装好armbian后如果新手要搭建网站的话就要安装宝塔面板了</p>

<p>但是因为armbian版本是32位的，因为CPU是s805是32位的，虽然可以安装宝塔最后一个32位的5.9的版本，但是有很多的配置如Nginx好像安装失败</p>

<h1 id="%E4%B8%8B%E8%BD%BD%E8%84%9A%E6%9C%AC">下载脚本</h1>

<p>而常规去官网上下载安装脚本就会出错</p>

<p>所以就要改一下官网下载的脚本这里下载<a class="link-info" data-link-title="链接下载" href="https://www.123pan.com/s/HrkuVv-cZJX.html" title="链接下载">链接下载</a></p>

<p>下好后用xftp来链接你本地的ip地址然后传输到/root目录下（也可以传输到其他目录，方便起见还是传到/root）</p>

<p></p>

<h1 id="%E5%8F%AF%E8%83%BD%E5%BE%97%E6%8A%A5%E9%94%99%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">可能得报错以及解决办法</h1>

<p>可能会提示无法访问从xftp中打开xshell</p>

<p></p>

<p><img alt="" height="888" src="/image/d6b16bb46c973dea93c97c4c9e9cb9bf.png" width="1200" /></p>

<p>输入sudo -i，然后输入你的root密码</p>

<p>再输入</p>

<pre>
<code>chmod 777 /root</code></pre>

<p>给予访问/root的权限</p>

<p>就可以访问/root文件夹了</p>

<p>然后在此之前还要配置一下其他的文件</p>

<h1 id="%E6%9B%BF%E6%8D%A2%E5%AE%98%E6%96%B9%E6%BA%90">替换官方源</h1>

<p>打开源文件替换源</p>

<pre>
<code>nano /etc/apt/sources.list</code></pre>

<p> nano没安装的去安装</p>

<pre>
<code>deb https://mirrors.ustc.edu.cn/debian buster main contrib non-free
deb https://mirrors.ustc.edu.cn/debian buster-updates main contrib non-free
deb https://mirrors.ustc.edu.cn/debian buster-backports main contrib non-free
deb https://mirrors.ustc.edu.cn/debian-security/ buster/updates main contribnon-free</code></pre>

<h1 id="%C2%A0%E4%BF%AE%E6%94%B9%E5%8C%BA%E6%97%B6%E9%97%B4"> 修改区时间</h1>

<p> 之后修改区时间</p>

<pre>
<code>nano /etc/apt/sources.list.d/raspi.list</code></pre>

<pre>
<code>deb http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ buster main ui
deb-src http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/buster main ui</code></pre>

<p>更新一下</p>

<pre>
<code>apt-get update</code></pre>

<p>好了之后直接执行安装脚本</p>

<pre>
<code>./77.sh</code></pre>

<p>这时候都会报错，然后接下来继续跟着走</p>

<h1 id="%E6%8E%A5%E4%B8%8B%E7%9A%84%E6%AD%A5%E9%AA%A4">接下的步骤</h1>

<p>再下载文件导入<a class="link-info" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.2.5/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N3I4" data-link-title="链接下载" href="https://www.123pan.com/s/HrkuVv-eZJX.html" title="链接下载">链接下载</a></p>

<p>到/root</p>

<p>ssh中执行</p>

<pre>
<code>btpip install gevent==21.12.0
btpip install psutil==5.8.0
btpip install --upgrade pip
btpip install --upgrade Pillow
btpip install gevent-websocket==0.10.1
btpip install pycryptodome-3.14.1-cp35-abi3-linux_armv7l.whl
btpip install cryptography==3.2
btpip install pyOpenSSL==20.0.0
btpip install Flask==1.1.4
btpip install requests==2.26.0
bt 1</code></pre>

<p>然后看看bt 1 后面会不会报错或者直接输入</p>

<pre>
<code>bt 14</code></pre>

<p>查看内网面板链接可不可以进入</p>

<h1 id="%E5%85%A8%E4%BF%AE%E5%A4%8D%E8%84%9A%E6%9C%AC">全修复脚本</h1>

<p>不能的话执行下列命令</p>

<pre>
<code>btpip install aliyun-python-sdk-core==2.13.35
btpip install aliyun-python-sdk-core-v3==2.13.32
btpip install aliyun-python-sdk-kms==2.15.0
btpip install bcrypt==3.1.7
btpip install beautifulsoup4==4.8.2
btpip install cachetools==4.0.0
btpip install certifi==2019.11.28
btpip install cffi==1.15.0
btpip install chardet==3.0.4
btpip install Click==8.1.2
btpip install configobj==5.0.6
btpip install configparser==4.0.2
btpip install cos-python-sdk-v5==1.9.14
btpip install crcmod==1.7
btpip install cryptography==3.2
btpip install Cython==0.29.26
btpip install decorator==4.4.1
btpip install dicttoxml==1.7.4
btpip install dnspython==1.16.0
btpip install docker==4.2.0
btpip install enum34==1.1.9
btpip install Flask==2.1.1
btpip install Flask-Session==0.4.0
btpip install Flask-SQLAlchemy==2.5.1
btpip install future==0.18.2
btpip install gevent==21.12.0
btpip install gevent-websocket==0.10.1
btpip install google-api-core==2.3.2
btpip install google-api-python-client==2.33.0
btpip install google-auth==2.3.3
btpip install google-auth-httplib2==0.1.0
btpip install google-auth-oauthlib==0.4.6
btpip install google-cloud-core==2.2.1
btpip install google-cloud-storage==1.43.0
btpip install google-resumable-media==2.1.0
btpip install googleapis-common-protos==1.54.0
btpip install greenlet==1.1.2
btpip install httplib2==0.20.2
btpip install idna==2.8
btpip install iniparse==0.5
btpip install ipaddress==1.0.23
btpip install IPy==1.0
btpip install itsdangerous==2.1.2
btpip install Jinja2==3.1.1
btpip install jmespath==0.9.4
btpip install kitchen==1.2.6
btpip install MarkupSafe==2.1.1
btpip install mongo==0.2.0
btpip install oauthlib==3.1.1
btpip install oss2==2.15.0
btpip install paramiko==2.8.1
btpip install peewee==3.13.1
btpip install Pillow==8.4.0
btpip install protobuf==3.19.1
btpip install psutil==5.9.0
btpip install pyasn1==0.4.8
btpip install pyasn1-modules==0.2.8
btpip install pycparser==2.19
btpip install pycryptodome==3.14.1
btpip install Pygments==2.7.4
btpip install pyinotify==0.9.6
btpip install pymongo==3.10.1
btpip install PyMySQL==1.0.2
btpip install PyNaCl==1.4.0
btpip install pyOpenSSL==20.0.0
btpip install pyparsing==2.4.6
btpip install pyPdf==1.13
btpip install PySocks==1.7.1
btpip install pytz==2019.3
btpip install pyudev==0.22.0
btpip install pyxattr==0.7.1
btpip install PyYAML==5.4
btpip install qiniu==7.5.0
btpip install qrcode==7.3.1
btpip install redis==4.0.2
btpip install requests==2.26.0
btpip install requests-file==1.5.1
btpip install requests-oauthlib==1.3.0
btpip install rsa==4.8
btpip install six==1.16.0
btpip install soupsieve==1.9.5
btpip install SQLAlchemy==1.4.28
btpip install supervisor==4.2.2
btpip install upyun==2.5.5
btpip install uritemplate==3.0.1
btpip install urlgrabber==4.1.0
btpip install urllib3==1.26.7
btpip install websocket-client==1.2.3
btpip install Werkzeug==2.1.1
</code></pre>

<p>跑完要好久的时间，慢慢等</p>

<p>接下重启</p>

<pre>
<code>reboot</code></pre>

<p>输入</p>

<pre>
<code>bt 1
bt 14</code></pre>

<p>或者输入bt后输入序号就行了</p>

<p>推荐安装Nginx 1.18</p>

<p>Mysql 5.5</p>

<p>PHP 7.2 </p>

<p></p>
