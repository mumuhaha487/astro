---
title: "hydra-db/hydradb"
period: "weekly"
period_key: "weekly-2026-w40"
date: "2026-09-28T00:00:00+08:00"
description: "HydraDB 是 Rust 编写的对象存储原生分布式图数据库，将持久图数据放在 S3 兼容存储，计算分为数据节点与索引器两层；支持快照一致性 OpenCypher 查询、GraphBLAS 遍历、Bolt 5.x 与 HTTPS 接口。"
repository: "hydra-db/hydradb"
repository_url: "https://github.com/hydra-db/hydradb"
language: "Rust"
tags: ["数据","开发工具"]
comment: false
---

HydraDB 是 Rust 编写的对象存储原生分布式图数据库，将持久图数据放在 S3 兼容存储，计算分为数据节点与索引器两层；支持快照一致性 OpenCypher 查询、GraphBLAS 遍历、Bolt 5.x 与 HTTPS 接口。

## 项目定位与要解决的问题

HydraDB 将图数据库的持久层完全放在 S3 兼容对象存储上，计算层拆成数据节点与索引器两个可独立伸缩的角色，本地 SSD/NVMe 仅作可丢弃缓存。查询侧同时提供 Neo4j 兼容 Bolt 5.x、HTTPS 上的 typed JSON 与 NDJSON 接口，并实现 OpenCypher 的实用子集，包括类型化关系、有界变长路径、属性与标签谓词、排序、分页、聚合、OPTIONAL MATCH、UNION 和批量 UNWIND 写入。项目以 AGPL-3.0 发布，要求 Rust 1.91 以上，并提供 Docker 镜像与 Helm chart 用于开发与 Kubernetes 部署。

## 核心能力

HydraDB 的存储模型以对象存储为唯一持久真相：图记录、WAL、manifest 和不可变遍历索引都写入 S3 兼容存储。数据节点的每次查询固定在一个 SlateDB 快照上，索引遍历则把已编译的 CSC 代与当前可见的 WAL 叠加，因此索引缺失或落后时读取仍然正确。写入侧使用对象存储 CAS 租约选出每个单元格的活跃写入者，并用 SlateDB writer epoch 隔离过期写入者。读取侧提供 causal 与 strong 两种一致性模式，前者走节点当前持久读视图，后者在固定快照前先从对象存储刷新读视图。

## 技术结构与实现思路

架构分为三层：接入层为应用或负载均衡，数据层由多个 graph-node 组成，各自持有私有本地 SSD/NVMe 缓存并直接与对象存储交互，索引层由 graph-indexer 异步构建不可变 CSC 代并通过对象存储上的原子指针发布。对象存储位于两层之下，承载 WAL、SST、租约和 CSC 代，是整个图数据唯一持久副本。仓库按功能划分代码：src/core 负责配置、图模型、缓存策略与错误，src/shard 负责存储生命周期、读写、查询与路径过程，src/engine 负责路由、放置、不可变索引与索引 GC，src/query 负责 Cypher 解析、代数、规划与传输类型，src/client 负责 Bolt、HTTP、鉴权、配额与游标，src/sparse_kernel 负责 Rust 稀疏与 SuiteSparse GraphBLAS 执行。

## 实际工作流程

典型使用流程包含两种启动方式：使用已发布的多架构 Docker 镜像，或从源码构建。单节点开发需要设置 CLOUD_PROVIDER=local、LOCAL_PATH、GRAPH_NAMESPACE/GRAPH_ID/GRAPH_CELL_ID/GRAPH_CELLS/GRAPH_NODE_ID、GRAPH_BOLT_NODE_ADDRESSES、GRAPH_ADVERTISED_BOLT_ADDR、GRAPH_DATA_CACHE_DIR、GRAPH_AUTH_TOKEN_FILE 和 GRAPH_ALLOW_PLAINTEXT，并设置 RUST_MIN_STACK 以容纳异步查询 future。节点启动后监听 Bolt 7687、HTTP 8443 与 Admin 9090。验证需要真正往返一次写入：通过 HTTP 发送 CREATE 和 MATCH，或运行 scripts/runtime_smoke.sh 得到 runtime-smoke-ok。生产环境通过 Helm chart 部署查询节点、索引器、服务、缓存卷、网络策略、中断预算、TLS 与认证。

## 与同类方案的取舍

HydraDB 的差异点集中在对象存储原生与计算分离：图记录、WAL、manifest 与遍历索引全部落在 S3 兼容存储，数据节点和索引器可分别伸缩并仅依赖可丢弃的本地缓存重建。它用对象存储 CAS 租约加 SlateDB writer epoch 做安全写入者切换，用单一固定快照保证查询一致性，并以可见 WAL 覆盖不可变 CSC 代来容忍索引缺失或落后。查询侧提供 Neo4j 驱动可用的 Bolt 5.x 与 HTTPS JSON/NDJSON，并内置 algo.SPpaths、algo.SSpaths、algo.MSpaths 三个原生快照级路径过程，可一次解析多组源与目标，减少客户端扇出。项目还提供 OpenCypher TCK、Jepsen 一致性报告、Quint 形式化验证证据和正确性案例集。其快速与高效属于项目方自述，README 未给出可独立核验的具体数值，实际延迟与吞吐应以官方 benchmark 站点与本地复现为准。

## 值得关注的设计

项目在存储与计算分离上做得比较彻底：图记录、WAL、清单和不可变遍历索引都放在 S3 兼容对象存储中，是唯一的持久副本；数据节点和索引器只保留可丢弃的内存与本地 SSD/NVMe 缓存，因此角色可以被替换或独立扩展而不搬动图数据。写入端使用对象存储的 CAS 租约选出每个 cell 的唯一活跃写入者，并用 SlateDB writer epoch 隔离旧写入者；读取端把每个查询固定在一个 SlateDB 快照上，索引遍历时把编译后的 CSC 索引代际与可见的 WAL 尾部叠加，因此索引缺失或落后时读结果仍然正确，这是与单纯内存图数据库不同的设计取向。查询执行层使用属性索引、反向邻接、稀疏遍历和 SuiteSparse GraphBLAS，并提供 algo.SPpaths、algo.SSpaths、algo.MSpaths 等原生路径过程，同时支持 causal 与 strong 两种读一致性模式，这些设计在仓库说明中有明确描述，但相对其他系统的性能优势仍以项目方发布的基准站点为准，未在 README 中给出可比较的第三方数据。

## 适用领域和具体场景

README 给出的落地方式以自托管和 Kubernetes 为主：可以用 Docker 镜像或源码构建启动单节点本地服务，通过 Helm chart 部署查询节点、索引器、服务、缓存卷、网络策略和可选 Prometheus 集成，示例 values 面向 EKS 这类云环境。客户端侧应用可以使用 Neo4j 驱动通过 Bolt 5.x 连接，使用 neo4j:// 路由 URI，也可以用 HTTPS 的 JSON 与流式 NDJSON 查询 API 直接发请求。查询语言覆盖 OpenCypher 的一个实用子集，包括类型化关系、有界变长路径、属性与标签谓词、排序分页、聚合、OPTIONAL MATCH、UNION 和批量 UNWIND 写入。原生路径过程适合从一个或多个索引化源头/目标值出发做有界路径枚举，例如在实体图上按名称批量解析多个起点终点并合并求值，避免客户端侧查询扇出。作为研发用途，仓库还提供 MinIO 冒烟、运行时冒烟、压力与故障围栏脚本，可用于本地一致性验证。

## 哪些人会受益

目标用户更像是需要自建图数据库基础设施、且已有 S3 兼容对象存储和 Kubernetes 运维能力的团队。使用 Rust 工具链、libcypher-parser 和 SuiteSparse GraphBLAS 的构建流程意味着运维方要能处理 C/C++ 依赖、clang 绑定和容器镜像的多架构差异。喜欢 Neo4j 驱动生态的开发者可以较低成本迁移查询，但需要接受 OpenCypher 子集而非完整语义。由于要配置对象存储凭据、cell 与 namespace、TLS、鉴权令牌和路由地址，读者应当能读懂 Helm 值与环境变量，并理解因果一致性和强一致性读取之间的取舍。该项目不适合只想托管一个免运维图服务的用户，也更偏向对 AGPL-3.0 许可和自托管合规有预期的工程组织。

## 上手、部署与集成

当前仓库给出了可执行的采用路径而非用户案例。发布侧以 ghcr.io 上的容器镜像提供，v* 发行标签同时带完整版本、兼容的次版本和主版本、提交 SHA 与 latest；0.1.0 及更早只发布 linux/amd64，ARM 主机拉取会报 manifest 不匹配，需要升级到之后的版本或显式使用 --platform linux/amd64 模拟运行。源码构建要求 Rust 1.91 或更新版本，以及 libcypher-parser 与 SuiteSparse GraphBLAS，仓库使用 just 作为命令入口，并提供 native-check、smoke、smoke-graphblas、minio-smoke 和 runtime_smoke.sh 等验证手段。生产部署建议固定镜像 digest 而不是 latest，Helm chart 覆盖 TLS、鉴权、网络策略与中断预算。许可证为 AGPL-3.0，这对以服务形式对外提供修改版的组织会构成合规约束；README 未披露社区规模、贡献者数量或生产部署案例。

## 限制与风险

能力边界在文档中有不少自述性的限定。查询只覆盖 OpenCypher 的一个子集，不支持完整 Cypher 语义；README 未列出该子集之外的具体缺口清单。部署默认要求 TLS，本地开发必须显式开启明文模式，说明安全默认值会增加本地起步成本。graph-node 的异步查询 future 超出默认线程栈，必须设置 RUST_MIN_STACK 为 33554432，否则节点能通过 /readyz 却在首个查询上因栈溢出而中止，这是运行上的硬性注意点。索引器构建是异步的，索引可能缺失或落后，正确性依赖 WAL 尾部叠加而非索引实时完整。对象存储是唯一持久层，其可用性与延迟直接影响强一致性读取路径。Bolt 直连地址仅用于诊断和目标性故障测试，可写集群客户端应走路由。部分链接指向 architecture.md、DEVELOPMENT.md、AGENTS.md、Jepsen 报告和 Quint 形式化验证证据，但所给 README 未包含其结论内容，因此这些证据的具体强度无法在此确认。性能对比只能参考项目自发布的基准站点，未给出与具体竞品的可核验对照。

## 综合观察

HydraDB 的定位清晰：把持久性完全交给 S3 兼容对象存储，让计算层无状态化，用 SlateDB 快照与 CAS 租约处理一致读写和写入者切换，再用 CSC 索引加 WAL 叠加兼顾索引异步构建与读取正确性。这套组合对需要弹性扩缩、且已有对象存储的图工作负载有吸引力，GraphBLAS 与原生路径过程也贴合图遍历场景。代价是采用门槛不低：Rust 1.91 加 C/C++ 依赖、GraphBLAS、Kubernetes 与对象存储凭据配置，本地还需注意栈大小与明文开关；OpenCypher 子集和 AGPL-3.0 也分别限制语言兼容性与商业分发方式。README 在一致性、故障语义和验证材料上有对应文档，但性能与相对优势目前主要依托项目方自己的基准与测试报告，读者在评估时应以可复现测量为准，并把形式化验证与 Jepsen 结论作为需要单独阅读的补充证据，而非视为已证实的通用结论。

[查看 GitHub 仓库](https://github.com/hydra-db/hydradb)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
