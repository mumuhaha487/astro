---
title: "derv82/wifit3"
period: "daily"
date: "2026-09-26T00:00:00+08:00"
description: "wifit3 是仅支持 USB 无线网卡的跨平台 Wi-Fi 审计工具，基于 Python 实现，内置用户态 mini-driver 直接操作硬件，无需 aircrack-ng 等外部依赖。"
repository: "derv82/wifit3"
repository_url: "https://github.com/derv82/wifit3"
language: "Python"
tags: ["安全"]
stars_today: 168
comment: false
---

wifit3 是仅支持 USB 无线网卡的跨平台 Wi-Fi 审计工具，基于 Python 实现，内置用户态 mini-driver 直接操作硬件，无需 aircrack-ng 等外部依赖。

## 项目做什么

该项目旨在提供一个在 Linux、Windows 和 macOS 上行为一致的 USB 无线审计工具。它通过内置的用户态无线驱动栈直接控制受支持的 USB 网卡，绕过操作系统原生 Wi-Fi 驱动和内核模块，从而避免内核驱动版本兼容问题以及 Windows NDIS 限制。工具需至少一个指定 USB 适配器，用于网络侦察、握手包捕获、WPS 恢复和 WEP 破解等授权安全审计任务。

## 与同类方案相比

wifit3 主要优势包括：跨平台运行，在 Linux、macOS 和 Windows 上保持一致行为；内置 Python 移植的轻量驱动栈，直接通过 USB 批量与控制传输操作硬件，规避内核驱动版本和 NDIS 限制；零运行时依赖，无需安装 aircrack-ng 或 reaver，仅依赖 PyUSB 与 Textual；支持多网卡聚合捕获与专用注入卡；提供预编译二进制及 uv 源码运行和自构建方式；驱动配置可由应用自动完成，并提供卸载恢复机制。

## 设计与创新

其创新点在于将多个 Linux 内核无线驱动以纯 Python 重写为用户态 mini-driver，并直接通过 USB 控制传输实现帧注入和监听模式，从而绕过内核和 NDIS 限制。同时支持多网卡聚合与专用注入卡、VAP 去隐藏、WPA3 降级 EvilTwin、WPS PixieDust 双模式等审计功能。但部分能力为既有无线审计技术的整合或移植，具体新颖程度尚无法独立验证。

## 适用场景

适用于对自有或明确授权网络进行无线安全审计的场景，包括：使用受支持 USB 网卡进行 2.4GHz/5GHz 实时扫描、AP 与客户端识别、隐藏 SSID 发现；捕获 WPA/WPA2 握手包并导出 pcap 与 hc22000；进行 PMKID 采集；对 WPS 执行 PixieDust、PushButton 或 PIN 暴力破解；对 WEP 实施 ARP 重放、ChopChop 等恢复；以及搭建 EvilTwin 进行 WPA3 降级测试。

## 谁会受益

对于安全研究人员和渗透测试人员，它提供无需外部依赖、跨平台的 USB 无线审计工作流，降低了环境配置复杂度；多网卡聚合、实时数据面板和多种捕获导出格式有助于提高审计效率；内置驱动自动配置和卸载机制简化了硬件管理。但其价值受限于必须使用列出的特定芯片组 USB 网卡，且 Windows 和 macOS 支持尚无法从 README 独立验证实际稳定性。

## 使用前需要注意

主要限制包括：必须至少一个受支持的 USB 无线网卡，内置网卡无法使用；支持的芯片组和具体型号有限，未列出的设备无法保证工作；Windows 驱动绑定和 macOS 授权流程可能带来平台差异，实际兼容性尚无法验证；工具直接操作 USB 寄存器，无内核保护，存在风险；仅限授权测试，误用可能违法；此外，未提供性能基准或与同类工具的客观对比，相关优势尚无法独立验证。

[查看 GitHub 仓库](https://github.com/derv82/wifit3)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
