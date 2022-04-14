import { Context } from 'koishi'
import { reply } from '../../utils'
import decks from './decks'
import { Card } from './decks/deck'

export default {
  name: 'gacha',
  apply(ctx: Context) {
    ctx
      .command('gacha <deck> [count]', '抽卡模拟器')
      .alias('draw')
      .shortcut('抽卡')
      .action(async ({ session }, deckName: string | undefined, count: string | undefined) => {
        if (!deckName || typeof deckName !== 'string')
          return reply(session) + '请输入牌堆名！'

        if (deckName === 'list')
          return await session?.execute('gacha.list')

        if (!Object.keys(decks).includes(deckName))
          return reply(session) + `牌堆 ${deckName} 不存在！`

        if (deckName === 'info')
          return await session?.execute('gacha.info ' + deckName)

        if (typeof count !== 'number' || count < 1 || count > 10)
          return reply(session) + '请输入正确格式的数量！(1 - 10)'


        const deck = decks[deckName as keyof typeof decks]
        const noRarity: boolean = deck.rarities.length === 1 && deck.rarities[0].weight === 1
        const result: Card[] = deck.draw(Math.floor(count))

        const rpl: string[] = []

        if (noRarity)
          for (let card of result) {
            rpl.push(card.name)
          }
        else
          for (let card of result) {
            rpl.push(card.rarity.name + ' ' + card.name)
          }
        
        return reply(session) + `${count}次抽卡结果：\n` + rpl.join('\n')
      })


      .subcommand('.list', '查看牌堆列表')
      .shortcut('牌堆列表')
      .action(({ session }) => {
        const deckInfos: string[] = []
        for (let deck of Object.values(decks)) {
          deckInfos.push(deck.name + ' ' + deck.description)
        }

        let list: string = deckInfos.join('\n')

        return reply(session) +
          list === ''
            ? '当前没有可用的牌堆！'
            : '当前可用的牌堆有：\n' + list
      })


      .subcommand('.info <deck>', '查看牌堆信息')
      .shortcut('牌堆信息')
      .action(({ session }, deckName: string | undefined) => {
        const deck = decks[deckName as keyof typeof decks]
        let rpl = deck.name + ' - ' + deck.description + '\n'
        rpl += '牌堆容量：' + deck.volume + '\n'
        rpl += '稀有度：\n'
        for (let rarity of deck.rarities) {
          rpl += '  ' + rarity.name + '  权重：' + rarity.weight
        }
        
        return reply(session) + rpl
      })
  }
}