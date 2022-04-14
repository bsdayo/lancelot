import { Card, Deck } from './deck'
import pokerDeck from './poker'

const _decks = {
  poker: pokerDeck
}

const decks: Record<string, Deck<Card>> = _decks

for (let deck of Object.values(_decks)) {
  for (let alias of deck.alias) {
    decks[alias] = deck
  }
}

export default decks
