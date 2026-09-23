---
title: "browserbase/stagehand"
period: "daily"
date: "2026-09-24T00:00:00+08:00"
description: "Stagehand 是 Browserbase 推出的浏览器智能体 SDK，提供 act、observe、extract 等自然语言接口，使用 Playwright 风格 API 操作页面并提取结构化数据，支持 TypeScript、Python、Go。"
repository: "browserbase/stagehand"
repository_url: "https://github.com/browserbase/stagehand"
language: "TypeScript"
tags: ["AI","数据"]
stars_today: 322
comment: false
---

Stagehand 是 Browserbase 推出的浏览器智能体 SDK，提供 act、observe、extract 等自然语言接口，使用 Playwright 风格 API 操作页面并提取结构化数据，支持 TypeScript、Python、Go。

## 项目做什么

该项目的目标是降低浏览器自动化的编写门槛，让开发者与智能体以自然语言驱动浏览器完成任务。它通过 act 执行操作、observe 定位元素、extract 按 schema 提取数据，并保留 goto、click、locator、screenshot 等 Playwright 风格接口，使已有的浏览器自动化经验可以直接迁移。README 显示它既能连接本地 Chrome，也能指向 Browserbase 云端浏览器运行，还提供无需浏览器的 search 与 fetch 能力，用于网页搜索和将页面内容抓取为 markdown。

## 与同类方案相比

根据 README，主要优势包括：采用开发者熟悉的 Playwright 风格 API；通过混合可访问性树裁剪减少传给模型的页面上下文；以扩展形式运行在浏览器旁以缩短单次操作的往返延迟；act、observe、extract 在站点改版时能自我修复；面向智能体提供 WebMCP、剪贴板、批量命令、可穿透嵌套 iframe 与封闭 Shadow DOM 的深度定位器以及 OTel 追踪；同一位浏览器驱动覆盖 TypeScript、Python 和 Go 三种语言。此外还提供 Browserbase 的 Model Gateway 与缓存、MCP 服务器集成等配套能力。

## 设计与创新

README 中较有辨识度的点在于把自然语言操作与既有自动化 API 结合：observe 返回真实选择器，使凭据可以不经过模型，从而降低敏感信息暴露面；act、observe、extract 具备自我修复特性；以扩展形式贴近浏览器运行以降低往返延迟；WebMCP 工具发现与调用、深度定位器等面向智能体的设计。另外还提供无浏览器的 search 与 fetch 作为浏览器会话之外的轻量补充。不过 README 的对比表格与速度声明缺少可复现的基准细节，因此这些相对优势尚无法独立验证。

## 适用场景

适合需要以自然语言完成网页操作的场景：例如登录后抓取结构化数据（如发票表格并做 schema 校验）、多步骤表单与导航流程自动化、在站点改版后仍需维持稳定的运维类脚本。也适合把浏览器能力接入智能体生态，通过内置的 Browserbase MCP 服务器让 Claude Code、Cursor、Codex 等 MCP 客户端直接获得 navigate、act、observe、extract。此外可用 search 与 fetch 在会话之外做网页检索和内容抽取，用 localBrowser 配合 userDataDir 持久化 Cookie 以减少重复登录。

## 谁会受益

对已经使用 Playwright 或类似工具的团队，迁移成本相对可控，因为 goto、click、locator、screenshot 等接口保持一致，同时额外获得自然语言操作与数据抽取能力。对希望让编码智能体直接操作网页的团队，MCP 集成提供了免安装、无需本地浏览器的接入方式。对需要跨语言复用的项目，同一套概念在 TypeScript、Python、Go 中都有对应实现。README 也提示本地运行需要先安装 Chrome，说明本地路径仍有环境依赖，实际落地前需在目标环境中验证。

## 使用前需要注意

README 未给出性能基准、竞品对比方法与测试条件，因此“比 Playwright 云端快 2 倍”“每次操作延迟更低”等说法尚无法独立验证。extract 依赖 schema（TypeScript 用 zod，Python 用 pydantic，Go 用 struct 标签），且示例显示需要配置模型与 API Key，说明可用性受外部模型服务影响。本地运行需预先安装 Chrome。本地与云端的能力边界不同：缓存、Model Gateway、代理、会话录制、Verified 模式等仅在指向 Browserbase 时提供，README 未说明这些能力的速率限制、配额或计费细节。

[查看 GitHub 仓库](https://github.com/browserbase/stagehand)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
