import os from "node:os"
import path from "node:path"
import fs from "node:fs/promises"
import process from "node:process"

export default class Global {
  static eu4GamePath = process.cwd()
  static eu4DocumentsPath = path.join(os.homedir(), "Documents", "Paradox Interactive", "Europa Universalis IV")
  static projectName = "eu4random"
  static eu4DocumentsModProjectPath = path.join(Global.eu4DocumentsPath, "mod", Global.projectName)

  static async init() {
    const configPath = path.join(process.cwd(), "config.json")
    try {
      await fs.access(configPath)
      const config = await fs.readFile(configPath, {encoding:"utf8"});
      Global.eu4GamePath = JSON.parse(config).eu4GamePath
    } catch {
      
    } 
  }
}
