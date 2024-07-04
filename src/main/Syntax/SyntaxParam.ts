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
    if (this.TYPES) {
      for(var key in this.TYPES) {
        if (anyThis[key] !== undefined) {
          ret[key] = JSON.parse(JSON.stringify(anyThis[key]))
        }
      }
    }
    return ret
  }
  Set(param: SyntaxParam): void {
    var anyThis = this as any
    var anyParam = param as any
    for (let key in this.TYPES) {
      if (anyParam[key] !== undefined) {
        anyThis[key] = JSON.parse(JSON.stringify(anyParam[key]))
      }
    }
  }
  SetSyntaxData(data:SyntaxItem[]) {
    // for(let key in this.TYPES) {
    //   // if (this.key)
    // }
    // if (this.TYPES.Any !== undefined) {

    // }
    var anyThis = this as any
    for (var item of data) {
      if (item instanceof Object && this.TYPES[item.key] !== undefined) {
        var typeType = this.TYPES[item.key]
        if (typeType instanceof Array) {
          if (!anyThis[item.key]) {
            anyThis[item.key] = []
          }
          anyThis[item.key] = anyThis[item.key].concat(this.GetSyntaxValue(item, typeType))
        } 
        else {
          anyThis[item.key] = this.GetSyntaxValue(item.value, this.TYPES[item.key])
        }
      }
    }
  }
  private GetSyntaxValue(value:SyntaxValue, type:SyntaxParamType):any 
  {
    if (type instanceof Array) {
      if (value instanceof Array) {
        return (value as SyntaxItem[]).map(item=>this.GetSyntaxValue(item, type))
      } else {
        return this.GetSyntaxValue(value, type[0])
      }
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
        return obj
      } else if (value instanceof Object) {
        if(type[value.key] !== undefined) {
          obj[value.key] = this.GetSyntaxValue(value.value, type[value.key])
        }
    }
    } else {
      if (value )
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
