import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { CalendarModule } from "./api/calendar/calendar.module"
import { AuthModule } from "./auth/auth.module"
import { UtilModule } from "./util/util.module"
import { RedisModule } from "./store/redis/redis.module"
import { ReservationModule } from './batch/reservation/reservation.module';

@Module({
  imports: [CalendarModule, AuthModule, UtilModule, RedisModule, ReservationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
