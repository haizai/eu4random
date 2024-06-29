import { SyntaxItem } from "./Syntax"

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
  