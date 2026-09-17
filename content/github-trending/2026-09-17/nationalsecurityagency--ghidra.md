---
title: "NationalSecurityAgency/ghidra"
period: "daily"
date: "2026-09-17T00:00:00+08:00"
description: "Ghidra 是由美国国家安全局研究部门创建并维护的软件逆向工程框架，提供反汇编、汇编、反编译、绘图与脚本等功能，支持在 Windows、macOS 和 Linux 上分析编译代码。"
repository: "NationalSecurityAgency/ghidra"
repository_url: "https://github.com/NationalSecurityAgency/ghidra"
language: "Java"
tags: ["安全","开发工具"]
stars_today: 1059
comment: false
---

Ghidra 是由美国国家安全局研究部门创建并维护的软件逆向工程框架，提供反汇编、汇编、反编译、绘图与脚本等功能，支持在 Windows、macOS 和 Linux 上分析编译代码。

## 项目做什么

该项目的目标由美国国家安全局研究局在网络安全使命下提出，用于解决复杂软件逆向工程中的规模化与团队协作问题，并提供可定制、可扩展的逆向工程研究平台。README 说明 NSA 已将其能力用于分析恶意代码，并为逆向分析人员生成深入见解，以帮助理解网络和系统中可能存在的漏洞。

## 与同类方案相比

Ghidra 包含一套功能完整的高端软件分析工具，具备反汇编、汇编、反编译、绘图和脚本等能力，并声称还有数百项其他功能。它支持多种处理器指令集和可执行格式，可在 Windows、macOS 和 Linux 运行，也能以用户交互或自动化模式工作。用户可用 Java 或 Python 开发扩展组件和脚本，并可通过 Eclipse 的 GhidraDev 插件或 Visual Studio Code 集成进行开发。上述优势来自 README 描述，未提供与同类工具的性能或功能对比数据，因此无法验证其相对优势。

## 设计与创新

README 将 Ghidra 的创新点表述为面向复杂逆向工程中的规模化与团队协作问题，并定位为可定制、可扩展的逆向工程研究平台；同时，它提供用户交互和自动化两种运行模式，支持 Java 与 Python 扩展开发，并提供 PyGhidra 启动方式。不过，仓库简介和 README 没有给出与既有工具的具体技术对比、基准测试或独立评估，因此这些创新点的独特性和实际效果尚无法从给定材料中验证。

## 适用场景

Ghidra 可用于在 Windows、macOS 和 Linux 平台上分析编译后的代码，适用于逆向工程分析、恶意代码分析以及帮助分析人员理解网络和系统中潜在漏洞等场景。它既可在用户交互模式下使用，也可在自动化模式下运行。用户还可以用 Java 或 Python 编写自定义脚本和扩展组件，或使用 Eclipse 的 GhidraDev 插件和 Visual Studio Code 集成进行开发。README 还提到可通过 PyGhidra 启动。

## 谁会受益

对于需要分析编译代码的逆向工程人员和安全研究人员，Ghidra 提供反汇编、反编译、绘图和脚本等工具，并支持多种处理器与可执行格式，覆盖 Windows、macOS 和 Linux。其可扩展性允许团队按需开发脚本和扩展，交互与自动化模式也便于不同工作流程。安装官方预构建版本需要 JDK 25 64 位，从源码构建还需 Gradle、Python3、GCC 或 Clang、make，以及 Windows 上的 Visual Studio 相关组件。README 未提供性能、许可证或竞品比较信息。

## 使用前需要注意

README 明确警告某些版本的 Ghidra 存在已知安全漏洞，用户应阅读安全公告以了解潜在影响。安装与构建有较具体的前置要求，例如 JDK 25 64 位、Gradle 9.1.0+、Python3 3.9 到 3.14、GCC 或 Clang、make，以及 Windows 上的 Visual Studio 组件；官方多平台发布文件需按指定名称下载，且不应解压覆盖现有安装。GhidraDev 和 Visual Studio Code 集成只支持针对完整构建的 Ghidra 安装进行开发，高级开发推荐使用 Eclipse。README 未说明许可证、性能基准或与其他工具的优势对比，这些方面无法验证。

[查看 GitHub 仓库](https://github.com/NationalSecurityAgency/ghidra)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
