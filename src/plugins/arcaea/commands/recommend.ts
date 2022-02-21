import { BotArcApiDifficultyRange, BotArcApiV5 } from 'botarcapi_lib'
import { Command, Context, segment } from 'koishi'
import {
  getDifficultyByRating,
  getSongCoverPath,
  getUserBinding,
} from '../utils'
import fs from 'fs/promises'

export function enableRecommend(
  rootCmd: Command,
  ctx: Context,
  api: BotArcApiV5
) {
  rootCmd
    .subcommand('.recommend', '根据ptt推荐曲目')
    .shortcut('推荐曲目')
    .usage('根据玩家PTT推荐曲目，范围为ptt-1.75至ptt-0.50(向下取整)')
    .example('推荐曲目')
    .example('今日arc')
    .action(async ({ session }) => {
      const result = await getUserBinding(ctx, session!)
      if (result.length === 0)
        return (
          segment.quote(session?.messageId!) +
          `请先使用 /arc bind <你的ArcaeaID> 绑定你的账号`
        )

      try {
        const userinfo = await api.user.info(result[0].arcid, false)
        let low: number | string = userinfo.account_info.rating - 175
        let high: number | string = userinfo.account_info.rating - 50

        if (low < 100) low = '1'
        else if (low > 1100) low = '11'
        else low = (low / 100).toFixed(1)
        
        if (high < 100) high = '1'
        else if (high > 1100) high = '11'
        else high = (high / 100).toFixed(1)

        const random = await api.song.random(
          low as BotArcApiDifficultyRange,
          high as BotArcApiDifficultyRange,
          true
        )

        let str = random.songinfo.title_localized.en + '\n'
        if (random.songinfo.set_friendly) {
          str += `(${random.songinfo.set_friendly})\n`
        }

        const diff = random.songinfo.difficulties[random.ratingClass ?? 2]

        str +=
          ['Past', 'Present', 'Future', 'Beyond'][random.ratingClass ?? 2] +
          ' ' +
          getDifficultyByRating(diff.realrating) +
          ' [' +
          (diff.realrating / 10).toFixed(1) +
          ']'

        return (
          segment.quote(session?.messageId!) +
          `Hello, ${result[0].arcname}\n当前为您推荐的曲目是：\n` +
          segment.image(
            await fs.readFile(
              await getSongCoverPath(random.id, random.ratingClass === 3)
            )
          ) +
          str
        )
      } catch (err) {
        return segment.quote(session?.messageId!) + `发生错误：${err}`
      }
    })
}
