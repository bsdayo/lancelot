import { Context } from 'koishi'
import { reply } from '../../utils'
import decks from './decks'
import { Card } from './decks/deck'

export default {
  name: 'gacha',
  apply(ctx: Context) {
    const rootCmd = ctx
      .command('gacha <deck> [count]', '抽卡模拟器')
      .alias('draw')
      .shortcut('抽卡', { fuzzy: true })
      .action(async ({ session }, deckName: string | undefined, count: string | number | undefined) => {
        if (!deckName || typeof deckName !== 'string')
          return reply(session) + '请输入牌堆名！'

        if (deckName === 'list')
          return await session?.execute('gacha.list')
        if (deckName === 'info')
          return await session?.execute('gacha.info ' + count)
          
        count = count ?? 1

        if (!Object.keys(decks).includes(deckName))
          return reply(session) + `牌堆 ${deckName} 不存在！`
          
        const deck = decks[deckName as keyof typeof decks]
          
        if (typeof count !== 'number' || count < 1 || count > deck.maxCount)
          return reply(session) + `请输入正确格式的数量！(1 - ${deck.maxCount})`

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


    rootCmd
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


    rootCmd
      .subcommand('.info <deck>', '查看牌堆信息')
      .shortcut('牌堆信息', { fuzzy: true })
      .action(({ session }, deckName: string | undefined) => {
        if (!deckName || typeof deckName !== 'string')
          return reply(session) + '请输入牌堆名！'
        if (!Object.keys(decks).includes(deckName))
          return reply(session) + `牌堆 ${deckName} 不存在！`

        const deck = decks[deckName as keyof typeof decks]
        const noRarity: boolean = deck.rarities.length === 1 && deck.rarities[0].weight === 1

        let rpl = deck.name + ' - ' + deck.description + '\n'
        rpl += '别名：' + deck.alias.join('、') + '\n'
        rpl += '牌堆容量：' + deck.volume + '\n'
        rpl += '单次最大抽取数：' + deck.maxCount
        if (!noRarity) {
          rpl += '\n稀有度：\n'
          for (let rarity of deck.rarities) {
            rpl += '  ' + rarity.name + '  权重：' + rarity.weight
          }
        }
        
        return reply(session) + rpl
      })
  }
}