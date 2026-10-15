---
title: "peetzweg/opendisplay"
period: "daily"
date: "2026-10-16T00:00:00+08:00"
description: "OpenDisplay 是一款 Swift 项目，旨在把 iPhone、iPad 或备用 Mac 用作 Mac 的扩展显示器，并提供镜像模式；README 称其支持有线或 Wi-Fi 连接及触控输入。"
repository: "peetzweg/opendisplay"
repository_url: "https://github.com/peetzweg/opendisplay"
language: "Swift"
tags: ["移动端"]
stars_today: 220
comment: false
---

OpenDisplay 是一款 Swift 项目，旨在把 iPhone、iPad 或备用 Mac 用作 Mac 的扩展显示器，并提供镜像模式；README 称其支持有线或 Wi-Fi 连接及触控输入。

## 项目做什么

项目面向希望增加 Mac 屏幕空间的用户：在 iPhone、iPad 或另一台 Mac 上接收 Mac 画面，并让 macOS 将接收设备作为真实扩展显示器使用。README 也说明可切换为镜像模式，且官方接收端覆盖 iOS 15 及更新版本。

## 与同类方案相比

README 描述了有线与 Wi-Fi 两种连接方式、无需账户和外部服务器的直连设计，以及触控点击、拖动和双指滚动等输入能力。它还声称支持 HiDPI 显示、设备旋转适配和多种画质设置；这些是项目文档列出的特性，不代表在所有设备组合上均已独立验证。

## 设计与创新

项目文档列出的实现要素包括虚拟显示器、屏幕采集、H.264 或 HEVC 编码、TCP 传输和接收端解码显示，并提到有线连接使用系统的 usbmuxd。仅凭仓库简介和 README，无法验证这些做法相较其他方案是否构成技术创新，也无法确认所有实现细节。

## 适用场景

适用场景包括把 iPhone 或 iPad 放在 Mac 旁边作为扩展屏，用于阅读、写作或放置额外窗口；也可连接备用 Mac 扩展桌面。Wi-Fi 适合无线使用，有线连接则可作为另一种传输选择。镜像模式可用于显示相同画面，但文档未将其描述为主要用途。

## 谁会受益

对手边已有兼容 Apple 设备、且希望增加桌面空间的用户，项目提供了一个可尝试的软件方案；不同画质档位和接收端显示设置可用于权衡清晰度与运动流畅度。其协议文档及社区客户端还可能帮助有开发需求的人探索其他接收设备，但这些第三方客户端并非官方维护或支持。

## 使用前需要注意

README 指出虚拟显示器依赖 macOS 私有 API，系统更新可能造成兼容问题；音频目前不在项目范围内，备用 Mac 接收端也尚不支持从接收端使用键盘和鼠标。官方 iPhone、iPad 接收端要求 iOS 15 或更新版本，发送端要求 macOS 14；Wi-Fi 连接需要两端本地网络权限。文档中的性能数字来自特定设备和测试条件，不能直接推广到所有配置。

[查看 GitHub 仓库](https://github.com/peetzweg/opendisplay)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
