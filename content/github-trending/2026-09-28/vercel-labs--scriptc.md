---
title: "vercel-labs/scriptc"
period: "daily"
date: "2026-09-28T00:00:00+08:00"
description: "scriptc 是 Vercel Labs 的实验性编译器，借助 TypeScript 编译器做解析与类型检查，将 TypeScript 和 JavaScript 编译为类型化 IR、C、LLVM IR、汇编、目标文件、原生可执行文件及 WebAssembly 模块，代码需静态可编译，动态部分依赖 quickjs-ng。"
repository: "vercel-labs/scriptc"
repository_url: "https://github.com/vercel-labs/scriptc"
language: "TypeScript"
tags: ["开发工具"]
stars_today: 186
comment: false
---

scriptc 是 Vercel Labs 的实验性编译器，借助 TypeScript 编译器做解析与类型检查，将 TypeScript 和 JavaScript 编译为类型化 IR、C、LLVM IR、汇编、目标文件、原生可执行文件及 WebAssembly 模块，代码需静态可编译，动态部分依赖 quickjs-ng。

## 项目做什么

项目目标是让 TypeScript 与 JavaScript 程序脱离 Node 或 JavaScript 引擎直接生成原生可执行文件或 WebAssembly 模块。它复用 TypeScript 编译器完成解析和类型检查，再降到类型化 IR，并依次生成可读 C、文本 LLVM IR、汇编、目标文件和可执行文件。对于无法静态编译的 npm 包或 any 类型代码，通过 --dynamic 显式嵌入 quickjs-ng，并以诊断形式报告无法静态编译的位置，从而在保留类型系统约束的前提下探索前端语言到原生后端的编译路径。

## 与同类方案相比

该工具把编译过程分成多个可检查的产物层级，--emit 可停在 IR、C、LLVM IR、汇编或目标文件，便于调试和集成；IR、C、LLVM 输出只依赖 Node，无需本地编译器。静态构建自带小型原生运行时，生成的可执行文件不依赖 Node 或 JS 引擎；在 macOS 15+ arm64 上，普通 LLVM 层构建使用捆绑 helper 和预编译运行时包，clang 仅作链接驱动。它提供 scriptc coverage 命令，逐条报告程序可静态编译的比例和不可静态编译位置的诊断码，便于评估迁移可行性。

## 设计与创新

一个可验证的特点是双路径编译策略：能静态编译的代码进入原生运行时，npm 包和 any 类型代码由 --dynamic 显式嵌入 quickjs-ng，兼顾静态性能与动态兼容。另一个特点是多级输出分层，--emit=obj 生成带 scr_runtime_abi_v2 标记和未定义 scr_* 引用的可重定位目标文件，--print=native-link-info 输出包含目标、入口、运行时源包、系统库和 FFI 输入的版本化 JSON 配方，供外部链接器消费。至于相对其他 TypeScript 到原生编译方案的性能或架构优势，README 未提供基准或对比，尚无法验证。

## 适用场景

适合希望把 TypeScript 编写的命令行工具、HTTP 服务或脚本编译为无 Node 依赖的原生可执行文件的场景。示例中 node:http 服务器和 process.argv 程序可直接编译运行，也支持使用 picocolors 等 npm 包并配合 --dynamic。对于需要在 WASI Preview 1 环境部署的场景，可通过 Zig 构建 WebAssembly 模块，支持 async/await、promise、生成器、定时器和部分文件系统 API。此外，--emit=ir|c|llvm|asm|obj 可用于检查中间产物或与其他原生构建流程集成。

## 谁会受益

对 TypeScript 生态而言，scriptc 提供了一条从现有代码直接产出原生二进制和 WASM 的路径，减少对 Node 运行时和 JavaScript 引擎的依赖。其 coverage 命令和诊断码有助于判断代码库静态编译的可行范围，分层发射则便于教学、调试和构建系统集成。由于项目仍处实验阶段，README 明确提示行为可能变化，且平台支持、动态依赖嵌入和外部目标文件消费均有边界，因此在生产采用前需要针对目标平台和依赖组合进行验证，其实际稳定性和覆盖度尚无法仅凭 README 确认。

## 使用前需要注意

README 明确说明 scriptc 是实验性项目，支持 macOS、Linux、Windows 和 WASI Preview 1，但 macOS helper 仅覆盖 macOS 15+ arm64。WASI 目标不支持网络套接字和 fetch、子进程、OS 信号和文件系统监听等能力，会在链接前以 SC3002 报错，sanitizer 构建、原生 FFI 和库模式归档在该目标上也是诊断项。外部目标文件消费仍属实验性，sanitized 汇编和目标文件发射被拒绝。无法静态编译的代码只能通过 --dynamic 嵌入 quickjs-ng，且静态构建不包含 Node。性能表现、与竞品的比较以及长期稳定性在 README 中没有数据，尚无法验证。

[查看 GitHub 仓库](https://github.com/vercel-labs/scriptc)

> 本文基于抓取时的项目 README 和仓库简介整理；功能、限制与文档可能随项目更新而变化。
