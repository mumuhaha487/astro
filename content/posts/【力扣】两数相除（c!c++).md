---
title: 【力扣】两数相除（c/c++)
published: 2023-09-03
tags: [leetcode,算法,职场和发展,c++,python]
category: c/c++
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="%E9%A2%98%E7%9B%AE-toc" style="margin-left:0px;"><a href="#%E9%A2%98%E7%9B%AE">题目</a></p>

<p id="%E6%B3%A8%E6%84%8F%EF%BC%9A-toc" style="margin-left:40px;"><a href="#%E6%B3%A8%E6%84%8F%EF%BC%9A">注意：</a></p>

<p id="%E7%A4%BA%E4%BE%8B%C2%A01%3A-toc" style="margin-left:40px;"><a href="#%E7%A4%BA%E4%BE%8B%C2%A01%3A">示例 1:</a></p>

<p id="%E7%A4%BA%E4%BE%8B%C2%A02%3A-toc" style="margin-left:40px;"><a href="#%E7%A4%BA%E4%BE%8B%C2%A02%3A">示例 2:</a></p>

<p id="%E6%8F%90%E7%A4%BA%EF%BC%9A-toc" style="margin-left:40px;"><a href="#%E6%8F%90%E7%A4%BA%EF%BC%9A">提示：</a></p>

<p id="%E9%A2%98%E7%9B%AE%E8%A7%A3%E6%9E%90-toc" style="margin-left:0px;"><a href="#%E9%A2%98%E7%9B%AE%E8%A7%A3%E6%9E%90">题目解析</a></p>

<p id="%E9%A2%98%E7%9B%AE%E6%80%9D%E8%B7%AF-toc" style="margin-left:0px;"><a href="#%E9%A2%98%E7%9B%AE%E6%80%9D%E8%B7%AF">题目思路</a></p>

<p id="%E4%BB%A3%E7%A0%81%E6%80%9D%E8%B7%AF-toc" style="margin-left:0px;"><a href="#%E4%BB%A3%E7%A0%81%E6%80%9D%E8%B7%AF">代码思路</a></p>

<p id="%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86-toc" style="margin-left:40px;"><a href="#%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86">数据处理</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:80px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E5%87%8F%E6%B3%95%E5%87%BD%E6%95%B0-toc" style="margin-left:40px;"><a href="#%E5%87%8F%E6%B3%95%E5%87%BD%E6%95%B0">减法函数</a></p>

<p id="%E7%AC%AC%E4%B8%80%E6%AC%A1%E4%BD%BF%E7%94%A8%E7%9A%84%E5%87%BD%E6%95%B0-toc" style="margin-left:80px;"><a href="#%E7%AC%AC%E4%B8%80%E6%AC%A1%E4%BD%BF%E7%94%A8%E7%9A%84%E5%87%BD%E6%95%B0">第一次使用的函数</a></p>

<p id="%E9%97%AE%E9%A2%98-toc" style="margin-left:80px;"><a href="#%E9%97%AE%E9%A2%98">问题</a></p>

<p id="%E7%AC%AC%E4%BA%8C%E6%AC%A1%E6%94%B9%E8%89%AF%E5%90%8E%E7%9A%84%E4%BB%A3%E7%A0%81-toc" style="margin-left:40px;"><a href="#%E7%AC%AC%E4%BA%8C%E6%AC%A1%E6%94%B9%E8%89%AF%E5%90%8E%E7%9A%84%E4%BB%A3%E7%A0%81">第二次改良后的代码</a></p>

<p id="%E5%A4%84%E7%90%86i%E7%9A%84%E5%80%BC%E5%B9%B6%E4%B8%94%E8%BF%94%E5%9B%9E-toc" style="margin-left:40px;"><a href="#%E5%A4%84%E7%90%86i%E7%9A%84%E5%80%BC%E5%B9%B6%E4%B8%94%E8%BF%94%E5%9B%9E">处理i的值并且返回</a></p>

<p id="%E6%80%BB%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E4%BB%A3%E7%A0%81">总代码</a></p>

<p id="%E5%8A%9B%E6%89%A3%E7%9A%84%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E5%8A%9B%E6%89%A3%E7%9A%84%E4%BB%A3%E7%A0%81">力扣的代码</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:0px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E9%A2%98%E7%9B%AE">题目</h1>

<blockquote>
<p>给你两个整数，被除数 <code>dividend</code> 和除数 <code>divisor</code>。将两数相除，要求 <strong>不使用</strong> 乘法、除法和取余运算。</p>

<p>整数除法应该向零截断，也就是截去（<code>truncate</code>）其小数部分。例如，<code>8.345</code> 将被截断为 <code>8</code> ，<code>-2.7335</code> 将被截断至 <code>-2</code> 。</p>

<p>返回被除数 <code>dividend</code> 除以除数 <code>divisor</code> 得到的 <strong>商</strong> 。</p>
</blockquote>

<h2 id="%E6%B3%A8%E6%84%8F%EF%BC%9A"><strong>注意：</strong></h2>

<p>假设我们的环境只能存储 <strong>32 位</strong> 有符号整数，其数值范围是 <code>[−231,  231 − 1]</code> 。本题中，如果商 <strong>严格大于</strong> <code>231 − 1</code> ，则返回 <code>231 − 1</code> ；如果商 <strong>严格小于</strong> <code>-231</code> ，则返回 <code>-231</code> 。</p>

<p></p>

<h2 id="%E7%A4%BA%E4%BE%8B%C2%A01%3A"><strong>示例 1:</strong></h2>

<pre>
<strong>输入:</strong> dividend = 10, divisor = 3
<strong>输出:</strong> 3
<strong>解释: </strong>10/3 = 3.33333.. ，向零截断后得到 3 。</pre>

<h2 id="%E7%A4%BA%E4%BE%8B%C2%A02%3A"><strong>示例 2:</strong></h2>

<pre>
<strong>输入:</strong> dividend = 7, divisor = -3
<strong>输出:</strong> -2
<strong>解释:</strong> 7/-3 = -2.33333.. ，向零截断后得到 -2 。</pre>

<h2 id="%E6%8F%90%E7%A4%BA%EF%BC%9A"><strong>提示：</strong></h2>

<ul><li><code>-231 &lt;= dividend, divisor &lt;= 231 - 1</code></li>
	<li><code>divisor != 0</code>
	<pre>
<code class="language-cpp">	if (dividend == 0)return 0;
	if (divisor == 1)return dividend;
	if (divisor == -1)
	{
		if (dividend &gt; INT_MIN) return -dividend;// 只要不是最小的那个整数，都是直接返回相反数就好啦
		return INT_MAX;// 是最小的那个整数，都是直接返回最大值
	}</code></pre>

	<p></p>
	</li>
</ul><h1 id="%E9%A2%98%E7%9B%AE%E8%A7%A3%E6%9E%90">题目解析</h1>

<p>这是一个让你不用除法来实现除法的题目</p>

<p>很奇怪，代码中不能直接或者间接的用除法，乘法，以及求余</p>

<p></p>

<h1 id="%E9%A2%98%E7%9B%AE%E6%80%9D%E8%B7%AF">题目思路</h1>

<p>由于还可以用减法以及加法</p>

<p>这时候可以想到小学的知识</p>

<p>除法的本质就是看在被除数中有几个除数</p>

<p>我们可以用减法来依次减去就可以了</p>

<h1 id="%E4%BB%A3%E7%A0%81%E6%80%9D%E8%B7%AF">代码思路</h1>

<p>越界的情况</p>

<p>首先我们要判断给出的值越界的情况</p>

<pre>
<code class="language-cpp">	if (dividend == 0)return 0;
	if (divisor == 1)return dividend;
	if (divisor == -1)
	{
		if (dividend &gt; INT_MIN) return -dividend;// 只要不是最小的那个整数，都是直接返回相反数就好啦
		return INT_MAX;// 是最小的那个整数，都是直接返回最大值
	}</code></pre>

<h2 id="%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86">数据处理</h2>

<p>之后我们判断除数与被除数之间的的符号关系并且记录下来</p>

<p>并且为了方便结算全部取绝对值</p>

<pre>
<code class="language-cpp">	long long i = 0;
	//判断是否异号
	long long sum_1 = (long long)dividend * divisor;
	//取绝对值
	if (dividend &lt; 0)
		dividend = -dividend;
	if (divisor &lt; 0)
		divisor = -divisor;</code></pre>

<h3 id="%E6%B3%A8%E6%84%8F">注意</h3>

<p>这里的long long的数据类型是为了防止给出的数据相乘后越界，并且把其中“i”变量的值记录下来用于返回</p>

<h2 id="%E5%87%8F%E6%B3%95%E5%87%BD%E6%95%B0">减法函数</h2>

<h3 id="%E7%AC%AC%E4%B8%80%E6%AC%A1%E4%BD%BF%E7%94%A8%E7%9A%84%E5%87%BD%E6%95%B0">第一次使用的函数</h3>

<p>原来是用这个函数的</p>

<pre>
<code class="language-cpp">	while (dividend &gt;= divisor)
	{
        dividend=dividend-divisor;
        i++
	}</code></pre>

<h3 id="%E9%97%AE%E9%A2%98">问题</h3>

<p>运行时间可能会慢因为除数是21亿并且除数是2的话要运行10亿次</p>

<h2 id="%E7%AC%AC%E4%BA%8C%E6%AC%A1%E6%94%B9%E8%89%AF%E5%90%8E%E7%9A%84%E4%BB%A3%E7%A0%81">第二次改良后的代码</h2>

<pre>
<code class="language-cpp">	while (dividend &gt;= divisor)
	{
		long long j = 1;
		long long sum_3 = divisor;
		while (dividend&gt; sum_3 + sum_3)
		{
			sum_3 = sum_3 + sum_3;
			j = j + j;
		}
		dividend = dividend - sum_3;
		i = i + j;
	}</code></pre>

<p>这个实现方法就是</p>

<p>如果是144除以2第一步执行的是144-64第二步为80-64第三步为16-16</p>

<p>这样运行步骤会大大降低</p>

<h2 id="%E5%A4%84%E7%90%86i%E7%9A%84%E5%80%BC%E5%B9%B6%E4%B8%94%E8%BF%94%E5%9B%9E">处理i的值并且返回</h2>

<pre>
<code class="language-cpp">	if (sum_1 &lt; 0)
		i = -i;
	return i;</code></pre>

<h1 id="%E6%80%BB%E4%BB%A3%E7%A0%81">总代码</h1>

<p>可以直接运行的代码</p>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
using namespace std;
int divide(long long dividend, long long divisor)
{
	if (dividend == 0)return 0;
	if (divisor == 1)return dividend;
	if (divisor == -1)
	{
		if (dividend &gt; INT_MIN) return -dividend;// 只要不是最小的那个整数，都是直接返回相反数就好啦
		return INT_MAX;// 是最小的那个整数，都是直接返回最大值
	}
	long long i = 0;
	//判断是否异号
	long long sum_1 = (long long)dividend * divisor;
	//取绝对值
	if (dividend &lt; 0)
		dividend = -dividend;
	if (divisor &lt; 0)
		divisor = -divisor;
	while (dividend &gt;= divisor)
	{
		long long j = 1;
		long long sum_3 = divisor;
		while (dividend&gt; sum_3 + sum_3)
		{
			sum_3 = sum_3 + sum_3;
			j = j + j;
		}
		dividend = dividend - sum_3;
		i = i + j;
	}
	if (sum_1 &lt; 0)
		i = -i;
	return i;
}
int main()
{
	//可改传递的数据
	int a = divide(-2147483648, -3);
	cout &lt;&lt; a &lt;&lt; endl;
	return 0;
}</code></pre>

<h1 id="%E5%8A%9B%E6%89%A3%E7%9A%84%E4%BB%A3%E7%A0%81">力扣的代码</h1>

<p>力扣提交的代码</p>

<pre>
<code class="language-cpp">class Solution {
public:
int divide(long long dividend, long long divisor)
{
	if (dividend == 0)return 0;
	if (divisor == 1)return dividend;
	if (divisor == -1)
	{
		if (dividend &gt; INT_MIN) return -dividend;// 只要不是最小的那个整数，都是直接返回相反数就好啦
		return INT_MAX;// 是最小的那个整数，都是直接返回最大值
	}
	long long i = 0;
	//判断是否异号
	long long sum_1 = (long long)dividend * divisor;
	//取绝对值
	if (dividend &lt; 0)
		dividend = -dividend;
	if (divisor &lt; 0)
		divisor = -divisor;
	while (dividend &gt;= divisor)
	{
		long long j = 1;
		long long sum_3 = divisor;
		while (dividend&gt; sum_3 + sum_3)
		{
			sum_3 = sum_3 + sum_3;
			j = j + j;
		}
		dividend = dividend - sum_3;
		i = i + j;
	}
	if (sum_1 &lt; 0)
		i = -i;
	return i;
}
};</code></pre>

<h1>注意</h1>

<p>代码不难，注意越界的数据越界的问题</p>
