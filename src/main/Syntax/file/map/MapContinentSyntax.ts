import { FileParamSyntax } from "../../FileParamSyntax"
import FileSyntax from "../../FileSyntax"
import { SyntaxParam, SyntaxParamSimpleType } from "../../SyntaxParam"

class MapContinentSyntaxParam extends SyntaxParam {
  CreateInstance = () => new MapContinentSyntaxParam()
  ANY: {[key: string]: number[]}
  TYPES = {
    ANY: [SyntaxParamSimpleType.int]
  }
}
export default class MapContinentSyntax extends FileParamSyntax<MapContinentSyntaxParam> {
  param: MapContinentSyntaxParam = new MapContinentSyntaxParam()
  relativePath = ["map", "continent.txt"]
}