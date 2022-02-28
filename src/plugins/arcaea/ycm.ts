import axios, { AxiosInstance, AxiosResponse } from 'axios'

interface YCMConfig {
  token: string
  timeout?: number
}

interface YCMCar {
  id: number
  room_id: string
  description: string
  data_from: string
  creator_id: string
  more_info: string
  add_time: number
}

type YCMCarType = 'arc'
type YCMStatusCode = 0 | 403 | 404 | 500 | 1001 | 1002 | 1003 | 1004 | 1005

export default class YCMAPI {
  private readonly axios: AxiosInstance
  private readonly token: string

  constructor(config: YCMConfig) {
    this.axios = axios.create({
      timeout: config.timeout,
      baseURL: 'https://ycm.chinosk6.cn',
    })
    this.token = config.token
  }

  public getCar(carType: YCMCarType) {
    return new Promise<{ code: YCMStatusCode; cars: YCMCar[] }>(
      (resolve, reject) => {
        this.axios({
          method: 'GET',
          url: '/get_car',
          params: {
            token: this.token,
            car_type: carType,
            time_limit: 1200,
          },
        })
          .then((response: AxiosResponse) => {
            resolve({
              code: response.data.code,
              cars: response.data.cars ?? [],
            })
          })
          .catch(reject)
      }
    )
  }

  public addCar(
    carType: YCMCarType,
    roomId: string,
    userId: string,
    description?: string
  ) {
    return new Promise<YCMCar | null>((resolve, reject) => {
      this.axios({
        method: 'GET',
        url: '/add_car',
        params: {
          token: this.token,
          car_type: carType,
          room_id: roomId,
          description: description ?? '',
          data_from: 'lancelot.bot',
          creator_id: userId,
        },
      })
        .then((response: AxiosResponse) => {
          if (response.data.code === 0) resolve(null)
          else if (response.data.code === 1004) resolve(response.data.car)
          else if (response.data.code === 1005)
            reject('您已经在2分钟内发过一次车了，请稍后重试')
          else reject(response.data.message ?? 'unknown error')
        })
        .catch(reject)
    })
  }
}
