import { Context } from 'koishi'
import enableChoose from './choose'
import enableMainbot from './mainbot'

export default {
  name: 'utils',
  apply(ctx: Context) {
    enableMainbot(ctx)
    enableChoose(ctx)
  },
}
