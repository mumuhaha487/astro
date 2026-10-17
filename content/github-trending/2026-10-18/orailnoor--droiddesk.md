---
title: "orailnoor/DroidDesk"
period: "daily"
date: "2026-10-18T00:00:00+08:00"
description: "DroidDesk 是面向 ARM64 安卓手机的 Linux 桌面方案，提供 Termux 脚本安装和独立应用两种路径，并支持通过 X11 或 VNC 使用桌面环境与 Linux 应用。"
repository: "orailnoor/DroidDesk"
repository_url: "https://github.com/orailnoor/DroidDesk"
language: "Kotlin"
tags: ["移动端","开发工具"]
stars_today: 100
comment: false
---

DroidDesk 是面向 ARM64 安卓手机的 Linux 桌面方案，提供 Termux 脚本安装和独立应用两种路径，并支持通过 X11 或 VNC 使用桌面环境与 Linux 应用。

## 项目做什么

项目旨在让安卓手机运行 Linux 图形桌面，并在手机屏幕或外接显示器上使用。README 描述了 XFCE4、LXQt、MATE、KDE 等桌面选项，以及安装应用、启动桌面和管理会话的流程；其定位是将手机作为便携计算设备，而不是单纯提供命令行终端。

## 与同类方案相比

README 提供了从安装 Termux 与 Termux:X11、运行脚本到启动桌面的操作步骤，也说明如何在 Proot 环境安装额外软件并同步应用菜单。它还列出独立应用、VNC 和树莓派显示桥接等使用路径；这些是文档所述能力，实际兼容情况需结合设备与版本确认。

## 设计与创新

README 描述了独立 Android 应用使用嵌入式 X11 服务，以及将 Proot 中安装的应用同步到桌面菜单的设计。文档还区分了有 root 与无 root 的运行路径，但没有提供可供独立核验的实现细节或与其他项目的比较，因此这些设计是否构成创新、相较现有方案有何差异，尚无法验证。

## 适用场景

适用场景包括在 ARM64 安卓手机上使用图形桌面、运行文档列举的办公与开发软件，以及在具备视频输出能力的手机上连接显示器。没有直接显示输出的设备，可按 README 所述尝试树莓派桥接与 VNC；远程访问也被列为一种用途，但具体体验取决于硬件、网络和软件配置。

## 谁会受益

对于希望在手机上尝试 Linux 桌面、利用便携设备进行轻量开发或办公的用户，项目提供了较完整的安装说明、常用命令和排错提示。README 列举了 LibreOffice、VS Code、Blender 等应用，并提醒 Blender 在手机硬件上可能卡顿；这些应用能否正常运行及是否适合特定任务，仍需在目标设备上测试。

## 使用前需要注意

README 指出项目面向 ARM64 安卓设备，后台进程可能被部分系统终止，其他 GPU 可能回退到软件渲染，且 Blender 在移动硬件上运行迟缓。独立应用与脚本方案的要求并不相同，显示器连接也受手机接口限制；文档还列出来源证明、可复现构建、自定义前缀引导及壁纸许可等未完成事项，不能据此确认所有发布包的合规状态。

[查看 GitHub 仓库](https://github.com/orailnoor/DroidDesk)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
