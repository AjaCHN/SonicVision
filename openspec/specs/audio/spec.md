# 音频捕获与分析规范

## 目录

- [概述](#概述)
- [ADDED Requirements](#added-requirements)
- [MODIFIED Requirements](#modified-requirements)
- [REMOVED Requirements](#removed-requirements)

## 概述

本文档定义了 SonicVision 项目中音频捕获与分析功能的规范，包括麦克风权限管理、音频流处理、频率分析等核心功能。

## ADDED Requirements

### Requirement: 麦克风权限管理
系统 SHALL 能够请求和管理用户的麦克风访问权限。

#### Scenario: 首次请求权限
- **WHEN** 用户首次启动应用并点击「开始体验」
- **THEN** 系统 SHALL 弹出麦克风权限请求对话框

#### Scenario: 权限被拒绝
- **WHEN** 用户拒绝麦克风访问权限
- **THEN** 系统 SHALL 显示错误提示，并引导用户在浏览器设置中授予权限

### Requirement: 音频流捕获
系统 SHALL 能够通过 Web Audio API 捕获麦克风输入的音频流。

#### Scenario: 成功捕获音频
- **WHEN** 用户授予麦克风权限
- **THEN** 系统 SHALL 成功获取 MediaStream 并开始处理

#### Scenario: 无可用音频设备
- **WHEN** 系统检测到无可用的音频输入设备
- **THEN** 系统 SHALL 显示错误提示，建议用户连接麦克风

### Requirement: 音频频率分析
系统 SHALL 能够使用 AnalyserNode 分析音频的频率数据。

#### Scenario: 实时频率分析
- **WHEN** 系统成功捕获音频流
- **THEN** 系统 SHALL 实时分析音频频率并提供数据给可视化组件

#### Scenario: 调整分析参数
- **WHEN** 开发人员调整 fftSize 和 smoothingTimeConstant 参数
- **THEN** 系统 SHALL 根据新参数调整分析精度和平滑度

### Requirement: 音频设备选择
系统 SHALL 能够列出和选择不同的音频输入设备。

#### Scenario: 列出可用设备
- **WHEN** 用户打开音频设备选择菜单
- **THEN** 系统 SHALL 显示所有可用的音频输入设备列表

#### Scenario: 切换音频设备
- **WHEN** 用户从列表中选择一个音频设备
- **THEN** 系统 SHALL 切换到所选设备并继续音频分析

### Requirement: 音频录制
系统 SHALL 能够使用 MediaRecorder API 录制音频片段用于歌曲识别。

#### Scenario: 录制音频片段
- **WHEN** 系统检测到音乐开始播放
- **THEN** 系统 SHALL 录制 8-12 秒的音频片段

#### Scenario: 停止录制
- **WHEN** 录制时间达到设定值
- **THEN** 系统 SHALL 停止录制并处理音频数据

## MODIFIED Requirements

### Requirement: 音频分析性能优化
系统 SHALL 优化音频分析过程，确保在低性能设备上也能流畅运行。

#### Scenario: 自适应分析参数
- **WHEN** 系统检测到设备性能较低
- **THEN** 系统 SHALL 自动降低 fftSize 以提高性能

#### Scenario: 资源释放
- **WHEN** 用户暂停音频捕获
- **THEN** 系统 SHALL 正确释放音频资源，避免内存泄漏

## REMOVED Requirements

### Requirement: 旧的音频处理实现
**Reason**: 已被新的 Web Audio API 实现替代
**Migration**: 所有音频处理代码已迁移到使用标准 Web Audio API

#### Scenario: 代码迁移
- **WHEN** 系统启动
- **THEN** 系统 SHALL 使用新的 Web Audio API 实现，不再使用旧的处理方式
