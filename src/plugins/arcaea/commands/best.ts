import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, Context, Logger, segment } from 'koishi'
import { generateBestImage } from '../image'
import {
  getDifficultyClassName,
  getDifficultyIndex,
  getUserBinding,
} from '../utils'
import fs from 'fs/promises'
import { reply } from '../../../utils'

export function enableBest(
  rootCmd: Command,
  ctx: Context,
  logger: Logger,
  api: BotArcApiV5
) {
  // 最高成绩查询
  rootCmd
    .subcommand('.best <songname> [difficulty]', '查询用户单曲最高分')
    .shortcut('查最高', { fuzzy: true })
    .usage('/arc best <曲目名称> [难度，默认FTR]')
    .example('/arc best xanatos')
    .example('/arc best heavensdoor byd')
    .action(async ({ session }, ...songname: string[]) => {
      if (songname.length === 0) return reply(session) + '请输入需要查询的曲名'

      let haveDifficultyParam = false

      let songDifficulty: 0 | 1 | 2 | 3 | 4 = getDifficultyIndex(
        songname[songname.length - 1]
      )
      if (songDifficulty === 4) songDifficulty = 2
      else haveDifficultyParam = true

      const songnameStr = haveDifficultyParam
        ? songname.slice(0, -1).join(' ')
        : songname.join(' ')

      // 查询绑定信息
      const result = await getUserBinding(ctx, session!)
      const arcObj = { id: '', name: '' } // 用对象包装一层确保值可以被内层代码块覆盖
      if (result.length !== 0) {
        // 若查询到绑定数据
        arcObj.id = result[0].arcid
        arcObj.name = result[0].arcname
      } else
        return (
          reply(session) +
          `请使用 /arc bind <你的ArcaeaID> 绑定你的账号，或在命令后接需要查询用户的ID\n（更多信息请使用 /help arc.best 查看）`
        )

      logger.info(
        `正在查询 ${arcObj.name} [${
          arcObj.id
        }] 的 ${songnameStr}<${getDifficultyClassName(
          songDifficulty
        )}> 最高成绩...`
      )
      try {
        const bestScore = await api.user.best(
          arcObj.id,
          false,
          songnameStr,
          songDifficulty,
          true
        )
        const imgPath = await generateBestImage(bestScore)
        logger.success(
          `用户 ${arcObj.name} [${arcObj.id}] 的最高成绩图片生成成功，文件为 ${imgPath}`
        )
        return reply(session) + segment.image(await fs.readFile(imgPath))
      } catch (err) {
        logger.error(
          `用户 ${session?.platform}:${arcObj.name} [${arcObj.id}] 的最高成绩查询失败：${err}`
        )
        return reply(session) + `发生错误，可能是你还没有打过这首歌。\n(${err})`
      }
    })
}
