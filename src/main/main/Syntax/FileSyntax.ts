import path from 'node:path'
import fs from 'node:fs/promises'
import Global from '../Global'
import { Syntax } from './Syntax'

class FileSyntax extends Syntax {
  constructor(relativePath: string[] = []) {
    super()
    this.relativePath = relativePath
  }
  protected relativePath: string[] = []
  async parseFile() {
    const filePath = path.join(Global.eu4GamePath, ...this.relativePath)
    const fileStr = await fs.readFile(filePath, { encoding: 'latin1' })
    this.parse(fileStr)
    this.handleData()
  }
  protected handleData() {}
  async writeFile(dir: string = '') {
    const stringify = this.stringify()
    const outfilePath = path.join(dir, ...this.relativePath)
    await fs.mkdir(path.dirname(outfilePath), { recursive: true })
    await fs.writeFile(outfilePath, stringify, { encoding: 'latin1' })
  }
  async writeFileToModDir() {
    await this.writeFile(Global.eu4DocumentsModProjectPath)
  }
}
export default FileSyntax
