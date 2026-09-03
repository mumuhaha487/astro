---
title: 【C++】多线程的学习笔记（2）——白话文版（bushi
published: 2023-10-04
tags: [c++,多线程,thread库,算法,学习,笔记]
category: c/c++
image: /image/a25ec18ff3246d93e47e0d77bfd9a207.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E4%B8%80%E7%AF%87-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E4%B8%80%E7%AF%87">前一篇</a></p>

<p id="%E6%9C%AC%E7%AB%A0%E5%86%85%E5%AE%B9%E6%8F%90%E8%A6%81-toc" style="margin-left:0px;"><a href="#%E6%9C%AC%E7%AB%A0%E5%86%85%E5%AE%B9%E6%8F%90%E8%A6%81">本章内容提要</a></p>

<p id="%E4%BD%BF%E7%94%A8mutex%E9%94%81%E7%9A%84%E5%8E%9F%E5%9B%A0-toc" style="margin-left:0px;"><a href="#%E4%BD%BF%E7%94%A8mutex%E9%94%81%E7%9A%84%E5%8E%9F%E5%9B%A0">使用mutex锁的原因</a></p>

<p id="mutex%E9%94%81%E7%9A%84%E6%A6%82%E5%BF%B5-toc" style="margin-left:0px;"><a href="#mutex%E9%94%81%E7%9A%84%E6%A6%82%E5%BF%B5">mutex锁的概念</a></p>

<p id="mutex%E7%9A%84%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-toc" style="margin-left:0px;"><a href="#mutex%E7%9A%84%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B">mutex的使用教程</a></p>

<p id="%E9%94%81%E7%9A%84%E5%A3%B0%E6%98%8E%E4%BB%A5%E5%8F%8A%E5%91%BD%E5%90%8D-toc" style="margin-left:40px;"><a href="#%E9%94%81%E7%9A%84%E5%A3%B0%E6%98%8E%E4%BB%A5%E5%8F%8A%E5%91%BD%E5%90%8D">锁的声明以及命名</a></p>

<p id="mutex%E7%9A%84%E5%8A%A0%E9%94%81%E4%BB%A5%E5%8F%8A%E8%A7%A3%E9%94%81-toc" style="margin-left:40px;"><a href="#mutex%E7%9A%84%E5%8A%A0%E9%94%81%E4%BB%A5%E5%8F%8A%E8%A7%A3%E9%94%81">mutex的加锁以及解锁</a></p>

<p id="%E4%BE%8B%E5%AD%90-toc" style="margin-left:80px;"><a href="#%E4%BE%8B%E5%AD%90">例子</a></p>

<p id="%E7%BB%93%E6%9E%9C-toc" style="margin-left:80px;"><a href="#%E7%BB%93%E6%9E%9C">结果</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:40px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<p id="mutex%E7%9A%84%E5%85%B6%E4%BB%96%E6%96%B9%E5%BC%8F%E7%9A%84%E9%94%81%E4%BB%8B%E7%BB%8D-toc" style="margin-left:0px;"><a href="#mutex%E7%9A%84%E5%85%B6%E4%BB%96%E6%96%B9%E5%BC%8F%E7%9A%84%E9%94%81%E4%BB%8B%E7%BB%8D">mutex的其他方式的锁介绍</a></p>

<p id="lock_guard-toc" style="margin-left:40px;"><a href="#lock_guard">lock_guard</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:80px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="%E4%BE%8B%E5%AD%90-toc" style="margin-left:80px;"><a href="#%E4%BE%8B%E5%AD%90">例子</a></p>

<p id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C-toc" style="margin-left:80px;"><a href="#%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C">运行结果</a></p>

<p id="adopt_lock%E5%8F%82%E6%95%B0-toc" style="margin-left:80px;"><a href="#adopt_lock%E5%8F%82%E6%95%B0">adopt_lock参数</a></p>

<p id="unique_lock-toc" style="margin-left:40px;"><a href="#unique_lock">unique_lock</a></p>

<p id="%E4%BB%8B%E7%BB%8D-toc" style="margin-left:80px;"><a href="#%E4%BB%8B%E7%BB%8D">介绍</a></p>

<p id="2.2%20std%3A%3Atry_to_lock-toc" style="margin-left:80px;"><a href="#2.2%20std%3A%3Atry_to_lock">try_to_lock</a></p>

<p id="2.3%20std%3A%3Adefer_lock-toc" style="margin-left:80px;"><a href="#2.3%20std%3A%3Adefer_lock">defer_lock</a></p>

<p id="release-toc" style="margin-left:80px;"><a href="#release">release</a></p>

<p id="%E4%BE%8B%E5%AD%90-toc" style="margin-left:120px;"><a href="#%E4%BE%8B%E5%AD%90">例子</a></p>

<p id="%E7%BB%93%E6%9E%9C-toc" style="margin-left:120px;"><a href="#%E7%BB%93%E6%9E%9C">结果</a></p>

<p id="%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E7%BB%93">总结</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E4%B8%80%E7%AF%87">前一篇</h1>

<p>第一篇在这</p>

<p><a class="has-card" data-link-desc="C++ 作为一种强大的编程语言，为多线程编程提供了丰富而灵活的支持。C++ 的标准库提供了头文件，其中包含了用于创建、启动和管理线程的类和函数。通过使用这些多线程库和功能，开发人员可以轻松地引入并发性到自己的应用程序中，实现多线程的并行处理。thread函数中定义线程的语法规如下std::thread 变量名 (函数，传递的参数1，传递的参数2，传递的参数3...）【如果前面加了using namespace std;可以删除std::】" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="【C++】多线程的学习笔记——白话文版（bushi-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/133468825?spm=1001.2014.3001.5502" title="【C++】多线程的学习笔记——白话文版（bushi-CSDN博客"><span class="link-card-box"><span class="link-title">【C++】多线程的学习笔记——白话文版（bushi-CSDN博客</span><span class="link-desc">C++ 作为一种强大的编程语言，为多线程编程提供了丰富而灵活的支持。C++ 的标准库提供了头文件，其中包含了用于创建、启动和管理线程的类和函数。通过使用这些多线程库和功能，开发人员可以轻松地引入并发性到自己的应用程序中，实现多线程的并行处理。thread函数中定义线程的语法规如下std::thread 变量名 (函数，传递的参数1，传递的参数2，传递的参数3...）【如果前面加了using namespace std;可以删除std::】</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/mumuemhaha/article/details/133468825?spm=1001.2014.3001.5502</span></span></a></p>

<h1 id="%E6%9C%AC%E7%AB%A0%E5%86%85%E5%AE%B9%E6%8F%90%E8%A6%81">本章内容提要</h1>

<p>上一章我们讲解了如何利用thread库初步进行多线程操作</p>

<p>这一章，我们主要讲的是锁（其实就是mutex锁）的概念</p>

<p><img alt="" height="300" src="/image/1f851575cfb2e3a4e116b159e71ccbed.gif" width="368" /></p>

<h1 id="%E4%BD%BF%E7%94%A8mutex%E9%94%81%E7%9A%84%E5%8E%9F%E5%9B%A0">使用mutex锁的原因</h1>

<p>在上一章的多线程操作中我们也许会想到一个问题——如果变量或者资源他不是独占的，而是共享的（比如对于全局变量的修改），那么如果多个线程同时访问就会引起不可预料的错误</p>

<p>这个时候就必须要给线程进行加锁确保只能有一个线程运行此函数。</p>

<h1 id="mutex%E9%94%81%E7%9A%84%E6%A6%82%E5%BF%B5">mutex锁的概念</h1>

<blockquote>
<p>Mutex（互斥锁）是一种线程同步机制，用于保护共享资源的访问，防止多个线程同时访问和修改同一份数据而引发竞争条件（race condition）。</p>

<p>Mutex 的作用是在关键代码段前后加锁和解锁操作，确保只有一个线程能够进入临界区（critical section）执行代码，从而保证共享资源的安全访问。</p>
</blockquote>

<p><span style="color:#fe2c24;"><strong>同一时刻，同一临界区，只能有一个线程持有该锁</strong></span></p>

<h1 id="mutex%E7%9A%84%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B">mutex的使用教程</h1>

<h2 id="%E9%94%81%E7%9A%84%E5%A3%B0%E6%98%8E%E4%BB%A5%E5%8F%8A%E5%91%BD%E5%90%8D">锁的声明以及命名</h2>

<p>开头必然要声明库函数</p>

<pre>
<code class="language-cpp">#include &lt;mutex&gt;</code></pre>

<p>和其他类型的变量一样，之后锁还需要声明一个变量</p>

<pre>
<code class="language-cpp">mutex mtx_1;</code></pre>

<p>这个最好是在全局变量中进行声明</p>

<h2 id="mutex%E7%9A%84%E5%8A%A0%E9%94%81%E4%BB%A5%E5%8F%8A%E8%A7%A3%E9%94%81">mutex的加锁以及解锁</h2>

<p>在你写函数需要加锁时你只需要调用他们当中的<span style="background-color:#ff9900;">lock()</span>,以及<span style="background-color:#ff9900;">unlck()</span>，如果在执行lock时候如果锁已经被其他线程获取了，那么线程会进行等待</p>

<p>拿上面的进行举例就是</p>

<pre>
<code class="language-cpp">mtx_1.lock();//加锁
mtx_1.unlock();//解锁</code></pre>

<h3 id="%E4%BE%8B%E5%AD%90">例子</h3>

<p>运行一个</p>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
#include &lt;thread&gt;
#include &lt;time.h&gt;
#include &lt;vector&gt;
#include &lt;mutex&gt;
using namespace std;
mutex mtx_1;
void F_1(int i) {
	mtx_1.lock();
	cout &lt;&lt; "This is NO." &lt;&lt; i &lt;&lt; " project is runing." &lt;&lt; endl;
	this_thread::sleep_for(chrono::seconds(i));
	cout &lt;&lt; "This is NO." &lt;&lt; i &lt;&lt; " project is finishing." &lt;&lt; endl;
	mtx_1.unlock();
}
int main() {
	clock_t now_time_1 = clock();
	cout &lt;&lt; "This project is start!" &lt;&lt; endl;//记录刚刚开始的时间
	vector&lt;thread&gt;sum_1;
	for (int i = 1; i &lt;= 3; i++) {
		sum_1.push_back(thread(F_1, i));
	}
	for (int i = 0; i &lt;= sum_1.size() - 1; i++) {
		sum_1[i].join();
	}

	cout &lt;&lt; "This project is ready!" &lt;&lt; endl;//记录结束的时间
	clock_t now_time_2 = clock();
	cout &lt;&lt; "The cost time is " &lt;&lt; now_time_2 - now_time_1 &lt;&lt; " ms " &lt;&lt; endl;
	return 0;
}</code></pre>

<p>简单的代码</p>

<p></p>

<h3 id="%E7%BB%93%E6%9E%9C">结果</h3>

<p><img alt="" height="1030" src="/image/f8fa01e32c9b6cf9e640f0353ccaa703.png" width="1200" /></p>

<p>可能有人就要问，这不和之前顺序执行的时间一样吗？</p>

<p>先不要急，这只是举一个例子，例子也比较极端开头就锁上了，事实上你只需要在有资源冲突的函数部分加锁即可，其他的地方依旧可以和以前一样，甚至不同的函数你可以命名两个锁分别进行执行加锁或者是解锁。</p>

<p>换言之，锁只是在你需要确保该资源变量在同一时刻只被一个线程访问时加上即可。</p>

<h2 id="%E6%B3%A8%E6%84%8F">注意</h2>

<p><span style="background-color:#ff9900;">需要注意的是需要避免的是：两个或者多个线程之间所需要的资源被另外的线程锁住，从而造成死锁。</span></p>

<h1 id="mutex%E7%9A%84%E5%85%B6%E4%BB%96%E6%96%B9%E5%BC%8F%E7%9A%84%E9%94%81%E4%BB%8B%E7%BB%8D">mutex的其他方式的锁介绍</h1>

<h2 id="lock_guard">lock_guard</h2>

<h3 id="%E4%BB%8B%E7%BB%8D">介绍</h3>

<p>lock_guard是模板类，对比于mutex的区别是lock_guard在创建时会尝试获得锁的所有权（注意时尝试，如果获取不到就相当于没有用，并且不会报错），在作用域结束时会自动析构，无需手动解锁</p>

<p>该类不可中途上锁和解锁，不可复制</p>

<h3>例子</h3>

<p>还是之前的代码</p>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
#include &lt;thread&gt;
#include &lt;time.h&gt;
#include &lt;vector&gt;
#include &lt;mutex&gt;
using namespace std;
mutex mtx_1;
void F_1(int i) {
	lock_guard&lt;mutex&gt;guard_1(mtx_1);
	cout &lt;&lt; "This is NO." &lt;&lt; i &lt;&lt; " project is runing." &lt;&lt; endl;
	this_thread::sleep_for(chrono::seconds(i));
	cout &lt;&lt; "This is NO." &lt;&lt; i &lt;&lt; " project is finishing." &lt;&lt; endl;
}
int main() {
	clock_t now_time_1 = clock();
	cout &lt;&lt; "This project is start!" &lt;&lt; endl;//记录刚刚开始的时间
	vector&lt;thread&gt;sum_1;
	for (int i = 1; i &lt;= 3; i++) {
		sum_1.push_back(thread(F_1, i));
	}
	for (int i = 0; i &lt;= sum_1.size() - 1; i++) {
		sum_1[i].join();
	}

	cout &lt;&lt; "This project is ready!" &lt;&lt; endl;//记录结束的时间
	clock_t now_time_2 = clock();
	cout &lt;&lt; "The cost time is " &lt;&lt; now_time_2 - now_time_1 &lt;&lt; " ms " &lt;&lt; endl;
	return 0;
}</code></pre>

<h3 id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C">运行结果</h3>

<p><img alt="" height="1030" src="/image/1398c91981866502def55d24048c542b.png" width="1200" /></p>

<p>他并不需要解锁和解锁 </p>

<h3 id="adopt_lock%E5%8F%82%E6%95%B0">adopt_lock参数</h3>

<p>adopt_lock用法为</p>

<pre>
<code class="language-cpp">lock_guard&lt;mutex&gt;guard_1(mtx_1,adopt_lock);</code></pre>

<p> 加了这个参数，就可以在创建时候不上锁，代表表示这个互斥量已经lock()；优化代码的运行时间，同时这个参数本质时起到一个标记</p>

<p><span style="background-color:#ff9900;">但是需要注意由于lock_guard不可以主动上锁，如果这个锁本身还没有lock过就会报错。</span></p>

<h2 id="unique_lock">unique_lock</h2>

<h3>介绍</h3>

<p>unique_lock的用法和lock_guard的用法类似，主要的区别在于他可以中途上锁以及解锁</p>

<p>对比于lock_guard会更加的灵活</p>

<p>但是所需要的内存空间会更大</p>

<p>同时它的也有<span style="background-color:#ff9900;">adopt_lock</span>参数用法一样，而且他还拥有其他的第二参数</p>

<h3 id="2.2%20std%3A%3Atry_to_lock">try_to_lock</h3>

<p>他会尝试的去获取锁，如果锁没有被占用就会获取到，如果已经被占用了也会立即放回执行下面的代码不会进行堵塞，<span style="background-color:#ff9900;">用法和adopt_lock一样</span></p>

<h3 id="2.3%20std%3A%3Adefer_lock">defer_lock</h3>

<p>创建锁的时候不上锁（需要注意区分前面的<span style="background-color:#ff9900;">adopt_lock()</span>这个时没上锁的前提下（如果上锁了会报错）创建该锁时不上锁。之后再进行上锁。），<span style="background-color:#ff9900;">用法也和adopt_lock一样</span></p>

<h3 id="release">release</h3>

<p>为释放unique_lock的所有权，注意是释放——release！！！！不是解锁——unlock，之后的锁需要你自己来管理</p>

<h4>例子</h4>

<p>还是之前的代码中的函数</p>

<pre>
<code class="language-cpp">void F_1(int i) {
	unique_lock&lt;mutex&gt;guard_1(mtx_1);
	mutex* mtx_2 = guard_1.release();
	cout &lt;&lt; "This is NO." &lt;&lt; i &lt;&lt; " project is runing." &lt;&lt; endl;
	this_thread::sleep_for(chrono::seconds(i));
	cout &lt;&lt; "This is NO." &lt;&lt; i &lt;&lt; " project is finishing." &lt;&lt; endl;
	mtx_2-&gt;unlock();
}</code></pre>

<h4>结果</h4>

<p><img alt="" height="639" src="/image/078cfbabb76e9051e408a8b24226209e.png" width="1113" /></p>

<p> 当然还是一样的</p>

<h1 id="%E6%80%BB%E7%BB%93">总结</h1>

<p>本章讲解了mutex大部分的知识点，使用时需要注意锁住的代码要尽可能的少而精准，这样程序的运行时间和稳定性以及安全性才可以同时得到显著的提升。</p>
