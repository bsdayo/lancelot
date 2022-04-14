import { randomInt } from '../../../utils'

interface DeckExtraConfig {
  alias?: string[]
  description?: string
}

export class Deck<CardT extends Card> {
  public readonly name: string
  public readonly alias: string[]
  public readonly description: string
  public readonly rarities: CardRarity[] = []
  public readonly volume: number
  private readonly _deck: CardT[] = []
  private readonly _intervals: number[] = [0]

  public constructor(name: string, source?: CardT[], extraConfig?: DeckExtraConfig) {
    this.name = name
    this.description = extraConfig?.description ?? ''
    this.alias = extraConfig?.alias ?? []
    this.update(source)
    this.volume = source?.length ?? 0

    for (let card of this._deck) {
      if (!this.rarities.find((rarity) => rarity.name === card.rarity.name))
        this.rarities.push(card.rarity)
    }

    let weightSum = 0
    for (let rarity of this.rarities) {
      weightSum += rarity.weight
      this._intervals.push(weightSum)
    }
  }

  public update(source?: CardT[]): void {
    this._deck.push(...(source ?? []))
  }

  public draw(count?: number): CardT[] {
    count = count ?? 1

    // 抽卡结果
    let result: CardT[] = []

    // 二分法查找
    let left: number, mid: number, right: number, rand: number

    for (let i = 0; i < count; i++) {
      left = 0
      right = this._intervals.length - 1
      rand = randomInt(0, this._intervals[this._intervals.length - 1] - 1)

      while (left <= right) {
        mid = Math.floor(left + (right - left) / 2)
        if (rand >= this._intervals[mid] && rand < this._intervals[mid + 1]) {
          const cards = this._deck.filter(
            (card) => card.rarity.name === this.rarities[mid].name
          )
          result.push(cards[randomInt(0, cards.length - 1)])
          break
        } else if (rand < this._intervals[mid]) right = mid
        else left = mid + 1
      }
    }
    return result
  }

  public drawName(count?: number) {
    const result = this.draw(count)
    let names: string[] = []

    for (let card of result) {
      names.push(card.name)
    }

    return names
  }
}

export class Card {
  public readonly name: string
  public readonly rarity: CardRarity

  public constructor(name: string, rarity?: CardRarity) {
    this.name = name
    this.rarity = rarity ?? { name: 'Default Rarity', weight: 1 }
  }
}

export interface CardRarity {
  name: string
  weight: number
}
