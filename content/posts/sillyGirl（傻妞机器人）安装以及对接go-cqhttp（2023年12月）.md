---
title: sillyGirl（傻妞机器人）安装以及对接go-cqhttp（2023年12月）
published: 2023-12-13
tags: [机器人,linux,ubuntu,node.js,github]
category: 宝塔
image: /image/icon-default.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E7%BC%96%E5%86%99%E7%9A%84%E5%8E%9F%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E7%BC%96%E5%86%99%E7%9A%84%E5%8E%9F%E5%9B%A0">编写的原因</a></p>

<p id="%E4%B8%8B%E8%BD%BD%E5%82%BB%E5%A6%9E-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E8%BD%BD%E5%82%BB%E5%A6%9E">下载傻妞</a></p>

<p id="%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%EF%BC%81%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%EF%BC%81%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81">注意！！注意！！！注意！！！！</a></p>

<p id="%E5%90%8C%E6%A0%B7%E7%9A%84%E4%B8%8B%E8%BD%BDgo-cqhttp-toc" style="margin-left:0px;"><a href="#%E5%90%8C%E6%A0%B7%E7%9A%84%E4%B8%8B%E8%BD%BDgo-cqhttp">同样的下载go-cqhttp</a></p>

<p id="%E5%AE%89%E8%A3%85%E4%BB%A5%E5%8F%8A%E9%85%8D%E7%BD%AE%C2%A0go-cqhttp-toc" style="margin-left:0px;"><a href="#%E5%AE%89%E8%A3%85%E4%BB%A5%E5%8F%8A%E9%85%8D%E7%BD%AE%C2%A0go-cqhttp">安装以及配置 go-cqhttp</a></p>

<p id="%E4%B8%8B%E8%BD%BDscreen-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E8%BD%BDscreen">下载screen</a></p>

<p id="%E5%88%9B%E5%BB%BAgo-cqhttp%E7%AA%97%E5%8F%A3-toc" style="margin-left:40px;"><a href="#%E5%88%9B%E5%BB%BAgo-cqhttp%E7%AA%97%E5%8F%A3">创建go-cqhttp窗口</a></p>

<p id="%E5%88%9B%E5%BB%BAsillyGirl%E7%AA%97%E5%8F%A3-toc" style="margin-left:40px;"><a href="#%E5%88%9B%E5%BB%BAsillyGirl%E7%AA%97%E5%8F%A3">创建sillyGirl窗口</a></p>

<p id="%E5%B8%B8%E8%A7%81%E9%94%99%E8%AF%AF-toc" style="margin-left:0px;"><a href="#%E5%B8%B8%E8%A7%81%E9%94%99%E8%AF%AF">常见错误</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E7%BC%96%E5%86%99%E7%9A%84%E5%8E%9F%E5%9B%A0">编写的原因</h1>

<p>暑假的时候安装教程安装过傻妞机器人，但是最近安装的时候发现出了问题，结果一看傻妞的版本好像更新了而且对接QQ的方法不一样了，一看csdn没有教程，那我就自己摸索终于搞出来了</p>

<h1 id="%E4%B8%8B%E8%BD%BD%E5%82%BB%E5%A6%9E">下载傻妞</h1>

<p>废话不多说</p>

<p>首先创建一个文件夹名字随意，创建的文件夹名称是sillyGirl</p>

<pre>
<code class="language-cpp">mkdir /root/sillyGirl</code></pre>

<p>然后下载傻妞的源文件，由于github半墙，下载困难，我这里直接给出分享连接了，可以的话还是去github上下载支持作者，但是好像作者的博客删了QAQ</p>

<p><a class="link-info" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.6/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N7T8" data-link-title="傻妞下载链接" href="https://www.123pan.com/s/HrkuVv-kpwX.html" title="傻妞下载链接">傻妞下载链接</a></p>

<p>注意一下，<span style="color:#ffd900;"><strong><span style="background-color:#fe2c24;">给出的下载链接的配置环境为x86_64架构的linux系统</span></strong></span>，如果其他的系统环境要另外的去下载，由于wget不支持断点续传（maybe）所以建议在自己的windows上下载好然后传给linux的/root/sillyGirl上面（如果你创建了文件夹的话）。</p>

<p>之后进入文件夹</p>

<pre>
<code class="language-bash">cd /root/sillyGirl</code></pre>

<p> 给予权限并且运行可执行文件</p>

<pre>
<code class="language-bash">chmod 777 sillyGirl
./sillyGirl</code></pre>

<p> 之后进入网页后台</p>

<p><span style="color:#fe2c24;"><strong><span style="background-color:#ffd900;">http://你linux服务器端的ip:8080</span></strong></span></p>

<h1 id="%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%EF%BC%81%E6%B3%A8%E6%84%8F%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81">注意！！注意！！！注意！！！！</h1>

<p>傻妞机器人更新之后不支持OnebotV11协议标准机器人的反向wesocket的方式接入</p>

<p>需要在插件商城中下载</p>

<p>搜索<strong><span style="color:#fe2c24;"><span style="background-color:#ffd900;">OnebotV11(原内置QQ)</span></span></strong></p>

<p><span><span>或者直接搜索QQ也行</span></span></p>

<p><span><span>下载好后才可以进行对接</span></span></p>

<h1 id="%E5%90%8C%E6%A0%B7%E7%9A%84%E4%B8%8B%E8%BD%BDgo-cqhttp">同样的下载go-cqhttp</h1>

<p>也是一样的方法——在windows下的github上下载文件然后传到linux上面</p>

<p><a class="link-info" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.6/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N7T8" data-link-title="go-cqhttp下载链接" href="https://github.com/Mrs4s/go-cqhttp/releases" title="go-cqhttp下载链接">go-cqhttp下载链接</a></p>

<p>里面有如下文件</p>

<p>顺便教大家看看github下如何安装你操作系统适配的安装包</p>

<p><img alt="" height="1030" src="/image/b259a7b555588c51cbe315f15b781c1d.png" width="1200" /></p>

<h1 id="%E5%AE%89%E8%A3%85%E4%BB%A5%E5%8F%8A%E9%85%8D%E7%BD%AE%C2%A0go-cqhttp">安装以及配置 go-cqhttp</h1>

<p>处理器和操作系统是什么型号就下载什么型号（或者下载tar.gz然后解压进入文件夹运行也行，这个目前不展开说），我的是ubuntu系统进入安装包的目录直接安装就行</p>

<pre>
<code class="language-bash">dpkg -i 安装包名称</code></pre>

<p>这样就安装好了然后运行</p>

<pre>
<code class="language-bash">go-cqhttp</code></pre>

<p>会出现这样的截图</p>

<p><img alt="" height="702" src="/image/0385de24bdfc28d5ee7b79a82af8c8ab.png" width="1200" /></p>

<p> 选择3——反向 Websocket 通信</p>

<p><img alt="" height="702" src="/image/6d77f8bd6cdb552b5847e06da43d02c2.png" width="1200" /></p>

<p>然后按回车放回之后进入配置文件</p>

<pre>
<code class="language-bash">nano config.yml 
</code></pre>

<p> 我的建议是扫码登录修改这个参数</p>

<p><img alt="" height="702" src="/image/9c7ef4148b2014faf61907fef787d279.png" width="1200" /></p>

<p>修改这个这个为你的代理服务器</p>

<p><img alt="" height="702" src="/image/294236da04bdc9b44024532b853258cc.png" width="1200" /> </p>

<pre>
<code class="language-bash">ws://127.0.0.1:8080/bot/onebotv11</code></pre>

<p>这里的8080端口为你的傻妞机器人的默认端口，如果换了端口记得把这个8080换了</p>

<h1 id="%E4%B8%8B%E8%BD%BDscreen">下载screen</h1>

<p>由于运行傻妞机器人和go-cqhttp的时候会独占整个窗口并且当ssh退出时（不是用ssh链接而是用vnc桌面连接的随意QAQ），任务也会停止。所以要用screen相当于后台新开一个屏幕运行这两个程序。</p>

<p>我用的是ubuntu/debian不同操作系统之间的安装命令可能会不一样（可以百度一下）</p>

<pre>
<code class="language-bash">apt-get install screen</code></pre>

<p>然后接下来就是screen的命令</p>

<blockquote>
<p>screen -S 窗口名称        //新建一个窗口</p>

<p>screen -x 窗口名称        //跳转到相应的窗口</p>

<p>screen -ls        //列出所有的窗口名字以及状态</p>

<p>ctrl+a+d是跳出当前窗口</p>
</blockquote>

<h2 id="%E5%88%9B%E5%BB%BAgo-cqhttp%E7%AA%97%E5%8F%A3">创建go-cqhttp窗口</h2>

<p>那我们先要创建一个窗口用来运行go-cqhttp</p>

<pre>
<code class="language-bash">screen -S go-cqhttp</code></pre>

<p>然后运行go-cqhttp</p>

<pre>
<code class="language-bash">go-cqhttp</code></pre>

<p>ctrl+a+d跳出</p>

<h2 id="%E5%88%9B%E5%BB%BAsillyGirl%E7%AA%97%E5%8F%A3">创建sillyGirl窗口</h2>

<p>接下来创建一个窗口sillyGirl</p>

<pre>
<code class="language-bash">screen -S sillyGirl</code></pre>

<p>进入/root/sillyGirl目录下运行sillyGirl</p>

<pre>
<code class="language-bash">cd /root/sillyGirl
./sillyGirl</code></pre>

<p>ctrl+a+d跳出</p>

<p>如果没出意外的话应该就可以对接成功了</p>

<h1 id="%E5%B8%B8%E8%A7%81%E9%94%99%E8%AF%AF">常见错误</h1>

<p>go-cqhttp登录失败，账号不安全又或者是其他的原因导致的账号登陆失败</p>

<p>原因应该就是账号风控（不安全</p>

<p>可以通过修改登录设备类型来改变，这里修改的时用安卓手表协议登录</p>

<p>方法如下</p>

<p>更改device.json文件（与config.yml同一目录下）修改protocol为2</p>

<p><img alt="" height="702" src="/image/edfd09de21027dc71f3cc4a40fc0f21d.png" width="1200" /></p>

<p> </p>
