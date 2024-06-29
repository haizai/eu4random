import Util from "../../../../Util"
import DirSyntax from "../../DirSyntax"
import { SyntaxItem } from "../../Syntax"
import { HistoryObj, HistroySyntax, SyntaxParam, SyntaxParamType } from "./HistroySyntax"

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

  // Copy():HistoryCountryParam {
  //   var ret:HistoryCountryParam = new HistoryCountryParam()
  //   if (this.government !== undefined) ret.government = this.government
  //   if (this.add_government_reform !== undefined) ret.add_government_reform = this.add_government_reform
  //   if (this.primary_culture !== undefined) ret.primary_culture = this.primary_culture
  //   if (this.religion !== undefined) ret.religion = this.religion
  //   if (this.capital !== undefined) ret.capital = this.capital
  //   if (this.technology_group !== undefined) ret.technology_group = this.technology_group
  //   return ret
  // }
  // Set(param: HistoryCountryParam) {
  //   // if (param.capital !== undefined) this.capital = param.capital
  // }
}

class HistoryCountriesSyntax extends HistroySyntax<HistoryCountryParam> {
  'relativePath' = ["history", "countries"]
  protected createParam(): HistoryCountryParam {
    return new HistoryCountryParam()
  }
  protected getDirKeyByFileName(filename: string): string{
    return filename.slice(0,3)
  }
  // protected setBaseParam(param: HistoryCountryParam, data:SyntaxItem[]){
  //   this.setParamString(param, data, "owner")
  //   this.setParamString(param, data, "controller")
  //   this.setParamStringArray(param, data, "add_core")
  //   this.setParamString(param, data, "culture")
  //   this.setParamString(param, data, "religion")
  //   this.setParamBoolean(param, data, "hre")
  //   this.setParamInt(param, data, "base_tax")
  //   this.setParamInt(param, data, "base_production")
  //   this.setParamInt(param, data, "base_manpower")
  //   this.setParamString(param, data, "trade_goods")
  //   this.setParamString(param, data, "capital")
  //   this.setParamBoolean(param, data, "is_city")
  //   this.setParamStringArray(param, data, "discovered_by")
  // }
}

export default HistoryCountriesSyntax