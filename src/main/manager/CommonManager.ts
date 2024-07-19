import Managers from './Managers'

export default class CommonManager {
  getCultureGroupByCulture = (culture: string) => this.cultureToGroupDir[culture]
  getReligionGroupByRegion = (religion: string) => this.religionToGroupDir[religion]

  private cultureToGroupDir: { [culture: string]: string } = {}
  private religionToGroupDir: { [culture: string]: string } = {}
  initData() {
    for (const cultureGroup in Managers.File.CommonCultures.param.ANY) {
      const item = Managers.File.CommonCultures.param.ANY[cultureGroup]
      if (item.ANY) {
        Object.keys(item.ANY).forEach((culture) => {
          this.cultureToGroupDir[culture] = cultureGroup
        })
      }
    }
    for (const religionGroup in Managers.File.CommonReligions.param.ANY) {
      const item = Managers.File.CommonReligions.param.ANY[religionGroup]
      if (item.ANY) {
        Object.keys(item.ANY).forEach((religion) => {
          this.religionToGroupDir[religion] = religionGroup
        })
      }
    }
  }
}
