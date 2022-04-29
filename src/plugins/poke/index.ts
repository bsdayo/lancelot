import { Context, segment } from 'koishi'
import { getAssetFilePath, randomInt, reply } from '../../utils'
import fs from 'fs/promises'
import getRandomReply from './replies'
import { botdb } from '../../bot'

interface PokeRecordTable {
  id: number
  userId: string
  targetId: string
  guildId: string
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
        guildId: 'text',
        pokeTimes: 'integer',
        recorder: 'text'
      },
      { autoInc: true }
      )

    ctx.on('notice/poke', async (session) => {
      // 不在群内则不记录
      if (!session.channelId) return

      // ===== 数据库记录 =====

      // 获取所有符合条件的记录
      const allRecords = botdb
        .prepare('SELECT * FROM poke WHERE userId = ? AND targetId = ? AND guildId = ?')
        .all(session.userId, session.targetId, session.guildId)

      const times: number[] = []
      
      // 检查是否有记录者为自身的记录，若没有则新建
      const prevRecord = allRecords.find((rec) => rec.recorder === session.selfId)
      if (prevRecord) {
        // 若存在记录者，获取所有记录者的最高次数并更新
        for (let rec of allRecords) {
          times.push(rec.pokeTimes)
        }
      } else {
        botdb
          .prepare('INSERT INTO poke (userId, targetId, guildId, recorder, pokeTimes) VALUES (?, ?, ?, ?, 1)')
          .run(session.userId, session.targetId, session.guildId, session?.selfId)
        times.push(0)
      }

      botdb
        .prepare('UPDATE poke SET pokeTimes = ? WHERE userId = ? AND targetId = ? AND guildId = ?')
        .run(
          // 坑：Math.max() === -Infinity
          times.length > 0 ? Math.max(...times) + 1 : 1,
            session.userId, session.targetId, session.guildId
          )

      // ===== 内存记录 =====
      
      // 戳的不是自己则不记录
      if (session.targetId !== session.selfId) return

      totalPokeTimes++

      const userStatus = pokeStatus.find((user) => {
        return user.userId === session.userId && user.guildId === session.guildId
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
          return user.userId === session?.userId && user.guildId === session?.guildId
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
      .shortcut('群内戳一戳信息')
      .shortcut('戳一戳信息')
      .action(({ session }) => {
        const guildStatus = pokeStatus
          .filter((user) => user.guildId === session?.guildId)
          .sort((a, b) => b.pokeTimes - a.pokeTimes)
        const userStatusIndex = guildStatus.findIndex((user) => {
          return user.userId === session?.userId
        })
        const userStatus = userStatusIndex === -1 ? null : guildStatus[userStatusIndex]

        let guildPokeSum = 0
        for (let user of guildStatus) guildPokeSum += user.pokeTimes

        const percent = guildPokeSum / totalPokeTimes * 100
        let str = '自从上次重启以来，'
        if (Number.isNaN(percent)) str += '还没有人戳过我！'
        else str += `本群有${guildStatus.length}人戳了我共${guildPokeSum}次，占全局总数的${percent.toFixed(1)}%！`
        if (userStatus) str += `其中你戳了我${userStatus.pokeTimes}次，是本群的第${userStatusIndex + 1}名！`
        if (userStatusIndex === 0) str += '\n这么会戳快去玩Cytus！qwq'

        return reply(session) + str
      })

    rootCmd
      .subcommand('.record', '查看自己戳一戳记录')
      .shortcut('本群戳一戳记录')
      .shortcut('群内戳一戳记录')
      .shortcut('戳一戳记录')
      .action(async ({ session }) => {
        const activeRecords: PokeRecordTable[] = botdb
          .prepare('SELECT * FROM poke WHERE userId = ? AND guildId = ?')
          .all(session?.userId, session?.guildId)
          .sort((recA, recB) => recB.pokeTimes - recA.pokeTimes)
        const passiveRecords: PokeRecordTable[] = botdb
          .prepare('SELECT * FROM poke WHERE targetId = ? AND guildId = ?')
          .all(session?.userId, session?.guildId)
          .sort((recA, recB) => recB.pokeTimes - recA.pokeTimes)
        const pokeselfRecords: PokeRecordTable[] = botdb
          .prepare('SELECT * FROM poke WHERE userId = targetId AND guildId = ?')
          .all(session?.guildId)
          .sort((recA, recB) => recB.pokeTimes - recA.pokeTimes)
        const pokebotRecords: PokeRecordTable = botdb
          .prepare('SELECT * FROM poke WHERE userId = ? AND targetId = ? AND guildId = ?')
          .get(session?.userId, session?.selfId, session?.guildId)

        let str = ''

        if (activeRecords.length === 0) str += '你在群里还没有戳过人！'
        else {
          const targetUser = await session?.onebot?.getGroupMemberInfo(activeRecords[0].guildId, activeRecords[0].targetId)
          str += '你在群里最喜欢戳' + (targetUser?.card || targetUser?.nickname) + '，' +
                  '一共戳了Ta ' + activeRecords[0].pokeTimes + '次。'
        }

        if (passiveRecords.length === 0) str += '\n群里还没有人戳过你！'
        else {
          const sourceUser = await session?.onebot?.getGroupMemberInfo(passiveRecords[0].guildId, passiveRecords[0].userId)
          str += '\n群里' + (sourceUser?.card || sourceUser?.nickname) + '最喜欢戳你，' +
                  '一共戳了你' + passiveRecords[0].pokeTimes + '次。'
        }

        if (pokeselfRecords.length === 0) str += ''
        else {
          const pokeselfUser = await session?.onebot?.getGroupMemberInfo(pokeselfRecords[0].guildId, pokeselfRecords[0].userId)
          str += '\n群里' + (pokeselfUser?.card || pokeselfUser?.nickname) + 
                  '有够无聊的，闲着没事戳了自己' + pokeselfRecords[0].pokeTimes + '次！'
        }

        str += pokebotRecords
          ? '\n你在群里一共戳了我' + pokebotRecords.pokeTimes + '次，哼哼！'
          : ''

        return reply(session) + str
      })
  },
}
