---
title: "google/ax"
period: "weekly"
period_key: "weekly-2026-w39"
date: "2026-09-23T00:00:00+08:00"
description: "AX 是 Google 开源的声明式智能体编排运行时，用 Go 编写，运行在 Kubernetes 与 Agent Substrate 之上。它通过 Task、Workspace、Gateway、Model 四类 ax.io/v1alpha1 清单，把不可信智能体代码放进带资源限制的沙箱中执行，预置代码仓库与工具，并可将出站流量收敛到显式主机白名单。"
repository: "google/ax"
repository_url: "https://github.com/google/ax"
language: "Go"
tags:
  - AI
comment: false
---

AX 是 Google 开源的声明式智能体编排运行时，用 Go 编写，运行在 Kubernetes 与 Agent Substrate 之上。它通过 Task、Workspace、Gateway、Model 四类 ax.io/v1alpha1 清单，把不可信智能体代码放进带资源限制的沙箱中执行，预置代码仓库与工具，并可将出站流量收敛到显式主机白名单。

## 项目定位与要解决的问题

AX 面向的是集群规模下大规模自主智能体工作负载的编排问题。项目方将其定位为高吞吐、声明式编排器，声称可在单集群运行数十亿级别的智能体任务，并明确类比 Kubernetes，说明其目标用户已熟悉 kubectl 式操作、希望把智能体当作集群工作负载来管理。它与普通容器编排的关键区别在于：智能体既非无状态微服务，也非一次性批处理作业，而会累积状态、需要严格隔离、调用模型 API 与工具服务器，并可能在没有监督时循环消耗费用，因此需要专门的运行时抽象。README 同时警告核心概念、协议和规范仍在积极打磨，稳定版之前很可能出现破坏性变更。

## 核心能力

AX 的核心是把智能体运行所需的四类关注点拆成可独立声明、可复用的清单原语。Task 负责在隔离沙箱中运行不可信智能体代码，并施加 CPU 与内存限制；Workspace 负责预接 Git 仓库、MCP 服务器和技能包，让每个智能体启动时即处于热状态；Gateway 把出站流量锁定到显式主机白名单；Model 配置平台自身使用哪个 LLM，凭证来自 Kubernetes Secret。用户还能用 ax suspend 暂停空闲智能体并精确恢复，用 ax ssh 进入运行中的智能体查看现场。所有资源统一以 ax.io/v1alpha1 表达，由命令行一次性 apply。

## 技术结构与实现思路

AX 的架构分为控制平面与运行侧。控制平面部署在 Kubernetes 上，安装过程先部署 Redis，再用 ko 构建并部署控制平面镜像，全部落在 ax-system 命名空间。运行侧依托 Agent Substrate 提供沙箱执行，控制平面需要访问可达的 Agent Substrate Control API，集群内默认地址是 api.ate-system.svc.cluster.local:443。CLI 通过 gRPC 与控制平面通信，命令形态刻意贴近 kubectl，包括 apply、get、describe、watch、delete 以及 suspend、resume、ssh 等智能体专属动词。CLI 还会跟随当前 Kubernetes 上下文，后台解析并隧道连接到对应集群的控制平面，隧道状态保存在 ~/.ax/tunnels，并可用 ax ctx、ax tunnel list、ax tunnel stop 管理。

## 实际工作流程

典型使用从安装 CLI 开始，用户执行 go install github.com/google/ax/cmd/ax@latest，确保生成目录在 PATH 中。随后准备 Kubernetes 集群、ko、可被集群拉取的容器镜像仓库以及可达的 Agent Substrate Control API，通过 make deploy AX_IMAGE_REPO=... 部署控制平面。接着编写多文档 YAML，把 Task、Workspace、Gateway、Model 写在一个文件里，用 ax apply -f 提交；用 ax get tasks 查看列表，用 ax watch task 实时观察阶段与条件变化，用 ax describe 阅读人类可读细节。若任务声明 spec.debug: true，可用 ax ssh 进入沙箱执行交互式 shell 或单次命令，也可用 ax suspend 检查点暂停、ax resume 恢复。仓库还提供 demo.sh 演示从应用自定义工作区、等待就绪、通过 ax ssh 运行命令到暂停任务的完整生命周期。

## 与同类方案的取舍

AX 的差异化来自其显式声明的设计前提：智能体是一种新工作负载，既非无状态微服务，也非运行至完成的批处理作业，因此需要不同的编排抽象。它把沙箱隔离、工作区预热、出站网络白名单、平台级模型配置分别收敛为 Task、Workspace、Gateway、Model，而不是要求用户自行拼装容器与网络策略。它构建在 Agent Substrate 之上以获得沙箱化执行，并声称以高吞吐为目标、面向单集群数十亿任务，但这些规模与吞吐数字属于项目方自述，README 未给出可验证的基准数据。命令面刻意模仿 kubectl 并兼容 kubectx，降低了已有 Kubernetes 用户的迁移成本；ax suspend 与 ax resume 针对智能体空闲时暂停并精确续跑的场景，ax ssh 则用于直接观察运行中智能体。项目当前以 ax.io/v1alpha1 形式发布，处于明确的不稳定阶段。

## 值得关注的设计

AX 将智能体视为一类独立工作负载：既非无状态微服务，也非一次性批处理作业，而是会累积状态、需要严格隔离、调用模型 API 与工具服务器、且可能在无人监督时持续消耗成本的运行体。项目方据此提出四个核心原语并全部声明化：Task 在隔离沙箱中运行不可信代码并限制 CPU 与内存；Workspace 预接 Git 仓库、MCP 服务器与技能包，让智能体启动即处于可用状态；Gateway 把出站流量收敛到显式主机白名单；Model 配置平台自身所用的大模型并支持从 Kubernetes Secret 取得凭据。此外还提供 suspend 与 resume 用于挂起空闲智能体并从检查点恢复，以及 ax ssh 进入运行中的沙箱观察。所有对象均以 ax.io/v1alpha1 清单表达，经单条命令应用。需注意项目方明确声明核心概念、协议与规范仍在演进，稳定版发布前可能引入重大破坏性变更。

## 适用领域和具体场景

从 README 展示的用法看，典型场景包括：用 Workspace 声明一个 Git 仓库与分支，再让 Task 以自然语言目标驱动智能体在该工作区中完成工程任务，例如示例中要求确保 Go 工具链可用且从源码构建。调试时可通过 debug 开关开启沙箱 SSH 入口，交互式排查或执行一次性命令。生命周期管理上可用 ax watch 流式观察阶段与条件变化，用 suspend 对智能体状态做检查点后暂停，用 resume 精确续跑，避免空闲智能体持续烧钱。仓库还提供演示脚本，端到端走完应用自定义工作区、等待就绪、通过 ax ssh 执行命令、挂起任务的完整流程。列表与描述命令覆盖 tasks、gateways、workspaces、models 四类资源。

## 哪些人会受益

目标用户是需要在集群中规模化运行自治智能体工作负载的平台与基础设施团队。由于命令刻意做成 kubectl 形态，并遵循当前 kube context、支持与 kubectx 配合切换集群或在后台自动解析并打通到对应集群控制平面的隧道，已有 Kubernetes 经验的工程师上手成本较低。同时，希望自行构建 runner 镜像替换默认实现的团队也是受众，README 专门列出 Runner 指南说明控制平面与任务容器之间的契约。部署 AX 本身要求具备 Kubernetes 集群、ko 构建工具、集群可拉取的容器镜像仓库，以及可达的 Agent Substrate 控制 API，因此更偏向有一定平台工程能力的使用者，而非仅调用模型 API 的应用开发者。

## 上手、部署与集成

上手路径分为三步：先通过 go install 安装 CLI，二进制落在 GOPATH 的 bin 目录并需加入 PATH；再用 make deploy 配合镜像仓库参数部署控制平面，该过程借助 ko 构建并部署镜像，并先部署 Redis，所有组件落在 ax-system 命名空间；随后即可用 ax apply 应用包含 Task、Workspace、Gateway、Model 的单文件示例并运行第一个任务。部署依赖 Kubernetes 集群、ko、可被集群拉取的镜像仓库，以及可达的 Agent Substrate 控制 API，集群内默认地址为 api.ate-system.svc.cluster.local:443。CLI 通过 gRPC 与控制平面通信，支持 apply、get、describe、watch、delete 等动词及 ax ctx、ax tunnel、ax version 等连接管理命令，隧道状态存放于用户主目录下的隐藏目录。全局参数可指定 atespace、安装命名空间、目标 context 与控制平面地址。项目采用 Apache 2.0 许可。

## 限制与风险

首要限制来自项目自身的警告：核心概念、协议与规范仍在积极打磨，稳定版之前很可能出现重大破坏性变更，因此当前不适合作为长期稳定依赖。部署门槛不低，必须拥有 Kubernetes 集群、ko 工具、集群可访问的镜像仓库以及可达的 Agent Substrate 控制 API，缺少任一环节都无法完成控制平面部署。功能边界上，SSH 进入沙箱需要任务显式开启 debug，默认并不可用；网络访问需要经 Gateway 白名单放行，默认网关示例中的出站主机为通配，说明宽松配置与严格隔离之间的取舍由使用者自行决定。架构上 AX 构建在 Agent Substrate 之上，其沙箱执行能力依赖该外部组件，README 未给出单机或非集群运行模式。关于吞吐能力与可扩展规模，文中提到的相关表述属于项目方自述，缺乏可独立验证的基准数据。

## 综合观察

AX 的定位清晰：把智能体当作集群里的一等工作负载，用少量声明式原语覆盖隔离、环境预热、网络收敛与模型接入，再辅以挂起恢复和沙箱内窥探，形成较完整的运行闭环。选择 Go 与 kubectl 式交互，降低了 Kubernetes 用户的认知负担，自研 runner 的契约开放也便于替换执行层。风险同样明确：项目处于早期，协议与 API 可能剧变，且强依赖 Kubernetes 与 Agent Substrate，试点成本与迁移成本都需计入。建议将其用于内部实验或对破坏性变更容忍度高的平台探索，先在非关键链路验证沙箱隔离、网关白名单与挂起恢复是否符合预期，再评估规模化。整体看，这是一个架构意图明确、但成熟度尚待时间检验的基础设施项目。

[查看 GitHub 仓库](https://github.com/google/ax)

> 解读依据仓库 README 与简介，周期榜名次和数据按已采集的日期动态计算；项目文档和实际能力可能变化。
