import { randomInt } from '../../utils'

const replies: string[] = [
  '唔...啊？嗯！',
  '嗯？找我有什么事吗？'
]

export default function getRandomReply(): string {
  return replies[randomInt(0, replies.length - 1)]
}
