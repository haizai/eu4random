import { SyntaxParamSimpleType } from "../../../types"
import { SyntaxParam } from "../../SyntaxParam"
import { HistroySyntax} from "./HistroySyntax"

class HistoryProvinceParam extends SyntaxParam {
  
  owner?: string // 拥有者
  controller?: string // 控制者
  add_core?: string[] // 核心
  remove_core?: string[] // 核心
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
    owner: SyntaxParamSimpleType.string,
    controller: SyntaxParamSimpleType.string,
    add_core: [SyntaxParamSimpleType.string],
    remove_core: [SyntaxParamSimpleType.string],
    culture: SyntaxParamSimpleType.string,
    religion: SyntaxParamSimpleType.string,
    hre: SyntaxParamSimpleType.boolean,
    base_tax: SyntaxParamSimpleType.int,
    base_production: SyntaxParamSimpleType.int,
    base_manpower: SyntaxParamSimpleType.int,
    trade_goods: SyntaxParamSimpleType.string,
    capital: SyntaxParamSimpleType.string,
    is_city: SyntaxParamSimpleType.boolean,
    discovered_by: [SyntaxParamSimpleType.string],
  }

  CreateInstance = () => new HistoryProvinceParam()

  GetCores() {
    var cores = new Set(this.add_core)
    if (this.remove_core) {
      this.remove_core.forEach(core => {
        cores.delete(core)
      });
    }
    return Array.from(cores)
  }
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