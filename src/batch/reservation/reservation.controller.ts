import { Controller, Get } from "@nestjs/common"
import { ReservationService } from "./reservation.service"

@Controller("reservation")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}
  @Get()
  async start() {
    await this.reservationService.createBooking()
  }
}
