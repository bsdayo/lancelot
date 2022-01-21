import { App } from 'koishi'
import { BotConfig } from '@koishijs/plugin-adapter-onebot'
import { BotArcApiConfig } from './plugins/botarcapi'

export default {
  app: {
    host: '127.0.0.1',
    port: 8080,
    prefix: '/',
  } as App.Config,

  plugins: {
    'adapter-onebot': {
      // 这部分按照 https://koishi.js.org/plugins/adapter/onebot.html#go-cqhttp-配置参考 自行配置
      protocol: 'ws',
      selfId: '1234567890',
      endpoint: 'ws://127.0.0.1:6700',
    } as BotConfig,

    botarcapi: {
      // 如果不使用此功能，可以在 bot.ts 中注释掉相关的 plugin 导入
      baseURL: '<BotArcAPI URL>',
      userAgent: '<自定义User-Agent>',
      timeout: 60000,
    } as BotArcApiConfig,
  },
}
