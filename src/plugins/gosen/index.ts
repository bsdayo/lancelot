import { Context, segment } from 'koishi'
import { reply } from '../../utils'
import generateGosenImage from './image'
import fs from 'fs/promises'

export interface GosenConfig {
  offsetWidth?: number
  font: {
    upper: string
    lower: string
  }
}

export default {
  name: 'gosen',
  apply(ctx: Context, config: GosenConfig) {
    ctx
      .command('5k <upper> <lower>')
      .alias('gosen')
      .usage('/5k <上文本> <下文本>')
      .example('/5k 我现在就想玩 Arcaea')
      .action(async ({ session }, upper: string, lower: string) => {
        try {
          const imagePath = await generateGosenImage(upper, lower, config)
          return (
            reply(session) +
            '生成结果：' +
            segment.image(await fs.readFile(imagePath))
          )
        } catch (err) {
          return reply(session) + `生成失败：${err}`
        }
      })
  },
}
