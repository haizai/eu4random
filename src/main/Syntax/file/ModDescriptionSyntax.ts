import Global from "../../Global"
import FileSyntax from "../FileSyntax"


export default class ModDescriptionSyntax extends FileSyntax {
  relativePath = [Global.projectName + ".mod"]
  handleData(): void {
  }
  initData() {
    this.dataPushKeyValue("name",`"${Global.projectName}"`)
    this.dataPushKeyValue("supported_version",`"v1.37.*.*"`)
    this.dataPushKeyValue("path",`"mod/${Global.projectName}"`)
  }
}