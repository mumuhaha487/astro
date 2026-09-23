---
title: "affaan-m/ECC"
period: "monthly"
period_key: "monthly-2026-09"
date: "2026-09-23T00:00:00+08:00"
description: "ECC 是一个面向 Claude Code、Codex 等编码智能体的工程化插件系统，通过 68 个代理、292 项技能、94 条命令与运行时钩子，把“规划、测试、实现、审查、验证、记忆、改进”流程固化下来，并附带 AgentShield 安全扫描。"
repository: "affaan-m/ECC"
repository_url: "https://github.com/affaan-m/ECC"
language: "JavaScript"
tags: ["AI","Skill"]
comment: false
---

ECC 是一个面向 Claude Code、Codex 等编码智能体的工程化插件系统，通过 68 个代理、292 项技能、94 条命令与运行时钩子，把“规划、测试、实现、审查、验证、记忆、改进”流程固化下来，并附带 AgentShield 安全扫描。

## 项目定位与要解决的问题

ECC 将自身定位为智能体框架的“操作系统”或“协调工程系统”，面向的是已经能写代码但不具备稳定工程流程的 AI 编码助手。它不修改或替代底层的 Claude Code、Codex 等 harness，而是以插件、依赖包或受管适配器的方式叠加在这些宿主之上，补齐规划、测试、审查、记忆和安全扫描等环节。项目核心 MIT 开源，源码仓库为 affaan-m/ECC，同时提供托管于 GitHub App 的 ECC Pro 付费层用于私有仓库，由赞助和订阅支持单一维护者每周跨七个 harness 的迭代。README 说明目前与 Claude Code 配合最佳，Codex 有受支持的同步路径，其余如 Cursor、OpenCode、Gemini、Zed 等属于能力受限的适配器，功能对等性需参考支持状态矩阵。

## 核心能力

ECC 的核心主张是“优化上下文窗口，持久化其余一切”，即不让智能体在每次提示中反复重建同一套工程流程。它一次性安装到宿主环境中，成为智能体默认工作方式的一部分，并通过 hooks 与 memory 在运行时持续生效。内容层面包含 68 个面向规划、审查、构建修复、安全、架构和领域工作的专用代理，292 项覆盖测试驱动开发、研究、安全、文档、前端、数据、机器学习和运维的技能，以及 94 条作为过渡入口的旧式命令。额外提供按语言或项目选择性加载的 rules、会话摘要与本能式连续学习机制，以及 AgentShield 对提示、钩子、MCP 配置、权限、密钥和智能体文件的扫描，形成从能力到安全的完整套件。

## 技术结构与实现思路

ECC 的架构围绕宿主 harness 的可扩展点组织：Claude Code 侧以 `ecc@ecc` 插件形式分发技能、代理、命令和插件管理的钩子，并区分 user、project、local 三种安装范围与标准等四种钩子配置档案；Codex 侧采用原生 repo-marketplace 插件，以仓库根为市场入口，让缓存连同 manifest、技能、MCP 配置、钩子运行时、脚本和资产一起接收，同时保留一条已弃用的 sync 兼容路径，并引入所有权清单来区分 ECC 管理的文件与用户修改过的文件。其他编辑器与智能体走 `ecc install --target` 的受管适配器。跨平台分发的载体是 npm 包 `ecc-universal`，`ecc-agentshield` 则独立承载安全扫描。rules 因 Claude 插件无法分发而需手工复制，安装方式要求按 harness 单一选择，避免叠加造成技能、命令或钩子重复。

## 实际工作流程

推荐路径是运行 `npx ecc-universal@2.2.2 setup` 进入引导式安装，向导会先盘点官方市场和每个原生 Claude 安装范围，再执行安装、更新或安全迁移到选定的安装范围，重复运行同一命令即可更新、换范围或换钩子配置档案。若要一次配置多个编码智能体，改用 `install --guided` 多 harness 向导，可组合选择 Claude Code、Codex 和 Kimi Code，显示各自安装通道与目标位置，在首次写入前预检所有选择，最后统一确认；自动化场景可用 `--harness`、`--claude-scope`、`--claude-hooks`、`--profile`、`--yes` 等参数显式声明，也可加 `--dry-run` 先验证不写入。安装后智能体按 `plan -&gt; test -&gt; implement -&gt; review -&gt; verify -&gt; remember -&gt; improve` 顺序工作，钩子与记忆在运行时承担强制、会话摘要和连续学习，`/ecc:configure-ecc` 提供插件安装后的重新配置入口。卸载或修复可用 `node scripts/ecc.js` 的 doctor、repair、uninstall 系列命令，legacy Codex sync 有独立的移除开关和 dry-run 支持。

## 与同类方案的取舍

与单一提示词或单一技能库相比，ECC 的差异点在于把工程流程、代理、技能、钩子、规则、记忆和安全扫描打包成可一次安装、可反复更新的系统，并强调避免在同一 harness 上叠加多种安装方式，用安装清单和所有权追踪来管理文件归属。它同时支持 Claude Code 原生插件、Codex 原生插件与多 harness 引导向导，并通过 npm 包、GitHub App 和插件 slug 形成多条分发渠道。项目自述 AgentShield 覆盖提示、钩子、MCP 配置、权限、密钥和智能体文件的扫描，也自述由单一维护者维持每周跨多个 harness 的发布节奏；这些属于项目方陈述。README 未提供与其他同类工具的基准对比或量化性能数据，因此不陈述相对竞品的性能优势。

## 值得关注的设计

ECC 提出的核心创新在于把“代理脚手架性能优化”从零散的提示词技巧升级为一套可安装的工程系统。它围绕 plan→test→implement→review→verify→remember→improve 的闭环组织能力，把技能、本能（instincts）、记忆、安全扫描和安全优先开发整合进一个插件式运行时。技术层面包含 hooks 强制机制、会话摘要、持续学习与上下文窗口控制，并以 AgentShield 扫描提示词、hooks、MCP 配置、权限、密钥和代理文件。需要说明，“性能优化”系统与“优化上下文窗口、持久化其余部分”的定位属于项目方自述，来源未提供与其它代理脚手架的量化对比，因此相关优势无法独立验证。

## 适用领域和具体场景

按 README 描述，ECC 主要面向 AI 编码代理的日常开发工作流：在实现代码前先做计划，用测试验证改动，从全新上下文审查自己的输出，并把重复出现的成功经验沉淀为可复用的技能与命令。它内置 68 个代理、292 个技能和 94 个兼容命令，覆盖 TDD、研究、安全、文档、前端、数据、ML 和运维等场景。安装方式上，可通过 npx 等包运行器执行引导式设置，也可直接在 Claude Code 市场添加插件，或用 Codex 原生插件命令添加；引导向导支持一次选择 Claude Code、Codex、Kimi Code 组合，并先预检再写入。

## 哪些人会受益

目标用户首先是使用 Claude Code 的开发者，README 明确称其“目前与 Claude Code 配合最佳”；其次是使用 Codex 的用户，项目提供受支持的同步路径；再之外是 Cursor、OpenCode、Gemini、Zed、GitHub Copilot、Antigravity、Qwen 等工具的开发者，但仅有能力受限的适配器，不能默认功能对等。团队和自动化用户也能受益：多脚手架向导、—profile、—target、—dry-run 和显式参数便于可重复安装与 CI 式校验；Windows 新手教程则降低了命令行门槛。个人用户可选择全局、项目或本地作用域。

## 上手、部署与集成

README 提供了多种官方安装渠道：经过验证的 GitHub 仓库、npm 包 ecc-universal 与 ecc-agentshield、GitHub App、插件标识 ecc@ecc 以及官网 ecc.tools。引导设置可通过 npx、pnpm dlx、yarn dlx 或 bunx 执行，版本锚定 2.2.2，并强调按 harness 只选一种安装方式以免重复安装。项目以 MIT 协议开源，同时存在面向私有仓库的 ECC Pro 托管 GitHub App（每席位每月 19 美元起），并列出 CodeRabbit、Greptile、Moonshot AI 等赞助伙伴。README 称由单一维护者每周跨 7 个 harness 发布更新，但仓库未提供采纳率、留存或安装量的可验证数据。

## 限制与风险

限制首先体现在平台支持不均衡：只有 Claude Code 是“目前最佳”，Codex 有受支持的同步路径，其余如 Cursor、OpenCode、Gemini、Zed、Copilot 等为能力受限适配器，需先看支持矩阵，不能假设功能对等。其次存在严格的安装约束：同一 harness 不要叠加插件与手动安装，否则可能重复技能、命令、hooks 或配置；Claude Code 的规则包无法随插件分发，需手动复制；Codex 原生 hooks 需明确信任决策且不采用 Claude 的 hook 配置文件。此外，Kimi 路径不配置 hooks、模型、提供商与认证；包版本锚定不等于安全审计，第三方镜像不被维护。

## 综合观察

ECC 的定位不是单个提示词库，而是把代理工作流、记忆、安全扫描和多 harness 安装生命周期打包成可维护系统的尝试；从 README 看，其覆盖广度（68 代理、292 技能、94 命令、AgentShield）和引导式安装的谨慎程度是真实卖点。可惜缺少可复现的基准、性能对比和实际采纳数据，项目方自述的“性能优化”难以独立验证。它对 Claude Code 的强依赖、各 harness 能力差距以及单一维护者快节奏发布，都是采用前需要权衡的风险。适合希望用统一流程规范 AI 编码代理的团队试点，但应从小范围、单一安装方式开始。

[查看 GitHub 仓库](https://github.com/affaan-m/ECC)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
