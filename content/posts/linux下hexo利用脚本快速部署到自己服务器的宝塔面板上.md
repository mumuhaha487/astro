---
title: linux下hexo利用脚本快速部署到自己服务器的宝塔面板上
published: 2023-06-26
tags: [服务器,php,运维]
category: 宝塔
image: /image/d12e8c6bd6fe045a7d87e798b322be3e.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E6%AD%A5%E9%AA%A4%E4%B8%80-toc" style="margin-left:40px;"><a href="#%E6%AD%A5%E9%AA%A4%E4%B8%80">步骤一</a></p>

<p id="%E6%AD%A5%E9%AA%A4%E4%BA%8C-toc" style="margin-left:40px;"><a href="#%E6%AD%A5%E9%AA%A4%E4%BA%8C">步骤二</a></p>

<p id="%E6%AD%A5%E9%AA%A4%E4%B8%89-toc" style="margin-left:40px;"><a href="#%E6%AD%A5%E9%AA%A4%E4%B8%89">步骤三</a></p>

<p id="%E6%AD%A5%E9%AA%A4%E5%9B%9B-toc" style="margin-left:40px;"><a href="#%E6%AD%A5%E9%AA%A4%E5%9B%9B">步骤四</a></p>

<p id="%E6%AD%A5%E9%AA%A4%E4%BA%94-toc" style="margin-left:40px;"><a href="#%E6%AD%A5%E9%AA%A4%E4%BA%94">步骤五</a></p>

<p id="%E6%AD%A5%E9%AA%A4%E5%85%AD-toc" style="margin-left:40px;"><a href="#%E6%AD%A5%E9%AA%A4%E5%85%AD">步骤六</a></p>

<hr id="hr-toc" /><p></p>

<p></p>

<p>用处</p>

<p>用于不想把hexo部署在GitHub（因为网络问题）从而部署到自己的服务器上</p>

<h2 id="%E6%AD%A5%E9%AA%A4%E4%B8%80">步骤一</h2>

<p>宝塔先创建一个网站</p>

<p><img alt="" height="644" src="/image/d12e8c6bd6fe045a7d87e798b322be3e.png" width="786" /></p>

<p></p>

<blockquote>
<p>因为hexo是纯静态的，所以记得改php版本</p>
</blockquote>

<h2 id="%E6%AD%A5%E9%AA%A4%E4%BA%8C">步骤二</h2>

<p>在 <span style="background-color:#ed7976;">/usr/local/bin/</span>目录下创建脚本</p>

<p>hexo_qy.sh</p>

<pre>
<code class="language-bash">nano /usr/local/bin/hexo_qy.sh</code></pre>

<p></p>

<p>写入如下命令</p>

<pre>
<code class="language-bash">cd /你在linux中hexo博客的目录/
hexo clean
hexo g
rm -rf 你创建的宝塔网站的文件目录（此命令用于删除文件）+  ”*“(注意”*“号不能掉）  
cp -r /你在linux中hexo博客的目录/ /你在linux中hexo博客的目录/+”*“(注意”*“号不能掉）
</code></pre>

<h2 id="%E6%AD%A5%E9%AA%A4%E4%B8%89">步骤三</h2>

<p>给予其权限</p>

<pre>
<code class="language-bash">chmod 777 /usr/local/bin/hexo_qy.sh</code></pre>

<h2 id="%E6%AD%A5%E9%AA%A4%E5%9B%9B">步骤四</h2>

<p>运行一下看看是否成功</p>

<pre>
<code class="language-bash">/usr/local/bin/hexo_qy.sh</code></pre>

<h2 id="%E6%AD%A5%E9%AA%A4%E4%BA%94">步骤五</h2>

<p>修改名称加入环境变量并且删除.sh文件</p>

<pre>
<code class="language-bash">cp /usr/local/bin/hexo_qy.sh /usr/local/bin/hexo_qy &amp;&amp; rm /usr/local/bin/hexo_qy.sh</code></pre>

<p>给予其权限</p>

<pre>
<code class="language-bash">chmod 777 /usr/local/bin/hexo_qy</code></pre>

<h2 id="%E6%AD%A5%E9%AA%A4%E5%85%AD">步骤六</h2>

<p>查看是否成功</p>

<p>在/root目录下输入</p>

<pre>
<code class="language-bash">hexo_qy</code></pre>

<p>查看是否把hexo的文件迁移到宝塔文件目录下了</p>

<p></p>
