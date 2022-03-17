import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, segment } from 'koishi'
import { getAlias, getSongIdFuzzy } from '../utils'

export function enableAlias(rootCmd: Command, api: BotArcApiV5) {
  rootCmd
    .subcommand('.alias <songname:text>', '查询曲目别名')
    .shortcut('查别名', { fuzzy: true })
    .usage('/arc alias <曲目名称>')
    .example('/arc alias sheriruth')
    .example('查别名 射日如桃花')
    .action(async ({ session }, songname: string) => {
      if (!songname) {
        return (
          (session?.platform === 'qqguild'
            ? segment.at(session?.userId!)
            : segment.quote(session?.messageId!)) + '请输入需要查询的曲目名称'
        )
      }

      try {
        // const aliasContent = await api.song.alias(songname, true)
        const sid = getSongIdFuzzy(songname)
        if (sid === '') throw Error
        const alias = getAlias(sid)
        if (alias.length === 0)
          return (
            (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + '该曲目没有已录入的别名！'
          )
        return (
          (session?.platform === 'qqguild'
            ? segment.at(session?.userId!)
            : segment.quote(session?.messageId!)) +
          '查询到的别名有：\n' +
          // (aliasContent as any as string[]).join('\n')
          alias.join('\n')
        )
      } catch (e) {
        return (
          (session?.platform === 'qqguild'
            ? segment.at(session?.userId!)
            : segment.quote(session?.messageId!)) +
          '未找到曲目：' +
          songname
        )
      }
    })
}
