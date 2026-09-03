---
title: （win10)yolov5训练自己的数据集
published: 2023-06-02
tags: [YOLO,python,机器学习,opencv,图像处理]
category: python
image: /image/6d06dd4dfa9d6fa8b5e40ca6b2e5b0e5.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E7%8E%AF%E5%A2%83%EF%BC%9A-toc" style="margin-left:0px;"><a href="#%E7%8E%AF%E5%A2%83%EF%BC%9A">环境：</a></p>

<p id="python%E5%8C%85%E7%9A%84%E9%85%8D%E7%BD%AE-toc" style="margin-left:0px;"><a href="#python%E5%8C%85%E7%9A%84%E9%85%8D%E7%BD%AE">python包的配置</a></p>

<p id="%E6%96%87%E4%BB%B6%E5%A4%B9%E8%B7%AF%E5%BE%84-toc" style="margin-left:0px;"><a href="#%E6%96%87%E4%BB%B6%E5%A4%B9%E8%B7%AF%E5%BE%84">文件夹路径</a></p>

<p id="%E6%A0%87%E6%B3%A8%E6%95%B0%E6%8D%AE-toc" style="margin-left:0px;"><a href="#%E6%A0%87%E6%B3%A8%E6%95%B0%E6%8D%AE">标注数据</a></p>

<p id="%E8%8E%B7%E5%8F%96%E7%94%B5%E8%84%91%2F%E8%A7%86%E9%A2%91%E9%87%8C%E7%9A%84%E5%9B%BE%E7%89%87-toc" style="margin-left:40px;"><a href="#%E8%8E%B7%E5%8F%96%E7%94%B5%E8%84%91%2F%E8%A7%86%E9%A2%91%E9%87%8C%E7%9A%84%E5%9B%BE%E7%89%87">获取电脑/视频里的图片</a></p>

<p id="%E5%BC%80%E5%A7%8B%E6%A0%87%E8%AE%B0%E6%95%B0%E6%8D%AE-toc" style="margin-left:40px;"><a href="#%E5%BC%80%E5%A7%8B%E6%A0%87%E8%AE%B0%E6%95%B0%E6%8D%AE">开始标记数据</a></p>

<p id="%E5%88%92%E5%88%86%E5%88%92%E5%88%86%E8%AE%AD%E7%BB%83%E9%9B%86%E3%80%81%E9%AA%8C%E8%AF%81%E9%9B%86%E3%80%81%E6%B5%8B%E8%AF%95%E9%9B%86-toc" style="margin-left:0px;"><a href="#%E5%88%92%E5%88%86%E5%88%92%E5%88%86%E8%AE%AD%E7%BB%83%E9%9B%86%E3%80%81%E9%AA%8C%E8%AF%81%E9%9B%86%E3%80%81%E6%B5%8B%E8%AF%95%E9%9B%86">划分划分训练集、验证集、测试集</a></p>

<p id="%C2%A0%E6%8A%8A%E7%9B%B8%E5%BA%94%E7%9A%84%E6%96%87%E4%BB%B6%E8%B7%AF%E5%BE%84%E5%AD%98%E5%85%A5txt%E6%96%87%E4%BB%B6%E4%B8%AD%EF%BC%8Cxml%E8%BD%AC%E4%B8%BAtxt-toc" style="margin-left:0px;"><a href="#%C2%A0%E6%8A%8A%E7%9B%B8%E5%BA%94%E7%9A%84%E6%96%87%E4%BB%B6%E8%B7%AF%E5%BE%84%E5%AD%98%E5%85%A5txt%E6%96%87%E4%BB%B6%E4%B8%AD%EF%BC%8Cxml%E8%BD%AC%E4%B8%BAtxt"> 把相应的文件路径存入txt文件中，xml转为txt</a></p>

<p id="%E5%88%9B%E5%BB%BA%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E5%88%9B%E5%BB%BA%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6">创建配置文件</a></p>

<p id="%E8%81%9A%E7%B1%BB%E8%8E%B7%E5%BE%97%E5%85%88%E9%AA%8C%E6%A1%86-toc" style="margin-left:0px;"><a href="#%E8%81%9A%E7%B1%BB%E8%8E%B7%E5%BE%97%E5%85%88%E9%AA%8C%E6%A1%86">聚类获得先验框</a></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%C2%A0%E5%BC%80%E5%A7%8B%E8%AE%AD%E7%BB%83-toc" style="margin-left:0px;"><a href="#%C2%A0%E5%BC%80%E5%A7%8B%E8%AE%AD%E7%BB%83"> 开始训练</a></p>

<p id="%C2%A0%E8%BF%90%E8%A1%8C%E6%96%87%E4%BB%B6%EF%BC%9A-toc" style="margin-left:40px;"><a href="#%C2%A0%E8%BF%90%E8%A1%8C%E6%96%87%E4%BB%B6%EF%BC%9A"> 运行文件：</a></p>

<p id="%E7%94%A8gpu%E8%AE%AD%E7%BB%83-toc" style="margin-left:0px;"><a href="#%E7%94%A8gpu%E8%AE%AD%E7%BB%83">用gpu训练</a></p>

<p id="%E6%9F%A5%E7%9C%8Bcuda%E7%89%88%E6%9C%AC-toc" style="margin-left:40px;"><a href="#%E6%9F%A5%E7%9C%8Bcuda%E7%89%88%E6%9C%AC">查看cuda版本</a></p>

<p id="%E2%80%8B%E7%BC%96%E8%BE%91-toc" style="margin-left:0px;"><a href="#%E2%80%8B%E7%BC%96%E8%BE%91">​编辑</a></p>

<p id="%E5%AE%89%E8%A3%85pytorch-toc" style="margin-left:40px;"><a href="#%E5%AE%89%E8%A3%85pytorch">安装pytorch</a></p>

<p id="%E8%AE%AD%E7%BB%83-toc" style="margin-left:40px;"><a href="#%E8%AE%AD%E7%BB%83">训练</a></p>

<p id="%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E9%97%AE%E9%A2%98">问题</a></p>

<p id="%E5%A6%82%E6%9E%9C%E5%87%BA%E7%8E%B0%20%EF%BC%88%E9%A1%B5%E9%9D%A2%E5%A4%AA%E5%B0%8F%EF%BC%8C%E6%97%A0%E6%B3%95%E5%AE%8C%E6%88%90%E6%93%8D%E4%BD%9C%EF%BC%89%E7%9A%84%E7%9B%B8%E5%85%B3%E9%97%AE%E9%A2%98-toc" style="margin-left:40px;"><a href="#%E5%A6%82%E6%9E%9C%E5%87%BA%E7%8E%B0%20%EF%BC%88%E9%A1%B5%E9%9D%A2%E5%A4%AA%E5%B0%8F%EF%BC%8C%E6%97%A0%E6%B3%95%E5%AE%8C%E6%88%90%E6%93%8D%E4%BD%9C%EF%BC%89%E7%9A%84%E7%9B%B8%E5%85%B3%E9%97%AE%E9%A2%98">如果出现 （页面太小，无法完成操作）的相关问题</a></p>

<p id="%C2%A0%E5%8F%82%E8%80%83%E6%96%87%E7%AB%A0%EF%BC%9A-toc" style="margin-left:0px;"><a href="#%C2%A0%E5%8F%82%E8%80%83%E6%96%87%E7%AB%A0%EF%BC%9A"> 参考文章：</a></p>

<hr id="hr-toc" /><p></p>

<p></p>

<h1 id="%E7%8E%AF%E5%A2%83%EF%BC%9A">环境：</h1>

<ul><li>windows 10</li>
	<li>yolov5的源文件（链接<a class="link-info" data-link-title="yolov5" href="https://www.123pan.com/s/HrkuVv-F9IX.html" title="yolov5">yolov5</a>）</li>
	<li>标注工具（链接<a class="link-info" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.0/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N4P3" data-link-title="标注" href="https://www.123pan.com/s/HrkuVv-Y9IX.html" title="标注">标注</a>）</li>
</ul><h1 id="python%E5%8C%85%E7%9A%84%E9%85%8D%E7%BD%AE">python包的配置</h1>

<p>打开pycharm的终端<img alt="" height="1080" src="/image/6d06dd4dfa9d6fa8b5e40ca6b2e5b0e5.png" width="1200" /></p>

<p>运行</p>

<pre>
<code class="language-python">pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple</code></pre>

<p></p>

<h1 id="%E6%96%87%E4%BB%B6%E5%A4%B9%E8%B7%AF%E5%BE%84">文件夹路径</h1>

<p>在data文件中创建一个VOCData文件</p>

<p></p>

<p>进入VOCData文件夹里面创建一个<span style="color:#fe2c24;">Annotations</span>文件夹用于放置你标记的数据集的数据xml或者是txt，再在VOCData文件夹里面创建一个<span style="color:#fe2c24;">images</span>的文件夹里面用于放你的训练的图片</p>

<p></p>

<p><span style="color:#ff9900;">先创建好，有没有还没有关系。</span></p>

<p></p>

<h1 id="%E6%A0%87%E6%B3%A8%E6%95%B0%E6%8D%AE">标注数据</h1>

<p>接下来就是标注数据集了</p>

<p></p>

<p>打开上面的标注数据的工具（原来用于dnf挂机的脚本工具，用了发现他的自动截图功能不错，而且标记出来的数据labels可以直接用，不用xml转txt了）</p>

<p></p>

<p><img alt="" height="1075" src="/image/c4f0cdd343ebd28842d9d970621d6e60.png" width="1200" /></p>

<h2 id="%E8%8E%B7%E5%8F%96%E7%94%B5%E8%84%91%2F%E8%A7%86%E9%A2%91%E9%87%8C%E7%9A%84%E5%9B%BE%E7%89%87">获取电脑/视频里的图片</h2>

<p>打开自动截图</p>

<p>要设置区域可以按照上面的文字来设置截图区域</p>

<p> 然后开启全屏，之后直接ctrl+q键开始截图就行了（默认时间是3秒自动截图一次）</p>

<p><img alt="" height="1080" src="/image/f5424582c0c500994298940450d2226d.png" width="1200" /></p>

<p>默认是png，我用的jpg，为了防止后面代码报错，最好也改成这个吧</p>

<p></p>

<p>截图文件在软件目录下的的“截图”文件夹</p>

<p><img alt="" height="770" src="/image/0abad2a4b79a700fd35d8cdda5e6ee87.png" width="1167" /></p>

<p></p>

<h2 id="%E5%BC%80%E5%A7%8B%E6%A0%87%E8%AE%B0%E6%95%B0%E6%8D%AE">开始标记数据</h2>

<p><img alt="" height="1075" src="/image/e4049d2a94c229e39d0252e775f9df5a.png" width="1200" /></p>

<p></p>

<p>点击“打开图库”</p>

<p><img alt="" height="770" src="/image/7d5f702aa2290b8ff010f66a9606f05f.png" width="1167" /></p>

<p>把刚刚 截图的图片给复制进去</p>

<p>然后重启一次软件就可以开始标记了</p>

<p><img alt="" height="1075" src="/image/5115df9708a1930ba6095a24b70c045d.png" width="1200" /></p>

<p>需要注意的是最后要把没有任何标记的图片删除，以防后面执行代码时报错</p>

<p></p>

<h1 id="%E5%88%92%E5%88%86%E5%88%92%E5%88%86%E8%AE%AD%E7%BB%83%E9%9B%86%E3%80%81%E9%AA%8C%E8%AF%81%E9%9B%86%E3%80%81%E6%B5%8B%E8%AF%95%E9%9B%86">划分划分训练集、验证集、测试集</h1>

<p></p>

<p>在data/VOCData文件目录下面创建一个py文件（名字随意，认得出来就行）</p>

<pre>
<code class="language-python"># coding:utf-8

import os
import random
import argparse

parser = argparse.ArgumentParser()
#xml文件的地址，根据自己的数据进行修改 xml一般存放在Annotations下
parser.add_argument('--xml_path', default='Annotations', type=str, help='input xml label path')
#数据集的划分，地址选择自己数据下的ImageSets/Main
parser.add_argument('--txt_path', default='ImageSets/Main', type=str, help='output txt label path')
opt = parser.parse_args()

trainval_percent = 1.0  # 训练集和验证集所占比例。 这里没有划分测试集
train_percent = 0.9     # 训练集所占比例，可自己进行调整
xmlfilepath = opt.xml_path
txtsavepath = opt.txt_path
total_xml = os.listdir(xmlfilepath)
if not os.path.exists(txtsavepath):
    os.makedirs(txtsavepath)

num = len(total_xml)
list_index = range(num)
tv = int(num * trainval_percent)
tr = int(tv * train_percent)
trainval = random.sample(list_index, tv)
train = random.sample(trainval, tr)

file_trainval = open(txtsavepath + '/trainval.txt', 'w')
file_test = open(txtsavepath + '/test.txt', 'w')
file_train = open(txtsavepath + '/train.txt', 'w')
file_val = open(txtsavepath + '/val.txt', 'w')

for i in list_index:
    name = total_xml[i][:-4] + '\n'
    if i in trainval:
        file_trainval.write(name)
        if i in train:
            file_train.write(name)
        else:
            file_val.write(name)
    else:
        file_test.write(name)

file_trainval.close()
file_train.close()
file_val.close()
file_test.close()
</code></pre>

<p>然后在<span style="color:#fe2c24;">data/VOCData/ImageSets/Main</span>目录下可以看到三个文件，就是划分的数据集合</p>

<p><img alt="" height="701" src="/image/ba2f2e3eea8203d6327b2a47ca6f3caa.png" width="463" /></p>

<p></p>

<p><img alt="" height="641" src="/image/2840dc601b4cfca42687b67c6767074b.png" width="1200" /></p>

<p></p>

<h1 id="%C2%A0%E6%8A%8A%E7%9B%B8%E5%BA%94%E7%9A%84%E6%96%87%E4%BB%B6%E8%B7%AF%E5%BE%84%E5%AD%98%E5%85%A5txt%E6%96%87%E4%BB%B6%E4%B8%AD%EF%BC%8Cxml%E8%BD%AC%E4%B8%BAtxt"> 把相应的文件路径存入txt文件中，<s>xml转为txt</s></h1>

<p>因为是用刚刚的应用程序来标注的图片文件所以就不需要把xml转为yolo格式的文件了</p>

<p>在VOCData目录下创建一个py文件（名称随意）</p>

<pre>
<code class="language-python">import os
from os import getcwd

abs_path = os.getcwd()
print(abs_path)
wd = getcwd()
for image_set in sets:
    image_ids = open('D:/yolov5/data/VOCData/ImageSets/Main/%s.txt' % (image_set)).read().strip().split()
   
    if not os.path.exists('D:/yolov5/data/VOCData/dataSet_path/'):
        os.makedirs('D:/yolov5/data/VOCData/dataSet_path/')
     
    list_file = open('dataSet_path/%s.txt' % (image_set), 'w')
    # 这行路径不需更改，这是相对路径
    for image_id in image_ids:
        list_file.write('D:/yolov5/data/VOCData/images/%s.jpg\n' % (image_id))
        convert_annotation(image_id)
    list_file.close()
</code></pre>

<p></p>

<p>这样就会在VOCData下出现这样一个文件夹</p>

<p><img alt="" height="194" src="/image/d6c0d0c098ac69d543eb13b60a96ee10.png" width="413" /></p>

<p>打开</p>

<p><img alt="" height="641" src="/image/f0845143a6da41c0b874e3a47c4c4fd5.png" width="1200" /></p>

<p></p>

<p>里面有各个文件的路径<span style="color:#4da8ee;">（因为没有划分test文件所以打开test.txt是空的） </span></p>

<p></p>

<p></p>

<p>最后需要把<span style="color:#fe2c24;">data/VOCData/Annotations</span>的文件移到文件夹<span style="color:#fe2c24;">labels</span>文件夹中（没有文件夹就自己创建）</p>

<p></p>

<h1 id="%E5%88%9B%E5%BB%BA%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6">创建配置文件</h1>

<p>在 yolov5 目录下的 data 文件夹下 <strong>新建一个 myvoc_1.yaml文件</strong>（可以自定义命名），用记事本打开。</p>

<p>内容是：</p>

<pre>
<code class="language-python">train: D:/yolov5/data/VOCData/dataSet_path/train.txt
val: D:/yolov5/data/VOCData/dataSet_path/val.txt
#文件的绝对路径（要改，注意是斜杠不是反斜杠）
#如果划分了test数据也需要加上去
# number of classes
nc: 2          #类别个数（要改）

# class names
names: ["light", "post"] #类别（要改）
</code></pre>

<p></p>

<h1 id="%E8%81%9A%E7%B1%BB%E8%8E%B7%E5%BE%97%E5%85%88%E9%AA%8C%E6%A1%86">聚类获得先验框</h1>

<h1></h1>

<p>因为什么提供的yolo版本很新所以一定在yolov5/utils下有 autoanchor.py文件（不用运行）</p>

<p>在model的文件夹中选择一个模型配置文件我选择的是yolov5s.yaml</p>

<p>官方的表格：</p>

<p><img alt="" height="310" src="/image/3f5a4fb8dd1eac86936cd721bce398c7.png" width="867" /></p>

<p>打开yolov5s.yaml</p>

<p><img alt="" height="634" src="/image/955988f10cd80895f20359f1612d4a75.png" width="1200" /></p>

<p>把nc的值改成标注的种类个数就行了</p>

<h1 id="%C2%A0%E5%BC%80%E5%A7%8B%E8%AE%AD%E7%BB%83"> 开始训练</h1>

<p>打开根目录的train.py</p>

<p><img alt="" height="612" src="/image/d08c156889da70f0682d7d8c8c8439f8.png" width="1200" /></p>

<p>有很多的数据</p>

<p>weights：权重文件路径</p>

<p>cfg：存储模型结构的配置文件</p>

<p>data：存储训练、测试数据的文件</p>

<p>epochs：指的就是训练过程中整个数据集将被迭代（训练）了多少次，显卡不行你就调小点。</p>

<p>batch-size：训练完多少张图片才进行权重更新，显卡不行就调小点。</p>

<p>img-size：输入图片宽高，显卡不行就调小点。</p>

<p>device：cuda device, i.e. 0 or 0,1,2,3 or cpu。选择使用GPU还是CPU</p>

<p>workers：线程数。默认是8。</p>

<p>noautoanchor：不自动检验更新anchors<br />
rect：进行矩形训练</p>

<p>resume：恢复最近保存的模型开始训练</p>

<p>nosave：仅保存最终checkpoint</p>

<p>notest：仅测试最后的epoch</p>

<p>evolve：进化超参数</p>

<p>bucket：gsutil bucket</p>

<p>cache-images：缓存图像以加快训练速度</p>

<p>name： 重命名results.txt to results_name.txt</p>

<p>adam：使用adam优化</p>

<p>multi-scale：多尺度训练，img-size +/- 50%</p>

<p>single-cls：单类别的训练集</p>

<h2 id="%C2%A0%E8%BF%90%E8%A1%8C%E6%96%87%E4%BB%B6%EF%BC%9A"> 运行文件：</h2>

<pre>
<code class="language-python">python train.py --weights weights/yolov5s.pt  --cfg models/yolov5s.yaml  --data data/myvoc.yaml --epoch 200 --batch-size 8 --img 640   --device cpu
</code></pre>

<h1 id="%E7%94%A8gpu%E8%AE%AD%E7%BB%83">用gpu训练</h1>

<h2 id="%E6%9F%A5%E7%9C%8Bcuda%E7%89%88%E6%9C%AC">查看cuda版本</h2>

<p>首先看看自己的gpu型号（a卡跑不了ai）</p>

<p>输入</p>

<pre>
<code class="language-python">nvidia-smi</code></pre>

<h1 id="%E2%80%8B%E7%BC%96%E8%BE%91"><img alt="" height="639" src="/image/eb2c18de163167825db548954f94ca5f.png" width="1200" /></h1>

<p>选择高于他的版本的pytorch</p>

<h2 id="%E5%AE%89%E8%A3%85pytorch">安装pytorch</h2>

<p> 打开pytorch官网</p>

<p><a data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.0/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N4P3" data-link-title="PyTorch" href="https://pytorch.org/" title="PyTorch">PyTorch</a></p>

<p><img alt="" height="533" src="/image/c25e6f70eb32be2907ce83a073121007.png" width="1200" /></p>

<p></p>

<p>把这个117改成你要安装的版本11.6就改成116</p>

<h2 id="%E8%AE%AD%E7%BB%83">训练</h2>

<p>最后开始训练</p>

<p>其实就是把--device的值改一下</p>

<p>打开任务管理器——性能</p>

<p><img alt="" height="585" src="/image/308aa1e934c25fdf8765e4a2442a92ed.png" width="243" /></p>

<p></p>

<p>0号gpu就写--device 0</p>

<pre>
<code class="language-python">python train.py --weights weights/yolov5s.pt  --cfg models/yolov5s.yaml  --data data/myvoc.yaml --epoch 200 --batch-size 8 --img 640   --device cpu
</code></pre>

<p></p>

<h1 id="%E9%97%AE%E9%A2%98">问题</h1>

<h2 id="%E5%A6%82%E6%9E%9C%E5%87%BA%E7%8E%B0%20%EF%BC%88%E9%A1%B5%E9%9D%A2%E5%A4%AA%E5%B0%8F%EF%BC%8C%E6%97%A0%E6%B3%95%E5%AE%8C%E6%88%90%E6%93%8D%E4%BD%9C%EF%BC%89%E7%9A%84%E7%9B%B8%E5%85%B3%E9%97%AE%E9%A2%98">如果出现 （页面太小，无法完成操作）的相关问题</h2>

<p>打开train.py</p>

<p>降低线程 --workes (默认是8) 。最后再试试调小 --batch-size，降低 --epoch</p>

<p>然后把刚刚运行的命令改一下参数我把worker改成1才可以跑</p>

<p></p>

<h1 id="%C2%A0%E5%8F%82%E8%80%83%E6%96%87%E7%AB%A0%EF%BC%9A"> 参考文章：</h1>

<p><a class="link-info" data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.0/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N4P3" data-link-title="文章链接" href="https://blog.csdn.net/qq_45945548/article/details/121701492" title="文章链接">文章链接</a></p>
