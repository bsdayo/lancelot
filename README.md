<div align="center">

# lancelot

A cross-platform bot made with :heart:  
Powered by [Koishi.js](https://koishi.js.org/) v4

交流群 lancelot Cafe / [883632773](./QQGroupQRCode.jpg)
</div>

## 使用 / Usage
配置好 OneBot 服务（推荐使用 `go-cqhttp`，可参照[官方文档](https://docs.go-cqhttp.org/guide/quick_start.html)配置）

将项目克隆至本地
```shell
$ git clone https://github.com/b1acksoil/lancelot.git
```

安装依赖（推荐使用 `yarn`）
```shell
$ cd lancelot
$ yarn
```

将 `src` 目录下的示例配置文件 `config.example.ts` 更名为 `config.ts`，并**至少**更改以下配置：
```ts
plugins: {
  'adapter-onebot': {
    // 这部分按照 https://koishi.js.org/plugins/adapter/onebot.html#go-cqhttp-配置参考 自行配置
    protocol: 'ws',
    selfId: '1234567890',
    endpoint: 'ws://127.0.0.1:6700',
  }
}
```

如果你还想使用其他需要配置的功能（如 `arcaea`），也需要更改其配置；如果不想使用，可以在 `bot.ts` 中注释掉相关的 plugin 导入。

由于项目使用的数据库为嵌入式的 `sqlite3`，所以不用进行复杂的数据库配置。bot 在第一次启动时会在项目根目录下生成 `database.db`，**此为 bot 的数据库，请谨慎处理，若不慎删除将会造成 bot 不可逆的数据丢失！**

## 致谢
感谢 [JetBrains](https://www.jetbrains.com) 为本项目提供了免费的开源许可证。

## 开源许可 / License
本项目遵循 [GNU AGPL 3.0](./LICENSE) 协议开源。
