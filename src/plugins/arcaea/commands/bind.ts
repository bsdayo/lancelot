import { BotArcApiUserinfoV5, BotArcApiV5 } from 'botarcapi_lib'
import { Command, Context, Logger } from 'koishi'
import { reply } from '../../../utils'
import ArcaeaLimitedAPI from '../limitedapi'
import {
  convertALAUserInfoToBAA,
  formatPtt,
  getUserBinding,
  validateUsercode,
} from '../utils'

export function enableBind(
  rootCmd: Command,
  ctx: Context,
  logger: Logger,
  api: BotArcApiV5,
  officialApi: ArcaeaLimitedAPI
) {
  // 绑定ArcaeaID
  rootCmd
    .subcommand('.bind <usercode:string>', '绑定ArcaeaID')
    .usage('/arc bind <你的ArcaeaID>')
    .example('/arc bind 114514191')
    .action(async ({ session }, usercode: string | number) => {
      if (!usercode) return reply(session) + '请输入正确格式的名称或好友代码（9位数字，无空格）'

      if (usercode === 1 || usercode.toString() === 'Hikari')
        return (
          reply(session) + '绑定该用户需要理论 Fracture Ray [FTR]，请继续加油哦'
        )
      else if (usercode === 2 || usercode.toString() === 'Tairitsu')
        return (
          reply(session) +
          '绑定该用户需要理论 Grievous Lady [FTR]，请继续加油哦'
        )

      // 查询数据库中是否已有绑定信息
      const result = await getUserBinding(ctx, session!)
      if (result.length !== 0) {
        return (
          reply(session) +
          '数据库中已存在您的绑定信息！\n（可使用 /arc unbind 解绑）'
        )
      } else {
        let accountInfo: BotArcApiUserinfoV5

        try {
          if (Number.isInteger(usercode))
            accountInfo = (await api.user.info(usercode.toString(), false)).account_info
          else
            accountInfo = (await api.user.info(usercode.toString(), true)).account_info
        } catch (err1) {
          try {
            accountInfo = convertALAUserInfoToBAA(
              await officialApi.userinfo(usercode.toString())
            )
          } catch (err2) {
            return reply(session) + `发生错误，请检查好友码是否有误。\n(1) ${err1}\n(2) ${err2}`
          }
        }

        logger.info(
          `为用户 ${session?.platform}:${session?.userId} 绑定 ArcaeaID ${usercode}`
        )

        const rating =
          accountInfo.rating < 0 ? '?' : formatPtt(accountInfo.rating)
        await ctx.database.create('arcaeaid', {
          platform: session?.platform,
          userid: session?.userId,
          arcid: accountInfo.code,
          arcname: accountInfo.name,
        })
        return (
          reply(session) +
          `已为您绑定 Arcaea 账号 ${accountInfo.name} (${rating})`
        )
      }
    })
}
