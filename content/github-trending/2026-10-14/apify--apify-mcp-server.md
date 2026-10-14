---
title: "apify/apify-mcp-server"
period: "daily"
date: "2026-10-14T00:00:00+08:00"
description: "Apify MCP Server 是以 TypeScript 实现的 MCP 服务，将 Apify Store 中的 Actor 接入 AI 助手，使其能够调用现成工具执行网页抓取、数据提取与自动化任务。"
repository: "apify/apify-mcp-server"
repository_url: "https://github.com/apify/apify-mcp-server"
language: "TypeScript"
tags: ["AI","开发工具","数据"]
stars_today: 200
comment: false
---

Apify MCP Server 是以 TypeScript 实现的 MCP 服务，将 Apify Store 中的 Actor 接入 AI 助手，使其能够调用现成工具执行网页抓取、数据提取与自动化任务。

## 项目做什么

项目的主要用途是让符合 MCP 的 AI 客户端通过统一接口发现并调用 Apify Actor。服务可读取 Actor 的输入模式并据此生成工具，也提供 Actor 搜索与详情查询、运行状态查看、结果存储访问及部分 Apify 平台管理操作。README 所述的具体抓取能力取决于所调用的 Actor，而非由服务器单独实现。

## 与同类方案相比

README 展示了托管 HTTPS 与本地 stdio 两种接入方式，并说明托管服务支持 OAuth，客户端也可使用 Apify API token。动态发现和输入模式读取有助于代理按需选用 Actor；服务还覆盖运行、数据集、存储、任务和计划等操作。文档列出多个已测试客户端，但未提供可据此比较的效果或性能数据。

## 设计与创新

文档所能确认的特点是把 Apify Store 中不同用途的 Actor 动态映射为 MCP 工具，并提供辅助工具来查询 Actor、文档和运行结果。托管端还注明支持结构化 Actor 结果的输出模式推断，本地 stdio 版本不具备该功能。至于这些机制的技术新颖程度或相对其他方案的优势，现有材料不足以验证。

## 适用场景

适用于希望通过对话式 AI 获取网站数据的场景，例如社交媒体内容、搜索结果、地图商家信息、电商页面或一般网页内容采集，也可用于查看 Actor 运行结果和读取数据集。使用者可接入 Claude、VS Code、Cursor 等 MCP 客户端；若要定时运行或管理 Actor，也可使用 README 列出的计划、任务和管理工具。

## 谁会受益

对于已有 Apify 使用需求、希望让 MCP 代理复用现成采集工具的团队，该服务可减少逐个 Actor 编写客户端适配的工作，并让代理先查询工具能力再提交相应输入。托管方式可免去本地启动服务的步骤；本地 stdio 则适合命令行或本地集成。不同 Actor 的输入、输出、费用和适用范围仍需分别确认。

## 使用前需要注意

服务器提供的是 Actor 的接入与调度能力，不能据此保证任一网站都可成功抓取，也不代表所有 Actor 具有一致的数据质量、费用或输出格式。README 提及的部分付费方式有适用限制，直接 x402 与 Skyfire 仅支持按事件付费 Actor，且不支持 Standby Actor。托管端与本地版功能存在差异；客户端对动态工具发现等能力的支持也可能不同。

[查看 GitHub 仓库](https://github.com/apify/apify-mcp-server)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
