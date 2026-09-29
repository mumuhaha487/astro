---
title: "openai/tart"
period: "daily"
date: "2026-09-29T00:00:00+08:00"
description: "Tart 是面向 Apple Silicon 的虚拟化工具集，用于构建、运行和管理 macOS 与 Linux 虚拟机，由 CI 工程师开发，支持从 OCI 容器仓库推送拉取镜像，并可集成到各类持续集成系统中。"
repository: "openai/tart"
repository_url: "https://github.com/openai/tart"
language: "Swift"
tags: ["开发工具","云服务"]
stars_today: 211
comment: false
---

Tart 是面向 Apple Silicon 的虚拟化工具集，用于构建、运行和管理 macOS 与 Linux 虚拟机，由 CI 工程师开发，支持从 OCI 容器仓库推送拉取镜像，并可集成到各类持续集成系统中。

## 项目做什么

Tart 的目标是在 Apple Silicon 设备上提供 macOS 和 Linux 虚拟机的构建、运行与管理能力，并面向 CI 及其他自动化场景。README 强调它由 CI 工程师打造，可直接嵌入持续集成流程，同时提供克隆与运行虚拟机的简单命令，降低在苹果芯片环境里准备可复用虚拟机镜像的操作门槛。

## 与同类方案相比

根据 README，Tart 基于 Apple 的 Virtualization.Framework，称可获得接近原生的性能，并给出 Geekbench 对比链接作为参考；它支持从任何兼容 OCI 的容器仓库推送和拉取虚拟机，便于分发镜像；可配合 Tart Packer Plugin 自动化创建虚拟机；并能较容易地集成到任意 CI 系统。README 还列出多家公司在内部使用，但未展开具体性能、竞品差异或授权信息。

## 设计与创新

README 强调的差异点是把虚拟机镜像与 OCI 兼容的容器仓库打通，从而用容器仓库的推送拉取方式分发 macOS 与 Linux 虚拟机；同时提供 Tart Packer Plugin 来自动化虚拟机创建，并将产品定位为面向 CI 和自动化、基于 Apple Virtualization.Framework 的工具集。README 没有与其他虚拟化方案做系统对比，因此其独特性或首创性尚无法从现有材料验证。

## 适用场景

典型场景包括在 Apple Silicon 上为 CI 流水线准备可复用的 macOS 和 Linux 虚拟机镜像，将镜像推送到兼容 OCI 的容器仓库再拉取运行，使用 Tart Packer Plugin 自动生成虚拟机模板，以及在需要自动化管理苹果芯片虚拟机的开发与测试流程中使用。README 列出的使用者多为企业或 CI 相关组织，说明其可用于内部工程与自动化环境。

## 谁会受益

对在 Apple Silicon 上运行 CI 与自动化任务的团队，Tart 提供了命令行工具来克隆和运行虚拟机，示例命令可直接下载并启动一个 macOS 基础镜像，降低初始搭建成本。基于 Virtualization.Framework 的设计有助于在苹果原生虚拟化上运行工作负载；OCI 仓库推送拉取方式便于镜像版本管理和分发；与 CI 系统的集成定位也符合持续集成需求。实际收益仍需按本团队工作负载评估。

## 使用前需要注意

README 注明运行环境要求为搭载 Apple Silicon 且 macOS 13.0 Ventura 或更新版本，示例下载镜像约 25 GB，对存储与网络有要求。它依赖 Apple 的 Virtualization.Framework，因而限定在苹果生态，非 Apple Silicon 或非 macOS 平台无法使用。README 未说明许可协议、具体性能数据、资源占用或竞品对比，这些方面尚无法从给定材料验证。

[查看 GitHub 仓库](https://github.com/openai/tart)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
