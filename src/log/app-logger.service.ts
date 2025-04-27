import { Injectable, LoggerService, LogLevel } from "@nestjs/common"
import { createLogger, format, transports, Logger } from "winston"
import "winston-daily-rotate-file"
import * as path from "path"
import * as fs from "fs"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: Logger

  constructor(private configService: ConfigService) {
    const env = process.env.ENV!
    const logDir = env === "local" ? path.join(__dirname, "../../logs") : "/var/log/app"
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const transportsList = [
      // ローカル環境ではコンソールにも出力 (任意)
      ...(env === "local"
        ? [
            new transports.Console({
              format: format.combine(
                format.colorize(), // コンソール出力に色を付ける
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // タイムスタンプ形式
                // ログフォーマット
                format.printf(({ timestamp, level, message, context, ...rest }) => {
                  // NestJS の LoggerService は context を渡してくれます
                  return `${timestamp} [${context ? context : "Application"}] ${level}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ""}`
                })
              ),
              level: "debug", // 開発環境では debug 以上の全てのレベルをコンソールに出力
            }),
          ]
        : []),

      // error レベルのログを error.log に出力 (日次ローテーション)
      new transports.DailyRotateFile({
        filename: path.join(logDir, "error-%DATE%.log"), // ファイル名パターン (例: error-2023-10-27.log)
        datePattern: "YYYY-MM-DD", // 日付パターン
        zippedArchive: true, // 古いログファイルを gzip で圧縮
        maxSize: "5m", // ファイルサイズの最大値
        maxFiles: "2d", // ログファイルを保持する最大日数
        level: "error", // このトランスポートでは error レベルのみ処理
        format: format.combine(
          format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          format.json() // JSON 形式でログを出力
          // 必要に応じて format.printf など他のフォーマットも指定可能
        ),
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
        format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.json()),
      }),
    ]

    this.logger = createLogger({
      // Winston 自体の最小ログレベルを設定
      // NestJS の debug/verbose も出力されるように、開発環境では 'debug' 以下に設定
      level: env === "production" ? "info" : "debug",
      transports: transportsList,
      exitOnError: false, // ハンドルされた例外でプロセスを終了しない
    })
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context })
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace })
  }

  warn(message: any, context?: string): any {
    this.logger.warn(message, { context })
  }

  debug(message: any, context?: string): any {
    // Winston のレベル設定により、debug レベルのログも出力されるように設定済み
    this.logger.debug(message, { context })
  }

  verbose(message: any, context?: string): any {
    // Winston のレベル設定により、verbose レベルのログも出力されるように設定済み
    this.logger.verbose(message, { context })
  }
}
