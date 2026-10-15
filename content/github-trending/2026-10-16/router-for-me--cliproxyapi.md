---
title: "router-for-me/CLIProxyAPI"
period: "daily"
date: "2026-10-16T00:00:00+08:00"
description: "CLIProxyAPI 是用 Go 编写的代理服务，将多家模型及 CLI 账号接入统一的 OpenAI、Gemini、Claude 等兼容 API，供客户端或 SDK 调用。"
repository: "router-for-me/CLIProxyAPI"
repository_url: "https://github.com/router-for-me/CLIProxyAPI"
language: "Go"
tags: ["AI","开发工具"]
stars_today: 147
comment: false
---

CLIProxyAPI 是用 Go 编写的代理服务，将多家模型及 CLI 账号接入统一的 OpenAI、Gemini、Claude 等兼容 API，供客户端或 SDK 调用。

## 项目做什么

项目旨在为不同 AI 模型和 CLI 服务提供统一的 API 接入层。README 列出 Gemini、OpenAI Codex、Claude Code、Grok Build、Muse、Devin、Kimi 等来源，并说明可通过兼容接口供客户端或 SDK 使用；部分服务支持 OAuth 或 API 密钥认证。

## 与同类方案相比

README 所述能力包括流式与非流式响应、在支持时使用 WebSocket、工具调用及文本和图像输入；部分提供商支持多账号轮询负载均衡。项目还提供可嵌入的 Go SDK，并支持配置 OpenAI 兼容上游。这些是文档列出的功能，实际效果和适用范围仍需按具体提供商验证。

## 设计与创新

从给定简介和 README 可以确认，项目的主要特点是把多个模型与 CLI 认证渠道汇聚到兼容 API，并提供多账号管理和不同接口协议适配。现有材料未给出与其他代理项目的系统比较、技术实现细节或验证数据，因此无法据此确认其独有创新或相对优势。

## 适用场景

适用于希望通过统一接口调用不同模型的开发者，也可用于已经使用 OpenAI、Gemini 或 Claude 兼容客户端、但需要接入 CLI 账号或多个提供商的场景。若需多账号轮询、流式响应、工具调用或 Go 程序内嵌代理，可进一步核对对应提供商和功能的支持情况。

## 谁会受益

对于需要减少客户端分别适配多个模型接口的团队，该服务可作为本地 API 代理，并集中处理文档所述的认证、账号选择与上游配置。它也提供管理 API 和外部使用指南，便于部署与集成；是否满足生产环境的安全、稳定性和运维要求，不能仅凭 README 判断。

## 使用前需要注意

README 明确指出部分模型可用性取决于接入渠道，且若需使用量统计，v6.10.0 起项目不再内置该功能，需要另用外部工具。给定材料没有提供性能、安全审计、服务等级、许可协议或完整部署配置细节，也无法验证所列模型与认证方式在当前环境中的实际可用性。

[查看 GitHub 仓库](https://github.com/router-for-me/CLIProxyAPI)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
