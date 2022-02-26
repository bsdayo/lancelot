import { Command, Context, Logger, segment } from 'koishi'
import { generateBest30Image, generateSimpleBest30Image } from '../image'
import {
  convertALAScoreToBAA,
  convertALAUserInfoToBAA,
  getSongInfoFromDatabase,
  getUserBinding,
  validateUsercode,
} from '../utils'
import fs from 'fs/promises'
import {
  BotArcApiScore,
  BotArcApiSonginfoV5,
  BotArcApiUserbest30,
  BotArcApiUserinfoV5,
  BotArcApiV5,
} from 'botarcapi_lib'
import ArcaeaLimitedAPI from '../limitedapi'

export function enableBest30(
  rootCmd: Command,
  ctx: Context,
  logger: Logger,
  api: BotArcApiV5,
  officialApi: ArcaeaLimitedAPI
) {
  // Best30查询
  rootCmd
    .subcommand('.b30 [usercode:string]', '查询用户Best30成绩')
    .option('simple', '-s')
    .option('official', '-o')
    .shortcut('查b30', { fuzzy: true })
    .alias('b30')
    .usage('/arc b30 [要查询的ArcaeaID]')
    .example('/arc b30 114514191')
    .example('查b30 191981011')
    .action(async ({ session, options }, usercode: string) => {
      if (usercode && validateUsercode(usercode)) usercode = usercode.toString().padStart(9, '0')

      if (usercode === '000000001')
        return (
          segment.quote(session?.messageId!) +
          '查询该用户需要理论 Fracture Ray [FTR]，请继续加油哦'
        )
      if (usercode === '000000002')
        return (
          segment.quote(session?.messageId!) +
          '查询该用户需要理论 Grievous Lady [FTR]，请继续加油哦'
        )

      console.log(JSON.stringify(options))
      const arcObj = { id: usercode, name: '' } // 用对象包装一层确保值可以被内层代码块覆盖

      if (!arcObj.id) {
        // 若没有输入 usercode 参数
        const result = await getUserBinding(ctx, session!)
        if (result.length !== 0) {
          // 若查询到绑定数据
          arcObj.id = result[0].arcid
          arcObj.name = result[0].arcname
        } else
          return (
            segment.quote(session?.messageId!) +
            `请使用 /arc bind <你的ArcaeaID> 绑定你的账号，或在命令后接需要查询用户的ID\n（更多信息请使用 /help arc.b30 查看）`
          )
      }
      logger.info(
        `正在${options?.official ? '使用 LimitedAPI ' : ''}查询${
          arcObj.name ? ' ' + arcObj.name : ''
        } [${arcObj.id}] 的 Best30 成绩`
      )
      await session?.send(
        `正在${options?.official ? '使用官方 LimitedAPI ' : ''}查询${
          arcObj.name ? ' ' + arcObj.name + ' ' : ''
        }的 Best30 成绩...`
      )
      try {
        let best30Data: BotArcApiUserbest30 & {
          account_info: BotArcApiUserinfoV5
          best30_songinfo: BotArcApiSonginfoV5[]
          best30_overflow_songinfo: BotArcApiSonginfoV5[]
        }

        if (options?.official) {
          const best30 = await officialApi.best30(arcObj.id)
          const best30UserInfo = convertALAUserInfoToBAA(
            await officialApi.userinfo(arcObj.id)
          )
          let best30Score: BotArcApiScore[] = []
          let best30SongInfo: BotArcApiSonginfoV5[] = []
          let best30Ptt = 0
          for (let score of best30) {
            best30Score.push(convertALAScoreToBAA(score))
            best30SongInfo.push(getSongInfoFromDatabase(score.song_id))
            best30Ptt += score.potential_value
          }
          const best30Avg = best30Ptt / 30
          const recent10Avg =
            ((best30UserInfo.rating / 100) * 40 - best30Ptt) / 10

          best30Data = {
            best30_avg: best30Avg,
            recent10_avg: recent10Avg,
            best30_list: best30Score,
            best30_overflow: [],
            best30_songinfo: best30SongInfo,
            account_info: best30UserInfo,
            best30_overflow_songinfo: [],
          }
        } else {
          best30Data = await api.user.best30(arcObj.id, false, true, 9)
        }

        logger.success(
          `用户 ${arcObj.name} [${arcObj.id}] 的 Best30 成绩查询成功`
        )
        logger.info(
          `正在为用户 ${arcObj.name} [${arcObj.id}] 生成 Best30 图片...`
        )
        const imgPath = options?.simple
          ? await generateSimpleBest30Image(best30Data)
          : await generateBest30Image(best30Data, options?.official)
        logger.success(
          `用户 ${arcObj.name} [${arcObj.id}] 的 Best30 图片生成成功，文件为 ${imgPath}`
        )

        return (
          segment.quote(session?.messageId!) +
          segment.image(await fs.readFile(imgPath))
        )
      } catch (err) {
        logger.error(
          `用户 ${session?.platform}:${arcObj.name} [${arcObj.id}] 的 Best30 成绩查询失败：${err}`
        )
        return `发生错误：${err}`
      }
    })
}
