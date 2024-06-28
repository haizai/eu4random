import Util from "../../../../Util"
import DirSyntax from "../../DirSyntax"
import { SyntaxItem } from "../../Syntax"

interface HistoryProvinceObj {
  FileName: string // 文件名
  BaseParam: HistoryProvinceParam
  Timelines: HistoryProvinceTimeline[]
  NowParam: HistoryProvinceParam
}
class HistoryProvinceParam {
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

  Copy():HistoryProvinceParam {
    var ret:HistoryProvinceParam = new HistoryProvinceParam()
    if (this.owner !== undefined) ret.owner = this.owner
    if (this.controller !== undefined) ret.controller = this.controller
    if (this.add_core !== undefined) ret.add_core = this.add_core.concat()
    if (this.culture !== undefined) ret.culture = this.culture
    if (this.religion !== undefined) ret.religion = this.religion
    if (this.hre !== undefined) ret.hre = this.hre
    if (this.base_tax !== undefined) ret.base_tax = this.base_tax
    if (this.base_production !== undefined) ret.base_production = this.base_production
    if (this.base_manpower !== undefined) ret.base_manpower = this.base_manpower
    if (this.trade_goods !== undefined) ret.trade_goods = this.trade_goods
    if (this.capital !== undefined) ret.capital = this.capital
    if (this.is_city !== undefined) ret.is_city = this.is_city
    if (this.discovered_by !== undefined) ret.discovered_by = this.discovered_by.concat()
    return ret
  }
  Set(param: HistoryProvinceParam) {
    if (param.owner !== undefined) this.owner = param.owner
    if (param.controller !== undefined) this.controller = param.controller
    if (param.add_core !== undefined) {
      if (this.add_core === undefined) {
        this.add_core = param.add_core
      } else {
        this.add_core.push(...param.add_core)
      }
    }
    if (param.culture !== undefined) this.culture = param.culture
    if (param.religion !== undefined) this.religion = param.religion
    if (param.hre !== undefined) this.hre = param.hre
    if (param.base_tax !== undefined) this.base_tax = param.base_tax
    if (param.base_production !== undefined) this.base_production = param.base_production
    if (param.base_manpower !== undefined) this.base_manpower = param.base_manpower
    if (param.trade_goods !== undefined) this.trade_goods = param.trade_goods
    if (param.capital !== undefined) this.capital = param.capital
    if (param.is_city !== undefined) this.is_city = param.is_city
    if (param.discovered_by !== undefined) {
      if (this.discovered_by === undefined) {
        this.discovered_by = param.discovered_by
      } else {
        this.discovered_by.push(...param.discovered_by)
      }
    }
  }
}

interface HistoryProvinceTimeline {
  Time: string
  Param: HistoryProvinceParam
}
interface HistoryProvinceDir {
  [id: string]: HistoryProvinceObj
}

class HistoryProvincesSyntax extends DirSyntax {
  ProvinceDir:HistoryProvinceDir = {}
  'relativePath' = ["history", "provinces"]
  async handleData() {
    for(let name in this.dirData) {
      var syntax = this.dirData[name]
      var obj:HistoryProvinceObj = {
        FileName: name,
        BaseParam: new HistoryProvinceParam(),
        Timelines: [],
        NowParam: new HistoryProvinceParam(),
      }
      this.ProvinceDir[name.match(/^\s*\d+/)[0]] = obj
      this.AddToKeySet(Util.SyntaxArrayGetAllKey(syntax.data))
      this.setBaseParam(obj.BaseParam, syntax.data)
      for(let item of syntax.data) {
        if (item instanceof Object && /^\d+\.\d+.\d+$/.test(item.key)) {
          var Param = new HistoryProvinceParam()
          this.setBaseParam(Param, item.value as SyntaxItem[])
          obj.Timelines.push({
            Time: item.key,
            Param: Param
          })
        }
      }
      obj.Timelines.sort((t1, t2) => {
        var [y1, m1, d1] = Util.GetYMDbyTime(t1.Time)
        var [y2, m2, d2] = Util.GetYMDbyTime(t2.Time)
        var t1T = y1 * 10000 + m1 * 100 + d1
        var t2T = y2 * 10000 + m2 * 100 + d2
        return t1T - t2T
      })
      obj.NowParam = this.calTimeParam(obj)
    }
  }
  private calTimeParam(obj: HistoryProvinceObj, time:string = "1444.11.11"):HistoryProvinceParam {
    var ret = obj.BaseParam.Copy()
    for(let timeline of obj.Timelines) {
      if (Util.TimeBigThen(timeline.Time, time)) {
        break
      }
      ret.Set(timeline.Param)
    }
    return ret
  }
  private setBaseParam(param: HistoryProvinceParam, data:SyntaxItem[]){
    this.setParamString(param, data, "owner")
    this.setParamString(param, data, "controller")
    this.setParamStringArray(param, data, "add_core")
    this.setParamString(param, data, "culture")
    this.setParamString(param, data, "religion")
    this.setParamBoolean(param, data, "hre")
    this.setParamInt(param, data, "base_tax")
    this.setParamInt(param, data, "base_production")
    this.setParamInt(param, data, "base_manpower")
    this.setParamString(param, data, "trade_goods")
    this.setParamString(param, data, "capital")
    this.setParamBoolean(param, data, "is_city")
    this.setParamStringArray(param, data, "discovered_by")
  }
  async removeOwnerThenWriteFile(id:string) {
    var fileName = this.ProvinceDir[id]?.FileName
    var data = this.dirData[fileName]
    if (data) {
      data.dataPushKeyValue("1444.11.11", [{
        key: "owner",
        value: [],
      }])
      await this.writeFile(this.ProvinceDir[id].FileName)
    }
  }
  async setOwnerThenWriteFile(provinceId:string, owner: string) {
    var fileName = this.ProvinceDir[provinceId]?.FileName
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
      await this.writeFile(this.ProvinceDir[provinceId].FileName)
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

export default HistoryProvincesSyntax