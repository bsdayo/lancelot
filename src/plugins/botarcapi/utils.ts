import { Context, Session } from 'koishi'
import config from '../../config'
import { BotArcApiSonginfoV5, BotArcApiUserbest30, BotArcApiUserinfoV5, BotArcApiV5 } from 'botarcapi_lib'
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
    beyond ? filenameBYD : filename
  )
  if (!cachePath) {
    const data = await api.assets.song(songid, false, beyond)
    return await createCache('botarcapi', beyond ? filenameBYD : filename, data)
  } else return cachePath
}

// 获取角色立绘路径，不存在则缓存
export async function getCharPath(
  charid: number,
  awakened?: boolean
): Promise<string> {
  const filename = `char-${charid}.jpg`
  const filenameAwakened = `char-${charid}-awakened.jpg`

  const cachePath = getCacheFilePath(
    'botarcapi',
    awakened ? filenameAwakened : filename
  )
  if (!cachePath) {
    const data = await api.assets.char(charid, awakened)
    return await createCache(
      'botarcapi',
      awakened ? filenameAwakened : filename,
      data
    )
  } else return cachePath
}

// 获取各难度对应的颜色
export function getColorByDifficulty(difficulty: number) {
  if (difficulty === 0) return { color: colorPST, colorDark: colorPSTDark }
  else if (difficulty === 1) return { color: colorPRS, colorDark: colorPRSDark }
  else if (difficulty === 2) return { color: colorFTR, colorDark: colorFTRDark }
  else return { color: colorBYD, colorDark: colorBYDDark }
}

// 获取各难度的序号
export function getDifficultyIndex(difficulty: number | string) {
  difficulty = difficulty.toString().toLowerCase()
  if (['0', 'pst', 'past'].includes(difficulty)) return 0
  if (['1', 'prs', 'present'].includes(difficulty)) return 1
  if (['2', 'ftr', 'future'].includes(difficulty)) return 2
  if (['3', 'byd', 'byn', 'beyond'].includes(difficulty)) return 3
  return 4
}

// 获取各难度的名称
export function getDifficultyClassName(difficulty: 0 | 1 | 2 | 3 | string) {
  if (typeof difficulty === 'string')
    return ['Past', 'Present', 'Future', 'Beyond', 'Unknown'][
      getDifficultyIndex(difficulty)
    ]
  else return ['Past', 'Present', 'Future', 'Beyond'][difficulty]
}

// 转换 rating(eg. 99) 为难度描述 (eg.9+)
export function getDifficultyByRating(rating: number) {
  const str = (rating / 10).toFixed(1)
  if (rating > 90 && parseInt(str.split('.')[1]) >= 7) {
    return str.split('.')[0] + '+'
  } else return str.split('.')[0]
}

// 验证好友代码格式
export function validateUsercode(usercode: string) {
  if (
    usercode &&
    usercode.length === parseInt(usercode).toString().padStart(9, '0').length &&
    usercode.length === 9
  )
    return true
  else return false
}

export function calculateMaxPtt(best30Data: BotArcApiUserbest30 & {
  account_info: BotArcApiUserinfoV5
  best30_songinfo: BotArcApiSonginfoV5[]
  best30_overflow_songinfo: BotArcApiSonginfoV5[]
}) {
  let best10Total = 0
  for (let i = 0; i < 10; i++) {
    if (best30Data.best30_list[i])
      best10Total += best30Data.best30_list[i].rating ?? 0
    else break
  }
  return ((best10Total + 30 * best30Data.best30_avg) / 40).toFixed(4)
}
