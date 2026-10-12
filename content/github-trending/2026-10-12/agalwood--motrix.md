---
title: "agalwood/Motrix"
period: "daily"
date: "2026-10-12T00:00:00+08:00"
description: "Motrix 是一款基于 Electron 的下载管理器，支持多种下载来源，并提供桌面端、无图形界面的服务器端、命令行工具及插件扩展。"
repository: "agalwood/Motrix"
repository_url: "https://github.com/agalwood/Motrix"
language: "TypeScript"
tags: ["其他"]
stars_today: 158
comment: false
---

Motrix 是一款基于 Electron 的下载管理器，支持多种下载来源，并提供桌面端、无图形界面的服务器端、命令行工具及插件扩展。

## 项目做什么

项目旨在统一管理 HTTP、FTP、BitTorrent 和磁力链接等下载任务。除桌面应用外，它还提供可运行于 Node.js 或 Docker 的无桌面服务器，以及用于终端操作和远程连接的命令行客户端，适用于个人电脑和 NAS 等设备。

## 与同类方案相比

README 列出的能力包括按文件选择种子的下载内容、速度限制配置、下载会话恢复、通知和仪表盘；浏览器扩展可将浏览器下载交给 Motrix 处理。桌面端与无头服务器共用核心，也提供 Docker 部署、远程配对和插件权限控制等选项。上述为文档所述功能，实际表现需结合具体环境验证。

## 设计与创新

项目采用独立于界面的下载核心，并通过基于 JSON-RPC 2.0 的 MDXP 协议连接应用、命令行客户端及扩展；插件则运行于 QuickJS 沙箱，并声明能力和网址权限。README 将这些描述为 v2 的架构与生态设计，但未提供足以验证其相对其他下载管理器创新性或优势的比较材料。

## 适用场景

适用于需要在 macOS、Windows 或 Linux 桌面环境中管理下载的用户，也可部署在 NAS 或家庭服务器上，通过网页界面和远程配对管理任务。若希望在终端添加、查看或监控下载，文档提供 CLI；若需接管浏览器下载，可使用对应扩展。

## 谁会受益

对于希望把多种下载协议、浏览器下载接管和远程任务管理集中到一个工具中的用户，Motrix 提供了较完整的操作入口。开发者还可使用插件 SDK 制作 URL 解析、文件命名或完成通知等扩展；Docker 部署说明和会话持久化能力也便于服务器场景的安装与维护。

## 使用前需要注意

README 标明 Motrix Turbo v2 仍处于 Beta 阶段，并提示测试前备份数据；迁移助手仅导入选定的 v1 任务为暂停记录，Windows 不支持导入旧进度。文档还注明没有 Windows ARM64 和 32 位安装包，Windows x64 包未签名；性能、稳定性及与其他产品的比较无法仅凭 README 验证。

[查看 GitHub 仓库](https://github.com/agalwood/Motrix)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
