import { Controller, Post, Body } from "@nestjs/common"
import { GoogleAuthService } from "./google-auth.service"

/**
 * Googleの認証トークンを取得
 */
@Controller("api/google-auth")
export class GoogleAuthController {
  constructor(private googleAuthService: GoogleAuthService) {}
  @Post("auth")
  async auth(@Body("code") code: string): Promise<void> {
    //todo
    console.log(`* call api/google-auth/auth code: ${code}`)
    this.googleAuthService.getToken(code)
  }
}
