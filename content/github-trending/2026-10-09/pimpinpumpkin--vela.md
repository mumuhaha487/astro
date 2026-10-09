---
title: "PimpinPumpkin/Vela"
period: "daily"
date: "2026-10-09T00:00:00+08:00"
description: "Vela 是面向 Android 的地图与导航应用，使用 OpenStreetMap 等开放地图数据，并可按需查询 Google 的搜索、地点和路线服务。项目针对没有 Google Play Services 的手机，也可在普通 Android 设备上运行。"
repository: "PimpinPumpkin/Vela"
repository_url: "https://github.com/PimpinPumpkin/Vela"
language: "Kotlin"
tags: ["移动端"]
stars_today: 287
comment: false
---

Vela 是面向 Android 的地图与导航应用，使用 OpenStreetMap 等开放地图数据，并可按需查询 Google 的搜索、地点和路线服务。项目针对没有 Google Play Services 的手机，也可在普通 Android 设备上运行。

## 项目做什么

项目旨在为不安装 Google Play Services 或不使用 Google 账号的 Android 用户提供地图、地点查询和导航。它以开放数据绘制地图，并在用户搜索、查看地点或请求路线时，从手机直接调用 Google 公共网页端点，以补充地点详情、交通和路线等信息；也提供完全离线或关闭 Google 请求的使用方式。

## 与同类方案相比

按 README 所述，地图浏览默认使用 OpenFreeMap、OpenStreetMap 及本地打包的地点数据，不会因平移和缩放而向 Google 请求数据；没有 Vela 账号、服务端或遥测，保存内容留在设备上。项目还列出离线地图与导航、公共交通信息、摄像头提示、语音导航及多种路线和地点管理功能。上述特点来自项目自述，尚无独立测试结果。

## 设计与创新

README 描述的设计特点包括：将开放地图与本机直接访问 Google 公共网页服务结合；以开放地点数据绘制地图，按需向 Google 查询地点详情；把驾驶路线与开放路由器提供的导航指引结合；并通过签名文件更新请求配方，以应对 Google 页面变化。仅凭简介和 README 无法验证这些设计是否具有行业首创性，也无法确认其与其他项目的差异程度。

## 适用场景

适用于使用 GrapheneOS 等去 Google 化系统、或不希望依赖 Play Services 的 Android 用户；也可用于希望离线下载区域地图、查询地点或进行驾车、步行、骑行及公共交通出行的场景。对关注路线经过的车牌识别摄像头、需要离线语音导航，或希望保存地点和路线并在本机管理的用户，README 所列功能可能具有参考价值。

## 谁会受益

作为 Android 地图应用，Vela 尝试在开放地图数据、Google 提供的部分实时信息和设备端数据管理之间提供选择。用户可浏览开放底图、查询地点与路线，并通过设置限制地点查询或实时交通请求；下载区域后，项目称地图、搜索和路线功能可在无网络时使用。是否适合具体地区，取决于当地开放地图、地点和交通数据的覆盖情况。

## 使用前需要注意

README 明确标注项目处于测试版，可能存在问题。其功能、隐私处理、离线覆盖和数据准确性均为项目自述，未由给定材料独立验证；部分搜索、地点详情、驾驶路线、交通及公共交通路线仍会请求 Google，离线能力也受下载区域和开放数据覆盖影响。项目未在给定内容中提供足以核实的性能数据或与其他地图应用的客观比较，优势与创新程度因此无法确认。

[查看 GitHub 仓库](https://github.com/PimpinPumpkin/Vela)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
