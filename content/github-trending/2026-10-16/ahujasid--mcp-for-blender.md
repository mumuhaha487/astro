---
title: "ahujasid/mcp-for-blender"
period: "daily"
date: "2026-10-16T00:00:00+08:00"
description: "MCP for Blender 是一个社区维护的 Python 集成项目，通过 Blender 插件与 MCP 服务器连接 Blender 和兼容的 AI 客户端，使 AI 能以指令或 Python 脚本创建、修改和检查 3D 场景。"
repository: "ahujasid/mcp-for-blender"
repository_url: "https://github.com/ahujasid/mcp-for-blender"
language: "Python"
tags: ["AI","开发工具"]
stars_today: 141
comment: false
---

MCP for Blender 是一个社区维护的 Python 集成项目，通过 Blender 插件与 MCP 服务器连接 Blender 和兼容的 AI 客户端，使 AI 能以指令或 Python 脚本创建、修改和检查 3D 场景。

## 项目做什么

项目旨在让用户通过 Claude、Codex、Cursor、VS Code 等 MCP 客户端，以自然语言辅助进行 Blender 建模、场景搭建和对象操作。MCP 服务器负责协议与客户端通信，Blender 插件在本机创建套接字服务并接收、执行命令；该项目是第三方集成，并非 Blender Foundation 官方产品。

## 与同类方案相比

README 描述了自动安装和手动配置两种路径，并列出 macOS、Linux、Windows 的安装方式，以及 Docker 和 pipx 等运行选择。功能覆盖对象与材质操作、视觉检查、Python 代码执行及多种资产来源；文档也说明客户端配置、连接参数和常见环境问题，便于按实际环境部署。上述内容是项目文档所述，不能据此推断实际效果或性能。

## 设计与创新

README 列出的特点包括让 AI 通过多角度视图、线框、X-ray、动画条视图和渲染检查工作结果，以及接入 Poly Haven、Sketchfab、Poly Pizza 和若干 AI 模型生成服务。Codex 插件还描述了聊天内视口、缩略图选择器和场景元素提及功能。由于缺少与其他方案的系统对照和独立验证，无法据此确认这些能力的创新性或相对优势。

## 适用场景

适用情形包括用户希望用对话生成或调整 Blender 场景、让 AI 修改对象与材质、调用资产或模型生成服务，以及通过视图和渲染检查场景结果。使用前需要安装 Blender 插件并配置 MCP 客户端；多个 Blender 实例可通过不同端口连接。README 建议默认保持本机连接，远程使用时避免将未经保护的服务直接暴露到不可信网络。

## 谁会受益

对熟悉 AI 客户端但希望减少 Blender 手工操作的用户，该项目提供了将对话工作流接入 3D 编辑器的途径；对开发者而言，Python 执行和 MCP 接口也可用于探索自动化场景操作。文档明确列出 Blender 3.0 及以上、Python 3.10 及以上和 uv 等前置要求，并提供安全模式选项。不过实际收益取决于所用客户端、模型、任务和环境，README 未给出可量化评测。

## 使用前需要注意

默认执行模式允许 AI 在 Blender 中运行任意 Python；插件套接字服务没有认证或加密，能访问端口的主体可能执行代码。安全模式会拦截部分文件、网络和外部程序操作，但不能据文档认定其构成完整安全边界。部署还依赖本机 Blender、MCP 客户端与运行时配置；README 提及部分模型生成涉及高级服务及 API 密钥或付费方案，具体可用性和成本应另行核实。

[查看 GitHub 仓库](https://github.com/ahujasid/mcp-for-blender)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
