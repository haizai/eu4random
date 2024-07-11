import Util from "../../Util";
import { ProvinceRange } from "../types";
import Managers from "./Managers";

interface CountryEntry {
  tag: string,
  capital: number,
  provinces: number[],
  mapAdjacentLands: number[], // 只和provinces相关
  mapSameSeaLands: number[], // 只和provinces相关
  weight: number,
}

enum ConfigCapital {
  Original,
  CapitalContinent,
  CapitalArea,
  CapitalRegion,
  CapitalSuperregion,
  StartOwner,
  StartCore,
  CountryCulture,
  CountryCultureGroup,
  CountryReligion,
  CountryReligionGroup,
  CountryTechnologyGroup,
  World,
  
}
enum ConfigCountryWeight {
  None,
  Random,
  Development,
  OwnerCount,
}
enum ConfigStartCountry {
  Start,
  HasCore,
  All,
}
enum ConfigProvinceDistance {
  None,
  Distance,
  DistanceSquare,
  DistanceRooting,
}
enum ConfigProvinceCulture {
  None,
  SameCulture,
  SameCultureGroup,
}
enum ConfigProvincePosition {
  None,
  SameArea,
  SameRegion,
  SameSuperregion,
}
enum ConfigProvinceReligion {
  None,
  SameReligion,
  SameReligionGroup,
}

const Config = {
  Capital: ConfigCapital.Original,
  CountryWeight: ConfigCountryWeight.Development,
  StartCountry: ConfigStartCountry.Start,
  StartCountryPercent: 1,
  ProvinceWeight: {
    Distance: ConfigProvinceDistance.None,
    Culture: ConfigProvinceCulture.SameCultureGroup,
    Position: ConfigProvincePosition.SameSuperregion,
    Religion: ConfigProvinceReligion.SameReligionGroup,
  },
}

class ProvinceWeight {
  data:{
    tags: string[]
    weight: number
  }[] = []
  map: Map<number, string[]> = new Map()
  addWeight(tag:string, weight:number) {
    if(!this.map.has(weight)) {
      this.map.set(weight,[tag])
    } else {
      this.map.get(weight).push(tag)
    }
  }
  sort() {
    let keys = Array.from(this.map.keys()).sort((a,b)=>b-a)
    for(let weight of keys) {
      this.data.push({
        weight,
        tags: this.map.get(weight)
      })
    }
  }
  hasRankTag(rank: number, tag: string):boolean {
    if (this.data.length <= rank) {
      return false
    }
    if(this.data[rank].tags.length == 0) {
      return false
    }
    var index = this.data[rank].tags.indexOf(tag)
    if (index >= 0) {
      // this.data[rank].tags.splice(index, 1)
      return true
    }
    return false
  }
  hasSameSeaRankTag(rank: number, tag: string):boolean {
    if (this.data.length <= rank) {
      return false
    }
    if(this.data[rank].tags.length != 1) {
      return false
    }
    if(this.data[rank].tags[0] == tag) {
      if (rank == this.data.length - 1) {
        return true
      }
      if (this.data[rank].weight>=this.data[rank+1].weight*2) {
        return true
      }
    }
    return false
  }
  findBiggestTag() {
    return Util.randomFromArray(this.data[0].tags)
  }
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
    [province: number]: ProvinceWeight,
  } = {}

  calCountryWeight(tag: string) {
    var config = Config.CountryWeight
    switch (config) {
      case ConfigCountryWeight.None:
        return 1
        break;
      case ConfigCountryWeight.Random:
        return Math.random()
      case ConfigCountryWeight.Development:
        return Managers.Country.getDevelopment(tag)
      case ConfigCountryWeight.OwnerCount:
        return Managers.Country.getOwnersCount(tag)
      default:
        break;
    }
    return 1
  }

  calCapital() {
    var config = Config.Capital
    if (config == ConfigCapital.Original) {
      Util.shuffleArray(Array.from(this.selectableCountry)).forEach(tag => {
        let capital = Managers.File.HistoryCountries.Dir[tag].NowParam.capital
        if (capital && this.waitUseProvince.has(capital)) {
          this.countryDir[tag] = {
            tag,
            capital,
            provinces: [],
            mapAdjacentLands: [],
            mapSameSeaLands: [],
            weight:this.calCountryWeight(tag)
          }
          this.countryAddProvince(tag, capital)
        } else {
          // 没有可用的首都, 该国家不存在
          this.selectableCountry.delete(tag)
        }
      });
      return
    }
    let getProvinceFun:(province: number) => string
    let getProvinceArrayFun:(province: number) => string[]
    let getTagkey:(tag: string) => string
    switch (config) {
      case ConfigCapital.CapitalContinent:
        getProvinceFun = Managers.Province.getContinent
        break
      case ConfigCapital.CapitalArea:
        getProvinceFun = Managers.Province.getArea
        break
      case ConfigCapital.CapitalRegion:
        getProvinceFun = Managers.Province.getRegion
        break
      case ConfigCapital.CapitalSuperregion:
        getProvinceFun = Managers.Province.getSupreregion
        break
      case ConfigCapital.StartOwner:
        getProvinceFun = (province: number) => Managers.File.HistoryProvinces.Dir[province].NowParam.owner
        break
      case ConfigCapital.StartCore:
        getProvinceArrayFun = (province: number) => Managers.File.HistoryProvinces.Dir[province].NowParam.GetCores()
        getTagkey = tag => tag
        break
      case ConfigCapital.CountryCulture:
        getProvinceFun = (province: number) => Managers.File.HistoryProvinces.Dir[province].NowParam.culture
        getTagkey = tag => Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture
        break
      case ConfigCapital.World:
        getProvinceFun = (province: number) => "World"
        getTagkey = tag => "World"
        break
      case ConfigCapital.CountryCultureGroup:
        getProvinceFun = (province: number) => Managers.Common.getCultureGroupByCulture(Managers.File.HistoryProvinces.Dir[province].NowParam.culture)
        getTagkey = tag => Managers.Common.getCultureGroupByCulture(Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture)
        break
      case ConfigCapital.CountryReligion:
        getProvinceFun = (province: number) => Managers.File.HistoryProvinces.Dir[province].NowParam.religion
        getTagkey = tag => Managers.File.HistoryCountries.Dir[tag].NowParam.religion
        break
      case ConfigCapital.CountryReligionGroup:
        getProvinceFun = (province: number) => Managers.Common.getReligionGroupByRegion(Managers.File.HistoryProvinces.Dir[province].NowParam.religion)
        getTagkey = tag => Managers.Common.getReligionGroupByRegion(Managers.File.HistoryCountries.Dir[tag].NowParam.religion)
        break
      case ConfigCapital.CountryTechnologyGroup:
        getProvinceArrayFun = (province: number) => Managers.File.HistoryProvinces.Dir[province].NowParam.discovered_by
        getTagkey = tag => Managers.File.HistoryCountries.Dir[tag].NowParam.technology_group
        break
      default:
        break
    }
    let range:ProvinceRange = {}
    this.waitUseProvince.forEach(land => {
      if (getProvinceFun) {
        var key = getProvinceFun(land)
        if (key) {
          if (!range[key]) {
            range[key] = []
          }
          range[key].push(land)
        } else {
          if (!range.Undefined) {
            range.Undefined = []
          }
          range.Undefined.push(land)
        }
      }
      if (getProvinceArrayFun) {
        var keys = getProvinceArrayFun(land)
        keys.forEach(key=>{
          if (key) {
            if (!range[key]) {
              range[key] = []
            }
            range[key].push(land)
          } else {
            if (!range.Undefined) {
              range.Undefined = []
            }
            range.Undefined.push(land)
          }
        })
      }
    });
    Util.shuffleArray(Array.from(this.selectableCountry)).forEach(tag => {
      // 默认使用开局首都的范围
      if (!getTagkey) 
        var key = getProvinceFun(Managers.File.HistoryCountries.Dir[tag].NowParam.capital)
      else
        var key = getTagkey(tag)
      if (key && range[key]) {
        var capital = Util.randomFromArray(range[key].filter(x=>this.waitUseProvince.has(x)))
      } else if (range.Undefined && range.Undefined.length > 0) {
        var capital = Util.randomFromArray(range.Undefined.filter(x=>this.waitUseProvince.has(x)))
      }
      if (capital && this.waitUseProvince.has(capital)) {
        this.countryDir[tag] = {
          tag,
          capital,
          provinces: [],
          mapAdjacentLands: [],
          mapSameSeaLands: [],
          weight: this.calCountryWeight(tag)
        }
        this.countryAddProvince(tag, capital)
      } else {
        // 没有可用的首都, 该国家不存在
        this.selectableCountry.delete(tag)
      }
    });

  }

  calStartCountry() {

    let config = Config.StartCountry
    let tags:Set<string> = new Set()
    switch (config) {
      case ConfigStartCountry.Start:
        // 使用开局存在的国家, 开局被控制的省份
        for(let provinceId in Managers.File.HistoryProvinces.Dir) {
          let data = Managers.File.HistoryProvinces.Dir[provinceId]
          if (data && data.NowParam.owner) {
            tags.add(data.NowParam.owner)
            this.waitUseProvince.add(parseInt(provinceId))
          }
        }
        Util.getRandomSubset(Array.from(tags), Config.StartCountryPercent).forEach(tag=>this.selectableCountry.add(tag))
        break;
      case ConfigStartCountry.HasCore:
        // 使用开局存在核心, 开局被控制的省份
        for(let provinceId in Managers.File.HistoryProvinces.Dir) {
          let data = Managers.File.HistoryProvinces.Dir[provinceId]
          if (data && data.NowParam.owner) {
            data.NowParam.GetCores().forEach(core=>tags.add(core))
            this.waitUseProvince.add(parseInt(provinceId))
          }
        }
        Util.getRandomSubset(Array.from(tags), Config.StartCountryPercent).forEach(tag=>this.selectableCountry.add(tag))
        break;
      case ConfigStartCountry.All:
        // 使用开局存在核心, 开局被控制的省份
        for(let provinceId in Managers.File.HistoryProvinces.Dir) {
          let data = Managers.File.HistoryProvinces.Dir[provinceId]
          if (data && data.NowParam.owner) {
            // data.NowParam.GetCores().forEach(core=>this.selectableCountry.add(core))
            this.waitUseProvince.add(parseInt(provinceId))
          }
        }
        Util.getRandomSubset(Object.keys(Managers.File.CommonCountrytags.param.ANY), Config.StartCountryPercent).forEach(tag=>this.selectableCountry.add(tag))
        break;
      default:
        break;
    }


  }
  calProvinceWeight(tag:string, province:number) {
    return this.calProvinceWeightDistance(tag, province) * this.calProvinceWeightCulture(tag, province) * this.calProvinceWeightReligion(tag, province) * this.calProvinceWeightPosition(tag, province)
  }
  calProvinceWeightDistance(tag:string, province:number) {
    switch (Config.ProvinceWeight.Distance) {
      case ConfigProvinceDistance.None:
        return 1;
      case ConfigProvinceDistance.Distance:
        return 10000 / Managers.Province.calDistanceSquare(province,this.countryDir[tag].capital)**0.5;
      case ConfigProvinceDistance.DistanceSquare:
        return 10000 / Managers.Province.calDistanceSquare(province,this.countryDir[tag].capital);
      case ConfigProvinceDistance.DistanceRooting:
        return 10000 / Managers.Province.calDistanceSquare(province,this.countryDir[tag].capital)**0.25;
    }
    return 1
  }
  calProvinceWeightCulture(tag:string, province:number) {
    switch (Config.ProvinceWeight.Culture) {
      case ConfigProvinceCulture.None:
        return 1;
      case ConfigProvinceCulture.SameCulture:
        return Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture == Managers.File.HistoryProvinces.Dir[province].NowParam.culture ? 2 : 1
      case ConfigProvinceCulture.SameCultureGroup:
        let primary_culture = Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture
        let proCulture = Managers.File.HistoryProvinces.Dir[province].NowParam.culture
        if (primary_culture == proCulture)
          return 4
        return Managers.Common.getCultureGroupByCulture(primary_culture) == Managers.Common.getCultureGroupByCulture(proCulture) ? 2 : 1
    }
    return 1
  }
  calProvinceWeightReligion(tag:string, province:number) {
    switch (Config.ProvinceWeight.Religion) {
      case ConfigProvinceReligion.None:
        return 1;
      case ConfigProvinceReligion.SameReligion:
        return Managers.File.HistoryCountries.Dir[tag].NowParam.religion == Managers.File.HistoryProvinces.Dir[province].NowParam.religion ? 2 : 1
      case ConfigProvinceReligion.SameReligionGroup:
        let tagReligion = Managers.File.HistoryCountries.Dir[tag].NowParam.religion
        let proReligon = Managers.File.HistoryProvinces.Dir[province].NowParam.religion
        if (tagReligion == proReligon)
          return 4
        return Managers.Common.getReligionGroupByRegion(tagReligion) == Managers.Common.getReligionGroupByRegion(proReligon) ? 2 : 1
    }
    return 1
  }
  calProvinceWeightPosition(tag:string, province:number) {
    let ret = 1
    switch (Config.ProvinceWeight.Position) {
      case ConfigProvincePosition.None:
        return 1;
      case ConfigProvincePosition.SameArea:
        return Managers.Province.getArea(this.countryDir[tag].capital) == Managers.Province.getArea(province) ? 2 : 1
      case ConfigProvincePosition.SameRegion:
        ret *= Managers.Province.getArea(this.countryDir[tag].capital) == Managers.Province.getArea(province) ? 2 : 1
        ret *= Managers.Province.getRegion(this.countryDir[tag].capital) == Managers.Province.getRegion(province) ? 2 : 1
        return ret
      case ConfigProvincePosition.SameSuperregion:
        ret *= Managers.Province.getArea(this.countryDir[tag].capital) == Managers.Province.getArea(province) ? 2 : 1
        ret *= Managers.Province.getRegion(this.countryDir[tag].capital) == Managers.Province.getRegion(province) ? 2 : 1
        ret *= Managers.Province.getSupreregion(this.countryDir[tag].capital) == Managers.Province.getSupreregion(province) ? 2 : 1
        return ret
    }
    return 1
  }
  async initData() {

    this.calStartCountry()
    this.calCapital()

    


    this.waitUseProvince.forEach(province => {
      // 先重新洗牌再排序
      let provinceWeight = new ProvinceWeight() 
      this.provinceWeight[province] = provinceWeight
      Array.from(this.selectableCountry).forEach(tag=>{
        provinceWeight.addWeight(tag, 10000 / Managers.Province.calDistanceSquare(province,this.countryDir[tag].capital)**0.5 * this.countryDir[tag].weight)
        // 10000 / Managers.Province.calDistanceSquare(province,this.countryDir[tag].capital)
      })
      provinceWeight.sort()
    }) 

    this.usedCountry = Array.from(this.selectableCountry)

    
    var rank = 0
    while(this.usedCountry.length > 0 && rank < this.selectableCountry.size) {

      var rankAdd = true
      do {
        rankAdd = true
        Util.shuffleArray(this.usedCountry)
        for(var i = this.usedCountry.length -1; i>=0; i--) {
          var tag = this.usedCountry[i]
          let lands = this.getNowCountryAdjacentLands(tag)
          for(let land of lands) {
            var weight = this.provinceWeight[land]
            if(weight && weight.hasRankTag(rank, tag)) {
              this.countryAddProvince(tag, land)
              delete this.provinceWeight[land]
              rankAdd = false
              break
            }
          }
          let seaSealands = this.getNowCountrySameSeaLands(tag)
          for(let land of seaSealands) {
            var weight = this.provinceWeight[land]
            if(weight && weight.hasSameSeaRankTag(rank, tag)) {
              this.countryAddProvince(tag, land)
              delete this.provinceWeight[land]
              rankAdd = false
              break
            }
          }

          if (lands.length == 0 && seaSealands.length == 0) {
            this.usedCountry.splice(i, 1)
          }
        }
      } while (!rankAdd)
      rank++
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
      this.countryAddProvince(this.provinceWeight[province].findBiggestTag(),province)
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
      if (entry.capital != Managers.File.HistoryCountries.Dir[tag].NowParam.capital) {
        await Managers.File.HistoryCountries.setCapitalThenWriteFile(tag, entry.capital)
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