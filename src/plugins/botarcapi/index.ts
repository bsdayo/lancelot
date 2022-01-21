import { BotArcApiV5 } from 'botarcapi_lib'
import { getUserBinding, formatPtt } from './utils'
import { Context, segment } from 'koishi'

// 插件配置
export interface BotArcApiConfig {
  baseURL: string
  userAgent: string
  timeout: number
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

export default {
  name: 'botarcapi',
  apply(ctx: Context, config: BotArcApiConfig) {
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
    // 根命令
    const rootCmd = ctx
      .command('arc [subcmd] [...subcmdargs]')
      .alias('arcaea', 'a')
      .action(async ({ session }, subcmd: string, ...subcmdargs: string[]) => {
        if (!subcmd) {
          /* TODO 查询最近分数 */
          session?.execute(`arc -h`)
        } else if (subcmd === 'bind') {
          session?.execute(
            `arc.bind ${subcmdargs && subcmdargs[0] ? subcmdargs[0] : ''}`
          )
        } else if (subcmd === 'unbind') {
          session?.execute(`arc.unbind`)
        } else if (subcmd === 'b30') {
          session?.execute(
            `arc.b30 ${subcmdargs && subcmdargs[0] ? subcmdargs[0] : ''}`
          )
        } else {
          return (
            segment.quote(session?.messageId!) +
            `未知子指令: ${subcmd}\n请使用 /arc -h 查看使用说明`
          )
        }
      })

    // 绑定ArcaeaID
    rootCmd
      .subcommand('.bind <usercode>')
      .action(async ({ session }, usercode: string) => {
        if (!usercode)
          return segment.quote(session?.messageId!) + '请输入需要绑定的用户ID'
        // 查询数据库中是否已有绑定信息
        const result = await getUserBinding(ctx, session!)
        if (result.length !== 0) {
          return (
            segment.quote(session?.messageId!) + '数据库中已存在您的绑定信息！'
          )
        } else {
          logger.info(
            `为用户 ${session?.platform}:${session?.userId} 绑定 ArcaeaID ${usercode}`
          )
          const accountInfo = (await api.user.info(usercode)).account_info
          const rating = formatPtt(accountInfo.rating)
          await ctx.database.create('arcaeaid', {
            platform: session?.platform,
            userid: session?.userId,
            arcid: usercode,
            arcname: accountInfo.name,
          })
          return (
            segment.quote(session?.messageId!) +
            `已为您绑定 Arcaea 账号 ${accountInfo.name}(${rating})`
          )
        }
      })

    // 取消绑定ArcaeaID
    rootCmd.subcommand('.unbind').action(async ({ session }) => {
      // 查询数据库中是否已有绑定信息
      const result = await getUserBinding(ctx, session!)
      if (result.length !== 0) {
        logger.info(
          `为用户 ${session?.platform}:${session?.userId} 取消绑定 ArcaeaID`
        )
        await ctx.database.remove('arcaeaid', {
          platform: session?.platform,
          userid: session?.userId,
        })
        return (
          segment.quote(session?.messageId!) +
          `已为您取消绑定 Arcaea 账号 ${result[0].arcname}`
        )
      } else {
        return (
          segment.quote(session?.messageId!) +
          `数据库中没有您的绑定信息，请使用 /arc bind <你的ArcaeaID> 绑定你的账号`
        )
      }
    })

    // Best30查询
    rootCmd
      .subcommand('.b30 [usercode]')
      .shortcut('查b30')
      .action(async ({ session }, usercode: string) => {
        const arcObj = { id: usercode, name: '' } // 用对象包装一层确保值可以被内层代码块覆盖
        if (!usercode) {
          // 若没有输入 usercode 参数
          const result = await getUserBinding(ctx, session!)
          if (result.length !== 0) {
            // 若查询到绑定数据
            arcObj.id = result[0].arcid
            arcObj.name = result[0].arcname
          } else
            return (
              segment.quote(session?.messageId!) +
              `请使用 /arc bind <你的ArcaeaID> 绑定你的账号，或在命令后接需要查询用户的ID\n（更多信息请使用 /arc b30 -h 查看）`
            )
        }
        logger.info(
          `正在查询用户 ${arcObj.name}[${arcObj.id}] 的 Best30 成绩...`
        )
        session?.send(
          `正在查询用户 ${arcObj.name}[${arcObj.id}] 的 Best30 成绩...`
        )
        try {
          const best30 = await api.user.best30(arcObj.id)
          logger.success(
            `用户 ${arcObj.name}[${arcObj.id}] 的 Best30 成绩查询成功`
          )
          let b30Text =
            `${best30.account_info.name} (${formatPtt(best30.account_info.rating)})\n` +
            `Best30 均值: ${best30.best30_avg.toFixed(2)}\n` +
            `Recent10 均值: ${best30.recent10_avg.toFixed(2)}`
          
          return segment.quote(session?.messageId!) + b30Text
        } catch (err) {
          logger.error(
            `用户 ${arcObj.name}[${arcObj.id}] 的 Best30 成绩查询失败：${err}`
          )
          session?.send(`发生错误：${(err as Error).message}`)
        }
      })
  },
}
