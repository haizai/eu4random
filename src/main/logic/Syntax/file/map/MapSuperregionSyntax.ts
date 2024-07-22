import { SyntaxParamSimpleType } from '../../../types'
import { FileParamSyntax } from '../../FileParamSyntax'
import { SyntaxParam } from '../../SyntaxParam'

class MapSuperregionParam extends SyntaxParam {
  CreateInstance = () => new MapSuperregionParam()
  ANY: { [superregion: string]: string[] } = {}
  TYPES = {
    ANY: [SyntaxParamSimpleType.string]
  }
}

export default class MapSuperregionSyntax extends FileParamSyntax<MapSuperregionParam> {
  param: MapSuperregionParam = new MapSuperregionParam()
  relativePath = ['map', 'superregion.txt']
}
