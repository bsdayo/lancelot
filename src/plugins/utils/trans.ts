import { Context } from 'koishi'
import axios from 'axios'
import md5 from 'md5'
import { randomInt, reply } from '../../utils'

interface TransConfig {
  appid: string
  token: string
}

interface TransData {
  from: keyof typeof langs
  to: keyof typeof langs
  trans_result: Array<{
    src: string
    dst: string
  }>

  error_code?: string
  error_msg?: string
}

// langCode: [ langCode, zhName, ...aliases ]
const langs = {
  auto : [ 'auto', '自动', '自动检测' ],
  zh   : [ 'zh'  , '中文', '简中' ],
  en   : [ 'en'  , '英语', '英文' ],
  yue  : [ 'yue' , '粤语' ],
  wyw  : [ 'wyw' , '文言文' ],
  jp   : [ 'jp'  , '日语', '日文' ],
  kor  : [ 'kor' , '韩语', '韩文' ],
  fra  : [ 'fra' , '法语', '法文' ],
  spa  : [ 'spa' , '西班牙语' ],
  th   : [ 'th'  , '泰语' ],
  ara  : [ 'ara' , '阿拉伯语' ],
  ru   : [ 'ru'  , '俄语', '俄文' ],
  pt   : [ 'pt'  , '葡萄牙语' ],
  de   : [ 'de'  , '德语', '德文' ],
  it   : [ 'it'  , '意大利语' ],
  el   : [ 'el'  , '希腊语' ],
  nl   : [ 'nl'  , '荷兰语' ],
  pl   : [ 'pl'  , '波兰语' ],
  bul  : [ 'bul' , '保加利亚语' ],
  est  : [ 'est' , '爱沙尼亚语' ],
  dan  : [ 'dan' , '丹麦语' ],
  fin  : [ 'fin' , '芬兰语' ],
  cs   : [ 'cs'  , '捷克语' ],
  rom  : [ 'rom' , '罗马尼亚语' ],
  slo  : [ 'slo' , '斯洛文尼亚语' ],
  swe  : [ 'swe' , '瑞典语' ],
  hu   : [ 'hu'  , '匈牙利语' ],
  cht  : [ 'cht' , '繁体中文', '繁中' ],
  vie  : [ 'vie' , '越南语' ],
}

export default function enableTrans(ctx: Context, config: TransConfig) {
  ctx
    .command('trans <query>', '文本翻译')
    .alias('translate', 'fanyi')
    .shortcut('翻译', { fuzzy: true })
    .option('from', '-f <lang:string>')
    .option('to',   '-t <lang:string>')
    .action(async ({ session, options }, query?: string) => {
      if (!query)
        return reply(session) + '请输入需要翻译的文本'
          
      if (options?.from && !getLangCode(options?.from))
        return reply(session) + '不支持的源语言：'   + options?.from
      
      if (options?.to   && !getLangCode(options?.to))
        return reply(session) + '不支持的目标语言：' + options?.to
      
      query = query.toString()
      
      const salt = randomInt(0, 10000000000).toString().padStart(10, '0')
      const sign = md5(config.appid + query + salt + config.token)
      
      try {
        const resp = await axios({
          method: 'GET',
          url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
          params: {
            q     : query,
            from  : options?.from ? getLangCode(options?.from) : 'auto',
            to    : options?.to   ? getLangCode(options?.to)   : 'zh',
            appid : config.appid,
            salt,
            sign
          }
        })

        const data: TransData = resp.data

        if (data.error_code)
          switch (data.error_code) {
            case '52000':
              break
            case '52001':
              return reply(session) + 'API 请求超时。'
            case '52002':
              return reply(session) + '系统错误。'
            case '52003':
              return reply(session) + '用户未授权，请联系开发者。'
            case '54000':
              return reply(session) + '参数错误，请联系开发者。'
            case '54001':
              return reply(session) + '签名错误，请联系开发者。'
            case '54003':
              return reply(session) + 'API 调用频率达到限制，请稍后再试。'
            case '54004':
              return reply(session) + 'API 账户余额不足，请联系开发者。'
            case '54005':
              return reply(session) + '短时间内翻译长文本的频率过高，请稍后再试。'
            case '58000':
              return reply(session) + '请求源 IP 未在白名单内，请联系开发者。'
            case '58001':
              return reply(session) + '不支持的翻译语言方向。'
            case '58002':
              return reply(session) + '服务已关闭，请联系开发者。'
            case '90107':
              return reply(session) + 'API 认证失败，请联系开发者。'
          }

        return reply(session) +
          `翻译结果 [${getLangName(data.from)} > ${getLangName(data.to)}]\n` +
          data.trans_result[0].dst
      } catch (err) {
        return reply(session) +
          `发生错误：${err}`
      }
    })
}

function getLangCode(source: string): string | undefined {
  for (let lang of Object.values(langs)) {
    if (lang.includes(source))
      return lang[0]
  }
}

function getLangName(langCode: keyof typeof langs) {
  return langs[langCode][1]
}
