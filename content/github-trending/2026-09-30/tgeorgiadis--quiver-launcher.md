---
title: "tgeorgiadis/quiver-launcher"
period: "daily"
date: "2026-09-30T00:00:00+08:00"
description: "Quiver Launcher 是一个用 C# 开发的跨平台启动器，可从 GitHub 和 GitLab 发布页下载、安装并运行应用，并支持个人库、社区目录订阅、标签过滤及模组管理。"
repository: "tgeorgiadis/quiver-launcher"
repository_url: "https://github.com/tgeorgiadis/quiver-launcher"
language: "C#"
tags: ["开发工具"]
stars_today: 450
comment: false
---

Quiver Launcher 是一个用 C# 开发的跨平台启动器，可从 GitHub 和 GitLab 发布页下载、安装并运行应用，并支持个人库、社区目录订阅、标签过滤及模组管理。

## 项目做什么

该项目的核心目的是为从 GitHub 和 GitLab 发布资源分发的应用（尤其是游戏移植版、重制版等）提供一个集中的下载、安装、更新与启动管理工具。它通过个人库、社区目录订阅和灵活过滤帮助用户组织大量第三方发布的应用，并额外支持手动管理条目以及 Thunderstore 和 GameBanana 的模组管理。

## 与同类方案相比

根据 README，Quiver Launcher 提供了标签过滤、库内搜索、手动管理应用、社区应用目录订阅、GitHub 与 GitLab 发布安装与更新、Thunderstore 与 GameBanana 模组浏览安装、自动更新和版本管理等功能。它支持 Windows、Linux、Android 和 macOS（开发中），数据可放在可写目录旁实现便携。项目为 GithubLauncher 的分支，并进行了重命名和多项功能扩展。

## 设计与创新

创新点主要体现在集成了社区目录订阅机制，支持从 apps.json 构建个人库，并提供目录变更审查工作流，允许逐应用执行添加、替换、合并、忽略或隐藏操作。合并策略可以在应用目录元数据的同时保留本地额外标签和版本固定。此外还支持手动管理无仓库应用、标签过滤提示以及模组提供方 URL 自动识别。但无法验证这些功能在同类工具中是否为首创。

## 适用场景

适合需要从 GitHub 或 GitLab 发布页获取和更新应用的用户，尤其是管理多个游戏移植版、重制版或独立工具的场景。社区目录订阅适合希望浏览并批量添加社区整理应用列表的用户。模组管理功能适合需要从 Thunderstore 或 GameBanana 安装模组到指定应用目录的用户。手动管理条目适合分发在 itch.io 等没有对应仓库的应用。也可用于开发测试时的本地运行。

## 谁会受益

对于依赖 GitHub/GitLab 发布资源并使用多应用库的用户，该工具可以减少逐个下载、解压、更新和启动的手动操作，并提供统一的搜索、标签和目录管理界面。社区目录可降低发现和添加入口应用的门槛。模组管理集成节省了在不同平台间切换的时间。便携式数据布局和备份恢复文档有利于库的迁移与保护。不过实际体验受网络、API 限流和平台上架情况影响。

## 使用前需要注意

README 明确 macOS 支持仍在进行中。Android 仅支持安装 APK 发布资源，不支持桌面二进制。从 2.4.x 或更早版本升级到 3.x 无法通过应用内更新迁移，需要手动复制库。未提供许可证信息，无法确认开源许可类型。未提供性能数据、竞品对比或独立验证。远程目录依赖社区仓库，可用性受限于该仓库的维护。GitHub 下载在 Linux 上不保留可执行位，需要用户手动设置。

[查看 GitHub 仓库](https://github.com/tgeorgiadis/quiver-launcher)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
