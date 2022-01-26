import { Context, segment } from 'koishi'
import packageJson from '../../../package.json'

export default {
  name: 'info',
  apply(ctx: Context) {
    ctx
      .command('info')
      .shortcut('信息')
      .action(({ session }) => {
        return (
          segment.quote(session?.messageId!) +
          `lancelot.bot ver.${packageJson.version}\n` +
          'Powered by Koishi.js v4\n\n' +
          //
          '本项目遵循 AGPL v3 协议开源\n' +
          'GitHub仓库: https://github.com/b1acksoil/lancelot'
        )
      })
  },
}
