import path from 'path'
import fsSync from 'fs'
import fs from 'fs/promises'
import { Logger, segment, Session } from 'koishi'

const logger = new Logger('utils')

/**
 * 初始化目录，若不存在则创建
 * @param name 目录名称
 */
export function initDir(name: string) {
  const dirPath = path.resolve(__dirname, '..', name)
  if (!fsSync.existsSync(dirPath)) {
    fsSync.mkdirSync(dirPath)
  }
}

/**
 * 获取临时文件路径
 * @param namespace 文件命名空间
 * @param ext 文件扩展名
 */
export function getTempFilePath(namespace: string, ext: string) {
  return path.resolve(__dirname, '../temp', `${namespace}-${Date.now()}.${ext}`)
}

/**
 * 获取缓存文件路径
 * @param namespace 文件命名空间
 * @param filename 文件名
 */
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

/**
 * 获取资源文件路径
 * @param namespace 文件命名空间
 * @param filename 文件名
 */
export function getAssetFilePath(namespace: string, filename: string) {
  return path.resolve(__dirname, '../assets', namespace, filename)
}

/**
 * 创建缓存文件
 * @param namespace 文件命名空间
 * @param filename
 * @param file
 */
export async function createCache(namespace: string, filename: string, file: any) {
  filename = `${namespace}-${filename}`
  logger.info('创建缓存文件 ' + filename)
  const filepath = path.resolve(__dirname, '..', 'cache', filename)
  await fs.writeFile(filepath, Buffer.from(file))
  return filepath
}

/**
 * 获取当前时间
 * 格式如：2022.5.29 16:54:20
 * @param timestamp 时间戳
 */
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

/**
 * 计算经过的天数
 * @param timestamp 时间戳
 */
export function getPastDays(timestamp: number) {
  const now = Date.now()
  return Math.round((now - timestamp) / 86400000)
}

/**
 * 计算经过的分钟数
 * @param timestamp 时间戳
 */
export function getPastMinutes(timestamp: number) {
  const now = Date.now()
  return Math.round((now / 1000 - timestamp) / 60)
}

/**
 * 生成随机整数，范围为 low ~ high（包括 low 和 high）
 * @param low 下限
 * @param high 上限
 */
export function randomInt(low: number, high: number) {
  return Math.floor(Math.random() * (high - low + 1)) + low
}

/**
 * 根据平台生成回复
 * @param session Session 对象
 */
export function reply(session?: Session) {
  return session?.platform === 'qqguild'
    ? segment.at(session?.userId!)
    : segment.quote(session?.messageId!)
}

/**
 * 延时指定毫秒数
 * @param ms 延时的毫秒数
 */
export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms);
  })
}
