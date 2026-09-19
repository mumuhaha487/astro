---
title: "PrismML-Eng/Bonsai-demo"
period: "daily"
date: "2026-09-20T00:00:00+08:00"
description: "Bonsai-demo 用脚本封装本地大模型运行：下载权重与 fork 版 llama.cpp 二进制，在 Mac、Linux、Windows 或 CPU 上启动对话与推理。"
repository: "PrismML-Eng/Bonsai-demo"
repository_url: "https://github.com/PrismML-Eng/Bonsai-demo"
language: "Shell"
tags: ["其他"]
stars_today: 335
comment: false
---

Bonsai-demo 用脚本封装本地大模型运行：下载权重与 fork 版 llama.cpp 二进制，在 Mac、Linux、Windows 或 CPU 上启动对话与推理。

## 项目做什么

仓库定位是演示与本地部署工具，而不是模型本身。它通过 setup.sh 与 setup.ps1 自动检查系统依赖、安装 uv、创建 Python 虚拟环境、从 HuggingFace 拉取公开权重，并获取 PrismML fork 的预编译 llama.cpp 二进制；macOS 上还会从源码构建 MLX fork 并安装 mlx-lm、torch、transformers 等依赖。默认下载 Bonsai 2 27B 的 PQ2_0 打包（约 7.8 GB，含视觉投影器），可选安装 Open WebUI 与包含 Jupyter、pandas、numpy 等库的代码解释器环境。另外提供 run_llama.sh、start_llama_server.sh、run_mlx.sh 等脚本分别驱动 llama.cpp 与 MLX 两条后端路径。

## 与同类方案相比

README 自述的优势集中在体积与能力平衡：Bonsai 2 27B 以三元权重约 5.9 GB 运行在笔记本或单张 GPU 上，声称保留 98.2% 的 FP16 智能，数学成绩与全精度相差半个点以内、编码水平与基线持平；支持 262K 令牌上下文、图片与 PDF 等视觉输入、OpenAI 风格 tool_calls 与 MCP 服务器，并可按会话选择推理强度。PTQ1_0 为每权重 1.75 比特，PQ2_0 以多出 1.3 GB 换取更快的提示处理。平台覆盖 Metal、CUDA、Vulkan、ROCm 与纯 CPU，且提供 24 个环境变量用于调节 GPU 卸载层数、上下文长度、KV 缓存位宽与投机解码。上述性能数字均来自仓库自述，未在 README 中给出来源与复现条件，无法独立核实。

## 设计与创新

从 README 可见的技术点包括：1-bit 与三元量化权重格式 Q1_0、Q2_0 及自有打包 PTQ1_0、PQ2_0，其中 PQ2_0 使用分组 128，另一条线使用官方分组 64 格式；Bonsai 2 依赖 Hadamard（FWHT）激活变换，该变换尚未进入上游，需要 fork 二进制；混合注意力骨干被用来说明长上下文在设备端的可行性；投机解码使用 dspark 草稿模型（约 0.6 GB 侧车文件）；MLX 侧提供 1-bit 与 2-bit 权重。1-bit 的 Q1_0 已完整并入主线上游 llama.cpp，三元 Q2_0 也已支持主线 CPU、Metal、Vulkan、CUDA。至于这些设计相对其他量化或推理方案的创新程度，README 未提供对照实验，因此尚无法验证。

## 适用场景

适合希望在个人 Mac（Apple Silicon）、装有单张 GPU 的 Linux 或 Windows 机器，乃至纯 CPU 环境上离线体验和测试 Bonsai 系列模型的用户；适合用 Open WebUI 做集成本地代码解释器与 MCP 工具的智能体演示；适合在 27B、8B、4B、1.7B 各尺寸与 1-bit、三元两个家族之间做量化档位的横向试用，环境变量 BONSAI_FAMILY 与 BONSAI_MODEL 组合即切换；适合通过 BONSAI_NGL、BONSAI_CTX、BONSAI_KV4、BONSAI_SPECULATIVE 调整显存占用与解码策略；也适合把本机实测结果提交到 community-benchmarks 目录。不建议把该演示脚本直接当作生产部署方案。

## 谁会受益

对不想自行编译推理框架、只想尽快跑起量化大模型的用户，这个仓库价值较直接：一条命令串起系统依赖、Python 环境、模型权重与推理二进制，并同时给出 llama.cpp 与 MLX 两条可选路径，还提供 AGENTS.md 指导编码代理代为配置，以及针对 24 个环境变量的完整参考文档。对研究者与工程人员，多种尺寸与打包格式的并存也便于比较不同量化设置下的行为。但默认依赖 fork 二进制、下载体积较大（含 Open WebUI 与代码解释器时会再多数 GB），且 README 中的能力与性能声明缺少第三方验证，实际收益需要在本机重测；上游合并状态处于变化中，文档中的状态描述可能随版本推移而过时。

## 使用前需要注意

主要限制来自二进制兼容性：Bonsai 2 使用的 PQ2_0 与 PTQ1_0 在官方 llama.cpp 上会被直接拒绝，Q2_0 虽能加载但输出乱码，必须使用 PrismML fork 的 llama.cpp 二进制；MLX 1-bit 支持仍 pending 上游 mlx#3161，需要 fork。已废弃的 legacy Q2_0（文件名不含 g64）仅旧版 prism-v5 二进制可读。安装方面，setup 默认拉取约 7.8 GB 权重，叠加 Open WebUI 与代码解释器会显著增加磁盘占用与等待时间。README 没有给出许可证、最低硬件要求、正式评测方法与错误率数据，98.2% 智能保留等指标无法核实；速度基准来自社区提交目录，覆盖范围与测试条件有限；上游 PR 状态随开发推进变动，文档结论存在时效风险。

[查看 GitHub 仓库](https://github.com/PrismML-Eng/Bonsai-demo)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
