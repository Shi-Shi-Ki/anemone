import { Injectable } from "@nestjs/common"

/**
 * Utilクラス
 */
@Injectable()
export class UtilService {
  /**
   * .envの値を取得する（未設定だった場合はthrow）
   * @param envValue
   * @returns
   */
  getEnvValueOrFail(envValue: string): string {
    if (!envValue) {
      throw new Error(`not found env.`)
    }
    return envValue
  }
}
