# 更新日志 / Changelog

## 1.2.0 - 2022.2.21
### plugin/arcaea
- 新增了 /arc random 指令
- 新增了 /arc recommend 指令
- 新增了 /arc b30 simple 指令，提供极简式界面
- 移除了 /arc connect 指令，因为解锁风暴不再需要
- 现在支持在 /arc best 指令的曲名中输入空格
- 优化了部分指令回复

> 注：新增指令的帮助可用 `/help arc.指令名` 查看，如 `/help arc.random`

### plugin/botarcapi
- 更名为 `plugin/arcaea`

### plugin/whitelist
- 添加自动接受好友申请
- 移除入群欢迎消息


## 1.1.0 - 2022.2.16
### plugin/botarcapi
- 在 B30 图中添加理论最高ptt显示
- 修复曲名显示bug
- 为 B30 卡片添加阴影
- 现在达到理论值的分数将被高亮显示


## 1.0.1 - 2022.2.13
### plugin/botarcapi
- 优化指令反馈

### plugin/whitelist
- 添加退群指令 `/dismiss <groupid>`，要求权限为 3 级
- 添加自动接收群邀请


## 1.0.0 - 2022.2.12
### plugin/botarcapi
- 添加指令帮助文本
- 添加 `/arc alias` 指令

### plugin/status
- 添加指令帮助文本


## 0.2.0 (Internal Dev Version) - 2022.2.12
### plugin/status
- 添加 `/status` 指令

### plugin/botarcapi
- 添加 `/arc best` 指令
- 添加 `/arc connect` 指令
- 优化 `/arc recent`，现在查询个数为 1 时将返回新的 UI
- 优化查询时的反馈，不再附带账号 ID


## 0.1.0 (Internal Dev Version) - 2022.2.6
### core
- 完成核心部分

### plugin/botarcapi
- 基本命令完成（b30...）

---
