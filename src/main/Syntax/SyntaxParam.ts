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
    var anyThis = this as any
    this.ObjSetKeyValueItems(this as any, data, this.TYPES)
  }
  // [{key: k1, value: v1}, {key: k2, value: v2} ...] => {k1: v1, k2: v2}
  private ObjSetKeyValueItems(obj: any, items:SyntaxItem[], type: SyntaxParamKeyValueType) {
    for(let item of items) {
      if (item instanceof Object) {
        if(type[item.key] !== undefined) {
          this.ObjSetSyntaxValue(obj, item, type[item.key])
        } else {
          if (type.ANY !== undefined) {
            if (obj.ANY === undefined) obj.ANY = {}
            this.ObjSetSyntaxValue(obj.ANY, item, type.ANY)
          }
        }
      } else {
        //Todo
      }
    }
    return obj
  }
  // obj[item.key] = obj[item.value] => type
  private ObjSetSyntaxValue(obj: any, item:SyntaxKeyValue, type: SyntaxParamType) {
    if (type !== undefined) {
      if (type instanceof Array) {
        this.ObjSetSyntaxValueArrayType(obj, item, type)
      } 
      else {
        obj[item.key] = this.GetSyntaxValue(item.value, type)
      }
    }
  }
  private ObjSetSyntaxValueArrayType(obj: any, item:SyntaxKeyValue, type: SyntaxParamArrayType) {
    if (!obj[item.key]) {
      obj[item.key] = []
    }
    obj[item.key] = obj[item.key].concat(this.GetSyntaxValue(item.value, type))
  }
  private GetSyntaxValue(value:SyntaxValue, type:SyntaxParamType):any 
  {
    if (type instanceof Array) {
      if (value instanceof Array) {
        return (value as SyntaxItem[]).map(item=>this.GetSyntaxValue(item, type[0]))
      } else {
        return this.GetSyntaxValue(value, type[0])
      }
    } else if (type instanceof Object) {
      if (value instanceof Array) {
        var obj:any = {}
        this.ObjSetKeyValueItems(obj, value, type)
        return obj
      } else if (value instanceof Object) {
        if(type[value.key] !== undefined) {
          obj[value.key] = this.GetSyntaxValue(value.value, type[value.key])
        }
      }
      return obj
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
