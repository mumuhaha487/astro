---
title: Wordpress博客在做内网穿透时候输入网址后面会带端口号的解决办法
published: 2023-07-08
tags: [运维,ssh]
category: 宝塔
---

<!--more-->

<p>在我输入域名是会跳转到我在内网映射的端口，这时候就要忽略端口号</p>

<p>解决办法</p>

<p>在网站的目录下的wp-config.php文件下末尾输入下面的内容</p>

<pre>
<code class="language-php">define('WP_SITEURL', 'http://' . $_SERVER['HTTP_HOST']);
define('WP_HOME', 'http://' . $_SERVER['HTTP_HOST']);</code></pre>

<p></p>
