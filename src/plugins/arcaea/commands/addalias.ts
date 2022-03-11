import { Command, segment } from 'koishi'
import Database from 'better-sqlite3'
import { getSongIdFuzzy } from '../utils'
import { getAssetFilePath } from '../../../utils'

const songdb = new Database(getAssetFilePath('arcaea', 'arcsong.db'))

export function enableAddAlias(rootCmd: Command) {
  rootCmd
    .subcommand('.addalias <songname> <alias>', '添加曲目别名', {
      authority: 3,
      hidden: true,
    })
    .action(({ session }, songname, alias) => {
      if (!songname || !alias)
        return segment.quote(session?.messageId!) + '参数缺失。'
      const sid = getSongIdFuzzy(songname)
      if (sid === '') return segment.quote(session?.messageId!) + '未找到曲目。'
      songdb
        .prepare('INSERT INTO alias (sid, alias) VALUES (?, ?)')
        .run(sid, alias)
      return (
        segment.quote(session?.messageId!) +
        `已为曲目 ${sid} 录入别名 ${alias}。`
      )
    })
}
