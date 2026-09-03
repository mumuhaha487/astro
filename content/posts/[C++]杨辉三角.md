---
title: C++杨辉三角
published: 2023-09-07
tags: [c++,开发语言]
category: c/c++
image: /image/2b8f5150a65462e37f297e64648b4db3.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E9%A2%98%E7%9B%AE-toc" style="margin-left:0px;"><a href="#%E9%A2%98%E7%9B%AE">题目</a></p>

<p id="%E8%A7%A3%E9%A2%98%E6%80%9D%E8%B7%AF-toc" style="margin-left:0px;"><a href="#%E8%A7%A3%E9%A2%98%E6%80%9D%E8%B7%AF">解题思路</a></p>

<p id="%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0-toc" style="margin-left:0px;"><a href="#%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0">代码实现</a></p>

<p id="%E8%8E%B7%E5%8F%96%E6%95%B0%E5%AD%97-toc" style="margin-left:40px;"><a href="#%E8%8E%B7%E5%8F%96%E6%95%B0%E5%AD%97">获取数字</a></p>

<p id="%E6%89%93%E5%8D%B0%E5%87%BD%E6%95%B0-toc" style="margin-left:40px;"><a href="#%E6%89%93%E5%8D%B0%E5%87%BD%E6%95%B0">打印函数</a></p>

<p id="%E4%B8%BB%E5%87%BD%E6%95%B0-toc" style="margin-left:40px;"><a href="#%E4%B8%BB%E5%87%BD%E6%95%B0">主函数</a></p>

<p id="%E5%85%A8%E9%83%A8%E4%BB%A3%E7%A0%81-toc" style="margin-left:0px;"><a href="#%E5%85%A8%E9%83%A8%E4%BB%A3%E7%A0%81">全部代码</a></p>

<p id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C-toc" style="margin-left:0px;"><a href="#%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C">运行结果</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E9%A2%98%E7%9B%AE">题目</h1>

<p>给定一个非负整数numRows ，生成「杨辉三角」的前numRows行。<br />
在「杨辉三角」中，每个数是它左上方和右上方的数的和。<br /><img alt="" height="256" src="/image/2b8f5150a65462e37f297e64648b4db3.png" width="289" /></p>

<h1 id="%E8%A7%A3%E9%A2%98%E6%80%9D%E8%B7%AF">解题思路</h1>

<p>第k列的第i个数字的值第k-1列的(i-1)和i的和</p>

<p>由于数组是动态变化的没有固定大小</p>

<p>运用到容器(vector)</p>

<p>u1s1！</p>

<p>python会比c好打</p>

<h1 id="%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0">代码实现</h1>

<h2 id="%E8%8E%B7%E5%8F%96%E6%95%B0%E5%AD%97">获取数字</h2>

<p>获取数并且把它存储到容器中</p>

<pre>
<code class="language-cpp">void GetResult(int a)
{
	vector &lt;vector&lt;int&gt;&gt; sums;
	int b[1] = { 1 };
	int c[2] = { 1,1 };
	int d[3] = { 1,2,1 };
	vector &lt;int&gt; a_1(b,b+1);
	vector &lt;int&gt; a_2(c,c+2);
	vector &lt;int&gt; a_3(d,d+3);
	sums.push_back(a_1);
	sums.push_back(a_2);
	sums.push_back(a_3);
	for (int i = 3; i &lt;= a - 1; i++)
	{
		vector &lt;int&gt; sum ;
		for (int j = 0; j &lt;= i; j++)
		{
			if (j == 0 or j==i)
			{
				sum.push_back(1);
				continue;
			}
			int sum_1 = 0;
			sum_1 = sums[i - 1][j-1] + sums[i - 1][j];
			sum.push_back(sum_1);
		}
		sums.push_back(sum);
	}
	printResult(sums);
}</code></pre>

<p>这里是容器里面又装载了一个容器</p>

<p>实现创建一个可以动态变化大小的二维数组</p>

<p>第k列的第i个数字的值第k-1列的(i-1)和i的和</p>

<p>所以可以利用上一行的结果来计算数字</p>

<p>并且第1，2，3行要单独考虑</p>

<h2 id="%E6%89%93%E5%8D%B0%E5%87%BD%E6%95%B0">打印函数</h2>

<p>不得不说要按要求打印还要自己写一个函数</p>

<p>因为c++不可以直接打印整个数组</p>

<p>所以要新建一个函数</p>

<pre>
<code class="language-cpp">void printResult(vector &lt;vector&lt;int&gt;&gt; sums)
{
	cout &lt;&lt; "[";
	for(int i=0;i&lt;=sums.size()-1;i++)
	{
		if (i != 0)
			cout &lt;&lt; ",";
		cout &lt;&lt; "[";
		for (int j = 0; j &lt;= sums[i].size()-1; j++)
		{
			if (i != 0)
				cout &lt;&lt; ",";
			cout &lt;&lt; sums[i][j] ;
		}
		cout &lt;&lt; "]";
	}
	cout &lt;&lt; "]";
}</code></pre>

<h2 id="%E4%B8%BB%E5%87%BD%E6%95%B0">主函数</h2>

<p>主函数为</p>

<pre>
<code class="language-cpp">int main()
{
	int a;
	cin &gt;&gt; a;
	if (a == 1)
		cout &lt;&lt; "[1]" &lt;&lt; endl;
	else if (a == 2)
		cout &lt;&lt; "[[1],[1,1]]" &lt;&lt; endl;
	else if (a == 3)
		cout &lt;&lt; "[[1],[1,1][1,2,1]]" &lt;&lt; endl;
	else if (a &lt;= 0)
		exit(0);
	else
		GetResult(a);
}</code></pre>

<h1 id="%E5%85%A8%E9%83%A8%E4%BB%A3%E7%A0%81">全部代码</h1>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
#include &lt;vector&gt;
using namespace std;
void printResult(vector &lt;vector&lt;int&gt;&gt; sums)
{
	cout &lt;&lt; "[";
	for(int i=0;i&lt;=sums.size()-1;i++)
	{
		if (i != 0)
			cout &lt;&lt; ",";
		cout &lt;&lt; "[";
		for (int j = 0; j &lt;= sums[i].size()-1; j++)
		{
			if (i != 0)
				cout &lt;&lt; ",";
			cout &lt;&lt; sums[i][j] ;
		}
		cout &lt;&lt; "]";
	}
	cout &lt;&lt; "]";
}
void GetResult(int a)
{
	vector &lt;vector&lt;int&gt;&gt; sums;
	int b[1] = { 1 };
	int c[2] = { 1,1 };
	int d[3] = { 1,2,1 };
	vector &lt;int&gt; a_1(b,b+1);
	vector &lt;int&gt; a_2(c,c+2);
	vector &lt;int&gt; a_3(d,d+3);
	sums.push_back(a_1);
	sums.push_back(a_2);
	sums.push_back(a_3);
	for (int i = 3; i &lt;= a - 1; i++)
	{
		vector &lt;int&gt; sum ;
		for (int j = 0; j &lt;= i; j++)
		{
			if (j == 0 or j==i)
			{
				sum.push_back(1);
				continue;
			}
			int sum_1 = 0;
			sum_1 = sums[i - 1][j-1] + sums[i - 1][j];
			sum.push_back(sum_1);
		}
		sums.push_back(sum);
	}
	printResult(sums);
}
int main()
{
	int a;
	cin &gt;&gt; a;
	if (a == 1)
		cout &lt;&lt; "[1]" &lt;&lt; endl;
	else if (a == 2)
		cout &lt;&lt; "[[1],[1,1]]" &lt;&lt; endl;
	else if (a == 3)
		cout &lt;&lt; "[[1],[1,1][1,2,1]]" &lt;&lt; endl;
	else if (a &lt;= 0)
		exit(0);
	else
		GetResult(a);
}</code></pre>

<h1 id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C">运行结果</h1>

<p><img alt="" height="1030" src="/image/336f1e33bb18f7602e290e756f1fff28.png" width="1200" /></p>
