---
title: archlinux安装waydroid
published: 2024-11-23
tags: [linux,运维,服务器]
category: 软件报错
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E5%8F%82%E8%80%83%E8%B5%84%E6%96%99-toc" style="margin-left:0px;"><a href="#%E5%8F%82%E8%80%83%E8%B5%84%E6%96%99">参考资料</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E7%AC%AC%E4%B8%80%E6%AD%A5%E5%88%87%E6%8D%A2wayland-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%B8%80%E6%AD%A5%E5%88%87%E6%8D%A2wayland">第一步切换wayland</a></p>

<p id="%E7%AC%AC%E4%BA%8C%E6%AD%A5%E5%AE%89%E8%A3%85binder%E6%A0%B8%E5%BF%83%E6%A8%A1%E7%BB%84-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%BA%8C%E6%AD%A5%E5%AE%89%E8%A3%85binder%E6%A0%B8%E5%BF%83%E6%A8%A1%E7%BB%84">第二步安装binder核心模组</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:40px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E5%BC%80%E5%A7%8B%E5%AE%89%E8%A3%85-toc" style="margin-left:0px;"><a href="#%E5%BC%80%E5%A7%8B%E5%AE%89%E8%A3%85">开始安装</a></p>

<p id="AUR%E5%AE%89%E8%A3%9DWaydroid-toc" style="margin-left:40px;"><a href="#AUR%E5%AE%89%E8%A3%9DWaydroid">AUR安裝Waydroid</a></p>

<p id="%E5%90%AF%E5%8A%A8waydroid-toc" style="margin-left:40px;"><a href="#%E5%90%AF%E5%8A%A8waydroid">启动waydroid</a></p>

<p id="%E8%AE%BE%E7%BD%AE%E7%BD%91%E7%BB%9C%EF%BC%88%E6%AD%A3%E5%B8%B8%E7%9A%84%E5%8F%AF%E4%BB%A5%E4%B8%8D%E7%9C%8B%EF%BC%89-toc" style="margin-left:40px;"><a href="#%E8%AE%BE%E7%BD%AE%E7%BD%91%E7%BB%9C%EF%BC%88%E6%AD%A3%E5%B8%B8%E7%9A%84%E5%8F%AF%E4%BB%A5%E4%B8%8D%E7%9C%8B%EF%BC%89">设置网络（正常的可以不看）</a></p>

<p id="%E6%B3%A8%E5%86%8C%E8%B0%B7%E6%AD%8C%E8%AE%BE%E5%A4%87-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E5%86%8C%E8%B0%B7%E6%AD%8C%E8%AE%BE%E5%A4%87">注册谷歌设备</a></p>

<p id="%E5%AE%89%E8%A3%85Arm%E8%BD%AC%E8%AF%91%E5%99%A8-toc" style="margin-left:0px;"><a href="#%E5%AE%89%E8%A3%85Arm%E8%BD%AC%E8%AF%91%E5%99%A8">安装Arm转译器</a></p>

<p id="%E9%87%8D%E5%90%AF-toc" style="margin-left:0px;"><a href="#%E9%87%8D%E5%90%AF">重启即可</a></p>

<p id="%E5%85%B6%E4%BB%96-toc" style="margin-left:0px;"><a href="#%E5%85%B6%E4%BB%96">其他</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%8F%82%E8%80%83%E8%B5%84%E6%96%99">参考资料</h1>

<p><a class="has-card" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.7/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=O83A" data-link-title="https://ivonblog.com/posts/archlinux-waydroid/" href="https://ivonblog.com/posts/archlinux-waydroid/" title="https://ivonblog.com/posts/archlinux-waydroid/"><span class="link-card-box"><span class="link-title">https://ivonblog.com/posts/archlinux-waydroid/</span><span class="link-link"><img class="link-link-icon" src="https://csdnimg.cn/release/blog_editor_html/release2.3.7/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=O83A" alt="icon-default.png?t=O83A" />https://ivonblog.com/posts/archlinux-waydroid/</span></span></a>照着看了看发现安装GAPPS时候会出现错误</p>

<blockquote>
<p><code>ERROR: [Errno 2] No such file or directory: '/dev/binderfs/binder-control'</code></p>
</blockquote>

<p>搜索资料后</p>

<p><a class="has-card" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.7/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=O83A" data-link-title="[SOLVED] Segmentation fault when mounting /dev/binderfs / Kernel &amp; Hardware / Arch Linux Forums" href="https://bbs.archlinux.org/viewtopic.php?pid=2155531#p2155531" title="[SOLVED] Segmentation fault when mounting /dev/binderfs / Kernel &amp; Hardware / Arch Linux Forums"><span class="link-card-box"><span class="link-title">[SOLVED] Segmentation fault when mounting /dev/binderfs / Kernel &amp; Hardware / Arch Linux Forums</span><span class="link-link"><img class="link-link-icon" src="https://csdnimg.cn/release/blog_editor_html/release2.3.7/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=O83A" alt="icon-default.png?t=O83A" />https://bbs.archlinux.org/viewtopic.php?pid=2155531#p2155531</span></span></a></p>

<p>完成安装</p>

<h1 id="%E6%B3%A8%E6%84%8F">注意</h1>

<p>前排注意waydroid对于大部分的N卡用户极其不友好，无法进行驱动</p>

<h1 id="%E7%AC%AC%E4%B8%80%E6%AD%A5%E5%88%87%E6%8D%A2wayland">第一步切换wayland</h1>

<p>首先要确定自己的桌面是使用使用Wayland显示的没有的话需要配置</p>

<p>查看自己的桌面是否是Wayland</p>

<pre>
<code class="language-bash">echo $XDG_SESSION_TYPE
</code></pre>

<p><img alt="" height="139" src="https://i-blog.csdnimg.cn/direct/4f0e65caf7524680b0a71e9e1b976ef1.png" width="397" /></p>

<p>如果显示示X11代表不是Wayland，GNOME和KDE可在登入时候可以切换为Wayland</p>

<h1 id="%E7%AC%AC%E4%BA%8C%E6%AD%A5%E5%AE%89%E8%A3%85binder%E6%A0%B8%E5%BF%83%E6%A8%A1%E7%BB%84">第二步安装binder核心模组</h1>

<p>输入以下命令</p>

<pre>
<code class="language-bash">yay -S binder_linux-dkms
</code></pre>

<p>载入核心模组</p>

<pre>
<code class="language-bash">sudo modprobe binder_linux
</code></pre>

<p>设置自动载入</p>

<pre>
<code class="language-bash">sudo echo "binder_linux" &gt;&gt; /etc/modules-load.d/binder.conf
</code></pre>

<h2>注意</h2>

<p>这里其实还没有安装成功</p>

<p>因为模组与<a data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.7/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=O83A" data-link-title="Indirect Branch Tracking" href="https://edc.intel.com/content/www/us/en/design/ipla/software-development-platforms/client/platforms/alder-lake-desktop/12th-generation-intel-core-processors-datasheet-volume-1-of-2/007/indirect-branch-tracking/" title="Indirect Branch Tracking"></a> 这个安全功能不兼容</p>

<p>还需要设置grub的启动参数（efi启动的我不知道）</p>

<pre>
<code class="language-bash"> sudo nano /etc/default/grub</code></pre>

<p> 加入我画红线的参数</p>

<p><img alt="" height="990" src="https://i-blog.csdnimg.cn/direct/5d13a8ccd390409c9dc64316d59ffe43.png" width="1200" /></p>

<p> 如果进行这一步不当安装GAPPS会失败，同时关机或者重启的时候会出现sync一直卡住直到10分钟超时后强制关机，即使这样也不要强制断电防止发生以外（血的教训）</p>

<h1 id="%E5%BC%80%E5%A7%8B%E5%AE%89%E8%A3%85">开始安装</h1>

<h2 id="AUR%E5%AE%89%E8%A3%9DWaydroid">AUR安裝Waydroid</h2>

<pre>
<code class="language-bash">yay -S python-pyclip xclip wl-clipboard mailcap
yay -S waydroid
</code></pre>

<p>开始下载谷歌镜像</p>

<pre>
<code class="language-bash">sudo waydroid init -s GAPPS -f
</code></pre>

<p>注意如果之前没有配置grub这里会显示错误</p>

<blockquote>
<p><code>ERROR: [Errno 2] No such file or directory: '/dev/binderfs/binder-control'</code></p>
</blockquote>

<p>配置一下就可以了</p>

<h2 id="%E5%90%AF%E5%8A%A8waydroid">启动waydroid</h2>

<pre>
<code class="language-bash">sudo systemctl start waydroid-container
# 開機自動啟動
sudo systemctl enable waydroid-container
</code></pre>

<p>或者你也可以在你的应用程序列表找到</p>

<h2 id="%E8%AE%BE%E7%BD%AE%E7%BD%91%E7%BB%9C%EF%BC%88%E6%AD%A3%E5%B8%B8%E7%9A%84%E5%8F%AF%E4%BB%A5%E4%B8%8D%E7%9C%8B%EF%BC%89">设置网络（正常的可以不看）</h2>

<p>如果没有网络记得设置防火墙</p>

<pre>
<code class="language-bash">sudo systemctl enable --now ufw
sudo ufw allow 53
sudo ufw allow 67
sudo ufw default allow FORWARD
sudo ufw reload
sudo systemctl restart waydroid-container
</code></pre>

<h1 id="%E6%B3%A8%E5%86%8C%E8%B0%B7%E6%AD%8C%E8%AE%BE%E5%A4%87">注册谷歌设备</h1>

<p>如果没有注册设备，模拟器会一直跳错误，所以最好注册一下设备</p>

<p>通过下面获取设备码</p>

<pre>
<code class="language-bash">sudo waydroid shell
</code></pre>

<pre>
<code class="language-bash">ANDROID_RUNTIME_ROOT=/apex/com.android.runtime ANDROID_DATA=/data ANDROID_TZDATA_ROOT=/apex/com.android.tzdata ANDROID_I18N_ROOT=/apex/com.android.i18n sqlite3 /data/data/com.google.android.gsf/databases/gservices.db "select * from main where name = \"android_id\";"</code></pre>

<p>获取到后进入注册设备<a class="has-card" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.7/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=O83A" data-link-title="https://www.google.com/android/uncertified" href="https://www.google.com/android/uncertified" title="https://www.google.com/android/uncertified"><span class="link-card-box"><span class="link-title">https://www.google.com/android/uncertified</span><span class="link-link"><img class="link-link-icon" src="https://csdnimg.cn/release/blog_editor_html/release2.3.7/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=O83A" alt="icon-default.png?t=O83A" />https://www.google.com/android/uncertified</span></span></a>之后登陆谷歌账号，过个几分钟或者是十几分钟就好了</p>

<h1 id="%E5%AE%89%E8%A3%85Arm%E8%BD%AC%E8%AF%91%E5%99%A8">安装Arm转译器</h1>

<p>原生只支持x86app如果要运行arm的app需要下载转译器（大部分手机app都是arm类型的）</p>

<p>复制下面命令粘贴</p>

<pre>
<code class="language-bash">sudo pacman -S lzip sqlite python3 python-pip
cd ~
git clone https://github.com/casualsnek/waydroid_script
cd waydroid_script
python3 -m venv venv
venv/bin/pip install -r requirements.txt
cd ~/waydroid_script
sudo venv/bin/python3 main.py install libhoudini
</code></pre>

<h1 id="%E9%87%8D%E5%90%AF">重启即可</h1>

<pre>
<code class="language-bash">sudo systemctl restart waydroid-container
</code></pre>

<h1 id="%E5%85%B6%E4%BB%96">其他</h1>

<p>可以看之前的连接</p>
