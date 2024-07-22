import path from 'node:path'
import fs from 'node:fs/promises'
import Global from '../Global'
import FileSyntax from './FileSyntax'

abstract class DirSyntax {
  abstract relativePath: string[]
  protected dirData: {
    [fileName: string]: FileSyntax
  } = {}
  async parseFile() {
    const dirPath = path.join(Global.eu4GamePath, ...this.relativePath)
    const filePaths = await fs.readdir(dirPath)
    for (const filePath of filePaths) {
      const fileSyntax = new FileSyntax(this.relativePath.concat(filePath))
      this.dirData[filePath] = fileSyntax
      await fileSyntax.parseFile()
    }
    await this.handleData()
  }
  protected async handleData() {}
  async writeFiles() {
    for (const name in this.dirData) {
      await this.writeFile(name)
    }
  }
  async writeFile(fileName: string) {
    const syntax = this.dirData[fileName]
    const stringify = syntax.stringify()
    const outfileDir = path.join(Global.eu4DocumentsModProjectPath, ...this.relativePath)
    await fs.mkdir(outfileDir, { recursive: true })
    await fs.writeFile(path.join(outfileDir, fileName), stringify, { encoding: 'latin1' })
  }
}
export default DirSyntax
