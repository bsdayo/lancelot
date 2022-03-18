import { App } from 'koishi'
import path from 'path'
import config from './config'
import arcaea from './plugins/arcaea'
import status from './plugins/status'
import whitelist from './plugins/whitelist'
import poke from './plugins/poke'
import { initDir } from './utils'

export const VERSION = '1.3.0'

// 创建目录
initDir('temp')
initDir('cache')

const defaultAppConfig = {
  host: '127.0.0.1',
  port: 8080,
  prefix: '/',
}

const app = new App(Object.assign(defaultAppConfig, config.app))

declare module 'koishi' {
  interface User {
    qqguild: string
  }
}
app.model.extend('user', {
  qqguild: 'text'
})

app.before('command/execute', ({session}) => {
  if (
    session?.platform === 'qqguild' &&
    session?.guildId === config.qqguild.mainGuild &&
    session?.channelId !== config.qqguild.mainChannel
  ) return ''
})

app
  .plugin('adapter-onebot', config.plugins['adapter-onebot'])
  .plugin('adapter-telegram', config.plugins['adapter-telegram'])
  .plugin('database-sqlite', {
    path: path.resolve(__dirname, '..', 'database.db'),
  })
  .plugin(whitelist)
  .plugin(status)
  .plugin(arcaea, config.plugins.arcaea)
  .plugin(poke)
  .plugin('echo')
  .start()
