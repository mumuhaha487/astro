---
title: 用python实现划分自定义划分训练集，测试集和验证集
published: 2023-06-03
tags: [数学建模,python,开发语言,YOLO,numpy]
category: python
---

<!--more-->

<p>用于yolo自定义分配训练集测试集以及验证集</p>

<pre>
<code class="language-python"># coding:utf-8

import os
import numpy as np
import random

print("输入接下来各个集合所占的比例(一般为0.8:0.1:0.1）:")
train_percent=input("输入训练集所占的比例:")
train_percent=float(train_percent)
test_percent=input("输入测试集所占的比例:")
test_percent=float(test_percent)
val_percent=input("输入验证集所占的比例:")
val_percent=float(val_percent)

#创建文件
if not os.path.exists('./path'):
    os.mkdir('./path')
file_train=open('./path'+'/train.txt',mode='w')
file_test=open('./path'+'/test.txt',mode='w')
file_val=open('./path'+'/val.txt',mode='w')


path_images=input("输入训练所需图片的路径:")
# path_Annotations=input("输入训练所需标注集的路径:")
file_images_real=np.empty([0,2])
train_images=os.listdir(path_images)

#计算各个训练集的长度
len_images=len(train_images)
len_train=len_images*train_percent
len_train=int(len_train)
len_test=len_images*test_percent
len_test=int(len_test)
len_val=len_images*val_percent
len_val=int(len_val)


for train_image in train_images:
    file_name=os.path.splitext(train_image)
    if file_name[1]=='.jpg' or file_name[1]=='.png':
        file_images_real=np.append(file_images_real,[file_name],axis=0)


# file_images_real=np.reshape(file_images_real,(-1,2))
#改形状也行


#开始分配数据
train_counts=random.sample(range(0,len_images),len_train)
test_counts=random.sample(range(0,len_images),len_test)
val_counts=random.sample(range(0,len_images),len_val)

#写入数据
for train_count in train_counts:
    file_train.writelines(f'{file_images_real[train_count][0]}\n')

for test_count in test_counts:
    file_test.writelines(f'{file_images_real[test_count][0]}\n')

for val_count in val_counts:
    file_val.writelines(f'{file_images_real[val_count][0]}\n')


file_train.close()
file_test.close()
file_val.close()
</code></pre>

<p></p>

<p></p>
