---
title: 只用纯python实现一次函数的梯度下降
published: 2023-05-19
tags: [python,numpy,机器学习]
category: 机器学习
---

<!--more-->

<h1></h1>

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E4%BB%A3%E7%A0%81%EF%BC%9A-toc" style="margin-left:0px;"><a href="#%E4%BB%A3%E7%A0%81%EF%BC%9A">代码：</a></p>

<p id="%E6%88%96%E8%80%85%E5%8F%AF%E4%BB%A5%E7%94%A8%E5%AF%BC%E6%95%B0%E7%9A%84%E5%AE%9A%E4%B9%89%E6%9D%A5%E6%B1%82-toc" style="margin-left:0px;"><a href="#%E6%88%96%E8%80%85%E5%8F%AF%E4%BB%A5%E7%94%A8%E5%AF%BC%E6%95%B0%E7%9A%84%E5%AE%9A%E4%B9%89%E6%9D%A5%E6%B1%82">或者可以用导数的定义来求</a></p>

<p id="%E5%8F%AF%E8%83%BD%E5%87%BA%E7%8E%B0%E7%9A%84%E9%97%AE%E9%A2%98-toc" style="margin-left:40px;"><a href="#%E5%8F%AF%E8%83%BD%E5%87%BA%E7%8E%B0%E7%9A%84%E9%97%AE%E9%A2%98">可能出现的问题</a></p>

<p id="%E5%AE%89%E8%A3%85%E5%85%B6%E4%BB%96%E7%9A%84%E5%BA%93-toc" style="margin-left:0px;"><a href="#%E5%AE%89%E8%A3%85%E5%85%B6%E4%BB%96%E7%9A%84%E5%BA%93">安装其他的库</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E4%BB%A3%E7%A0%81%EF%BC%9A">代码：</h1>

<pre>
<code>#一次函数

import matplotlib.pyplot as plt     #导入库
import numpy as np
def f_shunshi():                    #损失函数（没用到）
    return np.sum(1.0/2.0*(f_w*Sum_shuju_X+f_b-Sum_shuju_Y)*(f_w*Sum_shuju_X+f_b-Sum_shuju_Y)/10)
def f_daoshu_w():               #关于一次函数w（斜率）的偏导
    return np.sum(f_w*(f_w*Sum_shuju_X+f_b-Sum_shuju_Y))/10

def f_daoshu_b():               #关于一次函数b（偏移量）的偏导
    return np.sum(f_w*Sum_shuju_X+f_b-Sum_shuju_Y)/10

xuexilv=1e-2               #学习率
f_w=1.0                       #函数初始参数
f_b=1.0
print("输入10个数据")
Sum_shuju=np.empty([0,2],dtype=float)   #创建一个大数据用来存放x和y）
shuju=np.array([])          #临时参数
for i in range(0, 10):      #插入10个数据（可变）
    print(f"第 {i + 1}个数据")
    x1 = input("输入x:")
    x1=float(x1)
    shuju=np.append(shuju,x1)
    y1 = input("输入y:")
    y1=float(y1)
    shuju=np.append(shuju,y1)
    Sum_shuju=np.append(Sum_shuju,[shuju],axis=0)
    shuju = np.array([])

print("数据")
print(Sum_shuju)        #验证数据有无插入错误

x=input("是否设置函数初始参数：0/是；1/否（默认w=1，b=1）:")
if x==0:
    f_w=input("输入w（斜率）:")
    f_w=float(f_w)
    f_b=input("输入b（偏移量）")
    f_b=float(f_b)

Sum_shuju_X=Sum_shuju[:,0]
Sum_shuju_Y=Sum_shuju[:,1]      #把x与y提取到两个数组
sum_1=input("设置迭代次数：")
sum_1=int(sum_1)
print(f"w的值为:{f_w}")
print(f"b的值为:{f_b}")
f_w_sum=np.array([])
tidu=np.array([])
for i in range(0,sum_1):        #开始迭代
    f_w2=f_w-xuexilv*f_daoshu_w()
    f_b2=f_b-xuexilv*f_daoshu_b()
    f_w=f_w2
    f_b=f_b2
    print(f"w的值为:{f_w}")
    print(f"b的值为:{f_b}")
    print("********************************************************************")

x_1=range(0,10)     #直观的开始验证图形与数据是否拟合

plt.plot(Sum_shuju_X,Sum_shuju_Y,'x',x_1,f_w*x_1+f_w,'b-.')
plt.show()  #图来喽！！！！</code></pre>

<p></p>

<p>可以稍微改一改求二次类推，前提知道损失函数的导数</p>

<h1 id="%E6%88%96%E8%80%85%E5%8F%AF%E4%BB%A5%E7%94%A8%E5%AF%BC%E6%95%B0%E7%9A%84%E5%AE%9A%E4%B9%89%E6%9D%A5%E6%B1%82">或者可以用导数的定义来求</h1>

<pre>
<code>def f_diuda0(f,x):
    e=1e-6    #足够小的数
    return (f(x+e)-f(x))/e</code></pre>

<h2 id="%E5%8F%AF%E8%83%BD%E5%87%BA%E7%8E%B0%E7%9A%84%E9%97%AE%E9%A2%98">可能出现的问题</h2>

<p>求导思想大概是这个思想，但是会不会出问题就不敢保证了</p>

<p>（比如e还是太大了，函数有多个参传过去会报错之类的【不过可以在函数中调用另一个函数也行】）</p>

<h1 id="%E5%AE%89%E8%A3%85%E5%85%B6%E4%BB%96%E7%9A%84%E5%BA%93">安装其他的库</h1>

<p>或者可以安装教程来应用其他的库来求偏导（但是这与标题不符去掉了）</p>

<p></p>

<pre>
<code class="hljs">ba06ee60-62c4-4a0e-811a-82fd55782098</code></pre>

<p></p>
