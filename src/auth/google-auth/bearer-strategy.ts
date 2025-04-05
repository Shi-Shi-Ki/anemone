import { Injectable, UnauthorizedException } from "@nestjs/common"
import { Strategy } from "passport-http-bearer"
import { PassportStrategy } from "@nestjs/passport"
import { GoogleAuthValidationService } from "./google-auth-validation.service"

/**
 * リクエストされたtokenの検証
 */
@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly googleAuthValidationService: GoogleAuthValidationService) {
    console.log("# BearerStrategy constructor")
    super()
  }

  // HTTP Bearerストラテジ(passport-http-bearer?)がtokenを渡してくれる
  // UseGuardsされているAPIに対してbearerトークンをリクエストすると以下のメソッドが呼び出される
  async validate(token: string): Promise<string> {
    console.log(`# check token (${token})`)
    if (!(await this.googleAuthValidationService.validateGoogleToken(token))) {
      throw new UnauthorizedException()
    }

    return token
  }
}
