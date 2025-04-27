import { Injectable, Logger } from "@nestjs/common"

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  getHello(): string {
    const data = ["aaa", "bbb", "ccc"]
    this.logger.debug("debug test", data)
    this.logger.log("log test", data)
    return "Hello World!"
  }
}
