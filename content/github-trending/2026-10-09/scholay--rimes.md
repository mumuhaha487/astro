---
title: "scholay/rimes"
period: "daily"
date: "2026-10-09T00:00:00+08:00"
description: "RIMES（对外产品名为灵犀输入法）是基于 RIME/librime 的多平台输入法项目，除输入方案外，还围绕 Buffer、Capsule 和 Mailbox 提供文本处理、内容管理与会话窗口。"
repository: "scholay/rimes"
repository_url: "https://github.com/scholay/rimes"
language: "Swift"
tags: ["其他"]
stars_today: 253
comment: false
---

RIMES（对外产品名为灵犀输入法）是基于 RIME/librime 的多平台输入法项目，除输入方案外，还围绕 Buffer、Capsule 和 Mailbox 提供文本处理、内容管理与会话窗口。

## 项目做什么

项目旨在把常用输入法能力与翻译、AI 文本生成或改写、剪贴板和资料管理等工作放在输入过程附近，减少用户在应用间切换。Buffer 用于编辑并确认后投递文本，Capsule 管理近期复制内容及本地资料，Mailbox 承载 AI 会话、备注和外部推送审核。不同平台的功能范围并不完全一致。

## 与同类方案相比

README 描述了多种输入方案，包括全拼、双拼、五笔、英文及并击扩展，并说明安装包可自带 librime 和词库。Buffer、Capsule、Mailbox 各有独立用途和快捷键；插件可启用或选装，升级时保留既有插件状态。文档也列出平台构建方式、功能边界及部分已知问题，便于用户判断适用范围。

## 设计与创新

项目将输入法扩展为文本缓冲工作台、资料管理入口和会话窗口，并以插槽式平台承接这些功能；这是 README 对其架构的自述。项目还提供并击输入、插件式翻译和 AI 处理等能力。不过，现有资料不足以独立验证其“首创”说法，也没有提供与其他产品的系统比较，因此无法据此确认其创新程度或独特性。

## 适用场景

适用于希望在输入时先整理、翻译或改写文本，并在确认后提交到当前输入框的用户；也可用于暂存剪贴板内容、整理笔记或文件、查看密码类条目，以及通过 Mailbox 管理 AI 对话和待审核推送。实际使用取决于平台：例如 Linux 尚无 Mailbox，iOS 的功能说明侧重键盘、主 App 与 Buffer。

## 谁会受益

若用户需要多种中文输入方案，并希望把文本处理、剪贴板整理和 AI 会话纳入同一输入法产品，RIMES 可作为一套覆盖这些流程的工具。README 给出了快捷键、插件默认状态、存储范围和权限要求等信息，有助于在安装前评估。该项目也面向开发者提供源码构建入口及架构、平台和发布文档。

## 使用前需要注意

项目依赖 macOS、Windows、iOS、Android 与 Linux 各自的输入法接口，功能并非全平台一致；Capsule 粘贴需要辅助功能授权，未授权时只进入系统剪贴板。切换到其他输入法后，部分 Buffer 操作会降级，Mailbox 和 Capsule 窗口也可能先切换当前输入法。README 披露了 macOS 沙盒应用闪退报告及 Linux 部署、工具栏问题；性能、隐私实践的独立验证和竞品比较资料不足。

[查看 GitHub 仓库](https://github.com/scholay/rimes)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
