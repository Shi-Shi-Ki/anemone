import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

/**
 * 認証ガードの設定
 *
 * サービスAPIを呼び出す前に呼ばれる
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard("bearer") {
  // infoまたはerr引数に基づいて例外をスローすることができる
  // 認証エラー時のログとかカスタム例外をしたいときに定義する
  // handleRequest(err, user, info) {
  //   console.log("# call GoogleAuthGuard err:", err)
  //   console.log("# call GoogleAuthGuard user:", user)
  //   console.log("# call GoogleAuthGuard info:", info)
  //   return user
  // }
}
