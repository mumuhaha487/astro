---
title: "Fission-AI/OpenSpec"
period: "daily"
date: "2026-09-20T00:00:00+08:00"
description: "OpenSpec 是面向 AI 编程助手的规格驱动开发框架，把提案、规格、设计与任务以 Markdown 文档存入仓库，让开发者与 AI 先对齐需求再编码。"
repository: "Fission-AI/OpenSpec"
repository_url: "https://github.com/Fission-AI/OpenSpec"
language: "TypeScript"
tags: ["开发工具","AI"]
stars_today: 464
comment: false
---

OpenSpec 是面向 AI 编程助手的规格驱动开发框架，把提案、规格、设计与任务以 Markdown 文档存入仓库，让开发者与 AI 先对齐需求再编码。

## 项目做什么

项目目的是为 AI 编程助手补上一层轻量的规格层：当需求只存在于聊天历史中时，生成结果难以预测，OpenSpec 让开发者与 AI 先就要构建什么达成一致，再开始写代码。它按变更组织产物，每个变更一个文件夹，内含提案、规格、设计与任务清单，并通过 /opsx 系列命令（explore、propose、apply、archive 等）驱动规划、实施与归档。此外还提供处于 beta 的 Stores，用于在独立仓库中集中维护被多个代码库共享的规格。

## 与同类方案相比

README 自述的优势包括：产物是纯 Markdown，不需要学习特殊语法，由 AI 生成、由人评审；工作流被描述为流动而非刚性，任一产物都可随时修改，没有严格的阶段闸门；面向存量（brownfield）项目而不只是新项目；官方称支持三十余种 AI 助手并以斜杠命令方式集成；除 npm 外也兼容 pnpm、yarn、bun 与 nix 安装。文档称其可从个人项目扩展到企业规模。但这些表述属于项目自述，缺少独立基准或第三方评估佐证，实际的易用程度与团队协作收益在本解读中无法验证。

## 设计与创新

README 提出的创新点集中在工作流形态与跨仓库规划：一是所谓产物引导的工作流，用 /opsx:explore 与 /opsx:propose 生成提案、规格、设计与任务四类文档，再由 /opsx:apply 与 /opsx:archive 推进和归档；二是处于 beta 的 Stores，把同一 openspec 目录结构放在独立仓库中，通过 git 推送共享，使一个变更的计划可跨越 API、Web 与共享库等多个代码库；三是社区 schema 包机制，允许第三方以独立仓库分发带有倾向性的工作流。README 还声称相比 GitHub 的 Spec Kit 更轻量、相比 AWS 的 Kiro 不锁定 IDE 与模型，这些对比由项目方自述，未提供可核验的测量数据，本解读无法确认。

## 适用场景

README 给出的典型场景包括：尚未想清楚要做什么时，用 /opsx:explore 让 AI 阅读现有代码、权衡方案并形成计划；目标明确时直接用 /opsx:propose 生成变更产物；实施阶段用 /opsx:apply 按任务清单推进，完成后用 /opsx:archive 归档并更新规格。团队场景中，一个特性可能横跨 API 服务、Web 应用与共享库，需求由一个团队拥有、其他团队只读引用，且规划要先于代码存在，此时可用 beta 的 Stores 在独立仓库中维护单一事实来源。README 另提到面向存量代码库的接入方式以及多语言支持。

## 谁会受益

对使用 AI 编程助手的个人或团队，OpenSpec 的实际价值在于把意图与约束写成可审阅的文档，使提示不再仅依赖对话历史；变更按文件夹留痕，归档后形成可追溯的记录，便于回顾与交接。使用路径上，它通过 npm 全局安装，用 openspec init 在项目内初始化，用 openspec update 刷新代理指令；命令有 CLI 与各工具对应的斜杠命令两种入口，README 称初始化时会打印所选工具的正确调用形式。README 还说明项目自身用 OpenSpec 开发，仓库内的 specs 与 changes 目录可作为真实用例参考。这些收益最终取决于使用者维护规格文档的程度。

## 使用前需要注意

README 显露的约束包括：需要 Node.js 20.19.0 或更高版本；官方建议使用高推理模型并保持干净的上下文窗口，说明对模型能力与上下文管理存在依赖；Stores 仍处于 beta，接口与用法可能变动。规格文档由 AI 生成、由人评审，其准确性与完整性取决于模型和审阅者，项目未提供准确性或效率方面的量化数据。遥测默认开启，需要通过配置项或环境变量显式关闭。关于相比 Spec Kit、Kiro 等方案更轻量、更灵活的说法属于项目自述，缺乏第三方对比数据，本解读无法验证；给定信息中也没有性能指标、缺陷率或企业落地案例可供核实。

[查看 GitHub 仓库](https://github.com/Fission-AI/OpenSpec)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
