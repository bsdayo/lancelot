import { Card, Deck } from './deck'

type TarotFace = 
  // Major
    '愚者' | '魔术师' | '女祭司' | '女皇' |
    '皇帝' | '教皇' | '恋人' | '战车' |
    '力量' | '隐者' | '命运之轮' | '正义' |
    '倒吊人' | '死神' | '节制' | '恶魔' |
    '塔' | '星星' | '月亮' | '太阳' | '审判' | '世界' |
  // Minor
    '权杖' | '星币' | '圣杯' | '宝剑'

type TarotRank = '一' | '二' | '三' | '四' | '五' |
                 '六' | '七' | '八' | '九' | '十' |
                 '侍从' | '骑士' | '皇后' | '国王'

class TarotCard extends Card {
  public readonly face: TarotFace
  public readonly rank: TarotRank | undefined

  constructor(face: TarotFace, rank?: TarotRank) {
    super(rank ? face + rank : face)
    this.face = face
    this.rank = rank
  }
}

const cards: TarotCard[] = []

// Generate Cards
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 14; j++) {
    cards.push(new TarotCard(
      ['权杖', '星币', '圣杯', '宝剑'][i] as TarotFace,
      ['一', '二', '三', '四', '五',
        '六', '七', '八', '九', '十',
        '侍从', '骑士', '皇后', '国王'][j] as TarotRank
    ))
  }
}

for (let f of [
  '愚者', '魔术师', '女祭司', '女皇',
  '皇帝', '教皇', '恋人', '战车',
  '力量', '隐者', '命运之轮', '正义',
  '倒吊人', '死神', '节制', '恶魔',
  '塔', '星星', '月亮', '太阳', '审判', '世界'
]) {
  cards.push(new TarotCard(f as TarotFace))
}

export default new Deck<TarotCard>('tarot', cards, {
  alias: ['塔罗牌', '塔罗'],
  description: '塔罗牌',
  maxCount: 3
})
