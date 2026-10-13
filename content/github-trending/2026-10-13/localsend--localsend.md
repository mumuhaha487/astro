---
title: "localsend/localsend"
period: "daily"
date: "2026-10-13T00:00:00+08:00"
description: "LocalSend 是一款以 Dart 和 Flutter 开发的跨平台应用，面向同一局域网内的设备，支持通过 REST API 与 HTTPS 传送文件和消息，官方说明其无需互联网连接或第三方服务器。"
repository: "localsend/localsend"
repository_url: "https://github.com/localsend/localsend"
language: "Dart"
tags: ["其他"]
stars_today: 134
comment: false
---

LocalSend 是一款以 Dart 和 Flutter 开发的跨平台应用，面向同一局域网内的设备，支持通过 REST API 与 HTTPS 传送文件和消息，官方说明其无需互联网连接或第三方服务器。

## 项目做什么

项目旨在让附近设备通过本地网络互相发送文件和文本消息，作为跨平台的设备间分享工具。README 还提供命令行客户端说明，支持选择已发现设备或指定别名、IP 地址来发送文件、目录及文本。

## 与同类方案相比

README 所列特点包括覆盖 Android、iOS、macOS、Windows、Linux 和 Fire OS 等平台，并提供多种应用商店或软件包渠道。其局域网传输设计不要求互联网或第三方服务器，传输使用 HTTPS；另有 CLI、便携模式和隐藏启动选项。以上为项目文档陈述，不能据此推断实际速度或安全性优于其他工具。

## 设计与创新

README 介绍了基于 REST API 的设备通信、设备端动态生成 TLS/SSL 证书，以及本地网络内无需第三方服务器的使用方式；也列出基于 LocalSend Protocol v2 的命令行客户端。仅凭这些内容无法判断相关设计是否具有技术创新，也无法验证其相对其他方案的独特性或优势。

## 适用场景

适用于用户希望在同一局域网中的手机、电脑等设备间交换文件或文本的场景；CLI 可从终端发送单个或多个文件、递归收集目录，也可发送文本。接收设备发现受阻时，README 提到可检查防火墙、路由器 AP 隔离、系统本地网络权限及 VPN，或尝试直接输入 IP 地址。

## 谁会受益

对需要在多种操作系统之间进行局域网分享的个人或小团队，项目提供图形应用和终端操作两种入口，并列出安装渠道、构建步骤、兼容版本与故障排查建议。目录传输会保留所选根目录名称及嵌套路径，但空目录不会发送；具体使用效果仍取决于设备和网络环境。

## 使用前需要注意

项目简介和 README 未提供足以独立验证安全性、传输性能或与其他产品差异的数据；有关 HTTPS、动态证书和无需第三方服务器的说明属于项目文档描述。README 也说明应用没有自动更新，部分功能受操作系统版本和网络配置限制，且空目录不会随文件传输。

[查看 GitHub 仓库](https://github.com/localsend/localsend)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
