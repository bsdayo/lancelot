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
      .command('dismiss <groupid>', '使bot退出群聊', {
        authority: 3,
        hidden: true,
      })
      .action(async ({ session }, groupid) => {
        if (!groupid) {
          return reply(session) + '请输入退出的群号'
        }
        try {
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
