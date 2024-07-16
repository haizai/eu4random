import path from "node:path"
import fs from "node:fs/promises"
import Global from "../Global"
import {Syntax, SyntaxItem} from "./Syntax"
import FileSyntax from "./FileSyntax"

abstract class DirSyntax {
  abstract relativePath:string[]
  protected dirData: {
    [fileName: string] : FileSyntax
  } = {}
  async parseFile() {
    var dirPath = path.join(Global.eu4GamePath, ...this.relativePath)
    var filePaths = await fs.readdir(dirPath)
    for(let filePath of filePaths) {
      let fileSyntax = new FileSyntax(this.relativePath.concat(filePath))
      this.dirData[filePath] = fileSyntax
      await fileSyntax.parseFile();
    }
    await this.handleData()
  }
  protected async handleData() {

  }
  async writeFiles() {
    for(let name in this.dirData) {
      await this.writeFile(name)
    }
  }
  async writeFile(fileName:string) {
      let syntax = this.dirData[fileName]
      var stringify = syntax.stringify()
      var outfileDir = path.join(Global.eu4DocumentsModProjectPath, ...this.relativePath)
      await fs.mkdir(outfileDir, {recursive: true})
      await fs.writeFile(path.join(outfileDir,fileName), stringify,{encoding:"latin1"})
  }
}
export default DirSyntax