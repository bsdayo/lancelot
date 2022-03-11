import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, segment } from 'koishi'
import fs from 'fs/promises'
import {
  getDifficultyByRating,
  getSongCoverPath,
  getSongIdFuzzy,
  getSongInfoFromDatabase,
} from '../utils'

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

        let str = songinfo.title_localized.en
        if (songinfo.set_friendly) {
          str += `\n(${songinfo.set_friendly})`
        }

        let isHaveBeyond = false

        for (let diff of songinfo.difficulties) {
          let diffClass = ['Past', 'Present', 'Future', 'Beyond'][
            diff.ratingClass
          ]
          if (diff.ratingClass === 3) isHaveBeyond = true
          let rating = (diff.realrating / 10).toFixed(1)
          str += `\n${diffClass} ${getDifficultyByRating(
            diff.realrating
          )} [${rating}]`
        }

        return (
          segment.quote(session?.messageId!) +
          segment.image(
            await fs.readFile(await getSongCoverPath(songinfo.id))
          ) +
          (isHaveBeyond
            ? segment.image(
                await fs.readFile(await getSongCoverPath(songinfo.id, true))
              )
            : '') +
          str
        )
      } catch (err) {
        console.log(err)
        return (
          segment.quote(session?.messageId!) +
          `查询失败，可能是关键词过于模糊。(${err})`
        )
      }
    })
}
