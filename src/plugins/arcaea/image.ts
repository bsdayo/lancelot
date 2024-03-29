import { createCanvas, loadImage, registerFont } from 'canvas'
import fs from 'fs/promises'
import {
  drawScoreCard,
  drawRecentScoreCard,
  drawFilledRoundedRect,
  drawSimpleScoreCard,
  getColorByDifficulty,
} from './imageutils'
import {
  BotArcApiUserinfoV5,
  BotArcApiContentV5,
  BotArcApiScore,
  formatScore,
  BotArcApiDifficultyInfoV5,
} from 'botarcapi_lib'
import { getTempFilePath, getDateTime, getAssetFilePath } from '../../utils'
import {
  calculateMaxPtt,
  fixBydSongTitle,
  formatPtt,
  getCharPath,
  getDifficultyByRating,
  getDifficultyClassName,
  getSongCoverPath,
} from './utils'
import jimp from 'jimp'

registerFont(getAssetFilePath('arcaea', 'TitilliumWeb-SemiBold.ttf'), {
  family: 'Titillium Web SemiBold',
})
registerFont(getAssetFilePath('arcaea', 'TitilliumWeb-Regular.ttf'), {
  family: 'Titillium Web Regular',
})

const clearImages = [
  'clearFail.png',
  'clearNormal.png',
  'clearFull.png',
  'clearPure.png',
  'clearNormal.png',
  'clearNormal.png',
]

export async function generateBest30Image(
  best30Data: BotArcApiContentV5.User.Best30,
  official?: boolean,
  highQuality?: boolean,
  darkMode?: boolean
) {
  const imgWidth = 3400
  const imgHeight = 6600
  // 背景图
  const backgroundImage = await loadImage(
    getAssetFilePath('arcaea', darkMode ? 'best30BackgroundDark.png' : 'best30Background.jpg')
  )
  const canvas = createCanvas(imgWidth, imgHeight)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(backgroundImage, 0, -60)

  // 底部时间
  ctx.font = '121px "Titillium Web SemiBold"'
  ctx.fillStyle = '#fff'
  ctx.fillText(getDateTime(), 383, 6522)

  // 账号信息
  ctx.font = '128px "Titillium Web SemiBold"'
  ctx.fillStyle = darkMode ? '#fff' : '#333'
  ctx.fillText(
    `${best30Data.account_info.name} (${
      best30Data.account_info.rating < 0
        ? '?'
        : formatPtt(best30Data.account_info.rating)
    })`,
    295,
    205
  )

  // Best30/Recent10 均值  最大ptt
  ctx.font = '62px "Titillium Web SemiBold"'
  ctx.fillText(
    `B30Avg / ${
      best30Data.best30_avg.toFixed(4)
    }   R10Avg / ${
      best30Data.recent10_avg >= 0
        ? best30Data.recent10_avg.toFixed(4)
        : '--'
    }   MaxPtt / ${calculateMaxPtt(best30Data)}`,
    295,
    315
  )

  const drawTask = []

  for (let i = 0; i < 39; i++) {
    if (i < 10) {
      // Top
      if (!best30Data.best30_list[i] || !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawScoreCard(
          ctx,
          100,
          765 + i * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i][best30Data.best30_list[i].difficulty],
          i,
          darkMode
        )
      )
    } else if (i >= 10 && i < 20) {
      // Mid
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawScoreCard(
          ctx,
          100 + 1000 + 100,
          765 + (i - 10) * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i][best30Data.best30_list[i].difficulty],
          i,
          darkMode
        )
      )
    } else if (i >= 20 && i < 30) {
      // Floor
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawScoreCard(
          ctx,
          100 + 2 * (1000 + 100),
          765 + (i - 20) * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i][best30Data.best30_list[i].difficulty],
          i,
          darkMode
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
            5165 + (i - 30) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30][best30Data.best30_overflow[i].difficulty],
            i,
            darkMode
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
            5165 + (i - 33) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30][best30Data.best30_overflow[i].difficulty],
            i,
            darkMode
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
            5165 + (i - 36) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30][best30Data.best30_overflow[i].difficulty],
            i,
            darkMode
          )
        )
      }
    }
  }
  await Promise.all(drawTask)

  // Official Overflow
  if (official) {
    ctx.font = '128px "Titillium Web SemiBold"'
    ctx.fillStyle = '#fff'
    ctx.fillText('The Limited API does not provide overflow data.', 415, 5690)
  }

  const filepath = getTempFilePath('arcaea-best30', 'jpg')
  const buffer = canvas.toBuffer('image/jpeg')
  if (highQuality) {
    await fs.writeFile(filepath, buffer)
  } else {
    await (await jimp.read(buffer))
      .resize(Math.floor(imgWidth / 2), jimp.AUTO)
      .quality(90)
      .writeAsync(filepath)
  }

  return filepath
}

export async function generateSimpleBest30Image(
  best30Data: BotArcApiContentV5.User.Best30,
  official?: boolean, // TODO
  highQuality?: boolean
) {
  const imgWidth = 2530
  const imgHeight = 6100
  const canvas = createCanvas(imgWidth, imgHeight)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 3400, 6700)
  ctx.fillStyle = '#000'

  // 账号信息
  ctx.font = '128px "Titillium Web SemiBold"'
  ctx.fillText(
    `${best30Data.account_info.name} (${
      best30Data.account_info.rating < 0
        ? '?'
        : formatPtt(best30Data.account_info.rating)
    })`,
    295,
    265
  )

  // Best30/Recent10 均值  最大ptt
  ctx.font = '62px "Titillium Web SemiBold"'
  ctx.fillText(
    `B30Avg / ${best30Data.best30_avg.toFixed(
      4
    )}   R10Avg / ${best30Data.recent10_avg.toFixed(
      4
    )}   MaxPtt / ${calculateMaxPtt(best30Data)}`,
    295,
    375
  )

  // 分割线
  ctx.fillRect(100, 480, 2330, 8)
  ctx.fillRect(100, 4620, 2330, 8)

  // 底部时间 + 信息
  ctx.font = '64px "Titillium Web SemiBold"'
  ctx.fillText(getDateTime(), 400, 6010)
  ctx.fillText('Generated by lancelot.bot', 1400, 6010)

  const drawTask = []

  for (let i = 0; i < 39; i++) {
    if (i < 10) {
      // Top
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawSimpleScoreCard(
          ctx,
          100,
          625 + i * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i][best30Data.best30_list[i].difficulty],
          i
        )
      )
    } else if (i >= 10 && i < 20) {
      // Mid
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawSimpleScoreCard(
          ctx,
          100 + 710 + 100,
          625 + (i - 10) * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i][best30Data.best30_list[i].difficulty],
          i
        )
      )
    } else if (i >= 20 && i < 30) {
      // Floor
      if (!best30Data.best30_list[i] && !best30Data.best30_songinfo[i]) break
      drawTask.push(
        drawSimpleScoreCard(
          ctx,
          100 + 2 * (710 + 100),
          625 + (i - 20) * 400,
          best30Data.best30_list[i],
          best30Data.best30_songinfo[i][best30Data.best30_list[i].difficulty],
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
          drawSimpleScoreCard(
            ctx,
            100,
            4725 + (i - 30) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30][best30Data.best30_overflow[i].difficulty],
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
          drawSimpleScoreCard(
            ctx,
            100 + 710 + 100,
            4725 + (i - 33) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30][best30Data.best30_overflow[i].difficulty],
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
          drawSimpleScoreCard(
            ctx,
            100 + 2 * (710 + 100),
            4725 + (i - 36) * 400,
            best30Data.best30_overflow[i - 30],
            best30Data.best30_overflow_songinfo[i - 30][best30Data.best30_overflow[i].difficulty],
            i
          )
        )
      }
    }
  }
  await Promise.all(drawTask)

  const filepath = getTempFilePath('arcaea-best30-simple', 'jpg')
  const buffer = canvas.toBuffer('image/jpeg')
  if (highQuality) {
    await fs.writeFile(filepath, buffer)
  } else {
    await (await jimp.read(buffer))
      .resize(Math.floor(imgWidth / 2), jimp.AUTO)
      .quality(90)
      .writeAsync(filepath)
  }

  return filepath
}

export async function generateBestImage(bestData: {
  account_info: BotArcApiUserinfoV5
  record: BotArcApiScore
  songinfo: BotArcApiDifficultyInfoV5[]
}) {
  // 背景图
  const backgroundImage = await loadImage(
    getAssetFilePath('arcaea', 'bestBackground.jpg')
  )
  const canvas = createCanvas(backgroundImage.width, backgroundImage.height)
  const ctx = canvas.getContext('2d')
  // 底图
  ctx.drawImage(backgroundImage, 0, 0)

  // 账号信息
  ctx.font = '60px "Titillium Web SemiBold"'
  ctx.fillStyle = '#fff'
  ctx.fillText(
    `${bestData.account_info.name} (${
      bestData.account_info.rating < 0
        ? '?'
        : formatPtt(bestData.account_info.rating)
    })`,
    124,
    150
  )

  ctx.font = 'normal 79px "Titillium Web SemiBold",sans-serif'
  ctx.fillText(fixBydSongTitle(bestData.songinfo[0].name_en, bestData.record.difficulty), 124, 330)

  // 立绘
  const charPath = await getCharPath(
    bestData.account_info.character,
    bestData.account_info.is_char_uncapped &&
      !bestData.account_info.is_char_uncapped_override
  )
  const charImage = await loadImage(charPath)
  ctx.drawImage(charImage, 798, 0, 1650, 1650)

  // 曲绘白底和半透明背景
  drawFilledRoundedRect(ctx, 103, 365, 1144, 542, 25, 'rgba(0, 0, 0, 0.5)')
  drawFilledRoundedRect(ctx, 103, 365, 542, 542, 25)

  // 曲绘
  const songCoverPath = await getSongCoverPath(
    bestData.record.song_id,
    bestData.record.difficulty === 3
  )
  const songCoverImage = await loadImage(songCoverPath)
  ctx.drawImage(songCoverImage, 124, 386, 500, 500)

  // 得分
  ctx.font = '90px "Titillium Web Regular"'
  // 理论值？
  if (
    bestData.record.shiny_perfect_count === bestData.record.perfect_count &&
    bestData.record.near_count === 0 &&
    bestData.record.miss_count === 0
  ) {
    ctx.fillStyle = '#7fdfff'
    ctx.fillText(formatScore(bestData.record.score), 736, 479)
  }
  ctx.fillStyle = '#fff'
  ctx.fillText(formatScore(bestData.record.score), 731, 474)

  const clearImage = await loadImage(
    getAssetFilePath('arcaea', clearImages[bestData.record.clear_type])
  )
  if (clearImage.height > 77) {
    // FR/PM
    ctx.drawImage(clearImage, 646, 510, 601, 74)
  } else {
    // TC/TL
    ctx.drawImage(clearImage, 646, 518, 601, (601 / clearImage.width) * 74)
  }

  ctx.font = '37px "Titillium Web Regular"'
  ctx.fillText(
    `Pure / ${bestData.record.perfect_count} (+${bestData.record.shiny_perfect_count})`,
    678,
    638
  )
  ctx.fillText(`Far / ${bestData.record.near_count}`, 678, 694)
  ctx.fillText(`Lost / ${bestData.record.miss_count}`, 678, 749)

  // 难度条
  const { color, colorDark } = getColorByDifficulty(bestData.record.difficulty)
  drawFilledRoundedRect(ctx, 663, 799, 561, 52, 10, colorDark)

  const realrating = bestData.songinfo[0].rating // 定数
  ctx.fillStyle = '#fff'
  const difficultyText =
    getDifficultyClassName(bestData.record.difficulty) +
    ' ' +
    getDifficultyByRating(realrating) +
    ` [${(realrating / 10).toFixed(1)}]`
  ctx.fillText(difficultyText, 843, 837)

  // 获得 ptt
  drawFilledRoundedRect(ctx, 663, 799, 162, 52, 10, color)
  ctx.fillStyle = '#fff'
  ctx.font = '37px "Titillium Web SemiBold"'
  ctx.fillText(bestData.record.rating.toFixed(4), 675, 837)

  // 日期
  ctx.font = '30px "Titillium Web SemiBold"'
  ctx.fillText(
    `Played at ${getDateTime(bestData.record.time_played)}`,
    663,
    889
  )

  const filepath = getTempFilePath('arcaea-best', 'png')
  await fs.writeFile(filepath, canvas.toBuffer('image/png'))

  return filepath
}

export async function generateRecentScoreImage(recentData: {
  account_info: BotArcApiUserinfoV5
  recent_score: BotArcApiScore[]
  songinfo: BotArcApiDifficultyInfoV5[]
}) {
  const num = recentData.recent_score.length

  if (num === 1) {
    return await generateBestImage({
      account_info: recentData.account_info,
      record: recentData.recent_score[0],
      songinfo: recentData.songinfo,
    })
  }

  // 背景图
  const backgroundImage = await loadImage(
    getAssetFilePath('arcaea', 'recentBackground.jpg')
  )
  const height = 300 + num * 460 + 80
  const canvas = createCanvas(backgroundImage.width, height)
  const ctx = canvas.getContext('2d')
  // 底图
  ctx.drawImage(backgroundImage, 0, height - backgroundImage.height)

  ctx.font = '121px "Titillium Web SemiBold"'
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

  const filepath = getTempFilePath('arcaea-recent', 'jpg')
  await fs.writeFile(filepath, canvas.toBuffer('image/jpeg'))

  return filepath
}
