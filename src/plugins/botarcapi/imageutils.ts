import { BotArcApiScore, BotArcApiSonginfoV5, formatScore } from 'botarcapi_lib'
import { CanvasRenderingContext2D, loadImage } from 'canvas'
import {
  getSongCoverPath,
  getColorByDifficulty,
  getDifficultyClassName,
  getDifficultyByRating,
} from './utils'

export function drawFilledRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string = 'white'
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.fill()
}

export async function drawScoreCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scoreData: BotArcApiScore,
  songInfo: BotArcApiSonginfoV5,
  rank?: number
) {
  const songCoverPath = await getSongCoverPath(scoreData.song_id)
  const songCoverImage = await loadImage(songCoverPath)
  const { color, colorDark } = getColorByDifficulty(scoreData.difficulty)
  drawFilledRoundedRect(ctx, x, y, 1000, 320, 20)
  ctx.drawImage(songCoverImage, x + 15, y + 15, 290, 290)

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

  // 难度
  drawFilledRoundedRect(
    ctx,
    x + 320,
    y + 15,
    typeof rank === 'number' ? 560 : 665,
    60,
    10,
    colorDark
  )
  drawFilledRoundedRect(ctx, x + 320, y + 15, 191, 60, 10, color)

  const realrating = songInfo.difficulties.find((val) => {
    return val.ratingClass === scoreData.difficulty
  })!.realrating
  ctx.fillStyle = '#fff'
  ctx.font = '45px "Titillium Web SemiBold"'
  ctx.fillText(scoreData.rating.toFixed(4), x + 320 + 15, y + 15 + 46)
  ctx.font = '45px "Titillium Web Regular"'
  ctx.fillText(
    getDifficultyClassName(scoreData.difficulty) +
      ' ' +
      getDifficultyByRating(realrating) +
      ` [${(realrating / 10).toFixed(1)}]`,
    x + 320 + 191 + 15,
    y + 15 + 46,
    typeof rank === 'number' ? 339 : 444
  )
  ctx.font = '60px "Titillium Web SemiBold"'
  ctx.fillStyle = '#333'
  ctx.fillText(songInfo.title_localized.en, x + 320 + 15, y + 15 + 46 + 75, 635)
  ctx.font = '97px "Titillium Web Regular"'
  ctx.fillText(
    formatScore(scoreData.score),
    x + 320 + 15,
    y + 15 + 46 + 75 + 100,
    635
  )
  ctx.font = '40px "Titillium Web Regular"'
  ctx.fillText(
    `Pure / ${scoreData.perfect_count} (${scoreData.shiny_perfect_count})   Far / ${scoreData.near_count}   Lost / ${scoreData.miss_count}`,
    x + 320 + 15,
    y + 15 + 46 + 75 + 100 + 60,
    635
  )
}
