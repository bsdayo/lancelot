import { Context } from 'koishi'
import { randomInt, reply } from '../../utils'

export default function enableChoose(ctx: Context) {
  ctx
    .command('choose <...args>', '随机选择')
    .shortcut('帮我选', { fuzzy: true })
    .action(({session}, ...args) => {
      if (!args || args.length < 2) return reply(session) + '请输入至少两个选项！'
      return '建议你选择' + args[randomInt(0, args.length - 1)]
    })
}
