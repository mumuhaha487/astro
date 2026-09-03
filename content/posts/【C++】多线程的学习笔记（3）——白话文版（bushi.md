---
title: 【C++】多线程的学习笔记（3）——白话文版（bushi
published: 2023-11-17
tags: [学习,笔记,c++,多线程,异步]
category: c/c++
image: /image/a25ec18ff3246d93e47e0d77bfd9a207.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E5%89%8D%E4%B8%80%E7%AF%87%E5%86%85%E5%AE%B9%EF%BC%88mutex%E9%94%81%EF%BC%89-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E4%B8%80%E7%AF%87%E5%86%85%E5%AE%B9%EF%BC%88mutex%E9%94%81%EF%BC%89">前一篇内容（mutex锁）</a></p>

<p id="%E5%89%8D%E8%A8%80-toc" style="margin-left:0px;"><a href="#%E5%89%8D%E8%A8%80">前言</a></p>

<p id="Condition%20Variable%E7%9A%84%E7%AE%80%E4%BB%8B-toc" style="margin-left:0px;"><a href="#Condition%20Variable%E7%9A%84%E7%AE%80%E4%BB%8B">Condition Variable的简介</a></p>

<p id="Condition%20Variable%E7%9A%84%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95-toc" style="margin-left:0px;"><a href="#Condition%20Variable%E7%9A%84%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95">Condition Variable的使用方法</a></p>

<p id="wait%E6%96%B9%E6%B3%95-toc" style="margin-left:40px;"><a href="#wait%E6%96%B9%E6%B3%95">wait方法</a></p>

<p id="wait%20for%E5%87%BD%E6%95%B0%E4%B8%8Ewait%20until%E5%87%BD%E6%95%B0-toc" style="margin-left:40px;"><a href="#wait%20for%E5%87%BD%E6%95%B0%E4%B8%8Ewait%20until%E5%87%BD%E6%95%B0">wait for函数与wait until函数</a></p>

<p id="notify%E5%87%BD%E6%95%B0-toc" style="margin-left:40px;"><a href="#notify%E5%87%BD%E6%95%B0">notify函数</a></p>

<p id="notify_one-toc" style="margin-left:80px;"><a href="#notify_one">notify_one</a></p>

<p id="notify_all-toc" style="margin-left:80px;"><a href="#notify_all">notify_all</a></p>

<p id="%E6%B3%A8%E6%84%8F-toc" style="margin-left:80px;"><a href="#%E6%B3%A8%E6%84%8F">注意</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E5%89%8D%E4%B8%80%E7%AF%87%E5%86%85%E5%AE%B9%EF%BC%88mutex%E9%94%81%EF%BC%89">前一篇内容（mutex锁）</h1>

<p><a class="has-card" data-link-desc="文章浏览阅读161次。lock_guard是模板类，对比于mutex的区别是lock_guard在创建时会尝试获得锁的所有权（注意时尝试，如果获取不到就相当于没有用，并且不会报错），在作用域结束时会自动析构，无需手动解锁该类不可中途上锁和解锁，不可复制unique_lock的用法和lock_guard的用法类似，主要的区别在于他可以中途上锁以及解锁对比于lock_guard会更加的灵活但是所需要的内存空间会更大同时它的也有adopt_lock参数用法一样，而且他还拥有其他的第二参数。" data-link-icon="" data-link-title="【C++】多线程的学习笔记（2）——白话文版（bushi-CSDN博客" href="https://blog.csdn.net/mumuemhaha/article/details/133554220?spm=1001.2014.3001.5501" title="【C++】多线程的学习笔记（2）——白话文版（bushi-CSDN博客"><span class="link-card-box"><span class="link-title">【C++】多线程的学习笔记（2）——白话文版（bushi-CSDN博客</span><span class="link-desc">文章浏览阅读161次。lock_guard是模板类，对比于mutex的区别是lock_guard在创建时会尝试获得锁的所有权（注意时尝试，如果获取不到就相当于没有用，并且不会报错），在作用域结束时会自动析构，无需手动解锁该类不可中途上锁和解锁，不可复制unique_lock的用法和lock_guard的用法类似，主要的区别在于他可以中途上锁以及解锁对比于lock_guard会更加的灵活但是所需要的内存空间会更大同时它的也有adopt_lock参数用法一样，而且他还拥有其他的第二参数。</span><span class="link-link"><img alt="" class="link-link-icon" src="" />https://blog.csdn.net/mumuemhaha/article/details/133554220?spm=1001.2014.3001.5501</span></span></a></p>

<h1 id="%E5%89%8D%E8%A8%80">前言</h1>

<p>好久没有继续写博客了，原因就是<s>去沉淀了一下</s>偷懒了一下</p>

<p>现在在学网络编程，c++的多线程也还在学</p>

<p>这一变博客就讲讲c++中的Condition Variable库吧</p>

<h1 id="Condition%20Variable%E7%9A%84%E7%AE%80%E4%BB%8B">Condition Variable的简介</h1>

<p>官方原文解释</p>

<p><img alt="" height="309" src="/image/913899d84838dba5cd8e98629804b096.png" width="1200" />翻译就是</p>

<p><em>条件变量</em>是一个对象，它能够阻止调用线程，直到<em>通知</em>恢复。<br /><br />
当调用线程的一个<em><a data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.6/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N7T8" data-link-title="等待函数" href="https://cplusplus.com/condition_variable::wait" title="等待函数">等待函数</a></em>时，它使用 （mutex ） 来锁定线程。该线程将保持阻塞状态，直到被另一个线程唤醒，该线程对同一对象调用<em><a data-link-icon="https://csdnimg.cn/release/blog_editor_html/release2.3.6/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=N7T8" data-link-title="通知函数" href="https://cplusplus.com/condition_variable::notify_one" title="通知函数">通知函数</a></em>。</p>

<p>这里我们可以看到Condition Variable一般是要和mute锁配合使用来发挥他的最大用处</p>

<h1 id="Condition%20Variable%E7%9A%84%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95">Condition Variable的使用方法</h1>

<h2 id="wait%E6%96%B9%E6%B3%95">wait方法</h2>

<p>wait方法的原型为两种</p>

<pre>
<code class="language-cpp">void wait (unique_lock&lt;mutex&gt;&amp; lck);
template &lt;class Predicate&gt;
void wait (unique_lock&lt;mutex&gt;&amp; lck, Predicate pred);</code></pre>

<p>第一种为他只是传递一个mutex锁(注意是unique_lock锁）来锁定自己，也就是堵塞当前的线程，直到自己被notify(下面要讲到的函数)唤醒。</p>

<p>第二种和第一种差不多不过他多了一个predicate的参数，这里可以是一个函数，类型为true或者false，我画了一张并不是很准确的图片可以帮助理解一下</p>

<p><img alt="" height="646" src="/image/0cea0505c9ae69dfe634218fa5a164c3.png" width="491" /></p>

<p></p>

<p>大部分时候为了缩短代码的长度他一般会写出lambda表达式，也就是类似与<span style="background-color:#ff9900;">[x] () { x=1; };</span>这样的表达式</p>

<p>它可以等效为</p>

<pre>
<code class="language-cpp">bool F_1(int x){
    return x=1
}</code></pre>

<p>其中的lambda表达式有许多用法——诸如捕获前面的变量，传递以及引用；这里不多做赘述，论坛里有许多相关的文章，这里提一嘴主要是让读者知道这是一个什么东西，好搜索相应的教程。</p>

<h2 id="wait%20for%E5%87%BD%E6%95%B0%E4%B8%8Ewait%20until%E5%87%BD%E6%95%B0">wait for函数与wait until函数</h2>

<p>wait for函数原型</p>

<pre>
<code class="language-cpp">template &lt;class Clock, class Duration&gt;
    cv_status wait_until (unique_lock&lt;mutex&gt;&amp; lck,const chrono::time_point&lt;Clock,Duration&gt;&amp; abs_time);
template &lt;class Clock, class Duration, class Predicate&gt;
    bool wait_until (unique_lock&lt;mutex&gt;&amp; lck,const chrono::time_point&lt;Clock,Duration&gt;&amp; abs_time,Predicate pred);</code></pre>

<p>这里不用仔细看，大部分和前面的wait函数一样，也是有两个函数（一个带predicate的参数，一个不带predicate的参数），但是多了一个设定超时时间，也就是超过时间即使没有获取到mutex锁就不堵塞当前线程了。</p>

<p>第二个参数可以设定一个超时时间比如2秒。</p>

<p>而wait until函数为</p>

<pre>
<code class="language-cpp">template&lt; class Clock, class Duration &gt;
std::cv_status
    wait_until( std::unique_lock&lt;std::mutex&gt;&amp; lock,
                const std::chrono::time_point&lt;Clock, Duration&gt;&amp; timeout_time );

template&lt; class Clock, class Duration, class Pred &gt;
bool wait_until( std::unique_lock&lt;std::mutex&gt;&amp; lock,
                 const std::chrono::time_point&lt;Clock, Duration&gt;&amp; timeout_time,
                 Pred pred );</code></pre>

<p>区别与wait until的是wait_until是取一个时间点</p>

<h2 id="notify%E5%87%BD%E6%95%B0">notify函数</h2>

<p>notify函数分为notify_one以及notify_all</p>

<h3 id="notify_one">notify_one</h3>

<p>notify_one为随机唤醒一个被阻塞的线程（注意为随机）</p>

<h3 id="notify_all">notify_all</h3>

<p>notify_all为唤醒所有的被阻塞的线程</p>

<h3 id="%E6%B3%A8%E6%84%8F">注意</h3>

<p>需要注意的是notify唤醒后如果线程被唤醒后依然不满足继续执行下去的条件那么线程又会被重新堵塞。</p>

<p></p>

<p>小结</p>

<p>本章主要简单讲解了Condition Variable的用法以及途径他是一种可以让项目异步执行的一个操作，使得程序有一个很好得到性能。</p>
