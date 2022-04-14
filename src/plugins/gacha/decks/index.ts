import { Card, Deck } from './deck'
import pokerDeck from './poker'
import tarotDeck from './tarot'

const _decks = {
  poker: pokerDeck,
  tarot: tarotDeck,
}

const decks: Record<string, Deck<Card>> = _decks

for (let deck of Object.values(_decks)) {
  for (let alias of deck.alias) {
    decks[alias] = deck
  }
}

export default decks
