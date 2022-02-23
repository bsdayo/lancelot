import { BotArcApiV5 } from 'botarcapi_lib'
import { Context, segment } from 'koishi'
import * as commands from './commands'
import ArcaeaLimitedAPI from './limitedapi'

// 插件配置
export interface ArcaeaConfig {
  baseURL: string
  userAgent: string
  timeout: number
  limitedAPIToken: string
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
      timeout: config.timeout,
      headers: {
        'User-Agent': config.userAgent,
      },
    })

    // OfficialAPI配置
    const officialApi = new ArcaeaLimitedAPI({
      token: config.limitedAPIToken,
      timeout: config.timeout,
    })
    // 根命令
    const rootCmd = ctx
      .command('arc [subcmd] [...subcmdargs]', 'Arcaea相关功能')
      .alias('arcaea', 'a')
      // .action(async ({ session }, subcmd: string, ...subcmdargs: string[]) => {
      //   if (!subcmd) {
      //     session?.execute(
      //       `arc.recent ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : '1'
      //       }`
      //     )
      //   } else if (subcmd === 'bind') {
      //     session?.execute(
      //       `arc.bind ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : ''
      //       }`
      //     )
      //   } else if (subcmd === 'unbind') {
      //     session?.execute('arc.unbind')
      //   } else if (subcmd === 'b30' || subcmd === 'best30') {
      //     session?.execute(
      //       `arc.b30 ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : ''
      //       }`
      //     )
      //   } else if (subcmd === 'best') {
      //     session?.execute(
      //       `arc.best ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : ''
      //       }`
      //     )
      //   } else if (subcmd === 'recent') {
      //     session?.execute(
      //       `arc.recent ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : '1'
      //       }`
      //     )
      //   } else if (subcmd === 'info' || subcmd === 'rating') {
      //     session?.execute(
      //       `arc.info ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : ''
      //       }`
      //     )
      //   } else if (subcmd === 'random') {
      //     session?.execute(
      //       `arc.random ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : ''
      //       }`
      //     )
      //   } else if (subcmd === 'alias') {
      //     session?.execute(
      //       `arc.alias ${
      //         subcmdargs && subcmdargs.length >= 1 ? subcmdargs.join(' ') : ''
      //       }`
      //     )
      //   } else if (subcmd === 'recommend') {
      //     session?.execute('arc.recommend')
      //   } else {
      //     return (
      //       segment.quote(session?.messageId!) +
      //       `未知子指令: ${subcmd}\n请使用 /help arc 查看使用说明`
      //     )
      //   }
      // })

    commands.enableBind(rootCmd, ctx, logger, api)
    commands.enableUnbind(rootCmd, ctx, logger)
    commands.enableBest30(rootCmd, ctx, logger, api, officialApi)
    commands.enableBest(rootCmd, ctx, logger, api)
    commands.enableRecent(rootCmd, ctx, logger, api)
    commands.enableInfo(rootCmd, api)
    commands.enableConnect(rootCmd, api)
    commands.enableAlias(rootCmd, api)
    commands.enableRandom(rootCmd, api)
    commands.enableRecommend(rootCmd, ctx, api)
  },
}
