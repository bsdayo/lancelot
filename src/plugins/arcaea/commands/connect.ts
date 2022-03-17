import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, segment } from 'koishi'

export function enableConnect(rootCmd: Command, api: BotArcApiV5) {
  // 获取风暴解锁代码
  rootCmd
    .subcommand('.connect', '查询当前的连接代码')
    .action(async ({ session }) => {
      const code = await api.connect()
      return (
        (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) +
        `当前的连接代码为：${code}\n风暴的解锁方法可以参照 http://wiki.arcaea.cn/index.php/Tempestissimo 中的“解禁方法”部分。`
      )
    })
}
