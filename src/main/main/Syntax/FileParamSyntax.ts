import FileSyntax from "./FileSyntax"
import { SyntaxParam } from "./SyntaxParam"

export abstract class FileParamSyntax<T extends SyntaxParam> extends FileSyntax {
  abstract param: T
  async handleData() {
    this.param.SetSyntaxData(this.data)
  }
}