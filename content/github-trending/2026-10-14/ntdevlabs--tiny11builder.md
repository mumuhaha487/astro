---
title: "ntdevlabs/tiny11builder"
period: "daily"
date: "2026-10-14T00:00:00+08:00"
description: "Tiny11 Builder 是一款以 C# 编写的原生 WinUI 应用，用于选择 Windows 11 镜像内容并构建精简或自定义 ISO；支持 Tiny11、Tiny11 Core 和自定义模式。"
repository: "ntdevlabs/tiny11builder"
repository_url: "https://github.com/ntdevlabs/tiny11builder"
language: "C#"
tags: ["开发工具"]
stars_today: 132
comment: false
---

Tiny11 Builder 是一款以 C# 编写的原生 WinUI 应用，用于选择 Windows 11 镜像内容并构建精简或自定义 ISO；支持 Tiny11、Tiny11 Core 和自定义模式。

## 项目做什么

项目面向希望调整 Windows 11 安装镜像的用户，提供从官方镜像下载或使用自有镜像、选择要移除的内容并生成 ISO 的操作流程。仓库还保留原有的 PowerShell 构建器；README 未说明两者在功能或维护状态上的具体差异。

## 与同类方案相比

README 列出三种构建方式：Tiny11 移除捆绑应用和不需要的功能，同时保留更新、Defender 和恢复支持；Tiny11 Core 进一步精简；Custom 则允许逐项选择应用、组件、功能和服务。另有 Turbo 模式及部分中断构建的续接能力，但未提供速度提升幅度或续接覆盖范围的完整细节。

## 设计与创新

现有信息可以确认该仓库提供 WinUI 图形界面，并把镜像内容选择与构建选项整合在应用中；README 也说明原有 PowerShell 构建器仍在仓库内。但没有足够资料判断这些设计相对其他工具是否新颖，或是否构成经过验证的技术创新。

## 适用场景

适用于希望制作包含较少捆绑应用或特定组件的 Windows 11 ISO，并愿意自行测试安装结果的用户。README 提供 x64 和 ARM64 下载选择，要求管理员批准；使用前可参考仓库中的用法、兼容性和构建说明，并按建议先在虚拟机中测试 ISO。

## 谁会受益

当用户希望通过图形界面控制镜像中要保留或移除的项目时，该工具提供了比单一固定精简方案更细的选择入口。不同模式对应不同的精简范围；Turbo 和已提交或压缩阶段的进度保存与续接，也可能对相关构建流程有帮助，具体效果取决于实际使用条件。

## 使用前需要注意

README 明确指出 Tiny11 Core 不支持更新或维护；受保护项目的自定义移除可能导致 Windows 无法正常工作。部分 Core 或组件存储移除会自动使用旧版 Windows 安装程序。文档未给出完整兼容性范围、精简后体积、性能数据或各选项的详细影响，因此这些事项不能仅凭简介确认。

[查看 GitHub 仓库](https://github.com/ntdevlabs/tiny11builder)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
