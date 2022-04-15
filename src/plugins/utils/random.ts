import { Context } from 'koishi'
import { randomInt, reply } from '../../utils'

export default function enableRandom(ctx: Context) {
  ctx
    .command('random <range:number> [end:number]', '随机数生成')
    .shortcut('随机数', { fuzzy: true })
    .option('pure', '-p')
    .action(({ session, options }, range?: number, end?: number) => {
      if (!range)
        return reply(session) + '请输入随机数范围'
      if (!Number.isInteger(range) || (end && !Number.isInteger(end)))
        return reply(session) + '请输入正确的数值'

      let startN: number = end ? range : 1
      let endN:   number = end ?? range

      if (startN > endN)
        return reply(session) + '起始值大于最大值，请检查输入'

      return (
        (options?.pure ? '' : '生成的随机数为：') + 
        randomInt(startN, endN)
      )
    })
}