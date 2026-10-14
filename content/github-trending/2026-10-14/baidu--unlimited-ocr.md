---
title: "baidu/Unlimited-OCR"
period: "daily"
date: "2026-10-14T00:00:00+08:00"
description: "Unlimited-OCR 是百度发布的文档 OCR 与解析模型项目，提供单图、多图及 PDF 页面的推理示例，并支持通过 Transformers、vLLM 和 SGLang 等方式部署或调用。"
repository: "baidu/Unlimited-OCR"
repository_url: "https://github.com/baidu/Unlimited-OCR"
language: "Python"
tags: ["AI"]
stars_today: 225
comment: false
---

Unlimited-OCR 是百度发布的文档 OCR 与解析模型项目，提供单图、多图及 PDF 页面的推理示例，并支持通过 Transformers、vLLM 和 SGLang 等方式部署或调用。

## 项目做什么

项目目标是对文档图像进行 OCR 和解析，README 将其定位为面向长流程、多页内容的 one-shot parsing。示例展示了单张图片推理、多张页面联合解析，以及先将 PDF 页面转换为图片再处理的工作流程；具体解析能力和输出质量仍需结合模型与评测材料验证。

## 与同类方案相比

README 给出了较完整的上手路径，包括 Python 依赖版本、模型加载与推理代码、图片和多页输入配置，以及 PDF 转图示例。它还列出 vLLM 和 SGLang 的部署方式，并提供并发批处理脚本入口，方便不同使用方式的开发者参考；这些是文档明确展示的接入选项，不代表已验证的速度或成本优势。

## 设计与创新

项目名称和介绍强调 long-horizon parsing，并提供多页图像输入及联合解析示例，可视为其面向长文档场景的设计重点。README 表示项目希望在 DeepSeek-OCR 基础上进一步推进，但没有在所给内容中充分说明方法细节、实验结果或相对基线的改进，因此创新程度及比较优势尚无法独立验证。

## 适用场景

从 README 的调用示例看，适用输入包括单张文档图片、多页图片列表和 PDF 文档；PDF 需先逐页渲染为图片，再交给多页推理接口。项目还提供针对图片目录和 PDF 的批处理脚本，以及 OmniDocBench 后处理示例，可供文档数字化、页面内容抽取和评测流程集成时参考。

## 谁会受益

对希望试用文档 OCR 模型或搭建解析流程的开发者，仓库提供了从模型加载、输入准备到推理服务调用的具体示例，并列出 Hugging Face、ModelScope、百度云及 Hugging Face Spaces 等相关入口。其配置说明也便于了解不同推理框架的接入要求，但实际效果、资源需求和生产环境适配情况需要自行测试。

## 使用前需要注意

README 给出的 Transformers 环境针对 NVIDIA GPU，并列出特定 Python、CUDA 和依赖版本；多页及 PDF 示例要求准备页面图像，PDF 转换还涉及分辨率设置。所给材料没有呈现可核验的准确率、吞吐量、硬件需求基准或完整的质量边界，也未提供许可证信息；因此性能、适用范围、授权条件及与其他模型的优劣尚不能据此确定。

[查看 GitHub 仓库](https://github.com/baidu/Unlimited-OCR)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
