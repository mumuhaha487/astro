---
title: "clash-verge-rev/clash-verge-rev"
period: "daily"
date: "2026-09-24T00:00:00+08:00"
description: "Clash Verge Rev 是基于 Tauri 2 与 Rust 的 Clash Meta GUI 客户端，支持 Windows、macOS 和 Linux，内置 mihomo 内核，提供代理配置、可视化编辑、系统代理与 TUN 模式等功能。"
repository: "clash-verge-rev/clash-verge-rev"
repository_url: "https://github.com/clash-verge-rev/clash-verge-rev"
language: "Rust"
tags: ["开发工具","安全"]
stars_today: 395
comment: false
---

Clash Verge Rev 是基于 Tauri 2 与 Rust 的 Clash Meta GUI 客户端，支持 Windows、macOS 和 Linux，内置 mihomo 内核，提供代理配置、可视化编辑、系统代理与 TUN 模式等功能。

## 项目做什么

该项目旨在为 Clash Meta 内核提供一款跨平台图形界面客户端，让用户能够以可视化方式管理代理配置、节点与规则，并简化系统代理与 TUN 模式的启用流程。它承接原 Clash Verge 项目，延续在 Windows、macOS 和 Linux 上提供统一代理体验的目标，同时通过内置 mihomo 内核和可切换的 Alpha 内核来适配不同使用需求。

## 与同类方案相比

项目采用 Rust 与 Tauri 2 构建，官方宣称具备较强性能；内置 mihomo 内核，减少用户自行配置内核的步骤，并支持切换 Alpha 版本内核。界面支持自定义主题颜色、代理组和托盘图标，还允许 CSS 注入以调整外观。配置文件管理提供 Merge 与 Script 增强及语法提示，同时具备系统代理与守卫、TUN 模式、可视化节点与规则编辑以及 WebDav 备份同步等功能。

## 设计与创新

从 README 可知，项目在原 Clash Verge 基础上延续开发，并采用 Tauri 2 框架与内置 mihomo 内核。其特色集中在配置管理增强，例如 Merge 和 Script 方式合并配置、配置文件语法提示，以及 CSS 注入和自定义代理组与托盘图标。不过，这些功能是否属于行业首创，或与其他同类 GUI 相比有何独特技术突破，README 未提供充分依据，因此尚无法验证。

## 适用场景

适用于需要在 Windows、macOS 或 Linux 桌面环境中使用 Clash Meta 规则代理的用户，例如日常科学上网、按规则分流访问不同网络资源，以及通过系统代理或 TUN 模式接管全局流量。对于希望可视化编辑节点和规则、维护多份配置文件并借助 Merge 与 Script 进行配置增强的用户，也能提供对应操作界面。此外，WebDav 同步适合在多设备间备份和同步配置。

## 谁会受益

项目为 Clash Meta 用户提供了图形化操作入口，降低了直接编辑配置文件的难度，并通过内置内核减少额外安装步骤。配置文件管理、语法提示、可视化节点与规则编辑等功能有助于提升配置维护效率，系统代理与 TUN 模式则方便在不同网络场景下切换接管方式。WebDav 同步和主题自定义也增加了日常使用的便利性，因此对偏好桌面 GUI 的代理用户具有实际使用价值。

## 使用前需要注意

README 未说明具体性能指标、资源占用或与其他客户端的详细对比，因此无法验证其性能优势。项目依赖 Clash Meta/mihomo 内核，功能范围受内核能力限制。虽然提及支持多平台，但未列出各平台的具体版本要求与兼容性细节。Alpha 版本被标记为废弃，AutoBuild 可能存在缺陷，稳定版之外的发布渠道风险未充分说明。此外，软件采用 GPL-3.0 许可证，使用与分发需遵循相应条款。

[查看 GitHub 仓库](https://github.com/clash-verge-rev/clash-verge-rev)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
