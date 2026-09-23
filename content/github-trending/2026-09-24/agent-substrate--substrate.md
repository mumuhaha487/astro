---
title: "agent-substrate/substrate"
period: "daily"
date: "2026-09-24T00:00:00+08:00"
description: "Agent Substrate 是 Go 编写的智能体执行运行时，通过将大量空闲 actor 复用到少量 worker 上实现高密度沙箱与快速挂起恢复，并借助 Kubernetes 提供基础设施管理。"
repository: "agent-substrate/substrate"
repository_url: "https://github.com/agent-substrate/substrate"
language: "Go"
tags: ["AI"]
stars_today: 560
comment: false
---

Agent Substrate 是 Go 编写的智能体执行运行时，通过将大量空闲 actor 复用到少量 worker 上实现高密度沙箱与快速挂起恢复，并借助 Kubernetes 提供基础设施管理。

## 项目做什么

该项目旨在为自主智能体类应用提供大规模执行环境。它把较多 actor（如智能体应用）映射到较少就绪 worker 上，并提供 actor 的创建销毁、挂起恢复、实时分配与流量路由功能。它明确不是构建智能体的 SDK，而是运行它们的系统，工作负载不限于 AI 智能体，但以这类应用为主要目标场景。系统依赖 Kubernetes 完成基础设施供给和 worker 生命周期管理，并在其上增加面向智能体的调度与控制以降低延迟。

## 与同类方案相比

根据 README，其优势包括默认安全设计、支持数百万沙箱、相较标准容器运行时更高密度、亚 500 毫秒恢复、每秒超过 500 次挂起恢复、原生零信任内核与网络隔离，并同时支持 microVM 与 gVisor 等多种沙箱技术。项目利用智能体应用大部分时间空闲的特点做复用，demo 展示了约 250 个有状态 actor 复用 8 个物理 pod 以及 30 倍以上超配。上述性能数字均为项目自述，尚无法独立验证；README 也未提供与具体竞品的对比数据，因此相对优势无法核实。

## 设计与创新

README 强调的机制是将大量 actor 多路复用到少量 worker 上，配合按需挂起、恢复和流量路由，实现高密度运行。它提供 Actor Teleport 概念，即跨 worker 的快速挂起恢复，并通过全状态快照保留易失内存和文件系统状态。系统同时抽象多种沙箱技术，统一生命周期操作。它构建在 Kubernetes Pod 与自动扩缩之上，但自行实现智能体调度与控制。这些属于项目自称的设计特点，是否构成业界首创尚无法从给定材料判断。

## 适用场景

README 列出的适用场景包括：承载基于 ADK、LangChain 构建的智能体及工具调用，并跨调用保留会话状态；为 Claude Code、CodeX、Antigravity 等编码环境提供高密度有状态运行，保留系统与文件系统状态；将 MCP 服务器作为沙箱 actor 部署以提供持久工具。示例方面有计数器状态保持、Alpine 沙箱任意 shell 执行、Claude Code 多路复用、多模板共享 WorkerPool、请求停放和基于 HPA 的自动扩缩 WorkerPool。

## 谁会受益

对于需要在 Kubernetes 上大规模运行有状态、长时间空闲、间歇激活的智能体类工作负载的团队，该项目提供了 actor 生命周期管理、快速挂起恢复、状态快照和流量路由等一整套核心能力，并有 counter、sandbox 等多个示例和架构、API、可观测性、身份认证、出站流量、升级、威胁模型、路线图等文档，便于理解和试用。它复用 Kubernetes 基础设施，有助于统一智能体、推理和训练相关基础设施。但项目处于早期开发阶段且非 Google 官方支持产品，因此当前更适合评估与实验，而非生产使用。

## 使用前需要注意

README 明确说明项目处于早期开发，尚不具备生产可用性，API 几乎必然变化，不保证向后兼容，项目内容随时可能变动，且不是 Google 官方支持产品，也不在 Google 开源软件漏洞奖励计划范围内。兼容性方面目前只计划支持 Kubernetes 最新稳定版及前一个次要版本。贡献审查聚焦核心系统与 demo。README 中的密度、恢复延迟和吞吐等性能主张缺乏可独立验证的基准对比，与竞品的优劣尚无法确认。

[查看 GitHub 仓库](https://github.com/agent-substrate/substrate)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
