---
title: C++中的pair 和make_pair的用法
published: 2023-06-10
tags: [数学建模,c++]
category: c/c++
---

<!--more-->

<h1>pair的基础用法概念</h1>

<p>pair可以把两个数据整合到一个变量中</p>

<blockquote>
<p>注意只能是两个，多不行，少也不行</p>

<p>数据类型可同可不同</p>
</blockquote>

<p>可以方便的进行数据管理</p>

<h1>pair的基础定义以及逻辑关系</h1>

<blockquote>
<p>pair&lt;T1, T2&gt; p1;            //创建一个空的pair对象（使用默认构造），它的两个元素分别是T1和T2类型，采用值初始化。<br />
pair&lt;T1, T2&gt; p1(v1, v2);    //创建一个pair对象，它的两个元素分别是T1和T2类型，其中first成员初始化为v1，second成员初始化为v2。<br />
make_pair(v1, v2);          // 以v1和v2的值创建一个新的pair对象，其元素类型分别是v1和v2的类型。<br />
p1 &lt; p2;                    // 两个pair对象间的小于运算，其定义遵循字典次序：如 p1.first &lt; p2.first 或者 !(p2.first &lt; p1.first) &amp;&amp; (p1.second &lt; p2.second) 则返回true。<br />
p1 == p2；                  // 如果两个对象的first和second依次相等，则这两个对象相等；该运算使用元素的==操作符。<br />
p1.first;                   // 返回对象p1中名为first的公有数据成员<br />
p1.second;                 // 返回对象p1中名为second的公有数据成员</p>
</blockquote>

<p>通过p1 &lt; p2;这个可以通俗的理解为第一个元素也就是first元素他的权重要比second的元素权重要大（也就是比大小优先比较他）</p>

<p>在定义少量的pair类型时可以用<span style="background-color:#38d8f0;">pair&lt;T1, T2&gt; p1;</span><span>或者是</span><span style="background-color:#38d8f0;">pair&lt;T1, T2&gt; p1(v1, v2);</span>来进行定义</p>

<p>如果要进行多个定义是可以用</p>

<pre>
<code class="language-cpp">typedef struct pair&lt;int,float&gt; PAIR_X;</code></pre>

<blockquote>
<p>学到这里我才知道定义结构体的<span style="background-color:#38d8f0;">typedef</span>是用于后面定义结构图时不用加struct（无关提及）</p>
</blockquote>

<h1>实战（代码）</h1>

<p>为了方便理解我这用段代码来定义一个pair类型的变量并且赋值然后打印它的第一个元素</p>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
using namespace std;
typedef struct pair&lt;int,float&gt; PAIR_X;
int main(void)
{
    PAIR_X pair_1 =make_pair(0,3.14f);
    cout&lt;&lt;pair_1.first&lt;&lt;endl;  
    return 0;
}</code></pre>

<h1>总结</h1>

<p>pair定义可以更加方便并且快速的定制自己想要的数据类型（比如红黑树的类型定义...）</p>

<p></p>
