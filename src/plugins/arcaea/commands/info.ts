import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, segment } from 'koishi'
import fs from 'fs/promises'
import {
  getDifficultyByRating,
  getSongCoverPath,
  getSongIdFuzzy,
  getSongInfoFromDatabase,
} from '../utils'
import { reply } from '../../../utils'

export function enableInfo(rootCmd: Command, api: BotArcApiV5) {
  rootCmd
    .subcommand('.info <songname:text>', '查询单曲信息')
    .shortcut('查定数', { fuzzy: true })
    .usage('/arc info <曲目名称>')
    .example('/arc info ringed genesis')
    .example('查定数 对立削苹果')
    .action(async ({ session }, songname: string) => {
      try {
        const sid = getSongIdFuzzy(songname)
        if (sid === '') throw Error('no result')
        const songinfo = getSongInfoFromDatabase(sid)
        // const songinfo = await api.song.info(songname, true)

        let str = songinfo[0].name_en
        if (songinfo[0].set_friendly) {
          str += `\n(${songinfo[0].set_friendly})`
        }

        let isHaveBeyond = songinfo.length === 4

        for (let i = 0; i < songinfo.length; i++) {
          let diffClass = ['Past', 'Present', 'Future', 'Beyond'][i]
          let rating = (songinfo[i].rating / 10).toFixed(1)
          str += `\n${diffClass} ${getDifficultyByRating(
            songinfo[i].rating
          )} [${rating}]`
        }

        return (
          reply(session) +
          segment.image(await fs.readFile(await getSongCoverPath(sid))) +
          (isHaveBeyond
            ? segment.image(await fs.readFile(await getSongCoverPath(sid, true)))
            : '') +
          str
        )
      } catch (err) {
        return reply(session) + `查询失败，可能是关键词过于模糊。(${err})`
      }
    })
}
