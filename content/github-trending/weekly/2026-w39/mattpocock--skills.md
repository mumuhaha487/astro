---
title: "mattpocock/skills"
period: "weekly"
period_key: "weekly-2026-w39"
date: "2026-09-24T00:00:00+08:00"
description: "mattpocock/skills 是 Matt Pocock 从个人 .agents 目录提炼的代理技能集合，面向真实工程而非 vibe coding。技能以 Shell 编写，强调小巧、可改、可组合，并可在任意模型上使用。"
repository: "mattpocock/skills"
repository_url: "https://github.com/mattpocock/skills"
language: "Shell"
tags: ["Skill","AI"]
comment: false
---

mattpocock/skills 是 Matt Pocock 从个人 .agents 目录提炼的代理技能集合，面向真实工程而非 vibe coding。技能以 Shell 编写，强调小巧、可改、可组合，并可在任意模型上使用。

## 项目定位与要解决的问题

作者把仓库定位为对 GSD、BMAD、Spec-Kit 一类流程方案的反向选择：那些方案接管流程，而这里刻意让技能保持小、易改、可组合，让开发者保留控制权，文件可 fork 成自己的东西。安装提供两条互斥路径：Claude Code 插件作为受管只读包随作者更新，skills.sh 则把可编辑技能文件复制进项目。

## 核心能力

核心围绕作者总结的四种代理失败模式展开。对齐问题用 grill-me 与 grill-with-docs 的盘问式对话解决；冗长问题靠 CONTEXT.md 共享语言压缩术语，并让变量、函数、文件命名一致；代码不可用问题用 tdd 红绿重构与 diagnosing-bugs 诊断循环补反馈环；代码腐化问题则通过 to-spec 与 improve-codebase-architecture 在设计层面持续介入。

## 技术结构与实现思路

技能按调用者分两类：用户调用型只能手动触发，负责编排，例如 ask-matt、grill-with-docs、triage、to-spec、to-tickets、implement、wayfinder；模型调用型既可由人触发也可由代理按任务自动取用，承载可复用纪律，例如 prototype、tdd、research、codebase-design、code-review、wizard。用户调用技能可以调用模型调用技能，但不会调用另一个用户调用技能，形成单向分层。

## 实际工作流程

典型链路先运行 setup-matt-pocock-skills 选择 issue tracker、triage 标签与文档位置；随后用 grill-with-docs 对齐并沉淀领域语言和 ADR；用 to-spec 把对话转成规格发布到 tracker，再用 to-tickets 拆成带阻塞关系的 tracer-bullet 工单；implement 在约定接缝驱动 tdd，收尾以 code-review 审查后提交；wayfinder 负责超出单次会话的大块工作。

## 与同类方案的取舍

与流程框架的差异体现在作者自述的写法：技能不做框架式接管，而是拆成可组合的小件，允许任意模型使用，并可被复制、修改和私有化。grill-with-docs 被作者称为仓库中最酷的技术，因为共享语言除减少冗长外，还让命名一致、代码库更易导航，并使代理少花 token 思考；code-review 以标准与规格两条轴由并行子代理运行，避免相互污染。

## 值得关注的设计

该项目把工程实践压缩成一组小型、可组合的 agent 技能，与 GSD、BMAD、Spec-Kit 等“接管流程”的方案相对：README 自述后者会夺走控制权、让流程中的 bug 难以排查，而这些技能刻意保持可改编、可拆装，并宣称适用于任何模型。最独特的一点是 /grill-with-docs，它把需求澄清的盘问与领域语言建设绑在一起，边问边更新 CONTEXT.md 与 ADR，使术语从对话沉淀为项目文档，README 称之为本仓库最酷的技术。另一项设计是技能按调用方分层：用户触发技能负责编排，模型触发技能承载可复用纪律，前者可调用后者但不调用同级技能，避免相互纠缠。

## 适用领域和具体场景

覆盖面横跨日常编码与协作。工程侧包括 /grill-with-docs 对齐需求、/to-spec 将对话整理成规格并发布到 issue 跟踪器、/to-tickets 把计划拆成带阻塞关系的 tracer-bullet 票据、/implement 在预定点驱动 /tdd 并以 /code-review 收尾、/tdd 做红绿重构、/diagnosing-bugs 用受控循环诊断难缠 bug 与性能回归、/resolving-merge-conflicts 逐块按意图解决冲突、/wizard 生成引导人完成基础设施与凭据配置的交互式脚本。产品侧则有 /handoff 压缩会话、/teach 跨会话教学、/to-questionnaire 生成异步问卷。

## 哪些人会受益

面向做真实工程而非“氛围编程”的开发者。README 强调这些技能来自作者每天使用的 .agents 目录，建立在数十年工程经验之上，因此适合愿意关心代码设计、反馈回路与需求对齐的人，而不是希望把流程全权交给工具的人。安装说明同时照顾两类人：用 Claude Code 的可以直接从官方市场装插件订阅更新，用 Codex 或其他 agent 的可以挑选技能安装；还有为爱折腾者准备的路径，把技能作为普通文件写进仓库，可自行编辑、自行拉取更新。作者 newsletter 的约六万开发者订阅数也被用作受众规模的旁证。

## 上手、部署与集成

接入门槛低，README 称安装只需 30 秒。Claude Code 用户可执行 claude plugins install mattpocock-skills，或在会话中用 /plugin install 安装，插件在官方市场，更新自动到达。其他 agent 用 npx skills@latest add mattpocock/skills 选择技能与目标 agent；装入后每个仓库运行一次 /setup-matt-pocock-skills，配置 issue 跟踪器（GitHub、Linear 或本地文件）、triage 标签与文档位置。README 提醒两条路线择一，同时装会让每个技能出现两份。文末还提到原生 Codex 插件在路线图上，并附有对应 ADR 链接。

## 限制与风险

项目对自身边界有明确说明。/improve-codebase-architecture 被描述为一次勘察而非救援：在真正陈旧的代码库上能找到真实候选，但不会替你理清泥团，建议每隔几天跑一次。grilling 不能替代你自己想清楚要什么，README 引用《程序员修炼之道》说明没人一开始就确切知道想要什么。技能偏小型可改编，意味着纪律与判断仍落在使用者身上。安装上，两条安装路径互斥，重复安装会产生重复技能；Codex 原生插件尚未就绪，仍在路线图中。作者 newsletter 的订阅规模由项目方自述，未经独立验证。

## 综合观察

这是一套以工程基本功为内核的 agent 技能集，价值不在自动化程度，而在把需求盘问、共享语言、红绿重构、深模块设计与纪律化的缺陷诊断固化成可重复调用的小块流程。它与宣称“拥有过程”的方案形成对照，把控制权和可修改性留给使用者，这一点在 README 中被反复强调。其设计分层的调用规则也说明作者考虑过技能之间的组合关系而非简单堆叠。局限同样来自这种克制：它不解决代码库的深层混乱，也不替你确定目标。是否好用高度依赖你原本是否认同这些工程原则，适合愿意动手改造的团队试用。

[查看 GitHub 仓库](https://github.com/mattpocock/skills)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
