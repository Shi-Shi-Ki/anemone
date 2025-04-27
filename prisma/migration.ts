import { exec, execSync, spawn } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

// 引数の受け取り
type MigrateParam = {
  name: string
}
const args = process.argv.slice(2)
console.log("* args", args)
const scriptParams = {} as MigrateParam
for (let idx = 0; idx < args.length; idx++) {
  if (args[idx] === "-name" || args[idx] === "-n") {
    Object.assign(scriptParams, { name: args[idx + 1] ?? "init" })
  }
}
console.log("* scriptParams", scriptParams)

const migrationsDir = path.join(__dirname, "/migrations") // マイグレーションディレクトリへのパス
console.log(migrationsDir)
const findSqlFile = (dir: string): string | null => {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        const sqlFile = findSqlFile(fullPath) // サブディレクトリを再帰的に探索
        if (sqlFile) {
          return sqlFile
        }
      } else if (entry.isFile() && entry.name.endsWith(".sql")) {
        console.log(`* target file: ${fullPath}`)
        return fullPath // 最初に見つかった .sql ファイルを返す
      }
    }
  } catch (error) {
    console.error(`ディレクトリの読み込みエラー: ${dir}`, error)
  }
  return null
}

const replaceCollation = (sqlContent: string): string => {
  // COLLATE utf8mb4_unicode_ci を COLLATE utf8mb4_bin に置換
  const replacedContent = sqlContent.replace(/COLLATE utf8mb4_unicode_ci/g, "COLLATE utf8mb4_bin")
  return replacedContent
}

const runCommand = (command: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

const main = async () => {
  console.log("1: クエリーファイルを生成します...")
  try {
    // --create-only でマイグレーションファイルを生成
    const { stdout, stderr } = await runCommand(
      `npx prisma migrate dev --create-only --preview-feature --name ${scriptParams.name}`
    )
    console.log(stdout)
    console.error(stderr)

    // 生成されたマイグレーションディレクトリを探す
    console.log("* search dir/file.")
    const generatedMigrationDirMatch = stdout.match(/created migrations directory at\s*(.*?)\n/)
    let generatedMigrationDirPath = null
    if (generatedMigrationDirMatch && generatedMigrationDirMatch[1]) {
      generatedMigrationDirPath = generatedMigrationDirMatch[1].trim()
    } else {
      // 別の方法で最新のマイグレーションディレクトリを探す
      const migrationDirs = fs
        .readdirSync(migrationsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && /^\d+_.+/.test(dirent.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((dirent) => path.join(migrationsDir, dirent.name))
      if (migrationDirs.length > 0) {
        generatedMigrationDirPath = migrationDirs[migrationDirs.length - 1]
      }
    }

    if (!generatedMigrationDirPath) {
      console.error("エラー: 生成されたマイグレーションディレクトリが見つかりませんでした。")
      process.exit(1)
    }

    const sqlFilePath = findSqlFile(generatedMigrationDirPath)

    if (!sqlFilePath) {
      console.error("エラー: 生成された .sql ファイルが見つかりませんでした。")
      process.exit(1)
    }

    console.log(`生成されたクエリーファイル: ${sqlFilePath}`)

    console.log("2: COLLATE を置換します...")
    const originalSqlContent = fs.readFileSync(sqlFilePath, "utf-8")
    const modifiedSqlContent = replaceCollation(originalSqlContent)

    // 差分表示のために一時ファイルに書き出す
    const tempFilePath = path.join(__dirname, "temp_migration.sql")
    fs.writeFileSync(tempFilePath, modifiedSqlContent, "utf-8")

    // await setTimeout(3000)
    console.log("3: 置換前と置換後の差分を表示します...")
    try {
      // diff コマンドで差分を表示
      // git diff は git 管理下のファイルに対して使えます
      // git 管理下でない場合は、diff コマンドを使用します
      //todo
      const diffCommand = fs.existsSync(path.join(process.cwd(), ".git"))
        ? `git diff "${sqlFilePath}" "${tempFilePath}"`
        : `diff -u "${sqlFilePath}" "${tempFilePath}"`
      console.log("diff command. ", diffCommand)
      const { stdout: diffStdout, stderr: diffStderr } = await runCommand(diffCommand)
      console.log(diffStdout)
      console.error(diffStderr)
      //todo
    } catch (diffError: any) {
      console.error(diffError)
      // diff で差分がない場合もエラーとして扱われることがあるため、stdout を確認
      if (diffError.stdout) {
        console.log(diffError.stdout)
      } else {
        console.error("差分表示エラー:", diffError)
        // 差分表示エラーでも処理は続行できるようにする
      }
    } finally {
      // 一時ファイルは削除
      fs.unlinkSync(tempFilePath)
    }

    console.log("4: マイグレーションを実行するか確認します。")
    const answer = await question("マイグレーションを実行しますか？ (y/n): ")

    if (answer.toLowerCase() === "y") {
      console.log("マイグレーションを実行します...")
      // 元のファイルを置換済みの内容で上書き
      fs.writeFileSync(sqlFilePath, modifiedSqlContent, "utf-8")
      // --create-only なしで実行
      execSync(`npx prisma migrate dev --preview-feature --name ${scriptParams.name}`, {
        stdio: "inherit",
      })
      console.log("マイグレーションが完了しました。")
    } else if (answer.toLowerCase() === "n") {
      console.log("マイグレーションを中断しました。生成されたファイルを確認してください。")
      // 生成されたマイグレーションディレクトリを削除することも検討
      // fs.rmdirSync(generatedMigrationDirPath, { recursive: true });
      // console.log(`生成されたマイグレーションディレクトリ ${generatedMigrationDirPath} を削除しました。`);
    } else {
      console.log("不正な入力です。マイグレーションを中断しました。")
    }
    // 一時ファイルは削除
    // fs.unlinkSync(tempFilePath)
  } catch (error: any) {
    console.error("スクリプト実行中にエラーが発生しました:", error.error || error)
    if (error.stdout) console.log("stdout:", error.stdout)
    if (error.stderr) console.error("stderr:", error.stderr)
    process.exit(1)
  } finally {
    rl.close() // readline を閉じる
  }
}

main()
