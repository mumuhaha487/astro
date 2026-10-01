---
title: "NVIDIA/OpenShell"
period: "monthly"
period_key: "monthly-2026-10"
date: "2026-10-01T00:00:00+08:00"
description: "OpenShell 是 NVIDIA 推出的自主 AI 智能体安全私有运行时，用 Rust 编写。它通过内核级沙箱隔离与形式化验证的策略变更审查，在赋予智能体读写文件、安装包、调用 API 与凭证能力的同时，限制其访问范围。"
repository: "NVIDIA/OpenShell"
repository_url: "https://github.com/NVIDIA/OpenShell"
language: "Rust"
tags: ["AI","安全"]
comment: false
---

OpenShell 是 NVIDIA 推出的自主 AI 智能体安全私有运行时，用 Rust 编写。它通过内核级沙箱隔离与形式化验证的策略变更审查，在赋予智能体读写文件、安装包、调用 API 与凭证能力的同时，限制其访问范围。

## 项目定位与要解决的问题

项目定位是面向成批自主 AI 智能体的安全、私有运行时，而非单一智能体框架或通用容器工具。README 明确其目标场景：智能体在需要读文件、装包、调 API、用凭证时最有价值，但不应因此获得对数据、密钥和网络的无限制访问。OpenShell 以策略声明为核心，让使用者先声明每个智能体能接触什么，再由运行时强制执行。它同时覆盖沙箱生命周期、策略、凭证提供者、网关控制平面、Kubernetes 部署、扩展机制与多语言 SDK，并配套面向编码智能体的 Agent Skills，整体呈现为一个可供应用接入的基础设施层。

## 核心能力

核心能力由两条机制构成。其一是内核级强制执行：每个智能体运行在隔离沙箱中，内核控制限定可访问的文件与可发起的系统调用，每条网络连接离开沙箱前都要通过策略检查；智能体看不到真实凭证，OpenShell 只在请求发往已批准端点时注入凭证。其二是对策略变更的形式化验证：在变更获批前，用形式化验证标出它会新授予的高风险访问，例如用凭证访问新主机或调用新 API 方法，这类变更会等待人工审核。此外 README 提到内核插桩、网络策略、进程规则、advisor 与 prover 等组件，以及默认不安装智能体的最小 Ubuntu 沙箱镜像。

## 技术结构与实现思路

README 描述的关键组件包括 gateway、supervisor 与 sandbox。Gateway 是沙箱、策略与访问的控制平面，可本地安装，也可用 Helm 部署到 Kubernetes，但要求 CNI 能执行 NetworkPolicy。Sandbox 负责承载智能体运行环境，涉及镜像、运行时、GPU 与生命周期管理。Supervisor 与 sandbox 的协作细节文档指向 Architecture 页面。策略层包含文件系统、网络与进程规则，并由 advisor 和 prover 辅助审查变更。Providers 提供只在已批准端点生效的凭证，含 inference 推理路由。扩展面包括 middleware、interceptors 与 compute drivers。SDK 覆盖 Python、TypeScript、Go、Rust，用于连接已存在的 gateway。

## 实际工作流程

典型起点是安装脚本：curl 拉取 install.sh 并执行，随后 openshell sandbox create --name demo。安装器会配置 CLI 与本地 gateway。默认沙箱镜像是最小 Ubuntu，不含任何智能体，因此要跑真实智能体需按 Run Your First Agent 指引，用 OpenCode 对接免费 OpenRouter 模型，并演示在智能体需要新访问时如何批准。策略变更流程体现为：先提交策略，advisor 与 prover 评估可能新增的风险访问，高风险项等待人工复核；获批后由内核与网络检查在运行时逐次执行。凭证仅附加到发往已批准端点的请求。策略与智能体操作可由教程逐步演练。

## 与同类方案的取舍

与传统仅靠容器边界或网络白名单的方案相比，项目方自述的差异点在于同时做内核级运行时强制与形式化验证的策略变更审查，并把凭证注入限定在已批准端点，使智能体不接触真实密钥。它强调面向智能体舰队而非单实例，提供 gateway 控制平面、Kubernetes 部署路径与 middleware、interceptor、compute driver 等扩展点。项目采用 Rust 实现，以 Apache 2.0 许可发布，并自称 agent-first：用其赋能的智能体驱动工作流来开发自身。README 另称其收集的是匿名运营类别与计数遥测，不含沙箱名、主机名、文件路径、提示词、凭证、提供者或模型名和用户内容，并可关闭或编译移除。

## 值得关注的设计

OpenShell 的技术主张集中在两层机制上。其一，它以内核插桩的方式在运行时对每一次文件访问、系统调用和网络连接执行策略检查，让每个 agent 运行在隔离沙箱中，网络连接在离开沙箱前必须经过策略校验，而 agent 本身永远看不到真实凭据，凭据只在发往已批准端点的请求上被注入。其二，它在策略变更被批准之前，用形式化验证方法推断该变更会带来哪些新的访问能力，例如是否让某个 agent 带着凭据访问新主机或调用新的 API 方法，并把这类高风险变更挂起等待人工复核。项目自述称这种“运行时内核强制加变更前形式化验证”的组合是其治理 agent 行为的主要方式。README 未给出与同类方案的具体性能或能力对比数据，因此这些机制的实际强度属于项目方自述，需结合架构文档自行验证。

## 适用领域和具体场景

从 README 描述的使用路径看，OpenShell 的典型应用是让自主 agent 在可读文件、装包、调 API、用凭据的同时，不获得对数据、密钥和网络的无限访问。快速开始默认创建一个最小化 Ubuntu 沙箱镜像，其中不含任何 agent，用户可以在其上按需安装真实 agent，官方教程演示的是用 OpenCode 对接 OpenRouter 上的免费模型，并在 agent 提出新访问需求时执行审批流程。策略维度覆盖文件系统、网络和进程规则，提供 advisor 与 prover 辅助审查变更。在 Kubernetes 场景下，需要由 CNI 强制执行 NetworkPolicy 来配合网关部署；此外项目提供 Brev Launchable 形式的云端试用入口，以及面向网关的 Python、TypeScript、Go、Rust SDK，用于把应用接入 OpenShell 网关。

## 哪些人会受益

目标读者首先是需要给自主 agent 划定权限边界的基础设施与安全工程师，尤其是愿意接受“策略显式声明、内核级执行、变更需人工审批”这一运维模型的团队。其次是 agent 应用开发者：README 强调 SDK 用于把应用连接到 OpenShell 网关，并提供 Python、TypeScript、Go、Rust 四种语言接入方式，说明其定位是 agent 运行底座而非终端用户产品。还有一类是平台与 SRE 角色，因为文档涵盖网关、Helm 部署、Kubernetes 集成、遥测开关和发布节奏。项目还提供面向编码 agent 的公共技能包，通过 npx 命令安装，可教会 agent 使用 OpenShell CLI、编写沙箱策略、调试网关与推理路由，因此使用编码助手工作流的人也在受众范围内。整体上它对 Linux 和 Apple Silicon macOS 支持明确，Windows 仅通过 WSL 2 实验性支持。

## 上手、部署与集成

README 给出的采用线索包括：Apache 2.0 许可证，PyPI 上的 openshell 包，TypeScript SDK 通过 GitHub Packages 以 @nvidia/openshell-sdk 发布，Go 与 Rust SDK 通过各自包管理器从仓库拉取。安装方式是一行 curl 脚本，安装器会配置 CLI 和一个本地网关；运行环境要求 Docker、Podman 或宿主机虚拟化，Kubernetes 部署走 Helm。文档站点由 NVIDIA 托管，社区入口包括 GitHub Discussions、Issues、路线图项目和 RFC 板块，以及 Brev 云端体验入口。项目标注 0.1.x 为稳定发布节奏的起点，并说明可以尝试预发布与开发构建。遥测默认收集匿名运行类别与计数，可通过环境变量或 Helm 配置关闭，甚至可在编译期移除，官方还发布了社区遥测报告，这为观察真实使用趋势提供了公开依据。

## 限制与风险

README 自身披露的限制值得注意。平台方面需要 Linux、Apple Silicon 上的 macOS，或 WSL 2 下的 Windows（且标注为实验性），并发依赖 Docker、Podman 或宿主机虚拟化。Kubernetes 集成要求 CNI 必须能强制执行 NetworkPolicy，这意味着网络策略能力不足的集群无法获得声称的隔离效果。默认沙箱镜像只是最小化 Ubuntu，不含任何 agent，要真正使用需额外安装和配置。SDK 与网关最好保持同一发布版本，说明版本错配可能带来兼容风险。README 未给出性能基准、可扩展上限、形式化验证覆盖范围或误报率数据，因此“安全、私有”的程度无法仅凭文档量化。此外，软件会自动检索和访问外部材料，这些材料受独立条款约束，用户需自行确认合规、完整性与安全性；软件按“原样”提供，不附带任何保证。

## 综合观察

OpenShell 试图把 agent 权限治理做成一个运行时底座，而不是散落在提示词或应用代码里的约定。它的思路有辨识度：一方面用内核级插桩对文件、系统调用、网络逐次检查，并用凭据按端点注入来避免 agent 直接持有密钥；另一方面在策略变更落地前用形式化验证预判新增访问面，把带凭据访问新主机、调用新 API 这类风险变更挂起等人工复核。工程配套相对完整，涵盖网关、策略、提供方、沙箱、Kubernetes Helm 部署、四种语言 SDK、面向编码 agent 的技能包，以及可关闭乃至编译期移除的匿名遥测和公开遥测报告。0.1.x 被定位为稳定发布节奏的开端，同时仓库保留预发布与开发构建通道。需要谨慎的是，“安全、私有”目前主要是项目方的设计主张，README 没有提供性能、隔离强度或形式化验证有效性的量化证据，因此评估时应把架构文档、支持矩阵和实际策略演练作为必要补充。

[查看 GitHub 仓库](https://github.com/NVIDIA/OpenShell)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
