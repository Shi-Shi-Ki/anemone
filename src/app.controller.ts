import { Body, Controller, Get, Post } from "@nestjs/common"
import { AppService } from "./app.service"
import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Post("/auth")
  async getAuthCode(@Body("code") code: string) {
    console.log("*** code", code)
    const clientId = process.env.GOOGLE_CLIENT_ID // 環境変数に Google クライアント ID を設定
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET // 環境変数に Google クライアント シークレットを設定
    const redirectUri = process.env.GOOGLE_REDIRECT_URI // 環境変数に Google リダイレクト URI を設定

    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri)

    try {
      const { tokens } = await oAuth2Client.getToken(code)
      console.log("*** tokens", tokens)
      return tokens
    } catch (error) {
      console.error("Error exchanging authorization code for tokens:", error)
      throw error
    }
  }
}
