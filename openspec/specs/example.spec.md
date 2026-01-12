# 示例规范文档

## 目录

- [概述](#概述)
- [ADDED Requirements](#added-requirements)
- [MODIFIED Requirements](#modified-requirements)
- [REMOVED Requirements](#removed-requirements)

## 概述

本文档展示了 OpenSpec 规范的标准格式，用于指导项目中所有规范文档的编写。

## ADDED Requirements

### Requirement: 音频捕获功能
系统 SHALL 能够通过 Web Audio API 捕获麦克风输入的音频数据。

#### Scenario: 成功捕获音频
- **WHEN** 用户授权麦克风访问权限
- **THEN** 系统 SHALL 成功捕获音频流并开始分析

#### Scenario: 麦克风权限被拒绝
- **WHEN** 用户拒绝麦克风访问权限
- **THEN** 系统 SHALL 显示错误提示并引导用户授予权限

### Requirement: 歌曲识别功能
系统 SHALL 能够通过 Google Gemini API 识别正在播放的歌曲。

#### Scenario: 成功识别歌曲
- **WHEN** 系统录制音频片段并发送到 Google Gemini API
- **THEN** 系统 SHALL 接收识别结果并显示歌曲信息

#### Scenario: 识别失败
- **WHEN** Google Gemini API 无法识别歌曲
- **THEN** 系统 SHALL 显示识别失败提示并允许用户手动重试

## MODIFIED Requirements

### Requirement: 可视化效果
系统 SHALL 根据音频数据生成动态的视觉效果。

#### Scenario: 2D 可视化
- **WHEN** 用户选择 2D 可视化模式
- **THEN** 系统 SHALL 使用 Canvas 2D API 渲染可视化效果

#### Scenario: 3D 可视化
- **WHEN** 用户选择 3D 可视化模式
- **THEN** 系统 SHALL 使用 Three.js WebGL 渲染 3D 可视化效果

## REMOVED Requirements

### Requirement: 旧的音频处理方式
**Reason**: 已被新的 Web Audio API 实现替代
**Migration**: 所有音频处理代码已迁移到新的实现

#### Scenario: 旧代码移除
- **WHEN** 系统启动
- **THEN** 系统 SHALL 使用新的音频处理实现，不再使用旧代码
