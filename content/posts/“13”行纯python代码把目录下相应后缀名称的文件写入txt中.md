---
title: “13”行纯python代码把目录下相应后缀名称的文件写入txt中
published: 2023-06-02
tags: [python,开发语言,opencv,数据挖掘,YOLO]
category: python

---

<!--more-->

<p>如标题</p>

<p>可以用于yolo项目中所需要的写入图片的绝对路径那一个环节</p>

<p>也可以用于其他的情况（博主想不出来）</p>

<pre>
<code class="language-python">import os
file_name_1=input('输入要创建准备写入txt的的文件名称：')
file_1=open(f'{file_name_1}.txt',mode='w',encoding='utf-8')
path_1=input('输入图片的路径： ')
type_1=input('输入写入txt的文件后缀名称：')
sum1s=os.listdir(path_1)
# 把文件输入的路径下的文件遍历
for sum1 in sum1s:
    sum2=os.path.splitext(sum1)
    #判断后缀名称是不是输入类型的（sum2[1]为输入类型的后缀名）
    if sum2[1]==f'.{type_1}':
        sum3=os.getcwd()
        sum5=f'{sum3}{sum1}'
        file_1.writelines(f'{sum5}\n')
        print(f'已写入     {sum5}到{file_name_1}.txt中')
</code></pre>

<p></p>

<p></p>
