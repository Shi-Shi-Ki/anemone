import { Injectable } from "@nestjs/common"
import { AppLoggerService } from "./log/app-logger.service"

@Injectable()
export class AppService {
  constructor(private readonly logger: AppLoggerService) {}

  getHello(): string {
    const data = ["aaa", "bbb", "ccc"]
    const obj = { id: 111, name: "test" }
    const datas = [
      { id: 101, name: "aaa" },
      { id: 102, name: "bbb" },
    ]
    this.logger.log("log test.", obj, data, datas)
    console.log("\n---\n")
    this.logger.debug("* debug log. obj:", obj, ", data:", data)
    console.log("\n---\n")
    this.logger.verbose("# verbose log test.", data)
    console.log("\n---\n")
    this.logger.log(obj)
    return "Hello World!"
  }
}
