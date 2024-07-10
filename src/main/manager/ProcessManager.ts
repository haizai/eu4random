import Util from "../../Util";
import Managers from "./Managers";

interface CountryEntry {
  tag: string,
  capital: number,
  provinces: number[],
  mapAdjacentLands: number[], // 只和provinces相关
  mapSameSeaLands: number[], // 只和provinces相关
}


export default class ProcessManager {

  countryDir: {
    [tag: string]: CountryEntry,
  } = {

  }
  selectableCountry :Set<string> = new Set() // 可选的国家
  waitUseProvince :Set<number> = new Set()// 待选的省份
  usedCountry:string[] = []
  provinceWeight: {
    [province: number]: {
      tag: string,
      weight: number,
    }[],
  } = {}

  calCapital() {
    // 使用开局的首都
    // this.selectableCountry.forEach(tag => {
    //   let capital = Managers.File.HistoryCountries.Dir[tag].NowParam.capital
    //   this.countryDir[tag] = {
    //     tag,
    //     capital,
    //     provinces: [],
    //     mapAdjacentLands: [],
    //     mapSameSeaLands: [],
    //   }
    //   this.countryAddProvince(tag, capital)
    // });

    // 随机相同大陆
    var continentRange = Managers.Map.copyContinentRange()
    var tagDir:{[key:string]: string[]} = {}
    for (const key in continentRange) {
      tagDir[key] = [];
      continentRange[key] = continentRange[key].filter(province=>this.waitUseProvince.has(province))
    }
    this.selectableCountry.forEach(tag => {
      var continent = Managers.Province.getContinent(Managers.File.HistoryCountries.Dir[tag].NowParam.capital)
      var capital = Util.randomSpliceFromArray(continentRange[continent])
      this.countryDir[tag] = {
        tag,
        capital,
        provinces: [],
        mapAdjacentLands: [],
        mapSameSeaLands: [],
      }
      this.countryAddProvince(tag, capital)
    });
  }


  async initData() {

    // 使用开局存在的国家, 开局被控制的省份
    for(let provinceId in Managers.File.HistoryProvinces.Dir) {
      let data = Managers.File.HistoryProvinces.Dir[provinceId]
      if (data && data.NowParam.owner) {
        this.selectableCountry.add(data.NowParam.owner)
        this.waitUseProvince.add(parseInt(provinceId))
      }
    }

    this.calCapital()

    


    this.waitUseProvince.forEach(province => {
      this.provinceWeight[province] = Array.from(this.selectableCountry).map(tag=>{
        return {
          tag,
          weight: 10000 / Managers.Province.calDistanceSquare(province,this.countryDir[tag].capital)
        }
      }).sort((a, b)=>b.weight - a.weight)
    }) 

    this.usedCountry = Array.from(this.selectableCountry)

    
    var temp = 0
    while(this.usedCountry.length > 0 && temp < this.selectableCountry.size) {
      for(var i = this.usedCountry.length -1; i>=0; i--) {
        do {
          var doNext = false;
          var tag = this.usedCountry[i]
          let lands = this.getNowCountryAdjacentLands(tag)
          lands.forEach(land => {
            var weight = this.provinceWeight[land]
            if(weight && weight[temp].tag == tag) {
              doNext = true;
              this.countryAddProvince(tag, land)
            }
          })
          let seaSealands = this.getNowCountrySameSeaLands(tag)
          seaSealands.forEach(land => {
            var weight = this.provinceWeight[land]
             if(weight && weight[temp].tag == tag) {
              if (weight[temp+1].weight < weight[temp].weight * 0.5) {
                // 跨海0.5倍权重
                doNext = true;
                this.countryAddProvince(tag, land)
              }  
            }
          })

          if (lands.length == 0 && seaSealands.length == 0) {
            this.usedCountry.splice(i, 1)
          }
        } while (doNext)
      }
      temp++
    }
    var provinces = Array.from(this.waitUseProvince)
    // 对于所有未分配的省份, 寻找隔海相望的省份中权重最大的那个
    // provinces.forEach(province => {
    //   this.provinceWeight[province].some(weight=>{
    //     if(this.getNowCountrySameSeaLands(weight.tag).includes(province)) {
    //       this.countryAddProvince(weight.tag, province)
    //       return true
    //     }
    //     return false
    //   })
    // });
    
    // 对于所有未分配的省份, 直接分配给权重最大的
    provinces.forEach(province => {
      this.countryAddProvince(this.provinceWeight[province][0].tag,province)
    });

    // do {
    //   var tag = Util.randomFromArray(this.usedCountry)
    //   let lands = this.getNowCountryAdjacentLands(tag)
    //   if (lands.length == 0) {
    //     this.usedCountry.splice(this.usedCountry.indexOf(tag), 1)
    //   } else {
    //     var index = Util.calMinIndex(lands.map(land=>Managers.Province.calDistanceSquare(land, this.countryDir[tag].capital)))
    //     this.countryAddProvince(tag, lands[index])
    //   }
    // } while(this.usedCountry.length > 0)

    for(let tag in this.countryDir) {
      let entry = this.countryDir[tag]
      for(let province of entry.provinces) {
        await Managers.File.HistoryProvinces.setOwnerThenWriteFile(province.toString(), tag)
      }
    }
    for(let province of this.waitUseProvince) {
      await Managers.File.HistoryProvinces.setOwnerThenWriteFile(province.toString(), "{}")
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
    var newSameSea = Managers.Province.getSameSeaLands(province)
    newSameSea.forEach(land=>{
      if (!entry.provinces.includes(land) && !entry.mapSameSeaLands.includes(land)) {
        entry.mapSameSeaLands.push(land)
      }
    })

  }
  // 从未被使用的省份里, 查询该国家的相邻省份
  private getNowCountryAdjacentLands(country:string) {
    return this.countryDir[country].mapAdjacentLands.filter(land=>this.waitUseProvince.has(land))
  }
  // 从未被使用的省份里, 查询该国家的隔海相望省份
  private getNowCountrySameSeaLands(country:string) {
    return this.countryDir[country].mapSameSeaLands.filter(land=>this.waitUseProvince.has(land))
  }
}