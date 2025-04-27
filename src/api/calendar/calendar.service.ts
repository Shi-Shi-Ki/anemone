import { Injectable } from "@nestjs/common"

@Injectable()
export class CalendarService {
  getById() {
    return {
      id: 123,
      name: "test",
    }
  }
}
