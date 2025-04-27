import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { CalendarController } from "./api/calendar/calendar.controller"
import { CalendarModule } from "./api/calendar/calendar.module"
import { CalendarService } from "./api/calendar/calendar.service"
import { AuthModule } from "./auth/auth.module"
import { GoogleAuthController } from "./api/auth/google-auth.controller"
import { GoogleAuthService } from "./api/auth/google-auth.service"
import { UtilService } from "./util/util.service"
import { UtilModule } from "./util/util.module"

@Module({
  imports: [CalendarModule, AuthModule, UtilModule],
  controllers: [AppController, CalendarController, GoogleAuthController],
  providers: [AppService, CalendarService, GoogleAuthService, UtilService],
})
export class AppModule {}
