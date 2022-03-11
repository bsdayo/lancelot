import { BotArcApiScore, BotArcApiSonginfoV5, formatScore } from 'botarcapi_lib'
import { CanvasRenderingContext2D, loadImage } from 'canvas'
import { getDateTime, getPastDays } from '../../utils'
import {
  getSongCoverPath,
  getDifficultyClassName,
  getDifficultyByRating,
} from './utils'

export const colorPST = '#51a9c8'
export const colorPRS = '#a8c96b'
export const colorFTR = '#8a4876'
export const colorBYD = '#bb2b43'
export const colorPSTDark = '#4188a1'
export const colorPRSDark = '#87a256'
export const colorFTRDark = '#6f3a5f'
export const colorBYDDark = '#962336'

// 获取各难度对应的颜色
export function getColorByDifficulty(difficulty: number) {
  if (difficulty === 0) return { color: colorPST, colorDark: colorPSTDark }
  else if (difficulty === 1) return { color: colorPRS, colorDark: colorPRSDark }
  else if (difficulty === 2) return { color: colorFTR, colorDark: colorFTRDark }
  else return { color: colorBYD, colorDark: colorBYDDark }
}

// 绘制圆角矩形
export function drawFilledRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string = 'white',
  shadow?: boolean
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 35
  }
  ctx.fill()
  ctx.shadowColor = 'rgba(0, 0, 0, 0)'
  ctx.shadowBlur = 0
}

// 绘制分数卡片 (1000x320)
export async function drawScoreCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scoreData: BotArcApiScore,
  songInfo: BotArcApiSonginfoV5,
  rank?: number // 排名
) {
  const songCoverPath = await getSongCoverPath(
    scoreData.song_id,
    scoreData.difficulty === 3
  )
  const songCoverImage = await loadImage(songCoverPath)
  const { color, colorDark } = getColorByDifficulty(scoreData.difficulty)
  // 卡片主体
  drawFilledRoundedRect(ctx, x, y, 1000, 320, 20, '#fff', true)
  ctx.drawImage(songCoverImage, x + 15, y + 15, 290, 290)

  // 若传递 rank 参数则绘制排名
  if (typeof rank === 'number') {
    ctx.font = '45px "Titillium Web SemiBold"'
    let rectColor = '#ddd'
    let textColor = '#333'
    if (rank === 0) {
      rectColor = '#ffcc00'
    } else if (rank === 1) {
      rectColor = '#c0c0c0'
    } else if (rank === 2) {
      rectColor = '#a57c50'
      textColor = '#fff'
    }
    drawFilledRoundedRect(ctx, x + 320, y + 15, 665, 60, 10, rectColor)
    ctx.fillStyle = textColor
    ctx.fillText('#' + (rank + 1), x + 320 + 575, y + 15 + 46)
  }

  // 难度条
  drawFilledRoundedRect(
    ctx,
    x + 320,
    y + 15,
    typeof rank === 'number' ? 560 : 665,
    60,
    10,
    colorDark
  )
  const realrating = songInfo.difficulties.find((val) => {
    return val.ratingClass === scoreData.difficulty
  })!.realrating // 定数
  ctx.fillStyle = '#fff'
  ctx.font = '45px "Titillium Web Regular"'
  const difficultyText =
    getDifficultyClassName(scoreData.difficulty) +
    ' ' +
    getDifficultyByRating(realrating) +
    ` [${(realrating / 10).toFixed(1)}]`
  ctx.fillText(
    difficultyText,
    x + 320 + 191 + 15,
    y + 15 + 46,
    typeof rank === 'number' ? 339 : 444
  )

  // 获得 ptt
  drawFilledRoundedRect(ctx, x + 320, y + 15, 191, 60, 10, color)
  ctx.font = '45px "Titillium Web SemiBold"'
  ctx.fillStyle = '#fff'
  ctx.fillText(scoreData.rating.toFixed(4), x + 320 + 15, y + 15 + 46)

  // 曲名
  ctx.font = 'normal 60px "Titillium Web SemiBold",sans-serif'
  ctx.fillStyle = '#333'
  ctx.fillText(songInfo.title_localized.en, x + 320 + 15, y + 15 + 46 + 75, 635)

  // 得分
  ctx.font = '97px "Titillium Web Regular"'
  // 理论值？
  if (
    scoreData.shiny_perfect_count === scoreData.perfect_count &&
    scoreData.near_count === 0 &&
    scoreData.miss_count === 0
  ) {
    ctx.fillStyle = '#7fdfff'
    ctx.fillText(
      formatScore(scoreData.score),
      x + 320 + 20,
      y + 15 + 46 + 75 + 105,
      635
    )
  }
  ctx.fillStyle = '#333'
  ctx.fillText(
    formatScore(scoreData.score),
    x + 320 + 15,
    y + 15 + 46 + 75 + 100,
    635
  )

  // Pure/Far/Lost 信息
  ctx.font = '40px "Titillium Web Regular"'
  ctx.fillText(
    `Pure / ${scoreData.perfect_count} (${scoreData.shiny_perfect_count})   Far / ${scoreData.near_count}   Lost / ${scoreData.miss_count}`,
    x + 320 + 15,
    y + 15 + 46 + 75 + 100 + 60,
    635
  )
}

export async function drawSimpleScoreCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scoreData: BotArcApiScore,
  songInfo: BotArcApiSonginfoV5,
  rank?: number // 排名
) {
  ctx.fillStyle = '#000'
  // 若传递 rank 参数则绘制排名
  if (typeof rank === 'number') {
    ctx.font = '45px "Titillium Web SemiBold"'
    ctx.fillText('#' + (rank + 1), x + 585, y + 15 + 46)
  }

  // 难度条
  const realrating = songInfo.difficulties.find((val) => {
    return val.ratingClass === scoreData.difficulty
  })!.realrating // 定数
  ctx.font = '45px "Titillium Web Regular"'
  const difficultyText =
    getDifficultyClassName(scoreData.difficulty) +
    ' ' +
    getDifficultyByRating(realrating) +
    ` [${(realrating / 10).toFixed(1)}]`
  ctx.fillText(
    difficultyText,
    x + 30 + 185 + 15,
    y + 15 + 46,
    typeof rank === 'number' ? 339 : 444
  )

  // 获得 ptt
  ctx.font = '45px "Titillium Web SemiBold"'
  ctx.fillText(scoreData.rating.toFixed(4), x + 30 + 15, y + 15 + 46)

  // 曲名
  ctx.font = 'normal 60px "Titillium Web SemiBold",sans-serif'
  ctx.fillText(songInfo.title_localized.en, x + 30 + 15, y + 15 + 46 + 75, 635)

  // 得分
  ctx.font = '97px "Titillium Web Regular"'
  // 理论值？
  if (
    scoreData.shiny_perfect_count === scoreData.perfect_count &&
    scoreData.near_count === 0 &&
    scoreData.miss_count === 0
  ) {
    ctx.fillStyle = '#ddd'
    ctx.fillText(
      formatScore(scoreData.score),
      x + 30 + 20,
      y + 15 + 46 + 75 + 105,
      635
      )
    }
  ctx.fillStyle = '#000'
  ctx.fillText(
    formatScore(scoreData.score),
    x + 30 + 15,
    y + 15 + 46 + 75 + 100,
    635
  )

  // Pure/Far/Lost 信息
  ctx.font = '40px "Titillium Web Regular"'
  ctx.fillText(
    `Pure / ${scoreData.perfect_count} (${scoreData.shiny_perfect_count})   Far / ${scoreData.near_count}   Lost / ${scoreData.miss_count}`,
    x + 30 + 15,
    y + 15 + 46 + 75 + 100 + 60,
    635
  )
}

export async function drawRecentScoreCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scoreData: BotArcApiScore,
  songInfo: BotArcApiSonginfoV5
) {
  drawFilledRoundedRect(ctx, x, y, 1000, 380, 20, '#ddd')
  await drawScoreCard(ctx, x, y, scoreData, songInfo)
  ctx.fillStyle = '#333'
  ctx.font = '45px "Titillium Web Regular"'
  const pastDays = getPastDays(scoreData.time_played)
  ctx.fillText(
    `${getDateTime(scoreData.time_played)}   ${
      pastDays > 0 ? '(' + pastDays + ' days ago)' : ''
    }`,
    x + 15,
    y + 320 + 46
  )
}
