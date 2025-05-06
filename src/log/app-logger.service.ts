import { Injectable, LoggerService, Scope } from "@nestjs/common"
import { createLogger, format, transports, Logger, Logform } from "winston"
import "winston-daily-rotate-file"
import * as path from "path"
import * as fs from "fs"
import * as util from "util"

// this.logger.xxxから自動で呼び出される
const nestLikeConsoleFormat = (appName: string = "NestWinston", isColor: boolean = true) => {
  const formats = [
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.splat(),
    format.printf((values: Logform.TransformableInfo) => {
      const level = values.level as string
      const message = values.message as string
      const timestamp = values.timestamp as string
      const params = values.params as any[] | undefined // %oなどのフォーマット文字列の判断用
      if (params) {
        // ("hoge: ", hoge) or ([1, 2, 3], "hoge")
        const formattingMessage =
          typeof message === "string"
            ? message
            : util.inspect(message, {
                depth: null,
                colors: false,
                compact: false,
              })
        const args = (values[Symbol.for("splat")] as any[] | undefined) || []
        const extractionParams = (args.length > 0 && args[0].params ? args[0].params : []) as any[]
        const formattingParams = extractionParams.map((value) => {
          return typeof value === "string"
            ? value
            : util.inspect(value, {
                depth: null,
                colors: false,
                compact: false,
              })
        })
        return `${timestamp} [${appName}] ${level}: ${formattingMessage} ${formattingParams}`
      }
      // ("hoge") or ("hoge: %o", hoge)
      // messageをそのまま出力
      return `${timestamp} [${appName}] ${level}: ${message}`
    }),
  ]
  if (isColor) {
    formats.unshift(
      format.colorize({
        colors: { info: "green", error: "red", warn: "yellow", debug: "blue", verbose: "cyan" },
      })
    )
  }

  return format.combine(...formats)
}

// 呼び出されるたびにインスタンス化する設定
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private logger: Logger
  private context?: string

  constructor(context?: string) {
    this.context = context
    const env = process.env.ENV!
    const logDir = env === "local" ? path.join(__dirname, "../../logs") : "/var/log/app"
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const transportsList = [
      // ローカル環境ではコンソールにも出力 (任意)
      ...(env === "local" || env === "test"
        ? [
            new transports.Console({
              format: nestLikeConsoleFormat(context), // カスタムフォーマットを適用
              level: "debug",
            }),
            // error レベルのログを error.log に出力 (日次ローテーション)
            new transports.DailyRotateFile({
              filename: path.join(logDir, "error-%DATE%.log"), // ファイル名パターン (例: error-2023-10-27.log)
              datePattern: "YYYY-MM-DD", // 日付パターン
              zippedArchive: true, // 古いログファイルを gzip で圧縮
              maxSize: "5m", // ファイルサイズの最大値
              maxFiles: "2d", // ログファイルを保持する最大日数
              level: "error", // このトランスポートでは error レベルのみ処理
              format: nestLikeConsoleFormat(context, false),
            }),
            // error 以外のログ (info, warn, debug, log, verbose) を app.log に出力 (日次ローテーション)
            new transports.DailyRotateFile({
              filename: path.join(logDir, "app-%DATE%.log"), // ファイル名パターン (例: app-2023-10-27.log)
              datePattern: "YYYY-MM-DD",
              zippedArchive: true,
              maxSize: "5m",
              maxFiles: "2d",
              level: "info", // このトランスポートでは info 以上のレベルを処理 (debug, verbose は後で設定)
              silent: env === "test", // テスト実行時はファイルにログを出力しない (任意)
              format: nestLikeConsoleFormat(context, false),
            }),
          ]
        : []),
    ]

    this.logger = createLogger({
      // Winston 自体の最小ログレベルを設定
      // NestJS の debug/verbose も出力されるように、開発環境では 'debug' 以下に設定
      level: env === "production" ? "info" : "debug",
      transports: transportsList,
      exitOnError: false, // ハンドルされた例外でプロセスを終了しない
    })
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, { params: optionalParams, context: this.context })
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, { params: optionalParams, context: this.context })
  }

  warn(message: any, ...optionalParams: any[]): any {
    this.logger.warn(message, { params: optionalParams, context: this.context })
  }

  debug(message: any, ...optionalParams: any[]): any {
    this.logger.debug(message, { params: optionalParams, context: this.context })
  }

  verbose(message: any, ...optionalParams: any[]): any {
    this.logger.verbose(message, { params: optionalParams, context: this.context })
  }
}
