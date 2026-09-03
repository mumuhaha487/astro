---
title: armbian的换源
published: 2023-04-23
tags: [debian,linux,腾讯云]
category: 宝塔
---

<!--more-->

<p>安装好armbian和众多Linux一样，最重要的就是把原来的官方源给替换掉，换成国内的源，当然个人建议还是把官方的源备份一下以防出错。</p>

<pre>
<code>cp /etc/apt/sources.list /etc/apt/sources.list.backage</code></pre>

<p>打开源文件文本</p>

<pre>
<code>nano /etc/apt/sources.list</code></pre>

<p>这里是各个国内源。不用全复制，挑一个就行，我用的是163源（网易源）</p>

<pre>
<code>163镜像站

deb http://mirrors.163.com/debian/ buster main non-free contrib
deb http://mirrors.163.com/debian/ buster-updates main non-free contrib
deb http://mirrors.163.com/debian/ buster-backports main non-free contrib
deb http://mirrors.163.com/debian-security/ buster/updates main non-free contrib

deb-src http://mirrors.163.com/debian/ buster main non-free contrib
deb-src http://mirrors.163.com/debian/ buster-updates main non-free contrib
deb-src http://mirrors.163.com/debian/ buster-backports main non-free contrib
deb-src http://mirrors.163.com/debian-security/ buster/updates main non-free contrib
华为云镜像站

deb https://mirrors.huaweicloud.com/debian/ buster main contrib non-free
deb https://mirrors.huaweicloud.com/debian/ buster-updates main contrib non-free
deb https://mirrors.huaweicloud.com/debian/ buster-backports main contrib non-free
deb https://mirrors.huaweicloud.com/debian-security/ buster/updates main contrib non-free

deb-src https://mirrors.huaweicloud.com/debian/ buster main contrib non-free
deb-src https://mirrors.huaweicloud.com/debian/ buster-updates main contrib non-free
deb-src https://mirrors.huaweicloud.com/debian/ buster-backports main contrib non-free
腾讯云镜像站

deb http://mirrors.cloud.tencent.com/debian/ buster main non-free contrib
deb http://mirrors.cloud.tencent.com/debian-security buster/updates main
deb http://mirrors.cloud.tencent.com/debian/ buster-updates main non-free contrib
deb http://mirrors.cloud.tencent.com/debian/ buster-backports main non-free contrib

deb-src http://mirrors.cloud.tencent.com/debian-security buster/updates main
deb-src http://mirrors.cloud.tencent.com/debian/ buster main non-free contrib
deb-src http://mirrors.cloud.tencent.com/debian/ buster-updates main non-free contrib
deb-src http://mirrors.cloud.tencent.com/debian/ buster-backports main non-free contrib
中科大镜像站

deb https://mirrors.ustc.edu.cn/debian/ buster main contrib non-free
deb https://mirrors.ustc.edu.cn/debian/ buster-updates main contrib non-free
deb https://mirrors.ustc.edu.cn/debian/ buster-backports main contrib non-free
deb https://mirrors.ustc.edu.cn/debian-security/ buster/updates main contrib non-free

deb-src https://mirrors.ustc.edu.cn/debian/ buster main contrib non-free
deb-src https://mirrors.ustc.edu.cn/debian/ buster-updates main contrib non-free
deb-src https://mirrors.ustc.edu.cn/debian/ buster-backports main contrib non-free
deb-src https://mirrors.ustc.edu.cn/debian-security/ buster/updates main contrib non-free
阿里云镜像站

deb http://mirrors.aliyun.com/debian/ buster main non-free contrib
deb http://mirrors.aliyun.com/debian-security buster/updates main
deb http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib

deb-src http://mirrors.aliyun.com/debian-security buster/updates main
deb-src http://mirrors.aliyun.com/debian/ buster main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
清华大学镜像站

deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security/ buster/updates main contrib non-free

deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security/ buster/updates main contrib non-free
兰州大学镜像站

deb http://mirror.lzu.edu.cn/debian stable main contrib non-free
deb http://mirror.lzu.edu.cn/debian stable-updates main contrib non-free
deb http://mirror.lzu.edu.cn/debian/ buster-backports main contrib non-free
deb http://mirror.lzu.edu.cn/debian-security/ buster/updates main contrib non-free

deb-src http://mirror.lzu.edu.cn/debian stable main contrib non-free
deb-src http://mirror.lzu.edu.cn/debian stable-updates main contrib non-free
deb-src http://mirror.lzu.edu.cn/debian/ buster-backports main contrib non-free
deb-src http://mirror.lzu.edu.cn/debian-security/ buster/updates main contrib non-free
上海交大镜像站

deb https://mirror.sjtu.edu.cn/debian/ buster main contrib non-free
deb https://mirror.sjtu.edu.cn/debian/ buster-updates main contrib non-free
deb https://mirror.sjtu.edu.cn/debian/ buster-backports main contrib non-free
deb https://mirror.sjtu.edu.cn/debian-security/ buster/updates main contrib non-free

deb-src https://mirror.sjtu.edu.cn/debian/ buster-updates main contrib non-free
deb-src https://mirror.sjtu.edu.cn/debian/ buster-backports main contrib non-free
deb-src https://mirror.sjtu.edu.cn/debian/ buster main contrib non-free
deb-src https://mirror.sjtu.edu.cn/debian-security/ buster/updates main contrib non-free</code></pre>

<p>恢复官方源时只需执行（前提是你备份了，或者直接百度armbian官方源进行替换就行了）</p>

<pre>
<code>rm /etc/apt/sources.list&amp;&amp;mv /etc/apt/sources.list.backage /etc/apt/sources.list</code></pre>

<p></p>
