import { App } from 'koishi'
import path from 'path'
import config from './config'
import arcaea from './plugins/arcaea'
import status from './plugins/status'
import whitelist from './plugins/whitelist'
import { initDir } from './utils'

// 创建目录
initDir('temp')
initDir('cache')

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
  .plugin(whitelist)
  .plugin(status)
  .plugin(arcaea, config.plugins.arcaea)
  .plugin('echo')
  .start()
