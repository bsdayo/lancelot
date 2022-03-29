import { Context, Session } from 'koishi'
import config from '../../config'
import {
  ArcaeaDifficulty,
  BotArcApiScore,
  BotArcApiSonginfoV5,
  BotArcApiUserbest30,
  BotArcApiUserinfoV5,
  BotArcApiV5,
} from 'botarcapi_lib'
import { createCache, getAssetFilePath, getCacheFilePath } from '../../utils'
import { ArcaeaLimitedAPIScore, ArcaeaLimitedAPIUserInfo } from './limitedapi'
import Database from 'better-sqlite3'

const songdb = new Database(getAssetFilePath('arcaea', 'arcsong.db'))

// BotArcAPI配置
const api = new BotArcApiV5({
  baseURL: config.plugins.arcaea.baseURL,
  timeout: config.plugins.arcaea.timeout,
  headers: {
    'User-Agent': config.plugins.arcaea.userAgent,
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

  const cachePath = getCacheFilePath('arcaea', beyond ? filenameBYD : filename)
  if (!cachePath) {
    const data = await api.assets.song(songid, false, beyond)
    return await createCache('arcaea', beyond ? filenameBYD : filename, data)
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
    'arcaea',
    awakened ? filenameAwakened : filename
  )
  if (!cachePath) {
    const data = await api.assets.char(charid, awakened)
    return await createCache(
      'arcaea',
      awakened ? filenameAwakened : filename,
      data
    )
  } else return cachePath
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

export function calculateMaxPtt(
  best30Data: BotArcApiUserbest30 & {
    account_info: BotArcApiUserinfoV5
    best30_songinfo: BotArcApiSonginfoV5[]
    best30_overflow_songinfo: BotArcApiSonginfoV5[]
  }
) {
  let best10Total = 0
  for (let i = 0; i < 10; i++) {
    if (best30Data.best30_list[i])
      best10Total += best30Data.best30_list[i].rating ?? 0
    else break
  }
  return ((best10Total + 30 * best30Data.best30_avg) / 40).toFixed(4)
}

export function getSongInfoFromDatabase(songid: string): BotArcApiSonginfoV5 {
  const songRow = songdb
    .prepare('SELECT * FROM songs WHERE sid = ?')
    .get(songid)
  const packageRow = songdb
    .prepare('SELECT name FROM packages WHERE id = ?')
    .get(songRow.pakset)

  const data: BotArcApiSonginfoV5 = {
    id: songRow.sid,
    title_localized: {
      en: songRow.name_en,
    },
    artist: songRow.artist,
    bpm: songRow.bpm,
    bpm_base: songRow.bpm_base,
    set: songRow.pakset,
    set_friendly: packageRow.name,
    side: songRow.side,
    remote_dl: JSON.parse(songRow.remote_download),
    world_unlock: JSON.parse(songRow.world_unlock),
    date: songRow.date,
    version: songRow.version,
    difficulties: [
      {
        ratingClass: 0,
        chartDesigner: songRow.chart_designer_pst,
        jacketDesigner: songRow.jacket_designer_pst,
        jacketOverride: JSON.parse(songRow.jacket_override_pst),
        realrating: songRow.rating_pst,
      },
      {
        ratingClass: 1,
        chartDesigner: songRow.chart_designer_prs,
        jacketDesigner: songRow.jacket_designer_prs,
        jacketOverride: JSON.parse(songRow.jacket_override_prs),
        realrating: songRow.rating_prs,
      },
      {
        ratingClass: 2,
        chartDesigner: songRow.chart_designer_ftr,
        jacketDesigner: songRow.jacket_designer_ftr,
        jacketOverride: JSON.parse(songRow.jacket_override_ftr),
        realrating: songRow.rating_ftr,
      },
    ],
  }

  if (songRow.rating_byn !== -1)
    data.difficulties.push({
      ratingClass: 3,
      chartDesigner: songRow.chart_designer_byn,
      jacketDesigner: songRow.jacket_designer_byn,
      jacketOverride: JSON.parse(songRow.jacket_override_byn),
      realrating: songRow.rating_byn,
    })

  return data
}

export function convertALAScoreToBAA(alaScore: ArcaeaLimitedAPIScore) {
  const baaScore: BotArcApiScore = {
    song_id: alaScore.song_id,
    difficulty: alaScore.difficulty,
    score: alaScore.score,
    shiny_perfect_count: alaScore.shiny_pure_count,
    perfect_count: alaScore.pure_count,
    near_count: alaScore.far_count,
    miss_count: alaScore.lost_count,
    clear_type: 0,
    best_clear_type: 0,
    health: alaScore.recollection_rate,
    time_played: alaScore.time_played,
    modifier: 1,
    rating: alaScore.potential_value,
  }

  if (baaScore.miss_count === 0) {
    if (baaScore.near_count === 0) {
      baaScore.best_clear_type = 3
      baaScore.clear_type = 3
    } else {
      baaScore.best_clear_type = 2
      baaScore.clear_type = 2
    }
  }

  return baaScore
}

export function convertALAUserInfoToBAA(alaUserInfo: ArcaeaLimitedAPIUserInfo) {
  const baaUserInfo: BotArcApiUserinfoV5 = {
    code: '',
    user_id: -1,
    name: alaUserInfo.display_name,
    character: alaUserInfo.partner.partner_id,
    join_date: -1,
    rating: alaUserInfo.potential ?? -1,
    is_skill_sealed: false,
    is_char_uncapped: alaUserInfo.partner.is_awakened,
    is_char_uncapped_override: false,
    is_mutual: false,
  }
  return baaUserInfo
}

export function validateUsercode(usercode: string | undefined) {
  if (!usercode) return false
  usercode = usercode.toString()
  if (usercode.length !== 9) return false
  if (usercode === 'undefined') return false
  for (let i = 0; i < 9; i++) {
    if (Number.isNaN(parseInt(usercode.charAt(i)))) return false
  }
  return true
}

export function getAbbreviation(source: string) {
  let str = source[0]
  for (let i = 0; i < source.length - 1; i++) {
    if (source[i] === ' ') str += source[i + 1]
  }
  return str
}

export function getSongIdFuzzy(source: string): string {
  source = source.toString()
  if (source.trim() === '') return ''

  source = source.replaceAll(' ', '').toLowerCase()

  // 别名
  const aliasRow = songdb
    .prepare('SELECT sid FROM alias WHERE alias = ?')
    .get(source)
  if (aliasRow) return aliasRow.sid

  // 曲名
  const songRow = songdb.prepare('SELECT sid, name_en FROM songs').all()

  const song = songRow.find((s) => {
    const songname: string = s.name_en.replaceAll(' ', '').toLowerCase()

    return (
      getAbbreviation(s.name_en.toLowerCase()) === source ||
      songname === source ||
      s.sid === source ||
      (source.length > 4 && songname.includes(source))
    )
  })

  if (song) return song.sid

  return ''
}

export function getAlias(songid: string) {
  const alias: string[] = []
  const aliasRows = songdb
    .prepare('SELECT alias FROM alias WHERE sid = ?')
    .all(songid)
  for (let aliasRow of aliasRows)
    alias.push(aliasRow.alias)
  return alias
}

export function fixBydSongTitle(songtitle: string, difficulty: ArcaeaDifficulty) {
  if (difficulty === 3) {
    switch (songtitle) {
      case 'Ignotus':
        return 'Ignotus Afterburn'
      case 'Red and Blue':
        return 'Red and Blue and Green'
      case 'Singularity':
        return 'Singularity VVVIP'
      case 'dropdead':
        return 'overdead.'
      case 'PRAGMATISM':
        return 'PRAGMATISM -RESURRECTION-'
      default:
        return songtitle
    }
  } else return songtitle
}
