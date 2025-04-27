import { UtilService } from "@/util/util.service"
import { Injectable } from "@nestjs/common"
import RedisClient from "ioredis"

/**
 * キー削除時のハンドリングを行う場合は、必ずnotify-keyspace-eventsに"Ex"フラグをつけること
 * ~~
 * > CONFIG SET notify-keyspace-events Ex
 * OK
 * ...
 * > CONFIG GET notify-keyspace-events
 * "notify-keyspace-events"
 * "xE"
 *
 * キーの作成/更新のハンドリングもしたい場合は以下の設定をする
 * ~~
 * > CONFIG SET notify-keyspace-events AKE
 * OK
 * ...
 * > CONFIG GET notify-keyspace-events
 * 1) "notify-keyspace-events"
 * 2) "AKE"
 */
@Injectable()
export class RedisService {
  private client: RedisClient
  private clientForSub: RedisClient
  constructor(private readonly util: UtilService) {
    this.client = new RedisClient(
      Number(this.util.getEnvValueOrFail(process.env.REDIS_PORT)),
      this.util.getEnvValueOrFail(process.env.REDIS_HOST)
    )
    this.clientForSub = new RedisClient(
      Number(this.util.getEnvValueOrFail(process.env.REDIS_PORT)),
      this.util.getEnvValueOrFail(process.env.REDIS_HOST)
    )
  }

  getSubscriberClient(): RedisClient {
    return this.clientForSub
  }

  async setByKey(key: string, value: string, ttl: number) {
    return await this.client.set(key, value, "EX", ttl)
  }

  async getByKey(key: string) {
    return await this.client.get(key)
  }

  async delByKey(key: string) {
    return await this.client.del(key)
  }

  doPublishing(channelName: string, message: string) {
    this.clientForSub.publish(channelName, message)
  }

  doSubscribing(
    channelNames: string[],
    subscribeHandler: (err: Error, count: number) => void,
    eventName: string,
    listener: (channel: string, message: string) => void
  ) {
    this.clientForSub.subscribe(...channelNames, subscribeHandler)

    this.clientForSub.on(eventName, listener)
  }

  async unSubscribe(channelNames: string[]) {
    await this.clientForSub.unsubscribe(...channelNames)
  }

  async checkNotifyConfig() {
    await this.client.config("GET", "notify-keyspace-events", (err, res) => {
      if (err) {
        console.error("config get error!", err)
        throw new Error()
      }
      console.log(res)
    })
  }
}
