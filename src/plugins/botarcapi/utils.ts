import { Context, Session } from 'koishi'
import config from '../../config'
import { BotArcApiV5 } from 'botarcapi_lib'
import { createCache, getCacheFilePath } from '../../utils'

export const colorPST = '#51a9c8'
export const colorPRS = '#a8c96b'
export const colorFTR = '#8a4876'
export const colorBYD = '#bb2b43'
export const colorPSTDark = '#4188a1'
export const colorPRSDark = '#87a256'
export const colorFTRDark = '#6f3a5f'
export const colorBYDDark = '#962336'

// BotArcAPI配置
const api = new BotArcApiV5({
  baseURL: config.plugins.botarcapi.baseURL,
  timeout: config.plugins.botarcapi.timeout,
  headers: {
    'User-Agent': config.plugins.botarcapi.userAgent,
  },
})

// 获取数据库中的绑定信息
export async function getUserBinding(ctx: Context, session: Session) {
  return await ctx.database.get('arcaeaid', {
    platform: session?.platform,
    userid: session?.userId,
  })
}

// 格式化 potential
export function formatPtt(rating: number) {
  return (rating / 100).toFixed(2)
}

// 获取曲绘路径，不存在则缓存
export async function getSongCoverPath(
  songid: string,
  beyond?: boolean
): Promise<string> {
  const filename = `song-${songid}.jpg`
  const filenameBYD = `song-${songid}-beyond.jpg`

  const cachePath = getCacheFilePath(
    'botarcapi',
    config.plugins.botarcapi.enableBeyondCover && beyond
      ? filenameBYD
      : filename
  )
  if (!cachePath) {
    if (beyond) return await getSongCoverPath(songid, false)
    const data = await api.assets.song(songid, false)
    return await createCache('botarcapi', filename, data)
  } else return cachePath
}

// 获取各难度对应的颜色
export function getColorByDifficulty(difficulty: number) {
  if (difficulty === 0) return { color: colorPST, colorDark: colorPSTDark }
  else if (difficulty === 1) return { color: colorPRS, colorDark: colorPRSDark }
  else if (difficulty === 2) return { color: colorFTR, colorDark: colorFTRDark }
  else return { color: colorBYD, colorDark: colorBYDDark }
}

// 获取各难度的名称
export function getDifficultyClassName(difficulty: number) {
  if (difficulty === 0) return 'Past'
  if (difficulty === 1) return 'Present'
  if (difficulty === 2) return 'Future'
  if (difficulty === 3) return 'Beyond'
  else return 'UnknownDifficulty: ' + difficulty
}

// 转换 rating(eg. 99) 为难度描述 (eg.9+)
export function getDifficultyByRating(rating: number) {
  const str = (rating / 10).toFixed(1)
  if (rating > 90 && parseInt(str.split('.')[1]) >= 7) {
    return str.split('.')[0] + '+'
  } else return str.split('.')[0]
}
