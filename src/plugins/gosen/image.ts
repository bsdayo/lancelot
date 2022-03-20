import { createCanvas, registerFont } from 'canvas'
import { GosenConfig } from '.'
import { getAssetFilePath, getTempFilePath } from '../../utils'
import fs from 'fs/promises'

export default async function generateGosenImage(
  upper: string,
  lower: string,
  config: GosenConfig
) {
  config.offsetWidth = config.offsetWidth ?? 0

  // Fonts
  registerFont(
    config.font?.upper ?? getAssetFilePath('gosen', 'SourceHanSans-Heavy.otf'),
    {
      family: 'UpperFont',
    }
  )
  registerFont(
    config.font?.lower ?? getAssetFilePath('gosen', 'SourceHanSerif-Heavy.otf'),
    {
      family: 'LowerFont',
    }
  )

  // Settings
  const upperFont = `100px UpperFont`
  const upperPosX = 70
  const upperPosY = 100

  const lowerFont = `100px LowerFont`
  const lowerOffsetX = config.offsetWidth
  const lowerOffsetY = 130
  const lowerPosX = lowerOffsetX + 330
  const lowerPosY = lowerOffsetY + 100

  // Measure Text
  const tempCanvas = createCanvas(0, 0)
  const tempCtx = tempCanvas.getContext('2d')

  tempCtx.font = upperFont
  const upperWidth = tempCtx.measureText(upper).width
  tempCtx.font = lowerFont
  const lowerWidth = tempCtx.measureText(lower).width

  const canvas = createCanvas(
    Math.max(upperWidth + 90, lowerWidth + lowerPosX - 20),
    270
  )
  const ctx = canvas.getContext('2d')

  // Background
  ctx.lineJoin = 'round'
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(1, 0, -0.4, 1, 0, 0)

  let grad

  // Upper Text
  ctx.font = upperFont
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 18
  ctx.strokeText(upper, upperPosX + 4, upperPosY + 3)

  grad = ctx.createLinearGradient(0, 24, 0, 122)
  grad.addColorStop(0.0, 'rgb(0, 15, 36)')
  grad.addColorStop(0.1, 'rgb(255, 255, 255)')
  grad.addColorStop(0.18, 'rgb(55, 58, 59)')
  grad.addColorStop(0.25, 'rgb(55, 58, 59)')
  grad.addColorStop(0.5, 'rgb(200, 200, 200)')
  grad.addColorStop(0.75, 'rgb(55, 58, 59)')
  grad.addColorStop(0.85, 'rgb(25, 20, 31)')
  grad.addColorStop(0.91, 'rgb(240, 240, 240)')
  grad.addColorStop(0.95, 'rgb(166, 175, 194)')
  grad.addColorStop(1, 'rgb(50, 50, 50)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 17
  ctx.strokeText(upper, upperPosX + 4, upperPosY + 3)

  ctx.strokeStyle = '#000'
  ctx.lineWidth = 10
  ctx.strokeText(upper, upperPosX, upperPosY)

  grad = ctx.createLinearGradient(0, 20, 0, 100)
  grad.addColorStop(0, 'rgb(253, 241, 0)')
  grad.addColorStop(0.25, 'rgb(245, 253, 187)')
  grad.addColorStop(0.4, 'rgb(255, 255, 255)')
  grad.addColorStop(0.75, 'rgb(253, 219, 9)')
  grad.addColorStop(0.9, 'rgb(127, 53, 0)')
  grad.addColorStop(1, 'rgb(243, 196, 11)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 8
  ctx.strokeText(upper, upperPosX, upperPosY)

  ctx.lineWidth = 4
  ctx.strokeStyle = '#000'
  ctx.strokeText(upper, upperPosX + 2, upperPosY - 2)

  ctx.lineWidth = 4
  ctx.strokeStyle = '#fff'
  ctx.strokeText(upper, upperPosX, upperPosY - 2)

  grad = ctx.createLinearGradient(0, 20, 0, 100)
  grad.addColorStop(0, 'rgb(255, 100, 0)')
  grad.addColorStop(0.5, 'rgb(123, 0, 0)')
  grad.addColorStop(0.51, 'rgb(240, 0, 0)')
  grad.addColorStop(1, 'rgb(5, 0, 0)')
  ctx.lineWidth = 1
  ctx.fillStyle = grad
  ctx.fillText(upper, upperPosX, upperPosY - 2)

  grad = ctx.createLinearGradient(0, 20, 0, 100)
  grad.addColorStop(0, 'rgb(230, 0, 0)')
  grad.addColorStop(0.5, 'rgb(230, 0, 0)')
  grad.addColorStop(0.51, 'rgb(240, 0, 0)')
  grad.addColorStop(1, 'rgb(5, 0, 0)')
  ctx.strokeStyle = grad
  ctx.strokeText(upper, upperPosX, upperPosY - 2)

  // Lower Text
  ctx.font = lowerFont

  ctx.strokeStyle = '#000'
  ctx.lineWidth = 17
  ctx.strokeText(lower, lowerPosX + 4, lowerPosY + 3)

  grad = ctx.createLinearGradient(
    0 + lowerOffsetX,
    20 + lowerOffsetY,
    0 + lowerOffsetX,
    118 + lowerOffsetY
  )
  grad.addColorStop(0, 'rgb(0, 15,36)')
  grad.addColorStop(0.25, 'rgb(250, 250, 250)')
  grad.addColorStop(0.5, 'rgb(150, 150, 150)')
  grad.addColorStop(0.75, 'rgb(55, 58, 59)')
  grad.addColorStop(0.85, 'rgb(25, 20, 31)')
  grad.addColorStop(0.91, 'rgb(240, 240, 240)')
  grad.addColorStop(0.95, 'rgb(166, 175, 194)')
  grad.addColorStop(1, 'rgb(50, 50, 50)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 14
  ctx.strokeText(lower, lowerPosX + 4, lowerPosY + 3)

  ctx.strokeStyle = '#10193a'
  ctx.lineWidth = 12
  ctx.strokeText(lower, lowerPosX, lowerPosY)

  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 7
  ctx.strokeText(lower, lowerPosX, lowerPosY)

  grad = ctx.createLinearGradient(
    0 + lowerOffsetX,
    20 + lowerOffsetY,
    0 + lowerOffsetX,
    100 + lowerOffsetY
  )
  grad.addColorStop(0, 'rgb(16, 25, 58)')
  grad.addColorStop(0.03, 'rgb(255, 255, 255)')
  grad.addColorStop(0.08, 'rgb(16, 25, 58)')
  grad.addColorStop(0.2, 'rgb(16, 25, 58)')
  grad.addColorStop(1, 'rgb(16, 25, 58)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 6
  ctx.strokeText(lower, lowerPosX, lowerPosY)

  grad = ctx.createLinearGradient(
    0 + lowerOffsetX,
    20 + lowerOffsetY,
    0 + lowerOffsetX,
    100 + lowerOffsetY
  )
  grad.addColorStop(0, 'rgb(245, 246, 248)')
  grad.addColorStop(0.15, 'rgb(255, 255, 255)')
  grad.addColorStop(0.35, 'rgb(195, 213, 220)')
  grad.addColorStop(0.5, 'rgb(160, 190, 201)')
  grad.addColorStop(0.51, 'rgb(160, 190, 201)')
  grad.addColorStop(0.52, 'rgb(196, 215, 222)')
  grad.addColorStop(1.0, 'rgb(255, 255, 255)')
  ctx.fillStyle = grad
  ctx.fillText(lower, lowerPosX, lowerPosY - 3)

  // Generate Image
  const filepath = getTempFilePath('gosen', 'jpg')
  await fs.writeFile(filepath, canvas.toBuffer('image/jpeg'))

  return filepath
}
