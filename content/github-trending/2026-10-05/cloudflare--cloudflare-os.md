---
title: "cloudflare/cloudflare-os"
period: "daily"
date: "2026-10-05T00:00:00+08:00"
description: "Cloudflare OS 是基于 Cloudflare Workers 构建的 AI 工作空间，结合任务代理、用户可定制的小型应用、外部服务连接与安全控制，目标是让组织按自身需求部署和改造。"
repository: "cloudflare/cloudflare-os"
repository_url: "https://github.com/cloudflare/cloudflare-os"
language: "TypeScript"
tags: ["AI","云服务"]
stars_today: 336
comment: false
---

Cloudflare OS 是基于 Cloudflare Workers 构建的 AI 工作空间，结合任务代理、用户可定制的小型应用、外部服务连接与安全控制，目标是让组织按自身需求部署和改造。

## 项目做什么

项目旨在提供企业场景中的 AI 工作环境：用户可让代理执行任务或生成应用，也可将组织知识与外部系统按需开放给代理。仓库说明其定位是供其他组织复制并定制的开源基础，而非直接套用的通用成品。

## 与同类方案相比

README 描述了应用沙箱、默认无外部访问、按资源授权以及带审批与操作日志的 Gatekeeper 机制，意在限制代理和应用的权限。应用可由 AI 创建、修改并通过蓝图分享代码；文档也提到协作和实时多人功能，但实际安全效果与运行表现无法仅凭 README 独立验证。

## 设计与创新

项目提出以独立运行的 Gadget（应用实例）和可复制代码的 Blueprint 为中心的工作方式，并用 Gatekeeper 管理外部服务授权。其延迟审批流程会先模拟有副作用操作的结果，让代理继续规划，用户之后再逐项或批量审核。README 将这些设计视为重要改变；与其他方案相比是否构成创新或具备优势，现有材料不足以验证。

## 适用场景

可用于试验由代理生成的演示文稿、白板、游戏或内部仪表盘，也可在配置相应集成后处理 GitHub 仓库或 Google 文档任务。组织还可将它作为起点，开发按内部流程定制的应用，并通过授权、共享或蓝图复制支持团队协作；相关外部服务能力取决于集成配置。

## 谁会受益

对希望研究 Workers、Durable Objects、Dynamic Workers 与 Facets 如何组合成代理和应用平台的开发者，以及想搭建内部 AI 工作空间并自行定制的团队，仓库提供了可运行的代码与架构示例。README 给出本地试用和部署入口；本地方式明确仅用于体验，不适合生产环境。

## 使用前需要注意

README 明确称项目仍处于早期访问阶段、持续大幅开发且存在不少粗糙之处；本地启动方式不适用于生产部署。部分集成须自行配置，依赖 Workers 运行时及其相关组件；使用体验、维护负担、安全保证和部署到自有服务器的成熟度，不能从 README 确认。

[查看 GitHub 仓库](https://github.com/cloudflare/cloudflare-os)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
