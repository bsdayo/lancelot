import { Command } from 'koishi'
import { reply } from '../../../utils'
import {
  getDifficultyIndex,
  getSongIdFuzzy,
  getSongInfoFromDatabase,
} from '../utils'

export function enablePtt(rootCmd: Command) {
  rootCmd
    .subcommand('.ptt <songname> <score> [difficulty]', '根据得分计算潜力值')
    .shortcut('计算潜力值', { fuzzy: true })
    .shortcut('计算ptt', { fuzzy: true })
    .usage('/a ptt <曲目名称> <得分> [难度(默认FTR)]')
    .example('/a ptt sheriruth 9114514')
    .example('/a ptt 白魔王 9191981 byd')
    .action(({ session }, songname, score, difficulty?) => {
      if (!songname) return reply(session) + '未输入曲名，请检查指令格式'

      const sid = getSongIdFuzzy(songname)
      if (sid === '') return reply(session) + '未找到曲目：' + songname

      const _score = parseInt(score)
      if (Number.isNaN(_score) || _score > 10005000)
        return reply(session) + '请输入正确的得分！'

      const diffIndex = getDifficultyIndex(difficulty ?? 'ftr')
      if (diffIndex === 4) return reply(session) + '请输入正确的难度'

      const songinfo = getSongInfoFromDatabase(sid)
      const rating = songinfo.difficulties[diffIndex].realrating / 10
      let ptt = 0

      if (_score >= 10000000) ptt = rating + 2
      else if (_score >= 9800000) ptt = rating + 1 + (_score - 9800000) / 200000
      else ptt = rating + (_score - 9500000) / 300000

      if (ptt < 0) ptt = 0

      const diffText = ['Past', 'Present', 'Future', 'Beyond'][diffIndex]

      return (
        reply(session) +
        `在曲目 ${
          songinfo.title_localized.en
        }[${diffText}] 中，得分 ${_score} 的单曲潜力值为 ${ptt.toFixed(4)}`
      )
    })
}
