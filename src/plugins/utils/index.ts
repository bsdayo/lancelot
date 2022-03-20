import { Context, Logger } from 'koishi'
import { botdb } from '../../bot'

const mainbotLogger = new Logger('mainbot')

export default {
  name: 'utils',
  apply(ctx: Context) {
    ctx.command('mainbot', '设置群内主Bot').action(({ session }) => {
      if (!session?.guildId || !session?.channelId)
        return '当前非群聊或频道环境。'
      try {
        botdb
          .prepare(
            `UPDATE channel
          SET assignee = ?
          WHERE platform = ?
          AND guildid = ?
          AND id = ?`
          )
          .run(
            session.selfId,
            session.platform,
            session.guildId,
            session.channelId
          )
      } catch {
        return '主 Bot 设置失败。'
      }
      mainbotLogger.info(
        `将 ${session.selfId} 设置为群 ${session.platform}:${session.channelId} 的主 Bot。`
      )
      return '已将本 Bot 设置为群内主 Bot。'
    })
  },
}
