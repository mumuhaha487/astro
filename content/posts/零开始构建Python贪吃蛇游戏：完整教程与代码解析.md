---
title: 零开始构建Python贪吃蛇游戏：完整教程与代码解析
published: 2025-03-10
tags: [pygame,python,开发语言]
category: python
---

<!--more-->

<p id="main-toc" name="tableOfContents"><strong>目录</strong></p>

<p id="-toc" name="tableOfContents" style="margin-left:40px"></p>

<p id="%E5%BC%95%E8%A8%80-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E5%BC%95%E8%A8%80" target="_self">引言</a></p>

<p id="%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C" target="_self">游戏开发准备工作</a></p>

<p id="%E5%AE%89%E8%A3%85Python%E5%92%8CPygame-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%AE%89%E8%A3%85Python%E5%92%8CPygame" target="_self">安装Python和Pygame</a></p>

<p id="%E4%BA%86%E8%A7%A3%E6%B8%B8%E6%88%8F%E5%9F%BA%E6%9C%AC%E5%8E%9F%E7%90%86-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E4%BA%86%E8%A7%A3%E6%B8%B8%E6%88%8F%E5%9F%BA%E6%9C%AC%E5%8E%9F%E7%90%86" target="_self">了解游戏基本原理</a></p>

<p id="%E6%B8%B8%E6%88%8F%E5%9F%BA%E7%A1%80%E6%9E%B6%E6%9E%84-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%B8%B8%E6%88%8F%E5%9F%BA%E7%A1%80%E6%9E%B6%E6%9E%84" target="_self">游戏基础架构</a></p>

<p id="%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B8%B8%E6%88%8F%E7%8E%AF%E5%A2%83-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B8%B8%E6%88%8F%E7%8E%AF%E5%A2%83" target="_self">初始化游戏环境</a></p>

<p id="%E8%AE%BE%E7%BD%AE%E6%B8%B8%E6%88%8F%E7%AA%97%E5%8F%A3-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E8%AE%BE%E7%BD%AE%E6%B8%B8%E6%88%8F%E7%AA%97%E5%8F%A3" target="_self">设置游戏窗口</a></p>

<p id="%E5%AE%9A%E4%B9%89%E9%A2%9C%E8%89%B2%E5%92%8C%E5%B8%B8%E9%87%8F-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%AE%9A%E4%B9%89%E9%A2%9C%E8%89%B2%E5%92%8C%E5%B8%B8%E9%87%8F" target="_self">定义颜色和常量</a></p>

<p id="%E6%A0%B8%E5%BF%83%E6%B8%B8%E6%88%8F%E5%85%83%E7%B4%A0-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%A0%B8%E5%BF%83%E6%B8%B8%E6%88%8F%E5%85%83%E7%B4%A0" target="_self">核心游戏元素</a></p>

<p id="%E8%9B%87%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E8%9B%87%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0" target="_self">蛇的设计与实现</a></p>

<p id="%E9%A3%9F%E7%89%A9%E7%B3%BB%E7%BB%9F-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E9%A3%9F%E7%89%A9%E7%B3%BB%E7%BB%9F" target="_self">食物系统</a></p>

<p id="%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B" target="_self">碰撞检测</a></p>

<p id="%E6%B8%B8%E6%88%8F%E6%8E%A7%E5%88%B6%E4%B8%8E%E4%BA%A4%E4%BA%92-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%B8%B8%E6%88%8F%E6%8E%A7%E5%88%B6%E4%B8%8E%E4%BA%A4%E4%BA%92" target="_self">游戏控制与交互</a></p>

<p id="%E9%94%AE%E7%9B%98%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E9%94%AE%E7%9B%98%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86" target="_self">键盘输入处理</a></p>

<p id="%E7%A7%BB%E5%8A%A8%E6%9C%BA%E5%88%B6-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E7%A7%BB%E5%8A%A8%E6%9C%BA%E5%88%B6" target="_self">移动机制</a></p>

<p id="%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1" target="_self">游戏界面设计</a></p>

<p id="%E5%88%86%E6%95%B0%E6%98%BE%E7%A4%BA-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%88%86%E6%95%B0%E6%98%BE%E7%A4%BA" target="_self">分数显示</a></p>

<p id="%E6%B8%B8%E6%88%8F%E6%B6%88%E6%81%AF-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E6%B8%B8%E6%88%8F%E6%B6%88%E6%81%AF" target="_self">游戏消息</a></p>

<p id="%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF%E4%B8%8E%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF%E4%B8%8E%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86" target="_self">游戏循环与状态管理</a></p>

<p id="%E4%B8%BB%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E4%B8%BB%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF" target="_self">主游戏循环</a></p>

<p id="%E6%B8%B8%E6%88%8F%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E6%B8%B8%E6%88%8F%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2" target="_self">游戏状态转换</a></p>

<p id="%E5%AE%8C%E6%95%B4%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E5%AE%8C%E6%95%B4%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90" target="_self">完整代码解析</a></p>

<p id="%E6%B8%B8%E6%88%8F%E6%89%A9%E5%B1%95%E4%B8%8E%E4%BC%98%E5%8C%96-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%B8%B8%E6%88%8F%E6%89%A9%E5%B1%95%E4%B8%8E%E4%BC%98%E5%8C%96" target="_self">游戏扩展与优化</a></p>

<p id="%E5%A2%9E%E5%8A%A0%E9%9A%BE%E5%BA%A6%E7%B3%BB%E7%BB%9F-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%A2%9E%E5%8A%A0%E9%9A%BE%E5%BA%A6%E7%B3%BB%E7%BB%9F" target="_self">增加难度系统</a></p>

<p id="%E6%B7%BB%E5%8A%A0%E9%9F%B3%E6%95%88-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E6%B7%BB%E5%8A%A0%E9%9F%B3%E6%95%88" target="_self">添加音效</a></p>

<p id="%E4%BC%98%E5%8C%96%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E4%BC%98%E5%8C%96%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2" target="_self">优化游戏界面</a></p>

<p id="%E6%B7%BB%E5%8A%A0%E9%9A%9C%E7%A2%8D%E7%89%A9-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E6%B7%BB%E5%8A%A0%E9%9A%9C%E7%A2%8D%E7%89%A9" target="_self">添加障碍物</a></p>

<p id="%E6%80%BB%E4%BB%A3%E7%A0%81-toc" name="tableOfContents" style="margin-left:0px"><a href="#%E6%80%BB%E4%BB%A3%E7%A0%81" target="_self">总代码</a></p>

<p id="%E6%80%BB%E7%BB%93%E4%B8%8E%E5%BF%83%E5%BE%97-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%80%BB%E7%BB%93%E4%B8%8E%E5%BF%83%E5%BE%97" target="_self">总结与心得</a></p>

<hr id="hr-toc" name="tableOfContents" />
<p></p>

<h2 id="%E5%BC%95%E8%A8%80" name="%E5%BC%95%E8%A8%80">引言</h2>

<p>贪吃蛇游戏是编程学习过程中的经典项目，它不仅能帮助初学者理解编程基础概念，还能提供游戏开发的实践经验。本文将详细介绍如何使用Python和Pygame库从零开始构建一个完整的贪吃蛇游戏。</p>

<p>贪吃蛇游戏最早出现在1970年代，由于其简单而有趣的游戏机制，迅速成为了经典。游戏的目标是控制一条蛇在有限的空间内移动，吃到食物后蛇身会变长，同时要避免撞到墙壁或自己的身体。这个看似简单的游戏实际上包含了多个重要的编程概念：循环、条件判断、列表操作、随机数生成、用户输入处理等。</p>

<p>在本教程中，我们将一步步构建这个游戏，从基础的环境设置到完整的游戏功能实现，最后还会探讨如何对游戏进行扩展和优化。无论你是编程新手还是想要了解游戏开发的爱好者，这篇教程都将为你提供有价值的指导。</p>

<h2 id="%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C" name="%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C">游戏开发准备工作</h2>

<h3 id="%E5%AE%89%E8%A3%85Python%E5%92%8CPygame" name="%E5%AE%89%E8%A3%85Python%E5%92%8CPygame">安装Python和Pygame</h3>

<p>在开始开发贪吃蛇游戏之前，我们需要确保已经安装了Python和Pygame库。Python是一种易于学习且功能强大的编程语言，而Pygame则是专为游戏开发设计的Python库，它提供了绘图、声音、输入处理等功能。</p>

<ol>
	<li>
	<p><strong>安装Python</strong>：</p>

	<ul>
		<li>访问<a data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.8/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=P1C7" data-link-title="Python官网" href="https://www.python.org/downloads/" title="Python官网">Python官网</a>下载最新版本的Python</li>
		<li>安装时勾选&quot;Add Python to PATH&quot;选项，以便在命令行中直接使用Python</li>
	</ul>
	</li>
	<li>
	<p><strong>安装Pygame</strong>：</p>

	<ul>
		<li>打开命令提示符或终端</li>
		<li>输入以下命令安装Pygame：
		<pre>
<code>pip install pygame</code></pre>
		</li>
		<li>等待安装完成</li>
	</ul>
	</li>
	<li>
	<p><strong>验证安装</strong>：</p>

	<ul>
		<li>在Python环境中输入以下代码验证Pygame是否安装成功：
		<p>python</p>

		<pre>
<code>import pygame
print(pygame.ver)</code></pre>
		</li>
		<li>如果显示Pygame的版本号，则表示安装成功</li>
	</ul>
	</li>
</ol>

<h3 id="%E4%BA%86%E8%A7%A3%E6%B8%B8%E6%88%8F%E5%9F%BA%E6%9C%AC%E5%8E%9F%E7%90%86" name="%E4%BA%86%E8%A7%A3%E6%B8%B8%E6%88%8F%E5%9F%BA%E6%9C%AC%E5%8E%9F%E7%90%86">了解游戏基本原理</h3>

<p>在开始编码之前，让我们先了解贪吃蛇游戏的基本原理和核心机制：</p>

<ol>
	<li>
	<p><strong>游戏元素</strong>：</p>

	<ul>
		<li>蛇：由多个连续的方块组成，随着玩家的控制移动</li>
		<li>食物：随机出现在游戏区域内，蛇吃到后会变长</li>
		<li>游戏区域：有边界的平面，蛇需要在其中移动</li>
	</ul>
	</li>
	<li>
	<p><strong>游戏规则</strong>：</p>

	<ul>
		<li>蛇可以上、下、左、右四个方向移动</li>
		<li>蛇吃到食物后，长度增加，分数增加</li>
		<li>蛇撞到墙壁或自己的身体，游戏结束</li>
		<li>玩家的目标是尽可能地获得高分</li>
	</ul>
	</li>
	<li>
	<p><strong>技术实现要点</strong>：</p>

	<ul>
		<li>使用列表存储蛇的身体位置</li>
		<li>使用随机数生成食物位置</li>
		<li>使用游戏循环不断更新游</li>
	</ul>
	</li>
</ol>

<h2 id="%E6%B8%B8%E6%88%8F%E5%9F%BA%E7%A1%80%E6%9E%B6%E6%9E%84" name="%E6%B8%B8%E6%88%8F%E5%9F%BA%E7%A1%80%E6%9E%B6%E6%9E%84">游戏基础架构</h2>

<h3 id="%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B8%B8%E6%88%8F%E7%8E%AF%E5%A2%83" name="%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B8%B8%E6%88%8F%E7%8E%AF%E5%A2%83">初始化游戏环境</h3>

<p>任何Pygame游戏的第一步都是初始化游戏环境。这包括初始化Pygame库本身以及设置一些基本参数。</p>

<p>python</p>

<pre>
<code>import pygame
import time
import random

# 初始化pygame
pygame.init()</code></pre>

<p>初始化Pygame是创建游戏的第一步，它会启动Pygame的各个模块，为后续的游戏开发做好准备。<code>pygame.init()</code>函数会返回成功初始化的模块数量和失败的模块数量，但在大多数情况下，我们不需要关注这个返回值。</p>

<p>除了Pygame，我们还导入了<code>time</code>模块用于控制游戏速度，以及<code>random</code>模块用于生成随机的食物位置。这三个模块构成了我们贪吃蛇游戏的基础依赖。</p>

<h3 id="%E8%AE%BE%E7%BD%AE%E6%B8%B8%E6%88%8F%E7%AA%97%E5%8F%A3" name="%E8%AE%BE%E7%BD%AE%E6%B8%B8%E6%88%8F%E7%AA%97%E5%8F%A3">设置游戏窗口</h3>

<p>游戏窗口是玩家与游戏交互的界面，我们需要设置窗口的大小和标题。</p>

<p>python</p>

<pre>
<code># 设置屏幕大小
display_width = 800
display_height = 600

# 创建游戏窗口
dis = pygame.display.set_mode((display_width, display_height))
pygame.display.set_caption('贪吃蛇游戏')</code></pre>

<p>在这段代码中，我们首先定义了游戏窗口的宽度和高度，分别为800像素和600像素。然后使用<code>pygame.display.set_mode()</code>函数创建了一个游戏窗口，并将其赋值给变量<code>dis</code>（display的缩写）。最后，我们使用<code>pygame.display.set_caption()</code>函数设置了窗口的标题为&quot;贪吃蛇游戏&quot;。</p>

<p>游戏窗口的大小可以根据需要进行调整。较大的窗口可以提供更大的游戏空间，但也可能需要更多的计算资源。对于贪吃蛇这样的简单游戏，800x600的分辨率已经足够了。</p>

<h3 id="%E5%AE%9A%E4%B9%89%E9%A2%9C%E8%89%B2%E5%92%8C%E5%B8%B8%E9%87%8F" name="%E5%AE%9A%E4%B9%89%E9%A2%9C%E8%89%B2%E5%92%8C%E5%B8%B8%E9%87%8F">定义颜色和常量</h3>

<p>在游戏开发中，我们经常需要使用不同的颜色来绘制游戏元素。在Pygame中，颜色通常用RGB（红、绿、蓝）值表示。</p>

<p>python</p>

<pre>
<code># 定义颜色
white = (255, 255, 255)
black = (0, 0, 0)
red = (213, 50, 80)
green = (0, 255, 0)
blue = (50, 153, 213)

# 蛇的大小和速度
snake_block = 10
snake_speed = 15

# 设置游戏时钟
clock = pygame.time.Clock()</code></pre>

<p>在这段代码中，我们定义了几种常用的颜色：白色、黑色、红色、绿色和蓝色。每种颜色都由一个三元组表示，分别对应RGB值。例如，白色的RGB值为(255, 255, 255)，表示红、绿、蓝三种颜色都达到最大值。</p>

<p>除了颜色，我们还定义了两个重要的游戏常量：</p>

<ul>
	<li><code>snake_block</code>：表示蛇的每个方块的大小，单位为像素</li>
	<li><code>snake_speed</code>：表示蛇的移动速度，单位为帧率（FPS）</li>
</ul>

<p>最后，我们创建了一个游戏时钟对象<code>clock</code>，它将用于控制游戏的帧率，确保游戏在不同性能的计算机上运行速度一致。</p>

<h2 id="%E6%A0%B8%E5%BF%83%E6%B8%B8%E6%88%8F%E5%85%83%E7%B4%A0" name="%E6%A0%B8%E5%BF%83%E6%B8%B8%E6%88%8F%E5%85%83%E7%B4%A0">核心游戏元素</h2>

<h3 id="%E8%9B%87%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0" name="%E8%9B%87%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0">蛇的设计与实现</h3>

<p>蛇是贪吃蛇游戏的主角，它由一系列连续的方块组成。在我们的实现中，蛇的身体将使用一个列表来表示，列表中的每个元素都是一个包含x和y坐标的列表。</p>

<p>python</p>

<pre>
<code># 绘制蛇
def our_snake(snake_block, snake_list):
    for x in snake_list:
        pygame.draw.rect(dis, green, [x[0], x[1], snake_block, snake_block])</code></pre>

<p><code>our_snake</code>函数接受两个参数：<code>snake_block</code>表示蛇的每个方块的大小，<code>snake_list</code>是一个列表，包含蛇身体的所有部分的坐标。函数遍历蛇身体的每个部分，并使用<code>pygame.draw.rect()</code>函数绘制一个绿色的矩形。</p>

<p>在游戏主循环中，我们将创建并维护<code>snake_List</code>变量，它将存储蛇的所有身体部分的坐标。当蛇移动时，我们会在列表的末尾添加新的头部位置，并根据蛇的长度决定是否删除列表开头的元素（蛇尾）。</p>

<h3 id="%E9%A3%9F%E7%89%A9%E7%B3%BB%E7%BB%9F" name="%E9%A3%9F%E7%89%A9%E7%B3%BB%E7%BB%9F">食物系统</h3>

<p>食物是贪吃蛇游戏的另一个重要元素。食物会随机出现在游戏区域内，当蛇吃到食物后，蛇的长度会增加，同时食物会在新的随机位置重新生成。</p>

<p>python</p>

<pre>
<code># 随机生成食物位置
foodx = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
foody = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0</code></pre>

<p>在这段代码中，我们使用<code>random.randrange()</code>函数生成随机的x和y坐标，确保食物出现在游戏区域内。为了使食物对齐到网格，我们将随机生成的坐标除以10，四舍五入，然后再乘以10。这样可以确保食物的位置总是10的倍数，与蛇的移动步长一致。</p>

<p>在游戏主循环中，我们会检查蛇是否吃到了食物，如果是，则增加蛇的长度并生成新的食物：</p>

<p>python</p>

<pre>
<code># 检查是否吃到食物
if x1 == foodx and y1 == foody:
    foodx = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
    foody = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0
    Length_of_snake += 1</code></pre>

<h3 id="%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B" name="%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B">碰撞检测</h3>

<p>碰撞检测是贪吃蛇游戏的关键部分，它决定了游戏何时结束。我们需要检测两种类型的碰撞：蛇与墙壁的碰撞和蛇与自身的碰撞。</p>

<p>python</p>

<pre>
<code># 检查是否撞墙
if x1 &gt;= display_width or x1 &lt; 0 or y1 &gt;= display_height or y1 &lt; 0:
    game_close = True

# 检查是否撞到自己
for x in snake_List[:-1]:
    if x == snake_Head:
        game_close = True</code></pre>

<p>在第一段代码中，我们检查蛇头的x坐标是否超出了游戏区域的左右边界，或者y坐标是否超出了上下边界。如果是，则将<code>game_close</code>设置为<code>True</code>，表示游戏结束。</p>

<p>在第二段代码中，我们遍历蛇身体的所有部分（除了头部），检查是否有任何部分与头部位置相同。如果是，则表示蛇撞到了自己，游戏结束。</p>

<h2 id="%E6%B8%B8%E6%88%8F%E6%8E%A7%E5%88%B6%E4%B8%8E%E4%BA%A4%E4%BA%92" name="%E6%B8%B8%E6%88%8F%E6%8E%A7%E5%88%B6%E4%B8%8E%E4%BA%A4%E4%BA%92">游戏控制与交互</h2>

<h3 id="%E9%94%AE%E7%9B%98%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86" name="%E9%94%AE%E7%9B%98%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86">键盘输入处理</h3>

<p>玩家通过键盘控制蛇的移动方向。在Pygame中，我们可以使用事件系统来捕获键盘输入。</p>

<p>python</p>

<pre>
<code>for event in pygame.event.get():
    if event.type == pygame.QUIT:
        game_over = True
    if event.type == pygame.KEYDOWN:
        if event.key == pygame.K_LEFT:
            x1_change = -snake_block
            y1_change = 0
        elif event.key == pygame.K_RIGHT:
            x1_change = snake_block
            y1_change = 0
        elif event.key == pygame.K_UP:
            y1_change = -snake_block
            x1_change = 0
        elif event.key == pygame.K_DOWN:
            y1_change = snake_block
            x1_change = 0</code></pre>

<p>在这段代码中，我们使用<code>pygame.event.get()</code>函数获取所有待处理的事件，然后遍历这些事件。如果事件类型是<code>pygame.QUIT</code>（例如，玩家点击窗口的关闭按钮），则将<code>game_over</code>设置为<code>True</code>，表示游戏结束。</p>

<p>如果事件类型是<code>pygame.KEYDOWN</code>（玩家按下了键盘上的某个键），我们会检查按下的是哪个键，并相应地更新蛇的移动方向。例如，如果玩家按下了左方向键，我们将<code>x1_change</code>设置为负的<code>snake_block</code>（向左移动），并将<code>y1_change</code>设置为0（不上下移动）。</p>

<h3 id="%E7%A7%BB%E5%8A%A8%E6%9C%BA%E5%88%B6" name="%E7%A7%BB%E5%8A%A8%E6%9C%BA%E5%88%B6">移动机制</h3>

<p>蛇的移动是通过更新蛇头的位置，然后添加新的头部位置到蛇身体列表中来实现的。</p>

<p>python</p>

<pre>
<code># 更新蛇的位置
x1 += x1_change
y1 += y1_change

snake_Head = []
snake_Head.append(x1)
snake_Head.append(y1)
snake_List.append(snake_Head)

# 删除多余的蛇身体部分
if len(snake_List) &gt; Length_of_snake:
    del snake_List[0]</code></pre>

<p>在这段代码中，我们首先根据当前的移动方向更新蛇头的位置。然后创建一个新的列表<code>snake_Head</code>，包含蛇头的x和y坐标，并将其添加到<code>snake_List</code>的末尾。</p>

<p>如果蛇身体的长度超过了应有的长度（由<code>Length_of_snake</code>变量控制），我们会删除<code>snake_List</code>的第一个元素，即蛇尾。这样，蛇就会向前移动，同时保持其长度不变。</p>

<p>当蛇吃到食物时，我们会增加<code>Length_of_snake</code>的值，这样在下一次移动时，蛇尾就不会被删除，从而使蛇的长度增加。</p>

<h2 id="%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1" name="%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1">游戏界面设计</h2>

<h3 id="%E5%88%86%E6%95%B0%E6%98%BE%E7%A4%BA" name="%E5%88%86%E6%95%B0%E6%98%BE%E7%A4%BA">分数显示</h3>

<p>在游戏中显示当前的分数可以让玩家了解自己的游戏进度。我们可以使用Pygame的文本渲染功能来实现这一点。</p>

<p>python</p>

<pre>
<code># 设置字体
font_style = pygame.font.SysFont("bahnschrift", 25)
score_font = pygame.font.SysFont("comicsansms", 35)

# 显示得分
def your_score(score):
    value = score_font.render("得分: " + str(score), True, black)
    dis.blit(value, [0, 0])</code></pre>

<p>在这段代码中，我们首先创建了两种字体：一种用于普通文本，另一种用于显示分数。然后定义了<code>your_score</code>函数，它接受一个参数<code>score</code>，表示当前的分数。</p>

<p>函数使用<code>score_font.render()</code>方法将分数文本转换为可渲染的表面，然后使用<code>dis.blit()</code>方法将这个表面绘制到游戏窗口的左上角。</p>

<p>在游戏主循环中，我们会在每一帧调用这个函数，传入当前的分数（即蛇的长度减1）：</p>

<pre>
<code>your_score(Length_of_snake - 1)</code></pre>

<h3 id="%E6%B8%B8%E6%88%8F%E6%B6%88%E6%81%AF" name="%E6%B8%B8%E6%88%8F%E6%B6%88%E6%81%AF">游戏消息</h3>

<p>在游戏开始、结束或其他重要时刻，我们可能需要向玩家显示一些消息。我们可以使用与分数显示类似的方法来实现这一点。</p>

<p>python</p>

<pre>
<code># 显示消息
def message(msg, color):
    mesg = font_style.render(msg, True, color)
    dis.blit(mesg, [display_width / 6, display_height / 3])</code></pre>

<p><code>message</code>函数接受两个参数：<code>msg</code>表示要显示的消息文本，<code>color</code>表示文本的颜色。函数使用<code>font_style.render()</code>方法将消息文本转换为可渲染的表面，然后使用<code>dis.blit()</code>方法将这个表面绘制到游戏窗口的中央位置。</p>

<p>在游戏结束时，我们会使用这个函数显示一条消息，告诉玩家游戏结束，并提供重新开始或退出的选项：</p>

<p>python</p>

<pre>
<code>message("你输了! 按Q退出或按C重新开始", red)</code></pre>

<h2 id="%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF%E4%B8%8E%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86" name="%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF%E4%B8%8E%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86">游戏循环与状态管理</h2>

<h3 id="%E4%B8%BB%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF" name="%E4%B8%BB%E6%B8%B8%E6%88%8F%E5%BE%AA%E7%8E%AF">主游戏循环</h3>

<p>游戏循环是游戏的核心部分，它负责不断更新游戏状态并重新绘制游戏界面。在Pygame中，游戏循环通常由一个<code>while</code>循环实现。</p>

<p>python</p>

<pre>
<code># 游戏主循环
def gameLoop():
    game_over = False
    game_close = False

    # 初始化蛇的位置
    x1 = display_width / 2
    y1 = display_height / 2

    # 初始化蛇的移动方向
    x1_change = 0
    y1_change = 0

    # 初始化蛇的身体
    snake_List = []
    Length_of_snake = 1

    # 随机生成食物位置
    foodx = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
    foody = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0

    while not game_over:
        # 游戏逻辑代码
        # ...

        clock.tick(snake_speed)

    pygame.quit()
    quit()</code></pre>

<p>在这段代码中，我们定义了<code>gameLoop</code>函数，它包含了整个游戏的逻辑。函数首先初始化了一些游戏变量，包括游戏状态标志、蛇的位置和移动方向、蛇的身体列表以及食物的位置。</p>

<p>然后，函数进入主游戏循环，只要<code>game_over</code>为<code>False</code>，循环就会继续执行。在循环的最后，我们调用<code>clock.tick(snake_speed)</code>来控制游戏的帧率，确保游戏在不同性能的计算机上运行速度一致。</p>

<p>当游戏结束时（<code>game_over</code>变为<code>True</code>），函数会调用<code>pygame.quit()</code>和<code>quit()</code>来关闭Pygame并退出程序。</p>

<h3 id="%E6%B8%B8%E6%88%8F%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2" name="%E6%B8%B8%E6%88%8F%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2">游戏状态转换</h3>

<p>在游戏中，我们需要管理不同的游戏状态，例如游戏运行中、游戏暂停、游戏结束等。在我们的贪吃蛇游戏中，我们使用两个变量来管理游戏状态：<code>game_over</code>和<code>game_close</code>。</p>

<p>python</p>

<pre>
<code>while game_close == True:
    dis.fill(white)
    message("你输了! 按Q退出或按C重新开始", red)
    your_score(Length_of_snake - 1)
    pygame.display.update()

    for event in pygame.event.get():
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_q:
                game_over = True
                game_close = False
            if event.key == pygame.K_c:
                gameLoop()</code></pre>

<p>当蛇撞到墙壁或自己的身体时，<code>game_close</code>会被设置为<code>True</code>，游戏进入&quot;游戏结束&quot;状态。在这个状态下，我们会显示一条消息，告诉玩家游戏结束，并提供重新开始或退出的选项。</p>

<p>如果玩家按下Q键，<code>game_over</code>会被设置为<code>True</code>，<code>game_close</code>会被设置为<code>False</code>，这会导致主游戏循环结束，程序退出。</p>

<p>如果玩家按下C键，我们会调用<code>gameLoop()</code>函数重新开始游戏。这会创建一个新的游戏实例，重置所有游戏变量，包括蛇的位置、长度和食物的位置。</p>

<p>这种状态管理方式允许我们在不同的游戏状态之间平滑地转换，提供良好的用户体验。</p>

<h2 id="%E5%AE%8C%E6%95%B4%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90" name="%E5%AE%8C%E6%95%B4%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90">完整代码解析</h2>

<p>现在，让我们来看一下贪吃蛇游戏的完整代码，并逐段进行解析：</p>

<p>python</p>

<pre>
<code>import pygame
import time
import random

# 初始化pygame
pygame.init()

# 定义颜色
white = (255, 255, 255)
black = (0, 0, 0)
red = (213, 50, 80)
green = (0, 255, 0)
blue = (50, 153, 213)

# 设置屏幕大小
display_width = 800
display_height = 600

# 创建游戏窗口
dis = pygame.display.set_mode((display_width, display_height))
pygame.display.set_caption('贪吃蛇游戏')

# 设置游戏时钟
clock = pygame.time.Clock()

# 蛇的大小和速度
snake_block = 10
snake_speed = 15

# 设置字体
font_style = pygame.font.SysFont("bahnschrift", 25)
score_font = pygame.font.SysFont("comicsansms", 35)</code></pre>

<p>这部分代码包含了游戏的初始化和基本设置。我们导入了必要的模块，初始化了Pygame，定义了颜色常量，设置了游戏窗口的大小和标题，创建了游戏时钟，并定义了蛇的大小和速度以及游戏中使用的字体。</p>

<p>python</p>

<pre>
<code># 显示得分
def your_score(score):
    value = score_font.render("得分: " + str(score), True, black)
    dis.blit(value, [0, 0])

# 绘制蛇
def our_snake(snake_block, snake_list):
    for x in snake_list:
        pygame.draw.rect(dis, green, [x[0], x[1], snake_block, snake_block])

# 显示消息
def message(msg, color):
    mesg = font_style.render(msg, True, color)
    dis.blit(mesg, [display_width / 6, display_height / 3])</code></pre>

<p>这部分代码定义了三个辅助函数：</p>

<ul>
	<li><code>your_score</code>：显示当前的分数</li>
	<li><code>our_snake</code>：绘制蛇的身体</li>
	<li><code>message</code>：显示游戏消息</li>
</ul>

<p>这些函数封装了游戏界面的绘制逻辑，使主游戏循环更加清晰和简洁。</p>

<p>python</p>

<pre>
<code># 游戏主循环
def gameLoop():
    game_over = False
    game_close = False

    # 初始化蛇的位置
    x1 = display_width / 2
    y1 = display_height / 2

    # 初始化蛇的移动方向
    x1_change = 0
    y1_change = 0

    # 初始化蛇的身体
    snake_List = []
    Length_of_snake = 1

    # 随机生成食物位置
    foodx = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
    foody = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0</code></pre>

<p>这部分代码是<code>gameLoop</code>函数的开始部分，它初始化了游戏的各种变量，包括游戏状态标志、蛇的位置和移动方向、蛇的身体列表以及食物的位置。</p>

<p>python</p>

<pre>
<code>while not game_over:

        while game_close == True:
            dis.fill(white)
            message("你输了! 按Q退出或按C重新开始", red)
            your_score(Length_of_snake - 1)
            pygame.display.update()

            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_q:
                        game_over = True
                        game_close = False
                    if event.key == pygame.K_c:
                        gameLoop()</code></pre>

<p>这部分代码处理游戏结束的情况。当<code>game_close</code>为<code>True</code>时，游戏会显示一条消息，告诉玩家游戏结束，并提供重新开始或退出的选项。</p>

<p>python</p>

<pre>
<code>for event in pygame.event.get():
            if event.type == pygame.QUIT:
                game_over = True
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    x1_change = -snake_block
                    y1_change = 0
                elif event.key == pygame.K_RIGHT:
                    x1_change = snake_block
                    y1_change = 0
                elif event.key == pygame.K_UP:
                    y1_change = -snake_block
                    x1_change = 0
                elif event.key == pygame.K_DOWN:
                    y1_change = snake_block
                    x1_change = 0</code></pre>

<p>这部分代码处理玩家的输入。它检查是否有退出事件（例如，玩家点击窗口的关闭按钮）或键盘按键事件，并相应地更新蛇的移动方向。</p>

<p>python</p>

<pre>
<code># 检查是否撞墙
        if x1 &gt;= display_width or x1 &lt; 0 or y1 &gt;= display_height or y1 &lt; 0:
            game_close = True

        # 更新蛇的位置
        x1 += x1_change
        y1 += y1_change
        dis.fill(white)
        pygame.draw.rect(dis, red, [foodx, foody, snake_block, snake_block])</code></pre>

<p>这部分代码首先检查蛇是否撞到了墙壁，如果是，则将<code>game_close</code>设置为<code>True</code>，表示游戏结束。然后，它根据当前的移动方向更新蛇头的位置，清空游戏窗口（填充白色），并绘制食物（红色方块）。</p>

<p>python</p>

<pre>
<code>snake_Head = []
        snake_Head.append(x1)
        snake_Head.append(y1)
        snake_List.append(snake_Head)
        
        # 删除多余的蛇身体部分
        if len(snake_List) &gt; Length_of_snake:
            del snake_List[0]

        # 检查是否撞到自己
        for x in snake_List[:-1]:
            if x == snake_Head:
                game_close = True</code></pre>

<p>这部分代码更新蛇的身体。它创建一个新的列表<code>snake_Head</code>，包含蛇头的x和y坐标，并将其添加到<code>snake_List</code>的末尾。如果蛇身体的长度超过了应有的长度，它会删除<code>snake_List</code>的第一个元素，即蛇尾。然后，它检查蛇是否撞到了自己，如果是，则将<code>game_close</code>设置为<code>True</code>，表示游戏结束。</p>

<p>python</p>

<pre>
<code>our_snake(snake_block, snake_List)
        your_score(Length_of_snake - 1)

        pygame.display.update()

        # 检查是否吃到食物
        if x1 == foodx and y1 == foody:
            foodx = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
            foody = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0
            Length_of_snake += 1

        clock.tick(snake_speed)</code></pre>

<p>这部分代码绘制蛇的身体，显示当前的分数，并更新游戏窗口。然后，它检查蛇是否吃到了食物，如果是，则生成新的食物并增加蛇的长度。最后，它调用<code>clock.tick(snake_speed)</code>来控制游戏的帧率。</p>

<p>python</p>

<pre>
<code>pygame.quit()
    quit()

# 启动游戏
gameLoop()</code></pre>

<p>这部分代码是<code>gameLoop</code>函数的结束部分。当游戏结束时（<code>game_over</code>为<code>True</code>），它会调用<code>pygame.quit()</code>和<code>quit()</code>来关闭Pygame并退出程序。最后，它调用<code>gameLoop()</code>函数来启动游戏。</p>

<h2 id="%E6%B8%B8%E6%88%8F%E6%89%A9%E5%B1%95%E4%B8%8E%E4%BC%98%E5%8C%96" name="%E6%B8%B8%E6%88%8F%E6%89%A9%E5%B1%95%E4%B8%8E%E4%BC%98%E5%8C%96">游戏扩展与优化</h2>

<p>现在我们已经实现了一个基本的贪吃蛇游戏，但还有很多方面可以进行扩展和优化。以下是一些可能的改进方向：</p>

<h3 id="%E5%A2%9E%E5%8A%A0%E9%9A%BE%E5%BA%A6%E7%B3%BB%E7%BB%9F" name="%E5%A2%9E%E5%8A%A0%E9%9A%BE%E5%BA%A6%E7%B3%BB%E7%BB%9F">增加难度系统</h3>

<p>目前，游戏的难度是固定的，蛇的移动速度由<code>snake_speed</code>变量控制。我们可以添加一个难度系统，允许玩家选择不同的难度级别，或者随着游戏的进行自动增加难度。</p>

<p>python</p>

<pre>
<code># 难度系统
def set_difficulty(difficulty):
    if difficulty == "easy":
        return 10
    elif difficulty == "medium":
        return 15
    elif difficulty == "hard":
        return 20
    else:
        return 15  # 默认中等难度

# 在游戏开始前选择难度
def choose_difficulty():
    difficulty = ""
    while difficulty not in ["easy", "medium", "hard"]:
        dis.fill(white)
        message("选择难度: E-简单, M-中等, H-困难", black)
        pygame.display.update()
        
        for event in pygame.event.get():
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_e:
                    difficulty = "easy"
                elif event.key == pygame.K_m:
                    difficulty = "medium"
                elif event.key == pygame.K_h:
                    difficulty = "hard"
    
    return set_difficulty(difficulty)

# 在游戏主循环中使用
def gameLoop():
    # ...
    snake_speed = choose_difficulty()
    # ...</code></pre>

<p>这段代码添加了两个新函数：<code>set_difficulty</code>和<code>choose_difficulty</code>。<code>set_difficulty</code>函数根据难度级别返回相应的蛇移动速度，<code>choose_difficulty</code>函数显示一个难度选择界面，让玩家选择难度级别。在游戏主循环中，我们调用<code>choose_difficulty</code>函数来设置蛇的移动速度。</p>

<h3 id="%E6%B7%BB%E5%8A%A0%E9%9F%B3%E6%95%88" name="%E6%B7%BB%E5%8A%A0%E9%9F%B3%E6%95%88">添加音效</h3>

<p>音效可以增强游戏的沉浸感和反馈感。我们可以在蛇吃到食物、撞到墙壁或自己的身体时播放不同的音效。</p>

<p>python</p>

<pre>
<code># 加载音效
pygame.mixer.init()
eat_sound = pygame.mixer.Sound("eat.wav")
crash_sound = pygame.mixer.Sound("crash.wav")

# 在游戏主循环中播放音效
def gameLoop():
    # ...
    # 检查是否吃到食物
    if x1 == foodx and y1 == foody:
        eat_sound.play()  # 播放吃食物的音效
        # ...
    
    # 检查是否撞墙或撞到自己
    if x1 &gt;= display_width or x1 &lt; 0 or y1 &gt;= display_height or y1 &lt; 0:
        crash_sound.play()  # 播放撞墙的音效
        # ...
    
    for x in snake_List[:-1]:
        if x == snake_Head:
            crash_sound.play()  # 播放撞到自己的音效
            # ...
    # ...</code></pre>

<p>这段代码首先初始化Pygame的混音器模块，然后加载两个音效文件：<code>eat.wav</code>和<code>crash.wav</code>。在游戏主循环中，当蛇吃到食物时，我们播放<code>eat_sound</code>；当蛇撞到墙壁或自己的身体时，我们播放<code>crash_sound</code>。</p>

<h3 id="%E4%BC%98%E5%8C%96%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2" name="%E4%BC%98%E5%8C%96%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2">优化游戏界面</h3>

<p>我们可以通过添加背景图像、改进蛇和食物的外观以及添加更多的视觉效果来优化游戏界面。</p>

<p>python</p>

<pre>
<code># 加载图像
background_img = pygame.image.load("background.jpg")
food_img = pygame.image.load("food.png")
snake_head_img = pygame.image.load("snake_head.png")
snake_body_img = pygame.image.load("snake_body.png")

# 在游戏主循环中使用图像
def gameLoop():
    # ...
    # 绘制背景
    dis.blit(background_img, (0, 0))
    
    # 绘制食物
    dis.blit(food_img, (foodx, foody))
    
    # 绘制蛇
    for i, x in enumerate(snake_List):
        if i == len(snake_List) - 1:  # 蛇头
            dis.blit(snake_head_img, (x[0], x[1]))
        else:  # 蛇身
            dis.blit(snake_body_img, (x[0], x[1]))
    # ...</code></pre>

<p>这段代码加载了四个图像文件：背景图像、食物图像、蛇头图像和蛇身图像。在游戏主循环中，我们使用这些图像来绘制游戏界面，而不是简单的彩色矩形。</p>

<h3 id="%E6%B7%BB%E5%8A%A0%E9%9A%9C%E7%A2%8D%E7%89%A9" name="%E6%B7%BB%E5%8A%A0%E9%9A%9C%E7%A2%8D%E7%89%A9">添加障碍物</h3>

<p>为了增加游戏的挑战性，我们可以添加障碍物，蛇需要避开这些障碍物。</p>

<p>python</p>

<pre>
<code># 初始化障碍物
obstacles = []
for i in range(5):  # 创建5个障碍物
    obstacle_x = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
    obstacle_y = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0
    obstacles.append([obstacle_x, obstacle_y])

# 在游戏主循环中检查是否撞到障碍物
def gameLoop():
    # ...
    # 绘制障碍物
    for obstacle in obstacles:
        pygame.draw.rect(dis, blue, [obstacle[0], obstacle[1], snake_block, snake_block])
    
    # 检查是否撞到障碍物
    for obstacle in obstacles:
        if x1 == obstacle[0] and y1 == obstacle[1]:
            game_close = True
    # ...</code></pre>

<p>这段代码创建了一个包含5个障碍物的列表，每个障碍物都有一个随机的位置。在游戏主循环中，我们绘制这些障碍物，并检查蛇是否撞到了它们。如果是，则游戏结束。</p>

<h1 id="%E6%80%BB%E4%BB%A3%E7%A0%81" name="%E6%80%BB%E4%BB%A3%E7%A0%81">总代码</h1>

<pre>
<code class="language-python">import pygame
import time
import random

# 初始化pygame
pygame.init()

# 定义颜色
white = (255, 255, 255)
black = (0, 0, 0)
red = (213, 50, 80)
green = (0, 255, 0)
blue = (50, 153, 213)

# 设置屏幕大小
display_width = 800
display_height = 600

# 创建游戏窗口
dis = pygame.display.set_mode((display_width, display_height))
pygame.display.set_caption('贪吃蛇游戏')

# 设置游戏时钟
clock = pygame.time.Clock()

# 蛇的大小和速度
snake_block = 10
snake_speed = 15

# 设置字体
font_style = pygame.font.SysFont("bahnschrift", 25)
score_font = pygame.font.SysFont("comicsansms", 35)

# 显示得分
def your_score(score):
    value = score_font.render("得分: " + str(score), True, black)
    dis.blit(value, [0, 0])

# 绘制蛇
def our_snake(snake_block, snake_list):
    for x in snake_list:
        pygame.draw.rect(dis, green, [x[0], x[1], snake_block, snake_block])

# 显示消息
def message(msg, color):
    mesg = font_style.render(msg, True, color)
    dis.blit(mesg, [display_width / 6, display_height / 3])

# 游戏主循环
def gameLoop():
    game_over = False
    game_close = False

    # 初始化蛇的位置
    x1 = display_width / 2
    y1 = display_height / 2

    # 初始化蛇的移动方向
    x1_change = 0
    y1_change = 0

    # 初始化蛇的身体
    snake_List = []
    Length_of_snake = 1

    # 随机生成食物位置
    foodx = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
    foody = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0

    while not game_over:

        while game_close == True:
            dis.fill(white)
            message("你输了! 按Q退出或按C重新开始", red)
            your_score(Length_of_snake - 1)
            pygame.display.update()

            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_q:
                        game_over = True
                        game_close = False
                    if event.key == pygame.K_c:
                        gameLoop()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                game_over = True
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    x1_change = -snake_block
                    y1_change = 0
                elif event.key == pygame.K_RIGHT:
                    x1_change = snake_block
                    y1_change = 0
                elif event.key == pygame.K_UP:
                    y1_change = -snake_block
                    x1_change = 0
                elif event.key == pygame.K_DOWN:
                    y1_change = snake_block
                    x1_change = 0

        # 检查是否撞墙
        if x1 &gt;= display_width or x1 &lt; 0 or y1 &gt;= display_height or y1 &lt; 0:
            game_close = True

        # 更新蛇的位置
        x1 += x1_change
        y1 += y1_change
        dis.fill(white)
        pygame.draw.rect(dis, red, [foodx, foody, snake_block, snake_block])
        
        snake_Head = []
        snake_Head.append(x1)
        snake_Head.append(y1)
        snake_List.append(snake_Head)
        
        # 删除多余的蛇身体部分
        if len(snake_List) &gt; Length_of_snake:
            del snake_List[0]

        # 检查是否撞到自己
        for x in snake_List[:-1]:
            if x == snake_Head:
                game_close = True

        our_snake(snake_block, snake_List)
        your_score(Length_of_snake - 1)

        pygame.display.update()

        # 检查是否吃到食物
        if x1 == foodx and y1 == foody:
            foodx = round(random.randrange(0, display_width - snake_block) / 10.0) * 10.0
            foody = round(random.randrange(0, display_height - snake_block) / 10.0) * 10.0
            Length_of_snake += 1

        clock.tick(snake_speed)

    pygame.quit()
    quit()

# 启动游戏
gameLoop()</code></pre>

<h2 name="%E6%80%BB%E7%BB%93%E4%B8%8E%E5%BF%83%E5%BE%97">运行结果</h2>

<p><img alt="" height="779" isbindedload="true" src="https://i-blog.csdnimg.cn/direct/34cc05991c574223b283618372c52a5f.png" width="995" /></p>

<h1 id="%E6%80%BB%E7%BB%93%E4%B8%8E%E5%BF%83%E5%BE%97" name="%E6%80%BB%E7%BB%93%E4%B8%8E%E5%BF%83%E5%BE%97">总结与心得</h1>

<p>通过本教程，我们从零开始构建了一个完整的贪吃蛇游戏。我们学习了如何使用Python和Pygame库来创建游戏窗口、处理用户输入、绘制游戏元素、实现游戏逻辑以及管理游戏状态。</p>

<p>贪吃蛇游戏虽然简单，但它包含了许多游戏开发的基本概念和技术，例如：</p>

<ul>
	<li>游戏循环和帧率控制</li>
	<li>用户输入处理</li>
	<li>碰撞检测</li>
	<li>随机数生成</li>
	<li>游戏状态管理</li>
	<li>图形绘制和界面设计</li>
</ul>

<p>这些概念和技术在更复杂的游戏开发中也是非常重要的。通过学习和实践这个项目，我们不仅掌握了如何创建一个经典的贪吃蛇游戏，还为进一步学习游戏开发打下了坚实的基础。</p>

<p>在开发过程中，我们可能会遇到各种挑战和问题，例如如何处理蛇的移动、如何检测碰撞、如何生成食物等。通过解决这些问题，我们不仅提高了编程技能，还培养了解决问题的能力和创造性思维。</p>

<p>最后，游戏开发是一个充满乐趣和挑战的领域。希望这个教程能够激发你对游戏开发的兴趣，并鼓励你继续探索和学习。无论你是想成为一名专业的游戏开发者，还是只是想为自己或朋友创建一些有趣的游戏，这个教程都是一个很好的起点。</p>

<p>祝你在游戏开发的道路上取得成功！</p>
