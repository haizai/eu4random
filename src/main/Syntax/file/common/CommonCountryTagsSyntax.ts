import { SyntaxParamSimpleType } from "../../../types"
import { FileParamSyntax } from "../../FileParamSyntax"
import { SyntaxParam } from "../../SyntaxParam"

class CommonCountrytagsParam extends SyntaxParam {
  CreateInstance = () => new CommonCountrytagsParam()
  ANY: {[key: string]: string}
  TYPES = {
    ANY: SyntaxParamSimpleType.string
  }
}
export default class CommonCountrytagsSyntax extends FileParamSyntax<CommonCountrytagsParam> {
  param: CommonCountrytagsParam = new CommonCountrytagsParam()
  relativePath = ["common","country_tags", "00_countries.txt"]
}