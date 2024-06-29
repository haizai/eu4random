import FileSyntax from "./FileSyntax"
import { SyntaxKeyValue } from "./Syntax"
import { SyntaxParam, SyntaxParamType } from "./SyntaxParam"

export class SyntaxCountryParam extends SyntaxParam {
  CountryDir: {
    [tag: string]: string
  } = {}
  CreateInstance = () => new SyntaxCountryParam()
  IdentifierType = {
    CountryTag: SyntaxParamType.string
  }
}

export abstract class FileParamSyntax<T extends SyntaxParam> extends FileSyntax {
  abstract param: T
  async handleData() {
    if (this.param instanceof SyntaxCountryParam) {
      var param  = this.param as SyntaxCountryParam
      let countryType = param.IdentifierType?.CountryTag
      switch (countryType) {
        default:
          for (let item of this.data) {
            let key = (item as SyntaxKeyValue).key.trim()
            if (key.length == 3) {
              this.param.CountryDir[key] = (item as SyntaxKeyValue).value as string
            }
          }
          break;
      }
    }
  }
}