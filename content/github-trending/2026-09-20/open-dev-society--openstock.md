---
title: "Open-Dev-Society/OpenStock"
period: "daily"
date: "2026-09-20T00:00:00+08:00"
description: "OpenStock 是由 Open Dev Society 维护的开源行情应用，使用 TypeScript 与 Next.js 15 构建，以 Finnhub 提供行情、TradingView 组件展示图表，Better Auth 与 MongoDB 处理账号和自选股，并支持搜索、邮件通知等功能。"
repository: "Open-Dev-Society/OpenStock"
repository_url: "https://github.com/Open-Dev-Society/OpenStock"
language: "TypeScript"
tags: ["金融"]
stars_today: 477
comment: false
---

OpenStock 是由 Open Dev Society 维护的开源行情应用，使用 TypeScript 与 Next.js 15 构建，以 Finnhub 提供行情、TradingView 组件展示图表，Better Auth 与 MongoDB 处理账号和自选股，并支持搜索、邮件通知等功能。

## 项目做什么

项目目标是做昂贵市场平台的开源替代品，让用户免费追踪实时价格、设置个性化提醒并查看公司详细资料。README 明确声明它并非券商，行情数据可能依据数据提供商规则与用户配置而延迟，页面内容不构成投资建议。整体定位偏向社区共建、开放获取，遵循其组织提出的知识不应被付费墙锁住的理念，与商业终端的收费订阅模式形成对照。

## 与同类方案相比

技术选型较新且统一：Next.js 15 App Router、React 19、Tailwind CSS v4、shadcn/ui 与 Radix UI，类型以 TypeScript 为主；认证用 Better Auth 配合 MongoDB 适配器，数据用 MongoDB 与 Mongoose 持久化；行情搜索与公司资料来自 Finnhub，图表与热力图使用 TradingView 可嵌入组件。此外提供 Docker Compose 一键启动应用与数据库，环境变量与项目结构在 README 中有较完整说明，便于本地部署与二次开发。但 README 未给出与商业平台在性能、数据质量上的实测对比，相关优势尚无法验证。

## 设计与创新

较有特色的设计是把多家外部能力组合进同一应用：Finnhub 负责搜索、公司资料与新闻，TradingView 组件负责图表与市场视图，可选的 Adanos 接口提供覆盖 Reddit、X.com、新闻与 Polymarket 的情绪快照卡片；Inngest 承担事件、定时任务与 AI 推断，用户注册后触发 Gemini 生成个性化欢迎邮件，每日中午的 cron 任务结合自选股生成新闻摘要邮件。这种组合方式在 README 中有描述，但仓库未提供与同类开源项目的对照评测，因此其创新程度尚无法证实。

## 适用场景

适用场景包括：个人投资者自建行情看板，按自选股追踪价格并接收每日新闻摘要邮件；需要快速搜索股票、查看公司概况与财务指标、技术图表的日常研究；在受限预算下替代付费行情订阅的轻度使用；教学或自学场景中作为 Next.js 全栈、认证、数据库建模、定时任务与第三方 API 集成的参考实现；以及通过 Docker Compose 在内网或自有服务器上部署，掌握数据与控制权的团队或个人。

## 谁会受益

对希望自托管、避免订阅费用的用户，项目提供了可直接运行的完整骨架，覆盖认证、受保护路由、自选股存储、搜索命令面板、图表展示与邮件通知等常见需求。对开发者而言，其目录划分、server actions、Mongoose 模型、Better Auth 与 Inngest 工作流的组织方式具有参考价值，且附有本地与 Docker 两种配置示例。需注意项目采用 AGPL-3.0，若修改、再分发或以网络服务形式部署，须以相同许可证公开源码并署名原作者，这可能限制闭源商业化使用。

## 使用前需要注意

依赖多项第三方服务与密钥，包括 Finnhub、Inngest、Gmail、可选的 Gemini 与 Adanos，任一配置缺失都会削弱相应功能。README 自述免费层行情可能延迟，非美股实时数据在免费层延迟 15 分钟以上，TradingView 免费层对印度 NSE、越南等新兴市场存在限制。项目不是券商，也不提供投资建议，数据准确性受提供商约束。此外仓库未给出性能基准、与竞品的量化对比或除 AGPL-3.0 说明之外的法律与合规细节，这些方面尚无法验证。

[查看 GitHub 仓库](https://github.com/Open-Dev-Society/OpenStock)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
