import { SyntaxItem, SyntaxKeyValue, SyntaxValue } from "./Syntax"

export enum SyntaxParamSimpleType {
  any,

  string,
  boolean,
  number,
  int,
  float,

  // stringArray,
  // booleanArray,
  // numberArray,
  // intArray,
  // floatArray,
}

// // 特殊标识符, 解析时按一定规则处理
// export enum SyntaxIdentifier {
//   None,
//   CountryTag,
//   ProvinceId,
//   Time,
// }
export type SyntaxParamArrayType = SyntaxParamType[]
export type SyntaxParamKeyValueType = {
  ANY?: SyntaxParamType,
  [key: string] : SyntaxParamType
}

export type SyntaxParamType = SyntaxParamSimpleType | SyntaxParamArrayType | SyntaxParamKeyValueType

export abstract class SyntaxParam {
  // IdentifierType: {
  //   CountryTag?: SyntaxParamType
  //   ProvinceId?: SyntaxParamType
  // }
  TYPES : SyntaxParamKeyValueType
  abstract CreateInstance(): any
  Copy<T extends SyntaxParam>(): T {
    var ret = this.CreateInstance()
    var anyThis = this as any
    ret.TYPES = JSON.parse(JSON.stringify(this.TYPES))
    for(var key in this.TYPES) {
      ret[key] = JSON.parse(JSON.stringify(anyThis[key]))
    }
    return ret
  }
  Set(param: SyntaxParam): void {
    var anyThis = this as any
    var anyParam = param as any
    for (let key in this.TYPES) {
      anyThis[key] = JSON.parse(JSON.stringify(anyParam[key]))
    }
  }
  SetSyntaxData(data:SyntaxItem[]) {
    for(let key in this.TYPES) {
      // if (this.key)
    }
    if (this.TYPES.Any !== undefined) {

    }

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
          case SyntaxParamSimpleType.string:
            anyThis[key] = val
            break
          case SyntaxParamSimpleType.boolean:
            if (val.toLowerCase() === "yes") {
              anyThis[key] = true
            } else if (val.toLowerCase() === "no") {
              anyThis[key] = false
            }
            break
          case SyntaxParamSimpleType.number:
          case SyntaxParamSimpleType.float:
            anyThis[key] = parseFloat(val)
            break
          case SyntaxParamSimpleType.int:
            anyThis[key] = parseInt(val, 10)
            break
          // case SyntaxParamSimpleType.stringArray:
          //   if (!anyThis[key]) { anyThis[key] = [] }
          //   anyThis[key].push(val)
          //   break
          // case SyntaxParamSimpleType.booleanArray:
          //   if (!anyThis[key]) { anyThis[key] = [] }            
          //   if (val.toLowerCase() === "yes") {
          //     anyThis[key].push(true)
          //   } else if (val.toLowerCase() === "no") {
          //     anyThis[key].push(false)
          //   }
          //   break
          // case SyntaxParamSimpleType.numberArray:
          // case SyntaxParamSimpleType.floatArray:
          //   if (!anyThis[key]) { anyThis[key] = [] } 
          //   anyThis[key].push(parseFloat(val))
          //   break
          // case SyntaxParamSimpleType.intArray:
          //   if (!anyThis[key]) { anyThis[key] = [] } 
          //   anyThis[key].push(parseInt(val, 10))
          //   break
          default:
            anyThis[key] = item.value
            break;
        }
      }
    }
  }
  private GetSyntaxValue(value:SyntaxValue, type:SyntaxParamType):any 
  {
    if (type instanceof Array) {
      return (value as SyntaxItem[]).map(item=>this.GetSyntaxValue(item, type[0]))
    } else if (type instanceof Object) {
      if (value instanceof Array) {
        var obj:any = {}
        for(let valueItem of value) {
          if (valueItem instanceof Object) {
            if(type[valueItem.key] !== undefined) {
              obj[valueItem.key] = this.GetSyntaxValue(valueItem.value, type[valueItem.key])
            }
          } else {
            //Todo
          }
        }
      } else if (value instanceof Object) {
        if(type[value.key] !== undefined) {
          obj[value.key] = this.GetSyntaxValue(value.value, type[value.key])
        }
    }
    } else {
      return this.GetSyntaxValueSimple(value as string, type)
    }
  }
  private GetSyntaxValueSimple(val:string, type: SyntaxParamSimpleType) {
    switch (type) {
      case SyntaxParamSimpleType.string:
        return val
        break
      case SyntaxParamSimpleType.boolean:
        if (val.toLowerCase() === "yes") {
          return true
        } else if (val.toLowerCase() === "no") {
          return false
        }
        break
      case SyntaxParamSimpleType.number:
      case SyntaxParamSimpleType.float:
        return parseFloat(val)
        break
      case SyntaxParamSimpleType.int:
        return parseInt(val, 10)
        break
      default:
        return val;
    }
  }
}
