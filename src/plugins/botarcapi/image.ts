import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import fs from 'fs/promises'
import { drawScoreCard } from './imageutils'
import {
  BotArcApiUserbest30,
  BotArcApiUserinfoV5,
  BotArcApiSonginfoV5,
} from 'botarcapi_lib'
import { getTempFilePath, getNowDateTime } from '../../utils'

registerFont(path.resolve(__dirname, 'assets', 'TitilliumWeb-SemiBold.ttf'), {
  family: 'Titillium Web SemiBold',
})
registerFont(path.resolve(__dirname, 'assets', 'TitilliumWeb-Regular.ttf'), {
  family: 'Titillium Web Regular',
})

export async function generateBest30Image(
  best30Data: BotArcApiUserbest30 & {
    account_info: BotArcApiUserinfoV5
    best30_songinfo: BotArcApiSonginfoV5[]
    best30_overflow_songinfo: BotArcApiSonginfoV5[]
  }
) {
  // 分数卡片宽 1000px, 高 320px
  const backgroundImage = await loadImage(
    path.resolve(__dirname, 'assets', 'best30Background.jpg')
  )
  const canvas = createCanvas(backgroundImage.width, backgroundImage.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(backgroundImage, 0, 0)

  ctx.font = '128px "Titillium Web SemiBold"'
  ctx.fillStyle = '#333'
  ctx.fillText(
    `${best30Data.account_info.name} (${(
      best30Data.account_info.rating / 100
    ).toFixed(2)})`,
    330,
    265
  )
  ctx.font = '62px "Titillium Web SemiBold"'
  ctx.fillText(
    `B30Avg / ${best30Data.best30_avg.toFixed(4)}   R10Avg / ${best30Data.recent10_avg.toFixed(4)}`,
    330,
    375
  )

  ctx.font = '121px "Titillium Web SemiBold"'
  ctx.fillStyle = '#fff'
  ctx.fillText(getNowDateTime(), 383, 6582)

  const drawTask = []

  for (let i = 0; i < 39; i++) {
    if (i < 10) {
      // Top
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawScoreCard(
          ctx,
          100,
          825 + i * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i],
          i
        )
      )
    } else if (i >= 10 && i < 20) {
      // Mid
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawScoreCard(
          ctx,
          100 + 1000 + 100,
          825 + (i - 10) * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i],
          i
        )
      )
    } else if (i >= 20 && i < 30) {
      // Floor
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawScoreCard(
          ctx,
          100 + 2 * (1000 + 100),
          825 + (i - 20) * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i],
          i
        )
      )
    } else if (i >= 30 && i < 39) {
      // Overflow
      if (i < 33) {
        if (
          !best30Data.best30_overflow[i - 30] &&
          !best30Data.best30_overflow_songinfo[i - 30]
        )
          break
        drawTask.push(
          drawScoreCard(
            ctx,
            100,
            5225 + (i - 30) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30],
            i
          )
        )
      } else if (i >= 33 && i < 36) {
        if (
          !best30Data.best30_overflow[i - 30] &&
          !best30Data.best30_overflow_songinfo[i - 30]
        )
          break
        drawTask.push(
          drawScoreCard(
            ctx,
            100 + 1000 + 100,
            5225 + (i - 33) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30],
            i
          )
        )
      } else if (i >= 36) {
        if (
          !best30Data.best30_overflow[i - 30] &&
          !best30Data.best30_overflow_songinfo[i - 30]
        )
          break
        drawTask.push(
          drawScoreCard(
            ctx,
            100 + 1000 + 100 + 1000 + 100,
            5225 + (i - 36) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30],
            i
          )
        )
      }
    }
  }
  await Promise.all(drawTask)

  const filepath = getTempFilePath('botarcapi', 'jpg')

  await fs.writeFile(filepath, canvas.toBuffer('image/jpeg'))
  
  return filepath
}
