import { App } from 'koishi'
import path from 'path'
import config from './config'
import { initDir } from './utils'
import Database from 'better-sqlite3'

import whitelist from './plugins/whitelist'
import arcaea from './plugins/arcaea'
import status from './plugins/status'
import poke from './plugins/poke'
import utils from './plugins/utils'
import gosen from './plugins/gosen'
import gacha from './plugins/gacha'
import debug from './plugins/debug'

export const VERSION = '1.3.1'

export const botdb = new Database(path.resolve(__dirname, '../database.db'))

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
  qqguild: 'text',
})

app.before('command/execute', ({session}) => {
  if (
    session?.platform === 'qqguild' &&
    (session?.guildId !== config.qqguild.mainGuild ||
      !config.qqguild.mainChannel.includes(session?.channelId!))
  )
    return ''
})

app.plugin('adapter-onebot', config.plugins['adapter-onebot'])
app.plugin('adapter-telegram', config.plugins['adapter-telegram'])
app.plugin('database-sqlite', {
  path: path.resolve(__dirname, '..', 'database.db'),
})
app.plugin(whitelist)
app.plugin(status)
app.plugin(utils, config.plugins.utils)
app.plugin(arcaea, config.plugins.arcaea)
app.plugin(gosen, config.plugins.gosen)
app.plugin(poke)
app.plugin(gacha)
app.plugin(debug)
app.plugin('echo')

app.start()
