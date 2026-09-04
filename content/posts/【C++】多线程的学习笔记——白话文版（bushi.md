---
title: 【C++】多线程的学习笔记——白话文版（bushi
published: 2023-10-01
tags: [学习,笔记,c++,多线程]
category: c/c++
image: /image/a25ec18ff3246d93e47e0d77bfd9a207.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="main-toc-toc" style="margin-left:0px;"><a href="#main-toc">下一章内容</a></p>

<p id="%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BA%BF%E7%A8%8B-toc" style="margin-left:0px;"><a href="#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BA%BF%E7%A8%8B">为什么要使用多线程</a></p>

<p id="%E4%BE%8B%E5%AD%90-toc" style="margin-left:0px;"><a href="#%E4%BE%8B%E5%AD%90">例子</a></p>

<p id="%E4%BB%A3%E7%A0%81-toc" style="margin-left:40px;"><a href="#%E4%BB%A3%E7%A0%81">代码</a></p>

<p id="%E7%BB%93%E6%9E%9C-toc" style="margin-left:40px;"><a href="#%E7%BB%93%E6%9E%9C">结果</a></p>

<p id="%E9%A6%96%E5%85%88%E8%A6%81%E5%85%88%E5%AD%A6%E7%9A%84%E5%BA%93%E2%80%94%E2%80%94thread%E5%BA%93-toc" style="margin-left:0px;"><a href="#%E9%A6%96%E5%85%88%E8%A6%81%E5%85%88%E5%AD%A6%E7%9A%84%E5%BA%93%E2%80%94%E2%80%94thread%E5%BA%93">首先要先学的库——thread库</a></p>

<p id="thread%E7%9A%84%E7%AE%80%E4%BB%8B-toc" style="margin-left:40px;"><a href="#thread%E7%9A%84%E7%AE%80%E4%BB%8B">thread的简介</a></p>

<p id="thread%E7%9A%84%E5%85%B7%E4%BD%93%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95-toc" style="margin-left:40px;"><a href="#thread%E7%9A%84%E5%85%B7%E4%BD%93%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95">thread的具体使用方法</a></p>

<p id="%E5%9F%BA%E6%9C%AC%E5%8F%98%E9%87%8F%E7%9A%84%E5%AE%9A%E4%B9%89-toc" style="margin-left:80px;"><a href="#%E5%9F%BA%E6%9C%AC%E5%8F%98%E9%87%8F%E7%9A%84%E5%AE%9A%E4%B9%89">基本变量的定义</a></p>

<p id="%E6%B3%A8%E6%84%8F%EF%BC%88%E5%B0%8F%E9%87%8D%E7%82%B9%EF%BC%89-toc" style="margin-left:120px;"><a href="#%E6%B3%A8%E6%84%8F%EF%BC%88%E5%B0%8F%E9%87%8D%E7%82%B9%EF%BC%89">注意（小重点）</a></p>

<p id="join%E5%87%BD%E6%95%B0%E7%9A%84%E8%A7%A3%E8%AF%BB%EF%BC%88%E9%87%8D%E7%82%B9%EF%BC%89-toc" style="margin-left:80px;"><a href="#join%E5%87%BD%E6%95%B0%E7%9A%84%E8%A7%A3%E8%AF%BB%EF%BC%88%E9%87%8D%E7%82%B9%EF%BC%89">join函数的解读（重点）</a></p>

<p id="detach%E5%87%BD%E6%95%B0%E7%9A%84%E8%A7%A3%E8%AF%BB-toc" style="margin-left:80px;"><a href="#detach%E5%87%BD%E6%95%B0%E7%9A%84%E8%A7%A3%E8%AF%BB">detach函数的解读</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:80px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="%E5%85%B3%E4%BA%8Evector%E5%92%8Cthread%E6%98%AF%E8%81%94%E5%90%88%E4%BD%BF%E7%94%A8-toc" style="margin-left:40px;"><a href="#%E5%85%B3%E4%BA%8Evector%E5%92%8Cthread%E6%98%AF%E8%81%94%E5%90%88%E4%BD%BF%E7%94%A8">关于vector和thread是联合使用</a></p>

<p id="%E4%BE%8B%E5%AD%90%E4%B8%AD%E4%BB%A3%E7%A0%81%E7%9A%84%E6%94%B9%E8%89%AF-toc" style="margin-left:0px;"><a href="#%E4%BE%8B%E5%AD%90%E4%B8%AD%E4%BB%A3%E7%A0%81%E7%9A%84%E6%94%B9%E8%89%AF">例子中代码的改良</a></p>

<p id="%E4%BB%A3%E7%A0%81-toc" style="margin-left:40px;"><a href="#%E4%BB%A3%E7%A0%81">代码</a></p>

<p id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C-toc" style="margin-left:40px;"><a href="#%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C">运行结果</a></p>

<p id="%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E7%BB%93">总结</a></p>

<p id="%E6%98%AF%E4%B8%8D%E6%98%AF%E5%B0%91%E4%BA%86%E4%BB%80%E4%B9%88%EF%BC%9F-toc" style="margin-left:0px;"><a href="#%E6%98%AF%E4%B8%8D%E6%98%AF%E5%B0%91%E4%BA%86%E4%BB%80%E4%B9%88%EF%BC%9F">是不是少了什么？</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="main-toc">下一章内容</h1>

<p><a class="has-card" data-link-desc="lock_guard是模板类，对比于mutex的区别是lock_guard在创建时会尝试获得锁的所有权（注意时尝试，如果获取不到就相当于没有用，并且不会报错），在作用域结束时会自动析构，无需手动解锁该类不可中途上锁和解锁，不可复制unique_lock的用法和lock_guard的用法类似，主要的区别在于他可以中途上锁以及解锁对比于lock_guard会更加的灵活但是所需要的内存空间会更大同时它的也有adopt_lock参数用法一样，而且他还拥有其他的第二参数。" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="【C++】多线程的学习笔记（2）——白话文版（bushi-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/133554220?spm=1001.2014.3001.5501" title="【C++】多线程的学习笔记（2）——白话文版（bushi-CSDN博客"><span class="link-card-box"><span class="link-title">【C++】多线程的学习笔记（2）——白话文版（bushi-CSDN博客</span><span class="link-desc">lock_guard是模板类，对比于mutex的区别是lock_guard在创建时会尝试获得锁的所有权（注意时尝试，如果获取不到就相当于没有用，并且不会报错），在作用域结束时会自动析构，无需手动解锁该类不可中途上锁和解锁，不可复制unique_lock的用法和lock_guard的用法类似，主要的区别在于他可以中途上锁以及解锁对比于lock_guard会更加的灵活但是所需要的内存空间会更大同时它的也有adopt_lock参数用法一样，而且他还拥有其他的第二参数。</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/mumuemhaha/article/details/133554220?spm=1001.2014.3001.5501</span></span></a></p>

<h1 id="%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BA%BF%E7%A8%8B">为什么要使用多线程</h1>

<p>在我们实际处理问题中可能会遇到一些需要等待或者是需要时间去等待放回的问题</p>

<p>比如像网络爬虫的数据包返回，亦或者程序对cpu的使用率不高，导致时间和性能的浪费</p>

<p>同时多线程可以实现异步编程，将一些耗时的操作放在后台线程执行，使得主线程能够继续响应用户的其他操作，提高程序的并发性。</p>

<p>综上所述，多线程编程对于我们大部分编程语言的学习都是必须要学习的。</p>

<h1 id="%E4%BE%8B%E5%AD%90">例子</h1>

<p>在这里我先放一个源代码在这，这是我们用原先的方法进行顺序执行</p>

<h2 id="%E4%BB%A3%E7%A0%81">代码</h2>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
#include &lt;thread&gt;
#include &lt;time.h&gt;
using namespace std;
void F_1(int i) {
	this_thread::sleep_for(chrono::seconds(i));//设定程序需要运行的时间
	cout &lt;&lt; "The No."&lt;&lt;i&lt;&lt;" is finish" &lt;&lt; endl;
}
int main() {
	clock_t now_time_1 = clock();//记录刚刚开始的时间
	cout &lt;&lt; "This project is start!" &lt;&lt; endl;
	for (int i = 1; i &lt;= 3; i++) {
		F_1(i);
	}
	cout &lt;&lt; "This project is ready!" &lt;&lt; endl;
	clock_t now_time_2 = clock();//记录最后结束的时间
	cout &lt;&lt; "The cost time is " &lt;&lt; now_time_2 - now_time_1 &lt;&lt;" ms " &lt;&lt; endl;
}</code></pre>

<blockquote>
<p> 其中time.h库中的clock_t以及clock()是是用来统计程序运行的时间的</p>

<p>this_thread::sleep_for(chrono::seconds(i))这个函数是个休眠函数，为等待i秒，用来模拟程序运行的时间</p>
</blockquote>

<h2 id="%E7%BB%93%E6%9E%9C">结果</h2>

<p>程序运行的结果</p>

<p><img alt="" height="1030" src="/image/a25ec18ff3246d93e47e0d77bfd9a207.png" width="1200" /></p>

<p>如图程序一共运行了6000ms的时间 </p>

<h1 id="%E9%A6%96%E5%85%88%E8%A6%81%E5%85%88%E5%AD%A6%E7%9A%84%E5%BA%93%E2%80%94%E2%80%94thread%E5%BA%93">首先要先学的库——thread库</h1>

<h2 id="thread%E7%9A%84%E7%AE%80%E4%BB%8B">thread的简介</h2>

<blockquote>
<p>C++ 作为一种强大的编程语言，为多线程编程提供了丰富而灵活的支持。C++ 的标准库提供了 <code>&lt;thread&gt;</code> 头文件，其中包含了用于创建、启动和管理线程的类和函数。通过使用这些多线程库和功能，开发人员可以轻松地引入并发性到自己的应用程序中，实现多线程的并行处理。</p>
</blockquote>

<h2 id="thread%E7%9A%84%E5%85%B7%E4%BD%93%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95">thread的具体使用方法</h2>

<h3 id="%E5%9F%BA%E6%9C%AC%E5%8F%98%E9%87%8F%E7%9A%84%E5%AE%9A%E4%B9%89">基本变量的定义</h3>

<p>thread函数中定义线程的语法规如下</p>

<pre>
<code class="language-cpp">std::thread 变量名 (函数，传递的参数1，传递的参数2，传递的参数3...）【如果前面加了using namespace std;可以删除std::】</code></pre>

<h4 id="%E6%B3%A8%E6%84%8F%EF%BC%88%E5%B0%8F%E9%87%8D%E7%82%B9%EF%BC%89">注意（小重点）</h4>

<p>其中如果原函数传递的参数为左值（也就是int &amp;a）那么传递的参数应该把原来的a，b...改为ref(a),ref（b）或者cref(a),cref(b)...</p>

<p>原因是thread为右值传递，函数讲道理应该不能用引用也就是右值。</p>

<p>至于啥是左值啥是右值？</p>

<p>简单来说就是左值是内存上有空间或者是有地址的，而右值就是内存上没空间或者是只有临时地址的，举个例子</p>

<pre>
<code class="language-cpp">int a=1;//a为左值,1为右值
int b=a+1;//b为左值，a+1为右值（注意）
int&amp; c=b;//可以，因为a为左值，在内存上有空间
int&amp; d=10//不可以，因为10为右值，在内存上面没有空间</code></pre>

<p>那为什么ref以及cref可以呢？</p>

<ul><li>ref可以包装按引用传递的值为右值。</li>
	<li>cref可以包装按<code>const</code>引用传递的值为右值。</li>
</ul><p>他们都是经过从左值转为右值的转化的（但是实际还是左值）</p>

<h3 id="join%E5%87%BD%E6%95%B0%E7%9A%84%E8%A7%A3%E8%AF%BB%EF%BC%88%E9%87%8D%E7%82%B9%EF%BC%89">join函数的解读（重点）</h3>

<p>join函数就是等待副线程完毕才可以进行join()函数下面的部分</p>

<p>join函数看起来是加入，有一些人（包括我）把它看成加入线程池，其实我觉得把它换成wait其实更好一点......，因为join简单来说就是堵塞主线程，一直到函数运行完毕才可以进行下一步</p>

<p>简单来说就是这样一个图</p>

<p><img alt="" height="766" src="/image/c6534870531d8d6608658152395a114f.png" width="493" /></p>

<p>这样看就是很完整了，不然如果是运行join()才加入的话，那样运行时间和上面代码没什么区别......</p>

<h3 id="detach%E5%87%BD%E6%95%B0%E7%9A%84%E8%A7%A3%E8%AF%BB">detach函数的解读</h3>

<p>detach函数就是比较简单的</p>

<p>笼统的来说：就是把它和主线程分离，两人谁也不等谁（但是其实主线程结束后，副线程由于守护线程的结束也会停止）</p>

<h3 id="%E6%B3%A8%E6%84%8F">注意</h3>

<p>如果你不使用或者是多次使用<span style="color:#fe2c24;"><span style="background-color:#ffd900;">join或者detach两个中的一个函数</span></span>，程序都会报错</p>

<h2 id="%E5%85%B3%E4%BA%8Evector%E5%92%8Cthread%E6%98%AF%E8%81%94%E5%90%88%E4%BD%BF%E7%94%A8">关于vector和thread是联合使用</h2>

<p>代码</p>

<pre>
<code class="language-cpp">vector &lt;thread&gt; sum_1;
sum_1.push_back(thread(F_1, 1))；</code></pre>

<p>如上使用就可以了</p>

<p>join函数就可以这样使用</p>

<pre>
<code class="language-cpp">sum_1[0].join();</code></pre>

<h1 id="%E4%BE%8B%E5%AD%90%E4%B8%AD%E4%BB%A3%E7%A0%81%E7%9A%84%E6%94%B9%E8%89%AF">例子中代码的改良</h1>

<p>那么例子中提到的代码就可以进行修改了</p>

<h2>代码</h2>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
#include &lt;thread&gt;
#include &lt;time.h&gt;
#include &lt;vector&gt;
using namespace std;
void F_1(int i) {
	this_thread::sleep_for(chrono::seconds(i));//设定程序需要运行的时间
	cout &lt;&lt; "The No."&lt;&lt;i&lt;&lt;" is finish" &lt;&lt; endl;
	i++;
}
int main() {
	clock_t now_time_1 = clock();
	cout &lt;&lt; "This project is start!" &lt;&lt; endl;//记录刚刚开始的时间
	vector &lt;thread&gt; sum_1;
	for (int i = 1; i &lt;= 3; i++) {
		sum_1.push_back(thread(F_1, i));
	}
	for (int i = 0; i &lt;= sum_1.size() - 1; i++) {
		sum_1[i].join();
	}
	//for (int i = 1; i &lt;= 3; i++) {
	//	thread t(F_1, i);
	//}
	cout &lt;&lt; "This project is ready!" &lt;&lt; endl;//记录结束的时间
	clock_t now_time_2 = clock();
	cout &lt;&lt; "The cost time is " &lt;&lt; now_time_2 - now_time_1 &lt;&lt;" ms " &lt;&lt; endl;
}</code></pre>

<p>代码中创建的一个容器进行装载三个线程</p>

<p>然后创建过程中已经一起执行了</p>

<h2 id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C">运行结果</h2>

<p><img alt="" height="1030" src="/image/b0a724d0042905f84346192b74e2afd2.png" width="1200" /></p>

<p> 如图，为3015ms，节约的时间十分的可观</p>

<h1 id="%E6%80%BB%E7%BB%93">总结</h1>

<p>在编程中多线程操作一般可以节约可观的时间，并且可以对自己的程序进行一些优化</p>

<p>尽管现在只学了thread库，但是不要担心</p>

<p>接下来我会按照我的学习路线依次把我的学习笔记给写下来</p>

<h1 id="%E6%98%AF%E4%B8%8D%E6%98%AF%E5%B0%91%E4%BA%86%E4%BB%80%E4%B9%88%EF%BC%9F">是不是少了什么？</h1>

<p>哦，对了</p>

<p><img alt="" height="286" src="/image/35982b391b5cf5ccbd52664e94f390ef.gif" width="364" /></p>

<p></p>

<p></p>
