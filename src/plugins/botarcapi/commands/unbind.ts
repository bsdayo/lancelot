import { Command, Context, Logger, segment } from 'koishi'
import { getUserBinding } from '../utils'

export function enableUnbind(rootCmd: Command, ctx: Context, logger: Logger) {
  // 取消绑定ArcaeaID
  rootCmd
    .subcommand('.unbind')
    .usage('/arc unbind')
    .action(async ({ session }) => {
      // 查询数据库中是否已有绑定信息
      const result = await getUserBinding(ctx, session!)
      if (result.length !== 0) {
        logger.info(
          `为用户 ${session?.platform}:${session?.userId} 取消绑定 ArcaeaID`
        )
        await ctx.database.remove('arcaeaid', {
          platform: session?.platform,
          userid: session?.userId,
        })
        return (
          segment.quote(session?.messageId!) +
          `已为您取消绑定 Arcaea 账号 ${result[0].arcname}`
        )
      } else {
        return (
          segment.quote(session?.messageId!) +
          `数据库中没有您的绑定信息，请使用 /arc bind <你的ArcaeaID> 绑定你的账号`
        )
      }
    })
}
