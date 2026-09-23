---
title: "stablyai/orca"
period: "weekly"
period_key: "weekly-2026-w39"
date: "2026-09-23T00:00:00+08:00"
description: "Orca 是面向并行 AI 编码代理的 ADE（Agent Development Environment），由 stablyai 以 TypeScript 开发并开源（MIT）。它把多个 CLI 编码代理放进各自隔离的 git worktree 并行运行，并统一跟踪、对比与合并结果。"
repository: "stablyai/orca"
repository_url: "https://github.com/stablyai/orca"
language: "TypeScript"
tags: ["AI","开发工具"]
comment: false
---

Orca 是面向并行 AI 编码代理的 ADE（Agent Development Environment），由 stablyai 以 TypeScript 开发并开源（MIT）。它把多个 CLI 编码代理放进各自隔离的 git worktree 并行运行，并统一跟踪、对比与合并结果。

## 项目定位与要解决的问题

Orca 的定位是「并行代理时代的开发环境」，而非单一编码助手。它假设开发者会同时驱动多个代理，因此把编排、隔离、评审、结算作为一等公民。官方口号面向「100x builders」，强调用一支代理舰队而非一个代理来推进工作。桌面端覆盖 macOS、Windows、Linux，另有 iOS/Android 移动伴侣应用，以及可运行在无头 Linux 服务器上的 serve 模式，形成桌面、移动、远程运行时三端可用。项目采用 MIT 许可开源，同时提供官方下载、Homebrew cask 与 Arch AUR 安装渠道，并保留云端 relay 组件以支撑移动端与桌面主机的配对。

## 核心能力

核心是「一条提示词 → 多个并行代理 → 一个可比较的收敛点」。README 描述的做法是把同一提示词扇出给最多五个代理，每个代理在独立的 git worktree 中运行，互不污染工作区；完成后横向对比产出，选取胜出者合并。配套能力围绕这一核心展开：并排与标签式分割视图、跨 worktree 的快速跳转搜索、代理完成通知与未读状态、Claude 与 Codex 的用量与限流重置展示、账号热切换、在 diff 行上留注释并回传给代理。设计模式则把真实 Chromium 窗口中被点选元素的 HTML、CSS 与裁剪截图直接注入代理提示词，缩短从界面观察到修改的路径。

## 技术结构与实现思路

从 README 可见的结构线索是：主体为 TypeScript 桌面应用，内置基于 Ghostty 级别、WebGL 渲染的终端，支持无限分割与重启后保留的滚动回看；内置 VS Code 风格编辑器并全局自动保存，文件与图片可拖入代理提示词。终端、编辑器、浏览器（Chromium 窗口）与 git 操作在同一工作空间内协同。远程能力通过 SSH worktree 实现，代理跑在远端机器上，仍保有完整文件编辑、git 与终端，并带自动重连与端口转发。仓库中还包含 cloud/ 目录，是一个独立的 pnpm workspace，承载移动端与桌面主机配对的 relay。另有 orca CLI，可脚本化创建 worktree、快照、点击与填表等操作。

## 实际工作流程

典型流程是：在 Orca 内从 GitHub PR、issue 或 Linear 任务直接开出 worktree，把提示词扇出给多个代理并各自在隔离工作区执行；通过终端分割与工作树视图同时观察进度，代理完成时收到通知，未读状态便于稍后回看。产出阶段浏览 diff、在具体行上写注释并回传代理继续修改，再在 Orca 内完成评审、编辑与提交，或把胜出的 worktree 合并。需要真实交互时可用 Computer Use 让代理操作桌面应用，或经 CLI 用 snapshot/click/fill 驱动界面。离开电脑后，移动伴侣应用负责接收完成通知并发送后续指令，远程则通过 SSH worktree 把重负载放到远端机器。

## 与同类方案的取舍

README 中最明确的差异点是供应商中立：Orca 声称支持任意 CLI 代理，只要能在终端运行就能在 Orca 跑，并列出 Claude Code、Codex、Grok、Cursor、Copilot、OpenCode、Gemini 系的 Antigravity、Devin、Goose、Qwen Code、Kimi、Kiro 等一长串代理，且强调使用用户自己的订阅而非绑定某一家的计费。相对单一代理 IDE 的形态差异在于把「多代理并行 + worktree 隔离 + 横向对比合并」做成主流程，并用移动伴侣、SSH 工作树、Design Mode、diff 批注、CLI 与 Computer Use 把编排延伸到手机、远端机器与真实 UI 交互。终端、编辑器、浏览器与 git 集成在同一应用内，目标是减少上下文切换。需要注意的是，上述能力与「每日发版、功能列表永远滞后」的表述均来自项目方自述，README 未提供与具体竞品的第三方对比或性能基准，因此不宜据此断言领先幅度。

## 值得关注的设计

从 README 描述看，Orca 的核心创新点不在单个 Agent 的智能水平，而在编排层：它把同一个提示词扇出到多个 Agent，每个 Agent 运行在各自隔离的 git worktree 中，最后对比结果并合并胜出者。这一模式把并行探索变成可比较、可回退的工作流，而非简单地开多个终端。另一个差异化设计是把移动端作为配套伴侣应用，用手机监听 Agent 完成状态并发送后续指令，使长时运行的 Agent 不必绑定在桌面屏幕前。此外，Design Mode 允许在真实 Chromium 窗口中点选界面元素，把它对应的 HTML、CSS 与裁剪截图直接注入 Agent 提示词，缩短了从视觉问题到可执行描述之间的转换。SSH Worktrees 则支持把 Agent 放到性能更强的远程机器上运行，同时保持完整文件编辑、git 与终端能力，并附带自动重连与端口转发。这些能力组合起来，构成了一个以多 Agent 调度为中心的开发环境，而非单纯的编辑器或终端工具。

## 适用领域和具体场景

README 给出的典型场景包括：把一个提示词同时交给多个 Agent 并比较各自的实现方案，用于探索性开发或方案选型；在独立的 worktree 中并行推进多个互不干扰的任务；把 Agent 放在远程高性能服务器上执行重负载任务，本地只做交互。Design Mode 适合前端与 UI 调试场景，开发者点选页面元素即可把结构、样式和截图交给 Agent 修复。GitHub 与 Linear 的原生集成使开发者可以直接从 PR、Issue 或项目看板打开对应 worktree，在 Orca 内完成审阅而无需切换上下文。对 AI 生成的 diff 添加逐行注释并回传给 Agent，适合代码评审与迭代修改。Orca CLI 通过 worktree create、snapshot、click、fill 等命令，让 Agent 反过来驱动 Orca，把端到端流程脚本化，例如自动创建环境、填表、点击乃至操作桌面应用（Computer Use）。移动端则适用于离开工位后继续监控和跟进 Agent 的长时间任务。

## 哪些人会受益

目标人群是同时调度多个编码 Agent 的开发者，README 用“100x builders”来概括这类用户：他们不满足于一次只跟一个 Agent 对话，而是希望并行铺开多个尝试并快速筛选结果。支持 macOS、Windows、Linux 桌面端，加上 iOS 与 Android 伴侣应用，说明它覆盖多平台开发者。由于明确宣称支持任意 CLI Agent，并列出 Claude Code、Codex、Cursor、GitHub Copilot、Devin、Goose、Qwen Code、Kimi、Droid 等大量具体工具，受众并不被锁定在某一家模型或厂商生态内。对已经在为这些 Agent 付费、希望直接复用自有订阅而非再购买一层推理额度的用户，README 强调“Run any coding agent with your own subscription”，这一点具有针对性。此外，把 Agent 跑在远程机器、需要从手机盯进度的独立开发者或小团队也属于典型使用者。仓库还包含移动配对中继的 cloud/ 目录与贡献指南，说明也有面向贡献者和自托管场景的开发者受众。

## 上手、部署与集成

项目以 MIT 许可证开源，桌面端提供 macOS Apple Silicon 与 Intel 的 dmg、Windows exe、Linux AppImage，并支持 Homebrew cask 与 Arch AUR 安装。移动端在 App Store 上架，另有 TestFlight 与 Android APK，README 中显示的 Android 版本为 0.0.50。仓库还暴露了 headless Linux 服务器与 orca serve 的使用路径，以及 cloud/ 下的移动配对流中继。社区渠道包括 Discord、X 账号与微信群，并提供多语言 README 与功能请求入口。Windows 代码签名由 SignPath.io 赞助、证书来自 SignPath Foundation。README 称项目每日发布，并把 changelog 视作真正的功能列表，同时用发布下载量徽章与 star 历史图来呈现采用趋势。需要说明的是，这些采用信号来自项目自身的 README 陈述，未经过独立核实。

## 限制与风险

README 是一份推广性质文档，几乎所有性能与能力表述都属于项目方自述，缺少第三方基准或可复现的测试数据，因此“Ghostty-class”“100x builders”等说法只能视为营销措辞而非已验证指标。文中未给出并行 Agent 数量、worktree 创建耗时、终端渲染帧率等具体数字，无法据此判断真实性能边界。它没有与其他 ADE 或编排工具做任何可比较的对照，也未提及失败场景、已知缺陷或资源占用情况。使用 git worktree 做隔离意味着同一仓库会有多份工作副本，磁盘与依赖安装成本会随并行度上升，这一点 README 未讨论。对 Git 仓库的依赖也意味着非 Git 工作流不在支持范围内。此外，多数能力依赖外部 CLI Agent 自身的可用性与订阅条款，Orca 无法控制这些上游变化；移动端需要与桌面配对，Android 仍以 APK 形式分发，版本号明显早于 1.0，暗示成熟度有限。

## 综合观察

Orca 的定位是一个围绕多 Agent 并行的编排型开发环境，而非又一个代码补全插件。它最有价值的设计是把 git worktree 作为并行隔离单位，并让结果可比较、可合并，这为 Agent 探索提供了比“多开终端”更结构化的路径；移动伴侣、Design Mode 与 SSH worktree 则分别缓解了盯守、描述 UI 问题和本地算力不足三类实际摩擦。以 MIT 开源、支持任意 CLI Agent、复用用户自有订阅，也降低了尝试门槛并避免了模型绑定。但需要清醒看到，README 中的能力与性能描述几乎全部来自项目方，缺少独立验证，且项目仍处于版本号明显未到 1.0 的阶段，每日发布的节奏也可能带来稳定性波动。是否值得采用，取决于读者是否真的需要同时运行多个 Agent，以及能否接受依赖 Git 工作流与外部 Agent 的约束。就定位而言，它切入的是一个正在增长但尚未标准化的细分领域，方向合理，效果仍需实际使用来检验。

[查看 GitHub 仓库](https://github.com/stablyai/orca)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
