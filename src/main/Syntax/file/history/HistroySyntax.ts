import Util from "../../../../Util"
import DirSyntax from "../../DirSyntax"
import { SyntaxItem } from "../../Syntax"

export interface HistoryObj<T extends SyntaxParam>  {
  FileName: string // 文件名
  BaseParam: T
  Timelines: HistoryTimeline<T>[]
  NowParam: T
}
export interface HistoryTimeline<T extends SyntaxParam> {
  Time: string
  Param: T
}

export enum SyntaxParamType {
  any,

  string,
  boolean,
  number,
  int,
  float,

  stringArray,
  booleanArray,
  numberArray,
  intArray,
  floatArray,
}

export abstract class SyntaxParam {
  abstract TYPES : {[key: string]: SyntaxParamType}
  abstract CreateInstance(): any
  Copy<T extends SyntaxParam>(): T {
    var ret:any = this.CreateInstance()
    var anyThis = this as any
    for (let key in this.TYPES) {
      var type = this.TYPES[key]
      switch (type) {
        case SyntaxParamType.stringArray:
        case SyntaxParamType.booleanArray:
        case SyntaxParamType.numberArray:
        case SyntaxParamType.intArray:
        case SyntaxParamType.floatArray:
          if (anyThis[key] !== undefined) 
            ret[key] = anyThis[key].concat()
        default:
          if (anyThis[key] !== undefined) 
            ret[key] = anyThis[key]
          break;
      }
    }
    return ret
  }
  Set(param: SyntaxParam): void {
    var anyThis = this as any
    var anyParam = param as any
    for (let key in this.TYPES) {
      var type = this.TYPES[key]
      switch (type) {
        case SyntaxParamType.stringArray:
        case SyntaxParamType.booleanArray:
        case SyntaxParamType.numberArray:
        case SyntaxParamType.intArray:
        case SyntaxParamType.floatArray:
          if (anyParam[key] !== undefined) {
            if (anyThis[key] === undefined) {
              anyThis[key] = anyParam[key]
            } else {
              anyThis[key].push(...anyParam[key])
            }
          }
          break
        default:
          if (anyParam[key] !== undefined) 
            anyThis[key] = anyParam[key]
          break;
      }
    }
  }
  SetSyntaxData(data:SyntaxItem[]) {
    var anyThis = this as any
    for (var item of data) {
      if (item instanceof Object) {
        let key = item.key
        let val = item.value as string
        let type = this.TYPES[key]
        if(type === undefined) {
          continue
        }
        switch (type) {
          case SyntaxParamType.string:
            anyThis[key] = val
            break
          case SyntaxParamType.boolean:
            if (val.toLowerCase() === "yes") {
              anyThis[key] = true
            } else if (val.toLowerCase() === "no") {
              anyThis[key] = false
            }
            break
          case SyntaxParamType.number:
          case SyntaxParamType.float:
            anyThis[key] = parseFloat(val)
            break
          case SyntaxParamType.int:
            anyThis[key] = parseInt(val, 10)
            break
          case SyntaxParamType.stringArray:
            if (!anyThis[key]) { anyThis[key] = [] }
            anyThis[key].push(val)
            break
          case SyntaxParamType.booleanArray:
            if (!anyThis[key]) { anyThis[key] = [] }            
            if (val.toLowerCase() === "yes") {
              anyThis[key].push(true)
            } else if (val.toLowerCase() === "no") {
              anyThis[key].push(false)
            }
            break
          case SyntaxParamType.numberArray:
          case SyntaxParamType.floatArray:
            if (!anyThis[key]) { anyThis[key] = [] } 
            anyThis[key].push(parseFloat(val))
            break
          case SyntaxParamType.intArray:
            if (!anyThis[key]) { anyThis[key] = [] } 
            anyThis[key].push(parseInt(val, 10))
            break
          default:
            anyThis[key] = item.value
            break;
        }
      }
    }
  }
}
  
export interface HistoryDir<T extends SyntaxParam> {
  [id: string]: HistoryObj<T>
}

  
  
export abstract class HistroySyntax<T extends SyntaxParam> extends DirSyntax {
  Dir:HistoryDir<T> = {}
  async handleData() {
    for(let fileName in this.dirData) {
      var syntax = this.dirData[fileName]
      var obj:HistoryObj<T> = {
        FileName: fileName,
        BaseParam: this.createParam(),
        Timelines: [],
        NowParam: this.createParam(),
      }
      this.Dir[this.getDirKeyByFileName(fileName)] = obj
      this.AddToKeySet(Util.SyntaxArrayGetAllKey(syntax.data))
      obj.BaseParam.SetSyntaxData(syntax.data)
      for(let item of syntax.data) {
        if (item instanceof Object && /^\d+\.\d+.\d+$/.test(item.key)) {
          var Param = this.createParam()
          Param.SetSyntaxData(item.value as SyntaxItem[])
          obj.Timelines.push({
            Time: item.key,
            Param,
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
      obj.NowParam = this.calTimeParam(obj, "1444.11.11")
    }
  }
  calTimeParam(obj: HistoryObj<T>, time:string):T {
    var ret = obj.BaseParam.Copy<T>()
    for(let timeline of obj.Timelines) {
      if (Util.TimeBigThen(timeline.Time, time)) {
        break
      }
      ret.Set(timeline.Param)
    }
    return ret
  }
  keySet:Set<string> = new Set()
  AddToKeySet(arr:string[]){
    for(let k of arr) {
      if (!/^\d/.test(k)) {
        this.keySet.add(k)
      }
    }
  }
  protected abstract getDirKeyByFileName(filename: string): string
  // protected abstract setBaseParam(param: T, data:SyntaxItem[]): void
  protected abstract createParam(): T
}
