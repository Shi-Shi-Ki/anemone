import { Module } from "@nestjs/common"
import { CalendarService } from "./calendar.service"
import { UtilModule } from "@/util/util.module"

@Module({
  providers: [CalendarService],
  imports: [UtilModule],
})
export class CalendarModule {}
