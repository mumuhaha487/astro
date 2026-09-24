---
title: "Open-Dev-Society/OpenStock"
period: "weekly"
period_key: "weekly-2026-w39"
date: "2026-09-23T00:00:00+08:00"
description: "OpenStock 是 Open Dev Society 推出的开源股票市场应用，定位为昂贵行情平台的免费替代。基于 Next.js 15 与 TypeScript 构建，支持实时价格追踪、个性化提醒和公司洞察，可自托管。"
repository: "Open-Dev-Society/OpenStock"
repository_url: "https://github.com/Open-Dev-Society/OpenStock"
language: "TypeScript"
tags:
  - 金融
comment: false
---

OpenStock 是 Open Dev Society 推出的开源股票市场应用，定位为昂贵行情平台的免费替代。基于 Next.js 15 与 TypeScript 构建，支持实时价格追踪、个性化提醒和公司洞察，可自托管。

## 项目定位与要解决的问题

OpenStock 定位于面向个人投资者与开发者的开源行情工具，目标是以免费、透明的社区项目形式提供通常被付费平台封锁的行情与公司信息。它明确声明自身不是券商，数据可能因上游提供商规则而延迟，且不构成投资建议。项目采用 AGPL-3.0 许可，若修改、再分发或以 Web 服务形式部署，必须依同许可证公开源码并标注原作者，这一条款从许可层面强化了其开放立场。项目方称其为面向所有人、永久免费，这一承诺属于自述性质。

## 核心能力

核心功能围绕行情获取与个性化展开：邮箱密码认证与受保护路由、全局搜索和 Command/Ctrl+K 命令面板、按用户隔离的观察列表、含 TradingView 图表与公司财务组件的股票详情页、由热力图与头条构成的行情总览，以及收集国家、投资目标、风险偏好和偏好行业的新用户引导。邮件自动化包括由 Gemini 经 Inngest 生成的个性化欢迎邮件，以及每周一 9 点的新闻摘要。可选的情绪洞察卡片汇集 Reddit、X.com、新闻和 Polymarket 的结构化情绪快照。

## 技术结构与实现思路

项目采用 Next.js 15 App Router 与 React 19，TypeScript 占比约 93.4%，样式依赖 Tailwind CSS v4 与 shadcn/ui、Radix 原语，图标来自 Lucide。认证使用 Better Auth 的邮箱密码模式并配 MongoDB 适配器，数据持久化走 MongoDB 与 Mongoose，观察列表模型按用户唯一约束符号。行情搜索、公司档案与新闻来自 Finnhub，图表、热力图、报价和时间线用 TradingView 可嵌入组件。后台任务由 Inngest 承载事件与 Cron，邮件经 Nodemailer 的 Gmail 传输发送，另有 Adanos 可选情绪接口。

## 实际工作流程

使用流程上，开发者克隆仓库后安装依赖、配置环境变量并验证数据库连通性，随后以 Turbopack 启动开发服务，另起 Inngest 本地开发进程以驱动工作流与 Cron，生产环境执行构建与启动，或用 Docker Compose 一并升起应用与带持久卷的 MongoDB 服务。运行期间，用户注册触发 Inngest 的 user.created 事件生成个性化欢迎邮件，周一 9 点 Cron 触发每周新闻摘要并以 Kit 广播发送；浏览器侧通过 Finnhub 搜索与 TradingView 组件获取行情展示。

## 与同类方案的取舍

差异点首先在于工程选型组合：Better Auth 与 MongoDB 承担认证与存储，Finnhub 提供符号查询与新闻，TradingView 负责图表可视化，Inngest 统一调度事件、Cron 与 AI 推理，并可按 AI_PROVIDER 在 Gemini、MiniMax 或 Siray 之间切换，这在同类开源行情项目中并不常见。项目方自述覆盖 30 多个国际交易所，同时坦承免费层下非美股票约延迟 15 分钟以上、TradingView 免费层对印度 NSE、越南等新兴市场有限制，这种对限制的显式披露区别于只强调覆盖面的宣传。AGPL-3.0 许可与社区贡献者署名机制也构成其开放治理取向的一部分。

## 值得关注的设计

项目的创新点主要体现在集成方式而非底层技术：它把Finnhub的行情与公司数据、TradingView的可嵌入图表组件、Adanos的多源情绪快照组合在同一个Next.js应用内，形成行情、图表、基本面与社交情绪的聚合视图。Inngest承担事件与定时任务，用户注册后触发由Gemini（也支持MiniMax等可选提供商）生成的个性化欢迎邮件，每周一9点通过cron推送新闻摘要邮件，把AI推理嵌入后台工作流而非前端交互。这些能力均为公开技术栈的组合应用，并非独有算法或数据源，项目方也未声称存在性能或架构层面的独创突破。

## 适用领域和具体场景

典型用途包括：个人投资者建立自选股列表，用Cmd/Ctrl+K快速搜索股票并查看TradingView蜡烛图、技术指标、公司概况与财务组件；浏览市场概览页的热力图、行情与头条新闻；在个股详情页查看Reddit、X.com、新闻与Polymarket等来源的情绪卡片辅助判断。注册时填写国家、投资目标、风险偏好与偏好行业用于个性化。所有路由默认受中间件保护，只有登录注册页与静态资源公开。由于项目并非券商，无法下单交易，只能用于信息跟踪与观察，行情可能因数据商规则延迟。

## 哪些人会受益

目标用户是没有预算购买彭博类昂贵终端、又想获得相对完整看盘体验的散户、金融专业学生和自学者，也包括希望用真实项目练习Next.js全栈开发的开发者。README的宣言强调知识不应被付费墙阻挡、社区不设门槛、欢迎初学者，表明其希望吸引自驱型学习者与开源贡献者。对需要实时逐笔行情、合规交易通道或机构级数据质量的用户，这一项目并不合适。它更像面向个人研究与学习的轻量工具，而非专业投研的生产系统。

## 上手、部署与集成

部署门槛中等：需要Node.js 20+、MongoDB连接串、Finnhub API Key，可选Gemini密钥、Adanos密钥、Gmail应用密码与Inngest签名密钥，本地可用Docker Compose一键启动应用与MongoDB持久卷。README提示部署到Vercel需要NEXT_PUBLIC_FINNHUB_API_KEY和INNGEST_SIGNING_KEY。项目通过Star History与Trendshift徽章展示榜单热度，属于项目方自述的社区关注度，未给出具体用户量。贡献流程鼓励提交issue、认领good first issue，社区页面列出五位贡献者，规模仍属早期。

## 限制与风险

README明确声明OpenStock不是券商，行情可能因数据商规则与用户配置而延迟，内容不构成投资建议，免费层的非美股行情延迟15分钟以上。TradingView免费层对印度NSE、越南等新兴市场有限制，部分代码会提示只能在TradingView查看。Finnhub免费层实时行情可能需要付费，且有速率限制。项目依赖外部API与密钥，未配置时功能不可用；邮件使用Gmail传输，生产环境建议改用专用SMTP。许可为AGPL-3.0，修改、分发或作为网络服务部署都必须以同许可开源并署名，这对闭源商业化构成约束。

## 综合观察

OpenStock的价值在于把分散的行情、图表、基本面与情绪数据源，用一个现代TypeScript全栈模板整合为可自部署的学习型应用，配合AI欢迎邮件与每周摘要形成完整的注册后体验，适合学习与个人观察。其免费与开源属性源于AGPL-3.0与社区赞助模式，而非数据成本优势。潜在风险是数据质量与延迟受第三方免费层制约、密钥配置多、行情准确性与合规边界需用户自行判断。若目标是严肃投研或实时交易，应转向持牌数据服务；若目标是学习全栈开发与搭建轻量看盘工具，它是结构清晰、可复用的起点。

[查看 GitHub 仓库](https://github.com/Open-Dev-Society/OpenStock)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
