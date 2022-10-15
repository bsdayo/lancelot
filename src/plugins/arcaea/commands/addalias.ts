import { Command } from 'koishi'
import Database from 'better-sqlite3'
import { getSongIdFuzzy } from '../utils'
import { getAssetFilePath, reply } from '../../../utils'

const songdb = new Database(getAssetFilePath('arcaea', 'arcsong.db'))
    .exec('PRAGMA foreign_keys = OFF')

export function enableAddAlias(rootCmd: Command) {
  rootCmd
    .subcommand('.addalias <songname> <alias>', '添加曲目别名', {
      authority: 3,
    })
    .action(({ session }, songname, alias) => {
      if (!songname || !alias) return reply(session) + '参数缺失。'
      const sid = getSongIdFuzzy(songname)
      if (sid === '') return reply(session) + '未找到曲目。'
      songdb
        .prepare('INSERT INTO alias (sid, alias) VALUES (?, ?)')
        .run(sid, alias)
      return reply(session) + `已为曲目 ${sid} 录入别名 ${alias}。`
    })
}
