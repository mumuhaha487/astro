---
title: "addyosmani/agent-skills"
period: "daily"
date: "2026-09-17T00:00:00+08:00"
description: "该仓库将资深工程师的工作流、质量门禁与最佳实践封装为技能包，覆盖 9 个斜杠命令与 25 个技能，让 AI 编程代理在需求定义、规划、构建、验证、评审与发布各阶段按统一流程执行。"
repository: "addyosmani/agent-skills"
repository_url: "https://github.com/addyosmani/agent-skills"
language: "JavaScript"
tags: ["Skill","AI","开发工具"]
stars_today: 658
comment: false
---

该仓库将资深工程师的工作流、质量门禁与最佳实践封装为技能包，覆盖 9 个斜杠命令与 25 个技能，让 AI 编程代理在需求定义、规划、构建、验证、评审与发布各阶段按统一流程执行。

## 项目做什么

项目目的是为 AI 编码代理提供结构化的工程技能，把从想法到上线的开发生命周期拆成 DEFINE、PLAN、BUILD、VERIFY、REVIEW、SHIP 六个阶段，并为每个阶段提供入口命令。仓库共收录 25 个技能，其中 24 个生命周期技能加 1 个 using-agent-skills 元技能，每个技能由步骤、验证门禁和反合理化表格组成，用于约束代理按既定流程工作，而不是临场发挥。

## 与同类方案相比

技能以纯 Markdown 编写，README 称其可用于任何接受系统提示或指令文件的代理。官方提供开源 skills CLI，声称可安装到 70 多个代理，并为 Claude Code、Cursor、Codex、Gemini CLI、Copilot、Windsurf、OpenCode、Kiro、Antigravity CLI、Command Code 等给出原生集成或配置文档。技能还能按当前任务自动激活，例如设计 API 触发 api-and-interface-design、构建界面触发 frontend-ui-engineering。README 自称 production-grade，但未提供性能或效果对比数据，实际收益尚无法验证。

## 设计与创新

技能内容包含工作流步骤、验证门禁与反合理化表格，试图阻止代理为通过检查而关闭校验或跳过测试。build auto 模式在计划获批后自动生成并逐条实现任务，但每个任务仍遵循测试驱动并单独提交，遇到失败或高风险步骤会暂停。仓库还提供 code-reviewer、test-engineer、security-auditor、web-performance-auditor 四个审计人格，以及供多个技能共享的参考清单。这些设计的具体效果在 README 中未见实测数据，是否优于其他提示词方案目前无法验证。

## 适用场景

适合需要让 AI 代理按固定流程完成软件开发的场景：新项目可从需求澄清与约束定义开始，走完规划、实现、测试、评审与发布全流程；已有代码库可按 Adoption Guide 提供的渐进、验证优先路径逐步引入。也可单独安装某个技能，例如提交前的五轴代码评审、一次一问直到高置信度的需求访谈、红绿重构的测试驱动开发，以及规划与任务拆解。其他匹配场景包括前端界面与设计系统、API 与接口契约设计、安全加固、性能优化、Git 与 CI/CD 流程、弃用迁移、文档与 ADR、可观测性与上线检查。

## 谁会受益

该仓库把资深工程师通常依赖口传心授的做法写成可复用的文本资产，使不同代理会话之间保持一致的质量标准，减少代理在缺少约束时跳过测试、静默禁用检查或一次性大范围改动代码的情况。技能按生命周期分类且可单独引用，便于团队按需裁剪，也便于新成员或新会话快速建立上下文。由于内容为 Markdown，迁移到不同代理工具的成本较低。README 未给出使用前后的量化对比，因此效率提升幅度仍属未证实主张。

## 使用前需要注意

README 明确记录了一些限制：通过 npx 单独安装某个技能时只复制 skills 下的该技能目录，不含仓库级 references 目录，技能虽能运行但指向共享清单的路径会失效，该问题记录在 issue 361。Claude Code 市场安装依赖 SSH 克隆，未配置 SSH 密钥的用户需改用 HTTPS 或调整 Git 配置。部分 Antigravity CLI 版本中旧命令 TOML 报为已转换但无法被发现，需直接调用命名空间技能。Cursor 建议把技能放到 .cursor/skills 而非粘贴进 rules。仓库简介未说明许可证，性能与竞品优势亦无法验证。

[查看 GitHub 仓库](https://github.com/addyosmani/agent-skills)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
