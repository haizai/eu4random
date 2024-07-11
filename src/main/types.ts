export enum SyntaxParamSimpleType {
  any,
  string,
  boolean,
  number,
  int,
  float,
}
export type SyntaxParamArrayType = SyntaxParamType[]
export type SyntaxParamKeyValueType = {
  ANY?: SyntaxParamType,
  [key: string] : SyntaxParamType
}

export type SyntaxParamType = SyntaxParamSimpleType | SyntaxParamArrayType | SyntaxParamKeyValueType


// 省份范围
export type ProvinceRange = {
  Undefined?: number[]
  [key:string]:number[]
} 