import { RedisService } from "@/store/redis/redis.service"
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"

@Injectable()
export class ReservationService implements OnModuleInit, OnModuleDestroy {
  private cancellationCheckInterval = 60000
  private cancellationCheckJobName = "bookingCancellationCheck"

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.startCancellationCheckJob()
  }
  onModuleDestroy() {
    this.stopCancellationCheckJob()
  }

  async createBooking() {
    this.redisService.setByKey("hoge_hoge", "fuga_fuga", 30)
  }

  private async startCancellationCheckJob() {
    console.log("*** startCancellationCheckJob")
    // this.redisService.doSubscribing(
    //   ["__keyevent@0__:expired"],
    //   (err, count) => {
    //     if (err) {
    //       console.error("%%% Failed to subscribe to expired events:", err)
    //     } else {
    //       console.log(`%%% Subscribed to ${count} channels for expired events.`)
    //     }
    //   },
    //   "message",
    //   (channel, message) => {
    //     if (channel === "__keyevent@0__:expired") {
    //       console.log(`%%% Key ${message} has expired.`)
    //       this.handleExpiredKey(message)
    //     }
    //   }
    // )
    const subscriberClient = this.redisService.getSubscriberClient()

    this.redisService.checkNotifyConfig()

    subscriberClient.subscribe("__keyevent@0__:expired", (err, count) => {
      if (err) {
        console.error("%%% Failed to subscribe to expired events:", err)
      } else {
        console.log(`%%% Subscribed to ${count} channels for expired events.`)
      }
    })
    subscriberClient.subscribe("__keyevent@0__:set", (err, count) => {
      if (err) {
        console.error("%%% Failed to subscribe to set events:", err)
      } else {
        console.log(`%%% Subscribed to ${count} channels for set events.`)
      }
    })
    subscriberClient.subscribe("__keyevent@0__:hset", (err, count) => {
      if (err) {
        console.error("%%% Failed to subscribe to hset events:", err)
      } else {
        console.log(`%%% Subscribed to ${count} channels for hset events.`)
      }
    })
    subscriberClient.subscribe("__keyevent@0__:del", (err, count) => {
      if (err) {
        console.error("%%% Failed to subscribe to del events:", err)
      } else {
        console.log(`%%% Subscribed to ${count} channels for del events.`)
      }
    })
    subscriberClient.subscribe("__keyevent@0__:hdel", (err, count) => {
      if (err) {
        console.error("%%% Failed to subscribe to hdel events:", err)
      } else {
        console.log(`%%% Subscribed to ${count} channels for hdel events.`)
      }
    })

    subscriberClient.on("message", async (channel, message) => {
      if (channel === "__keyevent@0__:expired") {
        console.log(`%%% Key ${message} has expired.`)
        this.handleExpiredKey(message)
      }
      if (channel === "__keyevent@0__:set") {
        const data = await this.redisService.getByKey(message)
        console.log(`%%% Key ${message} set data.`, data)
      }
      if (channel === "__keyevent@0__:del") {
        console.log(`%%% Key ${message} del data.`)
      }
      if (channel === "__keyevent@0__:hset") {
        console.log(`%%% Key ${message} hset data.`)
      }
      if (channel === "__keyevent@0__:hdel") {
        console.log(`%%% Key ${message} hdel data.`)
      }
    })
    console.log("キーのリスナーを開始しました。")
  }

  private stopCancellationCheckJob() {
    console.log("*** stopCancellationCheckJob")
    this.redisService.unSubscribe(["__keyevent@0__:expired", "__keyevent@0__:set"])
  }

  private async handleExpiredKey(expiredKey: string) {
    console.log("*** handleExpiredKey - expiredKey", expiredKey)
  }
}
