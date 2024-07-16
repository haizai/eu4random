import { SyntaxItem, SyntaxKeyValue, SyntaxValue } from "./Syntax/Syntax";

export default class Util {
  static calColorInt(r:number, g:number, b:number) {
    return r * 0x10000 + g * 0x100 + b;
  }
  static calColorByColorInt(colorInt:number):[number,number,number] {
    const r = Math.floor(colorInt / 0x10000)
    const g = Math.floor((colorInt - 0x10000 * r)/0x100)
    const b = colorInt - 0x10000 * r - 0x100 * g
    return [r,g,b]
  }
  static SyntaxArrayFindOne(arr:SyntaxValue, key: string): SyntaxValue {
    if (arr && arr instanceof Array) {
      for (var item of arr) {
        if (item instanceof Object) {
          if (item.key == key) {
            return item.value
          }
        }
      }
    }
    return null
  }
  static SyntaxArrayFindArray(arr:SyntaxValue, key: string):SyntaxValue[] {
    var ret:SyntaxValue[] = []
    if (arr && arr instanceof Array) {
      for (var item of arr) {
        if (item instanceof Object) {
          if (item.key == key) {
            ret.push(item.value)
          }
        }
      }
    }
    return ret
  }
  static SyntaxArrayGetAllKey(arr:SyntaxValue):string[] {
    var ret:string[] = []
    if (arr && arr instanceof Array) {
      for (var item of arr) {
        if (item instanceof Object) {
          ret.push(item.key)
        }
      }
    }
    return ret
  }
  
  static GetYMDbyTime(str:string):[number, number, number] {
    var arr = str.split(".")
    return [parseInt(arr[0], 10), parseInt(arr[1], 10),parseInt(arr[1], 10) ]
  }
  static TimeBigThen(t1:string, t2:string):boolean {
    var [y1, m1, d1] = this.GetYMDbyTime(t1)
    var [y2, m2, d2] = this.GetYMDbyTime(t2)
    if (y1 > y2) return true
    if (y1 < y2) return false
    if (m1 > m2) return true
    if (m1 < m2) return false
    return d1 > d2
  }
  static randomFromArray<T>(array: T[]): T {
    if (!array || array.length == 0) {
      return undefined
    }
    return array[this.random(0, array.length - 1)]
  }
  
  static randomSpliceFromArray<T>(array: T[]): T {
    var index = this.random(0, array.length - 1)
    var item = array.splice(index, 1)[0]
    return item
  }
  static random(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  static findMaxIndex(numbers:number[]) {
    let maxIndex = -1;
    let maxValue = -Infinity;
    
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] > maxValue) {
        maxValue = numbers[i];
        maxIndex = i;
      }
    }
    return maxIndex
  }
  static calMinIndex(numbers:number[]) {
    let minIndex = -1;
    let minValue = +Infinity;
    
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < minValue) {
        minValue = numbers[i];
        minIndex = i;
      }
    }
    return minIndex
  }
  static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      // 随机选择一个索引，范围从0到i（包括i）
      const j = Math.floor(Math.random() * (i + 1));
      // 交换元素array[i]和array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  static getRandomSubset<T>(array: T[], percentage: number): T[] {
    // 计算需要筛选出的元素数量
    const subsetSize = Math.floor(array.length * percentage);
    
    // 随机打乱数组
    const shuffledArray = [].concat(array)
    this.shuffleArray(shuffledArray);
  
    // 从打乱后的数组中取出所需数量的元素
    return shuffledArray.slice(0, subsetSize);
  }
}