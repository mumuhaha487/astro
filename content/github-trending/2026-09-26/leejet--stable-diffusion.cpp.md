---
title: "leejet/stable-diffusion.cpp"
period: "daily"
date: "2026-09-26T00:00:00+08:00"
description: "该项目基于 ggml 用纯 C/C++ 实现多种扩散模型推理，覆盖 SD、FLUX、Wan、Qwen Image、Z-Image 等图像与视频模型，支持 CPU、CUDA 等多后端，并提供模型格式转换、LoRA、ControlNet 等能力。"
repository: "leejet/stable-diffusion.cpp"
repository_url: "https://github.com/leejet/stable-diffusion.cpp"
language: "C++"
tags: ["AI"]
stars_today: 183
comment: false
---

该项目基于 ggml 用纯 C/C++ 实现多种扩散模型推理，覆盖 SD、FLUX、Wan、Qwen Image、Z-Image 等图像与视频模型，支持 CPU、CUDA 等多后端，并提供模型格式转换、LoRA、ControlNet 等能力。

## 项目做什么

该项目的目标是让扩散模型推理摆脱对 Python 深度学习框架的依赖，用纯 C/C++ 配合 ggml 实现，方式与 llama.cpp 类似。它提供命令行可执行程序，可直接加载 PyTorch checkpoint、Safetensors 或 GGUF 权重并生成图像或视频，同时覆盖模型格式转换、文本编码、采样与解码等环节。它主要面向希望在本地、跨平台、资源受限或嵌入场景中运行各类扩散模型的开发者，也可作为其他语言绑定和图形界面的底层推理后端。

## 与同类方案相比

根据 README，其优势在于纯 C/C++ 与 ggml 实现、轻量且无外部依赖，可在 CPU、CUDA、Vulkan、Metal、OpenCL、SYCL 等后端运行，支持 Linux、macOS、Windows 及通过 Termux 的 Android。它支持 Pytorch checkpoint、Safetensors、GGUF 多种权重格式，并内置转换模式，还提供 LoRA、ControlNet、IP-Adapter、PhotoMaker、LCM、TAESD、ESRGAN、Flash Attention、VAE tiling 等功能。但这些优势均为项目自述，未与竞品做基准对比，实际相对优劣尚无法验证。

## 设计与创新

依据 README，其创新点主要体现在工程整合：以 llama.cpp 式纯 C/C++ 路线承载大量版本各异的扩散模型，并持续宣称对 Qwen-Image-2.1、LTX-2.5、MiniMax-H3、Krea2、Ideogram4、PiD、Lens、Z-Image、FLUX.2 等模型提供 Day-0 或较快支持，还提供内嵌 Web UI、跨平台 RNG 一致性以及将生成参数以 webui 兼容文本写入 PNG 输出。不过 README 未说明其算法层面的原创贡献，也未给出与同类实现的定量比较，因此创新程度尚无法独立验证。

## 适用场景

README 显示其适用于本地命令行生成图像或视频，例如用 sd-cli 加载模型并输入提示词直接出图；也可用于需要将扩散模型嵌入 C/C++ 应用、桌面软件、游戏工具或移动端环境的场景，Android 可通过 Termux 运行。它还可作为其他语言或框架的推理后端，README 列出了 Golang、C#、Python、Rust、Flutter/Dart 等绑定，以及 GIMP 插件、Jellybox、LocalAI、KoboldCpp 等界面或应用集成。此外，模型格式转换与量化、LoRA 和 ControlNet 等能力使其适合定制化生成流程。

## 谁会受益

对希望在非 Python 环境中部署扩散模型、或需要轻量级跨平台推理的开发者，该项目提供了较完整的工具链，包括命令行程序、权重格式转换、多种采样方法以及 LoRA、ControlNet、IP-Adapter 等扩展能力，可减少对庞大深度学习框架的依赖。README 还列出多语言绑定和多个下游界面，说明其具备一定生态整合价值。但项目自述处于活跃开发阶段，API 和命令行选项可能频繁变动，因此更适合能接受接口不稳定的实验、原型或自用部署，生产环境集成需自行评估稳定性。

## 使用前需要注意

README 明确提示项目仍在积极开发中，API 和命令行选项可能频繁变化，这是使用上的主要不确定性。它未给出性能基准、显存或内存占用具体数据，也未说明各后端和平台的成熟度差异，因此实际效率与兼容性无法在此验证。此外，README 未提供许可证信息，也未与同类项目做定量对比，其宣称的模型支持和 Day-0 特性缺少独立验证。部分功能如 tokenizer 只支持 token 权重，并非 stable-diffusion-webui 的全部特性；Docker、量化、缓存等进阶内容需查阅未在本文档展开的链接。

[查看 GitHub 仓库](https://github.com/leejet/stable-diffusion.cpp)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
