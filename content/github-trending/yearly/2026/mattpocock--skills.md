---
title: "mattpocock/skills"
period: "yearly"
period_key: "yearly-2026"
date: "2026-09-24T00:00:00+08:00"
description: "mattpocock/skills 是一套面向真实工程实践的 agent 技能集合，作者称其来自日常 .agents 目录。它以小型、可组合、可改造为设计原则，帮助使用者在与编码 agent 协作时对齐意图、保持设计质量。"
repository: "mattpocock/skills"
repository_url: "https://github.com/mattpocock/skills"
language: "Shell"
tags: ["Skill","AI"]
comment: false
---

mattpocock/skills 是一套面向真实工程实践的 agent 技能集合，作者称其来自日常 .agents 目录。它以小型、可组合、可改造为设计原则，帮助使用者在与编码 agent 协作时对齐意图、保持设计质量。

## 项目定位与要解决的问题

项目把自己定位为对 GSD、BMAD、Spec-Kit 等流程型方案的一种反向回答：后者通过拥有流程来提供帮助，但按项目自述会夺走控制权、让流程自身的问题难以排查。mattpocock/skills 选择相反路线，把技能做成小型、易改、可组合的单元，并声明不绑定特定模型，而是基于作者所说的数十年工程经验，鼓励使用者直接修改并据为己有。它因此更像工具箱而非框架，重点是让工程师继续掌握主导权，而非用一套既定的开发流程替换人的判断。安装方式也体现了这种取舍：官方 Claude Code 插件以受管只读包形式整体分发并自动更新，属于订阅式使用；skills.sh 则把技能文件复制进用户项目，成为用户可编辑的普通文件，适合动手改造的人，README 明确提醒二者只选其一，同时安装会导致每个技能出现两份。

## 核心能力

核心围绕 README 列出的四类常见失败模式展开。第一是对齐失败：agent 没有做出用户想要的东西，修复手段是 grilling 会话，由 agent 就用户正在构建的内容提出细致追问，对应 /grill-me 与非代码场景，以及 /grill-with-docs 这种带文档产出的版本。第二是啰嗦与术语混乱：agent 被丢进项目后现学行话，用二十个词说一个词的事，修复手段是共享语言文档，例如 CONTEXT.md，把难以解释的决策沉淀为 ADR。第三是代码不工作：需要静态类型、浏览器访问和自动化测试等反馈回路，其中红-绿-重构被视为关键，并由 /tdd 技能承载，调试则有 /diagnosing-bugs 的阶段性纪律循环。第四是泥球：agent 加速编码会同时加速软件熵增，修复方式是认真对待代码设计，由 /to-spec 在写规格前追问涉及哪些模块，/improve-codebase-architecture 则扫描代码库给出可深化模块的候选。README 强调该技能是几天运行一次的调查而非拯救，在真正老旧的代码库上能发现真实候选，但不会替用户理清泥球。

## 技术结构与实现思路

技能按一个轴划分：谁可以调用它们。用户调用型技能只能由使用者显式输入触发，职责是编排流程；模型调用型技能既可以由用户触发，也可以在任务合适时由 agent 自动取用，承载可复用的纪律。规则明确：用户调用型技能可以调用模型调用型技能，但不得调用另一个用户调用型技能。集合分为工程与生产力两大类。工程类的用户调用型包括路由技能 ask-matt、带文档的拷问 grill-with-docs、triage、改善架构的 improve-codebase-architecture、每仓库运行一次的 setup-matt-pocock-skills，以及 to-spec、to-tickets、implement、wayfinder；模型调用型包括 prototype、diagnosing-bugs、research、tdd、domain-modeling、codebase-design、code-review、resolving-merge-conflicts 和 wizard。生产力类中，grill-me、handoff、teach、to-questionnaire、wait-what 为用户调用型，grilling 与 writing-for-agents 为模型调用型，其中 grilling 被描述为 grill-me、grill-with-docs、triage、wayfinder 和 improve-codebase-architecture 背后复用的采访原语。

## 实际工作流程

使用路径从安装开始。Claude Code 用户可执行 claude plugins install mattpocock-skills，或在会话内使用 /plugin install 安装，该插件位于官方市场，无需预先添加来源，更新会自动到达；Codex 及其他 agent 用户运行 npx skills@latest add mattpocock/skills，安装器允许挑选技能与目标编码 agent，README 特别提醒务必把 setup-matt-pocock-skills 选进去；希望改造的人使用同一个安装器，但它会把技能作为普通文件写入仓库，归用户所有、可编辑，没有后台更新，需要时用 npx skills update 拉取最新改动。安装后每个仓库运行一次 /setup-matt-pocock-skills，它会询问想用哪种问题跟踪器（GitHub、Linear 或本地文件）、triage 工单时应用哪些标签（/triage 使用标签）、以及把生成的文档保存在哪里。日常协作中，典型流程是先通过 grilling 类技能对齐意图、建立共享语言，再用 to-spec 把对话转为规格并发布到问题跟踪器，或者用 to-tickets 把计划拆成带阻塞关系的 tracer-bullet 工单，随后用 implement 按事先约定的接缝驱动 /tdd，并在提交前以 /code-review 收尾；跨多个会话的大块工作交给 wayfinder，把决策工单地图放到问题跟踪器上逐个解决。

## 与同类方案的取舍

与 README 中点名的流程主导型方案相比，本项目的差异首先在控制权归属：它明确说那些方案会拿走控制权、让流程中的缺陷难以修复，而自己的技能被设计成小型、易改、可组合，使用者可以随手改造成自己的版本。其次在组合粒度：技能按用户调用与模型调用分轴，用户调用型负责编排、模型调用型承载可复用纪律，并且用户调用型之间不允许互相调用，规则清晰。第三在可复制性：提供订阅式只读插件与可编辑文件复制两条路径，分别服务想跟随更新的人和想动手改的人。第四在覆盖的问题类型：不是单一开发流程，而是针对对齐、术语冗长、反馈回路缺失和设计熵增四类失败模式分别给出对应技能。第五在自我限定：improve-codebase-architecture 被明确定位为调查而非拯救。此外，README 中的效果描述多来自作者自述，例如 grilling 类技能最受欢迎、共享语言可能减少思考 token、红-绿-重构带来更好代码，这些属于项目方说法，README 未提供独立基准或对照数据来验证。

## 值得关注的设计

该项目最核心的创新在于把软件工程方法论拆解为一组可被编码代理直接调用的“技能”，并按照调用者划分为用户调用型与模型调用型两条轴。用户调用型技能只在你手敲命令时触发，负责编排流程，例如 ask-matt 作为路由、triage 管理 issue 状态机、wayfinder 把超出单次会话容量的大块工作拆成决策票据地图；模型调用型技能则由代理在任务匹配时自动取用，承载可复用的纪律，例如 tdd、code-review、diagnosing-bugs、domain-modeling、codebase-design。这种分层让用户调用技能可以调用模型调用技能，但不会互相串联用户调用技能，避免流程失控。另一个原创点是“拷问式”对齐机制，grill-me、grill-with-docs 以及它们共享的底层原语 grilling，会在动手前把设计树的每个分支逐一逼问清楚，其中 grill-with-docs 还会同步维护领域模型、CONTEXT.md 与 ADR。项目方还主张与 GSD、BMAD、Spec-Kit 这类“接管流程”的做法不同，这些技能刻意做得小、易改、可组合，并宣称适用于任何模型。

## 适用领域和具体场景

从 README 看，这些技能覆盖了从需求对齐到交付的完整链路。开始阶段用 grill-me 或 grill-with-docs 做拷问式对齐；grill-with-docs 顺带沉淀共享语言与决策记录，wait-what 则在某条消息没被理解时用你的 CONTEXT.md 词汇重新解释。规划阶段，to-spec 把当前对话直接综合成规格并发布到 issue tracker，to-tickets 把计划、规格或对话拆成带阻塞关系的 tracer-bullet 票据，wayfinder 用于超出单会话容量的大工程。实现阶段由 implement 驱动，在事先约定的接缝处调用 tdd，收尾前跑 code-review 再做提交。模型调用侧，prototype 用于回答设计问题并产出可分享的单文件 HTML 或多套 UI 变体，research 面向高可信一手来源并把带引用的 Markdown 结论写回仓库，diagnosing-bugs 用于难缠缺陷与性能回归，resolving-merge-conflicts 按意图逐个冲突块解决合并或变基，wizard 生成交互式 bash 向导带人完成基础设施、凭据、CI secret 或迁移等只有人能做的步骤。此外还有 handoff、teach、to-questionnaire、writing-for-agents 等生产力技能。

## 哪些人会受益

目标读者是每天用 Claude Code、Codex 等编码代理做真实工程的开发者，README 明确把这些技能定位为“给我的、每天都用的”，而不是 vibe coding。它假设使用者已经具备基本工程判断力：能识别类型、测试、浏览器反馈等反馈回路的价值，也理解深模块、接缝、红绿重构这类概念，因为技能本身更像把既有纪律固化成可执行流程，而非替代理解。由于安装方式分成两条哲学路线，受众也随之分化：偏好托管与自动更新的人走 Claude Code 插件，得到的是只读、随作者发版更新的订阅式捆绑包；喜欢改代码的人用 skills.sh 或 npx skills 把可编辑的技能文件拷进自己的仓库，自己维护、自己拉取更新。设置环节还假设项目使用某一种 issue tracker（GitHub、Linear 或本地文件），并愿意维护打标签的分诊习惯与文档存放位置。另外，作者在 README 中提到其 newsletter 已有约六万名开发者，说明该受众还包含关注其方法论更新的读者。

## 上手、部署与集成

README 给出两种安装路径，作者自称是“30 秒设置”。Claude Code 用户可通过官方市场执行 claude plugins install mattpocock-skills，或在会话内运行 /plugin install mattpocock-skills，无需预先添加来源，更新自动送达，但捆绑包是管理的、只读的。Codex 及其他代理用户执行 npx skills@latest add mattpocock/skills，安装器允许挑选要哪些技能、装到哪些编码代理上，作者特别提醒务必勾选 setup-matt-pocock-skills，并说明原生 Codex 插件仍在路线图中（见 .agents/adr/0002-ship-as-a-claude-code-plugin.md）。想自行修改的人可用同一安装器把技能作为普通文件写进仓库，之后用 npx skills update 主动拉取更新，不会有后台自动变更。作者警告两条路径二选一，同时安装会让每个技能出现两份。安装后需在每个仓库运行一次 /setup-matt-pocock-skills，它会询问使用哪个 issue tracker、分诊票据时打什么标签、以及创建的文档保存到哪里。项目还提供 skills.sh 徽章，表明其在该目录中可被发现。README 未提供下载量、星标或第三方采用案例等可验证的采用指标。

## 限制与风险

按 README 自述，这些技能有意做得小、易改、可组合，代价是它们不拥有流程，规模较大的编排要靠用户自己串联，比如改善架构这类技能被作者明确描述为“survey, not a rescue”：在真正陈旧的代码库上它能找到真实候选点，但不会替你把泥球解开。安装层面也有边界：原生 Codex 插件只是路线图上的计划，尚未提供；两种安装哲学互斥，同时安装会产生重复技能；skills.sh 路径下不会自动更新，需要手动运行 npx skills update，而插件路径则是只读的，无法在本地直接改。使用前必须在每个仓库运行 setup 技能并回答 issue tracker、标签与文档位置，否则依赖这些配置的 triage 等技能无法正常工作。技能与模型无关、可与任何模型配合，这一点是项目方自述，README 未给出跨模型对比证据；同样，与 GSD、BMAD、Spec-Kit 相比“夺走控制权、流程内 bug 难解决”的评价也是作者立场，缺少可核验的对照数据。此外，grill-with-docs 被作者称为可能最有威力的技巧，但这类收益属于主观体验，没有量化指标支撑。

## 综合观察

这个仓库的定位不是工具库，而是把成熟软件工程实践翻译成代理可执行的工作流，其价值主张建立在 README 反复引用的几本书之上：Pragmatic Programmer 强调的对齐与反馈速率、Domain-Driven Design 强调的通用语言、Extreme Programming 强调的每天投资设计、A Philosophy of Software Design 强调的深模块。它把这四类问题分别对应到拷问式对齐、领域模型与 CONTEXT.md、tdd 与 diagnosing-bugs 的反馈回路、以及 codebase-design 与 improve-codebase-architecture 的设计纪律，结构清晰，且用户调用与模型调用的分层让流程编排和可复用纪律各归其位。安装设计上的双路径也体现了明确的产品取舍：订阅托管换取省心，拷贝文件换取可改。风险与短板同样明显：核心收益多为项目方自述和经验断言，缺少性能、token 消耗、缺陷率等可验证数据；技能依赖 setup 配置和 issue tracker，跨仓库迁移有一定摩擦；对于真正混乱的遗留代码库，作者也坦诚它只能给出候选而非救赎。总体适合已经具备工程判断力、愿意亲手调整流程的开发者做日常基础设施，而不适合期待开箱即用全自动交付的人。

[查看 GitHub 仓库](https://github.com/mattpocock/skills)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
