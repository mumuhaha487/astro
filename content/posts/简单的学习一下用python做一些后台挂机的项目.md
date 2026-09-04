---
title: 简单的学习一下用python做一些后台挂机的项目
published: 2023-08-28
tags: [学习]
category: python
image: /images/demo-avatar.webp
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="%E5%A3%B0%E6%98%8E-toc" style="margin-left:40px;"><a href="#%E5%A3%B0%E6%98%8E">声明</a></p>

<p id="%E5%89%8D%E5%9B%A0-toc" style="margin-left:40px;"><a href="#%E5%89%8D%E5%9B%A0">前因</a></p>

<p id="%E6%89%BEpython%E5%8C%85-toc" style="margin-left:0px;"><a href="#%E6%89%BEpython%E5%8C%85">找python包</a></p>

<p id="%E9%80%89%E6%8B%A9%E5%8E%9F%E5%9B%A0-toc" style="margin-left:40px;"><a href="#%E9%80%89%E6%8B%A9%E5%8E%9F%E5%9B%A0">选择原因</a></p>

<p id="%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E4%BB%A3%E7%A0%81">代码</a></p>

<p id="test_1.py-toc" style="margin-left:40px;"><a href="#test_1.py">test_1.py</a></p>

<p id="%E7%AE%80%E5%8D%95%E7%9A%84%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90-toc" style="margin-left:0px;"><a href="#%E7%AE%80%E5%8D%95%E7%9A%84%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90">简单的代码解析</a></p>

<p id="def%20Gethandle()-toc" style="margin-left:40px;"><a href="#def%20Gethandle()">def Gethandle()</a></p>

<p id="def%20GetClick(handle)-toc" style="margin-left:40px;"><a href="#def%20GetClick(handle)">def GetClick(handle)</a></p>

<p id="def%20doClick(cx%2C%20cy%20%2Chandle)-toc" style="margin-left:40px;"><a href="#def%20doClick(cx%2C%20cy%20%2Chandle)">def doClick(cx, cy ,handle)</a></p>

<p id="def%20runTest_1()-toc" style="margin-left:40px;"><a href="#def%20runTest_1()">def runTest_1()</a></p>

<p id="%E8%BF%90%E8%A1%8C%E4%BB%A3%E7%A0%81%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98-toc" style="margin-left:0px;"><a href="#%E8%BF%90%E8%A1%8C%E4%BB%A3%E7%A0%81%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98">运行代码的一些问题</a></p>

<p id="%E4%B8%80%E4%BA%9B%E6%83%B3%E6%B3%95-toc" style="margin-left:40px;"><a href="#%E4%B8%80%E4%BA%9B%E6%83%B3%E6%B3%95">一些想法</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>本篇博客只是记录我的学习win32包时写下的代码</p>

<h2 id="%E5%A3%B0%E6%98%8E">声明</h2>

<p>部分代码参考了这个博主的博客</p>

<p><a class="has-card" data-link-desc="软件准备需要用到的软件PyCharm，梦幻西游手游客户端需要安装的库pip install pywin32直接上代码吧，里面都注释好了注意！！！！！需要登录到游戏账号后才能正确点击原因是登录界面需要重新抓取窗口句柄代码有些乱，但是都还好，自行优化吧能用=import win32guiimport win32conimport win32apiimport timeimpo..._win32模拟梦幻点击事件" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="python使用win32后台鼠标点击梦幻西游（只用于开学习技术）新手学习_win32模拟梦幻点击事件_weixin_47344599的博客-CSDN博客" href="https://blog.csdn.net/weixin_47344599/article/details/105926993" title="python使用win32后台鼠标点击梦幻西游（只用于开学习技术）新手学习_win32模拟梦幻点击事件_weixin_47344599的博客-CSDN博客"><span class="link-card-box"><span class="link-title">python使用win32后台鼠标点击梦幻西游（只用于开学习技术）新手学习_win32模拟梦幻点击事件_weixin_47344599的博客-CSDN博客</span><span class="link-desc">软件准备需要用到的软件PyCharm，梦幻西游手游客户端需要安装的库pip install pywin32直接上代码吧，里面都注释好了注意！！！！！需要登录到游戏账号后才能正确点击原因是登录界面需要重新抓取窗口句柄代码有些乱，但是都还好，自行优化吧能用=import win32guiimport win32conimport win32apiimport timeimpo..._win32模拟梦幻点击事件</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/weixin_47344599/article/details/105926993</span></span></a></p>

<p>自认为这位大佬写的代码有挺多区别的</p>

<p>但是这位博主看到了，如果觉得还是不行。联系我进行修改。 </p>

<h2 id="%E5%89%8D%E5%9B%A0">前因</h2>

<p> 由于自己最近在玩崩铁</p>

<p>近几年的米家游戏都不能跳过剧情（烦~</p>

<p>按键精灵是个好东西，但是他必须要前台挂着（得寸进尺。。。</p>

<p>我想要做的是我一边挂着剧情后台自动点击，一边做其他的事情（很美好嘞</p>

<p>然后一如既往出了一系列问题（不然我觉得早就有人做出来了，目前就卡在这，以下是我的探索过程）</p>

<p><img alt="" height="150" src="/image/ddbe42982255c0b464e14ddd7fd399a8.gif" width="260" /></p>

<h1 id="%E6%89%BEpython%E5%8C%85">找python包</h1>

<p>然后我就找python包</p>

<p>找啊找......</p>

<p>找到两类包</p>

<p><span style="color:#fe2c24;"><span style="background-color:#ffd900;">一个pyautogui包</span></span></p>

<p><span style="color:#fe2c24;"><span style="background-color:#ffd900;">一个就是pypiwin32包</span></span></p>

<p> 两个包我考虑了一会</p>

<p>最终想试试pypiwin32包</p>

<h2 id="%E9%80%89%E6%8B%A9%E5%8E%9F%E5%9B%A0">选择原因</h2>

<p>因为我看了一下第一种包的使用教程以及例子（只是浅浅的看了一下，没有深看，如果有的话轻点喷）发现他也是类似与按键精灵的那种模拟键盘的点击</p>

<p>那不都差不多吗？</p>

<p>然后我就选择了可以后台向固定窗口发送后台点击信息的win32包</p>

<p>然后我就试着打了一段代码</p>

<h1 id="%E4%BB%A3%E7%A0%81">代码</h1>

<h2 id="test_1.py">test_1.py</h2>

<pre>
<code class="language-python">import win32gui
import win32con
import win32api
import time

#获取句柄
def Gethandle():
    time_1=5
    print("五秒后，把鼠标移动到窗口处定位窗口句柄")
    for i in range(1,time_1):
        time.sleep(1)
        print(f"还有{time_1-i}秒")

    # 获取当前鼠标【x y】坐标
    point = win32api.GetCursorPos()
    # 通过坐标获取坐标下的【窗口句柄】
    hwnd = win32gui.WindowFromPoint(point)  # 请填写 x 和 y 坐标
    print("获取句柄为",hwnd)
    return hwnd


#开始行动
def GetClick(handle):
    times = 6
    if handle == 0:
        for i in range(10):
            print("没有获取到窗口")
    else:
        left, top, right, bot = win32gui.GetWindowRect(handle)  # 窗口所在位置的坐标
        for t in range(5):
            times -= 1
            print('将在倒数%d秒后点击现在的位置' % times)
            tempt = win32api.GetCursorPos()  # 记录鼠标所处位置的坐标
            windowRec = win32gui.GetWindowRect(handle)  # 目标子句柄窗口的坐标
            x = tempt[0] - windowRec[0]  # 计算相对x坐标
            y = tempt[1] - windowRec[1]  # 计算相对y坐标
            print('坐标为', x, y)
            time.sleep(1)  # 每1s输出一次

    if(x&gt;0 and x&lt;(right-left) and y&gt;0 and y&lt;(bot-top)):
        doClick(x,y,handle)
        print("点击完成")
        print("信息如下")
        print('left',left,'right',right,'top',top,'bot',bot)

    elif x &gt; 9999 and y &gt; 9999:
        for i in range(10):
            print('程序不能最小化')
            break
    else:
        for i in range(10):
            print('鼠标不在界面')
            break




def doClick(cx, cy ,handle):  # 点击坐标

    print('点击相对坐标', cx, cy, '坐标')
    long_position = win32api.MAKELONG(cx, cy)  # 模拟鼠标指针 传送到指定坐标
    win32api.SendMessage(handle, win32con.WM_LBUTTONDOWN, win32con.MK_LBUTTON, long_position)  # 模拟鼠标按下
    win32api.SendMessage(handle, win32con.WM_LBUTTONUP, win32con.MK_LBUTTON, long_position)  # 模拟鼠标弹起


def runTest_1():
    handle=Gethandle()
    GetClick(handle)


runTest_1()</code></pre>

<p>给大部分函数全部封装到一起，要的直接调用runTest_1()这个函数就可以了</p>

<h1 id="%E7%AE%80%E5%8D%95%E7%9A%84%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90">简单的代码解析</h1>

<h2 id="def%20Gethandle()">def Gethandle()</h2>

<p>这个函数用于获取句柄，获取方式就是通过<span style="background-color:#38d8f0;">win32api.GetCursorPos()</span>函数获取鼠标的位置然后通过位置和<span style="background-color:#38d8f0;">win32gui.WindowFromPoint()</span>函数来判断该窗口的句柄</p>

<p>进而来定位窗口</p>

<p>最后返回句柄</p>

<h2 id="def%20GetClick(handle)">def GetClick(handle)</h2>

<p>这个函数主要是通过传递handle（句柄值）来模拟点击</p>

<p>（这里只是最基本的点击）</p>

<p>同时判断窗口是否最小化，以及鼠标相较于窗口的相对位置</p>

<p>以及是不是在窗口里的鼠标动作</p>

<h2 id="def%20doClick(cx%2C%20cy%20%2Chandle)">def doClick(cx, cy ,handle)</h2>

<p>很简单的函数</p>

<p>传入xy的相对坐标同时模拟点击</p>

<h2 id="def%20runTest_1()">def runTest_1()</h2>

<p>集合在一起同时执行所有函数</p>

<p></p>

<h1 id="%E8%BF%90%E8%A1%8C%E4%BB%A3%E7%A0%81%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98">运行代码的一些问题</h1>

<p>这个代码十分的简单（本来想的就是先看看能不能行）</p>

<p>就是运行后把鼠标过5秒定位到窗口，之后过五秒自动点击鼠标的位置</p>

<p>然后我在QQ，微信，谷歌浏览器上运行时都发现没效果，包括<span style="color:#fe2c24;"><span style="background-color:#ffd900;">pyautogui</span></span>也不行</p>

<p>当时由于一些巧合发现了其中的问题，好像时权限不够</p>

<p>最后发现需要用管理员来运行pycharm就得以解决</p>

<p>然后QQ，微信，谷歌浏览器上面运行都可以运行</p>

<p>我当时特别激动</p>

<p>但是</p>

<p>游戏里面无法点击</p>

<p>我改了又改还是不行，估摸着应该是一些游戏屏蔽了后台通过软件发送鼠标点击事件以及键盘输入事件的命令</p>

<h2 id="%E4%B8%80%E4%BA%9B%E6%83%B3%E6%B3%95">一些想法</h2>

<p>pyautogui应该可以，但是我还是觉得用这个不如用按键精灵省事。</p>

<p>马上要开学了，懒得整，过一段时间想想看看有没有法子</p>

<p></p>

<p><img alt="" height="143" src="/image/1ebfd922f8e854389ce7f5d05bf915b6.jpeg" width="177" /></p>
