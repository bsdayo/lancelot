import { Command, segment } from 'koishi'
import { ArcaeaConfig } from '../index'
import axios, { AxiosResponse } from 'axios'
import fs from 'fs/promises'
import { getDifficultyIndex, getSongIdFuzzy } from '../utils'
import { createCache, getCacheFilePath, reply } from '../../../utils'

export function enablePreview(rootCmd: Command, config: ArcaeaConfig) {
  const _axios = axios.create({
    baseURL: config.baseURL,
    headers: {
      'User-Agent': config.userAgent,
    },
    timeout: config.timeout,
  })

  rootCmd
    .subcommand('.preview <songname> [difficulty]', '获取谱面预览')
    .usage('/arc preview <曲名> [难度，默认FTR]')
    .example('/arc preview stasis')
    .example('/arc preview 白魔王 byd')
    .action(async ({ session }, ...songname: string[]) => {
      if (!songname)
        return reply(session) + '请输入曲目名称'

      let haveDifficultyParam = false
      let difficulty = getDifficultyIndex(songname[songname.length - 1])
      if (difficulty === 4) difficulty = 2
      else haveDifficultyParam = true

      const songnameStr = haveDifficultyParam
        ? songname.slice(0, -1).join(' ')
        : songname.join(' ')

      const songid = getSongIdFuzzy(songnameStr)

      try {
        const cachePath = getCacheFilePath('arcaea-chart', `${songid}.jpg`)

        if (!cachePath) {
          const resp: AxiosResponse<ArrayBuffer> = await _axios({
            url: '/assets/preview',
            params: {
              songid,
              difficulty
            },
            responseType: 'arraybuffer'
          })

          await createCache('arcaea-chart', `${songid}.jpg`, resp.data)
          return reply(session) + segment.image(resp.data).toString()
        } else {
          return reply(session) + segment.image(await fs.readFile(cachePath)).toString()
        }
      } catch (e) {
        return `发生错误：${e}`
      }
    })
}