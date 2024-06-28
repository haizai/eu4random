import os from "node:os"
import path from "node:path"
export default class Global {
  static eu4GamePath = "D:\\steam\\steamapps\\common\\Europa Universalis IV"
  static eu4DocumentsPath = path.join(os.homedir(), "Documents", "Paradox Interactive", "Europa Universalis IV")
  static projectName = "eu4random"
  static eu4DocumentsModProjectPath = path.join(Global.eu4DocumentsPath, "mod", Global.projectName)
}
