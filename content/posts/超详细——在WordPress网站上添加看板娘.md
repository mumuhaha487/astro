---
title: 超详细——在WordPress网站上添加看板娘
published: 2023-06-05
tags: [php,开发语言,javascript,linux,运维]
category: 宝塔
image: /image/8ab42d500ca79e31a1449b82ff5c3846.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E4%B8%8B%E8%BD%BD%E6%96%87%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E4%B8%8B%E8%BD%BD%E6%96%87%E4%BB%B6">下载文件</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6">配置文件</a></p>

<p id="%E8%AE%BE%E7%BD%AE%E5%A4%B4%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E8%AE%BE%E7%BD%AE%E5%A4%B4%E6%96%87%E4%BB%B6">设置头文件</a></p>

<p id="%E8%AE%BE%E7%BD%AEfooter.php-toc" style="margin-left:40px;"><a href="#%E8%AE%BE%E7%BD%AEfooter.php">设置footer.php</a></p>

<p id="%E7%AC%AC%E4%BA%8C%E7%A7%8D%E6%96%B9%E6%B3%95%EF%BC%88%E9%83%A8%E5%88%86%E4%B8%BB%E9%A2%98%E6%94%AF%E6%8C%81%EF%BC%8C%E6%AF%94%E8%BE%83%E7%AE%80%E5%8D%95%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E7%AC%AC%E4%BA%8C%E7%A7%8D%E6%96%B9%E6%B3%95%EF%BC%88%E9%83%A8%E5%88%86%E4%B8%BB%E9%A2%98%E6%94%AF%E6%8C%81%EF%BC%8C%E6%AF%94%E8%BE%83%E7%AE%80%E5%8D%95%EF%BC%89">第二种方法（部分主题支持，比较简单）</a></p>

<hr id="hr-toc" /><p></p>

<p></p>

<h1 id="%E4%B8%8B%E8%BD%BD%E6%96%87%E4%BB%B6">下载文件</h1>

<p>首先去下载相应的文件</p>

<p>这里借用一下其他博主的文件</p>

<p><a class="has-card" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.0/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N4P3" data-link-title="mumuhaha487/KanBanMusume: WordPress添加看板娘 (github.com)" href="https://github.com/mumuhaha487/KanBanMusume" title="mumuhaha487/KanBanMusume: WordPress添加看板娘 (github.com)"><span class="link-card-box"><span class="link-title">mumuhaha487/KanBanMusume: WordPress添加看板娘 (github.com)</span><span class="link-link"><img class="link-link-icon" src="/image/003a2ce7eb50c2e24a8c624c260c5930.png" alt="icon-default.png?t=N7T8" />https://github.com/mumuhaha487/KanBanMusume</span></span></a>把压缩包里面的文件改成<span style="color:#fe2c24;">“live2d”</span></p>

<p><span style="color:#fe2c24;">方便后续操作</span></p>

<p></p>

<h1 id="%E6%B3%A8%E6%84%8F">注意</h1>

<p>之后上传到你的站点的目录下</p>

<p>需要确定的是你文件夹里的css文件或者model文件可以用链接来访问到</p>

<p></p>

<p>这里用宝塔举例</p>

<p><img alt="" height="914" src="/image/8ab42d500ca79e31a1449b82ff5c3846.png" width="1200" /></p>

<p></p>

<h1 id="%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6">配置文件</h1>

<h2 id="%E8%AE%BE%E7%BD%AE%E5%A4%B4%E6%96%87%E4%BB%B6">设置头文件</h2>

<p>之后打开 <span style="color:#ff9900;"><strong><code>wp-content/themes/[WordPress使用的主题名称]/header.php</code> </strong></span></p>

<p>在<code>&lt;head&gt;</code>和<code>&lt;/head&gt;</code>之中添加以下代码（可以ctrl+f搜索），将代码中 <code>src</code> 属性的 url 更换成你自己的（改完了直接粘贴到<code>&lt;head&gt;</code>下面就行）</p>

<blockquote>
<p><s>href可改可不改，也可以用你自己的也可以用我的，需要注意的是要确定你链接的jqury.js文件可以访问就和我的<a data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.0/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N4P3" data-link-title="http://zhuye.0ha.top:8849/wp-content/live2d/css/live2d.css" href="http://zhuye.0ha.top:8849/wp-content/live2d/css/live2d.css" title="http://zhuye.0ha.top:8849/wp-content/live2d/css/live2d.css">http://zhuye.0ha.top:8849/wp-content/live2d/css/live2d.css</a></s></p>
</blockquote>

<p><span style="color:#fe2c24;"><span style="background-color:#ffd900;">上面的链接访问不了了，现在直接用你自己的域名替换就行</span></span></p>

<p>链接一样</p>

<p></p>

<pre>
<code class="language-html">&lt;!--Live2D show start--&gt;
&lt;link rel="stylesheet" href="http://你博客的域名/wp-content/live2d/css/live2d.css" /&gt;
&lt;script type="text/javascript" src="你的jquery.js文件链接"&gt;&lt;/script&gt;
&lt;!--Live2D show end--&gt;
</code></pre>

<p></p>

<p>之后保存退出</p>

<h2 id="%E8%AE%BE%E7%BD%AEfooter.php">设置footer.php</h2>

<p>再打开同目录下的footer.php文件</p>

<p></p>

<p>在&lt;/body&gt;前面加入如下内容（要把“var home_Path”改为你的域名）</p>

<pre>
<code class="language-html">&lt;div id="landlord"&gt;
 &lt;div class="message" style="opacity:0"&gt;&lt;/div&gt;
 &lt;canvas id="live2d" width="280" height="250" class="live2d"&gt;&lt;/canvas&gt;
 &lt;div class="hide-button"&gt;隐藏&lt;/div&gt;
 &lt;div class="switch-button"&gt;换装&lt;/div&gt;
&lt;/div&gt;
 
&lt;script type="text/javascript"&gt;
 var message_Path = '/live2d/'
 var home_Path = 'http://www.aaa.com' //此处修改为你的域名
&lt;/script&gt;
&lt;script type="text/javascript" src="live2d/js/live2d.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="live2d/js/message.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
 var index = Math.ceil(Math.random()*37)
 //index表示服装编号，此处表示随机切换服装
 loadlive2d("live2d", "live2d/model/pio/model_"+index+".json");
&lt;/script&gt;
</code></pre>

<p></p>

<p></p>

<h1 id="%E7%AC%AC%E4%BA%8C%E7%A7%8D%E6%96%B9%E6%B3%95%EF%BC%88%E9%83%A8%E5%88%86%E4%B8%BB%E9%A2%98%E6%94%AF%E6%8C%81%EF%BC%8C%E6%AF%94%E8%BE%83%E7%AE%80%E5%8D%95%EF%BC%89">第二种方法（部分主题支持，比较简单）</h1>

<p>还是要把之前的文件下载好然后在主题设置那里</p>

<p><img alt="" height="1042" src="/image/8d972ee7b84b49ae33d13a9a060df945.png" width="1200" /></p>

<p>输入下面代码</p>

<pre>
<code class="language-html">&lt;script src="https://eqcn.ajz.miesnfu.com/wp-content/plugins/wp-3d-pony/live2dw/lib/L2Dwidget.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
    L2Dwidget.init({
        "model": {
　　　　　　　//jsonpath控制显示那个小萝莉模型，
            //(切换模型需要改动)
//              "https://unpkg.com/(live2d-widget-model-koharu)@1.0.5/assets/(koharu).model.json"
            jsonPath: "",//模型链接最重要的！！！！！！！！！！
            "scale": 1
        },
        "display": {
            "position": "", //看板娘的表现位置（left/right/空）
            "width": 100,  //小萝莉的宽度
            "height": 200, //小萝莉的高度
            "hOffset": -50,
            "vOffset": -120
        },
        "mobile": {
            "show": true,
            "scale": 0.4
        },
        "react": {
            "opacityDefault": 1,
            "opacityOnHover": 0.2
        }
    });
&lt;/script&gt;</code></pre>

<p></p>

<p> jsonPath那一行要改成你的模型链接</p>

<p>那链接在哪里呢？</p>

<p>就在<span style="color:#fe2c24;"><strong>http://你的博客域名/live2d/model/pio/model_1.json</strong></span></p>

<p></p>

<p>其中model_1.json可以变成其他的序号如model_2.json，model_3.json在你的<strong>/live2d/model/pio/</strong></p>

<p><strong>可以看到</strong></p>

<p></p>

<p><strong>如果没有的看板娘的话确保你和我一样上传到网站的根目录</strong></p>

<p><strong>如果看板娘没有对正，歪了的话设置下面几个值</strong></p>

<blockquote>
<p><strong>            "width": 100,<br />
            "height": 200,<br />
            "hOffset": -50,<br />
            "vOffset": -120</strong></p>
</blockquote>

<p><strong>这样你的看板娘就不会 歪了</strong></p>

<blockquote>
<p><strong>如果会设计的话可以设置自己的看板娘皮肤与人物</strong></p>
</blockquote>
