import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'
import process from 'node:process'

export default class Global {
  static eu4GamePath = process.cwd()
  static eu4DocumentsPath = path.join(
    os.homedir(),
    'Documents',
    'Paradox Interactive',
    'Europa Universalis IV'
  )
  static projectName = 'eu4random'
  static eu4DocumentsModProjectPath = path.join(Global.eu4DocumentsPath, 'mod', Global.projectName)

  static init(eu4DocumentsPath:string, eu4GamePath:string) {
    Global.eu4GamePath = eu4GamePath
    Global.eu4DocumentsPath = eu4DocumentsPath
    Global.eu4DocumentsModProjectPath = path.join(
            Global.eu4DocumentsPath,
            'mod',
            Global.projectName
          )
    // const configPath = path.join(process.cwd(), 'config.json')
    // try {
    //   await fs.access(configPath)
    //   const config = await fs.readFile(configPath, { encoding: 'utf8' })
    //   const json = JSON.parse(config)
    //   if (json.eu4GamePath) {
    //     Global.eu4GamePath = json.eu4GamePath
    //   }
    //   if (json.eu4DocumentsPath) {
    //     Global.eu4DocumentsPath = json.eu4DocumentsPath
    //     Global.eu4DocumentsModProjectPath = path.join(
    //       Global.eu4DocumentsPath,
    //       'mod',
    //       Global.projectName
    //     )
    //   }
    // } catch {}
  }
  static getDefaultDocuments() {
    return path.join(os.homedir(),'Documents')
  }
}
