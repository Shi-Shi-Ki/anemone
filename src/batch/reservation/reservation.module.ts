import { Module } from "@nestjs/common"
import { ReservationController } from "./reservation.controller"
import { RedisModule } from "@/store/redis/redis.module"
import { ReservationService } from "./reservation.service"

@Module({
  imports: [RedisModule],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
