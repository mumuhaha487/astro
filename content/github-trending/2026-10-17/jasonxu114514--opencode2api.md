---
title: "jasonxu114514/opencode2api"
period: "daily"
date: "2026-10-17T00:00:00+08:00"
description: "opencode2api 是用 Go 编写的 OpenCode Zen/Zen Go 网关，将上游服务接入兼容 OpenAI 与 Anthropic 的接口，并提供密钥和代理池、模型路由及内置管理 WebUI。"
repository: "jasonxu114514/opencode2api"
repository_url: "https://github.com/jasonxu114514/opencode2api"
language: "Go"
tags: ["开发工具","云服务"]
stars_today: 186
comment: false
---

opencode2api 是用 Go 编写的 OpenCode Zen/Zen Go 网关，将上游服务接入兼容 OpenAI 与 Anthropic 的接口，并提供密钥和代理池、模型路由及内置管理 WebUI。

## 项目做什么

项目面向需要通过统一接口访问 OpenCode Zen 或 Zen Go 模型的客户端与运维者。网关提供 Chat Completions、Responses、Anthropic Messages 等 API 路径，在跨协议请求时进行格式转换，并管理上游密钥、代理、模型发现和请求重试。它也提供配置管理、日志、诊断及模型游乐场等界面；不负责保存对话历史。

## 与同类方案相比

README 所述的便利之处包括：一个服务暴露多种推理协议，支持 JSON 与 SSE，并可按 Zen/Go 密钥池及代理情况进行路由和重试；模型列表包含协议与部分能力、限额及价格等元数据。程序内置 WebUI，无需单独运行 Node.js 或配置数据库，并支持配置热加载。以上是文档列出的功能，实际效果与稳定性仍需按部署环境验证。

## 设计与创新

README 描述了匿名 Zen 通道、按模型原生协议探测与转发、免费模型可用性定期检查，以及可手动接管检查结果等机制；另有 SOTA/Sweet 模型组的黏性选择、排序、失败回退和状态持久化。这些可作为项目实现特点，但仅凭仓库简介和 README，无法验证其相对其他网关的创新程度，也无法确认各机制在实际环境中的表现。

## 适用场景

适用于希望将 OpenCode Zen/Zen Go 接入现有 OpenAI 或 Anthropic 客户端、需要在不同上游密钥或代理之间分流的自托管场景；也可用于通过 WebUI 管理本地 API 密钥、查看日志和诊断，或在开发中测试多种请求协议。Docker 部署和独立二进制方式均有说明。若需求涉及嵌入向量、文件上传、图像生成或 Responses 查询与取消，则文档明确表示该项目不提供相应接口。

## 谁会受益

当使用者需要把 Zen/Zen Go 上游包装为客户端熟悉的 API，并希望集中管理上游凭据、模型发现和代理配置时，该项目可能减少自行编写协议适配与管理界面的工作。它还说明了本地访问密钥与上游密钥相互独立，并支持按会话选择节点。是否适合具体工作负载，仍取决于所需协议特性是否能在跨协议转换中保留，以及上游账户和网络条件。

## 使用前需要注意

跨协议转换不能保证所有参数和内容类型都能对应；README 举例指出 Chat JSON 输出约束和 seed 不会转发到 Anthropic Messages，部分内容或工具类型可能被拒绝。项目只提供所列路由，不包含嵌入、文件上传、图像生成、Responses 检索或取消，也不保存会话历史；System One 使用独立格式且不做协议转换。WebUI 需保护访问并更换示例密码，配置目录还须可写；README 未提供可独立核验的性能或安全审计结论。

[查看 GitHub 仓库](https://github.com/jasonxu114514/opencode2api)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
