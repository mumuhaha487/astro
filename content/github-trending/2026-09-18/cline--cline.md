---
title: "cline/cline"
period: "daily"
date: "2026-09-18T00:00:00+08:00"
description: "Cline 是一个开源编码智能体，提供 SDK、IDE 插件、桌面应用与 CLI 等多种形态，可在编辑器和终端中读写代码、执行命令，并接入多家模型与 MCP 工具。"
repository: "cline/cline"
repository_url: "https://github.com/cline/cline"
language: "TypeScript"
tags: ["AI","开发工具"]
stars_today: 380
comment: false
---

Cline 是一个开源编码智能体，提供 SDK、IDE 插件、桌面应用与 CLI 等多种形态，可在编辑器和终端中读写代码、执行命令，并接入多家模型与 MCP 工具。

## 项目做什么

Cline 的目标是让开发者用自然语言驱动智能体完成实际编码工作：读取项目结构、理解文件之间的关联、跨文件修改代码、在终端执行命令、运行测试并修复编译或语法错误。它通过 Plan 与 Act 两种模式工作，先在 Plan 模式下探索代码库、提出澄清问题并给出策略，达成一致后再切换到 Act 模式执行；每次文件编辑和终端命令默认需要用户批准，从而把最终改动控制权留在开发者手中。同时，它把同一套引擎以 SDK 形式开放，供开发者构建自定义智能体与集成。

## 与同类方案相比

README 列出的特点包括：分发形态多样，同一引擎覆盖 CLI、VS Code 扩展、JetBrains 插件、桌面应用和 SDK；模型选择开放，支持 Anthropic、OpenAI、Google、OpenRouter、Vercel AI Gateway、AWS Bedrock、Azure 与 GCP Vertex、Cerebras、Groq，以及 Ollama、LM Studio 等本地模型和任意 OpenAI 兼容接口；改动以 diff 呈现并带检查点，可审阅、修改或回退；支持用 .clinerules 定义项目规则，并可用 skills 让模型按需加载具体规则；可通过代码插件或 MCP 服务器扩展工具能力。以上均为功能清单，README 未给出性能、准确率或成本方面的对比数据。

## 设计与创新

README 中可视为差异化设计的有：用同一个 agent 核心驱动 CLI、桌面应用、IDE 插件与 SDK；同时提供代码级插件系统与 MCP 两条扩展路径；支持多智能体团队，由协调者拆分任务并委派给拥有各自工具与上下文的专家智能体，团队状态跨会话持久；支持以 cron 定时运行的智能体，独立于终端会话；可把 Telegram、Slack、Discord、Google Chat、WhatsApp、Linear 等会话线程映射为带完整上下文的 agent 会话，并设置访问控制。这些能力是否为首创、与同类项目相比是否有实质差异，README 未提供依据，尚无法验证。

## 适用场景

适用场景包括：在 VS Code 或 JetBrains 中做日常编码、跨文件重构以及导入缺失、类型不匹配、语法错误等问题的修复；在终端以交互或 headless 方式批处理任务，例如运行测试并修复失败、审查 git diff、列举 TODO 注释；接入 CI/CD 流水线，通过管道输入与 JSON 输出串联命令；用 cron 定时执行 PR 汇总、依赖检查、代码库健康报告等重复性工作；经由 Slack、Telegram、Discord 等平台远程触发和跟进任务；用 SDK 注册自定义工具、生命周期钩子，或编排多智能体流程；对数据敏感的团队可改用本地模型运行。

## 谁会受益

对个人开发者，它把读代码、改代码、跑命令、修错误串成一条可审核的流程，减少在编辑器和终端之间来回切换的成本，检查点也便于回退。对团队，.clinerules 与 skills 可把编码规范、架构约定、测试与部署流程固化下来，使不同成员、不同入口的行为保持一致。对平台或工具建设者，SDK 提供了复用同一引擎、注册自定义工具和多智能体编排的途径，可用于构建内部自动化。对需要审计的场景，插件可挂载生命周期钩子做日志记录与策略约束。其实际收益取决于所选模型质量与任务复杂度，README 未提供量化效果，需要自行评估。

## 使用前需要注意

README 明确说明 JetBrains 插件目前未开源；VS Code 扩展代码仍在向仓库根目录迁移，处于进行中状态；桌面应用仅提供 macOS 与 Windows 版本。文档未给出性能、准确率、延迟或成本方面的基准数据，也未与其他工具做可验证的对比，因此相关优势无法证实。自动批准模式意味着智能体可自主修改文件并执行命令，存在误操作风险，文档建议保持人类在环。使用需自行配置模型与 API 凭据，本地模型还需额外算力。定时任务与消息平台连接依赖外部服务和令牌。许可证信息来自 README 的 Apache 2.0 声明，具体条款应以仓库 LICENSE 文件为准。

[查看 GitHub 仓库](https://github.com/cline/cline)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
