import { FileParamSyntax } from "../../FileParamSyntax"
import FileSyntax from "../../FileSyntax"
import { SyntaxParam, SyntaxParamSimpleType } from "../../SyntaxParam"


class MapAreaSyntaxParam extends SyntaxParam {
  CreateInstance = () => new MapAreaSyntaxParam()
  ANY: {[key: string]: number[]}
  TYPES = {
    ANY: [SyntaxParamSimpleType.int]
  }
}
export default class MapAreaSyntax extends FileParamSyntax<MapAreaSyntaxParam> {
  param: MapAreaSyntaxParam = new MapAreaSyntaxParam()
  relativePath = ["map", "area.txt"]
}