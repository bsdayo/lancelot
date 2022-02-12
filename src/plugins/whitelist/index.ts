import { OneBot } from '@koishijs/plugin-adapter-onebot'
import { Context, segment } from 'koishi'

export default {
  name: 'whitelist',
  apply(ctx: Context) {
    ctx.on('guild-request', async (session) => {
      try {
        await session.bot.handleGuildRequest(session.messageId!, true)
      } catch {}
      await session.bot.sendMessage(
        session.channelId!,
        '欢迎使用 lancelot.bot！\n请使用 /help 指令获取帮助。'
      )
    })

    ctx
      .platform('onebot')
      .command('dismiss <groupid>', '使bot退出群聊', {
        authority: 3,
        hidden: true,
      })
      .action(async ({ session }, groupid) => {
        if (!groupid) {
          return segment.quote(session?.messageId!) + '请输入退出的群号'
        }
        try {
          await (session?.bot.internal as OneBot.Internal).setGroupLeave(
            groupid,
            true
          )
          return segment.quote(session?.messageId!) + `退出群 ${groupid} 成功！`
        } catch {
          return segment.quote(session?.messageId!) + `退出群 ${groupid} 失败！`
        }
      })
  },
}
