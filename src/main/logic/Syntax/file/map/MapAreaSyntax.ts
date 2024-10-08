import { SyntaxParamSimpleType } from '../../../types'
import { FileParamSyntax } from '../../FileParamSyntax'
import { SyntaxParam } from '../../SyntaxParam'

class MapAreaSyntaxParam extends SyntaxParam {
  CreateInstance = () => new MapAreaSyntaxParam()
  ANY: { [area: string]: number[] } = {}
  TYPES = {
    ANY: [SyntaxParamSimpleType.int]
  }
}
export default class MapAreaSyntax extends FileParamSyntax<MapAreaSyntaxParam> {
  param: MapAreaSyntaxParam = new MapAreaSyntaxParam()
  relativePath = ['map', 'area.txt']
}
