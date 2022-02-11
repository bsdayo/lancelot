import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, Context, Logger, segment } from 'koishi'
import { generateBestImage } from '../image'
import {
  getDifficultyClassName,
  getDifficultyIndex,
  getUserBinding,
} from '../utils'
import fs from 'fs/promises'

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
    .action(async ({ session }, songname: string, difficulty: string) => {
      if (!songname)
        return segment.quote(session?.messageId!) + '请输入需要查询的曲名'

      let songDifficulty: 0 | 1 | 2 | 3 | 4 // 4: Unknown
      if (difficulty) {
        difficulty = difficulty.toString().toLowerCase()
        songDifficulty = getDifficultyIndex(difficulty)
        if (songDifficulty === 4)
          return segment.quote(session?.messageId!) + '请输入正确的难度'
      } else songDifficulty = 2

      // 查询绑定信息
      const result = await getUserBinding(ctx, session!)
      const arcObj = { id: '', name: '' } // 用对象包装一层确保值可以被内层代码块覆盖
      if (result.length !== 0) {
        // 若查询到绑定数据
        arcObj.id = result[0].arcid
        arcObj.name = result[0].arcname
      } else
        return (
          segment.quote(session?.messageId!) +
          `请使用 /arc bind <你的ArcaeaID> 绑定你的账号，或在命令后接需要查询用户的ID\n（更多信息请使用 /arc b30 -h 查看）`
        )

      logger.info(
        `正在查询用户 ${arcObj.name} [${
          arcObj.id
        }] 的 ${songname}<${getDifficultyClassName(
          songDifficulty
        )}> 最高成绩...`
      )
      try {
        const bestScore = await api.user.best(
          arcObj.id,
          false,
          songname,
          songDifficulty,
          true
        )
        const imgPath = await generateBestImage(bestScore)
        logger.success(
          `用户 ${arcObj.name} [${arcObj.id}] 的最高成绩图片生成成功，文件为 ${imgPath}`
        )
        return (
          segment.quote(session?.messageId!) +
          segment.image(await fs.readFile(imgPath))
        )
      } catch (err) {
        logger.error(
          `用户 ${session?.platform}:${arcObj.name} [${arcObj.id}] 的最高成绩查询失败：${err}`
        )
        return segment.quote(session?.messageId!) + '你还没有打过这首歌！'
      }
    })
}
