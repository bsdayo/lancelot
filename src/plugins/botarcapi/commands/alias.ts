import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, segment } from 'koishi'

export function enableAlias(rootCmd: Command, api: BotArcApiV5) {
  rootCmd
    .subcommand('.alias <songname:text>', '查询曲目别名')
    .shortcut('查别名', { fuzzy: true })
    .usage('/arc alias <曲目名称>')
    .example('/arc alias sheriruth')
    .example('查别名 射日如桃花')
    .action(async ({ session }, songname: string) => {
      if (!songname) {
        return segment.quote(session?.messageId!) + '请输入需要查询的曲目名称'
      }

      try {
        const aliasContent = await api.song.alias(songname, true)
        return (
          segment.quote(session?.messageId!) +
          '查询到的别名有：\n' +
          aliasContent.alias.join('\n')
        )
      } catch {
        return segment.quote(session?.messageId!) + '未找到曲目：' + songname
      }
    })
}
