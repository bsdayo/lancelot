import { BotArcApiV5 } from 'botarcapi_lib'
import { Context } from 'koishi'
import * as commands from './commands'
import ArcaeaLimitedAPI from './limitedapi'
import YCMAPI from './ycm'

// 插件配置
export interface ArcaeaConfig {
  baseURL: string
  userAgent: string
  timeout?: number
  limitedAPIToken: string
  ycmToken: string
  ignoreSelfId: string[]
}

// 数据表结构
export interface ArcaeaIdTable {
  id: number
  platform: string
  userid: string
  arcid: string
  arcname: string
}

// 类型合并
declare module 'koishi' {
  interface Tables {
    arcaeaid: ArcaeaIdTable
  }
}

// 修复
declare module 'botarcapi_lib' {
  interface BotArcApiSonginfoV5 {
    set_friendly: string
  }
}

export default {
  name: 'arcaea',
  apply(ctx: Context, config: ArcaeaConfig) {
    // 日志
    const logger = ctx.logger(this.name)
    // 扩展数据库表
    ctx.model.extend(
      'arcaeaid',
      {
        id: 'integer',
        platform: 'text',
        userid: 'text',
        arcid: 'text',
        arcname: 'text',
      },
      { autoInc: true }
    )
    // BotArcAPI配置
    const api = new BotArcApiV5({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 120000,
      headers: {
        'User-Agent': config.userAgent,
      },
    })

    // OfficialAPI配置
    const officialApi = new ArcaeaLimitedAPI({
      token: config.limitedAPIToken,
      timeout: config.timeout ?? 120000,
    })

    // YCM API 配置
    const ycmApi = new YCMAPI({
      token: config.ycmToken,
      timeout: config.timeout ?? 120000,
    })

    ctx.before('command/execute', ({ session, command }) => {
      if (
        config.ignoreSelfId?.includes(session?.selfId!) &&
        command?.name.split('.')[0] === 'arc' &&
        ['b30', 'recent', 'best'].includes(command?.name.split('.')[1])
      ) {
        return '由于冻结过于频繁，本bot已停止提供Arcaea相关查询服务。\n您可以选择加入频道使用，详请进群744362693。'
      }
    })

    // 根命令
    const rootCmd = ctx
      .command('arc [subcmd] [...subcmdargs]', 'Arcaea相关功能')
      .alias('arcaea', 'a')
      .before(({ session }, subcmd?: string) => {
        if (!subcmd) return session?.execute('arc.recent')
      })

    commands.enableBind(rootCmd, ctx, logger, api, officialApi)
    commands.enableUnbind(rootCmd, ctx, logger)
    commands.enableBest30(rootCmd, ctx, logger, api, officialApi)
    commands.enableBest(rootCmd, ctx, logger, api)
    commands.enableRecent(rootCmd, ctx, logger, api)
    commands.enableInfo(rootCmd, api)
    // commands.enableConnect(rootCmd, api)
    commands.enableAlias(rootCmd, api)
    commands.enableRandom(rootCmd, api)
    commands.enableRecommend(rootCmd, ctx, api)
    commands.enableYCM(rootCmd, ycmApi)
    // commands.enableTest(rootCmd)
    commands.enableAddAlias(rootCmd)
    commands.enablePtt(rootCmd)
  },
}
