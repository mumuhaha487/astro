---
title: 【已成功验证】debian/PVE安装好后拔显卡后连接不了网络（pve无显卡启动遇到的问题）
published: 2023-07-18
tags: [网络,pve,虚拟机,linux,debian]
category: 软件报错
image: /image/e77166ce1a0c6de46e649a3b200ded13.png
---

<!--more-->

<p><strong>目录</strong></p>

<p style="margin-left:0px"><a href="#%E5%89%8D%E5%9B%A0">前因</a></p>

<p style="margin-left:0px"><a href="#%E5%8E%9F%E5%9B%A0">原因</a></p>

<p style="margin-left:0px"><a href="#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">解决办法</a></p>

<p style="margin-left:0px"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<hr />
<p>需要主板bios支持跳过显卡自检！！！</p>

<p>需要主板bios支持跳过显卡自检！！！</p>

<p>需要主板bios支持跳过显卡自检！！！</p>

<p>无显卡开机需要解决的是主板以及操作系统的问题，这个教程解决的是操作系统配置问题而不是主板问题，如果主板不支持怎么搞都没用。</p>

<blockquote>
<p>有主板诊断卡的最好，如果没有可以想个办法证明没显卡也可以开机（比如设置开机脚本&mdash;&mdash;开机后主板的蜂鸣器嘀一声，或者其他的可以让你知晓电脑有没有开机的方法）</p>
</blockquote>

<p>解决好主板bios问题然后再继续解决系统问题</p>

<h1>前因</h1>

<p>前几天装了个​Proxmox​ ve当做一个服务器7*24开机</p>

<p>但是由于转好系统后，显卡就不需要了</p>

<p>加上它耗电的原因（我的gtx650平时空载有10w左右的功耗）</p>

<p>我在想拔显卡拔了，我用xshell进行ssh连接不就可以了</p>

<p>然后我一拔，一开机，果然！</p>

<p>连接不上后台和ssh</p>

<p>看了一眼路由器，发现根本没他的网络地址</p>

<h1>原因</h1>

<p>后面我在搜贴吧相类似的问题，发现这是由于因为拔了显卡的pcie插槽从而导致网口号发生变化</p>

<p><strong>由于pve是基于linux的debian系统下的，而现在的系统内的udev版本下网口号是按照位置来分的（很坑爹）</strong></p>

<p><strong>名称发生变化，但是你网络的配置文件又是之前的网卡名称的配置文件自然没有网络</strong></p>

<p>于是就有了这么奇怪的一幕</p>

<h1>解决办法</h1>

<p>这个问题的解决办法也找到了，比较简单，由于网卡的的mac地址是不会变化的，所以就是把网口号和网口的mac地址给绑定在一起</p>

<p>首先查看网口名称的ip地址（注意不要看成网卡虚拟出来的地址了）</p>

<pre>
<code class="language-bash">ip a</code></pre>

<p><img alt="d03f0cebda6b446bad754beffc1293ab.png" isbindedload="true" src="/image/e77166ce1a0c6de46e649a3b200ded13.png" /></p>

<p></p>

<p>注意查看你本机ip对应mac地址的网卡名称（可能会有两个网卡一模一样的mac地址，我就是，两个都可以连接ssh；其中有一个是有问题的，如果设置成他的话，你创建的虚拟机无法开启连不了网。问题不大全部试一遍就行了，一般是enp开头的，vmbr开头的一般是pve的虚拟网卡）</p>

<p>接下来打开配置文件夹</p>

<pre>
<code class="language-bash">cd /etc/udev/rules.d
</code></pre>

<p>查看文件</p>

<pre>
<code class="language-bash">ls</code></pre>

<p>如果发现有其他的文件先用ls&nbsp;-l+文件名查看</p>

<p>如果发现他是一个链接文件并且指向/dev/null的话(就像下面那样）</p>

<pre>
<code class="language-bash">lrwxrwxrwx 1 root root 9 Jul 18 21:49 60-bridge-network-interface.rules -&gt; /dev/null
</code></pre>

<p>那可以把他删掉</p>

<pre>
<code class="language-bash">rm &lt;文件名&gt;</code></pre>

<p>接下来创建一个文件（必须是这种&lt;数字&gt;-bridge-network-interface.rules文件名称和格式，实在不行照抄下面的也行）</p>

<pre>
<code class="language-bash">nano 50-bridge-network-interface.rules</code></pre>

<p>然后写入下面的文字</p>

<pre>
<code class="language-bash">SUBSYSTEM=="net", ACTION=="add", ATTR{address}=="mac地址", NAME="你的网卡名称"
</code></pre>

<p>重启</p>

<pre>
<code class="language-bash">reboot</code></pre>

<p>这样ip地址就绑定到这个网卡名称上了</p>

<p></p>

<h1><strong>注意</strong></h1>

<p><strong>再次说明本博客只解决了linux中pcie改变，导致的网卡名称错乱的问题（博主确信就这个问题而言，已经解决了，<s>但是博主还没成功开机，所以怀疑还有其他诸如bios以及grub的问题</s>）</strong></p>

<p>设置好后要在bios选项中把halt on改成No Errors，也就是无论有什么错误先开机再说</p>

<p>可能有其他选项比如华南的x99在Advanced-&gt;PCI Subsystem Settings-&gt;Onboard VGA</p>

<p>把他关闭</p>

<p>其他bios的不知道了,有些主板也不用调都可以跳过显卡直接开机（博主的华南x99tf就是，在开机直接嘀~嘀~嘀~三声警告后直接跳过显卡开机了）</p>

<p><s>还有一种说法bios过了但是grub没过。有解决办法了我会第一时间在底部更新</s></p>

<p><s>博主的主板x99hd3不支持跳过自检（或者说也找不到），所以无法做最后的验证（如果这方法没有用，记得联系我删除博客）</s></p>

<p><span style="color:#fe2c24"><strong>博主的成功开机了！！！！（主板为华南x99TF）</strong></span></p>

<p><img alt="" height="974" isbindedload="true" src="/image/b582a7d0a35caeddfa2f3bc60781652d.png" width="1200" /></p>

<p>未用有任何显卡类的pcie设备实现开机</p>
