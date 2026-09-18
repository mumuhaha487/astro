---
title: "Tencent/BrowserSkill"
period: "daily"
date: "2026-09-18T00:00:00+08:00"
description: "腾讯开源的 TypeScript 工具，用 bsk 命令行加浏览器扩展，让能调用 shell 的 AI 代理复用已登录浏览器，在独立窗口中完成自动化任务。"
repository: "Tencent/BrowserSkill"
repository_url: "https://github.com/Tencent/BrowserSkill"
language: "TypeScript"
tags: ["AI","Skill","开发工具"]
stars_today: 1302
comment: false
---

腾讯开源的 TypeScript 工具，用 bsk 命令行加浏览器扩展，让能调用 shell 的 AI 代理复用已登录浏览器，在独立窗口中完成自动化任务。

## 项目做什么

BrowserSkill 的目标是在 AI 代理与用户真实浏览器之间建立本地桥接：代理不直接接触浏览器，而是通过 shell 调用 bsk 命令，由 CLI 与本地 daemon 通信，daemon 再经 127.0.0.1 上的 WebSocket 连接浏览器扩展，由扩展执行页面操作。这样代理可以复用用户已有的登录状态，无需单独创建测试账号，同时通过 bsk install-skill 把使用说明安装到 Cursor、Claude Code、Codex 等 harness 中，让代理知道如何调用该工具。

## 与同类方案相比

按 README 描述，其优势包括：复用真实登录状态，免去测试账号；任务运行在独立且可见的 Agent Window 中，用户可继续使用自己的浏览器；任何能调用 shell 的代理都可通过 bsk CLI 接入，不锁定特定模型或代理框架；内置人在回路，遇到验证码、登录、确认对话框等可请用户接管后继续；支持全页截图；运行环境覆盖 macOS、Linux、Windows 以及 Chrome 和 Edge。以上均为项目自述能力，实际效果未在文档中给出验证数据。

## 设计与创新

README 强调的设计点包括：只在被明确请求时借用用户已打开的标签页，并在任务完成后归还，其余浏览器内容不动；为代理单独提供可见的 Agent Window；自动化确认与人工求助由浏览器扩展设置统一裁决，命令行参数不能覆盖；协议 1.3 可连接协议 1.0 至 1.2；为 DeepSeek Harness 提供原生插件。README 未提供与同类方案的对比或基准，因此这些设计是否具有相对创新性尚无法验证。

## 适用场景

适用场景包括：让代理读取或操作需要登录的网站，例如查看后台、整理已打开页面内容；在用户已有标签页上执行需要登录态的步骤；截取全页长图；处理需要人工接管的验证码、登录或确认流程；把代理运行在服务器上而通过认证服务或兼容网关配对本地浏览器；在沙箱化代理环境中按文档让 daemon 常驻宿主并用共享 BSK_HOME 连接。纯文本模型遇到手机扫码、人脸或图像验证码时仍可能受阻。

## 谁会受益

对已经使用 Cursor、Claude Code、Codex 等可调用 shell 的代理的开发者，BrowserSkill 提供了一条把网页操作交给代理的路径，并可借助 bsk doctor 检查连接、借助 bsk install-skill 安装技能。它支持脚本化调用与 JSON 输出，便于自动化流程和远程配对。不过 README 没有给出性能、稳定性或效率数据，也没有与既有浏览器自动化工具的量化比较，因此实际收益和可靠性尚无法从文档证实。

## 使用前需要注意

使用前需同时安装 bsk CLI 与浏览器扩展，并保证版本匹配；Firefox 仅为计划中，其他 Chromium 浏览器只是预期可用；扩展商店版本可能滞后于 CLI；混合版本下 request-help 需要 daemon 协议 1.3，旧 CLI 可能在本地退出；旧版无人值守参数已弃用；手机扫码、人脸验证、短信验证码和纯图像验证码对纯文本模型仍可能阻塞。README 未提及许可证，也未给出性能基准和竞品对比，且架构说明段落在给定内容中被截断，部分细节无法确认。

[查看 GitHub 仓库](https://github.com/Tencent/BrowserSkill)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
