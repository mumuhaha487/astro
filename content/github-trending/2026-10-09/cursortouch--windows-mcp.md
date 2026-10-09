---
title: "CursorTouch/Windows-MCP"
period: "daily"
date: "2026-10-09T00:00:00+08:00"
description: "Windows-MCP 是一个以 Python 实现的 MCP 服务器，面向 Windows 系统提供可供 AI 客户端调用的桌面与界面操作工具，涵盖窗口控制、输入模拟和状态读取等能力。"
repository: "CursorTouch/Windows-MCP"
repository_url: "https://github.com/CursorTouch/Windows-MCP"
language: "Python"
tags: ["AI","开发工具"]
stars_today: 360
comment: false
---

Windows-MCP 是一个以 Python 实现的 MCP 服务器，面向 Windows 系统提供可供 AI 客户端调用的桌面与界面操作工具，涵盖窗口控制、输入模拟和状态读取等能力。

## 项目做什么

项目旨在通过模型上下文协议连接 AI 代理与 Windows 操作系统，让兼容的 MCP 客户端能够调用本机工具执行文件导航、应用控制、UI 交互和 QA 测试等任务。README 还描述了浏览器 DOM 模式，可侧重读取网页内容并减少浏览器界面元素干扰。

## 与同类方案相比

README 所列的实际特点包括提供键盘和鼠标操作、窗口及 UI 状态读取工具，并支持 stdio、SSE 和 streamable HTTP 等连接方式。文档也给出了多种客户端的配置示例，以及远程访问的认证、IP 白名单、TLS、CORS 和工具筛选选项；这些是项目自述，实际效果仍需结合环境验证。

## 设计与创新

README 将无需传统计算机视觉技术或特定微调模型、可配合不同 LLM，以及浏览器 DOM 模式列为项目特点。但没有提供足以独立验证的技术比较、评测方法或创新性证据，因此无法据此确认其相较其他自动化方案的独特程度或优势。

## 适用场景

适用场景包括让 AI 客户端操作 Windows 应用、进行界面交互与基本桌面自动化，以及借助状态读取工具辅助 QA 测试。DOM 模式可用于 Chrome、Edge 和 Firefox 的网页内容自动化；若需跨网络连接，可配置 HTTP 类传输及访问控制，部署方式应按安全要求选择。

## 谁会受益

对希望将 Windows 桌面能力接入 MCP 客户端的开发者或使用者，项目提供了服务器启动、客户端接入和后台登录启动的操作说明，并可通过 PyPI 与 uvx 运行。其工具选择及传输选项也便于按接入方式和开放范围调整，适合先进行小范围集成验证。

## 使用前需要注意

项目要求 Python 3.13 及 Windows 环境，README 建议系统默认语言为英语，否则需停用 App-Tool；初次安装可能耗时且首次启动可能超时。其交互依赖本机 UI 和应用状态，延迟会随负载及模型推理速度变化。所给材料未展示完整工具定义、测试结果或兼容性验证细节，不能确认各应用中的可靠性；竞品比较和创新程度也尚无法验证。

[查看 GitHub 仓库](https://github.com/CursorTouch/Windows-MCP)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
