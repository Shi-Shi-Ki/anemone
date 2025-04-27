import { Injectable } from "@nestjs/common"

/**
 * GoogleAuthValidationサービス
 */
@Injectable()
export class GoogleAuthValidationService {
  async validateGoogleToken(token: string): Promise<boolean> {
    console.log(`# validateGoogleToken (${token})`)
    if (!token) {
      return false
    }
    // google tokenの期限などの整合性チェック
    return true
  }
}
