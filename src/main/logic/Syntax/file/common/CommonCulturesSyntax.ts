import { SyntaxParamSimpleType } from '../../../types'
import { FileParamSyntax } from '../../FileParamSyntax'
import { SyntaxParam } from '../../SyntaxParam'

class CommonCulturesParam extends SyntaxParam {
  CreateInstance = () => new CommonCulturesParam()

  ANY: {
    [cultureGroup: string]: {
      graphical_culture: string
      male_names?: string[]
      female_names?: string[]
      dynasty_names?: string[]
      ANY?: {
        [culture: string]: {
          primary?: SyntaxParamSimpleType.string
          male_names: [SyntaxParamSimpleType.string]
          female_names: [SyntaxParamSimpleType.string]
          dynasty_names: [SyntaxParamSimpleType.string]
        }
      }
    }
  } = {}

  TYPES = {
    // 文化组
    ANY: {
      graphical_culture: SyntaxParamSimpleType.string,
      male_names: [SyntaxParamSimpleType.string],
      female_names: [SyntaxParamSimpleType.string],
      dynasty_names: [SyntaxParamSimpleType.string],

      // 文化
      ANY: {
        primary: SyntaxParamSimpleType.string,
        male_names: [SyntaxParamSimpleType.string],
        female_names: [SyntaxParamSimpleType.string],
        dynasty_names: [SyntaxParamSimpleType.string]
      }
    }
  }
}
export default class CommonCulturesSyntax extends FileParamSyntax<CommonCulturesParam> {
  param: CommonCulturesParam = new CommonCulturesParam()
  relativePath = ['common', 'cultures', '00_cultures.txt']
}
