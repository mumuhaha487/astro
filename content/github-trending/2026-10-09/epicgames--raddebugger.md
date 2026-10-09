---
title: "EpicGames/raddebugger"
period: "daily"
date: "2026-10-09T00:00:00+08:00"
description: "RAD Debugger 是以 C 编写的原生用户态多进程图形调试器，并配套自定义调试信息格式 RDI、转换工具 radbin 和面向 x64 PE/COFF 的 RAD Linker。项目仍处于 Alpha 阶段。"
repository: "EpicGames/raddebugger"
repository_url: "https://github.com/EpicGames/raddebugger"
language: "C"
tags: ["开发工具"]
stars_today: 279
comment: false
---

RAD Debugger 是以 C 编写的原生用户态多进程图形调试器，并配套自定义调试信息格式 RDI、转换工具 radbin 和面向 x64 PE/COFF 的 RAD Linker。项目仍处于 Alpha 阶段。

## 项目做什么

项目旨在提供本机程序调试工具，并围绕调试信息处理和链接构建扩展工具链。当前调试器面向 Windows x64、本机进程及 PDB 调试信息；它会将 PDB 按需转换为 RDI 再供调试器使用。README 还介绍了面向大型项目的链接器及其与调试器的配合方式。

## 与同类方案相比

README 描述了调试器、调试信息格式、转换工具和链接器之间的配套关系：RDI 可由 radbin 从原生调试信息转换而来，链接器也可选择直接生成 RDI，以省去调试时的按需转换。项目提供 Windows 与 Linux x64 的本地构建说明；但 Linux 构建开发环境的存在不代表 Linux 调试已经可用。

## 设计与创新

项目采用自定义 RDI 格式作为调试器使用的调试信息表示，并提供解析库及进行中的构造、序列化库；radbin 可转换和输出 RDI 内容。RAD Linker 还可原生生成 RDI，并针对大型 x64 PE/COFF 链接项目设计。上述是 README 所述的设计特点；其相对其他方案的创新程度及优势尚无法独立验证。

## 适用场景

现阶段较明确的使用场景是 Windows x64 本机开发调试，以及大型 x64 项目生成 PE/COFF 可执行文件并进入编译—调试循环。radbin 适用于调试信息格式转换和 RDI 内容检查。README 将 Linux 本机调试、远程调试和其他架构列为后续方向，而非当前已支持的场景。

## 谁会受益

对采用 Windows x64、PDB 和本机调试流程的开发者，项目可提供图形调试器及相邻的调试信息转换工具；大型链接项目也可评估 RAD Linker。README 报告其测试案例中，调试信息达到数 GB 时链接时间快 50%，启用大页还可进一步减少 25%；这些数字受测试环境和项目条件影响，不能直接视为普遍结果。

## 使用前需要注意

README 明确标注调试器处于 Alpha 阶段，并请求用户提交问题与复现材料，说明可靠性仍在验证。当前调试仅支持本机 Windows x64 与 PDB；Linux 调试和 DWARF 支持属于计划工作。链接器尚不支持链接时优化，且启用 Windows 大页可能造成内存碎片，文档仅建议在可重置的 Docker 或虚拟机环境中使用。与其他调试器或链接器的比较、许可证信息及其相对优势，依据现有材料无法验证。

[查看 GitHub 仓库](https://github.com/EpicGames/raddebugger)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
