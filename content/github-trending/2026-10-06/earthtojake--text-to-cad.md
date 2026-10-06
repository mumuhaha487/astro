---
title: "earthtojake/text-to-cad"
period: "daily"
date: "2026-10-06T00:00:00+08:00"
description: "text-to-cad 是一个面向 AI 编程代理的 CAD 插件与技能集合，提供本地三维建模、工程图、制造检查及多种 CAD 文件格式的工作流，并支持多个代理应用。"
repository: "earthtojake/text-to-cad"
repository_url: "https://github.com/earthtojake/text-to-cad"
language: "Python"
tags: ["AI","开发工具"]
stars_today: 437
comment: false
---

text-to-cad 是一个面向 AI 编程代理的 CAD 插件与技能集合，提供本地三维建模、工程图、制造检查及多种 CAD 文件格式的工作流，并支持多个代理应用。

## 项目做什么

项目旨在让支持插件或 skills 框架的代理能够调用本地 CAD 工作流。根据 README，代理可依据文字或图像创建、编辑模型，并处理 STEP、STL、3MF、GLB 等格式；此外还覆盖 DXF、机器人描述文件、工程图、制造性分析，以及部分打印和加工服务相关流程。

## 与同类方案相比

README 展示的主要便利在于工作流覆盖面较广，并可集成到 Claude Code、Claude Desktop、Codex、Cursor、Grok Build、Gemini 等环境。模型可通过本地查看器审阅；不同技能还涉及零件检索、图纸生成、打印切片、机器人文件和制造检查。实际效果、易用性及质量表现没有在简介中提供验证数据。

## 设计与创新

项目将代理技能、本地 CAD 服务和浏览器查看器组合起来，并按 CAD、DXF、URDF、SRDF、SDF、DfAM、DFM 等任务拆分工作流。README 还描述了依据测量证据给出制造检查结果等能力。不过，现有材料不足以判断这些设计相较其他工具是否具有独创性或技术优势，也未提供独立评测。

## 适用场景

适用情境包括通过自然语言或图像构建零件模型、导出用于交换或制造的 CAD 文件、制作带尺寸的工程图、准备二维切割轮廓，以及检查打印或钣金、CNC、注塑相关设计问题。机器人开发者也可用于编写 URDF、SRDF、SDF；打印用户可使用切片和 Bambu 打印相关技能。

## 谁会受益

对于希望在代理对话中完成初步建模、文件转换和设计复核的个人或团队，项目提供了从安装技能到本地运行 CAD、查看模型的整合路径。README 给出了多个代理的安装和更新步骤，并说明无插件代理可单独安装技能。它适合辅助设计流程，但材料没有证明其输出可直接替代专业工程审查或制造商验收。

## 使用前需要注意

运行依赖 uv，并需在首次启动时联网下载运行环境；README 指出 Windows 11 开启 Smart App Control 时，OCP 原生模块可能被拦截，可改用 WSL 或关闭该安全功能。不同代理的界面和配置方式不一，部分环境仅提供查看器链接。项目也描述了可选择的匿名使用统计。准确性、性能、兼容范围及生产环境可靠性，单凭 README 尚无法验证。

[查看 GitHub 仓库](https://github.com/earthtojake/text-to-cad)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
