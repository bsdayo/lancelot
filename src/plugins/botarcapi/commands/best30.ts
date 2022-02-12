import { Command, Context, Logger, segment } from 'koishi'
import { generateBest30Image } from '../image'
import { getUserBinding } from '../utils'
import fs from 'fs/promises'
import { BotArcApiV5 } from 'botarcapi_lib'

export function enableBest30(
  rootCmd: Command,
  ctx: Context,
  logger: Logger,
  api: BotArcApiV5
) {
  // Best30查询
  rootCmd
    .subcommand('.b30 [usercode]', '查询用户Best30成绩')
    .shortcut('查b30', { fuzzy: true })
    .alias('b30')
    .usage('/arc b30 [要查询的ArcaeaID]')
    .example('/arc b30 114514191')
    .example('查b30 191981011')
    .action(async ({ session }, usercode: string) => {
      if (usercode && parseInt(usercode).toString().length !== 9)
        return (
          segment.quote(session?.messageId!) +
          '请输入正确格式的 ArcaeaID\n（9位数字，无空格）'
        )
      const arcObj = { id: usercode, name: '' } // 用对象包装一层确保值可以被内层代码块覆盖
      if (!usercode) {
        // 若没有输入 usercode 参数
        const result = await getUserBinding(ctx, session!)
        if (result.length !== 0) {
          // 若查询到绑定数据
          arcObj.id = result[0].arcid
          arcObj.name = result[0].arcname
        } else
          return (
            segment.quote(session?.messageId!) +
            `请使用 /arc bind <你的ArcaeaID> 绑定你的账号，或在命令后接需要查询用户的ID\n（更多信息请使用 /help arc.b30 查看）`
          )
      }
      logger.info(
        `正在查询用户 ${arcObj.name} [${arcObj.id}] 的 Best30 成绩...`
      )
      await session?.send(
        `正在查询用户 ${arcObj.name} 的 Best30 成绩...`
      )
      try {
        const best30 = await api.user.best30(arcObj.id, false, true, 9)
        logger.success(
          `用户 ${arcObj.name} [${arcObj.id}] 的 Best30 成绩查询成功`
        )
        logger.info(
          `正在为用户 ${arcObj.name} [${arcObj.id}] 生成 Best30 图片...`
        )
        const imgPath = await generateBest30Image(best30)
        logger.success(
          `用户 ${arcObj.name} [${arcObj.id}] 的 Best30 图片生成成功，文件为 ${imgPath}`
        )

        return (
          segment.quote(session?.messageId!) +
          segment.image(await fs.readFile(imgPath))
        )
      } catch (err) {
        logger.error(
          `用户 ${session?.platform}:${arcObj.name} [${arcObj.id}] 的 Best30 成绩查询失败：${err}`
        )
        return `发生错误：${(err as Error).message}`
      }
    })
}
