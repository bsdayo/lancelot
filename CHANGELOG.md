# 更新日志 / Changelog

## 1.2.2 - 2022.3.1
### plugin/arcaea
- 新增指令 `/arc ycm`，实现 Link Play 查车、发车操作
> 注：查车、发车使用公共源，与软糖酱、chieri等 arcbot 的类似功能共享
- 新增重复绑定账号时解绑指令的提示
- 修复推荐曲目中潜力值区间错误（如给 ptt11.51 推荐风暴byd）
- 修复部分回复文本错误

## 1.2.1 - 2022.2.23
### plugin/arcaea
- 新增了指令 `/arc b30` 的 `--official` 选项，可以使用官方 ArcaeaLimitedAPI 查分。（示例：`/arc b30 --official`）
- 将指令 `/arc b30` 的 `simple` 选项移至 `--simple`

> 常见问题
> 
> Q: ArcaeaLimitedAPI（以下简称ALA） 与 ArcaeaUnlimitedAPI（以下简称AUA） 有什么区别？  
> A: ALA 为官方提供的 API，需要自行写邮件向616申请，并且存在限额、数据少的问题，但优点在于稳定、版本更新期间也能正常使用，还可以查询 shadowbanned 用户（排行榜封禁）；
> AUA 为面向 Bot 开发者提供的一套全量的 API，数据、功能丰富，几年来一直为各大 arcbot 提供上游服务，但由于非官方的性质，经常受到616的打压（如封掉查分器IP）。
>
> Q: ALA 的具体限额是多少？  
> A: 每24h限制查询100名用户，但每名用户可以多次查询；120次请求/min，2000次请求/24h。
>
> Q: 我应该在什么时候使用 ALA？  
> A: Bot 默认使用 AUA 查分（如 `/arc b30`），如果要使用 ALA 查分必须带上 `--official` 选项。ALA 不返回 Recent10 均值、Overflow 数据。如果遇到 AUA 不稳定的情况（如频繁报错524），或版本更新期间，可以使用 ALA。

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
