---
title: "mattpocock/skills"
period: "monthly"
period_key: "monthly-2026-09"
date: "2026-09-24T00:00:00+08:00"
description: "mattpocock/skills 是一套面向真实工程实践的 AI 编码代理技能集合，作者称来自其日常使用的 .agents 目录。它强调小而可改、可组合、适配任意模型，目标是用工程基本功修复代理开发中的典型失败模式，而不是做氛围编程。"
repository: "mattpocock/skills"
repository_url: "https://github.com/mattpocock/skills"
language: "Shell"
tags:
  - Skill
comment: false
---

mattpocock/skills 是一套面向真实工程实践的 AI 编码代理技能集合，作者称来自其日常使用的 .agents 目录。它强调小而可改、可组合、适配任意模型，目标是用工程基本功修复代理开发中的典型失败模式，而不是做氛围编程。

## 项目定位与要解决的问题

项目定位不是又一个包办流程的代理框架，而是把软件工程基本功拆成可复用的技能文件。README 明确写道，GSD、BMAD、Spec-Kit 这类做法试图通过接管流程来帮忙，但同时也夺走了开发者的控制权，使流程中的 bug 难以解决。作者主张技能应当小、易改、可组合，并声称适配任意模型，且基于数十年的工程经验。项目方自述这些技能用于日常真实工程，而非 vibe coding，并把自己与那些自带完整流程编排的方案区分开来。README 还提到约六万名开发者订阅其通讯，这一数据来自项目方自述，无法独立验证。

## 核心能力

核心思路是围绕四类常见失败模式提供对应技能。第一是代理没做对：通过 grill-me 与 grill-with-docs 让代理反过来盘问用户，在设计树每个分支都解决前不停手，从而在动手前完成对齐。第二是代理过于啰嗦：通过共享语言解决，让代理用项目术语如 materialization cascade 代替绕圈描述，并同步影响命名一致性、代码可导航性与 token 消耗。第三是代码跑不起来：通过静态类型、浏览器访问、自动化测试等反馈回路，尤其红绿重构的 TDD 与诊断 bug 的纪律化循环。第四是代码变成泥球：要求每天关心设计，用深模块等思路控制复杂度，并提供改进架构的技能定期扫描。

## 技术结构与实现思路

整个仓库以 Shell 为主，技能写成可被代理读取的 SKILL.md 文件，分布在 engineering 与 productivity 两个大类下。安装有三条路径：Claude Code 官方插件形式安装为受管只读包，随作者发布自动更新，适合订阅而非分叉；skills.sh 或 npx skills@latest add 则把可编辑技能文件复制进用户项目，适合动手改造；README 提醒两种方式只选其一，否则每个技能会出现两次。技能按调用者分成两类：用户调用型只能由人显式输入触发，职责是编排，例如 ask-matt 是路由、setup-matt-pocock-skills 负责初始化、to-spec 与 to-tickets 负责产出规格与工单、implement 驱动实现。模型调用型既可被人调用，也可由代理在任务匹配时自动使用，承载可复用纪律，例如 tdd、diagnosing-bugs、domain-modeling、codebase-design、code-review、resolving-merge-conflicts、prototype、research 与 wizard。约束是用户调用型可以调用模型调用型，但不能调用另一个用户调用型。

## 实际工作流程

典型使用节奏是：先在每个仓库运行一次 setup-matt-pocock-skills，选择问题跟踪器为 GitHub、Linear 或本地文件，配置分诊标签以及文档保存位置。之后要改东西时，用 grill-me 或 grill-with-docs 先做盘问式对齐，后者还会同步更新 CONTEXT.md 与 ADR，把难以解释的决策固化下来。确认方向后，用 to-spec 把当前对话综合成规格并发布到跟踪器，或用 to-tickets 拆成带阻塞边的 tracer-bullet 工单，可写成文本或真实跟踪器上的原生阻塞链接。实现阶段由 implement 在工作前约定的接缝上驱动 tdd，提交前走 code-review。遇到难缠 bug 或性能回退时进入 diagnosing-bugs 的纪律循环：先建立对该 bug 变红的反馈回路，再最小化、假设、插桩、修复、回归测试。工作量大到单个会话装不下时，用 wayfinder 在跟踪器上铺开决策工单地图并逐个解决；triage 则让 issue 沿一组分诊角色状态机流转。

## 与同类方案的取舍

与包办流程的方案相比，这套技能的不同在于把控制权留给开发者：技能本身小而可改，用复制安装时可以随意 hack，官方插件的更新也不会在你背后自动改动你复制的文件。它们的组织方式按调用权限划分，用户调用型负责编排，模型调用型负责纪律，且用户调用型之间不允许互相调用，避免流程层层套娃。grilling 被抽成可复用的面试原语，支撑 grill-me、grill-with-docs、triage、wayfinder 和改进架构等多个技能，这是较有特色的抽象。共享语言被作者称为本仓库最酷的技术之一，其收益包括命名一致、代码更易导航、思考 token 更少，但这些因果性收益属项目方论述。架构改进技能被明确描述为普查而非救援，在真正陈旧的代码库上会找到候选点，但不会替你解开泥团，这一自我限定也体现了项目的务实边界。安装方面提供插件订阅与文件复制两种哲学，并明确警告不要同时使用。

## 值得关注的设计

项目的核心主张是把软件工程基本功封装成小粒度、可组合、跨模型可用的代理技能，而不是像作者所述 GSD、BMAD、Spec-Kit 那样由流程包办进而削弱开发者控制。最突出的设计是 /grill-me 与 /grill-with-docs 这类拷问式对话，先通过持续追问逼出需求与设计分支再动手；后者还把共享领域语言写成 CONTEXT.md 和 ADR，让代理用更少词表达更多含义。技能被明确划分为用户调用与模型调用两类，用户调用技能负责编排，模型调用技能承载可复用纪律，前者可调用后者但不会调用另一个用户调用技能。此外还有 wayfinder 把超出单次会话的大工程拆成决策票据地图，以及 code-review 用并行子代理在 Standards 与 Spec 两轴分离评审。以上机制均来自项目自述。

## 适用领域和具体场景

工程技能覆盖从对齐、规划到实现与维护的完整链路：/ask-matt 充当选择技能的路由器，/triage 让 issue 在分诊状态机中流转，/to-spec 把已有对话综合成规格并发布到 issue tracker，/to-tickets 将计划拆成带阻塞关系的 tracer-bullet 票据，/implement 按预先约定的接缝驱动 /tdd 并在提交前跑 /code-review，/wayfinder 则为超大会话量的工作建立决策票据地图逐个消解。/tdd 用红绿重构循环逐垂直切片推进，/diagnosing-bugs 提供从复现反馈环路到最小化、假设、插桩、修复和回归测试的纪律化排障流程，/improve-codebase-architecture 会扫描代码库给出加深模块的候选并以 HTML 报告呈现。生产力类则包含 /handoff 压缩会话供另一代理接续、/teach 多会话教学、/to-questionnaire 把无法独自回答的决策变成问卷、/wait-what 在信息未落地时用 CONTEXT.md 词汇重新解释。

## 哪些人会受益

目标用户是日常使用 Claude Code、Codex 等编码代理进行真实项目开发的工程师，尤其是对 vibe coding 持保留态度、希望保留流程控制权的人。README 强调技能基于数十年工程经验、可与任意模型配合，因此并不绑定单一厂商。作者设想的典型使用者愿意阅读并改写技能文件：安装方式区分了订阅者与改造者两种哲学，Claude Code 插件提供托管只读、随作者更新，skills.sh 则把可编辑技能文件复制进项目供自行修改；还专门为 tinkerers 说明同一安装器会把技能写成你拥有的普通文件，不会在背后自动更新，需要时用 npx skills update 拉取。由于技能涉及 issue tracker 配置、triage 标签和文档布局，使用前每个仓库需运行一次 setup-matt-pocock-skills，这暗示其受众是有固定仓库与工单流程的团队或个人开发者，而非一次性脚本用户。

## 上手、部署与集成

README 给出的接入路径较具体：Claude Code 用户可执行 claude plugins install mattpocock-skills 或在会话内 /plugin install mattpocock-skills，该插件已进入 Claude Code 官方市场，无需预先添加源且更新自动到达；Codex 及其他代理用户运行 npx skills@latest add mattpocock/skills，安装器允许挑选技能和要装到哪些编码代理，作者特别提醒务必包含 setup-matt-pocock-skills。原生 Codex 插件被写明在路线图中，并链接到关于以 Claude Code 插件形式发布的 ADR。设置步骤会询问使用 GitHub、Linear 还是本地文件作为 issue tracker、分诊时使用的标签以及文档保存位置。推广方面，作者邀请开发者加入其约六万人的 newsletter 以跟进技能变更与新技能，仓库还带有 skills.sh 徽章。这些数字与更新承诺均为项目方自述，未见独立验证。

## 限制与风险

README 本身给出若干边界。安装方式二选一，同时装插件与 skills.sh 会让每个技能出现两次。插件路线是托管只读、随作者发布更新，适合订阅但不适合直接改；skills.sh 路线把文件复制进仓库，不会在背后更新，需要手动运行 npx skills update。作者也坦承 /improve-codebase-architecture 是勘察而非拯救，面对真正陈旧的代码库能找出真实候选，但不会替你理顺混乱。/to-spec 明确不做访谈，只综合已讨论内容，因此前提是此前已有充分对话。原生 Codex 插件尚未推出，仍在路线图阶段。技能虽被描述为适合任何模型，跨代理行为差异仍由用户自行承担。此外仓库以 Shell 为主要语言，技能效果依赖使用者配合拷问、维护 CONTEXT.md 与 ADR 的纪律。

## 综合观察

该项目更像一套可组合的工程习惯而非框架，其价值主张集中在用小型技能恢复开发者对代理流程的控制，与作者批评的流程包办形成对照。最有辨识度的是把需求对齐、共享语言和代码设计三件事前置：通过拷问式对话减少返工，通过 CONTEXT.md 降低冗长与歧义，并要求持续投入设计以对抗代理加速带来的软件熵增。分用户调用与模型调用的分层，以及 code-review 的并行双轴设计，显示出对代理编排和上下文污染的清醒认识。风险在于收益高度依赖使用者愿意被追问、维护领域文档并定期勘察架构，这会带来不小的纪律成本。README 中关于提速、减少 token 和流行度的说法均为项目方自述，缺乏独立数据支撑。适合已经在用编码代理并希望把工程基本功制度化的团队试用，不适合期待开箱即用自动化流水线的人。

[查看 GitHub 仓库](https://github.com/mattpocock/skills)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
