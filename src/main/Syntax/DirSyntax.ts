import path from "node:path"
import fs from "node:fs/promises"
import Global from "../Global"
import {Syntax, SyntaxItem} from "./Syntax"
import Util from "../../Util"

interface DirSyntaxData {
  [file:string]: Syntax
}

class DirSyntax {
  protected relativePath:string[]
  protected dirData:DirSyntaxData = {}
  async parseFile() {
    var dirPath = path.join(Global.eu4GamePath, ...this.relativePath)
    var filePaths = await fs.readdir(dirPath)
    for(let filePath of filePaths) {
      var data = await fs.readFile(path.join(dirPath, filePath),{encoding:"latin1"})
      var syntax = new Syntax()
      syntax.parse(data)
      this.dirData[filePath] = syntax
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

  
  setParamBoolean(obj: any, data:SyntaxItem[], key: string) {
    var val = Util.SyntaxArrayFindOne(data, key) as string
    if (val === null) {
      return
    }
    if (val.toLowerCase() === "yes") {
      obj[key] = true
    } else if (val.toLowerCase() === "no") {
      obj[key] = false
    }
  }
  setParamInt(obj: any, data:SyntaxItem[], key: string) {
    var val = Util.SyntaxArrayFindOne(data, key) as string
    if (val === null) {
      return
    }
    obj[key] = parseInt(val, 10)
  }
  setParamFloat(obj: any, data:SyntaxItem[], key: string) {
    var val = Util.SyntaxArrayFindOne(data, key) as string
    if (val === null) {
      return
    }
    obj[key] = parseFloat(val)
  }
  setParamString(obj: any, data:SyntaxItem[], key: string) {
    var val = Util.SyntaxArrayFindOne(data, key)
    if (val !== null) {
      obj[key] = val
    }
  }
  setParamStringArray(obj: any, data:SyntaxItem[], key: string) {
    var val = Util.SyntaxArrayFindArray(data, key)
    if (val !== null && val.length > 0) {
      obj[key] = val
    }
  }
}
export default DirSyntax