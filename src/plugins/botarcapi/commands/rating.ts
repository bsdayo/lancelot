import { BotArcApiV5 } from 'botarcapi_lib'
import { Command, segment } from 'koishi'

export function enableRating(rootCmd: Command, api: BotArcApiV5) {
  rootCmd
    .subcommand('.rating <songname:text>')
    .shortcut('查定数', { fuzzy: true })
    .action(async ({ session }, songname: string) => {
      try {
        const songinfo = await api.song.info(songname, true)
        let str = songinfo.title_localized.en
        for (let diff of songinfo.difficulties) {
          let diffClass = ['Past', 'Present', 'Future', 'Beyond'][diff.ratingClass]
          let rating = (diff.realrating / 10).toFixed(1)
          str += `\n${diffClass} / ${rating}`
        }
        return segment.quote(session?.messageId!) + str
      } catch {
        return (
          segment.quote(session?.messageId!) +
          '关键词过于模糊，请使用更为具体的曲名查询'
        )
      }
    })
}
