import { SyntaxParamSimpleType } from "../../../types"
import { FileParamSyntax } from "../../FileParamSyntax"
import FileSyntax from "../../FileSyntax"
import { SyntaxParam } from "../../SyntaxParam"

class MapClimateParam extends SyntaxParam {
  CreateInstance = () => new MapClimateParam()
  ANY: {[key: string]: [number]} = {}
  TYPES = {
    ANY: [SyntaxParamSimpleType.int]
  }
}

export default class MapClimateSyntax extends FileParamSyntax<MapClimateParam> {
  param: MapClimateParam = new MapClimateParam();
  relativePath = ["map", "climate.txt"]
}