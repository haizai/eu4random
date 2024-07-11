import { SyntaxParamSimpleType } from "../../../types"
import { SyntaxParam } from "../../SyntaxParam"
import { HistroySyntax} from "./HistroySyntax"

class HistoryCountryParam extends SyntaxParam {
  
  government?: string // 政体类型
  add_government_reform?: string // 政体改革
  primary_culture?: string // 主流文化
  religion?: string // 宗教
  capital?: number //首都
  technology_group?: string //科技组

  TYPES = { 
    government: SyntaxParamSimpleType.string,
    add_government_reform: SyntaxParamSimpleType.string,
    primary_culture: SyntaxParamSimpleType.string,
    religion: SyntaxParamSimpleType.string,
    capital: SyntaxParamSimpleType.number, //首都
    technology_group: SyntaxParamSimpleType.string,
  }
  CreateInstance = () => new HistoryCountryParam()

}

class HistoryCountriesSyntax extends HistroySyntax<HistoryCountryParam> {
  'relativePath' = ["history", "countries"]
  protected createParam = () => new HistoryCountryParam()
  protected getDirKeyByFileName(filename: string): string{
    return filename.slice(0,3)
  }
  async setCapitalThenWriteFile(tag:string, capital: number) {
    var fileName = this.Dir[tag]?.FileName
    var data = this.dirData[fileName]
    if (data) {
      data.dataPushKeyValue("1444.11.11", [
        {
          key: "capital",
          value: capital.toString(),
        },
      ])
      await this.writeFile(this.Dir[tag].FileName)
    }
  }
}

export default HistoryCountriesSyntax