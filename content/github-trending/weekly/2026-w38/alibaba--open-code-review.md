---
title: "alibaba/open-code-review"
period: "weekly"
period_key: "weekly-2026-w38"
date: "2026-09-16T00:00:00+08:00"
description: "Open Code Review 是阿里巴巴开源的 AI 代码审查命令行工具，用确定性工程约束流程，用 LLM Agent 做动态判断，输出行级精确的评审意见，内置多语言规则并兼容 OpenAI、Anthropic 接口。"
repository: "alibaba/open-code-review"
repository_url: "https://github.com/alibaba/open-code-review"
language: "Go"
comment: false
tags:
  - AI
  - 安全
  - 开发工具
---

Open Code Review 是阿里巴巴开源的 AI 代码审查命令行工具，用确定性工程约束流程，用 LLM Agent 做动态判断，输出行级精确的评审意见，内置多语言规则并兼容 OpenAI、Anthropic 接口。

## 项目定位与要解决的问题

按 README 自述，该项目原为阿里巴巴集团内部官方 AI 代码审查助手，两年间服务数万名开发者、识别数百万代码缺陷，经大规模验证后孵化开源。它定位为开发者本地与流水线中通用的评审 CLI：安装后获得全局 ocr 命令，既可以自行调用所配置的模型完成审查，也可以通过插件接入 Claude Code、Codex、Cursor、OpenCode、QCA Forward 等宿主，或走委派模式由宿主模型执行审查而无需配置密钥。配套提供 CI/CD 集成（GitHub Actions、GitLab CI、GitFlic CI、Gerrit）、MCP 服务端与 OpenTelemetry 可观测性，覆盖 Windows、macOS、Linux，采用 Apache-2.0 许可。

## 核心能力

核心理念是“确定性工程 × Agent 混合”，让两种能力各管各的强项。凡是“不能出错”的环节交给工程逻辑硬约束：精确决定哪些文件需要审、哪些过滤掉；按相关性智能打包，例如把 message_en.properties 与 message_zh.properties 绑成一个评审单元，每个包以子 Agent 的独立上下文运行，形成分而治之的策略，在超大变更集上保持稳定并天然支持并发。规则匹配同样走模板引擎而非纯自然语言提示，项目方认为这样更稳定可预测，能把模型注意力聚焦在该文件的特征上，从源头削减信息噪声。Agent 则集中在最需要它的地方：动态决策与动态上下文检索，从而做到深审而非只看 diff 表面。

## 技术结构与实现思路

架构分两层。确定性层包含文件选择、智能打包、细粒度规则匹配，以及独立的评论定位模块与评论反思模块，用来系统性地提升 AI 反馈的位置准确度与内容准确度。Agent 层包含面向代码审查深度调优的提示模板，以及从大规模生产数据的工具调用轨迹中提炼的工具集——README 提到其依据调用频率分布、单工具重复率、新工具对整体调用链的影响来筛选，号称比通用 Agent 工具包更稳定。模型侧兼容 OpenAI 与 Anthropic 接口，支持内置或自定义 provider，交互式界面完成选型、填密钥、配模型并自动测试连通性；内置多语言规则集覆盖空指针（NPE）、线程安全、XSS、SQL 注入等缺陷类型；还可通过 MCP Server 挂载外部工具扩展审查 Agent 的能力。

## 实际工作流程

前置要求 Git 2.41 及以上，因为 diff 生成、代码搜索与仓库操作都依赖 Git。安装后执行 ocr config provider 与 ocr config model 完成模型配置，随后在项目目录下执行 ocr review：工作区模式审查所有已暂存、未暂存与未跟踪的改动；分支范围模式用 --from main --to feature-branch，按 merge-base 审查特性分支自分离点以来的变更；也可用 --commit 指定单个提交。中断的范围或提交审查可用 ocr session list 查询后加 --resume 续跑。除 diff 外，ocr scan 支持整文件扫描，可限定 --path 目录或文件、也可 --resume，适用于审计陌生代码库或没有有意义 diff 的场景。结果可 --format json --output 落盘，便于宿主 AI Agent 消费。委派模式下先 ocr delegate preview，再用 ocr delegate rule 指定文件，由宿主自行评审。审查会话还能在浏览器中浏览回放，把评论标记为已修复或忽略并暂时隐藏。

## 与同类方案的取舍

差异化主张建立在对通用 Agent 的痛点观察上：更大的变更集里 Agent 容易“偷工减料”只挑部分文件看，报告的问题常与实际代码位置不符出现行号或文件漂移，纯自然语言驱动的 Skill 难以调试、质量随提示词微调而波动。项目方把这归因于语言驱动架构缺乏对流程的硬约束，因而用确定性工程补位。据 README 自述，其在自建基准 AACE-Bench（50 个热门开源仓库、200 个真实 PR、10 种语言、80 余位资深工程师交叉验证出 1505 条标注真值）上，用同一底层模型对比通用 Agent（README 以 Claude Code 为例），取得了更高的 Precision 与 F1，token 消耗约为后者的九分之一且耗时更短；同时坦承 Recall 低于通用 Agent，并明确这是为压低噪声而有意做出的取舍。这些性能与对比结论均属项目方自述，本解读未做独立验证。

## 值得关注的设计

项目最核心的创新是确定性工程与 LLM Agent 的混合架构：文件选择、文件打包、规则匹配、评论定位与评论反思模块由工程逻辑硬约束，保证这些环节不出错；Agent 只负责动态决策和动态上下文检索。文件打包会把相关文件（例如 message_en.properties 与 message_zh.properties）归入同一个审查单元，每个单元作为隔离子代理运行，从而在大变更集上保持稳定并支持并发。规则匹配采用模板引擎，项目方称其比纯语言驱动更稳定可预测。场景化提示与工具集来自对生产环境工具调用链的分析。以上优势均为项目方自述。

## 适用领域和具体场景

可用于多种代码审查场景：ocr review 审查工作区中已暂存、未暂存和未跟踪的变更；通过 --from 与 --to 审查分支自合并基点以来的改动；通过 --commit 审查单个提交；用 --resume 恢复中断的范围或提交审查。ocr scan 不依赖 Git 历史，可扫描整个仓库、指定目录或文件，适合审计陌生代码库或没有有意义 diff 的目录。结果可用 --format json --output 保存，方便 AI 宿主代理消费。delegation 模式让宿主 AI 代理自行执行审查，OCR 只负责文件选择和规则解析。还支持 GitHub Actions、GitLab CI、GitFlic CI、Gerrit 等 CI/CD 集成以及 MCP 外部工具扩展。

## 哪些人会受益

目标用户包括使用 CLI 的个体开发者、需要统一代码审查质量的研发团队、把审查嵌入流水线的 CI/CD 维护者，以及使用 Claude Code、Codex、Cursor、OpenCode、QCA Forward 或技能兼容代理的 AI 编码代理用户。它要求本机 Git 版本不低于 2.41。对关注行级评论精度、希望减少误报、并控制模型 token 成本的团队尤其相关；需要审计没有 diff 的遗留代码库或目录的工程师也能用 ocr scan。因为支持 OpenAI 与 Anthropic 兼容接口，已经采购相应模型服务的组织可以较低成本接入。

## 上手、部署与集成

安装方式以 npm 全局包 @alibaba-group/open-code-review 为主，安装后获得 ocr 全局命令；README 还提到安装脚本、GitHub Release 二进制和源码构建。首次使用通过 ocr config provider 与 ocr config model 选择内置或自定义提供方、输入 API Key 并自动测试连通性。项目采用 Apache-2.0 许可，Copyright 2026 Alibaba，并展示 OpenSSF Best Practices Gold 徽章、Trendshift 徽章、DeepWiki 入口和贡献者墙。官方站点提供快速开始、CLI 参考、审查规则、配置、MCP、CI/CD、会话查看器、OpenTelemetry 遥测和 FAQ 等文档。项目方自述该工具在阿里内部服务数万名开发者并发现数百万代码缺陷。

## 限制与风险

使用前需注意：Open Code Review 依赖 Git 2.41 及以上版本；默认需要配置 LLM，除非走 delegation 模式。项目方基准称其在相同底层模型下 Precision 与 F1 显著更高、token 消耗约为通用代理的九分之一，但 Recall 低于通用代理，这是为降低噪音而做的有意取舍，且该基准由项目方发布，尚需独立复现。基准数据集 AACR-Bench 声称来自 50 个开源仓库、200 个真实 PR、10 种编程语言、80 多位资深工程师交叉验证的 1505 个标注问题。README 提到内置规则覆盖 NPE、线程安全、XSS、SQL 注入等，但未逐一列出全部语言和规则的完整范围，规则集不能替代专业安全审计。

## 综合观察

整体看，这个项目把代码审查拆成确定性流水线与 Agent 两层，思路务实：行级定位、文件打包子代理和模板化规则匹配针对的是通用代理常见的覆盖不全、位置漂移和质量波动。自述基准在精确率和 token 成本上有吸引力，但召回率较低且数据来自项目方，落地前应在自己的代码库和 CI 流程中做小范围验证，重点观察误报率、漏报率和单次审查延迟。Apache-2.0 许可、OpenSSF Gold、多平台安装与多种 AI 编码代理、CI/CD 集成降低了采用门槛。它适合作为团队审查的辅助手段，但不宜视为安全审计或完全替代人工评审。

[查看 GitHub 仓库](https://github.com/alibaba/open-code-review)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
