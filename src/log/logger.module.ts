import { Module, Scope } from "@nestjs/common"
import { AppLoggerService } from "./app-logger.service"
import { INQUIRER } from "@nestjs/core"

@Module({
  providers: [
    {
      provide: AppLoggerService,
      scope: Scope.TRANSIENT,
      useFactory: (inquirer: any) => {
        const className = inquirer?.constructor?.name || "UnknownContext"
        return new AppLoggerService(className)
      },
      inject: [INQUIRER],
    },
  ],
  exports: [AppLoggerService],
})
export class LoggerModule {}
