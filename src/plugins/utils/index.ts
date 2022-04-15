import { Context } from 'koishi'
import enableChoose from './choose'
import enableMainbot from './mainbot'
import enableRandom from './random'
import enableTrans, { TransConfig } from './trans'

interface UtilsConfig {
  trans: TransConfig
}

export default {
  name: 'utils',
  apply(ctx: Context, config: UtilsConfig) {
    enableMainbot(ctx)
    enableChoose(ctx)
    enableRandom(ctx)
    enableTrans(ctx, config.trans)
  },
}
