
interface SyntaxKeyValue {
  key: string;
  value: SyntaxValue
}
type SyntaxItem = SyntaxKeyValue | string
type SyntaxValue = SyntaxItem[] | SyntaxItem | null


// 简略语法分析, #注释, {}范围
class Syntax {
  private static commentReg = /^\s*#.*/

  // Windows-1252 简单的认为ASCII之外的均为可用字符, :在属性中存在, '只在名字中存在
  private static keyEqualSpaceReg =   /^\s*([a-zA-z_0-9\x80-\xff\.:\']+)\s*=\s*/
  private static simpleValueSpaceReg =/^\s*([a-zA-z_0-9\x80-\xff\.:\'\-]+|(\".*?\"))\s*/ // ""非贪婪匹配
  private static leftCurlyReg =/^\s*{\s*/
  private static rightCurlyReg =/^\s*}\s*/
  private static spaceEndReg =/^\s*$/

  private offset = 0
  private str = ""
  private stringifyStr = ""
  data:SyntaxItem[] = []
  comments: string[] = []
  parse(s: string) {
    this.str = s.replace(Syntax.commentReg,"")
    this.parseRoot()
  }
  stringify() {
    this.stringifyStr = ""
    for (let item of this.data) {
      this.stringifyStr += this.stringifySyntaxValue(item) + "\n"
    }
    return this.stringifyStr
  }
  dataRemoveByKey(key:string) {
    let ret = false
    for (let i = this.data.length - 1; i >= 0; i--) {
      var item = this.data[i]
      if (item && item instanceof Object && item.key == key) {
        ret = true
        this.data.splice(i, 1)
      }
    }
    return ret
  }
  dataRemoveByKeys(keys:string[]) {
    let ret = false
    for (let i = this.data.length - 1; i >= 0; i--) {
      var item = this.data[i]
      if (item && item instanceof Object && keys.includes(item.key)) {
        ret = true
        this.data.splice(i, 1)
      }
    }
    return ret
  }
  dataPushKeyValue(key: string, value:SyntaxValue) {
    this.data.push({
      key,
      value
    })
  }

  private stringifySyntaxValue(item:SyntaxValue, tabLevel: number = 0) :string{
    if (item === null) {
      return ""
    } else if (item instanceof Array) {
      if (item.length == 0) {
        return "{}"
      } else if (typeof(item[0]) == "string") {
        return `{ ${item.join(" ")} }`
      } else {
        return `{\n${item.map(i=>"\t".repeat(tabLevel+1) + this.stringifySyntaxValue(i, tabLevel+1)).join("\n")}\n${"\t".repeat(tabLevel)}}`
      }
    } else if (typeof(item) == "string") {
      return item
    } else if (item instanceof Object) {
      return `${item.key} = ${this.stringifySyntaxValue(item.value, tabLevel)}`
    } else {
      throw new Error(item)
    }
  }
  private parseKey(): null | string {
    let m = this.match(Syntax.keyEqualSpaceReg)
    if(m && m.length >= 2) {
      let keyEqualSpace = m[0]
      let key = m[1]
      this.offset += keyEqualSpace.length
      return key
    }
    return null
  }
  private parseRoot(){
    this.parseComment()
    while(true) {
      let lastOffset = this.offset
      let skv = this.parseItem()
      this.parseComment()
      if (skv !== null) {
        this.data.push(skv)
      }       
      if (this.isEnd()) {
        break
      }
      if (lastOffset == this.offset) {
        throw new Error(`未解析的字符: ${this.str[this.offset]} ${this.str[this.offset].charCodeAt(0)}`)
      }
    }
  }
  private parseValue(): SyntaxValue {
    let m = this.match(Syntax.leftCurlyReg)
    if (m) {
      this.offset += m[0].length
      var ret:SyntaxValue = []
      while(true) {
        let lastOffset = this.offset
        let skv = this.parseItem()
        this.parseComment()
        if (skv !== null) {
          ret.push(skv)
        }
        if (this.IsParseRightCurly()) {
          break
        }
        if (lastOffset == this.offset) {
          throw new Error(`parse char Error: ${this.str[this.offset]} ${this.str[this.offset].charCodeAt(0)}`)
        }
        // if (skv === null || typeof(skv) == "string") {
        //   break
        // }
      }
      return ret

      // var ret:SyntaxValue = []
      // while(true) {
      //   var skv = this.parseKeyValue()
      //   if (skv !== null) {
      //     ret.push(skv)
      //   }
      //   if (this.IsParseRightCurly()) {
      //     break
      //   }
      // }
      // return ret
    } else {
      return this.parseSimpleValue()
      // var ret:SyntaxValue = []   
      // while(true) {
      //   let skv = this.parseItem()
      //   if (skv !== null) {
      //     ret.push(skv)
      //   } 
      //   if (skv === null || typeof(skv) == "string") {
      //     break
      //   }
      // }
      // return ret
    }
  }
  // 花括号内的, 必须为 key = value的形式
  // private parseKeyValue(): SyntaxKeyValue | null{
  //   var skv:SyntaxKeyValue = {}
  //   skv.key = this.parseKey()
  //   if (skv.key === null) {
  //     return null
  //   }
  //   skv.value = this.parseValue()
  //   if (skv.value === null) {
  //     return null
  //   }
  //   return skv
  // }
  private parseItem(): SyntaxItem | null {
    var key = this.parseKey()
    if (key === null) {
      return this.parseSimpleValue()
    }  
    var value = this.parseValue()
    if (value === null) {
      throw new Error("key = null ???")
      return null
    }
    return {key, value}
  }
  private parseSimpleValue(): null | string {
    let m = this.match(Syntax.simpleValueSpaceReg)
    if(m && m.length >= 2) {
      let simpleValueSpace = m[0]
      let simpleValue = m[1]
      this.offset += simpleValueSpace.length
      return simpleValue
    }
    return null
  }
  private IsParseRightCurly() {
    let m = this.match(Syntax.rightCurlyReg)
    if(m && m.length >= 1) {
      this.offset += m[0].length
      return true
    }
    return false
  }
  private parseComment() {
    let m = this.match(Syntax.commentReg)
    while (m && m.length >= 1) {
      this.comments.push(m[0])
      this.offset += m[0].length
      m = this.match(Syntax.commentReg)
    }
  }
  private isEnd() {
    return this.offset >= this.str.length || this.match(Syntax.spaceEndReg)
  }
  private match(reg:RegExp) {
    return this.str.slice(this.offset).match(reg)
  }
}

export {
  Syntax
};
export type {
  SyntaxKeyValue,
  SyntaxItem,
  SyntaxValue
};
 