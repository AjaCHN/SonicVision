# 歌曲识别功能规范

## 目录

- [概述](#概述)
- [ADDED Requirements](#added-requirements)
- [MODIFIED Requirements](#modified-requirements)
- [REMOVED Requirements](#removed-requirements)

## 概述

本文档定义了 SonicVision 项目中歌曲识别功能的规范，包括 Google Gemini API 集成、音频片段处理、识别结果解析等核心功能。

## ADDED Requirements

### Requirement: Google Gemini API 集成
系统 SHALL 能够与 Google Gemini API 集成，使用其音频识别能力。

#### Scenario: API 初始化
- **WHEN** 系统启动
- **THEN** 系统 SHALL 从环境变量加载 API 密钥并初始化 Gemini 客户端

#### Scenario: API 密钥未设置
- **WHEN** 系统检测到未设置 API 密钥
- **THEN** 系统 SHALL 显示错误提示，引导用户设置 API 密钥

### Requirement: 音频片段处理
系统 SHALL 能够将录制的音频片段转换为适合 API 调用的格式。

#### Scenario: 音频转换
- **WHEN** 系统完成音频录制
- **THEN** 系统 SHALL 将音频 Blob 转换为 base64 格式

#### Scenario: 处理大文件
- **WHEN** 录制的音频文件过大
- **THEN** 系统 SHALL 优化处理流程，避免内存溢出

### Requirement: 歌曲识别
系统 SHALL 能够发送音频数据到 Google Gemini API 进行歌曲识别。

#### Scenario: 成功识别
- **WHEN** API 成功识别歌曲
- **THEN** 系统 SHALL 接收识别结果并解析为 SongInfo 对象

#### Scenario: 识别失败
- **WHEN** API 无法识别歌曲
- **THEN** 系统 SHALL 显示识别失败提示，允许用户手动重试

### Requirement: 识别结果显示
系统 SHALL 能够显示识别到的歌曲信息，包括标题、艺术家和歌词片段。

#### Scenario: 显示歌曲信息
- **WHEN** 系统成功识别歌曲
- **THEN** 系统 SHALL 在界面上显示歌曲信息覆盖层

#### Scenario: 提供搜索链接
- **WHEN** 系统识别到歌曲
- **THEN** 系统 SHALL 生成并显示歌曲搜索链接

### Requirement: 识别调度
系统 SHALL 能够智能调度歌曲识别请求，避免频繁调用 API。

#### Scenario: 音乐检测
- **WHEN** 系统检测到音乐开始播放
- **THEN** 系统 SHALL 开始录制音频片段并准备识别

#### Scenario: 避免重复识别
- **WHEN** 系统检测到正在播放的歌曲与上次识别结果相同
- **THEN** 系统 SHALL 跳过识别，避免重复 API 调用

### Requirement: 多语言识别支持
系统 SHALL 能够根据用户选择的语言提供相应的识别结果。

#### Scenario: 英文界面
- **WHEN** 用户选择英文界面
- **THEN** 系统 SHALL 以英文显示识别结果

#### Scenario: 中文界面
- **WHEN** 用户选择中文界面
- **THEN** 系统 SHALL 以中文显示识别结果

## MODIFIED Requirements

### Requirement: API 错误处理
系统 SHALL 能够处理 API 调用过程中可能出现的各种错误。

#### Scenario: 网络错误
- **WHEN** API 调用过程中出现网络错误
- **THEN** 系统 SHALL 实现重试逻辑，最多重试 3 次

#### Scenario: API 限制
- **WHEN** 系统检测到达到 API 调用限制
- **THEN** 系统 SHALL 显示限制提示，建议稍后再试

### Requirement: 识别性能优化
系统 SHALL 优化歌曲识别过程，减少用户等待时间。

#### Scenario: 并行处理
- **WHEN** 系统录制音频片段
- **THEN** 系统 SHALL 在后台处理音频，不阻塞主界面

#### Scenario: 缓存识别结果
- **WHEN** 系统识别到一首歌曲
- **THEN** 系统 SHALL 缓存识别结果，避免短时间内重复识别同一首歌

## REMOVED Requirements

### Requirement: 旧的识别服务集成
**Reason**: 已被 Google Gemini API 替代
**Migration**: 所有识别相关代码已迁移到使用 Google Gemini API

#### Scenario: 代码迁移
- **WHEN** 系统启动
- **THEN** 系统 SHALL 使用 Google Gemini API 进行识别，不再使用旧服务
