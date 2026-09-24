---
title: "hydra-db/hydradb"
period: "weekly"
period_key: "weekly-2026-w39"
date: "2026-09-25T00:00:00+08:00"
description: "HydraDB 是用 Rust 编写的对象存储原生分布式图数据库，在 S3 兼容存储之上提供持久化图存储、快照一致的 OpenCypher 查询、GraphBLAS 遍历、Neo4j 兼容 Bolt 与 HTTPS 查询 API。"
repository: "hydra-db/hydradb"
repository_url: "https://github.com/hydra-db/hydradb"
language: "Rust"
tags: ["数据"]
comment: false
---

HydraDB 是用 Rust 编写的对象存储原生分布式图数据库，在 S3 兼容存储之上提供持久化图存储、快照一致的 OpenCypher 查询、GraphBLAS 遍历、Neo4j 兼容 Bolt 与 HTTPS 查询 API。

## 项目定位与要解决的问题

项目将 S3 兼容对象存储作为唯一持久真相来源，计算层以 graph-node 与 graph-indexer 两种角色独立扩展，并保持本地存储仅为可丢弃缓存。README 将自身定位为对象存储原生图数据库，其优势表述属于项目方自述：借助对象存储实现持久性与计算存储解耦，并宣称可在不迁移图本身的前提下替换或扩展节点。

## 核心能力

核心能力围绕快照一致的 OpenCypher 子集展开，支持类型化关系、有界变长路径、属性与标签谓词、排序、分页、聚合、OPTIONAL MATCH、UNION 及批量 UNWIND 写入。查询执行结合属性索引、反向邻接、稀疏遍历与 SuiteSparse GraphBLAS。原生路径过程 algo.SPpaths、algo.SSpaths、algo.MSpaths 在单个固定快照上运行，使用编译后的 GraphBLAS 拓扑、可见 WAL 叠加层与有界元数据补全，MSpaths 还能一次性解析多个索引源和目标值，避免客户端查询扇出。

## 技术结构与实现思路

存储与计算完全分离。S3 兼容对象存储保存图记录、WAL、清单与不可变遍历索引。数据节点负责查询与规范变更，索引器异步构建不可变 CSC 代并通过对象存储原子指针发布。每个数据节点持有私有本地 SSD 或 NVMe 缓存，内存和本地盘仅保存可丢弃状态。写入者通过对象存储 CAS 租约选出，并由 SlateDB writer epoch 隔离过期写入者。读取始终基于一个固定的 SlateDB 快照，索引遍历将编译后的 CSC 代与可见 WAL 尾部叠加，因此索引缺失或落后不影响读取正确性。

## 实际工作流程

部署时可通过 Docker 镜像或源码构建启动开发节点，默认要求 TLS，本地流程需显式允许明文。节点监听 Bolt 7687、HTTP 8443 和用于就绪与 Prometheus 指标的 Admin 9090。验证要求通过 HTTP 或 Neo4j 驱动完成一次写入并读回，README 强调监听端口不等于可用。查询可指定 causal 或 strong 读一致性：causal 使用当前持久化读视图并在书签要求更新序列时刷新，strong 在固定快照前从对象存储刷新读取器。生产环境通过 Helm chart 部署查询节点、索引器、服务、缓存卷、网络策略、中断预算、TLS 和认证。

## 与同类方案的取舍

与常见将本地磁盘或块存储作为持久层的图数据库不同，HydraDB 将 S3 兼容对象存储设为唯一持久副本，使计算节点仅保留可重建缓存。其索引器异步生成不可变 CSC 代，读取时叠加可见 WAL 尾部，因此索引缺失或延迟不影响正确性。写入者交接结合对象存储 CAS 租约与 SlateDB writer epoch，两种读模式在一致性与对象存储新鲜度成本之间取舍。项目还公开 OpenCypher TCK、Jepsen 一致性报告、Quint 形式验证证据以及实时基准站点，但这些性能与一致性优势的具体数字均属于项目方自述，未在 README 中给出可独立复核的对照组。

## 值得关注的设计

HydraDB 将持久化层完全放在 S3 兼容对象存储上，图记录、WAL、manifest 与不可变遍历索引都存放在对象存储中，计算层拆分为 graph-node 与 graph-indexer 两类角色，二者本地只保留可丢弃缓存。写入授权由对象存储 CAS 租约选出每个 cell 的活跃写入者，SlateDB writer epochs 负责隔离过期写入者；查询在固定快照上执行，索引遍历把已编译的 CSC 生成物与可见 WAL 增量叠加，因此索引缺失或滞后时读取仍然正确。这些属于项目方自述的设计，未提供与其他图数据库的对比数据。

## 适用领域和具体场景

项目面向需要图数据持久化与遍历查询的场景，提供 OpenCypher 子集用于读取和变更，支持类型化关系、有界变长路径、属性与标签谓词、排序、分页、聚合、OPTIONAL MATCH、UNION 以及批量 UNWIND 写入。应用可通过 Neo4j 驱动以 neo4j:// 路由方式连接 Bolt 5.x，也可使用 HTTPS 的 JSON 或 NDJSON 查询接口。仓库还内置 algo.SPpaths、algo.SSpaths、algo.MSpaths 快照级路径过程，MSpaths 可对多组源和目标值统一求值，避免客户端展开查询。

## 哪些人会受益

主要使用者是需要在对象存储上运行图数据库的工程团队，包括负责部署 Helm chart 到 Kubernetes 的运维人员，以及用 Rust 1.91 及以上、libcypher-parser、SuiteSparse GraphBLAS 构建与开发的人员。仓库记录显示提交者应阅读 AGENTS.md 与 DEVELOPMENT.md，并在提交前运行 just ci；涉及存储、栅栏、快照、路由或索引发布的变更需声明其保持的不变量并附失败导向测试。也适合需要用 Neo4j 驱动或 HTTP 接入现有应用的开发者。

## 上手、部署与集成

入门路径明确：可使用已发布的 ghcr.io/hydra-db/hydradb 容器镜像，发布标签包含完整版本、兼容次版本与主版本、提交 SHA 及 latest，镜像覆盖 linux/amd64 与 linux/arm64，0.1.0 及更早版本仅 amd64；也可从源码构建并通过 just native-check、just smoke 验证。本地单节点用 local 对象存储与明文模式，生产建议固定镜像 digest 并使用 Helm chart 部署查询节点、索引器、服务、缓存卷、网络策略、干扰预算、TLS、认证及可选 Prometheus。监听端口不等于可用，需通过写入读回验证。

## 限制与风险

README 表明 HydraDB 仅支持实用的 OpenCypher 子集，未声称完整兼容全部 Cypher。读取有一致性取舍：causal 使用节点当前持久化读者视图，仅在书签要求更新序列时刷新；strong 在固定查询快照前从对象存储刷新读者，需支付对象存储新鲜度代价。部署环境默认要求 TLS，本地流程需显式开启明文。构建依赖 libcypher-parser 与 SuiteSparse GraphBLAS，macOS 需通过专门 tap 安装；graph-node 异步查询 future 超出默认线程栈，未设置 RUST_MIN_STACK 时首次查询会栈溢出中止。生产需固定镜像 digest。

## 综合观察

HydraDB 的核心主张是对象存储原生的持久化与读写分离，计算节点和索引器只保留可重建缓存，代之以对象存储 CAS 租约和 SlateDB writer epochs 约束写入者，查询始终固定单一快照，索引滞后由可见 WAL 增量补偿。仓库提供可复现的本地与 MinIO 冒烟流程、运行时脚本、Helm chart、架构说明、正确性案例、Quint 形式化验证与 Jepsen 一致性报告，工程证据面较完整。但 README 未给出与其它图数据库的性能或功能对比，基准页以外部链接呈现，实际吞吐、延迟与规模上限应以项目方自述和可复现测量为准，尚未独立验证。

[查看 GitHub 仓库](https://github.com/hydra-db/hydradb)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
