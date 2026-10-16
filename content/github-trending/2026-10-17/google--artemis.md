---
title: "google/artemis"
period: "daily"
date: "2026-10-17T00:00:00+08:00"
description: "ARTEMIS 是一个以 Python 实现的 Android 自动化项目，可将自然语言任务转化为真实设备或模拟器上的操作，并提供 CLI、网页控制台、MCP 服务和 Python SDK 等使用入口。"
repository: "google/artemis"
repository_url: "https://github.com/google/artemis"
language: "Python"
tags: ["AI","移动端","开发工具"]
stars_today: 221
comment: false
---

ARTEMIS 是一个以 Python 实现的 Android 自动化项目，可将自然语言任务转化为真实设备或模拟器上的操作，并提供 CLI、网页控制台、MCP 服务和 Python SDK 等使用入口。

## 项目做什么

项目面向 Android 应用测试与设备自动化：用户描述操作目标后，ARTEMIS 负责观察界面、定位控件并执行动作，也可采集截图、日志和执行轨迹，辅助问题复现与结果核验。它能接入支持 MCP 的 AI 开发工具，也能用于命令行任务和 Python 测试流程。README 列出 AndroidWorld 99% 以上完成率，但该结果是项目自述，本文无法独立核实。

## 与同类方案相比

README 描述了多种接入方式，便于从交互式网页控制台、CLI、MCP 客户端或 Python SDK 启动任务。目标定位可结合无障碍层级、OCR 与视觉方式，并针对自定义界面提供回退路径。Pro 模式还包括计划、动作前检查、检查点核验和诊断能力；实际适用程度仍取决于设备、应用界面及配置。

## 设计与创新

项目将自然语言任务执行、移动端 UI 感知和面向 AI 开发工具的 MCP 接入组合在一起。README 还介绍 Flash 与 Pro 两种执行模式：前者偏快速的观察—操作循环，后者加入任务规划、动作检查与结果复核。上述组合可视为其设计特点；README 未提供足以独立确认其原创性或相对其他方案领先程度的材料。

## 适用场景

适用场景包括在真实手机或模拟器上执行跨应用操作、复现缺陷、检查登录后的弹窗或页面状态、运行探索性与稳定性测试，以及在 pytest 或 CI/CD 流程中调用自动化任务。AI 助手也可通过 MCP 发起设备操作并读取诊断信息。具体任务能否可靠完成，需要结合应用控件类型、设备连接状态和测试账号等条件验证。

## 谁会受益

对于希望减少手工 Android 回归操作的开发者与测试人员，ARTEMIS 提供了从任务描述到设备执行和结果查看的一体化入口。它支持截图、日志、轨迹及结构化结果，方便检查执行过程；Python SDK 也可嵌入现有测试流程。使用者仍需审核任务目标与测试环境，不能仅凭 README 宣称的基准成绩推断所有项目中的成功率。

## 使用前需要注意

运行需要连接并启用 USB 调试的 Android 设备或模拟器，首次任务还可能安装无障碍辅助服务；README 说明可关闭自动安装、改用 UIAutomator2 或卸载辅助服务。Flash 模式不提供计划、预执行安全检查、检查点验证、最终报告及 ADB shell，要求更高的任务应评估 Pro 模式。iOS 支持仍列在路线图中；性能和基准结果尚无法独立验证。

[查看 GitHub 仓库](https://github.com/google/artemis)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
