---
title: 用python从零开始做一个最简单的小说爬虫带GUI界面（1/3)
published: 2023-08-20
tags: [python,爬虫,开发语言,网络]
category: python
image: /_image/?href=%2F%40fs%2Fworkspace%2Ffuwari%2Fsrc%2Fassets%2Fimages%2Fdemo-avatar.png%3ForigWidth%3D700%26origHeight%3D700%26origFormat%3Djpg&w=700&h=700&f=webp
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E4%B8%8B%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9-toc" style="margin-left:40px;"><a href="#%E4%B8%8B%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9">下一章内容</a></p>

<p id="PyQt5%E7%9A%84%E9%85%8D%E7%BD%AE-toc" style="margin-left:0px;"><a href="#PyQt5%E7%9A%84%E9%85%8D%E7%BD%AE">PyQt5的配置</a></p>

<p id="%C2%A0%E8%AE%BE%E7%BD%AE%E8%BD%AF%E4%BB%B6%E7%9A%84%E5%BF%AB%E6%8D%B7%E5%90%AF%E5%8A%A8%E6%96%B9%E5%BC%8F-toc" style="margin-left:40px;"><a href="#%C2%A0%E8%AE%BE%E7%BD%AE%E8%BD%AF%E4%BB%B6%E7%9A%84%E5%BF%AB%E6%8D%B7%E5%90%AF%E5%8A%A8%E6%96%B9%E5%BC%8F"> 设置软件的快捷启动方式</a></p>

<p id="1.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E7%94%A8%E4%BA%8E%E8%AE%BE%E8%AE%A1%E7%95%8C%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F-toc" style="margin-left:80px;"><a href="#1.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E7%94%A8%E4%BA%8E%E8%AE%BE%E8%AE%A1%E7%95%8C%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F">1.        用于设计界面的程序</a></p>

<p id="2.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E5%B0%86Qt%20Designer%E8%AE%BE%E8%AE%A1%E5%87%BA%E6%9D%A5%E7%9A%84ui%E6%96%87%E4%BB%B6%E8%BD%AC%E5%8C%96%E4%B8%BApy%E6%96%87%E4%BB%B6-toc" style="margin-left:80px;"><a href="#2.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E5%B0%86Qt%20Designer%E8%AE%BE%E8%AE%A1%E5%87%BA%E6%9D%A5%E7%9A%84ui%E6%96%87%E4%BB%B6%E8%BD%AC%E5%8C%96%E4%B8%BApy%E6%96%87%E4%BB%B6">2.        将Qt Designer设计出来的ui文件转化为py文件</a></p>

<p id="3.%C2%A0%20%C2%A0%20%C2%A0%20%C2%A0%20%E5%8F%AF%E4%BB%A5%E6%8A%8Apy%E6%96%87%E4%BB%B6%E6%89%93%E5%8C%85%E6%88%90%E5%8F%AF%E6%89%A7%E8%A1%8C%E7%9A%84exe%E6%96%87%E4%BB%B6-toc" style="margin-left:80px;"><a href="#3.%C2%A0%20%C2%A0%20%C2%A0%20%C2%A0%20%E5%8F%AF%E4%BB%A5%E6%8A%8Apy%E6%96%87%E4%BB%B6%E6%89%93%E5%8C%85%E6%88%90%E5%8F%AF%E6%89%A7%E8%A1%8C%E7%9A%84exe%E6%96%87%E4%BB%B6">3.        可以把py文件打包成可执行的exe文件</a></p>

<p id="4.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E5%B0%86ico%E5%9B%BE%E7%89%87%E6%94%BE%E5%9C%A8qrc%E6%96%87%E4%BB%B6%E4%B8%AD%EF%BC%8C%E5%86%8D%E5%B0%86qrc%E6%96%87%E4%BB%B6%E8%BD%AC%E6%8D%A2%E6%88%90py%E6%96%87%E4%BB%B6%EF%BC%8C%E7%94%A8%E4%BA%8E%E5%B0%8F%E5%B7%A5%E5%85%B7%E7%9A%84%E5%9B%BE%E6%A0%87-toc" style="margin-left:80px;"><a href="#4.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E5%B0%86ico%E5%9B%BE%E7%89%87%E6%94%BE%E5%9C%A8qrc%E6%96%87%E4%BB%B6%E4%B8%AD%EF%BC%8C%E5%86%8D%E5%B0%86qrc%E6%96%87%E4%BB%B6%E8%BD%AC%E6%8D%A2%E6%88%90py%E6%96%87%E4%BB%B6%EF%BC%8C%E7%94%A8%E4%BA%8E%E5%B0%8F%E5%B7%A5%E5%85%B7%E7%9A%84%E5%9B%BE%E6%A0%87">4.        将ico图片放在qrc文件中，再将qrc文件转换成py文件，用于小工具的图标</a></p>

<p id="%E5%BF%AB%E6%8D%B7%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95-toc" style="margin-left:40px;"><a href="#%E5%BF%AB%E6%8D%B7%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95">快捷使用方法</a></p>

<p id="%C2%A0%E8%AE%BE%E8%AE%A1%E7%95%8C%E9%9D%A2-toc" style="margin-left:0px;"><a href="#%C2%A0%E8%AE%BE%E8%AE%A1%E7%95%8C%E9%9D%A2"> 设计界面</a></p>

<p id="%E6%8A%8A%E8%AE%BE%E8%AE%A1%E7%9A%84ui%E7%95%8C%E9%9D%A2%E7%9A%84ui%E6%96%87%E4%BB%B6%E8%BD%AC%E4%B8%BApy%E6%96%87%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E6%8A%8A%E8%AE%BE%E8%AE%A1%E7%9A%84ui%E7%95%8C%E9%9D%A2%E7%9A%84ui%E6%96%87%E4%BB%B6%E8%BD%AC%E4%B8%BApy%E6%96%87%E4%BB%B6">把设计的ui界面的ui文件转为py文件</a></p>

<p id="main%E6%96%87%E4%BB%B6%E4%B8%AD%E7%9A%84%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#main%E6%96%87%E4%BB%B6%E4%B8%AD%E7%9A%84%E4%BB%A3%E7%A0%81">main文件中的代码</a></p>

<hr id="hr-toc" /><p></p>

<h2 id="%E4%B8%8B%E4%B8%80%E7%AB%A0%E5%86%85%E5%AE%B9">下一章内容</h2>

<p><a class="has-card" data-link-desc="前一章博客我们讲了怎么通过PyQt5来制作图形化界面，并且进行一些基本设置接下来两章我们主要讲核心爬虫代码的实现。" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="用python从零开始做一个最简单的小说爬虫带GUI界面（2/3）_木木em哈哈的博客-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/132457770?spm=1001.2014.3001.5501" title="用python从零开始做一个最简单的小说爬虫带GUI界面（2/3）_木木em哈哈的博客-CSDN博客"><span class="link-card-box"><span class="link-title">用python从零开始做一个最简单的小说爬虫带GUI界面（2/3）_木木em哈哈的博客-CSDN博客</span><span class="link-desc">前一章博客我们讲了怎么通过PyQt5来制作图形化界面，并且进行一些基本设置接下来两章我们主要讲核心爬虫代码的实现。</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/mumuemhaha/article/details/132457770?spm=1001.2014.3001.5501</span></span></a></p>

<p></p>

<h1 id="PyQt5%E7%9A%84%E9%85%8D%E7%BD%AE">PyQt5的配置</h1>

<p>配置其他的博主上有教程</p>

<p>建议安装以下包（最好在你原来的电脑环境也就是你电脑的cmd中输入以下命令，不要在pycharm创建的虚拟环境下创建，防止项目删除后软件打不开）</p>

<pre>
<code class="language-bash">pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple PyQt5
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple PyQt5-tools
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple paramiko
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple pyinstaller</code></pre>

<p><span style="color:#ffd900;"><span style="background-color:#fe2c24;"> 当然在pycharm中也要安装一遍</span></span></p>

<p> 之后在设置中</p>

<p><img alt="" height="1030" src="/image/30be791afb3463d2a1e5b2944e329424.png" width="1200" /></p>

<p> 选择工具-&gt;外部工具-&gt;加号</p>

<p><img alt="" height="911" src="/image/38a651457a998b58f6ade799bc982cd9.png" width="1200" /></p>

<h2 id="%C2%A0%E8%AE%BE%E7%BD%AE%E8%BD%AF%E4%BB%B6%E7%9A%84%E5%BF%AB%E6%8D%B7%E5%90%AF%E5%8A%A8%E6%96%B9%E5%BC%8F"> 设置软件的快捷启动方式</h2>

<p> 然后依次新建如下内容</p>

<h3 id="1.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E7%94%A8%E4%BA%8E%E8%AE%BE%E8%AE%A1%E7%95%8C%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F">1.        用于设计界面的程序</h3>

<pre>
<code class="language-bash">名称：Qt Designer
工具设置
    程序：C:\Users\你的用户名\AppData\Local\Programs\Python\你的python版本\Lib\site-packages\qt5_applications\Qt\bin\designer.exe
    工作目录：$FileDir$</code></pre>

<h3 id="2.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E5%B0%86Qt%20Designer%E8%AE%BE%E8%AE%A1%E5%87%BA%E6%9D%A5%E7%9A%84ui%E6%96%87%E4%BB%B6%E8%BD%AC%E5%8C%96%E4%B8%BApy%E6%96%87%E4%BB%B6">2.        将Qt Designer设计出来的ui文件转化为py文件</h3>

<pre>
<code class="language-bash">名称：PyUIC
工具设置：
    程序：C:\Users\你的用户名\AppData\Local\Programs\Python\你的python版本\Scripts\pyuic5.exe
    实参：$FileName$ -o $FileNameWithoutExtension$.py 
    工具目录：$FileDir$</code></pre>

<h3 id="3.%C2%A0%20%C2%A0%20%C2%A0%20%C2%A0%20%E5%8F%AF%E4%BB%A5%E6%8A%8Apy%E6%96%87%E4%BB%B6%E6%89%93%E5%8C%85%E6%88%90%E5%8F%AF%E6%89%A7%E8%A1%8C%E7%9A%84exe%E6%96%87%E4%BB%B6">3.        可以把py文件打包成可执行的exe文件</h3>

<pre>
<code class="language-bash">名称：PyInstall 
工具设置：
    程序：C:\Users\你的用户名\AppData\Local\Programs\Python\你的python版本\Scripts\pyinstaller.exe
    实参： -F -w  $FileNameWithoutExtension$.py
    工作目录：$FileDir$
</code></pre>

<h3 id="4.%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%E5%B0%86ico%E5%9B%BE%E7%89%87%E6%94%BE%E5%9C%A8qrc%E6%96%87%E4%BB%B6%E4%B8%AD%EF%BC%8C%E5%86%8D%E5%B0%86qrc%E6%96%87%E4%BB%B6%E8%BD%AC%E6%8D%A2%E6%88%90py%E6%96%87%E4%BB%B6%EF%BC%8C%E7%94%A8%E4%BA%8E%E5%B0%8F%E5%B7%A5%E5%85%B7%E7%9A%84%E5%9B%BE%E6%A0%87">4.        将ico图片放在qrc文件中，再将qrc文件转换成py文件，用于小工具的图标</h3>

<pre>
<code class="language-bash">名称：pyrcc 
工具设置：
    程序：C:\Users\你的名字\AppData\Local\Programs\Python\你的Python3版本\Scripts\pyrcc5.exe
    实参：$FileName$ -o $FileNameWithoutExtension$.py 
    工作目录：$FileDir$</code></pre>

<p>写完后点击应用即可</p>

<p></p>

<h2 id="%E5%BF%AB%E6%8D%B7%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95">快捷使用方法</h2>

<p>然后你可以点击左三角的</p>

<p>工具-&gt;外部工具中快捷使用</p>

<p><img alt="" height="1030" src="/image/8e2a5ed2b466212391440fc85b54d7e7.png" width="1200" /></p>

<h1 id="%C2%A0%E8%AE%BE%E8%AE%A1%E7%95%8C%E9%9D%A2"> 设计界面</h1>

<p> 然后我们点击Qt Designer开始设计界面</p>

<p><img alt="" height="1030" src="/image/94b6161cc7f6aab366b22ac8a33c5b46.png" width="1200" /></p>

<p> 然后开始创建一个窗口</p>

<p><img alt="" height="1030" src="/image/a05b395e8812cdee3f68cb4c4733fb5c.png" width="1200" /></p>

<p></p>

<p>进入后按照自己的喜好创建窗口</p>

<p><img alt="" height="1030" src="/image/9e76740bbdb318dfaae72191beec3486.png" width="1200" /></p>

<p> 高级的使用方法不进行介绍</p>

<p>我用到的有</p>

<p>label：就是框框中的文字</p>

<p><img alt="" height="1030" src="/image/2b8a4ee4ca3eeee4d426aad644ed92cc.png" width="1200" /></p>

<p> line edit：用于获取输入的链接</p>

<p><img alt="" height="1030" src="/image/bfc6368b1f16d42fb298e097251347ca.png" width="1200" /></p>

<p> Push Button：用于设置触发按钮，比如开始爬取或者关闭窗口</p>

<p><img alt="" height="1030" src="/image/6bac130a6912422dd3012ce591e7ce0d.png" width="1200" /></p>

<p> Text Browser：用于输出程序的结果（可不加，给用户看的）</p>

<p> <img alt="" height="1030" src="/image/796d909fc1c8ee55a0df5049bf2e2067.png" width="1200" /></p>

<p> 点击控件后右边的框框会显示是哪一个控件</p>

<p>建议重新命名一边名称，不然会很难记</p>

<p><img alt="" height="1030" src="/image/3f5d3cee900bd7b8b9e56b2ec81f41b0.png" width="1200" /></p>

<p> 设计完成后就可以点击保存了，默认保存到你python项目的根目录</p>

<h1 id="%E6%8A%8A%E8%AE%BE%E8%AE%A1%E7%9A%84ui%E7%95%8C%E9%9D%A2%E7%9A%84ui%E6%96%87%E4%BB%B6%E8%BD%AC%E4%B8%BApy%E6%96%87%E4%BB%B6">把设计的ui界面的ui文件转为py文件</h1>

<p></p>

<p>由于我们设置了快捷方式</p>

<p>我们可以非常便捷右键ui文件然后执行PyUIC工具 </p>

<p><img alt="" height="1030" src="/image/ed59c64047bfd95e1de583b317dc4f95.png" width="1200" /></p>

<p> 之后你就可以在项目的文件目录下找到同名称的py文件</p>

<p>亦或者你可以执行命令</p>

<pre>
<code class="language-bash">pyuic5 -o 原ui文件名称 输出的py文件名称</code></pre>

<p>编译出来的文件大概长这样</p>

<p><img alt="" height="1030" src="/image/33f421a9df8e6d3d424711829d8f46c1.png" width="1200" /></p>

<p> 文件的代码就是</p>

<pre>
<code class="language-python"># -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'win.ui'
#
# Created by: PyQt5 UI code generator 5.15.9
#
# WARNING: Any manual changes made to this file will be lost when pyuic5 is
# run again.  Do not edit this file unless you know what you are doing.


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(679, 485)
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")
        self.Button_run = QtWidgets.QPushButton(self.centralwidget)
        self.Button_run.setGeometry(QtCore.QRect(50, 240, 121, 41))
        self.Button_run.setObjectName("Button_run")
        self.Button_close = QtWidgets.QPushButton(self.centralwidget)
        self.Button_close.setGeometry(QtCore.QRect(220, 240, 121, 41))
        self.Button_close.setObjectName("Button_close")
        self.label_link = QtWidgets.QLabel(self.centralwidget)
        self.label_link.setGeometry(QtCore.QRect(60, 110, 71, 21))
        self.label_link.setObjectName("label_link")
        self.line_link = QtWidgets.QLineEdit(self.centralwidget)
        self.line_link.setGeometry(QtCore.QRect(130, 110, 211, 21))
        self.line_link.setObjectName("line_link")
        self.text_result = QtWidgets.QTextEdit(self.centralwidget)
        self.text_result.setGeometry(QtCore.QRect(370, 110, 291, 321))
        self.text_result.setObjectName("text_result")
        MainWindow.setCentralWidget(self.centralwidget)
        self.menubar = QtWidgets.QMenuBar(MainWindow)
        self.menubar.setGeometry(QtCore.QRect(0, 0, 679, 26))
        self.menubar.setObjectName("menubar")
        MainWindow.setMenuBar(self.menubar)
        self.statusbar = QtWidgets.QStatusBar(MainWindow)
        self.statusbar.setObjectName("statusbar")
        MainWindow.setStatusBar(self.statusbar)

        self.retranslateUi(MainWindow)
        QtCore.QMetaObject.connectSlotsByName(MainWindow)

    def retranslateUi(self, MainWindow):
        _translate = QtCore.QCoreApplication.translate
        MainWindow.setWindowTitle(_translate("MainWindow", "爬虫"))
        self.Button_run.setText(_translate("MainWindow", "开始爬取"))
        self.Button_close.setText(_translate("MainWindow", "关闭"))
        self.label_link.setText(_translate("MainWindow", "目录链接"))
</code></pre>

<h1 id="main%E6%96%87%E4%BB%B6%E4%B8%AD%E7%9A%84%E4%BB%A3%E7%A0%81">main文件中的代码</h1>

<p>创建一个文件命名为main.py（用来存放我们的主程序）</p>

<pre>
<code class="language-python">import sys
# PyQt5中使用的基本控件都在PyQt5.QtWidgets模块中
from PyQt5.QtWidgets import QApplication, QMainWindow
# 导入designer工具生成的login模块
from win import Ui_MainWindow
import time</code></pre>

<p>而win是我刚刚窗口文件编译出来文件Ui_mainWindow是我的类名</p>

<p>（不要一股脑的抄，依葫芦画瓢就行） </p>

<p><img alt="" height="1030" src="/image/98434d85e93aee249e490c4bfae74df2.png" width="1200" /></p>

<pre>
<code class="language-python">class MyMainForm(QMainWindow, Ui_MainWindow):
    def __init__(self, parent=None):
        super(MyMainForm, self).__init__(parent)
        self.setupUi(self)


if __name__ == "__main__":
    # 固定的，PyQt5程序都需要QApplication对象。sys.argv是命令行参数列表，确保程序可以双击运行
    app = QApplication(sys.argv)
    # 初始化
    myWin = MyMainForm()
    # 将窗口控件显示在屏幕上
    myWin.show()
    # 程序运行，sys.exit方法确保程序完整退出。
    sys.exit(app.exec_())</code></pre>

<p>合在一起，然后运行，就可以看到出现了一个窗口</p>

<p>但是我们的按钮没有任何作用</p>

<p>接下来我们就要用函数绑定按下按钮的事件</p>

<p>刚刚的函数中的</p>

<pre>
<code class="language-python">    def __init__(self, parent=None):
        super(MyMainForm, self).__init__(parent)
        self.setupUi(self)</code></pre>

<p>可以变为这个 （意思就是按下Button_close的按钮触发close函数，这个函数不用自己定义，按下Button_run按钮执行F_run函数，这个要我们自己定义了）</p>

<pre>
<code class="language-python">    def __init__(self, parent=None):
        super(MyMainForm, self).__init__(parent)
        self.setupUi(self)
        self.Button_close.clicked.connect(self.close)
        self.Button_run.clicked.connect(self.F_run)</code></pre>

<p></p>
