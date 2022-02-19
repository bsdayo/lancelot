import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, Context, Logger, segment } from 'koishi'
import { formatPtt, getUserBinding } from '../utils'

export function enableBind(
  rootCmd: Command,
  ctx: Context,
  logger: Logger,
  api: BotArcApiV5
) {
  // 绑定ArcaeaID
  rootCmd
    .subcommand('.bind <usercode:string>', '绑定ArcaeaID')
    .usage('/arc bind <你的ArcaeaID>')
    .example('/arc bind 114514191')
    .action(async ({ session }, usercode: string) => {
      if (!usercode)
        return segment.quote(session?.messageId!) + '请输入需要绑定的用户ID'
      usercode = usercode.padStart(9, '0')

      // 查询数据库中是否已有绑定信息
      const result = await getUserBinding(ctx, session!)
      if (result.length !== 0) {
        return (
          segment.quote(session?.messageId!) + '数据库中已存在您的绑定信息！'
        )
      } else {
        logger.info(
          `为用户 ${session?.platform}:${session?.userId} 绑定 ArcaeaID ${usercode}`
        )
        try {
          const accountInfo = (await api.user.info(usercode)).account_info
          const rating =
            accountInfo.rating < 0 ? '?' : formatPtt(accountInfo.rating)
          await ctx.database.create('arcaeaid', {
            platform: session?.platform,
            userid: session?.userId,
            arcid: usercode,
            arcname: accountInfo.name,
          })
          return (
            segment.quote(session?.messageId!) +
            `已为您绑定 Arcaea 账号 ${accountInfo.name} (${rating})`
          )

        } catch {
          return (
            segment.quote(session?.messageId!) +
            '请输入正确格式的 ArcaeaID\n（9位数字，无空格）'
          )
        }
      }
    })
}
