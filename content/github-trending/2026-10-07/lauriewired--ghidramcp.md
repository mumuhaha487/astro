---
title: "LaurieWired/GhidraMCP"
period: "daily"
date: "2026-10-07T00:00:00+08:00"
description: "GhidraMCP 是以 Java 编写的 Ghidra 扩展及 MCP 服务桥接项目，将 Ghidra 的部分分析能力提供给 MCP 客户端，支持反编译、分析和查看程序符号等操作。"
repository: "LaurieWired/GhidraMCP"
repository_url: "https://github.com/LaurieWired/GhidraMCP"
language: "Java"
tags: ["开发工具"]
stars_today: 234
comment: false
---

GhidraMCP 是以 Java 编写的 Ghidra 扩展及 MCP 服务桥接项目，将 Ghidra 的部分分析能力提供给 MCP 客户端，支持反编译、分析和查看程序符号等操作。

## 项目做什么

项目旨在连接 Ghidra 与支持模型上下文协议的客户端，使客户端能够调用 Ghidra 核心功能辅助分析二进制程序。README 描述的能力包括反编译和分析、自动重命名方法与数据，以及列出方法、类、导入项和导出项；实际分析结果仍依赖 Ghidra、目标程序及使用方式。

## 与同类方案相比

README 展示了 Ghidra 插件与 Python MCP 客户端桥接的组合，并给出 Claude Desktop、Cline、5ire 的配置示例以及服务器地址和端口设置方式。用户可依照示例连接本地 Ghidra 实例；这些说明表明其具有一定的接入指引，但不能据此判断稳定性、易用性或相较其他工具的优势。

## 设计与创新

项目将 MCP 客户端调用与 Ghidra 插件提供的程序分析功能组合起来，并列出自动重命名方法和数据等能力。README 未提供与其他 Ghidra 集成方案的对比、技术原理或评测材料，因此这些功能是否构成独特创新、相对既有方案有何改进，目前尚无法验证。

## 适用场景

适用于希望通过 MCP 客户端对 Ghidra 中已载入的二进制程序进行辅助分析的场景，例如查看方法、类、导入与导出信息，调用反编译功能，或尝试自动重命名方法和数据。README 给出了本地连接配置；是否适用于远程环境或特定分析工作流，需结合实际部署和客户端支持情况确认。

## 谁会受益

对于已使用 Ghidra、并希望从 MCP 客户端触发其部分分析功能的用户，项目提供了插件安装步骤、客户端连接示例和从源码构建方法，可作为集成起点。其价值取决于目标客户端、Ghidra 版本及具体分析需求；README 没有提供准确率、效率提升或实际项目效果的验证数据。

## 使用前需要注意

使用前需要安装 Ghidra、Python 3 和 MCP SDK，并将扩展导入 Ghidra；从源码构建还需复制指定的 Ghidra JAR 文件并运行 Maven。README 未说明支持的 Ghidra 与客户端版本范围、权限和安全边界、功能覆盖细节、测试情况及已知问题；因此兼容性、部署风险和分析结果可靠性尚无法据此确认。

[查看 GitHub 仓库](https://github.com/LaurieWired/GhidraMCP)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
