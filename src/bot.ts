import { App } from 'koishi'
import path from 'path'
import fs from 'fs'
import config from './config'
import botarcapi from './plugins/botarcapi'
import info from './plugins/info'
import { initDir } from './utils'

// 创建目录
initDir('temp')
initDir('cache')
initDir('log')

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
