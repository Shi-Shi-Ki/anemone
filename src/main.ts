import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { config } from "dotenv"
import { expand } from "dotenv-expand"

async function bootstrap() {
  expand(config())
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.GOOGLE_REDIRECT_URI!, // 許可するオリジン
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 許可する HTTP メソッド
      credentials: true, // Cookie などの認証情報を許可する場合
    },
  })

  await app.listen(process.env.APP_PORT ?? 3000)
}
bootstrap()
