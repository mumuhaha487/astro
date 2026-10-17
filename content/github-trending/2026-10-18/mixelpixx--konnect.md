---
title: "mixelpixx/Konnect"
period: "daily"
date: "2026-10-18T00:00:00+08:00"
description: "Konnect 是面向 KiCad 10 的 Rust MCP 插件，通过 AI 客户端提供原理图、PCB 编辑、检查与制造文件导出等工具。"
repository: "mixelpixx/Konnect"
repository_url: "https://github.com/mixelpixx/Konnect"
language: "Rust"
tags: ["AI","开发工具"]
stars_today: 228
comment: false
---

Konnect 是面向 KiCad 10 的 Rust MCP 插件，通过 AI 客户端提供原理图、PCB 编辑、检查与制造文件导出等工具。

## 项目做什么

项目旨在让 Claude 等支持 MCP 的 AI 客户端直接操作 KiCad 工程，涵盖原理图编辑、PCB 布局与布线、设计检查、元件查询及制造资料导出。它以单个 Rust 服务连接 AI 与 KiCad，并提供按需加载工具集，试图减少一次性暴露全部工具所占用的上下文。

## 与同类方案相比

按 README 描述，服务以单个 Rust 二进制提供，原理图通过 S 表达式编辑并使用原子写入；PCB 操作主要经 KiCad 10 IPC API，并可接入撤销与重做。工具覆盖设计、检查和输出环节，另有可选的技能安装、调用日志和状态查询。上述实现与体验表现尚未独立验证。

## 设计与创新

README 将其相对前身的变化概括为从多语言、子进程及 SWIG 绑定链路转向单进程 Rust 服务和 KiCad 10 IPC，并以按需工具集管理上下文。文档还描述了受版本约束的 DSN/SES 导入流程及原理图原子写入。是否构成技术创新、是否优于其他方案，仅凭现有材料无法验证。

## 适用场景

适用于使用 KiCad 10、希望通过兼容 MCP 的 AI 客户端辅助完成电路原理图和 PCB 设计的个人或团队；也可用于运行 ERC、DRC、连通性与电源审查，查询 JLCPCB 元件，参考常见电路模板，以及生成 Gerber、钻孔、BOM、贴片坐标、3D 模型或 PDF 等输出。

## 谁会受益

若工具与本地 KiCad 环境配置正确，项目可把自然语言辅助与实际工程操作连接起来，减少在 AI 建议和手工改板之间切换的步骤。对希望自动化检查、重复编辑或制造资料导出的用户尤其有参考价值；具体能否可靠完成任务，仍需结合设计复杂度和实际验证结果判断。

## 使用前需要注意

项目自述处于 Beta 阶段，且 Windows 是测试最多的平台；macOS 有配置要求，Linux 尚未完成同等程度的平台验证。多数 PCB 工具要求 KiCad 正在运行并打开目标板，部分操作才有关闭文件时的后备路径；导出和检查依赖 kicad-cli。README 提到工具数量为 228，仓库简介则称 217，具体数量存在不一致。文档所述功能、稳定性和对比结论未经独立核实。

[查看 GitHub 仓库](https://github.com/mixelpixx/Konnect)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
