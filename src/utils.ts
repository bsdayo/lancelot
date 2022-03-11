import path from 'path'
import fsSync from 'fs'
import fs from 'fs/promises'
import { Logger } from 'koishi'

const logger = new Logger('utils')

export function getTempFilePath(namespace: string, ext: string) {
  return path.resolve(
    __dirname,
    '../temp',
    `${namespace}-${Date.now()}.${ext}`
  )
}

export function initDir(name: string) {
  const dirPath = path.resolve(__dirname, '..', name)
  if (!fsSync.existsSync(dirPath)) {
    fsSync.mkdirSync(dirPath)
  }
}

export function getCacheFilePath(namespace: string, filename: string) {
  const filepath = path.resolve(
    __dirname,
    '../cache',
    `${namespace}-${filename}`
  )
  if (!fsSync.existsSync(filepath)) {
    return false
  } else {
    return filepath
  }
}

export function getAssetFilePath(namespace: string, filename: string) {
  return path.resolve(__dirname, '../assets', namespace, filename)
}

export async function createCache(
  namespace: string,
  filename: string,
  file: any
) {
  filename = `${namespace}-${filename}`
  logger.info('创建缓存文件 ' + filename)
  const filepath = path.resolve(__dirname, '..', 'cache', filename)
  await fs.writeFile(filepath, file)
  return filepath
}

export function getDateTime(timestamp?: number) {
  const now = typeof timestamp === 'number' ? new Date(timestamp) : new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toFixed().padStart(2, '0')
  const date = now.getDate().toFixed().padStart(2, '0')
  const hour = now.getHours().toFixed().padStart(2, '0')
  const minute = now.getMinutes().toFixed().padStart(2, '0')
  const second = now.getSeconds().toFixed().padStart(2, '0')
  return `${year}.${month}.${date} ${hour}:${minute}:${second}`
}

export function getPastDays(timestamp: number) {
  const now = Date.now()
  return Math.round((now - timestamp) / 86400000)
}

export function getPastMinutes(timestamp: number) {
  const now = Date.now()
  return Math.round((now / 1000 - timestamp) / 60)
}

export function randomInt(low: number, high: number) {
  return Math.round(Math.random() * (high - low) + low)
}
