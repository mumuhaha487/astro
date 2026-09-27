---
title: "mobile-next/mobile-mcp"
period: "daily"
date: "2026-09-28T00:00:00+08:00"
description: "Mobile MCP 是 mobile-next 开源的 TypeScript 服务器，基于 Model Context Protocol 为智能体提供跨 iOS、Android 的统一移动自动化接口，覆盖模拟器、仿真器与真机，通过无障碍树与截图坐标操作原生应用。"
repository: "mobile-next/mobile-mcp"
repository_url: "https://github.com/mobile-next/mobile-mcp"
language: "TypeScript"
tags: ["AI","移动端"]
stars_today: 573
comment: false
---

Mobile MCP 是 mobile-next 开源的 TypeScript 服务器，基于 Model Context Protocol 为智能体提供跨 iOS、Android 的统一移动自动化接口，覆盖模拟器、仿真器与真机，通过无障碍树与截图坐标操作原生应用。

## 项目做什么

项目旨在让 LLM 与智能体通过标准化的 MCP 接口直接操控移动设备与原生应用，减少针对 iOS 或 Android 分别编写自动化脚本的成本。它把设备发现、应用管理、屏幕交互、输入导航、日志与崩溃报告等能力封装为一组统一工具，使智能体可以在模拟器、仿真器和真机之间用同一套调用方式完成测试、数据录入和多步骤用户流程自动化的任务。

## 与同类方案相比

其特点在于以无障碍树为主要驱动方式，避免始终依赖视觉模型与图像 token，需要时再回退到截图和坐标点击，从而在输出上更结构化、确定性更强。同一套工具横跨 iOS 与 Android 的模拟器、仿真器及真机，并明确列出了对应前置条件，如 Xcode 命令行工具与 adb。它还支持通过 --listen 以 Streamable HTTP 方式运行，可选 Bearer 令牌鉴权，便于远程或水平部署，但 README 未给出具体性能数据与竞品对比。

## 设计与创新

可见的设计取向是将平台差异隐藏在单一 MCP 接口之后，并以无障碍快照作为主要信息源，配合坐标点击作为兜底，同时提供批量命令工具把点击、输入、点击等动作合并为一次调用，减少往返次数。此外，设备管理工具中纳入云端设备的登录、列出、分配与释放流程，以及定位覆盖、剪贴板读写、屏幕录制和日志/崩溃获取等设备级能力，使其不仅是 UI 操作层，也覆盖调试与数据提取环节。

## 适用场景

适合原生应用的自动化测试与数据录入、由 LLM 驱动的多步骤用户旅程，以及表单交互、应用安装与启动等脚本化流程。也可用于验证业务逻辑、在多种目标设备上重复执行同一操作、抓取界面结构与文本数据，并通过设备日志和崩溃报告辅助排查。对于需要规模化设备数量的团队，文档提供了通过云端设备提供方分配远程真机的路径，但未说明具体规模上限。

## 谁会受益

对使用 Claude Code、Codex、Gemini、GitHub Copilot 等 MCP 兼容客户端的团队，它提供了一条无需编写 XCUITest 或 Espresso 即可让智能体操作移动设备的路径，降低了跨平台自动化的接入门槛。完整的工具清单覆盖设备、应用、界面、输入、日志五类操作，配合标准配置示例和多种客户端的安装说明，上手所需信息较完整。是否真正省时或提升成功率，README 未提供基准，尚无法验证。

## 使用前需要注意

文档未给出性能基准、与其他移动自动化框架的对比数据、许可证信息，也未说明并发设备数量、稳定性或精度指标，因此相关优势无法在此确认。运行依赖 Xcode 命令行工具、Android Platform Tools 与 Node.js v20 以上，真机需 USB 连接并授权，云设备依赖 Mobile Next Cloud 服务。--listen 模式为无状态且旧 SSE 传输已移除，升级时客户端需改用 Streamable HTTP；未设置 MOBILEMCP_AUTH 时服务不鉴权并仅打印警告。

[查看 GitHub 仓库](https://github.com/mobile-next/mobile-mcp)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
