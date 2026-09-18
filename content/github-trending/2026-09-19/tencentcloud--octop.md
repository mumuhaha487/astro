---
title: "TencentCloud/Octop"
period: "daily"
date: "2026-09-19T00:00:00+08:00"
description: "Octop 是腾讯云开源的自托管 AI 助手，采用多用户、多智能体架构，以单进程同时提供 Web 控制台、CLI、IM 渠道与定时任务，数据默认保存在本地 ~/.octop/ 目录。"
repository: "TencentCloud/Octop"
repository_url: "https://github.com/TencentCloud/Octop"
language: "Python"
tags: ["AI","云服务"]
stars_today: 571
comment: false
---

Octop 是腾讯云开源的自托管 AI 助手，采用多用户、多智能体架构，以单进程同时提供 Web 控制台、CLI、IM 渠道与定时任务，数据默认保存在本地 ~/.octop/ 目录。

## 项目做什么

Octop 的定位是面向家庭与小团队的自托管 AI 助手平台。它让每名用户拥有多个专用智能体，各自具备独立工作区、模型提供方、渠道与定时任务，并可按任务切换内置专家库中的专家。平台以单一进程承载 Web 仪表盘、CLI、IM 渠道与 cron 自动化，全部会话、工作区与凭据保存在自有机器上，共享一个控制面数据库，默认使用 SQLite，也可选 PostgreSQL。其设计目标是让每人拥有一支可切换的专用智能体团队，同时不把数据交到外部。

## 与同类方案相比

README 列出的能力包括：多用户 JWT 认证与管理员角色、多智能体隔离、16 种 MBTI 人格模板、内置专家库、工具审批与 shell 命令护栏、PII 脱敏；知识库支持基于自有文档的 RAG 语义检索；工作区后端可选本地磁盘、COS、S3 等；渠道覆盖飞书、钉钉、QQ、Discord、企业微信等；提供 ACP 双向集成、浏览器自动化与远程桌面。安装方式覆盖一键脚本、PyPI、Docker、桌面端与 FnOS 安装包。以上均为功能陈述，README 未给出与同类产品的性能或成本对比数据，因此相关优势尚无法验证。

## 设计与创新

README 强调的设计是把 harness-agent、harness-gateway、harness-memory、harness-browser 组合进同一进程，Web 界面、IM 与 cron 三类入口统一走进程内的 HarnessProcessor，不依赖外部队列或消息中间件，进程重启后可从控制面数据库重建全部状态。此外 ACP 支持双向：既可作为 stdio 服务端供 Zed、OpenCode 等外部工具调用，也可把编码任务委派给 OpenCode、Claude Code、Codex 等外部智能体。这些做法是否在同类项目中首创，README 未提供横向对比或基准，尚无法验证。

## 适用场景

可用于个人助理场景，例如写周报、整理笔记与管理日程，记忆随工作区保留；家庭共享场景中由一个管理员账号为成员分配不同智能体与专家；团队协作场景下多个智能体并行工作，并通过飞书、钉钉、企业微信把任务接入群聊；开发场景下经 ACP 把编码任务委派给外部编码智能体，或在浏览器终端中获得 AI 辅助的命令执行与排查；也可用于浏览器自动化，如填写表单、截图与收集公开信息；以及用自然语言或斜杠命令配置 cron，实现定时推送或执行任务。

## 谁会受益

对于希望把对话、工作区与凭据留在自有机器上、又不愿自行搭建整套服务的人，Octop 提供了相对完整的一条开箱路径：安装脚本会在 ~/.octop/ 下创建隔离虚拟环境，octop init 生成数据库、JWT 密钥与首个管理员账号，octop run 启动 API 与 Web 控制台，默认监听 127.0.0.1:8088，也可注册为 systemd、launchd 或 Windows 服务。Docker 与桌面安装包进一步降低部署门槛，并支持 OpenAI 兼容接口、DashScope 与 Ollama 等多种模型提供方，还提供 HTTP、SSE 与 WebSocket 的编程接口。

## 使用前需要注意

README 未提供吞吐、延迟、并发用户数或资源占用的任何基准数据，实际表现无法据此判断；与同类开源助手的差异也缺少可验证的对比。路线图中的共享资源池、专家共享、AgentTeams 协调、自进化、PC 与移动客户端均标注为未完成计划，不能当作现有能力。运行需要 Python 3.12 及以上环境，脚本会通过 uv 准备解释器，并需要多核 CPU、数 GB 内存与足够磁盘存放数据库、工作区与文档语料；浏览器自动化、飞书渠道等需额外安装 extras；交互式 API 文档默认关闭，需在 config.json 中开启。许可证为 MIT（依 README 徽章与 LICENSE 链接所示），使用者仍应自行核对仓库许可证文件。

[查看 GitHub 仓库](https://github.com/TencentCloud/Octop)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
