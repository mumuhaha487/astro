---
title: "rustfs/rustfs"
period: "daily"
date: "2026-09-18T00:00:00+08:00"
description: "RustFS 是 Rust 编写的开源分布式对象存储系统，提供 S3 兼容接口，并支持与其他 S3 平台迁移和共存。README 列出其功能与状态。"
repository: "rustfs/rustfs"
repository_url: "https://github.com/rustfs/rustfs"
language: "Rust"
tags: ["云服务","数据"]
stars_today: 559
comment: false
---

RustFS 是 Rust 编写的开源分布式对象存储系统，提供 S3 兼容接口，并支持与其他 S3 平台迁移和共存。README 列出其功能与状态。

## 项目做什么

项目目标是为需要 S3 接口的部署提供开源对象存储，并支持与既有 S3 兼容系统迁移和共存。README 称其面向数据湖、AI 和大数据工作负载，支持单节点与分布式模式，覆盖版本控制、对象锁、服务端加密、KMS、生命周期、桶复制、站点复制、事件通知、审计日志、OIDC/SSO、Web 控制台、Swift、Keystone、FTPS、WebDAV 和 SFTP 等能力。这些功能的状态由 README 表格标注，部分为预览或需编译特性开关。

## 与同类方案相比

据 README，优势包括采用 Rust 实现、Apache 2.0 许可证、提供 S3 兼容核心能力、支持单节点与分布式模式，并具备版本控制、对象锁、服务端加密、KMS、生命周期、桶复制、站点复制、事件通知、审计日志、OIDC/SSO、Web 控制台和 Helm 部署等。README 还列出 Swift、Keystone、FTPS、WebDAV、SFTP 等接入方式。不过，README 中与 MinIO 或其他对象存储的比较和性能结论缺少可复现数据，尚无法独立验证。

## 设计与创新

README 将 Rust 语言基础、内存安全、Apache 2.0 许可、S3 Tables（Iceberg REST）预览、MinIO 磁盘格式兼容预览、Swift API 与 Keystone 认证、FTPS/WebDAV/SFTP 以及 KMS 等视为特点。是否构成行业创新，README 未提供与既有项目的可复现对比或设计细节，因而尚无法验证。同时，S3 Tables 和 MinIO 磁盘兼容被标为预览或需特性开关，不能视为默认稳定能力。

## 适用场景

README 称其适用于数据湖、AI 和大数据工作负载，也可用于需要 S3 兼容接口的应用、工具和平台迁移或共存场景，例如与 MinIO、Ceph 等 S3 兼容系统并存。它提供单节点、分布式、Kubernetes Helm 部署以及边缘/IoT 相关定位，还支持多租户、OIDC/SSO、Swift 和 Keystone 等接入。实际适用性仍取决于功能矩阵、部署拓扑和预览特性限制。

## 谁会受益

对需要自建 S3 兼容对象存储的团队，RustFS 提供了可评估的开源选项：README 给出安装脚本、Docker、Podman、Docker Compose、源码构建和 Helm 等部署方式，并列出可观测性集成与多种认证协议。对已有 MinIO 或 Ceph 环境的用户，迁移和共存是明确目标。但功能是否满足生产要求需逐项核对状态表、兼容矩阵和预览限制，不能仅凭简介判断。

## 使用前需要注意

限制包括：README 将 S3 Tables 与 MinIO 磁盘兼容标为预览，后者需 rio-v2 特性且非默认，MinIO 加密对象不可读；Swift 和 SFTP 需可选 cargo 特性，KMS 的 Local/Static 后端仅用于开发测试。单节点单盘不能原地扩展或作为 Pool 加入，扩展现有池需遵循端点与纠删集规则。README 的性能和竞品比较缺少可复现数据，S3 兼容覆盖也需查阅兼容矩阵，因此生产采用前必须逐项验证。

[查看 GitHub 仓库](https://github.com/rustfs/rustfs)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
