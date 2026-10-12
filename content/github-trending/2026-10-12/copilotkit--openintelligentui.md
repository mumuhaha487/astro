---
title: "CopilotKit/OpenIntelligentUI"
period: "daily"
date: "2026-10-12T00:00:00+08:00"
description: "Open Intelligent UI 是一个开源生成式界面项目，提供聊天入口，由智能体根据请求生成文本回答、原生组件或可交互的自定义界面。"
repository: "CopilotKit/OpenIntelligentUI"
repository_url: "https://github.com/CopilotKit/OpenIntelligentUI"
language: "TypeScript"
tags: ["AI","开发工具"]
stars_today: 278
comment: false
---

Open Intelligent UI 是一个开源生成式界面项目，提供聊天入口，由智能体根据请求生成文本回答、原生组件或可交互的自定义界面。

## 项目做什么

项目旨在让聊天回答不局限于文字：用户可以询问问题、查看解释和比较，也可以在对话中使用针对任务生成的交互工具。README 展示了三维飞机演示、表格与图表、账单计算器及地图行程等场景；这些示例由智能体运行生成，具体输出可能变化。

## 与同类方案相比

README 所述实现把文字流、原生组件和自定义交互界面放入同一对话流程，并展示了可调整参数的计算器和三维演示等实例。自定义界面运行于隔离 iframe，用户点击后可通过经过校验的宿主桥传递选定值并发起后续请求；API 密钥可由访客输入，且说明不会保存到浏览器存储。

## 设计与创新

README 将路由与渲染作为项目设计重点：Jev 根据用户请求选择呈现方式，基础表格使用 A2UI，图表及较复杂可视化使用 Open Generative UI，自定义界面通过 generateSandboxedUi 流式传输 HTML、CSS 与 JavaScript。仅凭仓库简介和 README，无法验证这些设计相较其他方案是否构成技术创新或具有独特优势。

## 适用场景

适用示例包括解释可视化机制、并排比较选项并将数据转成图表、制作账单分摊等临时计算工具，以及展示带编号地点和照片的行程地图。README 提醒，示例中的计划价格等数字仅用于说明，地图连线不代表已验证的驾车路线，地图瓦片和照片需要网络连接。

## 谁会受益

对于希望探索生成式界面的开发者，项目提供了可运行的 Next.js 前端、Python Deep Agent 与 FastAPI 服务，以及可选 MCP 服务，并列出本地启动、测试、构建和部署验证流程。它也展示了将模型回答、交互控件、隔离渲染及后续对话连接起来的实现路径，可作为试验或改造基础。

## 使用前需要注意

项目实际效果、生成界面的可靠性和性能数据无法从所给材料中独立验证；README 展示的演示场景不应视为对所有请求都能稳定生成相同结果的保证。地图和照片依赖网络，服务商密钥与调用会涉及外部服务及费用；材料也没有提供足够依据判断其相对其他生成式界面的性能、竞争力或适用性。

[查看 GitHub 仓库](https://github.com/CopilotKit/OpenIntelligentUI)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
