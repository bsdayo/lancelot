import { App } from 'koishi'
import path from 'path'
import fs from 'fs'
import config from './config'
import botarcapi from './plugins/botarcapi'
import info from './plugins/info'

// 创建临时目录
if (!fs.existsSync(path.resolve(__dirname, '..', 'temp')))
  fs.mkdirSync(path.resolve(__dirname, '..', 'temp'))
if (!fs.existsSync(path.resolve(__dirname, '..', 'cache')))
  fs.mkdirSync(path.resolve(__dirname, '..', 'cache'))

const app = new App({
  host: config.app.host ?? '127.0.0.1',
  port: config.app.port ?? 8080,
  prefix: config.app.prefix ?? '/',
})

app
  .plugin('adapter-onebot', config.plugins['adapter-onebot'])
  .plugin('database-sqlite', {
    path: path.resolve(__dirname, '..', 'database.db'),
  })
  .plugin(botarcapi, config.plugins.botarcapi)
  .plugin(info)
  .plugin('echo')
  .start()
