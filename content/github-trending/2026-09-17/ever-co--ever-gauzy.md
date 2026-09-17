---
title: "ever-co/ever-gauzy"
period: "daily"
date: "2026-09-17T00:00:00+08:00"
description: "Ever Gauzy 是基于 TypeScript 的开源业务管理平台，整合 ERP、CRM、HRM、ATS、项目与时间追踪，面向协作、按需和共享经济，提供 Headless API、Web 与桌面应用。"
repository: "ever-co/ever-gauzy"
repository_url: "https://github.com/ever-co/ever-gauzy"
language: "TypeScript"
tags: ["其他"]
stars_today: 778
comment: false
---

Ever Gauzy 是基于 TypeScript 的开源业务管理平台，整合 ERP、CRM、HRM、ATS、项目与时间追踪，面向协作、按需和共享经济，提供 Headless API、Web 与桌面应用。

## 项目做什么

项目旨在提供一体化开源业务管理平台，覆盖企业资源规划、客户关系管理、人力资源管理、申请人跟踪、工作与项目管理、员工时间活动与生产力追踪。README 说明其面向协作、按需与共享经济，并适用于公司、按需业务、自由职业、代理机构、工作室或内部团队。平台提供 Headless API，并有 Web、桌面与服务端等运行形态。

## 与同类方案相比

README 列出功能覆盖面广，包括仪表盘、时间追踪、员工管理、招聘、联系人、日程、项目任务、目标与 KPI、销售管道、提案、会计发票、账单支付、收支、休假审批、库存、设备共享、多组织、多币种、多语言、主题、角色权限、导入导出和报告分析。技术栈以 TypeScript、NestJS、Angular、TypeORM/MikroORM/Knex 为主，提供 Docker Compose、桌面应用和服务器等部署选择。README 未提供与竞品的量化对比，因此性能或相对优势尚无法验证。

## 设计与创新

README 没有明确宣称算法、专利或行业首创，也未提供与同类平台的对照实验。从描述看，其整合方式是将 ERP、CRM、HRM、ATS、项目管理和时间活动追踪集中在一个平台，并通过 Headless API 支持 Web 与桌面客户端。还提供桌面计时器和多组织管理。这些组合是否构成创新，缺少第三方验证与 README 依据，目前只能视为项目定位和功能集成，具体创新性尚无法验证。

## 适用场景

适用场景包括协作、按需与共享经济业务，以及公司、代理机构、工作室、自由职业者和内部团队。小中型组织可用 Gauzy Server 快速部署；个人可试用 Gauzy Desktop App；员工或承包商可用 Desktop Timer 进行时间与活动追踪。README 还提供 Demo、SaaS Alpha、Docker Compose 演示与生产配置，以及 Kubernetes 生产建议。多组织、多币种、多语言和权限功能适合跨组织或跨地区管理需求。

## 谁会受益

对于希望自托管并统一管理客户、项目、员工、时间、财务和招聘流程的团队，该项目提供了较多模块和 Headless API，便于按需接入前端或第三方系统。Docker Compose 和默认演示账号降低了快速体验门槛，桌面计时器补充了时间追踪场景。但 README 标注 SaaS 为 Alpha、文档仍为 WIP，生产部署需正确设置密钥并评估模块成熟度，因此有用性取决于具体业务流程与运维能力，不能仅凭功能列表推断。

## 使用前需要注意

README 明确提示 SaaS 当前为 Alpha 测试模式，应谨慎使用；文档为 WIP，可能不完整。生产环境必须设置强 JWT 与 Session 密钥，否则 API 拒绝启动；Docker Compose 生产配置建议改用 Kubernetes。本地构建可能耗时，yarn seed:all 约需十分钟。平台包含大量模块和基础设施组件，部署与维护复杂度不低。README 标注许可证为 AGPL v3，使用前需确认合规要求。此外，缺少性能基准和竞品对比，相关优势尚无法验证。

[查看 GitHub 仓库](https://github.com/ever-co/ever-gauzy)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
