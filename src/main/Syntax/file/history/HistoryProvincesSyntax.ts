import { SyntaxParam, SyntaxParamType } from "../../SyntaxParam"
import { HistroySyntax} from "./HistroySyntax"

class HistoryProvinceParam extends SyntaxParam {
  
  owner?: string // 拥有者
  controller?: string // 控制者
  add_core?: string[] // 核心
  culture?: string // 文化
  religion?: string //宗教
  hre?: boolean //是否在神罗
  base_tax?: number //税基
  base_production?: number//生产
  base_manpower?:number //人力
  trade_goods?: string // 贸易商品
  capital?: string // 治所名
  is_city?: boolean //
  discovered_by?: string[] // 被国家组发现 
  TYPES = { 
    owner: SyntaxParamType.string,
    controller: SyntaxParamType.string,
    add_core: SyntaxParamType.stringArray,
    culture: SyntaxParamType.string,
    religion: SyntaxParamType.string,
    hre: SyntaxParamType.boolean,
    base_tax: SyntaxParamType.int,
    base_production: SyntaxParamType.int,
    base_manpower: SyntaxParamType.int,
    trade_goods: SyntaxParamType.string,
    capital: SyntaxParamType.string,
    is_city: SyntaxParamType.boolean,
    discovered_by: SyntaxParamType.stringArray,
  }

  CreateInstance = () => new HistoryProvinceParam()
  
}
class HistoryProvincesSyntax extends HistroySyntax<HistoryProvinceParam> {
  'relativePath' = ["history", "provinces"]
  protected createParam = () => new HistoryProvinceParam()
  protected getDirKeyByFileName(filename: string): string{
    return filename.match(/^\s*\d+/)[0]
  }
  async removeOwnerThenWriteFile(id:string) {
    var fileName = this.Dir[id]?.FileName
    var data = this.dirData[fileName]
    if (data) {
      data.dataPushKeyValue("1444.11.11", [{
        key: "owner",
        value: [],
      }])
      await this.writeFile(this.Dir[id].FileName)
    }
  }
  async setOwnerThenWriteFile(provinceId:string, owner: string) {
    var fileName = this.Dir[provinceId]?.FileName
    var data = this.dirData[fileName]
    if (data) {
      data.dataPushKeyValue("1444.11.11", [
        {
          key: "owner",
          value: owner,
        },
        {
          key: "controller",
          value: owner,
        },
        {
          key: "add_core",
          value: owner,
        },
      ])
      await this.writeFile(this.Dir[provinceId].FileName)
    }
  }
}

export default HistoryProvincesSyntax