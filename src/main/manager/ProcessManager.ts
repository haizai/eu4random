import Util from "../../Util";
import Managers from "./Managers";

interface CountryEntry {
  tag: string,
  capital: number,
  provinces: number[],
  mapAdjacentLands: number[], // 只和provinces相关
}

export default class ProcessManager {

  countryDir: {
    [tag: string]: CountryEntry,
  } = {

  }
  selectableCountry :Set<string> = new Set() // 可选的国家
  waitUseProvince :Set<number> = new Set()// 待选的省份


  async initData() {

    // 使用开局存在的国家, 开局被控制的省份
    for(let provinceId in Managers.File.HistoryProvinces.Dir) {
      let data = Managers.File.HistoryProvinces.Dir[provinceId]
      if (data && data.NowParam.owner) {
        this.selectableCountry.add(data.NowParam.owner)
        this.waitUseProvince.add(parseInt(provinceId))
      }
    }
    // 使用开局的首都
    this.selectableCountry.forEach(tag => {
      let capital = Managers.File.HistoryCountries.Dir[tag].NowParam.capital
      this.countryDir[tag] = {
        tag,
        capital,
        provinces: [],
        mapAdjacentLands: [],
      }
      this.countryAddProvince(tag, capital)
    });

    for(var tag in this.countryDir) {
      let lands = this.getNowCountryAdjacentLands(tag)
      lands.forEach(land => this.countryAddProvince(tag, land))
    }

    for(let tag in this.countryDir) {
      let entry = this.countryDir[tag]
      for(let province of entry.provinces) {
        await Managers.File.HistoryProvinces.setOwnerThenWriteFile(province.toString(), tag)
      }
    }
  }
  private countryAddProvince(country:string, province: number) {
    this.waitUseProvince.delete(province)
    var entry = this.countryDir[country]
    if (!entry) return
    if(entry.provinces.includes(province)) return
    entry.provinces.push(province)
    var newAdjacents = Managers.Province.getAdjacentLands(province)
    newAdjacents.forEach(land=>{
      if (!entry.provinces.includes(land) && !entry.mapAdjacentLands.includes(land)) {
        entry.mapAdjacentLands.push(land)
      }
    })

  }
  // 从未被使用的省份里, 查询该国家的相邻省份
  private getNowCountryAdjacentLands(country:string) {
    return this.countryDir[country].mapAdjacentLands.filter(land=>this.waitUseProvince.has(land))
  }
}