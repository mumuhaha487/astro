---
title: "moeru-ai/airi"
period: "daily"
date: "2026-09-29T00:00:00+08:00"
description: "AIRI 是一个自托管、用户拥有的数字生命与虚拟角色项目，灵感来自 Neuro-sama。支持实时语音聊天、游玩 Minecraft 和 Factorio，覆盖 Web、macOS 与 Windows 平台，使用 TypeScript 与 Web 技术构建。"
repository: "moeru-ai/airi"
repository_url: "https://github.com/moeru-ai/airi"
language: "TypeScript"
tags: ["AI","游戏","音视频"]
stars_today: 274
comment: false
---

AIRI 是一个自托管、用户拥有的数字生命与虚拟角色项目，灵感来自 Neuro-sama。支持实时语音聊天、游玩 Minecraft 和 Factorio，覆盖 Web、macOS 与 Windows 平台，使用 TypeScript 与 Web 技术构建。

## 项目做什么

项目旨在让用户拥有可自主掌控的数字生命或虚拟伴侣，不仅限于文字聊天，还能进行游戏、语音交互及跨平台陪伴。它尝试复现类似 Neuro-sama 的虚拟主播能力，提供自托管方案，使用户在任何时间、任何地点都能与自己的 AI 角色互动，并支持通过浏览器、桌面应用及移动端访问。

## 与同类方案相比

项目从第一天起便基于 WebGPU、WebAudio、Web Workers、WebAssembly、WebSocket 等 Web 技术构建，便于在现代浏览器和移动设备上运行并已支持 PWA。桌面版默认利用 NVIDIA CUDA 和 Apple Metal 进行本地推理，兼顾性能与依赖管理。已具备语音识别、多提供商语音合成、VRM 与 Live2D 模型控制等能力，并支持 Minecraft、Factorio 等游戏交互。

## 设计与创新

AIRI 强调自托管与用户所有权，并尝试将数字生命能力扩展到游戏与实时语音场景。其创新点在于借助 Web 技术栈实现跨平台运行，同时保留桌面端原生推理能力；在浏览器内集成数据库、语音识别与合成，并支持连接 Discord 语音频道、游玩 Minecraft 与 Factorio。这些方向在同类开源虚拟主播项目中具有一定差异性，但具体创新程度尚无法完全验证。

## 适用场景

适用于希望拥有个人数字伴侣或虚拟角色的用户，可用于日常语音聊天、文字互动、陪伴游戏（如 Minecraft 与 Factorio）、在 Discord 或 Telegram 中参与群聊，以及通过 VRM 或 Live2D 模型进行虚拟形象展示。也适合开发者研究数字生命、语音交互、游戏 AI 及 Web 技术集成等方向。

## 谁会受益

对于想要自托管、可控且跨平台的虚拟伴侣的用户，AIRI 提供了相对完整的语音、视觉与游戏交互功能。它集成了多种语音合成提供商、支持本地推理、具备浏览器数据库与记忆系统雏形，并允许多平台安装。项目仍在早期开发阶段，但已具备可运行的功能和社区协作渠道，对相关领域开发者与爱好者有参考和实用价值。

## 使用前需要注意

项目仍处于早期开发阶段，部分功能如 Factorio 游玩、记忆系统、浏览器内 WebGPU 推理等尚在开发或概念验证中，Helldivers 2 合作游玩也未完成。文档未提供具体性能数据、竞品对比或生产环境验证，因此无法确认其稳定性与性能表现。此外，项目未明确说明许可证细节，也未证实是否完全达到 Neuro-sama 的能力水平。

[查看 GitHub 仓库](https://github.com/moeru-ai/airi)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
