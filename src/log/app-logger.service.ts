import { Injectable, LoggerService, Scope } from "@nestjs/common"
import { createLogger, format, transports, Logger } from "winston"
import "winston-daily-rotate-file"
import * as path from "path"
import * as fs from "fs"
import * as util from "util"

const nestLikeConsoleFormat = (appName: string = "NestWinston", isColor: boolean = true) => {
  const formats = [
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.splat(),
    format.printf((info) => {
      const { level, message, context, timestamp, ...rest } = info
      //   const args = (rest[Symbol.for("splat") as any] as []) || []
      //   let logOutput = `${timestamp} [${context || appName}] ${level}: ${message}`
      //   args.forEach((arg, index) => {
      //     const inspectedArg = util.inspect(arg, { depth: null, colors: false })
      //     if (index > 0) {
      //       logOutput += "\n"
      //     }
      //     logOutput += inspectedArg
      //   })
      //   return logOutput
      return `${timestamp} [${context || appName}] ${level}: ${message}`
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
    const formatting = this.formattingMessage(message, optionalParams)
    this.logger.info(formatting.message, null, {
      context: formatting.context,
    })
  }

  error(message: any, ...optionalParams: any[]) {
    const formatting = this.formattingMessage(message, optionalParams)
    this.logger.error(formatting.message, [], {
      context: formatting.context || this.context,
    })
  }

  warn(message: any, ...optionalParams: any[]): any {
    const formatting = this.formattingMessage(message, optionalParams)
    this.logger.warn(formatting.message, [], {
      context: formatting.context || this.context,
    })
  }

  debug(message: any, ...optionalParams: any[]): any {
    const formatting = this.formattingMessage(message, optionalParams)
    this.logger.debug(formatting.message, [], {
      context: formatting.context || this.context,
    })
  }

  verbose(message: any, ...optionalParams: any[]): any {
    const formatting = this.formattingMessage(message, optionalParams)
    this.logger.verbose(formatting.message, [], {
      context: formatting.context || this.context,
    })
  }

  private formattingMessage(message: any, optionalParams: any[]) {
    let context: string | undefined = this.context
    let logArgs: any[] = [] // util.format に渡す引数 + splat に収集させたい引数
    // optionalParams の最後の要素が文字列であれば、それをコンテキストとして扱う
    if (
      optionalParams.length > 0 &&
      typeof optionalParams[optionalParams.length - 1] === "string"
    ) {
      context = optionalParams[optionalParams.length - 1] as string
      logArgs = optionalParams.slice(0, -1) // 最後の要素以外を変数展開用引数とする
    } else {
      logArgs = optionalParams // 最後の要素が文字列でない場合、optionalParams 全体を変数展開用引数とする
    }

    return {
      context: context || this.context,
      message: util.format(message, ...logArgs),
    }
  }
}
