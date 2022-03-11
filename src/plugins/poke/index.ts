import { Context, segment } from 'koishi'
import { getAssetFilePath, randomInt } from '../../utils'
import fs from 'fs/promises'

const imgCount = 12
const gifIndexes = [5, 6]

export default {
  name: 'poke',
  apply(ctx: Context) {
    ctx.on('notice/poke', async (session) => {
      if (!session.channelId || session.targetId !== session.selfId) return
      const randomPokeBack = Math.random()
      if (randomPokeBack < 0.3) {
        return await session.send(segment('poke', { qq: session.userId! }))
      } else {
        const random = randomInt(1, imgCount)
        const imgPath = getAssetFilePath(
          'poke',
          `${random}.${gifIndexes.indexOf(random) !== -1 ? 'gif' : 'jpg'}`
        )
        return await session.send(segment.image(await fs.readFile(imgPath)))
      }
    })
  },
}
