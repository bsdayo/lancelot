import { OneBot } from '@koishijs/plugin-adapter-onebot'
import { Context, segment } from 'koishi'
import { reply } from '../../utils'

export default {
  name: 'whitelist',
  apply(ctx: Context) {
    const logger = ctx.logger(this.name)

    ctx.on('guild-request', async (session) => {
      if (session.selfId === '3591970931') return
      try {
        await session.bot.handleGuildRequest(session?.messageId!, true)
      } catch {}
      logger.info(`已接受群 ${session?.channelId!} 的邀请`)
    })

    ctx.on('friend-request', async (session) => {
      await session.bot.handleFriendRequest(session?.messageId!, true)
      logger.info(`已接受来自 ${session?.userId!} 的好友申请`)
    })

    ctx
      .platform('onebot')
      .command('dismiss <groupid>', '使bot退出群聊')
      .action(async ({ session }, groupid) => {
        if (!groupid) {
          if (!session?.guildId) return
          await (session?.bot.internal as OneBot.Internal).setGroupLeave(
            session.guildId,
            true
          )
        }
        try {
          const userAuthority = (await session?.getUser())?.authority
          if (!userAuthority || userAuthority < 3)
            return '权限不足。'
          await (session?.bot.internal as OneBot.Internal).setGroupLeave(
            groupid,
            true
          )
          return reply(session) + `退出群 ${groupid} 成功！`
        } catch {
          return reply(session) + `退出群 ${groupid} 失败！`
        }
      })
  },
}
