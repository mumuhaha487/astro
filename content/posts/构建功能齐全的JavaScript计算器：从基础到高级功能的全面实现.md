---
title: 构建功能齐全的JavaScript计算器：从基础到高级功能的全面实现
published: 2025-03-08
tags: [javascript,开发语言,ecmascript]
category: javascript
---

<!--more-->

<p id="main-toc" name="tableOfContents"><strong>目录</strong></p>

<p id="-toc" name="tableOfContents" style="margin-left:0px"></p>

<p id="%E6%9E%84%E5%BB%BA%E5%8A%9F%E8%83%BD%E9%BD%90%E5%85%A8%E7%9A%84JavaScript%E8%AE%A1%E7%AE%97%E5%99%A8%EF%BC%9A%E4%BB%8E%E5%9F%BA%E7%A1%80%E5%88%B0%E9%AB%98%E7%BA%A7%E5%8A%9F%E8%83%BD%E7%9A%84%E5%85%A8%E9%9D%A2%E5%AE%9E%E7%8E%B0-toc" name="tableOfContents" style="margin-left:0px"><a href="#%E6%9E%84%E5%BB%BA%E5%8A%9F%E8%83%BD%E9%BD%90%E5%85%A8%E7%9A%84JavaScript%E8%AE%A1%E7%AE%97%E5%99%A8%EF%BC%9A%E4%BB%8E%E5%9F%BA%E7%A1%80%E5%88%B0%E9%AB%98%E7%BA%A7%E5%8A%9F%E8%83%BD%E7%9A%84%E5%85%A8%E9%9D%A2%E5%AE%9E%E7%8E%B0" target="_self">构建功能齐全的JavaScript计算器：从基础到高级功能的全面实现</a></p>

<p id="%E5%BC%95%E8%A8%80-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E5%BC%95%E8%A8%80" target="_self">引言</a></p>

<p id="-toc" name="tableOfContents" style="margin-left:40px"></p>

<p id="%E9%A1%B9%E7%9B%AE%E6%A6%82%E8%BF%B0%E4%B8%8E%E5%8A%9F%E8%83%BD%E8%A7%84%E5%88%92-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E9%A1%B9%E7%9B%AE%E6%A6%82%E8%BF%B0%E4%B8%8E%E5%8A%9F%E8%83%BD%E8%A7%84%E5%88%92" target="_self">项目概述与功能规划</a></p>

<p id="%E7%94%A8%E6%88%B7%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1%E4%B8%8ECSS%E6%A0%B7%E5%BC%8F-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E7%94%A8%E6%88%B7%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1%E4%B8%8ECSS%E6%A0%B7%E5%BC%8F" target="_self">用户界面设计与CSS样式</a></p>

<p id="HTML%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1-toc" name="tableOfContents" style="margin-left:80px"><a href="#HTML%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1" target="_self">HTML结构设计</a></p>

<p id="CSS%E6%A0%B7%E5%BC%8F%E8%AE%BE%E8%AE%A1-toc" name="tableOfContents" style="margin-left:80px"><a href="#CSS%E6%A0%B7%E5%BC%8F%E8%AE%BE%E8%AE%A1" target="_self">CSS样式设计</a></p>

<p id="%E6%95%B4%E4%BD%93%E5%B8%83%E5%B1%80%E4%B8%8E%E9%85%8D%E8%89%B2%E6%96%B9%E6%A1%88-toc" name="tableOfContents" style="margin-left:120px"><a href="#%E6%95%B4%E4%BD%93%E5%B8%83%E5%B1%80%E4%B8%8E%E9%85%8D%E8%89%B2%E6%96%B9%E6%A1%88" target="_self">整体布局与配色方案</a></p>

<p id="%E6%98%BE%E7%A4%BA%E5%B1%8F%E8%AE%BE%E8%AE%A1-toc" name="tableOfContents" style="margin-left:120px"><a href="#%E6%98%BE%E7%A4%BA%E5%B1%8F%E8%AE%BE%E8%AE%A1" target="_self">显示屏设计</a></p>

<p id="%E6%8C%89%E9%92%AE%E7%BD%91%E6%A0%BC%E5%B8%83%E5%B1%80-toc" name="tableOfContents" style="margin-left:120px"><a href="#%E6%8C%89%E9%92%AE%E7%BD%91%E6%A0%BC%E5%B8%83%E5%B1%80" target="_self">按钮网格布局</a></p>

<p id="%E5%93%8D%E5%BA%94%E5%BC%8F%E8%AE%BE%E8%AE%A1%E8%80%83%E8%99%91-toc" name="tableOfContents" style="margin-left:120px"><a href="#%E5%93%8D%E5%BA%94%E5%BC%8F%E8%AE%BE%E8%AE%A1%E8%80%83%E8%99%91" target="_self">响应式设计考虑</a></p>

<p id="%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0" target="_self">核心功能实现</a></p>

<p id="%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86" target="_self">状态管理</a></p>

<p id="%E5%9F%BA%E6%9C%AC%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%9F%BA%E6%9C%AC%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86" target="_self">基本输入处理</a></p>

<p id="%E8%AE%A1%E7%AE%97%E9%80%BB%E8%BE%91-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E8%AE%A1%E7%AE%97%E9%80%BB%E8%BE%91" target="_self">计算逻辑</a></p>

<p id="%E6%98%BE%E7%A4%BA%E6%9B%B4%E6%96%B0-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E6%98%BE%E7%A4%BA%E6%9B%B4%E6%96%B0" target="_self">显示更新</a></p>

<p id="%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8D%A2%E4%B8%8E%E5%A4%9A%E5%8A%9F%E8%83%BD%E8%AE%BE%E8%AE%A1-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8D%A2%E4%B8%8E%E5%A4%9A%E5%8A%9F%E8%83%BD%E8%AE%BE%E8%AE%A1" target="_self">模式切换与多功能设计</a></p>

<p id="%E7%A7%91%E5%AD%A6%E8%AE%A1%E7%AE%97%E5%8A%9F%E8%83%BD%E8%AF%A6%E8%A7%A3-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E7%A7%91%E5%AD%A6%E8%AE%A1%E7%AE%97%E5%8A%9F%E8%83%BD%E8%AF%A6%E8%A7%A3" target="_self">科学计算功能详解</a></p>

<p id="%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0" target="_self">历史记录功能实现</a></p>

<p id="%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86%E4%B8%8E%E7%94%A8%E6%88%B7%E4%BD%93%E9%AA%8C%E4%BC%98%E5%8C%96-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86%E4%B8%8E%E7%94%A8%E6%88%B7%E4%BD%93%E9%AA%8C%E4%BC%98%E5%8C%96" target="_self">错误处理与用户体验优化</a></p>

<p id="%E9%A1%B9%E7%9B%AE%E6%80%BB%E7%BB%93%E4%B8%8E%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E9%A1%B9%E7%9B%AE%E6%80%BB%E7%BB%93%E4%B8%8E%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF" target="_self">项目总结与扩展思路</a></p>

<p id="%E5%8A%9F%E8%83%BD%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E5%8A%9F%E8%83%BD%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF" target="_self">功能扩展思路</a></p>

<p id="%E6%8A%80%E6%9C%AF%E6%94%B9%E8%BF%9B%E6%96%B9%E5%90%91-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E6%8A%80%E6%9C%AF%E6%94%B9%E8%BF%9B%E6%96%B9%E5%90%91" target="_self">技术改进方向</a></p>

<p id="%E8%AE%BE%E8%AE%A1%E4%BC%98%E5%8C%96%E6%96%B9%E5%90%91-toc" name="tableOfContents" style="margin-left:80px"><a href="#%E8%AE%BE%E8%AE%A1%E4%BC%98%E5%8C%96%E6%96%B9%E5%90%91" target="_self">设计优化方向</a></p>

<p id="%E7%BB%93%E8%AF%AD-toc" name="tableOfContents" style="margin-left:40px"><a href="#%E7%BB%93%E8%AF%AD" target="_self">结语</a></p>

<hr id="hr-toc" name="tableOfContents" />
<p></p>

<h2 id="%E5%BC%95%E8%A8%80" name="%E5%BC%95%E8%A8%80">引言</h2>

<p>在当今数字化时代，计算器应用已经成为我们日常生活和工作中不可或缺的工具。无论是进行简单的加减乘除计算，还是复杂的科学运算，一个功能完备的计算器都能大大提高我们的工作效率。本文将详细介绍如何使用HTML、CSS和JavaScript构建一个功能齐全的计算器应用，从界面设计到功能实现，全方位剖析每个环节的技术要点和实现思路。</p>

<p>这个项目不仅适合前端开发初学者作为练习项目，也能帮助有经验的开发者回顾和巩固基础知识。通过构建这个计算器，我们将涵盖多个前端开发核心概念：DOM操作、事件处理、数据处理、布局设计以及交互体验优化等。</p>

<p>让我们开始这段代码之旅，一步步打造一个既实用又美观的计算器应用！</p>

<h2 id="" name=""></h2>

<h2 id="%E9%A1%B9%E7%9B%AE%E6%A6%82%E8%BF%B0%E4%B8%8E%E5%8A%9F%E8%83%BD%E8%A7%84%E5%88%92" name="%E9%A1%B9%E7%9B%AE%E6%A6%82%E8%BF%B0%E4%B8%8E%E5%8A%9F%E8%83%BD%E8%A7%84%E5%88%92">项目概述与功能规划</h2>

<p>在开始编码前，明确项目需求和功能规划是至关重要的。我们的计算器应用将包含以下核心功能：</p>

<ol>
	<li><strong>基础计算功能</strong>：支持加减乘除四则运算、百分比计算、正负号转换等基本功能</li>
	<li><strong>科学计算功能</strong>：提供三角函数、对数、幂运算、开方、阶乘等高级数学运算</li>
	<li><strong>多模式切换</strong>：包括标准模式、科学模式和历史记录模式</li>
	<li><strong>历史记录管理</strong>：记录用户的计算历史，并允许重用历史计算结果</li>
	<li><strong>用户友好界面</strong>：直观的布局、响应式设计和良好的视觉反馈</li>
</ol>

<p>这个项目的技术栈非常简洁，仅使用前端三剑客：HTML负责结构、CSS处理样式、JavaScript实现交互逻辑。这种纯前端实现方式意味着应用可以在任何现代浏览器中运行，无需服务器支持，非常适合作为学习项目或轻量级工具。</p>

<p>接下来，我们将按照界面设计、功能实现和用户体验优化的顺序，逐步展开对计算器项目的详细解析。</p>

<h2 id="%E7%94%A8%E6%88%B7%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1%E4%B8%8ECSS%E6%A0%B7%E5%BC%8F" name="%E7%94%A8%E6%88%B7%E7%95%8C%E9%9D%A2%E8%AE%BE%E8%AE%A1%E4%B8%8ECSS%E6%A0%B7%E5%BC%8F">用户界面设计与CSS样式</h2>

<h3 id="HTML%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1" name="HTML%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1">HTML结构设计</h3>

<p>首先，我们需要创建一个清晰的HTML结构作为计算器的骨架。主要组件包括：</p>

<p>html</p>

<pre>
<code>&lt;div class="calculator"&gt;
    &lt;!-- 模式切换按钮区域 --&gt;
    &lt;div class="mode-switch"&gt;
        &lt;button class="mode-btn active" id="standard-mode"&gt;标准&lt;/button&gt;
        &lt;button class="mode-btn" id="scientific-mode"&gt;科学&lt;/button&gt;
        &lt;button class="mode-btn" id="history-mode"&gt;历史&lt;/button&gt;
    &lt;/div&gt;
    
    &lt;!-- 历史记录面板 --&gt;
    &lt;div class="history-panel" id="history-panel"&gt;
        &lt;!-- 历史记录将在这里动态添加 --&gt;
    &lt;/div&gt;
    
    &lt;!-- 计算器显示屏 --&gt;
    &lt;div class="display"&gt;
        &lt;div class="history" id="history-display"&gt;&lt;/div&gt;
        &lt;div class="current" id="current-display"&gt;0&lt;/div&gt;
    &lt;/div&gt;
    
    &lt;!-- 科学计算按钮区域 --&gt;
    &lt;div class="scientific-buttons" id="scientific-buttons"&gt;
        &lt;!-- 各种科学计算按钮 --&gt;
    &lt;/div&gt;
    
    &lt;!-- 标准按钮区域 --&gt;
    &lt;div class="buttons"&gt;
        &lt;!-- 各种标准计算按钮 --&gt;
    &lt;/div&gt;
&lt;/div&gt;</code></pre>

<p>这种结构设计遵循了关注点分离的原则，将计算器的各个功能区域清晰地划分开来，便于后续的样式设计和功能实现。</p>

<h3 id="CSS%E6%A0%B7%E5%BC%8F%E8%AE%BE%E8%AE%A1" name="CSS%E6%A0%B7%E5%BC%8F%E8%AE%BE%E8%AE%A1">CSS样式设计</h3>

<p>在样式设计方面，我们采用了现代化的暗色主题，这不仅符合当前的设计趋势，也能有效减轻用户长时间使用时的视觉疲劳。</p>

<h4 id="%E6%95%B4%E4%BD%93%E5%B8%83%E5%B1%80%E4%B8%8E%E9%85%8D%E8%89%B2%E6%96%B9%E6%A1%88" name="%E6%95%B4%E4%BD%93%E5%B8%83%E5%B1%80%E4%B8%8E%E9%85%8D%E8%89%B2%E6%96%B9%E6%A1%88">整体布局与配色方案</h4>

<p>css</p>

<pre>
<code>body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}
.calculator {
    background-color: #333;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    width: 320px;
    padding: 20px;
}</code></pre>

<p>这部分CSS使用了Flexbox布局，将计算器居中显示在页面中，并添加了圆角和阴影效果，增强了视觉层次感。暗色的计算器背景与浅色的页面背景形成鲜明对比，使计算器在视觉上更加突出。</p>

<h4 id="%E6%98%BE%E7%A4%BA%E5%B1%8F%E8%AE%BE%E8%AE%A1" name="%E6%98%BE%E7%A4%BA%E5%B1%8F%E8%AE%BE%E8%AE%A1">显示屏设计</h4>

<p>css</p>

<pre>
<code>.display {
    background-color: #222;
    color: white;
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 5px;
    text-align: right;
    position: relative;
}
.history {
    color: #aaa;
    font-size: 14px;
    height: 18px;
    overflow: hidden;
    margin-bottom: 5px;
}
.current {
    font-size: 28px;
    height: 36px;
    overflow: hidden;
}</code></pre>

<p>计算器显示屏分为两个部分：上方较小的历史显示区域和下方较大的当前输入显示区域。右对齐的文本排列方式符合数字显示的传统习惯，使用户能够更直观地读取数值。设置固定高度并使用<code>overflow: hidden</code>处理可能的溢出情况，确保界面布局的稳定性。</p>

<h4 id="%E6%8C%89%E9%92%AE%E7%BD%91%E6%A0%BC%E5%B8%83%E5%B1%80" name="%E6%8C%89%E9%92%AE%E7%BD%91%E6%A0%BC%E5%B8%83%E5%B1%80">按钮网格布局</h4>

<p>css</p>

<pre>
<code>.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 10px;
}
.button {
    background-color: #4a4a4a;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 15px 0;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.2s;
}</code></pre>

<p>按钮区域使用CSS Grid布局，将按钮均匀地排列在4列网格中，简洁而有序。每个按钮都有圆角设计和悬停效果，提供良好的视觉反馈和交互体验。不同类型的按钮（数字、操作符、函数按钮）使用不同颜色区分，提高了界面的可读性和可用性。</p>

<h4 id="%E5%93%8D%E5%BA%94%E5%BC%8F%E8%AE%BE%E8%AE%A1%E8%80%83%E8%99%91" name="%E5%93%8D%E5%BA%94%E5%BC%8F%E8%AE%BE%E8%AE%A1%E8%80%83%E8%99%91">响应式设计考虑</h4>

<p>虽然这个计算器主要针对桌面场景设计，但通过使用相对单位和弹性布局，它在各种屏幕尺寸下都能保持良好的可用性。这体现了现代前端开发中&quot;移动优先&quot;和&quot;响应式设计&quot;的理念。</p>

<h2 id="%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0" name="%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0">核心功能实现</h2>

<p>计算器的核心功能通过JavaScript实现，主要包括用户输入处理、计算逻辑和显示更新三部分。</p>

<h3 id="%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86" name="%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86">状态管理</h3>

<p>首先，我们定义了几个关键变量来管理计算器的状态：</p>

<p>javascript</p>

<pre>
<code>let currentInput = '0';  // 当前输入
let historyDisplay = ''; // 历史计算表达式
let calculationHistory = []; // 计算历史记录
let lastResult = 0;      // 上一次的计算结果</code></pre>

<p>这些变量作为全局状态，贯穿整个计算器的功能实现，记录和控制计算器的运行状态。</p>

<h3 id="%E5%9F%BA%E6%9C%AC%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86" name="%E5%9F%BA%E6%9C%AC%E8%BE%93%E5%85%A5%E5%A4%84%E7%90%86">基本输入处理</h3>

<p>javascript</p>

<pre>
<code>function appendToDisplay(value) {
    if (currentInput === '0' &amp;&amp; value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    historyDisplay = '';
    updateDisplay();
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function toggleSign() {
    if (currentInput.startsWith('-')) {
        currentInput = currentInput.substring(1);
    } else {
        currentInput = '-' + currentInput;
    }
    updateDisplay();
}</code></pre>

<p>这组函数处理用户的基本输入操作，包括添加数字或操作符、清除输入、改变正负号等。每个操作都会立即更新显示，提供即时反馈。</p>

<h3 id="%E8%AE%A1%E7%AE%97%E9%80%BB%E8%BE%91" name="%E8%AE%A1%E7%AE%97%E9%80%BB%E8%BE%91">计算逻辑</h3>

<p>javascript</p>

<pre>
<code>function calculate() {
    try {
        // 替换显示用的乘号为JavaScript可执行的乘号
        let expression = currentInput.replace(/×/g, '*');
        
        // 处理百分比
        expression = expression.replace(/(\d+(\.\d+)?)\%/g, function(match, number) {
            return number + '/100';
        });
        
        historyDisplay = currentInput;
        let result = eval(expression);
        
        // 保存到历史记录
        calculationHistory.unshift({
            expression: currentInput,
            result: result
        });
        
        // 最多保存10条历史记录
        if (calculationHistory.length &gt; 10) {
            calculationHistory.pop();
        }
        
        lastResult = result;
        currentInput = result.toString();
        updateDisplay();
    } catch (error) {
        currentInput = '错误';
        updateDisplay();
        setTimeout(() =&gt; {
            currentInput = '0';
            updateDisplay();
        }, 1500);
    }
}</code></pre>

<p>计算函数是整个计算器的核心。它首先处理用户输入的表达式，包括替换特殊符号、处理百分比等，然后使用JavaScript的<code>eval()</code>函数执行计算。计算结果会被保存到历史记录中，并更新显示。</p>

<p>值得注意的是，这里使用了<code>try...catch</code>结构进行错误处理，确保计算出错时（如除以零）能够提供友好的错误提示，而不是导致整个应用崩溃。</p>

<h3 id="%E6%98%BE%E7%A4%BA%E6%9B%B4%E6%96%B0" name="%E6%98%BE%E7%A4%BA%E6%9B%B4%E6%96%B0">显示更新</h3>

<p>javascript</p>

<pre>
<code>function updateDisplay() {
    currentDisplayElement.textContent = currentInput;
    historyDisplayElement.textContent = historyDisplay;
}</code></pre>

<p>这个简单的函数负责将内部状态同步到用户界面，确保用户始终看到最新的计算状态。</p>

<h2 id="%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8D%A2%E4%B8%8E%E5%A4%9A%E5%8A%9F%E8%83%BD%E8%AE%BE%E8%AE%A1" name="%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8D%A2%E4%B8%8E%E5%A4%9A%E5%8A%9F%E8%83%BD%E8%AE%BE%E8%AE%A1">模式切换与多功能设计</h2>

<p>为了增强计算器的实用性，我们设计了多种模式，包括标准模式、科学模式和历史记录模式。每种模式提供不同的功能集，用户可以根据需要自由切换。</p>

<p>javascript</p>

<pre>
<code>document.getElementById('standard-mode').addEventListener('click', function() {
    setActiveMode('standard-mode');
    scientificButtonsElement.style.display = 'none';
    historyPanelElement.style.display = 'none';
});

document.getElementById('scientific-mode').addEventListener('click', function() {
    setActiveMode('scientific-mode');
    scientificButtonsElement.style.display = 'grid';
    historyPanelElement.style.display = 'none';
});

document.getElementById('history-mode').addEventListener('click', function() {
    setActiveMode('history-mode');
    scientificButtonsElement.style.display = 'none';
    historyPanelElement.style.display = 'block';
    showHistory();
});

function setActiveMode(activeId) {
    document.querySelectorAll('.mode-btn').forEach(btn =&gt; {
        btn.classList.remove('active');
    });
    document.getElementById(activeId).classList.add('active');
}</code></pre>

<p>这部分代码实现了模式切换功能。当用户点击不同的模式按钮时，计算器会相应地更新界面，显示或隐藏特定功能区域，并更新按钮的活跃状态。</p>

<p>这种模式切换设计遵循了&quot;渐进增强&quot;的原则 &mdash;&mdash; 基本功能始终可用，而高级功能只在用户需要时才显示，避免了界面过于复杂和混乱。</p>

<h2 id="%E7%A7%91%E5%AD%A6%E8%AE%A1%E7%AE%97%E5%8A%9F%E8%83%BD%E8%AF%A6%E8%A7%A3" name="%E7%A7%91%E5%AD%A6%E8%AE%A1%E7%AE%97%E5%8A%9F%E8%83%BD%E8%AF%A6%E8%A7%A3">科学计算功能详解</h2>

<p>科学模式下，计算器提供了丰富的高级数学函数，包括三角函数、对数、幂运算等。</p>

<p>javascript</p>

<pre>
<code>function addFunction(func) {
    switch (func) {
        case 'sin':
            try {
                let value = parseFloat(currentInput);
                historyDisplay = `sin(${value})`;
                currentInput = Math.sin(value * Math.PI / 180).toString(); // 角度转弧度
            } catch {
                currentInput = '错误';
            }
            break;
        case 'cos':
            try {
                let value = parseFloat(currentInput);
                historyDisplay = `cos(${value})`;
                currentInput = Math.cos(value * Math.PI / 180).toString();
            } catch {
                currentInput = '错误';
            }
            break;
        // 其他函数实现...
    }
    updateDisplay();
}

function power(n) {
    try {
        let value = parseFloat(currentInput);
        historyDisplay = `${value}^${n}`;
        currentInput = Math.pow(value, n).toString();
    } catch {
        currentInput = '错误';
    }
    updateDisplay();
}

function factorial() {
    try {
        let num = parseInt(currentInput);
        if (num &lt; 0) throw new Error("Cannot calculate factorial of negative number");
        historyDisplay = `${num}!`;
        let result = 1;
        for (let i = 2; i &lt;= num; i++) {
            result *= i;
        }
        currentInput = result.toString();
    } catch {
        currentInput = '错误';
    }
    updateDisplay();
}</code></pre>

<p>每个科学计算函数都遵循类似的模式：获取当前输入值、执行相应的数学运算、更新历史显示和当前结果、处理可能的错误。特别值得一提的是，三角函数的实现考虑了角度和弧度的转换，使计算结果更符合一般用户的预期。</p>

<p>阶乘函数的实现展示了如何处理潜在的性能问题 &mdash;&mdash; 使用迭代而非递归，避免了大数阶乘可能导致的栈溢出。</p>

<h2 id="%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0" name="%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0">历史记录功能实现</h2>

<p>历史记录功能允许用户查看过去的计算并重用结果，提升了计算器的实用性。</p>

<p>javascript</p>

<pre>
<code>function showHistory() {
    historyPanelElement.innerHTML = '';
    if (calculationHistory.length === 0) {
        historyPanelElement.innerHTML = '&lt;div class="history-item"&gt;暂无计算历史&lt;/div&gt;';
        return;
    }
    
    calculationHistory.forEach(item =&gt; {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `${item.expression} = ${item.result}`;
        historyItem.addEventListener('click', function() {
            currentInput = item.result.toString();
            updateDisplay();
            setActiveMode('standard-mode');
            historyPanelElement.style.display = 'none';
        });
        historyPanelElement.appendChild(historyItem);
    });
}</code></pre>

<p>当用户切换到历史记录模式时，<code>showHistory</code>函数会动态生成历史条目并添加到历史面板中。每个历史条目都是可点击的，点击后会将该结果设为当前输入，并自动切回标准模式，方便用户继续计算。</p>

<p>这种设计既展示了DOM操作的基本技巧（创建元素、添加事件监听器、更新内容），又体现了良好的用户体验考虑 &mdash;&mdash; 帮助用户无缝地从查看历史记录到继续计算。</p>

<h2 id="%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86%E4%B8%8E%E7%94%A8%E6%88%B7%E4%BD%93%E9%AA%8C%E4%BC%98%E5%8C%96" name="%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86%E4%B8%8E%E7%94%A8%E6%88%B7%E4%BD%93%E9%AA%8C%E4%BC%98%E5%8C%96">错误处理与用户体验优化</h2>

<p>良好的错误处理机制是提升应用可靠性和用户体验的关键。在我们的计算器中，几乎每个可能出错的操作都有对应的错误捕获和处理逻辑。</p>

<p>javascript</p>

<pre>
<code>try {
    // 计算逻辑
} catch (error) {
    currentInput = '错误';
    updateDisplay();
    setTimeout(() =&gt; {
        currentInput = '0';
        updateDisplay();
    }, 1500);
}</code></pre>

<p>当发生错误时（如无效表达式、除以零等），计算器会显示&quot;错误&quot;提示，而不是崩溃或显示技术性错误信息。更贴心的是，错误提示会在短暂显示后自动清除，计算器恢复到初始状态，用户可以继续新的计算，无需手动重置。</p>

<p>此外，我们还在多个地方加入了视觉反馈和状态提示：</p>

<ol>
	<li><strong>按钮悬停效果</strong>：提供即时的视觉反馈</li>
	<li><strong>模式切换高亮</strong>：清晰指示当前处于哪种模式</li>
	<li><strong>历史表达式显示</strong>：帮助用户跟踪计算过程</li>
	<li><strong>错误状态自动恢复</strong>：减少用户操作步骤</li>
</ol>

<p>这些细节虽小，但累积起来显著提升了计算器的可用性和愉悦度。</p>

<h2 id="%E9%A1%B9%E7%9B%AE%E6%80%BB%E7%BB%93%E4%B8%8E%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF" name="%E9%A1%B9%E7%9B%AE%E6%80%BB%E7%BB%93%E4%B8%8E%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF">项目总结与扩展思路</h2>

<p>通过这个计算器项目，我们展示了如何使用纯前端技术构建一个功能完整、用户友好的web应用。从项目中，我们可以总结出几个关键的前端开发实践：</p>

<ol>
	<li><strong>关注点分离</strong>：HTML负责结构、CSS处理样式、JavaScript实现交互逻辑，各司其职</li>
	<li><strong>渐进增强</strong>：从基础功能开始，逐步添加高级特性，确保核心功能的可靠性</li>
	<li><strong>用户体验优先</strong>：在每个环节都考虑用户感受，从视觉设计到错误处理</li>
	<li><strong>模块化思考</strong>：将复杂功能分解为小块，独立实现和测试</li>
	<li><strong>健壮性设计</strong>：预见可能的错误情况，并提供优雅的处理机制</li>
</ol>

<p>当然，这个计算器项目还有很多可以扩展和改进的空间：</p>

<h3 id="%E5%8A%9F%E8%83%BD%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF" name="%E5%8A%9F%E8%83%BD%E6%89%A9%E5%B1%95%E6%80%9D%E8%B7%AF">功能扩展思路</h3>

<ol>
	<li><strong>更多科学计算功能</strong>：添加更多高级数学函数，如双曲函数、统计函数等</li>
	<li><strong>内存功能</strong>：实现M+, M-, MR等传统计算器内存功能</li>
	<li><strong>单位转换</strong>：增加长度、重量、温度等单位转换功能</li>
	<li><strong>编程计算器模式</strong>：添加二进制、八进制、十六进制计算和位运算</li>
	<li><strong>公式保存功能</strong>：允许用户保存和命名常用公式</li>
</ol>

<h3 id="%E6%8A%80%E6%9C%AF%E6%94%B9%E8%BF%9B%E6%96%B9%E5%90%91" name="%E6%8A%80%E6%9C%AF%E6%94%B9%E8%BF%9B%E6%96%B9%E5%90%91">技术改进方向</h3>

<ol>
	<li><strong>重构为组件架构</strong>：使用现代前端框架（如React、Vue）重构项目，提高代码组织性和可维护性</li>
	<li><strong>引入测试框架</strong>：添加单元测试和集成测试，确保功能稳定性</li>
	<li><strong>本地存储集成</strong>：使用localStorage保存用户设置和计算历史</li>
	<li><strong>键盘支持</strong>：添加键盘事件监听，支持键盘输入</li>
	<li><strong>更精确的数学计算</strong>：使用专业数学库替代JavaScript原生计算，解决浮点数精度问题</li>
</ol>

<h3 id="%E8%AE%BE%E8%AE%A1%E4%BC%98%E5%8C%96%E6%96%B9%E5%90%91" name="%E8%AE%BE%E8%AE%A1%E4%BC%98%E5%8C%96%E6%96%B9%E5%90%91">设计优化方向</h3>

<ol>
	<li><strong>自定义主题</strong>：允许用户选择明暗主题或自定义颜色</li>
	<li><strong>动画效果</strong>：添加适度的动画效果，提升视觉愉悦度</li>
	<li><strong>辅助功能优化</strong>：提高无障碍支持，如屏幕阅读器兼容性</li>
	<li><strong>响应式设计增强</strong>：优化在移动设备上的使用体验</li>
</ol>

<h2 id="%E7%BB%93%E8%AF%AD" name="%E7%BB%93%E8%AF%AD">结语</h2>

<p>构建这个计算器应用不仅展示了前端技术的基本应用，更体现了良好软件设计的普遍原则 &mdash;&mdash; 功能完整、易于使用、健壮可靠。作为一个学习项目，它涵盖了从HTML结构到JavaScript逻辑的多个方面，是前端开发新手的理想练习项目。</p>

<p>同时，这个项目也很容易扩展和定制。你可以根据自己的需求和创意，添加新功能或改进现有设计，打造属于自己的计算器应用。在这个过程中，你不仅能巩固前端开发基础知识，还能培养解决实际问题的能力。</p>

<p>希望这篇博客对你有所启发，激发你探索和创造的热情。编程的魅力不仅在于实现功能，更在于通过代码将创意变为现实，创造出既实用又优雅的解决方案。</p>
