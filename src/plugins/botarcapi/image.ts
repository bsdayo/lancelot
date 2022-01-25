import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import fs from 'fs/promises'
import { drawScoreCard, drawRecentScoreCard } from './imageutils'
import {
  BotArcApiUserbest30,
  BotArcApiUserinfoV5,
  BotArcApiSonginfoV5,
  BotArcApiScore,
} from 'botarcapi_lib'
import { getTempFilePath, getDateTime } from '../../utils'
import { formatPtt } from './utils'

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
  // 背景图
  const backgroundImage = await loadImage(
    path.resolve(__dirname, 'assets', 'best30Background.jpg')
  )
  const canvas = createCanvas(backgroundImage.width, backgroundImage.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(backgroundImage, 0, 0)

  // 账号信息
  ctx.font = '128px "Titillium Web SemiBold"'
  ctx.fillStyle = '#333'
  ctx.fillText(
    `${best30Data.account_info.name} (${
      best30Data.account_info.rating < 0
        ? '?'
        : formatPtt(best30Data.account_info.rating)
    })`,
    330,
    265
  )

  // Best30/Recent10 均值
  ctx.font = '62px "Titillium Web SemiBold"'
  ctx.fillText(
    `B30Avg / ${best30Data.best30_avg.toFixed(
      4
    )}   R10Avg / ${best30Data.recent10_avg.toFixed(4)}`,
    330,
    375
  )

  // 底部时间
  ctx.font = '121px "Titillium Web SemiBold"'
  ctx.fillStyle = '#fff'
  ctx.fillText(getDateTime(), 383, 6582)

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

  const filepath = getTempFilePath('botarcapi-best30', 'jpg')
  await fs.writeFile(filepath, canvas.toBuffer('image/jpeg'))

  return filepath
}

export async function generateRecentScoreImage(
  recentData: {
    account_info: BotArcApiUserinfoV5
    recent_score: BotArcApiScore[]
    songinfo: BotArcApiSonginfoV5[]
  },
  num: number
) {
  // 背景图
  const backgroundImage = await loadImage(
    path.resolve(__dirname, 'assets', 'recentBackground.jpg')
  )
  const height = 300 + num * 460 + 80
  const canvas = createCanvas(backgroundImage.width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(backgroundImage, 0, height - backgroundImage.height)
  ctx.font = ctx.font = '121px "Titillium Web SemiBold"'
  ctx.fillStyle = num >= 5 ? '#333' : '#fff'
  ctx.fillText('Recent Score', 280, 190)

  const drawTask = []
  for (let i = 0; i < num; i++) {
    drawTask.push(
      drawRecentScoreCard(
        ctx,
        100,
        300 + i * 460,
        recentData.recent_score[i],
        recentData.songinfo[i]
      )
    )
  }
  await Promise.all(drawTask)

  const filepath = getTempFilePath('botarcapi-recent', 'jpg')
  await fs.writeFile(filepath, canvas.toBuffer('image/jpeg'))

  return filepath
}
