---
title: "openclaw/openclaw"
period: "daily"
date: "2026-09-26T00:00:00+08:00"
description: "OpenClaw 是一个用 TypeScript 编写的开源 AI 助手，运行在用户自有设备上，并通过 Discord、Slack、Telegram、WhatsApp 等 20 多个聊天渠道以及各平台原生应用与用户交互。"
repository: "openclaw/openclaw"
repository_url: "https://github.com/openclaw/openclaw"
language: "TypeScript"
tags: ["AI"]
stars_today: 158
comment: false
---

OpenClaw 是一个用 TypeScript 编写的开源 AI 助手，运行在用户自有设备上，并通过 Discord、Slack、Telegram、WhatsApp 等 20 多个聊天渠道以及各平台原生应用与用户交互。

## 项目做什么

该项目的目标是把 AI 助手部署在用户自己的硬件上，并让它出现在用户日常使用的聊天渠道中。README 说明：状态、记忆和凭据保存在本地硬件；模型和代理执行框架（如 Claude、Codex、本地模型）以插件形式提供，可替换而不影响其他部分。一个 Gateway 既可作为笔记本上的个人助手，也可作为团队共享部署，区别仅在于配置。项目由独立的 OpenClaw Foundation 治理，无付费层级或托管服务。

## 与同类方案相比

README 强调的可验证特点包括：数据本地化，状态、记忆与凭据存放在用户硬件上；模型与代理框架以可替换插件形式接入；默认仅进行每日版本检查，匿名功能统计需主动选择加入，并可通过 update.checkOnStart: false 同时关闭；无付费层级、托管服务或代币；安装脚本支持 macOS、Linux 和 Windows，并会在需要时配置 Node.js 运行时。至于性能、竞品对比优势，README 没有给出可验证数据，尚无法验证。

## 设计与创新

README 提出的架构思路是“可信网关、不可信执行、确定性策略”，并将状态与凭据保留在本地、把模型与代理执行框架做成可替换插件。渠道覆盖较广，包括 WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage 等，并配合各平台伴随应用与节点，提供语音、Canvas、摄像头、屏幕和设备本地操作。开放插件 SDK 与 ClawHub 用于分发新能力。这些是否属于行业首创，README 未作对比论证，尚无法验证。

## 适用场景

README 描述的使用场景包括：个人用户在自己的笔记本上安装并作为个人助手使用；团队通过配置共享部署；通过 Discord、iMessage、Slack、Teams、Telegram、WhatsApp 等聊天渠道与助手交互；使用 macOS、iOS、Android、Windows、Linux 原生应用；通过伴随应用和节点使用语音、Canvas、摄像头、屏幕和设备本地操作；模型可选用托管或本地提供方。安全方面建议在连接其他用户或远程暴露 Gateway 前阅读安全与沙箱指南。

## 谁会受益

对希望把 AI 助手运行在自有硬件、并保留状态与凭据控制权的用户，该项目提供了从安装脚本、onboarding、Gateway 到 Control UI、CLI、TUI 的完整入手路径，文档覆盖模型配置、渠道连接、工具与技能、插件、平台与节点、CLI 与斜杠命令、配置与架构、更新与发布渠道等。对开发者，仓库是 pnpm 工作区，提供 clone、install、build、ui:build 流程，并鼓励通过插件 SDK 与 ClawHub 扩展能力。

## 使用前需要注意

README 明确指出：入站消息应视为不可信输入；具备私信能力的渠道默认对未知发送者进行配对，需用 openclaw pairing approve 批准；除非配置沙箱，工具在主会话中直接运行在主机上，连接其他用户或远程暴露 Gateway 前必须阅读安全、暴露和沙箱指南。仓库根目录不支持直接 npm install，必须使用 pnpm 工作区。README 未提供性能基准、竞品对比结果或功能成熟度说明，这些方面尚无法验证。

[查看 GitHub 仓库](https://github.com/openclaw/openclaw)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
