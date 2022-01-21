import { App } from 'koishi'
import path from 'path'
import config from './config'
import botarcapi from './plugins/botarcapi'

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
  .plugin('echo')
  .start()
