import { SyntaxParamSimpleType } from '../../../types'
import { FileParamSyntax } from '../../FileParamSyntax'
import FileSyntax from '../../FileSyntax'
import { SyntaxParam } from '../../SyntaxParam'

class MapRegionParam extends SyntaxParam {
  CreateInstance = () => new MapRegionParam()
  ANY: {
    [region: string]: {
      areas: string[]
    }
  } = {}
  TYPES = {
    ANY: {
      areas: [SyntaxParamSimpleType.string]
    }
  }
}

export default class MapRegionSyntax extends FileParamSyntax<MapRegionParam> {
  param: MapRegionParam = new MapRegionParam()
  relativePath = ['map', 'region.txt']
}
