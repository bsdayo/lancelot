import { randomInt } from '../../utils'

const replies: string[] = [
  '唔...啊？嗯！',
  '嗯？找我有什么事吗？',
  '舰长补给全保底，舰长副本零掉落 ≥ ≤',
  '再戳就吃掉你的ptt！',
  '再怎么戳我也不会属于你的 =w=',
  '猜猜你要多久才能再看见这一条戳一戳',
  '有笨蛋！',
  'zzz',
  '戳我就要给我买冰淇淋吃！'
]

export default function getRandomReply(): string {
  return replies[randomInt(0, replies.length - 1)]
}
