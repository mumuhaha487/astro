---
title: "Lakr233/vphone-cli"
date: "2026-09-16T00:00:00+08:00"
description: "vphone-cli 是 Swift 命令行工具，基于苹果虚拟化框架与 PCC 研究设施，在 Apple Silicon Mac 上创建并启动虚拟 iPhone。"
repository: "Lakr233/vphone-cli"
repository_url: "https://github.com/Lakr233/vphone-cli"
language: "Swift"
stars_today: 907
comment: false
tags:
  - 开发工具
  - 移动端
---

vphone-cli 是 Swift 命令行工具，基于苹果虚拟化框架与 PCC 研究设施，在 Apple Silicon Mac 上创建并启动虚拟 iPhone。

## 项目做什么

该项目用于在 Apple Silicon Mac 上以命令行方式创建、配置、启动和管理虚拟 iPhone。它把固件镜像的下载与合并、启动链补丁、DFU 恢复、CFW 安装和首次启动串成一条流水线，既可用 vm create 一键走完，也可逐步手动执行或只重跑某一阶段。虚拟机、IPSW、工具与 deb 缓存统一放在 ~/.vphone 目录下，可通过环境变量改写位置，从而把数据与签名后的应用包分离，便于移植与脚本化管理。

## 与同类方案相比

按 README 描述，一条 vm create 命令即可完成从下载、打补丁、DFU 恢复到 CFW 安装与首次启动的完整流程，并可按阶段重跑；提供 less、regular、dev、jb、exp 五种逐级增强的补丁变体，其中 less 保留 iOS 缓解措施；支持 APFS 快速克隆、zstd 或 xz 格式的导出导入、列表 JSON 输出、SSH 与 VNC 连接，以及宿主控制套接字用于截图、触摸、按键和剪贴板操作。README 未给出与同类方案对比的性能或效率数据，相关优势尚无法验证。

## 设计与创新

README 称其借助 Apple Virtualization.framework 与 PCC 研究型虚拟机基础设施来引导虚拟 iPhone，这一组合相对少见；它把启动链与 CFW 补丁按安全绕过程度分为五档，并给出各档补丁数量，jb 变体还会在首次启动自动安装 Sileo 与 TrollStore，exp 变体包含反虚拟机检测的研究性补丁。宿主控制套接字可为每个操作返回内联截图，便于 AI 驱动的端到端测试，仓库还提到有配套的 MCP 服务器包装。这些设计是否为行业首创，因缺少对比资料，尚无法验证。

## 适用场景

适用于在 Apple Silicon Mac 上开展 iOS 应用与系统行为的端到端测试、自动化回归、安全与越狱研究、固件补丁分级对比研究，以及在隔离虚拟机中复现问题。README 提到控制套接字可返回内联截图并模拟触摸与硬件按键，适合 AI 驱动的端到端测试，也有第三方 MCP 服务器接入。借助克隆、导出导入和独立设备身份，也便于搭建多台设备的实验环境。但它面向的是模拟化运行环境，不宜作为真实硬件的性能基准或兼容性验收依据。

## 谁会受益

对开发与研究使用者而言，它把固件准备、DFU 恢复与越狱这些步骤封装成可重复执行的命令，状态集中在 ~/.vphone 下，便于脚本化与批量管理；JSON 输出、APFS 克隆、导出导入和宿主控制套接字降低了接入 CI 或自动化测试链路的工作量。五种变体让人按需选择安全绕过程度，less 变体保留 iOS 缓解措施，适合偏保守的测试需求。README 还列出多组已测试的主机型号与 iOS、CloudOS 版本组合，可作为环境选型时的参考依据。

## 使用前需要注意

使用门槛较高：仅支持 Apple Silicon，需要 macOS 15 及以上、Xcode 与 iOS SDK，并须按 README 放宽 SIP/AMFI，否则会出现进程被 killed；自身运行在虚拟机中的 Mac 无法嵌套引导。jb 变体默认越狱并自动安装 Sileo、TrollStore，SSH 默认密码为 alpine，具有安全风险，应仅在受控环境使用。README 提示 iOS 设置时不要选日本或欧盟区域，否则系统应用无法安装；cfw install 在部分 ldid-procursus 版本上可能卡死；部分应用在 iOS 18 基础上需额外补丁。仓库未说明许可证、稳定性承诺与性能数据。

[查看 GitHub 仓库](https://github.com/Lakr233/vphone-cli)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
