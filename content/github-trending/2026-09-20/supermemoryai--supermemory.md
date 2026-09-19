---
title: "supermemoryai/supermemory"
period: "daily"
date: "2026-09-20T00:00:00+08:00"
description: "Supermemory 是面向 AI 的记忆与上下文引擎，用 TypeScript 编写，提供记忆提取、用户画像、混合检索、连接器与多模态文件处理，支持云端 API、MCP 插件及本地自托管部署。"
repository: "supermemoryai/supermemory"
repository_url: "https://github.com/supermemoryai/supermemory"
language: "TypeScript"
tags: ["AI","数据"]
stars_today: 460
comment: false
---

Supermemory 是面向 AI 的记忆与上下文引擎，用 TypeScript 编写，提供记忆提取、用户画像、混合检索、连接器与多模态文件处理，支持云端 API、MCP 插件及本地自托管部署。

## 项目做什么

该项目要解决的是 AI 助手在会话之间遗忘信息的问题。它从对话中自动提取事实、维护用户画像、处理知识更新与矛盾，并在需要时把相关上下文交给模型。对开发者，它把记忆、RAG、用户画像、连接器与文件处理整合成一套 API，避免自行搭建向量库与嵌入流水线；对终端用户，它通过插件和 MCP 服务器为 Claude Code、Cursor 等客户端提供跨会话记忆；同时提供本地运行方式，供希望数据留在本机的使用者选择。

## 与同类方案相比

README 列出多项能力：在单次查询中同时完成 RAG 与记忆检索的混合搜索；一次调用返回静态事实与动态上下文的用户画像；Google Drive、Gmail、Notion、OneDrive、GitHub 等连接器与实时 webhook 同步；PDF、图片 OCR、视频转写、代码 AST 分块等文件解析；提供 npm 与 PyPI 客户端以及对 Vercel AI SDK、LangChain、LangGraph、Mastra、Agno 等框架的封装；本地版宣称单二进制、零配置，可用 Ollama 完全离线。需要说明的是，README 自称在 LongMemEval、LoCoMo、ConvoMem 三项基准排名第一，并给出 95% Recall@15、约 720 token 上下文、99.4% 上下文压缩、约 50ms 用户画像等数字，这些均为项目方自述，所给材料中没有可供独立核验的复现结果。

## 设计与创新

README 强调的差异点是把记忆与 RAG 放进同一系统并默认同时运行：RAG 返回无状态的文档片段，记忆则针对用户事实做时间维度跟踪，能识别新信息取代旧信息，例如搬家后旧的居住地信息应被覆盖。它还描述自动遗忘机制，让带日期的临时事实过期并自动消解矛盾。此外提到自研的 Supermemory Filesystem（SMFS）在 xAFS 基准上减少 token 用量，以及开源的 MemoryBench 用于横向比较不同记忆方案。这些设计思路与基准结论都来自项目自身文档，未提供可独立验证的实现细节或第三方评测，因此创新程度尚无法确认。

## 适用场景

适用方式大致有四类：一是开发者构建 AI agent 或应用时，通过 API 加入跨会话记忆、个性化上下文、知识库检索与外部数据同步，减少自建向量库和嵌入流程的工作；二是个人用户在 Cursor、Claude Code、Claude Desktop、Windsurf、VS Code、OpenCode 等客户端安装插件或配置 MCP，获得跨会话的偏好与项目记忆；三是关心数据驻留的团队，用本地版接入自有模型或经 Ollama 离线运行；四是用 MemoryBench 对自家记忆方案做对比评测的团队。具体适用边界受文档未展开的规模、延迟与合规细节限制。

## 谁会受益

其实用价值在于把记忆提取、用户画像、混合检索、连接器和文件处理收敛为同一套 API，README 的示例显示本地版与托管版之间只需改动 baseURL，便于先本地验证再迁移到托管部署。项目同时提供 TypeScript 与 Python 客户端，并对多个主流 AI 框架给出接入封装，可降低集成工作量；插件与 MCP 服务器也让不具备后端开发能力的用户能直接为编辑器类工具加上持久记忆。不过文档没有公开容量上限、延迟分布、成本结构和数据处理方式，对生产环境中的实际收益与迁移成本仍缺少可核实依据，采用前宜先做小规模验证。

## 使用前需要注意

README 未标注开源许可证，仓库能否自由商用无法从所给材料判断。所有性能与排名结论，包括三项基准第一、95% Recall@15、99.4% 上下文压缩、约 50ms 用户画像以及 SMFS 的 token 节省，均来自项目方自述，没有提供可独立复现的评测环境，不能视为已证实。文档也未说明数据量上限、高负载下的延迟表现、模型或嵌入服务不可用时的降级策略，以及本地版与企业版的功能差异。此外本地运行的记忆质量依赖所接入的模型与嵌入提供方，完全离线需要自行准备 Ollama 等环境；与 Mem0、Zep 等方案的比较同样缺少中立数据。

[查看 GitHub 仓库](https://github.com/supermemoryai/supermemory)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
