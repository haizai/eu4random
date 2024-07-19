import Util from '../main/Util'
import Managers from './Managers'

interface CountryItemData {
  owners: number[]
}

// 开局国家数据
export default class CountryManager {
  private data: { [tag: string]: CountryItemData } = {}

  getOwnersCount(tag: string) {
    if (this.data[tag]) {
      return this.data[tag].owners.length
    }
    return 0
  }
  getDevelopment(tag: string) {
    if (this.data[tag]) {
      return this.data[tag].owners
        .map((land) => {
          let development = 0
          const param = Managers.File.HistoryProvinces.Dir[land].NowParam
          if (param.base_tax) development += param.base_tax
          if (param.base_manpower) development += param.base_manpower
          if (param.base_production) development += param.base_production
          return development
        })
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    }
    return 0
  }

  initData() {
    for (const provinceId in Managers.File.HistoryProvinces.Dir) {
      const data = Managers.File.HistoryProvinces.Dir[provinceId]
      if (data && data.NowParam.owner) {
        const owner = data.NowParam.owner
        if (!this.data[owner]) {
          this.data[owner] = {
            owners: [parseInt(provinceId)]
          }
        } else {
          this.data[owner].owners.push(parseInt(provinceId))
        }
      }
    }
  }
}
