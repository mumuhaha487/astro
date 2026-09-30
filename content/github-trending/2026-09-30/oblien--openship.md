---
title: "oblien/openship"
period: "daily"
date: "2026-09-30T00:00:00+08:00"
description: "Openship 是一个开源、可自托管的应用部署平台，内置 CI/CD 流水线。项目使用 TypeScript 编写，用户可将代码仓库指向它，由平台完成构建、部署、路由和 TLS 终止，并可通过桌面应用、Web 仪表盘或 CLI 进行管理。"
repository: "oblien/openship"
repository_url: "https://github.com/oblien/openship"
language: "TypeScript"
tags: ["开发工具","云服务"]
stars_today: 436
comment: false
---

Openship 是一个开源、可自托管的应用部署平台，内置 CI/CD 流水线。项目使用 TypeScript 编写，用户可将代码仓库指向它，由平台完成构建、部署、路由和 TLS 终止，并可通过桌面应用、Web 仪表盘或 CLI 进行管理。

## 项目做什么

Openship 的目标是提供一个可自行托管的部署平台，让用户把 GitHub 仓库、本地文件夹或预构建产物交给它，由同一套流程完成检测、构建、运行、路由与 TLS 证书签发，并内置推送触发部署的 CI/CD 能力。它还负责管理数据库、域名、SSL、CDN、邮件与备份，从而把应用部署与基础设施运维集中在一个系统中，并提供桌面应用、Web 仪表盘、CLI、JavaScript/TypeScript SDK、MCP 与 REST API 等多种操作界面。

## 与同类方案相比

根据 README，Openship 的主要优势包括：自托管免费且不涉及计费；一套界面支持多种运行方式，包括桌面应用、常驻服务器、Openship Cloud 以及 VPS、独立服务器和多服务器场景；内置 CI/CD，支持推送触发部署、预览环境、预发/生产流程和回滚；自动签发 Let's Encrypt 证书并管理域名；自带邮件服务器以减少对外部邮件服务的依赖；支持计划备份与一键恢复；使用标准 Docker 容器以提升可移植性。仓库未提供与其他产品的对比数据或性能基准，因此不能据此断言其优于竞品。

## 设计与创新

README 提及的较具特色的设计包括：依据仓库内容自动检测技术栈和构建配置，并通过 openship.json 进行覆盖；将解析后的配置冻结为快照，使重新部署和回滚按原样运行；先启动应用、后进行路由和 TLS，使 DNS 或证书问题表现为“需要操作”而不导致部署失败或应用宕机；支持直接部署现有 Docker Compose 文件；提供仅暴露主动选择路由的 MCP 端点，并每次调用重新校验权限。但仓库未提供与其他同类工具的对比，这些功能是否属于行业首创尚无法验证。

## 适用场景

README 描述了三类典型使用方式：个人用户可在 macOS、Windows 或 Linux 上使用桌面应用，通过 SSH 连接服务器或使用 Openship Cloud 进行部署；团队或需要推送触发部署的场景，可在自己的服务器上通过 CLI 安装并自托管，使用 Compose 模式在同一台机器上托管应用，或以 bare 模式部署到其他服务器或云端；不希望自行运行任何组件的用户可以使用 Openship Cloud 的托管沙箱。此外，也支持在 VPS、独立服务器、多服务器环境中部署，并使用 SDK、REST API 或 MCP 进行自动化。

## 谁会受益

对于希望把应用部署、CI/CD、域名与 TLS、邮件、备份和监控集中到一个可自托管平台上的个人或团队，Openship 提供了较完整的覆盖面。其多种界面适合不同使用习惯：桌面应用适合个人和希望控制平面仅在本机运行的用户；自托管服务器适合团队和需要推送部署的场景；CLI 与 SDK 适合自动化和 CI 流程。README 称核心已可用于生产环境，并持续开发中。不过文档仍在补充之中，部分功能例如多节点集群尚未实现，实际易用程度仍需结合文档与试用验证。

## 使用前需要注意

README 明确指出部分限制：推送触发部署和公开域名需要常驻服务器或 Openship Cloud，桌面或仅本地回环的实例没有可接收 webhook 的公开端点；原始 Docker Compose 自托管方式仅支持 Linux（使用主机网络），且容器内到主机的操作需要额外的 SSH 通道；从源码安装的 dev 版本属于未经验证的开发构建，需要 Bun 与 git，不是生产路径；多节点集群、负载均衡界面、私有网络和可视化 CI/CD 流水线仍在计划中。此外，该自托管堆栈的 API 容器挂载主机 Docker socket，具有主机权限，README 建议仅在可信主机上运行。

[查看 GitHub 仓库](https://github.com/oblien/openship)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
