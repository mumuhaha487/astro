---
title: "deepseek-ai/DeepGEMM"
period: "daily"
date: "2026-10-07T00:00:00+08:00"
description: "DeepGEMM 是面向 NVIDIA GPU 的 CUDA 张量核心内核库，汇集多种 GEMM、MoE、索引器评分及相关计算，并通过 DeepJIT 在运行时编译内核。"
repository: "deepseek-ai/DeepGEMM"
repository_url: "https://github.com/deepseek-ai/DeepGEMM"
language: "Cuda"
tags: ["开发工具"]
stars_today: 199
comment: false
---

DeepGEMM 是面向 NVIDIA GPU 的 CUDA 张量核心内核库，汇集多种 GEMM、MoE、索引器评分及相关计算，并通过 DeepJIT 在运行时编译内核。

## 项目做什么

项目旨在为现代大语言模型常见计算提供统一的 GPU 内核实现，包括 FP8、FP4、BF16 矩阵乘法、分组 GEMM、MoE 计算，以及用于 lightning indexer 的 MQA 评分等。它也面向内核学习与开发，README 将其定位为核心函数数量有限、便于了解 NVIDIA GPU 内核优化概念的代码库。

## 与同类方案相比

README 所述的特点包括运行时 JIT 编译、安装时无需进行 CUDA 内核编译，以及将多类计算原语集中在同一 CUDA 代码库中。接口涵盖连续与掩码分组 GEMM、索引器的非分页和分页评分，以及融合通信与计算的 Mega MoE。文档还列出 JIT 缓存、编译诊断、布局转换和调试配置等工具。性能优势仅有 README 的概括性陈述，缺少此处可独立核验的完整比较数据。

## 设计与创新

从 README 可确认的设计重点是用统一代码库覆盖多种 LLM 计算，并以 DeepJIT 在运行时编译内核；Mega MoE 将专家并行 dispatch、两层线性计算、SwiGLU 和 combine 融合，并尝试重叠 NVLink 通信与张量核心计算。项目还针对 MoE 提供按 M 轴分组及掩码布局接口。相较其他库的创新程度或独特性，现有材料不足以验证。

## 适用场景

适用场景包括 NVIDIA GPU 上的稠密 GEMM、MoE 训练前向与权重反向、推理预填充和解码，以及 DeepSeek v3.2 lightning indexer 的 MQA 评分。Mega MoE 面向多进程专家并行执行，并要求对称内存；掩码分组 GEMM则面向 CUDA Graph 场景下 CPU 不知道各专家 token 数量的解码流程。实际使用还需匹配支持的 GPU 架构、数据布局和输入格式。

## 谁会受益

对于需要调用或研究 GPU 矩阵运算及 LLM 专用内核的开发者，项目提供 Python 接口、示例入口和较细的布局与缩放因子要求说明，可用于集成特定计算或理解其实现组织方式。DeepJIT 配置支持查看编译命令、PTX/SASS 和缓存设置，也有助于调试与分析。具体收益取决于硬件、形状和工作负载，README 信息不能替代目标环境上的验证。

## 使用前需要注意

项目要求 NVIDIA SM90 或 SM100 GPU、CUDA Toolkit 12.9 及以上、PyTorch 2.3 及以上和 CUTLASS 4.0 及以上，并要求 C++20 format 支持；Mega MoE 另有多进程与对称内存要求。部分布局和缩放因子格式按架构不同，输入转置、FP8 转换等操作需用户自行处理。README 没有充分提供各接口覆盖范围、边界条件及可复现对比数据，因此移植性、易用性和实际性能仍需按具体环境评估。

[查看 GitHub 仓库](https://github.com/deepseek-ai/DeepGEMM)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
