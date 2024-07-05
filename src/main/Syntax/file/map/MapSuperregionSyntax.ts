import { FileParamSyntax } from "../../FileParamSyntax"
import { SyntaxParam, SyntaxParamSimpleType } from "../../SyntaxParam"

class MapSuperregionParam extends SyntaxParam {
  CreateInstance = () => new MapSuperregionParam()
  ANY: {[key: string]: string[]}
  TYPES = {
    ANY: [SyntaxParamSimpleType.string]
  }
}


export default class MapSuperregionSyntax extends FileParamSyntax<MapSuperregionParam> {
  param: MapSuperregionParam = new MapSuperregionParam()
  relativePath = ["map", "superregion.txt"]
}