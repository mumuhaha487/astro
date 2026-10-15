---
title: "ShawnPana/phone-harness"
period: "daily"
date: "2026-10-16T00:00:00+08:00"
description: "Phone Harness 是一个用 Python 编写的手机控制工具，可将 Claude Code、Codex 等智能体连接到真实或云端手机，让其读取屏幕并执行点击、滑动和输入等操作。"
repository: "ShawnPana/phone-harness"
repository_url: "https://github.com/ShawnPana/phone-harness"
language: "Python"
tags: ["AI","移动端"]
stars_today: 203
comment: false
---

Phone Harness 是一个用 Python 编写的手机控制工具，可将 Claude Code、Codex 等智能体连接到真实或云端手机，让其读取屏幕并执行点击、滑动和输入等操作。

## 项目做什么

项目旨在为智能体提供统一的手机交互方式：通过屏幕内容判断当前状态，再调用操作完成任务。README 描述了 iPhone 经 macOS 的 iPhone Mirroring 接入、Android 经 adb 接入，以及云端 iPhone 和 Android 经各自通道接入。它提供命令行、预置操作辅助函数和智能体使用指南；首次连接及必要权限仍需用户配合。

## 与同类方案相比

README 所述的便利之处包括：不同平台可使用相同的辅助函数，Android 可通过 USB 或 Wi‑Fi adb 连接，云端 Android 可复用本地 Android 操作方式；工具还能截取屏幕、识别文本并返回适合点击的坐标。项目提供 doctor 检查、云端设备管理命令和入门指引。以上是文档描述，尚无独立测试数据可验证实际效果。

## 设计与创新

README 将多种手机接入方式整合到同一套智能体操作流程中：本地 iPhone 使用 Mirroring 和 Apple Vision OCR，本地 Android 使用 adb 与无障碍树，云端 iPhone 则通过 HTTPS 传递操作并由主机执行 OCR。文档没有提供足以判断其相对既有方案创新程度的比较或证据，因此无法确认其技术创新性。

## 适用场景

适用情境包括让编程智能体执行手机界面上的日常任务、在本地 iPhone 或 Android 上测试交互，以及租用云端设备进行操作。README 用打开天气应用、在 Notes 中输入内容和预订出行演示或举例说明工作方式。使用者需根据设备类型完成配对、权限授权或 adb 确认；云端设备还需登录并启动会话。

## 谁会受益

对于希望让智能体操作真实手机应用的开发者或测试人员，该项目提供了命令行入口、统一辅助函数、安装和排障文档，并可读取屏幕内容作为操作反馈。云端设备选项可供手边没有兼容手机的用户尝试。实际可用性取决于应用界面、系统连接状态及智能体能否正确解释识别结果，README 未提供量化的成功率或效果评测。

## 使用前需要注意

README 明确列出若干限制：解锁 iPhone 会暂停镜像，PIN 锁定的 Android 需要用户处理；OCR 识别文字而非图标，无标签控件可能需要截图和具备视觉能力的模型；不支持多点触控、相机或 Face ID 流程，DRM 视频会显示为黑屏。连接手机始终需要用户完成。文档未说明完整的安全、隐私和服务可用性评估。

[查看 GitHub 仓库](https://github.com/ShawnPana/phone-harness)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
