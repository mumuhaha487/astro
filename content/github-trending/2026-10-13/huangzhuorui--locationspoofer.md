---
title: "HuangZhuoRui/LocationSpoofer"
period: "daily"
date: "2026-10-13T00:00:00+08:00"
description: "LocationSpoofer 是面向 Android 的虚拟定位与无线环境模拟项目，支持定点和路线模拟，并通过 LSPosed 对用户指定的应用进行 Hook；项目简介明确其并非全局方案。"
repository: "HuangZhuoRui/LocationSpoofer"
repository_url: "https://github.com/HuangZhuoRui/LocationSpoofer"
language: "Kotlin"
tags: ["移动端"]
stars_today: 258
comment: false
---

LocationSpoofer 是面向 Android 的虚拟定位与无线环境模拟项目，支持定点和路线模拟，并通过 LSPosed 对用户指定的应用进行 Hook；项目简介明确其并非全局方案。

## 项目做什么

项目用于在目标应用中模拟位置及相关设备环境。README 描述了定点、路线、Wi-Fi、蜂窝基站、蓝牙、卫星和计步数据等模拟能力，也提到环境数据采集、编辑和导入。使用前需具备 Root 与兼容的 Xposed 框架，并在模块作用域中选择目标应用；其用途和效果仍受设备、系统及目标应用实现影响。

## 与同类方案相比

按项目简介和 README 所述，功能覆盖不仅包括坐标和路线，也包括无线环境、卫星信息及计步事件，并提供多地图与坐标系配置、环境数据管理和悬浮摇杆等操作方式。模块化拆分将界面、服务、数据、地理计算与 Hook 实现分开，便于理解职责；但这些描述本身不能证明兼容范围或实际运行效果。

## 设计与创新

README 描述的设计特点包括以 LSPosed 注入目标应用、通过远程配置传递模拟参数，以及将位置、无线环境与传感器事件组合模拟；还列出坐标系转换、路线状态管理和无线信号插值等实现思路。仅凭仓库简介和 README，无法独立确认这些机制的实现完整性、技术新颖程度，也无法据此与其他项目比较。

## 适用场景

按文档列举的用途，项目可用于开发者进行定位功能测试、设备兼容性调试，以及在选定应用中测试定点或路线位置数据；也可管理采集的 Wi-Fi、基站和蓝牙记录。README 同时提及考勤等目标应用，但项目声明禁止用于虚假打卡、考试作弊或其他违规活动，使用者应遵守法律及平台规则。

## 谁会受益

对于已有 Android Root 和 LSPosed 使用经验、需要按应用验证位置相关行为的开发者，项目提供了从地图选点、路线配置到环境数据管理的一体化操作入口。Kotlin、Compose、Room 和多模块 Gradle 架构也为阅读代码提供了线索。实际价值取决于目标设备、框架版本及应用是否能被相关 Hook 覆盖，README 未提供独立测试结果。

## 使用前需要注意

项目简介明确指出它不是全局定位方案，需要单独 Hook 对应软件；README 也要求 Root、兼容的 LSPosed/libxposed 环境及目标应用授权作用域，因此部署门槛较高。文档说明不同厂商和系统版本可能需要适配，并指出配置通道迁移仍需真机复验。所列功能和反检测能力缺少可独立核实的测试证据，不能据此保证兼容性或规避检测效果。

[查看 GitHub 仓库](https://github.com/HuangZhuoRui/LocationSpoofer)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
