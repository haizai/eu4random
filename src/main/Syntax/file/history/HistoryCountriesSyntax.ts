import Util from "../../../../Util"
import DirSyntax from "../../DirSyntax"

interface HistoryCountryData {
  government?: string // 政体类型
  add_government_reform?: string // 政体改革
  primary_culture?: string // 主流文化
  religion?: string // 宗教
  capital?: number //首都
  technology_group?: string //科技组
}
interface HistoryCountryDir {
  [id: string]: HistoryCountryData
}

class HistoryCountriesSyntax extends DirSyntax {
  CountryDir:HistoryCountryDir = {}
  'relativePath' = ["history", "countries"]
  async handleData() {
    for(let name in this.dirData) {
      var syntax = this.dirData[name]      
      var obj:HistoryCountryData = {}
      this.CountryDir[name.slice(0, 3)] = obj
      this.setParamString(obj, syntax.data, "government")
      this.setParamString(obj, syntax.data, "add_government_reform")
      this.setParamString(obj, syntax.data, "primary_culture")
      this.setParamString(obj, syntax.data, "religion")
      this.setParamInt(obj, syntax.data, "capital")
      this.setParamString(obj, syntax.data, "technology_group")
      this.AddToKeySet(Util.SyntaxArrayGetAllKey(syntax.data))
    }
  }
  keySet:Set<string> = new Set()
  AddToKeySet(arr:string[]){
    for(let k of arr) {
      if (!/^\d/.test(k)) {
        this.keySet.add(k)
      }
    }
  }
}

export default HistoryCountriesSyntax