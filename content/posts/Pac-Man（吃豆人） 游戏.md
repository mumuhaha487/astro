---
title: Pac-Man（吃豆人） 游戏
published: 2025-03-09
tags: [pygame,python]
category: python
---

<!--more-->

<p><strong>目录</strong></p>

<p style="margin-left:40px">&nbsp;</p>

<p style="margin-left:40px"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p style="margin-left:40px"><a href="#1.%20Pygame%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91%E5%9F%BA%E7%A1%80">1. Pygame游戏开发基础</a></p>

<p style="margin-left:80px"><a href="#1.1%20Pygame%E7%AE%80%E4%BB%8B">1.1 Pygame简介</a></p>

<p style="margin-left:80px"><a href="#1.2%20%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5">1.2 游戏开发基本概念</a></p>

<p style="margin-left:80px"><a href="#1.3%20Pygame%E6%A0%B8%E5%BF%83%E6%A8%A1%E5%9D%97%E4%BB%8B%E7%BB%8D">1.3 Pygame核心模块介绍</a></p>

<p style="margin-left:40px"><a href="#2.%20%E6%B8%B8%E6%88%8F%E8%AE%BE%E8%AE%A1%E4%B8%8E%E8%A7%84%E5%88%92">2. 游戏设计与规划</a></p>

<p style="margin-left:80px"><a href="#2.1%20%E6%B8%B8%E6%88%8F%E8%A7%84%E5%88%99%E8%AE%BE%E8%AE%A1">2.1 游戏规则设计</a></p>

<p style="margin-left:80px"><a href="#2.2%20%E6%B8%B8%E6%88%8F%E5%AF%B9%E8%B1%A1%E8%A7%84%E5%88%92">2.2 游戏对象规划</a></p>

<p style="margin-left:80px"><a href="#2.3%20%E6%8A%80%E6%9C%AF%E6%96%B9%E6%A1%88%E9%80%89%E6%8B%A9">2.3 技术方案选择</a></p>

<p style="margin-left:40px"><a href="#3.%20%E5%88%9B%E5%BB%BA%E6%B8%B8%E6%88%8F%E7%AA%97%E5%8F%A3%E4%B8%8E%E5%88%9D%E5%A7%8B%E5%8C%96">3. 创建游戏窗口与初始化</a></p>

<p style="margin-left:80px"><a href="#3.1%20%E5%88%9D%E5%A7%8B%E5%8C%96Pygame%E7%8E%AF%E5%A2%83">3.1 初始化Pygame环境</a></p>

<p style="margin-left:80px"><a href="#3.2%20%E8%AE%BE%E7%BD%AE%E6%B8%B8%E6%88%8F%E7%AA%97%E5%8F%A3">3.2 设置游戏窗口</a></p>

<p style="margin-left:80px"><a href="#3.3%20%E5%AE%9A%E4%B9%89%E9%A2%9C%E8%89%B2%E5%92%8C%E6%B8%B8%E6%88%8F%E5%8F%82%E6%95%B0">3.3 定义颜色和游戏参数</a></p>

<p style="margin-left:80px"><a href="#3.4%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B8%B8%E6%88%8F%E6%97%B6%E9%92%9F">3.4 初始化游戏时钟</a></p>

<p style="margin-left:40px"><a href="#4.%20%E5%90%83%E8%B1%86%E4%BA%BA%E8%A7%92%E8%89%B2%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0">4. 吃豆人角色设计与实现</a></p>

<p style="margin-left:80px"><a href="#4.1%20%E5%90%83%E8%B1%86%E4%BA%BA%E7%B1%BB%E8%AE%BE%E8%AE%A1">4.1 吃豆人类设计</a></p>

<p style="margin-left:80px"><a href="#4.2%20%E5%AE%9E%E7%8E%B0%E5%90%83%E8%B1%86%E4%BA%BA%E7%A7%BB%E5%8A%A8">4.2 实现吃豆人移动</a></p>

<p style="margin-left:80px"><a href="#4.3%20%E7%BB%98%E5%88%B6%E5%90%83%E8%B1%86%E4%BA%BA">4.3 绘制吃豆人</a></p>

<p style="margin-left:40px"><a href="#5.%20%E5%B9%BD%E7%81%B5%E8%A7%92%E8%89%B2%E8%AE%BE%E8%AE%A1%E4%B8%8EAI%E5%AE%9E%E7%8E%B0">5. 幽灵角色设计与AI实现</a></p>

<p style="margin-left:80px"><a href="#5.1%20%E5%B9%BD%E7%81%B5%E7%B1%BB%E8%AE%BE%E8%AE%A1">5.1 幽灵类设计</a></p>

<p style="margin-left:80px"><a href="#5.2%20%E5%B9%BD%E7%81%B5AI%E8%A1%8C%E4%B8%BA%E5%AE%9E%E7%8E%B0">5.2 幽灵AI行为实现</a></p>

<p style="margin-left:80px"><a href="#5.3%20%E7%BB%98%E5%88%B6%E5%B9%BD%E7%81%B5">5.3 绘制幽灵</a></p>

<p style="margin-left:40px"><a href="#6.%20%E8%BF%B7%E5%AE%AB%E7%94%9F%E6%88%90%E4%B8%8E%E6%B8%B2%E6%9F%93">6. 迷宫生成与渲染</a></p>

<p style="margin-left:80px"><a href="#6.1%20%E8%BF%B7%E5%AE%AB%E8%A1%A8%E7%A4%BA%E6%96%B9%E6%B3%95">6.1 迷宫表示方法</a></p>

<p style="margin-left:80px"><a href="#6.2%20%E8%BF%B7%E5%AE%AB%E6%B8%B2%E6%9F%93">6.2 迷宫渲染</a></p>

<p style="margin-left:40px"><a href="#7.%20%E6%B8%B8%E6%88%8F%E7%89%A9%E5%93%81%EF%BC%9A%E8%B1%86%E5%AD%90%E4%B8%8E%E8%83%BD%E9%87%8F%E8%B1%86">7. 游戏物品：豆子与能量豆</a></p>

<p style="margin-left:80px"><a href="#7.1%20%E8%B1%86%E5%AD%90%E7%94%9F%E6%88%90">7.1 豆子生成</a></p>

<p style="margin-left:80px"><a href="#7.2%20%E8%B1%86%E5%AD%90%E6%B8%B2%E6%9F%93">7.2 豆子渲染</a></p>

<p style="margin-left:80px"><a href="#7.3%20%E8%B1%86%E5%AD%90%E4%B8%8E%E5%90%83%E8%B1%86%E4%BA%BA%E7%9A%84%E4%BA%A4%E4%BA%92">7.3 豆子与吃豆人的交互</a></p>

<p style="margin-left:40px"><a href="#8.%20%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B%E7%B3%BB%E7%BB%9F">8. 碰撞检测系统</a></p>

<p style="margin-left:80px"><a href="#8.1%20%E8%A7%92%E8%89%B2%E4%B8%8E%E5%A2%99%E5%A3%81%E7%9A%84%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B">8.1 角色与墙壁的碰撞检测</a></p>

<p style="margin-left:80px"><a href="#8.2%20%E5%90%83%E8%B1%86%E4%BA%BA%E4%B8%8E%E5%B9%BD%E7%81%B5%E7%9A%84%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B">8.2 吃豆人与幽灵的碰撞检测</a></p>

<p style="margin-left:80px"><a href="#8.3%20%E5%90%83%E8%B1%86%E4%BA%BA%E4%B8%8E%E8%B1%86%E5%AD%90%E7%9A%84%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B">8.3 吃豆人与豆子的碰撞检测</a></p>

<p style="margin-left:40px"><a href="#9.%20%E6%B8%B8%E6%88%8F%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86">9. 游戏状态管理</a></p>

<p style="margin-left:80px"><a href="#9.1%20%E6%B8%B8%E6%88%8F%E7%8A%B6%E6%80%81%E5%AE%9A%E4%B9%89">9.1 游戏状态定义</a></p>

<p style="margin-left:80px"><a href="#9.2%20%E6%B8%B8%E6%88%8F%E7%8A%B6%E6%80%81%E5%88%87%E6%8D%A2">9.2 游戏状态切换</a></p>

<p style="margin-left:80px"><a href="#9.3%20%E5%B9%BD%E7%81%B5%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86">9.3 幽灵状态管理</a></p>

<p style="margin-left:40px"><a href="#10.%20%E6%B8%B8%E6%88%8FUI%E4%B8%8E%E8%A7%86%E8%A7%89%E6%95%88%E6%9E%9C">10. 游戏UI与视觉效果</a></p>

<p style="margin-left:80px"><a href="#10.1%20%E5%88%86%E6%95%B0%E5%92%8C%E7%94%9F%E5%91%BD%E5%80%BC%E6%98%BE%E7%A4%BA">10.1 分数和生命值显示</a></p>

<p style="margin-left:80px"><a href="#10.2%20%E6%B8%B8%E6%88%8F%E7%BB%93%E6%9D%9F%E7%94%BB%E9%9D%A2">10.2 游戏结束画面</a></p>

<p style="margin-left:80px"><a href="#10.3%20%E8%A7%92%E8%89%B2%E5%8A%A8%E7%94%BB">10.3 角色动画</a></p>

<p style="margin-left:40px"><a href="#11.%20%E6%B8%B8%E6%88%8F%E4%B8%BB%E5%BE%AA%E7%8E%AF%E4%B8%8E%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86">11. 游戏主循环与事件处理</a></p>

<p style="margin-left:80px"><a href="#11.1%20%E6%B8%B8%E6%88%8F%E4%B8%BB%E5%BE%AA%E7%8E%AF%E7%BB%93%E6%9E%84">11.1 游戏主循环结构</a></p>

<p style="margin-left:80px"><a href="#11.2%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86">11.2 事件处理</a></p>

<p style="margin-left:80px"><a href="#11.3%20%E9%94%AE%E7%9B%98%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86">11.3 键盘输入处理</a></p>

<p style="margin-left:40px"><a href="#12.%20%E4%BB%A3%E7%A0%81%E4%BC%98%E5%8C%96%E4%B8%8E%E6%80%A7%E8%83%BD%E6%94%B9%E8%BF%9B">12. 代码优化与性能改进</a></p>

<p style="margin-left:80px"><a href="#12.1%20%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B%E4%BC%98%E5%8C%96">12.1 碰撞检测优化</a></p>

<p style="margin-left:80px"><a href="#12.2%20%E6%B8%B2%E6%9F%93%E4%BC%98%E5%8C%96">12.2 渲染优化</a></p>

<p style="margin-left:80px"><a href="#12.3%20%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86">12.3 内存管理</a></p>

<p style="margin-left:40px"><a href="#13.%20%E5%AE%8C%E6%95%B4%E4%BB%A3%E7%A0%81">13. 完整代码</a></p>

<hr />
<p>&nbsp;</p>

<h2>前言</h2>

<p>吃豆人（Pac-Man）是一款经典的街机游戏，自1980年问世以来一直深受玩家喜爱。在这篇博客中，我将详细介绍如何使用Python的Pygame库从零开始构建一个完整的吃豆人游戏。我们将逐步实现游戏的核心功能，包括角色控制、碰撞检测、AI行为等，并且深入剖析每个组件的工作原理。</p>

<p>无论你是游戏开发新手还是想要提升编程技能的中级开发者，这个项目都将帮助你理解游戏开发的基本原理和技巧。让我们开始这段有趣的编程之旅吧！</p>

<h2>1. Pygame游戏开发基础</h2>

<h3>1.1 Pygame简介</h3>

<p>Pygame是一个为Python设计的游戏开发库，它基于SDL（Simple DirectMedia Layer）构建，提供了图形、声音、输入设备等功能的简单接口，非常适合初学者和中级开发者使用。</p>

<p>Pygame的主要特点包括：</p>

<ul>
	<li>跨平台：可在Windows、macOS、Linux等多种系统上运行</li>
	<li>易于学习：API设计简洁直观</li>
	<li>功能全面：提供图形渲染、声音播放、输入处理等游戏开发必备功能</li>
	<li>活跃的社区：有大量的教程和资源可供学习</li>
</ul>

<h3>1.2 游戏开发基本概念</h3>

<p>在开始编写游戏代码前，让我们先了解一些游戏开发的基本概念：</p>

<p><strong>1. 游戏循环（Game Loop）</strong></p>

<p>游戏循环是几乎所有电子游戏的核心，它通常包含以下三个主要步骤：</p>

<ul>
	<li>处理输入（Processing Input）：检测并响应用户的键盘、鼠标等输入</li>
	<li>更新游戏状态（Updating Game State）：根据输入和游戏规则更新游戏对象的状态</li>
	<li>渲染（Rendering）：将当前游戏状态绘制到屏幕上</li>
</ul>

<p><strong>2. 精灵（Sprite）</strong></p>

<p>在游戏开发中，精灵是指可以在屏幕上移动的图形对象。在我们的吃豆人游戏中，吃豆人和幽灵都是精灵。</p>

<p><strong>3. 碰撞检测（Collision Detection）</strong></p>

<p>碰撞检测用于判断游戏对象之间是否发生接触或重叠，这在游戏中非常重要。例如，我们需要检测吃豆人是否碰到了豆子或幽灵。</p>

<p><strong>4. 帧率控制（Frame Rate Control）</strong></p>

<p>帧率是指游戏每秒更新和渲染的次数。控制帧率对于确保游戏在不同硬件上有一致的表现非常重要。</p>

<h3>1.3 Pygame核心模块介绍</h3>

<p>Pygame提供了多个模块来处理游戏开发的不同方面：</p>

<ul>
	<li><code>pygame.display</code>：创建和管理游戏窗口</li>
	<li><code>pygame.event</code>：处理用户输入和其他事件</li>
	<li><code>pygame.draw</code>：提供基本图形绘制功能</li>
	<li><code>pygame.image</code>：加载和处理图像</li>
	<li><code>pygame.mixer</code>：处理音频播放</li>
	<li><code>pygame.font</code>：渲染文本</li>
	<li><code>pygame.time</code>：控制时间和帧率</li>
	<li><code>pygame.Rect</code>：处理矩形区域（对碰撞检测很有用）</li>
</ul>

<p>在我们的吃豆人游戏中，将主要使用这些模块来实现各种功能。</p>

<h2>2. 游戏设计与规划</h2>

<h3>2.1 游戏规则设计</h3>

<p>首先，让我们确定我们的吃豆人游戏的基本规则：</p>

<ol>
	<li>玩家控制吃豆人在迷宫中移动，目标是吃掉所有的豆子</li>
	<li>迷宫中有四个会追逐吃豆人的幽灵</li>
	<li>如果幽灵碰到吃豆人，吃豆人会失去一条生命</li>
	<li>玩家初始有3条生命，全部失去后游戏结束</li>
	<li>吃掉小豆子可以获得10分</li>
	<li>吃掉大豆子（能量豆）可以获得50分，并且能暂时让幽灵变成可食用状态</li>
	<li>在幽灵处于可食用状态时，吃豆人可以吃掉幽灵获得200分</li>
	<li>吃掉所有豆子后，玩家获胜</li>
</ol>

<h3>2.2 游戏对象规划</h3>

<p>我们的游戏需要以下几种主要对象：</p>

<ol>
	<li>
	<p><strong>吃豆人（Pac-Man）</strong>&nbsp;：</p>

	<ul>
		<li>属性：位置、方向、速度、生命值、分数</li>
		<li>行为：移动、改变方向、吃豆子、与幽灵交互</li>
	</ul>
	</li>
	<li>
	<p><strong>幽灵（Ghost）</strong>&nbsp;：</p>

	<ul>
		<li>属性：位置、颜色、方向、速度、状态（普通/可食用）</li>
		<li>行为：移动、追逐吃豆人、在被吃后重生</li>
	</ul>
	</li>
	<li>
	<p><strong>迷宫（Maze）</strong>&nbsp;：</p>

	<ul>
		<li>属性：网格布局（墙壁和通道）</li>
		<li>用途：限制角色移动范围，提供游戏环境</li>
	</ul>
	</li>
	<li>
	<p><strong>豆子（Dots）</strong>&nbsp;：</p>

	<ul>
		<li>小豆子：被吃后加10分</li>
		<li>大豆子（能量豆）：被吃后加50分并激活幽灵的可食用状态</li>
	</ul>
	</li>
	<li>
	<p><strong>游戏管理器</strong>：</p>

	<ul>
		<li>控制游戏状态（运行中、暂停、游戏结束）</li>
		<li>管理得分系统</li>
		<li>处理游戏逻辑（如关卡切换、胜利条件检查）</li>
	</ul>
	</li>
</ol>

<h3>2.3 技术方案选择</h3>

<p>对于我们的吃豆人游戏，我们将采用以下技术方案：</p>

<ol>
	<li><strong>游戏引擎</strong>：Pygame（提供图形渲染、输入处理等基础功能）</li>
	<li><strong>图形表示</strong>：使用简单的几何图形（圆形、矩形等）绘制游戏元素</li>
	<li><strong>碰撞检测</strong>：基于距离计算的简单碰撞检测方法</li>
	<li><strong>AI算法</strong>：简化的追逐算法，幽灵会有一定概率朝吃豆人的方向移动</li>
	<li><strong>地图表示</strong>：使用二维数组表示迷宫布局，1表示墙壁，0表示通道</li>
</ol>

<p>这种方案适合初学者理解，同时也能实现一个功能完整的吃豆人游戏。</p>

<h2>3. 创建游戏窗口与初始化</h2>

<h3>3.1 初始化Pygame环境</h3>

<p>首先，我们需要导入必要的模块并初始化Pygame环境：</p>

<p>python</p>

<pre>
<code>import pygame
import random
import math

# 初始化 Pygame
pygame.init()</code></pre>

<p><code>pygame.init()</code>函数初始化所有Pygame模块，这是使用Pygame的第一步。</p>

<h3>3.2 设置游戏窗口</h3>

<p>接下来，我们创建游戏窗口并设置标题：</p>

<p>python</p>

<pre>
<code># 设置游戏窗口
WIDTH, HEIGHT = 800, 600
win = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pac-Man 游戏")</code></pre>

<p>这里我们创建了一个800x600像素的游戏窗口，并将其标题设置为&quot;Pac-Man 游戏&quot;。<code>pygame.display.set_mode()</code>函数返回一个Surface对象，我们将使用这个对象来绘制游戏元素。</p>

<h3>3.3 定义颜色和游戏参数</h3>

<p>为了使代码更清晰，我们定义了一些常用颜色和游戏参数：</p>

<p>python</p>

<pre>
<code># 颜色定义
BLACK = (0, 0, 0)
YELLOW = (255, 255, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
PINK = (255, 192, 203)
ORANGE = (255, 165, 0)
CYAN = (0, 255, 255)

# 游戏参数
CELL_SIZE = 30
GRID_WIDTH = WIDTH // CELL_SIZE
GRID_HEIGHT = HEIGHT // CELL_SIZE</code></pre>

<p>颜色在Pygame中用RGB元组表示，例如(255, 255, 0)表示黄色。</p>

<p><code>CELL_SIZE</code>定义了游戏网格中每个单元格的大小（30像素），<code>GRID_WIDTH</code>和<code>GRID_HEIGHT</code>计算了游戏窗口可以容纳的网格数量。这种网格系统将帮助我们更容易地放置游戏对象并处理碰撞检测。</p>

<h3>3.4 初始化游戏时钟</h3>

<p>Pygame提供了一个Clock对象来控制游戏的帧率：</p>

<pre>
<code>clock = pygame.time.Clock()</code></pre>

<p>在游戏循环中，我们将使用<code>clock.tick(60)</code>来确保游戏以约60帧每秒的速度运行。这对于保持游戏运行速度一致非常重要，无论游戏运行在什么样的硬件上。</p>

<h2>4. 吃豆人角色设计与实现</h2>

<h3>4.1 吃豆人类设计</h3>

<p>我们创建一个<code>PacMan</code>类来封装吃豆人的属性和行为：</p>

<p>python</p>

<pre>
<code>class PacMan:
    def __init__(self):
        self.x = GRID_WIDTH // 2
        self.y = GRID_HEIGHT // 2
        self.direction = "right"
        self.speed = 0.1
        self.mouth_open = True
        self.mouth_counter = 0
        self.score = 0
        self.lives = 3</code></pre>

<p>这个初始化方法设置了吃豆人的起始位置（在网格中心），方向（向右），速度，嘴巴状态（用于动画），分数和生命值。</p>

<h3>4.2 实现吃豆人移动</h3>

<p>让我们添加一个方法来处理吃豆人的移动：</p>

<p>python</p>

<pre>
<code>def move(self, direction, grid):
    new_x, new_y = self.x, self.y
    
    if direction == "right":
        new_x += self.speed
    elif direction == "left":
        new_x -= self.speed
    elif direction == "up":
        new_y -= self.speed
    elif direction == "down":
        new_y += self.speed
    
    # 检查是否能移动（不与墙碰撞）
    cell_x, cell_y = int(new_x), int(new_y)
    if 0 &lt;= cell_x &lt; GRID_WIDTH and 0 &lt;= cell_y &lt; GRID_HEIGHT and grid[cell_y][cell_x] != 1:
        self.x, self.y = new_x, new_y
        self.direction = direction
    
    # 更新嘴巴动画
    self.mouth_counter += 1
    if self.mouth_counter &gt;= 10:
        self.mouth_counter = 0
        self.mouth_open = not self.mouth_open</code></pre>

<p>这个方法接受一个方向参数和迷宫网格，然后尝试向该方向移动吃豆人。它首先计算吃豆人的新位置，然后检查这个位置是否有效（在网格范围内且不是墙壁）。如果有效，就更新吃豆人的位置和方向。</p>

<p>此外，这个方法还更新了嘴巴的动画状态，每10帧切换一次嘴巴的开合状态，这将创建吃豆人标志性的&quot;吃&quot;的动画效果。</p>

<h3>4.3 绘制吃豆人</h3>

<p>接下来，我们需要一个方法来绘制吃豆人：</p>

<p>python</p>

<pre>
<code>def draw(self, win):
    x = int(self.x * CELL_SIZE + CELL_SIZE // 2)
    y = int(self.y * CELL_SIZE + CELL_SIZE // 2)
    radius = CELL_SIZE // 2
    
    # 绘制 Pac-Man
    if self.mouth_open:
        # 嘴巴张开
        if self.direction == "right":
            pygame.draw.circle(win, YELLOW, (x, y), radius)
            pygame.draw.polygon(win, BLACK, [(x, y), 
                                            (x + radius, y - radius // 2), 
                                            (x + radius, y + radius // 2)])
        elif self.direction == "left":
            pygame.draw.circle(win, YELLOW, (x, y), radius)
            pygame.draw.polygon(win, BLACK, [(x, y), 
                                            (x - radius, y - radius // 2), 
                                            (x - radius, y + radius // 2)])
        elif self.direction == "up":
            pygame.draw.circle(win, YELLOW, (x, y), radius)
            pygame.draw.polygon(win, BLACK, [(x, y), 
                                            (x - radius // 2, y - radius), 
                                            (x + radius // 2, y - radius)])
        elif self.direction == "down":
            pygame.draw.circle(win, YELLOW, (x, y), radius)
            pygame.draw.polygon(win, BLACK, [(x, y), 
                                            (x - radius // 2, y + radius), 
                                            (x + radius // 2, y + radius)])
    else:
        # 嘴巴闭合
        pygame.draw.circle(win, YELLOW, (x, y), radius)</code></pre>

<p>这个方法使用Pygame的绘图函数来绘制吃豆人。当嘴巴打开时，我们绘制一个黄色圆形和一个黑色三角形（表示嘴巴），三角形的位置根据吃豆人的方向而改变。当嘴巴闭合时，我们只绘制一个完整的黄色圆形。</p>

<h2>5. 幽灵角色设计与AI实现</h2>

<h3>5.1 幽灵类设计</h3>

<p>现在让我们创建一个<code>Ghost</code>类来处理幽灵的行为：</p>

<p>python</p>

<pre>
<code>class Ghost:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color
        self.direction = random.choice(["right", "left", "up", "down"])
        self.speed = 0.05
        self.frightened = False</code></pre>

<p>每个幽灵都有一个位置、颜色、方向、速度和状态（是否处于&quot;惊吓&quot;状态）。我们将创建四个不同颜色的幽灵，每个幽灵都有自己的起始位置。</p>

<h3>5.2 幽灵AI行为实现</h3>

<p>幽灵的关键行为是在迷宫中移动并尝试追逐吃豆人。我们实现了一个简单的AI系统：</p>

<p>python</p>

<pre>
<code>def move(self, grid, pacman):
    directions = ["right", "left", "up", "down"]
    
    # 简单的 AI - 有 80% 概率朝向 Pac-Man，20% 概率随机移动
    if random.random() &lt; 0.8 and not self.frightened:
        # 寻找 Pac-Man 的方向
        if pacman.x &gt; self.x and "right" in directions:
            self.direction = "right"
        elif pacman.x &lt; self.x and "left" in directions:
            self.direction = "left"
        elif pacman.y &gt; self.y and "down" in directions:
            self.direction = "down"
        elif pacman.y &lt; self.y and "up" in directions:
            self.direction = "up"
    else:
        # 随机选择方向
        self.direction = random.choice(directions)
    
    # 移动幽灵
    new_x, new_y = self.x, self.y
    
    if self.direction == "right":
        new_x += self.speed
    elif self.direction == "left":
        new_x -= self.speed
    elif self.direction == "up":
        new_y -= self.speed
    elif self.direction == "down":
        new_y += self.speed
    
    # 检查是否能移动（不与墙碰撞）
    cell_x, cell_y = int(new_x), int(new_y)
    if 0 &lt;= cell_x &lt; GRID_WIDTH and 0 &lt;= cell_y &lt; GRID_HEIGHT and grid[cell_y][cell_x] != 1:
        self.x, self.y = new_x, new_y
    else:
        # 如果碰到墙，选择新方向
        self.direction = random.choice(directions)</code></pre>

<p>这个方法实现了一个简单但有效的AI：</p>

<ul>
	<li>正常状态下，幽灵有80%的概率朝着吃豆人的方向移动，20%的概率随机移动</li>
	<li>当幽灵处于&quot;惊吓&quot;状态时，它们只会随机移动</li>
	<li>如果幽灵碰到墙壁，它会选择一个新的随机方向</li>
</ul>

<p>这种AI行为创造了一种挑战性但不是不可战胜的游戏体验。</p>

<h3>5.3 绘制幽灵</h3>

<p>幽灵的外观是游戏中的重要视觉元素，我们需要一个方法来绘制它们：</p>

<p>python</p>

<pre>
<code>def draw(self, win):
    x = int(self.x * CELL_SIZE + CELL_SIZE // 2)
    y = int(self.y * CELL_SIZE + CELL_SIZE // 2)
    radius = CELL_SIZE // 2
    
    # 绘制幽灵主体
    color = BLUE if self.frightened else self.color
    
    # 绘制幽灵的半圆顶部
    pygame.draw.circle(win, color, (x, y - radius // 3), radius)
    
    # 绘制幽灵的矩形底部
    pygame.draw.rect(win, color, (x - radius, y - radius // 3, radius * 2, radius))
    
    # 绘制幽灵底部的波浪形状
    wave_height = radius // 3
    pygame.draw.polygon(win, color, [
        (x - radius, y + radius * 2 // 3),  # 左上角
        (x - radius * 2 // 3, y + radius * 2 // 3 - wave_height),  # 第一个波谷
        (x - radius // 3, y + radius * 2 // 3),  # 第一个波峰
        (x, y + radius * 2 // 3 - wave_height),  # 第二个波谷
        (x + radius // 3, y + radius * 2 // 3),  # 第二个波峰
        (x + radius * 2 // 3, y + radius * 2 // 3 - wave_height),  # 第三个波谷
        (x + radius, y + radius * 2 // 3),  # 右上角
        (x + radius, y + radius * 2 // 3 - radius),  # 右下角
        (x - radius, y + radius * 2 // 3 - radius),  # 左下角
    ])
    
    # 绘制眼睛 (白色部分)
    eye_radius = radius // 3
    left_eye_x = x - radius // 2
    right_eye_x = x + radius // 2
    eye_y = y - radius // 3
    
    pygame.draw.circle(win, WHITE, (left_eye_x, eye_y), eye_radius)
    pygame.draw.circle(win, WHITE, (right_eye_x, eye_y), eye_radius)
    
    # 绘制眼球 (瞳孔)
    pupil_radius = eye_radius // 2
    
    # 根据方向移动眼球
    pupil_offset_x, pupil_offset_y = 0, 0
    if self.direction == "left":
        pupil_offset_x = -pupil_radius // 2
    elif self.direction == "right":
        pupil_offset_x = pupil_radius // 2
    elif self.direction == "up":
        pupil_offset_y = -pupil_radius // 2
    elif self.direction == "down":
        pupil_offset_y = pupil_radius // 2
    
    pygame.draw.circle(win, BLACK, (left_eye_x + pupil_offset_x, eye_y + pupil_offset_y), pupil_radius)
    pygame.draw.circle(win, BLACK, (right_eye_x + pupil_offset_x, eye_y + pupil_offset_y), pupil_radius)</code></pre>

<p>这个方法使用多个形状来创建经典的幽灵外观：</p>

<ul>
	<li>半圆形顶部</li>
	<li>矩形主体</li>
	<li>波浪形底部</li>
	<li>两个眼睛，眼球会根据幽灵的移动方向而变化位置</li>
</ul>

<p>当幽灵处于&quot;惊吓&quot;状态时，它们会变成蓝色，让玩家知道现在可以吃掉它们。</p>

<h2>6. 迷宫生成与渲染</h2>

<h3>6.1 迷宫表示方法</h3>

<p>在我们的游戏中，迷宫被表示为一个二维数组，其中：</p>

<ul>
	<li>0表示空白区域（可以移动）</li>
	<li>1表示墙壁（不可移动）</li>
</ul>

<p>我们实现了一个函数来创建一个随机迷宫：</p>

<p>python</p>

<pre>
<code>def create_maze():
    grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
    
    # 添加边界
    for x in range(GRID_WIDTH):
        grid[0][x] = 1
        grid[GRID_HEIGHT - 1][x] = 1
    for y in range(GRID_HEIGHT):
        grid[y][0] = 1
        grid[y][GRID_WIDTH - 1] = 1
    
    # 添加随机墙壁
    for _ in range(GRID_WIDTH * GRID_HEIGHT // 10):
        x = random.randint(1, GRID_WIDTH - 2)
        y = random.randint(1, GRID_HEIGHT - 2)
        grid[y][x] = 1
    
    # 确保 Pac-Man 的起始位置是空的
    grid[GRID_HEIGHT // 2][GRID_WIDTH // 2] = 0
    
    return grid</code></pre>

<p>这个函数首先创建一个全是0的网格，然后：</p>

<ol>
	<li>在网格的边缘添加墙壁，形成一个封闭的区域</li>
	<li>在网格内部随机添加一些墙壁，数量约为网格总单元数的10%</li>
	<li>确保吃豆人的起始位置（网格中心）是空的</li>
</ol>

<p>这种方法生成的迷宫每次游戏都不同，增加了游戏的可重玩性。</p>

<h3>6.2 迷宫渲染</h3>

<p>我们需要一个方法来绘制迷宫：</p>

<p>python</p>

<pre>
<code># 绘制迷宫
for y in range(GRID_HEIGHT):
    for x in range(GRID_WIDTH):
        if grid[y][x] == 1:
            pygame.draw.rect(win, BLUE, [x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE])</code></pre>

<p>这段代码遍历整个网格，当遇到值为1的单元格时，在相应位置绘制一个蓝色矩形表示墙壁。</p>

<h2>7. 游戏物品：豆子与能量豆</h2>

<h3>7.1 豆子生成</h3>

<p>在我们的游戏中，有两种豆子：普通豆子和能量豆（大豆子）。我们实现了一个函数来在迷宫中生成这些豆子：</p>

<p>python</p>

<pre>
<code>def create_dots(grid):
    dots = []
    big_dots = []
    
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if grid[y][x] == 0 and (x != GRID_WIDTH // 2 or y != GRID_HEIGHT // 2):  # 避免在Pac-Man起始位置放置豆子
                # 15% 概率创建大豆子，85% 概率创建小豆子
                if random.random() &lt; 0.15:
                    big_dots.append((x, y))
                else:
                    dots.append((x, y))
    
    return dots, big_dots</code></pre>

<p>这个函数遍历网格中的所有空白单元格（值为0），然后：</p>

<ul>
	<li>避免在吃豆人的起始位置放置豆子</li>
	<li>有15%的概率在该位置放置一个能量豆</li>
	<li>有85%的概率放置一个普通豆子</li>
</ul>

<p>函数返回两个列表，分别包含普通豆子和能量豆的位置。</p>

<h3>7.2 豆子渲染</h3>

<p>接下来，我们需要在游戏中绘制这些豆子：</p>

<p>python</p>

<pre>
<code># 绘制小豆子
for x, y in dots:
    pygame.draw.circle(win, WHITE, (x * CELL_SIZE + CELL_SIZE // 2, y * CELL_SIZE + CELL_SIZE // 2), CELL_SIZE // 10)

# 绘制大豆子
for x, y in big_dots:
    pygame.draw.circle(win, WHITE, (x * CELL_SIZE + CELL_SIZE // 2, y * CELL_SIZE + CELL_SIZE // 2), CELL_SIZE // 5)</code></pre>

<p>普通豆子被绘制为小白色圆点，而能量豆被绘制为较大的白色圆点。</p>

<h3>7.3 豆子与吃豆人的交互</h3>

<p>当吃豆人经过豆子的位置时，我们需要检测这种碰撞并作出相应反应：</p>

<p>python</p>

<pre>
<code># 检查吃豆子
pacman_cell_x, pacman_cell_y = int(pacman.x), int(pacman.y)

# 小豆子
for i, (x, y) in enumerate(dots[:]):
    if x == pacman_cell_x and y == pacman_cell_y:
        dots.remove((x, y))
        pacman.score += 10

# 大豆子
for i, (x, y) in enumerate(big_dots[:]):
    if x == pacman_cell_x and y == pacman_cell_y:
        big_dots.remove((x, y))
        pacman.score += 50
        
        # 幽灵进入惊恐状态
        frightened_timer = 300  # 约5秒
        for ghost in ghosts:
            ghost.frightened = True</code></pre>

<p>这段代码检查吃豆人当前所在的网格单元是否有豆子：</p>

<ul>
	<li>如果有普通豆子，移除该豆子并增加10分</li>
	<li>如果有能量豆，移除该豆子，增加50分，并让所有幽灵进入&quot;惊吓&quot;状态</li>
</ul>

<h2>8. 碰撞检测系统</h2>

<h3>8.1 角色与墙壁的碰撞检测</h3>

<p>在我们的游戏中，角色不能穿过墙壁。我们在<code>move</code>方法中实现了这种碰撞检测：</p>

<pre>
<code># 检查是否能移动（不与墙碰撞）
cell_x, cell_y = int(new_x), int(new_y)
if 0 &lt;= cell_x &lt; GRID_WIDTH and 0 &lt;= cell_y &lt; GRID_HEIGHT and grid[cell_y][cell_x] != 1:
    self.x, self.y = new_x, new_y
    self.direction = direction
else:
    # 如果是幽灵撞墙，就选择新方向
    if isinstance(self, Ghost):
        self.direction = random.choice(["right", "left", "up", "down"])</code></pre>

<p>这段代码先检查预期的新位置是否在网格范围内，然后检查该位置是否是墙壁（值为1）。如果不是墙壁，角色可以移动到新位置；如果是墙壁，则不允许移动。特别地，如果是幽灵撞到墙壁，它会选择一个新的随机方向。</p>

<h3>8.2 吃豆人与幽灵的碰撞检测</h3>

<p>吃豆人与幽灵之间的碰撞检测是游戏的核心机制之一。我们使用基于距离的碰撞检测方法：</p>

<p>python</p>

<pre>
<code># 检查与幽灵碰撞
for ghost in ghosts:
    distance = math.sqrt((pacman.x - ghost.x) ** 2 + (pacman.y - ghost.y) ** 2)
    if distance &lt; 0.7:  # 碰撞阈值
        if ghost.frightened:
            # Pac-Man 吃掉幽灵
            ghost.x, ghost.y = random.randint(1, GRID_WIDTH - 2), random.randint(1, GRID_HEIGHT - 2)
            ghost.frightened = False
            pacman.score += 200
        else:
            # 幽灵吃掉 Pac-Man
            pacman.lives -= 1
            pacman.x, pacman.y = GRID_WIDTH // 2, GRID_HEIGHT // 2
            
            if pacman.lives &lt;= 0:
                game_over = True</code></pre>

<p>这段代码计算吃豆人和每个幽灵之间的欧几里得距离。如果距离小于阈值（0.7个网格单位），则认为发生了碰撞。碰撞的结果取决于幽灵的状态：</p>

<ul>
	<li>如果幽灵处于&quot;惊吓&quot;状态，吃豆人会吃掉幽灵，获得200分，幽灵会重生在一个随机位置</li>
	<li>如果幽灵处于正常状态，吃豆人会失去一条生命，并重置到起始位置。如果吃豆人的生命值降到0，游戏结束</li>
</ul>

<h3>8.3 吃豆人与豆子的碰撞检测</h3>

<p>我们已经在第7.3节中介绍了吃豆人与豆子的碰撞检测。为了完整性，这里再次展示相关代码：</p>

<p>python</p>

<pre>
<code># 检查吃豆子
pacman_cell_x, pacman_cell_y = int(pacman.x), int(pacman.y)

# 小豆子
for i, (x, y) in enumerate(dots[:]):
    if x == pacman_cell_x and y == pacman_cell_y:
        dots.remove((x, y))
        pacman.score += 10

# 大豆子
for i, (x, y) in enumerate(big_dots[:]):
    if x == pacman_cell_x and y == pacman_cell_y:
        big_dots.remove((x, y))
        pacman.score += 50
        
        # 幽灵进入惊恐状态
        frightened_timer = 300  # 约5秒
        for ghost in ghosts:
            ghost.frightened = True</code></pre>

<p>这种碰撞检测基于网格位置：如果吃豆人当前所在的网格单元与豆子的位置相同，则认为吃豆人吃到了豆子。</p>

<h2>9. 游戏状态管理</h2>

<h3>9.1 游戏状态定义</h3>

<p>我们的游戏有几种不同的状态：</p>

<ol>
	<li>游戏运行中</li>
	<li>游戏暂停</li>
	<li>游戏结束（玩家胜利或失败）</li>
</ol>

<p>我们使用布尔变量<code>game_over</code>来跟踪游戏是否结束：</p>

<p>python</p>

<pre>
<code>running = True  # 游戏程序是否继续运行
game_over = False  # 当前游戏是否结束</code></pre>

<h3>9.2 游戏状态切换</h3>

<p>游戏状态可以通过几种方式切换：</p>

<ol>
	<li><strong>游戏结束</strong>：当玩家失去所有生命或吃掉所有豆子时</li>
</ol>

<p>python</p>

<pre>
<code># 检查游戏胜利
if len(dots) == 0 and len(big_dots) == 0:
    game_over = True

# 或者当玩家失去所有生命时
if pacman.lives &lt;= 0:
    game_over = True</code></pre>

<ol>
	<li><strong>重新开始游戏</strong>：当游戏结束后按下回车键</li>
</ol>

<p>python</p>

<pre>
<code>if event.type == pygame.KEYDOWN:
    if event.key == pygame.K_RETURN and game_over:
        # 重新开始游戏
        pacman, grid, dots, big_dots, ghosts = init_game()
        game_over = False</code></pre>

<ol>
	<li><strong>退出游戏</strong>：当玩家关闭游戏窗口时</li>
</ol>

<p>python</p>

<pre>
<code>if event.type == pygame.QUIT:
    running = False</code></pre>

<h3>9.3 幽灵状态管理</h3>

<p>幽灵有两种状态：正常状态和&quot;惊吓&quot;状态。我们使用<code>frightened</code>属性和一个计时器来管理这种状态：</p>

<p>python</p>

<pre>
<code># 处理幽灵惊恐状态
if frightened_timer &gt; 0:
    frightened_timer -= 1
    if frightened_timer == 0:
        for ghost in ghosts:
            ghost.frightened = False</code></pre>

<p>当吃豆人吃到能量豆时，所有幽灵进入&quot;惊吓&quot;状态，并设置一个计时器（300帧，约5秒）。每帧都会减少计时器的值，当计时器归零时，所有幽灵回到正常状态。</p>

<h2>10. 游戏UI与视觉效果</h2>

<h3>10.1 分数和生命值显示</h3>

<p>我们在游戏界面顶部显示玩家的分数和剩余生命值：</p>

<p>python</p>

<pre>
<code># 绘制分数和生命值
font = pygame.font.SysFont(None, 36)
score_text = font.render(f"分数: {pacman.score}", True, WHITE)
lives_text = font.render(f"生命: {pacman.lives}", True, WHITE)
win.blit(score_text, (10, 10))
win.blit(lives_text, (WIDTH - 110, 10))</code></pre>

<p>这段代码创建两个文本Surface对象，分别显示分数和生命值，然后将它们绘制在游戏窗口的顶部。</p>

<h3>10.2 游戏结束画面</h3>

<p>当游戏结束时，我们显示一个游戏结束画面，告诉玩家游戏结果并提供重新开始的提示：</p>

<p>python</p>

<pre>
<code># 游戏结束显示
if game_over:
    font = pygame.font.SysFont(None, 72)
    
    if pacman.lives &lt;= 0:
        game_over_text = font.render("游戏结束!", True, RED)
    else:
        game_over_text = font.render("恭喜你赢了!", True, YELLOW)
    
    restart_text = font.render("按 Enter 重新开始", True, WHITE)
    
    win.blit(game_over_text, (WIDTH // 2 - game_over_text.get_width() // 2, HEIGHT // 2 - 50))
    win.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2 + 50))</code></pre>

<p>根据游戏结束的原因（玩家胜利或失败），显示不同的信息。游戏胜利时显示黄色的&quot;恭喜你赢了!&quot;，失败时显示红色的&quot;游戏结束!&quot;。同时，提示玩家按Enter键重新开始游戏。</p>

<h3>10.3 角色动画</h3>

<p>为了增加游戏的视觉吸引力，我们为吃豆人和幽灵添加了简单的动画效果：</p>

<ol>
	<li><strong>吃豆人的嘴巴动画</strong>：吃豆人的嘴巴会周期性地开合，创造出经典的&quot;吃&quot;的效果</li>
</ol>

<p>python</p>

<pre>
<code># 更新嘴巴动画
self.mouth_counter += 1
if self.mouth_counter &gt;= 10:
    self.mouth_counter = 0
    self.mouth_open = not self.mouth_open</code></pre>

<ol>
	<li><strong>幽灵的眼球动画</strong>：幽灵的眼球会根据移动方向改变位置</li>
</ol>

<p>python</p>

<pre>
<code># 根据方向移动眼球
pupil_offset_x, pupil_offset_y = 0, 0
if self.direction == "left":
    pupil_offset_x = -pupil_radius // 2
elif self.direction == "right":
    pupil_offset_x = pupil_radius // 2
elif self.direction == "up":
    pupil_offset_y = -pupil_radius // 2
elif self.direction == "down":
    pupil_offset_y = pupil_radius // 2</code></pre>

<p>这些动画效果虽小，但大大增加了游戏的视觉体验和角色的生动感。</p>

<h2>11. 游戏主循环与事件处理</h2>

<h3>11.1 游戏主循环结构</h3>

<p>游戏主循环是游戏程序的核心，负责处理输入、更新游戏状态和渲染画面。我们的主循环结构如下：</p>

<p>python</p>

<pre>
<code>def main():
    clock = pygame.time.Clock()
    pacman, grid, dots, big_dots, ghosts = init_game()
    
    frightened_timer = 0
    
    running = True
    game_over = False
    
    while running:
        clock.tick(60)  # 限制帧率为60FPS
        
        # 事件处理
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN and game_over:
                    # 重新开始游戏
                    pacman, grid, dots, big_dots, ghosts = init_game()
                    game_over = False
        
        if not game_over:
            # 处理输入
            keys = pygame.key.get_pressed()
            
            # 处理吃豆人移动
            if keys[pygame.K_RIGHT]:
                pacman.move("right", grid)
            elif keys[pygame.K_LEFT]:
                pacman.move("left", grid)
            elif keys[pygame.K_UP]:
                pacman.move("up", grid)
            elif keys[pygame.K_DOWN]:
                pacman.move("down", grid)
            
            # 更新游戏状态
            
            # 幽灵移动
            for ghost in ghosts:
                ghost.move(grid, pacman)
            
            # 检查吃豆子
            # ...
            
            # 检查碰撞
            # ...
            
            # 检查游戏胜利
            # ...
        
        # 渲染
        draw_game(win, pacman, grid, dots, big_dots, ghosts)
        
        # 游戏结束显示
        # ...
    
    pygame.quit()</code></pre>

<p>这个结构遵循了典型的游戏循环模式：</p>

<ol>
	<li>限制帧率</li>
	<li>处理事件</li>
	<li>根据输入更新游戏状态</li>
	<li>渲染当前游戏状态</li>
	<li>处理特殊情况（如游戏结束）</li>
	<li>如此循环直到游戏退出</li>
</ol>

<h3>11.2 事件处理</h3>

<p>Pygame使用事件队列来处理用户输入和其他事件。我们的事件处理代码如下：</p>

<p>python</p>

<pre>
<code>for event in pygame.event.get():
    if event.type == pygame.QUIT:
        running = False
    
    if event.type == pygame.KEYDOWN:
        if event.key == pygame.K_RETURN and game_over:
            # 重新开始游戏
            pacman, grid, dots, big_dots, ghosts = init_game()
            game_over = False</code></pre>

<p>这段代码处理两种事件：</p>

<ul>
	<li><code>pygame.QUIT</code>事件（当玩家关闭游戏窗口时触发）</li>
	<li><code>pygame.KEYDOWN</code>事件，特别是检查游戏结束时按下回车键重新开始游戏</li>
</ul>

<h3>11.3 键盘输入处理</h3>

<p>除了事件队列外，我们还使用<code>pygame.key.get_pressed()</code>函数来检测当前按下的键，这适用于需要持续检测的输入，如方向键控制：</p>

<p>python</p>

<pre>
<code>keys = pygame.key.get_pressed()

# 处理吃豆人移动
if keys[pygame.K_RIGHT]:
    pacman.move("right", grid)
elif keys[pygame.K_LEFT]:
    pacman.move("left", grid)
elif keys[pygame.K_UP]:
    pacman.move("up", grid)
elif keys[pygame.K_DOWN]:
    pacman.move("down", grid)</code></pre>

<p>这段代码检查方向键（上、下、左、右）是否被按下，并据此移动吃豆人。使用<code>elif</code>确保每帧只处理一个方向，优先级从右到左再到上再到下。</p>

<h2>12. 代码优化与性能改进</h2>

<h3>12.1 碰撞检测优化</h3>

<p>在我们的游戏中，碰撞检测是一个频繁执行的操作。为了提高性能，我们可以采取以下优化措施：</p>

<ol>
	<li><strong>减少不必要的计算</strong>：只在距离较近时才进行精确的碰撞检测</li>
</ol>

<p>python</p>

<pre>
<code># 优化前
distance = math.sqrt((pacman.x - ghost.x) ** 2 + (pacman.y - ghost.y) ** 2)
if distance &lt; 0.7:
    # 处理碰撞

# 优化后
dx = pacman.x - ghost.x
dy = pacman.y - ghost.y
# 避免开方运算，直接比较平方
if dx*dx + dy*dy &lt; 0.7*0.7:
    # 处理碰撞</code></pre>

<ol>
	<li><strong>使用网格位置进行初步筛选</strong>：对于豆子的碰撞检测，我们只检查吃豆人当前所在的网格单元，而不是所有豆子</li>
</ol>

<p>python</p>

<pre>
<code># 优化前
for dot in dots:
    if collision(pacman, dot):
        # 处理碰撞

# 优化后
pacman_cell_x, pacman_cell_y = int(pacman.x), int(pacman.y)
for x, y in dots[:]:
    if x == pacman_cell_x and y == pacman_cell_y:
        # 处理碰撞</code></pre>

<h3>12.2 渲染优化</h3>

<p>渲染是游戏中另一个性能关键点。我们可以通过以下方式优化渲染过程：</p>

<ol>
	<li><strong>只渲染可见区域</strong>：如果游戏地图非常大，只渲染当前屏幕可见的部分</li>
</ol>

<p>python</p>

<pre>
<code># 计算可见区域
view_left = max(0, int(pacman.x) - VIEW_RANGE)
view_right = min(GRID_WIDTH, int(pacman.x) + VIEW_RANGE + 1)
view_top = max(0, int(pacman.y) - VIEW_RANGE)
view_bottom = min(GRID_HEIGHT, int(pacman.y) + VIEW_RANGE + 1)

# 只渲染可见区域
for y in range(view_top, view_bottom):
    for x in range(view_left, view_right):
        # 渲染网格[y][x]</code></pre>

<ol>
	<li><strong>减少渲染调用</strong>：合并相同类型的渲染操作，减少API调用次数</li>
</ol>

<p>python</p>

<pre>
<code># 优化前
for dot in dots:
    draw_dot(dot)

# 优化后
# 创建一个Surface来预渲染所有豆子
dots_surface = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
for dot in dots:
    draw_dot(dots_surface, dot)
# 一次性将所有豆子绘制到屏幕上
win.blit(dots_surface, (0, 0))</code></pre>

<h3>12.3 内存管理</h3>

<p>良好的内存管理对于游戏性能也很重要：</p>

<ol>
	<li><strong>避免内存泄漏</strong>：确保不再需要的对象被正确清理</li>
</ol>

<p>python</p>

<pre>
<code># 游戏退出时清理资源
pygame.quit()</code></pre>

<ol>
	<li><strong>重用对象</strong>：避免频繁创建和销毁临时对象</li>
</ol>

<p>python</p>

<pre>
<code># 不好的做法：每次创建新字体对象
font = pygame.font.SysFont(None, 36)
score_text = font.render(f"分数: {pacman.score}", True, WHITE)

# 更好的做法：只创建一次字体对象，重复使用
# 在游戏初始化时
self.font = pygame.font.SysFont(None, 36)

# 在渲染时
score_text = self.font.render(f"分数: {pacman.score}", True, WHITE)</code></pre>

<ol>
	<li><strong>使用适当的数据结构</strong>：选择适合操作类型的数据结构</li>
</ol>

<p>python</p>

<pre>
<code># 对于经常需要检查成员关系的集合，使用set而不是list
dots = set((x, y) for x in range(GRID_WIDTH) for y in range(GRID_HEIGHT) if grid[y][x] == 0)

# 检查成员关系
if (pacman_cell_x, pacman_cell_y) in dots:
    dots.remove((pacman_cell_x, pacman_cell_y))
    pacman.score += 10</code></pre>

<h2>13. 完整代码</h2>

<p>以下是我们吃豆人游戏的完整代码：</p>

<pre>
<code class="language-python">import pygame
import random
import math

# 初始化 Pygame
pygame.init()

# 设置游戏窗口
WIDTH, HEIGHT = 800, 600
win = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pac-Man 游戏")

# 颜色定义
BLACK = (0, 0, 0)
YELLOW = (255, 255, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
PINK = (255, 192, 203)
ORANGE = (255, 165, 0)
CYAN = (0, 255, 255)

# 游戏参数
CELL_SIZE = 30
GRID_WIDTH = WIDTH // CELL_SIZE
GRID_HEIGHT = HEIGHT // CELL_SIZE


# Pac-Man 参数
class PacMan:
    def __init__(self):
        self.x = GRID_WIDTH // 2
        self.y = GRID_HEIGHT // 2
        self.direction = "right"
        self.speed = 0.1
        self.mouth_open = True
        self.mouth_counter = 0
        self.score = 0
        self.lives = 3

    def move(self, direction, grid):
        new_x, new_y = self.x, self.y

        if direction == "right":
            new_x += self.speed
        elif direction == "left":
            new_x -= self.speed
        elif direction == "up":
            new_y -= self.speed
        elif direction == "down":
            new_y += self.speed

        # 检查是否能移动（不与墙碰撞）
        cell_x, cell_y = int(new_x), int(new_y)
        if 0 &lt;= cell_x &lt; GRID_WIDTH and 0 &lt;= cell_y &lt; GRID_HEIGHT and grid[cell_y][cell_x] != 1:
            self.x, self.y = new_x, new_y
            self.direction = direction

        # 更新嘴巴动画
        self.mouth_counter += 1
        if self.mouth_counter &gt;= 10:
            self.mouth_counter = 0
            self.mouth_open = not self.mouth_open

    def draw(self, win):
        x = int(self.x * CELL_SIZE + CELL_SIZE // 2)
        y = int(self.y * CELL_SIZE + CELL_SIZE // 2)
        radius = CELL_SIZE // 2

        # 绘制 Pac-Man
        if self.mouth_open:
            # 嘴巴张开
            if self.direction == "right":
                pygame.draw.circle(win, YELLOW, (x, y), radius)
                pygame.draw.polygon(win, BLACK, [(x, y),
                                                 (x + radius, y - radius // 2),
                                                 (x + radius, y + radius // 2)])
            elif self.direction == "left":
                pygame.draw.circle(win, YELLOW, (x, y), radius)
                pygame.draw.polygon(win, BLACK, [(x, y),
                                                 (x - radius, y - radius // 2),
                                                 (x - radius, y + radius // 2)])
            elif self.direction == "up":
                pygame.draw.circle(win, YELLOW, (x, y), radius)
                pygame.draw.polygon(win, BLACK, [(x, y),
                                                 (x - radius // 2, y - radius),
                                                 (x + radius // 2, y - radius)])
            elif self.direction == "down":
                pygame.draw.circle(win, YELLOW, (x, y), radius)
                pygame.draw.polygon(win, BLACK, [(x, y),
                                                 (x - radius // 2, y + radius),
                                                 (x + radius // 2, y + radius)])
        else:
            # 嘴巴闭合
            pygame.draw.circle(win, YELLOW, (x, y), radius)


# 幽灵参数
class Ghost:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color
        self.direction = random.choice(["right", "left", "up", "down"])
        self.speed = 0.05
        self.frightened = False

    def move(self, grid, pacman):
        directions = ["right", "left", "up", "down"]

        # 简单的 AI - 有 80% 概率朝向 Pac-Man，20% 概率随机移动
        if random.random() &lt; 0.8 and not self.frightened:
            # 寻找 Pac-Man 的方向
            if pacman.x &gt; self.x and "right" in directions:
                self.direction = "right"
            elif pacman.x &lt; self.x and "left" in directions:
                self.direction = "left"
            elif pacman.y &gt; self.y and "down" in directions:
                self.direction = "down"
            elif pacman.y &lt; self.y and "up" in directions:
                self.direction = "up"
        else:
            # 随机选择方向
            self.direction = random.choice(directions)

        # 移动幽灵
        new_x, new_y = self.x, self.y

        if self.direction == "right":
            new_x += self.speed
        elif self.direction == "left":
            new_x -= self.speed
        elif self.direction == "up":
            new_y -= self.speed
        elif self.direction == "down":
            new_y += self.speed

        # 检查是否能移动（不与墙碰撞）
        cell_x, cell_y = int(new_x), int(new_y)
        if 0 &lt;= cell_x &lt; GRID_WIDTH and 0 &lt;= cell_y &lt; GRID_HEIGHT and grid[cell_y][cell_x] != 1:
            self.x, self.y = new_x, new_y
        else:
            # 如果碰到墙，选择新方向
            self.direction = random.choice(directions)

    def draw(self, win):
        x = int(self.x * CELL_SIZE + CELL_SIZE // 2)
        y = int(self.y * CELL_SIZE + CELL_SIZE // 2)
        radius = CELL_SIZE // 2

        # 绘制幽灵主体
        color = BLUE if self.frightened else self.color

        # 绘制幽灵的半圆顶部
        pygame.draw.circle(win, color, (x, y - radius // 3), radius)

        # 绘制幽灵的矩形底部
        pygame.draw.rect(win, color, (x - radius, y - radius // 3, radius * 2, radius))

        # 绘制幽灵底部的波浪形状
        wave_height = radius // 3
        pygame.draw.polygon(win, color, [
            (x - radius, y + radius * 2 // 3),  # 左上角
            (x - radius * 2 // 3, y + radius * 2 // 3 - wave_height),  # 第一个波谷
            (x - radius // 3, y + radius * 2 // 3),  # 第一个波峰
            (x, y + radius * 2 // 3 - wave_height),  # 第二个波谷
            (x + radius // 3, y + radius * 2 // 3),  # 第二个波峰
            (x + radius * 2 // 3, y + radius * 2 // 3 - wave_height),  # 第三个波谷
            (x + radius, y + radius * 2 // 3),  # 右上角
            (x + radius, y + radius * 2 // 3 - radius),  # 右下角
            (x - radius, y + radius * 2 // 3 - radius),  # 左下角
        ])

        # 绘制眼睛 (白色部分)
        eye_radius = radius // 3
        left_eye_x = x - radius // 2
        right_eye_x = x + radius // 2
        eye_y = y - radius // 3

        pygame.draw.circle(win, WHITE, (left_eye_x, eye_y), eye_radius)
        pygame.draw.circle(win, WHITE, (right_eye_x, eye_y), eye_radius)

        # 绘制眼球 (瞳孔)
        pupil_radius = eye_radius // 2

        # 根据方向移动眼球
        pupil_offset_x, pupil_offset_y = 0, 0
        if self.direction == "left":
            pupil_offset_x = -pupil_radius // 2
        elif self.direction == "right":
            pupil_offset_x = pupil_radius // 2
        elif self.direction == "up":
            pupil_offset_y = -pupil_radius // 2
        elif self.direction == "down":
            pupil_offset_y = pupil_radius // 2

        pygame.draw.circle(win, BLACK, (left_eye_x + pupil_offset_x, eye_y + pupil_offset_y), pupil_radius)
        pygame.draw.circle(win, BLACK, (right_eye_x + pupil_offset_x, eye_y + pupil_offset_y), pupil_radius)


# 创建迷宫
def create_maze():
    grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]

    # 添加边界
    for x in range(GRID_WIDTH):
        grid[0][x] = 1
        grid[GRID_HEIGHT - 1][x] = 1
    for y in range(GRID_HEIGHT):
        grid[y][0] = 1
        grid[y][GRID_WIDTH - 1] = 1

    # 添加随机墙壁
    for _ in range(GRID_WIDTH * GRID_HEIGHT // 10):
        x = random.randint(1, GRID_WIDTH - 2)
        y = random.randint(1, GRID_HEIGHT - 2)
        grid[y][x] = 1

    # 确保 Pac-Man 的起始位置是空的
    grid[GRID_HEIGHT // 2][GRID_WIDTH // 2] = 0

    return grid


# 创建豆子
def create_dots(grid):
    dots = []
    big_dots = []

    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if grid[y][x] == 0 and (x != GRID_WIDTH // 2 or y != GRID_HEIGHT // 2):  # 避免在Pac-Man起始位置放置豆子
                # 15% 概率创建大豆子，85% 概率创建小豆子
                if random.random() &lt; 0.15:
                    big_dots.append((x, y))
                else:
                    dots.append((x, y))

    return dots, big_dots


# 游戏初始化
def init_game():
    pacman = PacMan()
    grid = create_maze()
    dots, big_dots = create_dots(grid)

    ghosts = [
        Ghost(1, 1, RED),
        Ghost(GRID_WIDTH - 2, 1, PINK),
        Ghost(1, GRID_HEIGHT - 2, ORANGE),
        Ghost(GRID_WIDTH - 2, GRID_HEIGHT - 2, CYAN)
    ]

    return pacman, grid, dots, big_dots, ghosts


# 绘制游戏
def draw_game(win, pacman, grid, dots, big_dots, ghosts):
    win.fill(BLACK)

    # 绘制迷宫
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if grid[y][x] == 1:
                pygame.draw.rect(win, BLUE, [x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE])

    # 绘制小豆子
    for x, y in dots:
        pygame.draw.circle(win, WHITE, (x * CELL_SIZE + CELL_SIZE // 2, y * CELL_SIZE + CELL_SIZE // 2),
                           CELL_SIZE // 10)

    # 绘制大豆子
    for x, y in big_dots:
        pygame.draw.circle(win, WHITE, (x * CELL_SIZE + CELL_SIZE // 2, y * CELL_SIZE + CELL_SIZE // 2), CELL_SIZE // 5)

    # 绘制 Pac-Man
    pacman.draw(win)

    # 绘制幽灵
    for ghost in ghosts:
        ghost.draw(win)

    # 绘制分数和生命值
    font = pygame.font.SysFont(None, 36)
    score_text = font.render(f"分数: {pacman.score}", True, WHITE)
    lives_text = font.render(f"生命: {pacman.lives}", True, WHITE)
    win.blit(score_text, (10, 10))
    win.blit(lives_text, (WIDTH - 110, 10))

    pygame.display.update()


# 主游戏循环
def main():
    clock = pygame.time.Clock()
    pacman, grid, dots, big_dots, ghosts = init_game()

    frightened_timer = 0

    running = True
    game_over = False

    while running:
        clock.tick(60)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN and game_over:
                    # 重新开始游戏
                    pacman, grid, dots, big_dots, ghosts = init_game()
                    game_over = False

        if not game_over:
            keys = pygame.key.get_pressed()

            # 处理 Pac-Man 移动
            if keys[pygame.K_RIGHT]:
                pacman.move("right", grid)
            elif keys[pygame.K_LEFT]:
                pacman.move("left", grid)
            elif keys[pygame.K_UP]:
                pacman.move("up", grid)
            elif keys[pygame.K_DOWN]:
                pacman.move("down", grid)

            # 处理幽灵移动
            for ghost in ghosts:
                ghost.move(grid, pacman)

            # 检查吃豆子
            pacman_cell_x, pacman_cell_y = int(pacman.x), int(pacman.y)

            # 小豆子
            for i, (x, y) in enumerate(dots[:]):
                if x == pacman_cell_x and y == pacman_cell_y:
                    dots.remove((x, y))
                    pacman.score += 10

            # 大豆子
            for i, (x, y) in enumerate(big_dots[:]):
                if x == pacman_cell_x and y == pacman_cell_y:
                    big_dots.remove((x, y))
                    pacman.score += 50

                    # 幽灵进入惊恐状态
                    frightened_timer = 300  # 约5秒
                    for ghost in ghosts:
                        ghost.frightened = True

            # 处理幽灵惊恐状态
            if frightened_timer &gt; 0:
                frightened_timer -= 1
                if frightened_timer == 0:
                    for ghost in ghosts:
                        ghost.frightened = False

            # 检查与幽灵碰撞
            for ghost in ghosts:
                distance = math.sqrt((pacman.x - ghost.x) ** 2 + (pacman.y - ghost.y) ** 2)
                if distance &lt; 0.7:  # 碰撞阈值
                    if ghost.frightened:
                        # Pac-Man 吃掉幽灵
                        ghost.x, ghost.y = random.randint(1, GRID_WIDTH - 2), random.randint(1, GRID_HEIGHT - 2)
                        ghost.frightened = False
                        pacman.score += 200
                    else:
                        # 幽灵吃掉 Pac-Man
                        pacman.lives -= 1
                        pacman.x, pacman.y = GRID_WIDTH // 2, GRID_HEIGHT // 2

                        if pacman.lives &lt;= 0:
                            game_over = True

            # 检查游戏胜利
            if len(dots) == 0 and len(big_dots) == 0:
                game_over = True

        # 绘制游戏
        draw_game(win, pacman, grid, dots, big_dots, ghosts)

        # 游戏结束显示
        if game_over:
            font = pygame.font.SysFont(None, 72)

            if pacman.lives &lt;= 0:
                game_over_text = font.render("游戏结束!", True, RED)
            else:
                game_over_text = font.render("恭喜你赢了!", True, YELLOW)

            restart_text = font.render("按 Enter 重新开始", True, WHITE)

            win.blit(game_over_text, (WIDTH // 2 - game_over_text.get_width() // 2, HEIGHT // 2 - 50))
            win.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2 + 50))

            pygame.display.update()

    pygame.quit()


if __name__ == "__main__":
    main()</code></pre>

<p><img src="https://i-blog.csdnimg.cn/direct/7893f27aafba436a9a33f257fedbabd9.png" /></p>

<p>&nbsp;</p>
