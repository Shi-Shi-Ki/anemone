import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { config } from "dotenv"
import { expand } from "dotenv-expand"
import { AppLoggerService } from "../src/log/app-logger.service"
import { ConfigService } from "@nestjs/config"

async function bootstrap() {
  expand(config())
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.GOOGLE_REDIRECT_URI!, // 許可するオリジン
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 許可する HTTP メソッド
      credentials: true, // Cookie などの認証情報を許可する場合
    },
  })
  const configService = app.get(ConfigService)
  const customLogger = app.get(AppLoggerService)
  app.useLogger(customLogger)

  await app.listen(process.env.APP_PORT ?? 3000)
}
bootstrap()
