---
title: pve安装ikuai并设置，同时把pve的网络连接到ikuai虚拟机
published: 2023-07-28
tags: [网络,pve,linux,智能路由器,ikuai]
category: pve
image: /image/43d3b0c9fec6ea265c17053d5ffc3c6c.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E5%89%8D%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E5%9B%A0">前因</a></p>

<p id="%E5%89%8D%E7%BD%AE%E6%9D%A1%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E7%BD%AE%E6%9D%A1%E4%BB%B6">前置条件</a></p>

<p id="%C2%A0%E5%AE%89%E8%A3%85ikuai-toc" style="margin-left:0px;"><a href="#%C2%A0%E5%AE%89%E8%A3%85ikuai"> 安装ikuai</a></p>

<p id="%E8%BF%9B%E5%85%A5ikuai%E7%9A%84%E5%90%8E%E5%8F%B0-toc" style="margin-left:0px;"><a href="#%E8%BF%9B%E5%85%A5ikuai%E7%9A%84%E5%90%8E%E5%8F%B0">进入ikuai的后台</a></p>

<p id="%E9%85%8D%E7%BD%AElan%E5%8F%A3%EF%BC%8C%E4%BB%A5%E5%8F%8Awan%E5%8F%A3-toc" style="margin-left:0px;"><a href="#%E9%85%8D%E7%BD%AElan%E5%8F%A3%EF%BC%8C%E4%BB%A5%E5%8F%8Awan%E5%8F%A3">配置lan口，以及wan口</a></p>

<p id="%E9%85%8D%E7%BD%AElan%E5%8F%A3%E6%A1%A5%E6%8E%A5-toc" style="margin-left:40px;"><a href="#%E9%85%8D%E7%BD%AElan%E5%8F%A3%E6%A1%A5%E6%8E%A5">配置lan口桥接</a></p>

<p id="%C2%A0%E6%8C%89%E5%AE%9E%E9%99%85%E6%83%85%E5%86%B5%E6%9D%A5%E8%AE%BE%E7%BD%AE%E4%BA%86-toc" style="margin-left:0px;"><a href="#%C2%A0%E6%8C%89%E5%AE%9E%E9%99%85%E6%83%85%E5%86%B5%E6%9D%A5%E8%AE%BE%E7%BD%AE%E4%BA%86"> 按实际情况来设置了</a></p>

<p id="%E5%8D%95%E6%8B%A8%EF%BC%88PPOE%E6%8B%A8%E5%8F%B7%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E5%8D%95%E6%8B%A8%EF%BC%88PPOE%E6%8B%A8%E5%8F%B7%EF%BC%89">单拨（PPOE拨号）</a></p>

<p id="%E5%A4%9A%E6%8B%A8(%E5%86%85%E5%A4%96%E7%BD%91%E8%AE%BE%E7%BD%AE%E7%82%B9%E5%87%BB%E5%9F%BA%E4%BA%8E%E7%89%A9%E7%90%86%E7%BD%91%E5%8D%A1%E7%9A%84%E6%B7%B7%E5%90%88%E6%A8%A1%E5%BC%8F)-toc" style="margin-left:40px;"><a href="#%E5%A4%9A%E6%8B%A8(%E5%86%85%E5%A4%96%E7%BD%91%E8%AE%BE%E7%BD%AE%E7%82%B9%E5%87%BB%E5%9F%BA%E4%BA%8E%E7%89%A9%E7%90%86%E7%BD%91%E5%8D%A1%E7%9A%84%E6%B7%B7%E5%90%88%E6%A8%A1%E5%BC%8F)">多拨(内外网设置点击基于物理网卡的混合模式)</a></p>

<p id="%C2%A0%E5%90%8E%E7%BB%AD%E6%AD%A5%E9%AA%A4-toc" style="margin-left:0px;"><a href="#%C2%A0%E5%90%8E%E7%BB%AD%E6%AD%A5%E9%AA%A4"> 后续步骤</a></p>

<p id="%E8%AE%BE%E7%BD%AEpve%E8%BF%9E%E6%8E%A5ikuai%E7%BD%91%E7%BB%9C%E4%BB%A5%E5%8F%8A%E5%85%B6%E4%BB%96%E8%99%9A%E6%8B%9F%E6%9C%BA%E8%BF%9E%E6%8E%A5ikuai%E7%9A%84%E7%BD%91%E7%BB%9C-toc" style="margin-left:0px;"><a href="#%E8%AE%BE%E7%BD%AEpve%E8%BF%9E%E6%8E%A5ikuai%E7%BD%91%E7%BB%9C%E4%BB%A5%E5%8F%8A%E5%85%B6%E4%BB%96%E8%99%9A%E6%8B%9F%E6%9C%BA%E8%BF%9E%E6%8E%A5ikuai%E7%9A%84%E7%BD%91%E7%BB%9C">pve连接虚拟机ikuai的网络以及其他虚拟机连接ikuai的网络</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E5%9B%A0">前因</h1>

<p>pve安装好后，如果你有不止一个网口（单网口也行，不过要特殊的交换机来做单臂路由器，如果有多余的pcie口的话建议还是拓展出网口）</p>

<p></p>

<h1 id="%E5%89%8D%E7%BD%AE%E6%9D%A1%E4%BB%B6">前置条件</h1>

<p>接下来进入pve的webui中进行添加虚拟网卡（一般pve只会虚拟出一张虚拟网卡，我们要进行替换） </p>

<p><img alt="" height="1200" src="/image/43d3b0c9fec6ea265c17053d5ffc3c6c.png" width="1200" /></p>

<p> 填上网卡的名称就行了</p>

<p>不知道的可以用</p>

<pre>
<code class="hljs">ip a</code></pre>

<p> 查看，其中真实的物理网卡一般是enp开头的名称，别搞错了（算了还是上张图吧！！）</p>

<p><img alt="" height="742" src="/image/5da77a4eb153ffd6d9460f46535bf6d3.png" width="1200" /></p>

<p> </p>

<p><img alt="" height="484" src="/image/3fc579567ee2e641d2024cf3d7a4a8f7.png" width="1200" /></p>

<p>  设置好了点击确定然后应用配置（好像会报一个什么命令找不到错误，但是创建出来的网口可以用，所以问题不大）</p>

<p><img alt="" height="863" src="/image/dc62ab922df3e83f22256e01f68390ba.png" width="1200" /> </p>

<h1 id="%C2%A0%E5%AE%89%E8%A3%85ikuai"> 安装ikuai</h1>

<p>多余的也不多说（上传镜像-&gt;创建虚拟机-&gt;操作系统中选择ikuai的镜像-&gt;分配好内存cpu-&gt;开机安装）</p>

<p>之后安装ikuai就是正常的安装其他系统一样，安装过了不上图了（别跟我提这个你也不会操作，接下来安装系统也就两步——选择安装硬盘-&gt;yes）</p>

<p></p>

<h1 id="%E8%BF%9B%E5%85%A5ikuai%E7%9A%84%E5%90%8E%E5%8F%B0">进入ikuai的后台</h1>

<p>我改了后台地址默认是192.168.1.1</p>

<p>如果要改的话选择2改你的lan口网络地址</p>

<p>改为192.168.2.1/255.255.255.0(192.168.2.1可以随便变，这就是你的后台地址</p>

<p><img alt="" height="788" src="/image/1a56e1a26b87d1f06769b51cdae060ce.png" width="1044" /></p>

<p> 接下就是修改你的ip地址改成与他同一网段右键wifi</p>

<p><img alt="" height="201" src="/image/0d488c7c8e2597795dd79e1d330df1b1.png" width="1200" /></p>

<p><img alt="" height="1200" src="/image/b2a5ede4c2f3070cd986c0dc83ee2089.png" width="1200" /></p>

<p> <img alt="" height="1200" src="/image/f76a5981608f99ebf5ce4e5eb81dbbc1.png" width="1200" /></p>

<p><img alt="" height="1200" src="/image/a6ebb4208a742eca8e5c1f93febf90ad.png" width="1200" /> </p>

<p> ip地址改为同一网段就行</p>

<p>比如后台是192.168.2.1你就改成192.168.2.2</p>

<p>子网掩码改为255.255.255.0就可以了</p>

<p>接下来输入光猫的后台地址就可以进入ikuai控制台</p>

<p>账号是admin</p>

<p>默认密码是admin或者是（adminadmin）</p>

<p>或者这样也可以查看</p>

<p><img alt="" height="786" src="/image/bc76690b9df99f7ae2dc7421d94317fa.png" width="1049" /></p>

<p> </p>

<p></p>

<p> </p>

<h1 id="%E9%85%8D%E7%BD%AElan%E5%8F%A3%EF%BC%8C%E4%BB%A5%E5%8F%8Awan%E5%8F%A3">配置lan口，以及wan口</h1>

<p>简单来说WAN口就是连接外网的接口，LAN口就是连接局域网/内网的接口</p>

<p>开始lan口就是你创建系统时你选择的网口（为了可以直接访问ikuai后台）</p>

<p>此时我们要添加新的网口，来做wan口（lan/wan口设置不做考虑，太麻烦了）</p>

<p><img alt="" height="1200" src="/image/0a0e675f5088af128aea69da8734ef55.png" width="1200" /></p>

<p>有多少个网口添加上去就可以了</p>

<h2 id="%E9%85%8D%E7%BD%AElan%E5%8F%A3%E6%A1%A5%E6%8E%A5">配置lan口桥接</h2>

<p>点击lan1</p>

<p><img alt="" height="1200" src="/image/6caefcf3b2fcb05c1d4421beffbd7b5c.png" width="1200" /></p>

<p>点击高级设置把其他的网口全部连接起来（最好把ip地址也改一下，之前的192.168.1.1会和光猫的ip后台冲突）</p>

<p><img alt="" height="1200" src="/image/f298c871195e3d3dea8424a511a8e3ba.png" width="1200" /></p>

<p> </p>

<p> </p>

<h1 id="%C2%A0%E6%8C%89%E5%AE%9E%E9%99%85%E6%83%85%E5%86%B5%E6%9D%A5%E8%AE%BE%E7%BD%AE%E4%BA%86"> 按实际情况来设置了</h1>

<p>如果你是连接到上级路由器或者是拨号光猫的话</p>

<p>点击wan口设置</p>

<p><img alt="" height="1200" src="/image/6cc67d23e81bbbd08944dc776e0c44cf.png" width="1200" /></p>

<p> </p>

<p>直接选择dhcp（动态获取ip）就行了</p>

<p><img alt="" height="1200" src="/image/23992164e7f7493b338316b49d9f1c34.png" width="1200" /></p>

<p> </p>

<p>如果连接的是桥接光猫</p>

<p>下面两个都可以选择（前提是你知道你的宽带账号和密码）</p>

<p><img alt="" height="1200" src="/image/1bb6a1b0bc16424071462163bbc40f3d.png" width="1200" /></p>

<p> 第一个是单拨（就是一个宽带账号拨号一次），第二个就是多拨（一个宽带账号或者是多个宽带账号拨多次，实现宽带叠加（叠加速率上限看光猫的网口速率/拨号成不成功看当地运营商支不支持多拨））</p>

<h2 id="%E5%8D%95%E6%8B%A8%EF%BC%88PPOE%E6%8B%A8%E5%8F%B7%EF%BC%89">单拨（PPOE拨号）</h2>

<p>很简单，前提是你知道你的宽带账号和密码</p>

<p><img alt="" height="1200" src="/image/6619ae1452f5655824ad5c68e5ccd6ad.png" width="1200" /></p>

<p></p>

<p> 设置这个就可以了</p>

<p></p>

<h2 id="%E5%A4%9A%E6%8B%A8(%E5%86%85%E5%A4%96%E7%BD%91%E8%AE%BE%E7%BD%AE%E7%82%B9%E5%87%BB%E5%9F%BA%E4%BA%8E%E7%89%A9%E7%90%86%E7%BD%91%E5%8D%A1%E7%9A%84%E6%B7%B7%E5%90%88%E6%A8%A1%E5%BC%8F)">多拨(内外网设置点击基于物理网卡的混合模式)</h2>

<p>前置设置（按照这个来就行了）</p>

<p><img alt="" height="1200" src="/image/b54b81b37f7c435fcdce5956d765efe6.png" width="1200" /></p>

<p> </p>

<p>点击网络设置-&gt;内外网设置点击基于物理网卡的混合模式</p>

<p>好划到下面进行添加账号</p>

<p><img alt="" height="1200" src="/image/b0c816abf6e967a500ea3986abbf9e32.png" width="1200" /></p>

<p> 点击添加（同一个账号也可以添加多次，名称随便取）</p>

<p>然后下划，点击保存就可以了</p>

<p> </p>

<p>最后进入多线负载</p>

<p><img alt="" height="1200" src="/image/45b6b974b10f66bfa349dac4158fe908.png" width="1200" /></p>

<p> 需要填写的框框出来了</p>

<p><img alt="" height="1200" src="/image/ed7f91e8735085296d9c723ad36d0ce5.png" width="1200" /></p>

<h1 id="%C2%A0%E5%90%8E%E7%BB%AD%E6%AD%A5%E9%AA%A4"> 后续步骤</h1>

<p>电脑连接你给电脑设置的lan口</p>

<p>接下来就大功告成了（看看有没有连接成功）</p>

<h1 id="%E8%AE%BE%E7%BD%AEpve%E8%BF%9E%E6%8E%A5ikuai%E7%BD%91%E7%BB%9C%E4%BB%A5%E5%8F%8A%E5%85%B6%E4%BB%96%E8%99%9A%E6%8B%9F%E6%9C%BA%E8%BF%9E%E6%8E%A5ikuai%E7%9A%84%E7%BD%91%E7%BB%9C">pve连接虚拟机ikuai的网络以及其他虚拟机连接ikuai的网络</h1>

<p>虚拟机设置网络十分简单，只需要再添加一个网络设备（名称就是你ikuai的lan口对应的虚拟网卡名称）</p>

<p>pve连接就进入网络配置界面编辑</p>

<pre>
<code class="hljs">nano /etv/network/interfaces</code></pre>

<p>下划，随便挑一个lan口对应的虚拟网卡名称把他原来的manual改成dhcp就行了</p>

<p><img alt="" height="735" src="/image/51f10fe79e4912d8d08500d10fbe04be.png" width="1200" /></p>

<p> 最后重启，等待一段时间大概为（pve开机-&gt; ikuai开机 -&gt;pve连接ikuai网络）</p>

<p>最后看ikuai后台有没有pve的网络登录</p>
