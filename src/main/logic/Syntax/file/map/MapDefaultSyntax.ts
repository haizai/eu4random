import { SyntaxParamSimpleType } from '../../../types'
import { FileParamSyntax } from '../../FileParamSyntax'
import { SyntaxParam } from '../../SyntaxParam'

class MapDefaultParam extends SyntaxParam {
  CreateInstance = () => new MapDefaultParam()
  width!: number
  height!: number
  max_provinces!: number
  sea_starts!: number[]
  only_used_for_random!: number[]
  lakes!: number[]

  TYPES = {
    width: SyntaxParamSimpleType.int,
    height: SyntaxParamSimpleType.int,
    max_provinces: SyntaxParamSimpleType.int,
    sea_starts: [SyntaxParamSimpleType.int],
    only_used_for_random: [SyntaxParamSimpleType.int],
    lakes: [SyntaxParamSimpleType.int]
  }
}

export default class MapDefaultSyntax extends FileParamSyntax<MapDefaultParam> {
  param: MapDefaultParam = new MapDefaultParam()
  relativePath = ['map', 'default.map']
}
