import { Context } from 'koishi';
import { reply } from '../../utils';

export default {
  name: 'debug',
  apply(ctx: Context) {
    const rootCmd = ctx.command('debug', '调试功能', { authority: 3 })

    rootCmd
      .subcommand('.envinfo', '当前环境信息')
      .action(({ session }) => {
        return reply(session) + 
          'DEBUG - Environment Info\n' +
          '=========================\n' +
          `guildId: ${session?.guildId}\n` +
          `channelId: ${session?.channelId}\n` +
          `selfId: ${session?.selfId}\n` +
          `userId: ${session?.userId}\n` +
          `messageId: ${session?.messageId}\n` +
          `targetId: ${session?.targetId}`
      })
  }
}