import FileSyntax from "./FileSyntax"
import { SyntaxKeyValue } from "./Syntax"
import { SyntaxParam, SyntaxParamKeyValueType, SyntaxParamSimpleType, SyntaxParamType } from "./SyntaxParam"

// export class SyntaxCountryParam extends SyntaxParam {
//   CreateInstance = () => new SyntaxCountryParam()
//   ANY: string
//   TYPES = {
//     ANY: SyntaxParamSimpleType.string
//   }
// }

export abstract class FileParamSyntax<T extends SyntaxParam> extends FileSyntax {
  abstract param: T
  async handleData() {
    this.param.SetSyntaxData(this.data)
  }
}