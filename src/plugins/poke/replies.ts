import { segment } from 'koishi'
import { getAssetFilePath, randomInt } from '../../utils'
import fs from 'fs/promises'

const replies: string[] = [
  '唔...啊？嗯！',
  '嗯？找我有什么事吗？',
  '舰长补给全保底，舰长副本零掉落 ≥ ≤',
  '再戳就吃掉你的ptt！',
  '再怎么戳我也不会属于你的 =w=',
  '猜猜你要多久才能再看见这一条戳一戳',
  '有笨蛋！',
  'zzz',
  '戳我就要给我买冰淇淋吃！',
  '今天要去哪里玩呢？',
  'face1.jpg',
  'face2.jpg',
  '没事就别戳了（恼）',
  '来点涩图'
]

export default async function getRandomReply(): Promise<string> {
  const rpl = replies[randomInt(0, replies.length - 1)]
  if (rpl.endsWith('.jpg')) return segment.image(await fs.readFile(getAssetFilePath('poke', rpl))).toString()
  else return rpl
}
