import { Context, segment } from 'koishi'
import { getAssetFilePath, randomInt, reply } from '../../utils'
import fs from 'fs/promises'
import getRandomReply from './replies'

interface PokeRecordTable {
  id: number
  userId: string
  targetId: string
  pokeTimes: number
  recorder: string
}

declare module 'koishi' {
  interface Tables {
    poke: PokeRecordTable
  }
}

interface UserPokeStatus {
  userId: string
  guildId: string
  lastPoke: number // Timestamp
  pokeTimes: number
  status: 1 | 2 | 3 | 4 | 5 | 6 // 已经戳的次数
  // 1: 正常随机回复
  // 2: 正常随机回复
  // 3: 警告咬人！
  // 4: 咬人！（表情包）
  // 5: 不理你了！
  // 6: 停止两分钟戳一戳回复
}

const pokeStatus: UserPokeStatus[] = []
let totalPokeTimes = 0
const pokeReplies = ['戳你！', '戳戳！']

export default {
  name: 'poke',
  apply(ctx: Context) {
    ctx.model.extend(
      'poke',
      {
        id: 'integer',
        userId: 'text',
        targetId: 'text',
        pokeTimes: 'integer',
        recorder: 'text'
      },
    )

    ctx.on('notice/poke', async (session) => {
      // await ctx.database.upsert('poke', [{}])
      if (!session.channelId || session.targetId !== session.selfId) return

      totalPokeTimes++

      const userStatus = pokeStatus.find((user) => {
        return (
          user.userId === session.userId && user.guildId === session.guildId
        )
      })

      if (!userStatus) {
        // 若不存在用户记录则创建
        pokeStatus.push({
          userId: session.userId!,
          guildId: session.guildId!,
          lastPoke: Date.now(),
          pokeTimes: 1,
          status: 1,
        })
        return await session.send(await getRandomReply())
      } else {
        userStatus.pokeTimes++
        if (Date.now() - userStatus.lastPoke > 120000) {
          // 若距离上次戳的时间大于 2 分钟则重置状态
          userStatus.lastPoke = Date.now()
          userStatus.status = 1
          return await session.send(await getRandomReply())
        } else {
          // 若已戳完五次则不理会
          if (userStatus.status === 6) return

          userStatus.lastPoke = Date.now()
          userStatus.status++

          switch (userStatus.status) {
            case 1: // 随机回复
            case 2:
              return await session.send(await getRandomReply())
            case 3: // 警告咬人
              return await session.send('呜呜...再戳...再戳我就咬你！')
            case 4: // 发送咬人表情
              return await session.send(segment.image(await fs.readFile(getAssetFilePath('poke', 'bite.jpg'))))
            case 5: // 发送两分钟不理
              return await session.send('哼！两分钟不想再理你啦！')
          }
        }
      }
    })

    const rootCmd = ctx
      .platform('onebot')
      .command('poke', '戳一戳！')
      .action(async ({ session }, subcmd?: string) => {
        if (subcmd) return session?.execute('poke.' + subcmd)
        const userStatus = pokeStatus.find((user) => {
          return (
            user.userId === session?.userId && user.guildId === session?.guildId
          )
        })
        if (userStatus && Date.now() - userStatus.lastPoke > 120000) {
          // 若距离上次戳的时间大于 2 分钟则重置状态
          userStatus.lastPoke = Date.now()
          userStatus.status = 1
        }

        if (userStatus && userStatus.status === 6) return '哼！'
        else {
          await session?.send(segment('poke', { qq: session?.userId! }))
          return pokeReplies[randomInt(0, pokeReplies.length - 1)]
        }
      })

    rootCmd
      .subcommand('.info', '获取戳一戳信息')
      .shortcut('本群戳一戳信息')
      .shortcut('戳一戳信息')
      .action(({ session }) => {
        const guildStatus = pokeStatus
          .filter((user) => {
            return user.guildId === session?.guildId
          })
          .sort((a, b) => {
            return b.pokeTimes - a.pokeTimes
          })
        const userStatusIndex = guildStatus.findIndex((user) => {
          return user.userId === session?.userId
        })
        const userStatus = userStatusIndex === -1 ? null : guildStatus[userStatusIndex]

        let guildPokeSum = 0
        for (let user of guildStatus) {
          guildPokeSum += user.pokeTimes
        }

        const percent = guildPokeSum / totalPokeTimes * 100
        let str = '自从上次重启以来，'
        if (Number.isNaN(percent)) str += '还没有人戳过我！'
        else str += `本群有${guildStatus.length}人戳了我共${guildPokeSum}次，占全局总数的${percent.toFixed(1)}%！`
        if (userStatus) str += `其中你戳了我${userStatus.pokeTimes}次，是本群的第${userStatusIndex + 1}名！`
        if (userStatusIndex === 0) str += '\n这么会戳快去玩Cytus！qwq'

        return reply(session) + str
      })
  },
}
