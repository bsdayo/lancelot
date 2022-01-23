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

export async function getUserBinding(ctx: Context, session: Session) {
  return await ctx.database.get('arcaeaid', {
    platform: session?.platform,
    userid: session?.userId,
  })
}

export function formatPtt(rating: number) {
  return (rating / 100).toFixed(2)
}

export async function getSongCoverPath(songid: string) {
  const filename = 'song-' + songid + '.jpg'
  const cachePath = getCacheFilePath('botarcapi', filename)
  if (!cachePath) {
    const data = await api.assets.song(songid, false)
    return await createCache('botarcapi', filename, data)
  } else return cachePath
}

export async function getPartnerImgPath(partnerid: number, awakened: boolean) {
  const filename = 'char-' + partnerid + '.jpg'
  const cachePath = getCacheFilePath('botarcapi', filename)
  if (!cachePath) {
    const data = await api.assets.char(partnerid, awakened)
    return await createCache('botarcapi', filename, data)
  } else return cachePath
}


export function getColorByDifficulty(difficulty: number) {
  if (difficulty === 0) return { color: colorPST, colorDark: colorPSTDark}
  else if (difficulty === 1) return { color: colorPRS, colorDark: colorPRSDark}
  else if (difficulty === 2) return { color: colorFTR, colorDark: colorFTRDark}
  else return { color: colorBYD, colorDark: colorBYDDark}
}

export function getDifficultyClassName(difficulty: number) {
  if (difficulty === 0) return 'Past'
  if (difficulty === 1) return 'Present'
  if (difficulty === 2) return 'Future'
  if (difficulty === 3) return 'Beyond'
  else return 'UnknownDifficulty: ' + difficulty
}

export function getDifficultyByRating(rating: number) {
  const str = (rating / 10).toFixed(1)
  if (rating > 90 && parseInt(str.split('.')[1]) >= 7) {
    return str.split('.')[0] + '+'
  } else return str.split('.')[0]
}
