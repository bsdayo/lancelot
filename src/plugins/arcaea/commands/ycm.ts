import { Command, segment } from 'koishi'
import { getPastMinutes } from '../../../utils'
import YCMAPI from '../ycm'

export function enableYCM(rootCmd: Command, ycmApi: YCMAPI) {
  rootCmd
    .subcommand('.ycm [roomId] [description]', '查询/添加 Link Play 车车')
    .shortcut('有车嘛')
    .shortcut('有车吗')
    .alias('ycm')
    .usage('/arc ycm [房间号] [描述]')
    .example('/arc ycm 6Ec2P9 红框休闲车')
    .example('有车吗')
    .action(
      async (
        { session },
        roomId: string | undefined,
        description: string | undefined
      ) => {
        try {
          if (roomId) {
            roomId = roomId.toString()
            if (roomId.length !== 6)
              return (
                (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) +
                '请输入正确的Link Play房间号！'
              )
            const ycmResp = await ycmApi.addCar(
              'arc',
              roomId,
              session?.userId!,
              description
            )
            if (ycmResp) {
              return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + '该车车已存在！'
            } else {
              return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + '发车成功！'
            }
          } else {
            // 没有发送 roomId 参数
            const ycmResp = await ycmApi.getCar('arc')
            if (ycmResp.cars.length === 0)
              return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + 'myc'
            else {
              let str = '找到的车车：'
              for (let car of ycmResp.cars) {
                str += `\n${car.room_id} ${car.description} ${getPastMinutes(
                  car.add_time
                )}分钟前`
              }
              return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + str
            }
          }
        } catch (e) {
          if ((e as Error).toString() === 'invalid room_id') {
            return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + `房间号格式错误！`
          }
          return (session?.platform === 'qqguild'
              ? segment.at(session?.userId!)
              : segment.quote(session?.messageId!)) + `${e}`
        }
      }
    )
}
