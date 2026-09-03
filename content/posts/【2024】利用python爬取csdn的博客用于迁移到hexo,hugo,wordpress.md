---
title: 【2024】利用python爬取csdn的博客用于迁移到hexo,hugo,wordpress...
published: 2024-03-03
tags: [python,爬虫,网络爬虫,wordpress,hugo]
category: python
---

<!--more-->

<h1>前言</h1>

<p>博主根据前两篇博客进行改进和升级</p>

<p><a class="has-card" data-link-desc="文章浏览阅读955次，点赞6次，收藏19次。定义一个json配置文件方便管理现在文件只有用户名称,后续可加配置读取用户名称，并且将其拼接成csdn个人博客链接type=blog&quot;" data-link-title="利用python爬取本站的所有博客链接-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/136375650?spm=1001.2014.3001.5502" title="利用python爬取本站的所有博客链接-CSDN博客"><span class="link-card-box"><span class="link-title">利用python爬取本站的所有博客链接-CSDN博客</span><span class="link-desc">文章浏览阅读955次，点赞6次，收藏19次。定义一个json配置文件方便管理现在文件只有用户名称,后续可加配置读取用户名称，并且将其拼接成csdn个人博客链接type=blog"</span><span class="link-link"><img alt=""  />https://blog.csdn.net/mumuemhaha/article/details/136375650?spm=1001.2014.3001.5502</span></span></a><a class="has-card" data-link-desc="文章浏览阅读314次，点赞4次，收藏3次。在上一篇博客中我们介绍了如何爬取博客链接利用python爬取本站的所有博客链接-CSDN博客定义一个json配置文件方便管理现在文件只有用户名称,后续可加配置读取用户名称，并且将其拼接成csdn个人博客链接type=blog&quot;在这一篇博客中我们介绍如何爬取博客中文章的图片。" data-link-title="爬取博客的图片并且将它存储到响应的目录-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/136411444?spm=1001.2014.3001.5502" title="爬取博客的图片并且将它存储到响应的目录-CSDN博客"><span class="link-card-box"><span class="link-title">爬取博客的图片并且将它存储到响应的目录-CSDN博客</span><span class="link-desc">文章浏览阅读314次，点赞4次，收藏3次。在上一篇博客中我们介绍了如何爬取博客链接利用python爬取本站的所有博客链接-CSDN博客定义一个json配置文件方便管理现在文件只有用户名称,后续可加配置读取用户名称，并且将其拼接成csdn个人博客链接type=blog"在这一篇博客中我们介绍如何爬取博客中文章的图片。</span><span class="link-link"><img alt="" class="link-link-icon" />https://blog.csdn.net/mumuemhaha/article/details/136411444?spm=1001.2014.3001.5502</span></span></a></p>

<h1>链接</h1>

<h2>github链接</h2>

<p><a class="has-card" data-link-desc="Contribute to mumuhaha487/Get_csdn development by creating an account on GitHub." data-link-title="GitHub - mumuhaha487/Get_csdn" href="https://github.com/mumuhaha487/Get_csdn" title="GitHub - mumuhaha487/Get_csdn"><span class="link-card-box"><span class="link-title">GitHub - mumuhaha487/Get_csdn</span><span class="link-desc">Contribute to mumuhaha487/Get_csdn development by creating an account on GitHub.</span><span class="link-link"><img class="link-link-icon" alt="icon-default.png?t=N7T8" />https://github.com/mumuhaha487/Get_csdn</span></span></a></p>

<p><span style="color:#fe2c24;"><strong><span style="background-color:#ffd900;"> 可以的话点个star，球球勒</span></strong></span></p>

<h2>网盘链接</h2>

<p><a class="has-card" data-link-desc="123云盘为您提供csdn_tomd.zip最新版正式版官方版绿色版下载,csdn_tomd.zip安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装"  data-link-title="csdn_tomd.zip官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘" href="https://www.123pan.com/s/HrkuVv-dMgX.html" title="csdn_tomd.zip官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘"><span class="link-card-box"><span class="link-title">csdn_tomd.zip官方版下载丨最新版下载丨绿色版下载丨APP下载-123云盘</span><span class="link-desc">123云盘为您提供csdn_tomd.zip最新版正式版官方版绿色版下载,csdn_tomd.zip安卓版手机版apk免费下载安装到手机,支持电脑端一键快捷安装</span><span class="link-link"><img class="link-link-icon" alt="icon-default.png?t=N7T8" />https://www.123pan.com/s/HrkuVv-dMgX.html</span></span></a></p>

<h1>注意的事</h1>

<p>自己写的程序，看github</p>

<p>注意配置config.yaml文件</p>

<p>注意配置selenium（过段时间换一下）</p>

<p>同一时间多次爬取会有验证</p>

<p></p>
