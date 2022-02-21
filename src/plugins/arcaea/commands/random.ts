import { BotArcApiDifficultyRange, BotArcApiV5 } from 'botarcapi_lib'
import { Command, segment } from 'koishi'
import { getDifficultyByRating, getSongCoverPath } from '../utils'
import fs from 'fs/promises'

const difficultyRange = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '9p',
  '10',
  '10p',
  '11',
]

export function enableRandom(rootCmd: Command, api: BotArcApiV5) {
  rootCmd
    .subcommand('.random [start:string] [end:string]', '随机曲目')
    .shortcut('随机曲目', { fuzzy: true })
    .shortcut('随机选曲', { fuzzy: true })
    .usage('/arc random [起始难度] [最高难度]')
    .example('/arc random')
    .example('/arc random 11')
    .example('随机曲目 9+ 10+')
    .example('随机选曲 10.3 10.6')
    .action(async ({ session }, start?: string, end?: string) => {
      if (start) {
        start = start.replace('+', 'p')
        if (!difficultyRange.includes(start)) {
          if (parseFloat(start) >= 11 || parseFloat(start) <= 1)
            return segment.quote(session?.messageId!) + '请输入正确的起始难度'
          else start = parseFloat(start).toFixed(1)
        }
      }
      if (end) {
        end = end.replace('+', 'p')
        if (!difficultyRange.includes(end)) {
          if (parseFloat(end) >= 11 || parseFloat(end) <= 1)
            return segment.quote(session?.messageId!) + '请输入正确的最高难度'
          else end = parseFloat(end).toFixed(1)
        }
      }

      try {
        const random = await api.song.random(
          start as BotArcApiDifficultyRange,
          end as BotArcApiDifficultyRange,
          true
        )

        let str = random.songinfo.title_localized.en + '\n'
        if (random.songinfo.set_friendly) {
          str += `(${random.songinfo.set_friendly})\n`
        }

        const diff = random.songinfo.difficulties[random.ratingClass ?? 2]

        str +=
          ['Past', 'Present', 'Future', 'Beyond'][random.ratingClass ?? 2] +
          ' ' +
          getDifficultyByRating(diff.realrating) +
          ' [' +
          (diff.realrating / 10).toFixed(1) +
          ']'

        return (
          segment.quote(session?.messageId!) +
          '随机推荐曲目：\n' +
          segment.image(
            await fs.readFile(
              await getSongCoverPath(random.id, random.ratingClass === 3)
            )
          ) +
          str
        )
      } catch (err) {
        return `发生错误：${err}`
      }
    })
}
