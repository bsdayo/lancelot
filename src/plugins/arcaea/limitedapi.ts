import axios, { AxiosInstance, AxiosResponse } from 'axios'

interface ArcaeaLimitedAPIConfig {
  token: string
  timeout?: number
}

export interface ArcaeaLimitedAPIScore {
  song_id: string
  difficulty: 0 | 1 | 2 | 3
  score: number
  shiny_pure_count: number
  pure_count: number
  far_count: number
  lost_count: number
  recollection_rate: number
  time_played: number
  gauge_type: number
  potential_value: number
}

export interface ArcaeaLimitedAPIUserInfo {
  display_name: string
  potential: number | null
  partner: {
    partner_id: number
    is_awakened: boolean
  }
  last_played_song: {
    song_id: string
    difficulty: 0 | 1 | 2 | 3
    score: number
    shiny_pure_count: number
    pure_count: number
    far_count: number
    lost_count: number
    recollection_rate: number
    time_played: number
    gauge_type: number
  }
}

export default class ArcaeaLimitedAPI {
  private readonly axios: AxiosInstance

  public constructor(config: ArcaeaLimitedAPIConfig) {
    this.axios = axios.create({
      headers: { Authorization: 'Bearer ' + config.token },
      timeout: config.timeout,
      baseURL: 'https://arcaea-limitedapi.lowiro.com/api/v0',
    })
  }

  public best30(usercode: string) {
    return new Promise<ArcaeaLimitedAPIScore[]>((resolve, reject) => {
      this.axios({
        method: 'GET',
        url: `/user/${usercode}/best`,
      })
        .then((response: AxiosResponse) => {
          if (!response.data.data)
            reject(response.data.message ?? 'unknown error')
          else resolve(response.data.data as ArcaeaLimitedAPIScore[])
        })
        .catch(reject)
    })
  }

  public userinfo(usercode: string) {
    return new Promise<ArcaeaLimitedAPIUserInfo>((resolve, reject) => {
      this.axios({
        method: 'GET',
        url: `/user/${usercode}`,
      })
        .then((response: AxiosResponse) => {
          if (!response.data.data)
            reject(response.data.message ?? 'unknown error')
          else resolve(response.data.data as ArcaeaLimitedAPIUserInfo)
        })
        .catch(reject)
    })
  }
}
