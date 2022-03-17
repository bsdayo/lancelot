import {
  BotArcApiDifficultyRange,
  BotArcApiRandomSong,
  BotArcApiV5,
} from 'botarcapi_lib'
import { Command, segment } from 'koishi'
import {
  getDifficultyByRating,
  getSongCoverPath,
  getSongInfoFromDatabase,
} from '../utils'
import fs from 'fs/promises'
import { getAssetFilePath, randomInt } from '../../../utils'
import Database from 'better-sqlite3'

const songdb = new Database(getAssetFilePath('arcaea', 'arcsong.db'))

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
        start = start.toString().replace('+', 'p')
        if (!difficultyRange.includes(start)) {
          if (
            Number.isNaN(parseFloat(start)) ||
            parseFloat(start) > 11.5 ||
            parseFloat(start) < 1
          )
            return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + '请输入正确的起始难度'
          else start = parseFloat(start).toFixed(1)
        }
      }
      if (end) {
        end = end.toString().replace('+', 'p')
        if (!difficultyRange.includes(end)) {
          if (
            Number.isNaN(parseFloat(end)) ||
            parseFloat(end) > 11.5 ||
            parseFloat(end) < 1
          )
            return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + '请输入正确的最高难度'
          else end = parseFloat(end).toFixed(1)
        }
      }

      try {
        // const random = await api.song.random(
        //   start as BotArcApiDifficultyRange,
        //   end as BotArcApiDifficultyRange,
        //   true
        // )

        const lowerlimit = convertToArcaeaRange(start ?? '1.0')
        const upperlimit = convertToArcaeaRange(end ?? (start ?? '11.5'))
        const random = getRandomSong(lowerlimit[0], upperlimit[1])

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
          (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) +
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

export function convertToArcaeaRange(rawdata: string): number[] {
  switch (rawdata) {
    case '11':
      return [110, 116]
    case '10p':
      return [107, 109]
    case '10':
      return [100, 106]
    case '9p':
      return [97, 99]
    case '9':
      return [90, 96]
    case '8':
      return [80, 89]
    case '7':
      return [70, 79]
    case '6':
      return [60, 69]
    case '5':
      return [50, 59]
    case '4':
      return [40, 49]
    case '3':
      return [30, 39]
    case '2':
      return [20, 29]
    case '1':
      return [10, 19]
    default:
      const val = parseFloat(rawdata)
      if (Number.isNaN(val)) return [-1, -1]
      return [Math.round(val * 10), Math.round(val * 10)]
  }
}

export function getRandomSong(
  lowerlimit: number,
  upperlimit: number
): BotArcApiRandomSong {
  const songRows = songdb
    .prepare(
      `SELECT * FROM songs WHERE 
                (rating_pst BETWEEN ? AND ?) OR
                (rating_prs BETWEEN ? AND ?) OR
                (rating_ftr BETWEEN ? AND ?) OR
                (rating_byn BETWEEN ? AND ?)`
    )
    .all(
      lowerlimit,
      upperlimit,
      lowerlimit,
      upperlimit,
      lowerlimit,
      upperlimit,
      lowerlimit,
      upperlimit
    )

  const randomSongRow = songRows[randomInt(0, songRows.length - 1)]
  const randomDifficulties = []
  if (
    lowerlimit <= randomSongRow.rating_pst &&
    randomSongRow.rating_pst <= upperlimit
  )
    randomDifficulties.push(0)
  if (
    lowerlimit <= randomSongRow.rating_prs &&
    randomSongRow.rating_prs <= upperlimit
  )
    randomDifficulties.push(1)
  if (
    lowerlimit <= randomSongRow.rating_ftr &&
    randomSongRow.rating_ftr <= upperlimit
  )
    randomDifficulties.push(2)
  if (
    lowerlimit <= randomSongRow.rating_byn &&
    randomSongRow.rating_byn <= upperlimit
  )
    randomDifficulties.push(3)

  const songinfo = getSongInfoFromDatabase(randomSongRow.sid)

  return {
    id: randomSongRow.sid,
    ratingClass:
      lowerlimit === 10 && upperlimit === 115
        ? 2
        : randomDifficulties[randomInt(0, randomDifficulties.length - 1)],
    songinfo,
  }
}
