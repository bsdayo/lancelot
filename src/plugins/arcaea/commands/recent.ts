import { BotArcApiRecent, BotArcApiV5 } from 'botarcapi_lib'
import { Command, Context, Logger, segment } from 'koishi'
import { generateRecentScoreImage } from '../image'
import { getUserBinding } from '../utils'
import fs from 'fs/promises'

// 最近成绩查询
export function enableRecent(
  rootCmd: Command,
  ctx: Context,
  logger: Logger,
  api: BotArcApiV5
) {
  {
    rootCmd
      .subcommand('.recent [number]', '查询用户最近成绩')
      .shortcut('查最近', { fuzzy: true })
      .usage('/arc recent [要查询的数量]')
      .example('/arc recent 3')
      .example('查最近')
      .action(async ({ session }, number: string) => {
        let num = parseInt(number)
        if (Number.isNaN(num)) {
          num = 1
        } else if (num > 7 || num < 1) {
          return (
            (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) +
            `请输入正确的数量，范围为 1 ~ 7`
          )
        }
        const result = await getUserBinding(ctx, session!)
        if (result.length === 0) {
          // 若未查询到绑定数据
          return (
            (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) +
            `请使用 /arc bind <你的ArcaeaID> 绑定你的账号\n（更多信息请使用 /help arc.recent 查看）`
          )
        }
        logger.info(
          `正在查询 ${result[0].arcname} [${result[0].arcid}] 的最近 ${num} 条成绩...`
        )
        await session?.send(
          `正在查询 ${result[0].arcname} 的最近 ${num} 条成绩...`
        )
        try {
          const recent = await api.user.info(
            result[0].arcid,
            false,
            num as BotArcApiRecent,
            true
          )
          logger.success(
            `用户 ${result[0].arcname} [${result[0].arcid}] 的 Recent 成绩查询成功`
          )
          logger.info(
            `正在为用户 ${result[0].arcname} [${result[0].arcid}] 生成 Recent 图片...`
          )
          const imgPath = await generateRecentScoreImage(recent)
          logger.success(
            `用户 ${result[0].arcname} [${result[0].arcid}] 的 Recent 图片生成成功，文件为 ${imgPath}`
          )

          return (
            (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) +
            segment.image(await fs.readFile(imgPath))
          )
        } catch (err) {
          logger.error(
            `用户 ${session?.platform}:${result[0].arcname} [${result[0].arcid}] 的 Recent 成绩查询失败：${err}`
          )
          return `发生错误：${err}`
        }
      })
  }
}
