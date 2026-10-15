---
title: "nvm-sh/nvm"
period: "daily"
date: "2026-10-16T00:00:00+08:00"
description: "nvm 是以 POSIX 兼容 Shell 脚本实现的 Node.js 版本管理工具，按用户安装、在 Shell 中调用，可通过命令安装、切换和管理多个 Node.js 版本。"
repository: "nvm-sh/nvm"
repository_url: "https://github.com/nvm-sh/nvm"
language: "Shell"
tags: ["开发工具"]
stars_today: 196
comment: false
---

nvm 是以 POSIX 兼容 Shell 脚本实现的 Node.js 版本管理工具，按用户安装、在 Shell 中调用，可通过命令安装、切换和管理多个 Node.js 版本。

## 项目做什么

项目旨在让开发者在命令行环境中安装并使用不同版本的 Node.js。README 展示了按主版本号安装、在已安装版本之间切换及查看当前版本的用法，也说明可设置默认版本，并通过 .nvmrc 配合目录级工作流程选择版本。

## 与同类方案相比

README 所列的实用特点包括支持 bash、zsh、dash、ksh 等 POSIX 兼容 Shell，以及 Unix、macOS 和 Windows WSL 等环境；安装器可使用 git、curl 或 wget，并提供 Docker、CI/CD、离线安装和故障排查说明。上述内容表明项目覆盖了多种常见使用方式，但不能据此推断其性能优于其他方案。

## 设计与创新

现有简介和 README 足以确认该项目以 Shell 函数及用户级安装方式管理 Node.js 版本，并可结合 .nvmrc、环境变量和镜像配置进行使用。材料未提供与其他版本管理器的系统比较，也没有证据证明具体设计属于首创，因此其技术创新性及相对差异尚无法验证。

## 适用场景

适合需要在同一用户环境中切换 Node.js 版本的开发者，例如维护依赖不同运行时版本的多个项目、按项目的 .nvmrc 选择版本，或在 Docker 与 CI/CD 容器中指定 Node.js 版本。README 还列出全局包迁移、默认全局包文件和镜像等相关使用主题。

## 谁会受益

当系统中不同项目或任务要求不同 Node.js 版本时，nvm 可减少手动调整运行时路径的工作，并通过命令管理安装与切换。其按用户安装的定位也使版本使用与其他系统用户相区分；README 提供了安装、验证、配置和排错示例，便于按常见 Shell 环境进行部署。

## 使用前需要注意

nvm 依赖受支持的 Shell 环境，不支持 Fish；Windows 支持以 WSL 等方式为主，README 提及的其他 Windows 方案并非本项目维护。没有官方预编译二进制的平台可能需要编译器并遇到构建问题，FreeBSD 也被指出存在限制。仓库简介和 README 未提供可核验的性能数据、竞品对照或项目许可证信息，相关结论无法据此确认。

[查看 GitHub 仓库](https://github.com/nvm-sh/nvm)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
