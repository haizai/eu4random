import Util from "../../Util";
import Managers from "./Managers";

interface CountryState {
  tag: string,
  capital: number,
  provinces: number[]
}

export default class ProcessManager {

  stateDir: {
    [tag: string]: CountryState,
  } = {

  }
  selectableCountry :Set<string> // 可选的国家
  waitUseProvince :Set<number> // 待选的省份


  initData() {

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
      this.waitUseProvince.delete(capital)
      this.stateDir[tag] = {
        tag,
        capital,
        provinces: [capital]
      }
    });

    
  }
}