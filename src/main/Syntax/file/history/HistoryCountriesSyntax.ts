import { SyntaxParam, SyntaxParamType } from "../../SyntaxParam"
import { HistroySyntax} from "./HistroySyntax"

class HistoryCountryParam extends SyntaxParam {
  
  government?: string // 政体类型
  add_government_reform?: string // 政体改革
  primary_culture?: string // 主流文化
  religion?: string // 宗教
  capital?: number //首都
  technology_group?: string //科技组

  TYPES = { 
    government: SyntaxParamType.string,
    add_government_reform: SyntaxParamType.string,
    primary_culture: SyntaxParamType.string,
    religion: SyntaxParamType.string,
    capital: SyntaxParamType.number, //首都
    technology_group: SyntaxParamType.string,
  }
  CreateInstance = () => new HistoryCountryParam()

}

class HistoryCountriesSyntax extends HistroySyntax<HistoryCountryParam> {
  'relativePath' = ["history", "countries"]
  protected createParam = () => new HistoryCountryParam()
  protected getDirKeyByFileName(filename: string): string{
    return filename.slice(0,3)
  }
}

export default HistoryCountriesSyntax