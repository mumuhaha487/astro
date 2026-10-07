---
title: "rui314/mold"
period: "daily"
date: "2026-10-07T00:00:00+08:00"
description: "mold 是以 Rust 编写的 Unix 链接器，旨在替代现有链接器并缩短编译项目的链接阶段。它支持多种 CPU 架构，并提供通过编译器参数、Cargo 配置或 mold -run 接入构建流程的方式。"
repository: "rui314/mold"
repository_url: "https://github.com/rui314/mold"
language: "Rust"
tags: ["开发工具"]
stars_today: 168
comment: false
---

mold 是以 Rust 编写的 Unix 链接器，旨在替代现有链接器并缩短编译项目的链接阶段。它支持多种 CPU 架构，并提供通过编译器参数、Cargo 配置或 mold -run 接入构建流程的方式。

## 项目做什么

项目针对 C、C++、Rust 等编译型语言构建流程中的链接阶段：将目标文件组合成可执行文件或共享库。README 将大型项目的链接耗时以及频繁调试、修改、重建带来的等待列为主要问题，并将 mold 定位为现有 Unix 链接器的替代方案。

## 与同类方案相比

README 提供了两种机器、多个大型项目及不同构建类型的基准数据；在列出的 Threadripper 测试中，mold 的链接时间普遍短于 lld，M1 Ultra 测试结果则因项目而异。项目还说明支持多种处理器架构，并列出 CI、多架构测试和发布前 Gentoo 软件包构建检查等维护措施。以上优势均依据 README 所述，不能据此推断其他环境表现。

## 设计与创新

README 将性能来源归因于广泛并行处理以及高效的数据结构和算法，并称项目从头实现，以避免作者在优化 lld 时遇到的架构限制。它还提供 mold -run：在 Linux 和 FreeBSD 上拦截特定链接器程序调用并转向 mold。具体算法设计和相对既有方案的创新程度，单凭简介与 README 尚无法独立验证。

## 适用场景

适用于 Unix 上需要链接大量目标文件的构建，尤其是大型 C、C++ 或 Rust 项目，以及频繁调试和重建的工作流。README 给出了 Clang、GCC、Cargo、Nim 和 Conan 的配置示例，也介绍了 GitHub Actions 接入方式；当构建系统难以直接指定链接器时，可尝试以 mold -run 启动构建命令。

## 谁会受益

如果构建时间确实受链接阶段影响，替换链接器可能减少等待，并可用于本地开发或持续集成。README 提供了编译安装步骤、常见工具链配置方法，以及通过输出文件 .comment 节确认是否使用 mold 的方法，有助于实施和核验；实际收益仍需在目标项目、机器和配置上测试。

## 使用前需要注意

mold 需要 Rust 1.95 或更高版本，并且构建时还需要 Git 与 C 编译器；可用预编译包和架构支持情况应按目标系统核实。README 的性能数据限定于特定硬件、软件版本、选项和运行次数，不能保证其他环境的结果；部分 wild 基准标为 N/A，且其 Chromium release 测试未启用相同的 identical code folding 条件。许可证及完整的平台兼容边界在给定材料中未说明。

[查看 GitHub 仓库](https://github.com/rui314/mold)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
