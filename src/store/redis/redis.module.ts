import { Module } from "@nestjs/common"
import { RedisService } from "./redis.service"
import { UtilModule } from "@/util/util.module"

@Module({
  imports: [UtilModule],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
