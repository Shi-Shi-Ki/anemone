import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common"
import { CalendarService } from "./calendar.service"
import { GoogleAuthGuard } from "@/auth/google-auth/google-auth.guard"
import { UtilService } from "@/util/util.service"

/**
 * GoogleCalendarAPIを経由して様々な情報を取得/更新
 */
@Controller("api/calendar")
@UseGuards(GoogleAuthGuard)
export class CalendarController {
  constructor(
    private readonly util: UtilService,
    private readonly calendarService: CalendarService
  ) {}

  // calendar/[id]
  @Get(":id")
  getById(@Param("id") id: string) {
    console.log("id", id)
    return this.calendarService.getById()
  }
}
