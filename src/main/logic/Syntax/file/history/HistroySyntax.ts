import Util from '../../../Util'
import DirSyntax from '../../DirSyntax'
import { SyntaxItem } from '../../Syntax'
import { SyntaxParam } from '../../SyntaxParam'

export interface HistoryObj<T extends SyntaxParam> {
  FileName: string // 文件名
  BaseParam: T
  Timelines: HistoryTimeline<T>[]
  NowParam: T
}
export interface HistoryTimeline<T extends SyntaxParam> {
  Time: string
  Param: T
}
export interface HistoryDir<T extends SyntaxParam> {
  [id: string]: HistoryObj<T>
}

export abstract class HistroySyntax<T extends SyntaxParam> extends DirSyntax {
  Dir: HistoryDir<T> = {}
  async handleData() {
    for (const fileName in this.dirData) {
      const syntax = this.dirData[fileName]
      const obj: HistoryObj<T> = {
        FileName: fileName,
        BaseParam: this.createParam(),
        Timelines: [],
        NowParam: this.createParam()
      }
      this.Dir[this.getDirKeyByFileName(fileName)] = obj
      this.AddToKeySet(Util.SyntaxArrayGetAllKey(syntax.data))
      obj.BaseParam.SetSyntaxData(syntax.data)
      for (const item of syntax.data) {
        if (item instanceof Object && /^\d+\.\d+.\d+$/.test(item.key)) {
          const Param = this.createParam()
          Param.SetSyntaxData(item.value as SyntaxItem[])
          obj.Timelines.push({
            Time: item.key,
            Param
          })
        }
      }
      obj.Timelines.sort((t1, t2) => {
        const [y1, m1, d1] = Util.GetYMDbyTime(t1.Time)
        const [y2, m2, d2] = Util.GetYMDbyTime(t2.Time)
        const t1T = y1 * 10000 + m1 * 100 + d1
        const t2T = y2 * 10000 + m2 * 100 + d2
        return t1T - t2T
      })
      obj.NowParam = this.calTimeParam(obj, '1444.11.11')
    }
  }
  calTimeParam(obj: HistoryObj<T>, time: string): T {
    const ret = obj.BaseParam.Copy<T>()
    for (const timeline of obj.Timelines) {
      if (Util.TimeBigThen(timeline.Time, time)) {
        break
      }
      ret.Set(timeline.Param)
    }
    return ret
  }
  keySet: Set<string> = new Set()
  AddToKeySet(arr: string[]) {
    for (const k of arr) {
      if (!/^\d/.test(k)) {
        this.keySet.add(k)
      }
    }
  }
  protected abstract getDirKeyByFileName(filename: string): string
  // protected abstract setBaseParam(param: T, data:SyntaxItem[]): void
  protected abstract createParam(): T
}
