import { Context, Session } from 'koishi'

export async function getUserBinding(ctx: Context, session: Session) {
  return await ctx.database.get('arcaeaid', {
    platform: session?.platform,
    userid: session?.userId,
  })
}

export function formatPtt(rating: number) {
  return (rating / 100).toFixed(2)
}
