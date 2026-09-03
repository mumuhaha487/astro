---
title: 把c++的函数导出为dll文件
published: 2023-09-02
tags: [c++,开发语言,python,爬虫,dll]
category: c/c++
image: /image/0ffc0fed90585de947129324deb84529.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E4%BB%80%E4%B9%88%E6%98%AFdll%E6%96%87%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E4%BB%80%E4%B9%88%E6%98%AFdll%E6%96%87%E4%BB%B6">什么是dll文件</a></p>

<p id="%E6%8A%8Ac%2B%2B%E5%87%BD%E6%95%B0%E5%8F%98%E4%B8%BAdll%E6%9C%89%E4%BB%80%E4%B9%88%E5%A5%BD%E5%A4%84-toc" style="margin-left:0px;"><a href="#%E6%8A%8Ac%2B%2B%E5%87%BD%E6%95%B0%E5%8F%98%E4%B8%BAdll%E6%9C%89%E4%BB%80%E4%B9%88%E5%A5%BD%E5%A4%84">把c++函数变为dll有什么好处</a></p>

<p id="%E5%BC%80%E5%A7%8B%E6%95%99%E7%A8%8B-toc" style="margin-left:0px;"><a href="#%E5%BC%80%E5%A7%8B%E6%95%99%E7%A8%8B">开始教程</a></p>

<p id="%E6%89%93%E5%BC%80Visual%20Studio%202022%E5%88%9B%E5%BB%BA-toc" style="margin-left:40px;"><a href="#%E6%89%93%E5%BC%80Visual%20Studio%202022%E5%88%9B%E5%BB%BA">打开Visual Studio 2022创建</a></p>

<p id="%C2%A0%E8%B0%83%E6%95%B4%E7%BC%96%E8%AF%91%E5%99%A8%E8%AE%BE%E7%BD%AE-toc" style="margin-left:40px;"><a href="#%C2%A0%E8%B0%83%E6%95%B4%E7%BC%96%E8%AF%91%E5%99%A8%E8%AE%BE%E7%BD%AE"> 调整编译器设置</a></p>

<p id="%E5%88%9B%E5%BB%BA%E5%A4%B4%E6%96%87%E4%BB%B6-toc" style="margin-left:40px;"><a href="#%E5%88%9B%E5%BB%BA%E5%A4%B4%E6%96%87%E4%BB%B6">创建头文件</a></p>

<p id="DLL1.h-toc" style="margin-left:80px;"><a href="#DLL1.h">DLL1.h</a></p>

<p id="%E5%88%9B%E5%BB%BA%E6%BA%90%E6%96%87%E4%BB%B6%E7%BC%96%E8%BE%91%E5%87%BD%E6%95%B0%E5%86%85%E5%AE%B9-toc" style="margin-left:40px;"><a href="#%E5%88%9B%E5%BB%BA%E6%BA%90%E6%96%87%E4%BB%B6%E7%BC%96%E8%BE%91%E5%87%BD%E6%95%B0%E5%86%85%E5%AE%B9">创建源文件编辑函数内容</a></p>

<p id="DLL1.cpp-toc" style="margin-left:80px;"><a href="#DLL1.cpp">DLL1.cpp</a></p>

<p id="%E7%BC%96%E8%AF%91%E6%88%90dll%E6%96%87%E4%BB%B6-toc" style="margin-left:0px;"><a href="#%E7%BC%96%E8%AF%91%E6%88%90dll%E6%96%87%E4%BB%B6">编译成dll文件</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E4%BB%80%E4%B9%88%E6%98%AFdll%E6%96%87%E4%BB%B6">什么是dll文件</h1>

<p>DLL（Dynamic Link Library，动态链接库）是一种包含可被多个程序共享的代码和数据的文件格式。它可以被动态链接到程序中，在程序运行时提供所需的功能和服务。DLL 文件通常包含函数、类、变量和资源等，可以被其他程序调用和使用。使用 DLL 可以实现代码的复用、模块化开发和提高程序性能等好处。</p>

<h1 id="%E6%8A%8Ac%2B%2B%E5%87%BD%E6%95%B0%E5%8F%98%E4%B8%BAdll%E6%9C%89%E4%BB%80%E4%B9%88%E5%A5%BD%E5%A4%84">把c++函数变为dll有什么好处</h1>

<ol><li>
	<p><strong>代码复用</strong>：通过将函数导出为 DLL，可以将函数封装在独立的库中，供其他程序重复使用，避免重复实现相同的功能，提高代码的复用性。</p>
	</li>
	<li>
	<p><strong>模块化开发</strong>：将函数导出为 DLL 可以帮助实现模块化开发，即将程序划分为多个模块，每个模块对应一个或多个 DLL，方便团队协作，每个人负责不同的模块。</p>
	</li>
	<li>
	<p><strong>提高性能</strong>：将常用的函数导出为 DLL，可以提高程序的运行效率。由于 DLL 是被动态链接的，它们可以被多个程序共享，减少内存使用。</p>
	</li>
	<li>
	<p><strong>保护知识产权</strong>：通过将核心代码封装在 DLL 中，可以保护知识产权，只将 DLL 提供给需要的人使用，不需要对源代码进行公开。</p>
	</li>
</ol><p>并且在python中你可以调用你自己编写的dll文件从而既可以最大的加快代码的运行速度（因为是用C++写的快了不止一点），又能达到你想要的效果。</p>

<h1 id="%E5%BC%80%E5%A7%8B%E6%95%99%E7%A8%8B">开始教程</h1>

<p><img alt="" height="296" src="/image/8e9773157f08c6c1bbc9cce2093a20c6.gif" width="362" /></p>

<h2 id="%E6%89%93%E5%BC%80Visual%20Studio%202022%E5%88%9B%E5%BB%BA">打开Visual Studio 2022创建</h2>

<p>打开Visual Studio 2022选择创建新项目</p>

<p>搜索dll或者动态链接库</p>

<p><img alt="" height="844" src="/image/0ffc0fed90585de947129324deb84529.png" width="1200" /></p>

<p>我选择的是第一个</p>

<p>进入后出现了</p>

<p>除了划红线的</p>

<p>其他的打开会自己创建</p>

<p><img alt="" height="922" src="/image/7a128bfd93bd47c8ecff7739389318e0.png" width="1200" /></p>

<h2 id="%C2%A0%E8%B0%83%E6%95%B4%E7%BC%96%E8%AF%91%E5%99%A8%E8%AE%BE%E7%BD%AE"> 调整编译器设置</h2>

<p>进入调试中的调试属性</p>

<p><img alt="" height="922" src="/image/ffa003ee68dfbd100ffe37c66e7733be.png" width="1200" /></p>

<p> 确保红框一致</p>

<p>（如果是64位就最好是64位）</p>

<p><img alt="" height="684" src="/image/5cfaeee2391ce577a24229088eca96f3.png" width="984" /></p>

<p></p>

<h2 id="%E5%88%9B%E5%BB%BA%E5%A4%B4%E6%96%87%E4%BB%B6">创建头文件</h2>

<p>头文件结构为</p>

<h3 id="DLL1.h">DLL1.h</h3>

<pre>
<code class="language-cpp">#pragma once

#ifndef _DLL1_H
#define _DLL1_H

#define DLL1_API extern "C"  _declspec(dllexport)

DLL1_API double Add_sum(int n);

#endif // DEBUG




</code></pre>

<p>其中开头的</p>

<pre>
<code class="language-cpp">#pragma once

#ifndef _DLL1_H
#define _DLL1_H</code></pre>

<p>是宏定义为头文件必须的</p>

<pre>
<code class="language-cpp">#define DLL1_API extern "C"  _declspec(dllexport)</code></pre>

<p>这是告诉编译器是以c/c++语言编辑的</p>

<p>接下来就是定义函数的格式，在头文件中只是声明不进行编辑</p>

<pre>
<code class="language-cpp">DLL1_API double Add_sum(int n);
</code></pre>

<p>最后再加一句</p>

<pre>
<code class="language-cpp">#endif // DEBUG</code></pre>

<h2 id="%E5%88%9B%E5%BB%BA%E6%BA%90%E6%96%87%E4%BB%B6%E7%BC%96%E8%BE%91%E5%87%BD%E6%95%B0%E5%86%85%E5%AE%B9">创建源文件编辑函数内容</h2>

<p>函数为计算2的n次方......这里不用在意函数内容</p>

<h3 id="DLL1.cpp">DLL1.cpp</h3>

<pre>
<code class="language-cpp">#include "DLL1.h"
#include "iostream"
using namespace std;
// 传入参数位数字，无返回,输出num的平方
DLL1_API double Add_sum(int n)
{
	if (n == 0)
		return 1.0;
	int max = 1;
	int i = 2;
	double j = 1 / 2;
	while (n != 0)
	{
		int sum_1 = n % 2;
		if (n &gt; 0)
		{
			if (n == 1)
				max *= i;
			i = i * i;
			n = n / 2;
		}
		else
		{
			if (n == 1)
				max *= i;
			j = j * j;
			n = n / 2;
		}
	}
	return max;
}

</code></pre>

<h1 id="%E7%BC%96%E8%AF%91%E6%88%90dll%E6%96%87%E4%BB%B6">编译成dll文件</h1>

<p>点击重新生成</p>

<p>这样如果没报错得到话就会生成一个dll文件</p>

<p><img alt="" height="922" src="/image/4f28f587e5ea0dc6ad50fc897a30a7c1.png" width="1200" /></p>

<p> 在当前目录下</p>

<p><img alt="" height="922" src="/image/ac5483b3cdc1a863913fd93c68d910f6.png" width="1200" /></p>

<p> 做这一期的原因是python代码有时运行的速度很慢，但是python的包使用很便捷不想抛弃，所以用c语言优化一部分代码来实现加快程序运行速度</p>
