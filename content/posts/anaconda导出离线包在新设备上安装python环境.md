---
title: anaconda导出离线包在新设备上安装python环境
published: 2023-05-18
tags: [python,pycharm,pandas,numpy,matplotlib]
category: python
image: /image/f999934c30817f3ebac6b00b1197a08e.png
---

<!--more-->

<p><em>前不久在学校做项目的时候用学校的电脑，但是学校的python环境需要配置，不巧的是学校网络不好而且每次开机都会重置电脑，所以我萌生出要做一个离线包拷贝到u盘里随插随用。</em></p>

<p><span style="color:#ffd900;">（虽然pycharm做项目可以保存环境，但是我导入到新版本的pycharm就失效了不知道是不是因为版本的问题）</span></p>

<p>正好我自己的电脑上有anaconda的环境我只要把他导入出来就行了</p>

<p>先进入搭建出来的环境(env_name为你搭建环境的名称 ）</p>

<pre>
<code>activate env_name</code></pre>

<p>然后导入配置的环境的列表</p>

<pre>
<code>pip freeze &gt; requirement.txt</code></pre>

<p>最后</p>

<p>在你的u盘目录上输入cmd</p>

<p><img alt="" height="865" src="/image/f999934c30817f3ebac6b00b1197a08e.png" width="1200" /></p>

<p></p>

<p>输入</p>

<pre>
<code>pip download -d  ./libs  -r requirement.txt </code></pre>

<p>把文件保存在你新建的lib目录下</p>

<p>如果报错的换就换个源</p>

<pre>
<code>pip download -d  ./libs  -r requirement.txt  -i  https://pypi.douban.com/simple</code></pre>

<p>如果要在新电脑上加载你的安装源的话</p>

<p>就加入代码</p>

<pre>
<code>pip isntall 包名</code></pre>

<p> <img alt="" height="911" src="/image/b347a9dd412e2c1577d45d432c5c1671.png" width="1200" /></p>

<p>或者把他粘贴到pycahrm的env目录下的Scripts也行</p>

<p><img alt="" height="911" src="/image/746037bb9a8af9b584cb5912f42c2b9b.png" width="1200" /></p>

<p>多谢这位大佬给我启发：</p>

<p> <a data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.2.8/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N4HB" data-link-title="参考文章" href="https://blog.csdn.net/weixin_45348389/article/details/119040106" title="参考文章">参考文章</a></p>
