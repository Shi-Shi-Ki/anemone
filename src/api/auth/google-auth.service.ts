import { UtilService } from "@/util/util.service"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { OAuth2Client } from "google-auth-library"
import { google } from "googleapis"

@Injectable()
export class GoogleAuthService {
  private oauth2Client: OAuth2Client
  constructor(private readonly util: UtilService) {
    const appHost = this.util.getEnvValueOrFail(process.env.APP_HOST)
    const appPort = this.util.getEnvValueOrFail(process.env.APP_PORT)
    const redirectUrl = `http://${appHost}:${appPort}/api/auth/callback/google`

    this.oauth2Client = new google.auth.OAuth2(
      this.util.getEnvValueOrFail(process.env.GOOGLE_CLIENT_ID),
      this.util.getEnvValueOrFail(process.env.GOOGLE_CLIENT_SECRET),
      redirectUrl
    )
  }

  /**
   * トークンの取得
   * @param code
   * @param scope
   */
  async getToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    if (!tokens.access_token) {
      throw new UnauthorizedException("Failed to retrieve access token")
    }
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.util.getEnvValueOrFail(process.env.GOOGLE_CLIENT_ID),
    })
    const payload = ticket.getPayload()
    if (!payload) {
      throw new UnauthorizedException("no payload")
    }
    if (
      !payload.email ||
      !this.util
        .getEnvValueOrFail(process.env.ALLOWED_TOKEN_ISSUANCE_EMAILS)
        .split(",")
        .includes(payload.email)
    ) {
      throw new UnauthorizedException("permission error")
    }
    //todo
    console.log("* tokens: ", tokens)
  }
}
