---
title: "mvschwarz/openrig"
period: "daily"
date: "2026-09-29T00:00:00+08:00"
description: "OpenRig 是一个基于 TypeScript 的本地多智能体管理工具，以 tmux 为基础，用 YAML 定义智能体团队拓扑，启动并协调 Claude Code 和 Codex 等编程智能体，提供 CLI、TUI 和 MCP 接口，将零散终端会话组织为持久化团队。"
repository: "mvschwarz/openrig"
repository_url: "https://github.com/mvschwarz/openrig"
language: "TypeScript"
tags: ["AI","开发工具"]
stars_today: 734
comment: false
---

OpenRig 是一个基于 TypeScript 的本地多智能体管理工具，以 tmux 为基础，用 YAML 定义智能体团队拓扑，启动并协调 Claude Code 和 Codex 等编程智能体，提供 CLI、TUI 和 MCP 接口，将零散终端会话组织为持久化团队。

## 项目做什么

OpenRig 的核心目的是把多个编程智能体从分散的终端会话整合成一个可管理的团队系统。它允许用户通过 YAML 格式的 RigSpec 声明式地定义包含 pods、edges 和连续性策略的智能体拓扑，然后使用 rig up 命令一键启动所有相关会话、运行时和启动文件，并通过 TUI 监控整体状态。用户可以与 lead agent 沟通期望结果，由 lead agent 协调跨团队的专家智能体，将需要人工关注的结果和决策带回。项目还提供发现并纳管已有 Claude Code 和 Codex 会话的能力，以及对运行中的拓扑进行增长、收缩、快照和恢复等操作，目标是将 AI 编程智能体从终端混乱中解放出来，形成有组织、可持久运行的团队。

## 与同类方案相比

OpenRig 的主要优势在于统一管理异构智能体运行时。它能够同时运行原生 Claude Code 和 Codex 会话，并通过 tmux 会话提供可附着、可检查的底层终端，同时提供 CLI、TUI 和 MCP 三层接口供人类和智能体自身使用。项目内置多种启动模板，如 first-project、product-team、conveyor、implementation-pair、adversarial-review、research-team 和 secrets-manager，覆盖不同规模和用途的团队配置。它还支持通过 rig discover 发现已有 tmux 会话并 adopt 纳管，通过快照和恢复保持状态持久化，通过 RigBundle 分享便携式拓扑归档。这些功能共同减少了手动管理多个终端会话的负担，但具体的效率提升幅度尚未在文档中量化。

## 设计与创新

OpenRig 的一个可识别创新点是将“执行权限模式”与“工作姿态”分离，并通过 rig policy 和 rig seat set-permissions 提供带审计的权限选择，且明确说明选择权限不会重新启动座位或改变当前原生进程。另一个特点是文化文件机制，通过 CULTURE.md 为不同类型的 rig 设定协调规范，例如研究型 rig 使用探索性文化，实现型 rig 使用保守、信任但验证的文化。此外，项目将智能体管理的实际软件（如 secrets-manager 中的 HashiCorp Vault）与智能体本身打包在同一 rig 中，由专家智能体操作。多运行时适配器体系以及终端提供者抽象（herdr、cmux）也体现了架构上的可扩展设计。但这些创新点尚未与同类工具进行过直接比较验证。

## 适用场景

OpenRig 适用于需要在单一系统中协调多个编程智能体的开发场景。典型场景包括：从单个仓库的一个有界变更开始，通过 first-project 启动两个座位（owner 和 checker），由 owner 实现、checker 审查并记录结果；在 product-team 中运行两个协调器、实现、QA、设计和两个独立审查者的较大产品团队；使用 conveyor 展示四个座位的混合 Claude Code 与 Codex 从接入、规划、构建到审查的交接路径；在 implementation-pair 和 adversarial-review 中分别进行配对实现和对抗式审查；在 research-team 中进行探索性研究；以及在 secrets-manager 场景中由一个专家智能体管理 HashiCorp Vault 实例。当用户需要发现并纳管已有的 tmux 会话，或对运行中的拓扑进行扩展与收缩时，也同样适用。

## 谁会受益

OpenRig 的实用价值体现在多个方面。它为多智能体协作提供了结构化的地址体系，例如 dev-owner@first-project 这样的稳定座位地址，使任务分发和消息传递有明确的落点。通过 rig send、rig broadcast、rig chatroom 等命令，用户和智能体可以在团队内进行有记录的通信，并可通过队列跟踪任务的归属和状态。TUI 提供拓扑图、表格视图、座位详情、Specs、Projects、Terminals、Feed 和 System 等界面，帮助用户理解团队整体协调状态。内置的多个启动模板降低了从零配置多智能体团队的门槛。对于需要长时间运行和跨重启恢复的场景，快照与恢复机制以及发现并纳管已有会话的能力提供了实际的操作连续性。

## 使用前需要注意

OpenRig 的局限在 README 中已有明确说明。运行环境要求 Node.js 22 或 24 以及 tmux，仅支持 macOS 和 Linux，原生 Windows 尚未支持，WSL2 未经测试。在 Apple 芯片的 Mac 上建议使用 Node.js 22，存在已知的兼容性限制。安装和启动会写入 provider 钩子、工作区信任设置、tmux 配置、Claude 和 Codex 的配置文件以及活动中继钩子，可能替换现有的信任条目、选定资源键和 Claude 的状态行命令，且并非所有写入都有交互式预览，因此建议备份相关文件。内置引导不会添加 rig 命令允许规则，权限配置需要用户自行选择。YOLO 默认关闭。此外，文档未提及性能指标、与竞品的直接比较或未公开功能的验证结果，这些方面尚无法评估。

[查看 GitHub 仓库](https://github.com/mvschwarz/openrig)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
