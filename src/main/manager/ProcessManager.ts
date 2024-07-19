import Util from '../main/Util'
import Global from '../main/Global'
import ModDescriptionSyntax from '../main/Syntax/file/ModDescriptionSyntax'
import { ProvinceRange } from '../main/types'
import Managers from './Managers'
import path from 'node:path'
import fs from 'node:fs/promises'

interface CountryEntry {
  tag: string
  capital: number
  provinces: number[]
  mapAdjacentLands: number[] // 只和provinces相关
  mapSameSeaLands: number[] // 只和provinces相关
  weight: number
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
  World
}
enum ConfigCountryWeight {
  None,
  Random,
  Development,
  OwnerCount
}
enum ConfigStartCountry {
  Start,
  HasCore,
  All
}
enum ConfigProvinceDistance {
  None,
  Distance,
  DistanceSquare,
  DistanceRooting
}
enum ConfigProvinceCulture {
  None,
  SameCulture,
  SameCultureGroup
}
enum ConfigProvincePosition {
  None,
  SameArea,
  SameRegion,
  SameSuperregion
}
enum ConfigProvinceReligion {
  None,
  SameReligion,
  SameReligionGroup
}

const Config = {
  Capital: ConfigCapital.CountryTechnologyGroup,
  CountryWeight: ConfigCountryWeight.Development,
  StartCountry: ConfigStartCountry.HasCore,
  StartCountryPercent: 1,
  ProvinceWeight: {
    Distance: ConfigProvinceDistance.Distance,
    Culture: ConfigProvinceCulture.SameCultureGroup,
    Position: ConfigProvincePosition.SameSuperregion,
    Religion: ConfigProvinceReligion.SameReligionGroup
  }
}

class ProvinceWeight {
  data: {
    tags: string[]
    weight: number
  }[] = []
  map: Map<number, string[]> = new Map()
  addWeight(tag: string, weight: number) {
    if (!this.map.has(weight)) {
      this.map.set(weight, [tag])
    } else {
      this.map.get(weight)?.push(tag)
    }
  }
  sort() {
    const keys = Array.from(this.map.keys()).sort((a, b) => b - a)
    for (const weight of keys) {
      this.data.push({
        weight,
        tags: this.map.get(weight)!
      })
    }
  }
  hasRankTag(rank: number, tag: string): boolean {
    if (this.data.length <= rank) {
      return false
    }
    if (this.data[rank].tags.length == 0) {
      return false
    }
    const index = this.data[rank].tags.indexOf(tag)
    if (index >= 0) {
      // this.data[rank].tags.splice(index, 1)
      return true
    }
    return false
  }
  hasSameSeaRankTag(rank: number, tag: string): boolean {
    if (this.data.length <= rank) {
      return false
    }
    if (this.data[rank].tags.length != 1) {
      return false
    }
    if (this.data[rank].tags[0] == tag) {
      if (rank == this.data.length - 1) {
        return true
      }
      if (this.data[rank].weight >= this.data[rank + 1].weight * 2) {
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
  //只需执行一次
  async InitData() {
    await Global.init()
    await Managers.File.parseAllFile()
    await Managers.Map.ReadProvinces()
    Managers.Province.initData()
    await Managers.Province.ReadDefinition()
    await Managers.Province.ReadAdjacencies()
    Managers.Province.fillColorIntDir()
    await Managers.Map.fillAllPos()
    Managers.Province.fillAdjacentProvince()
    Managers.Province.calDataByFiles()
    Managers.Common.initData()
    Managers.Country.initData()
  }
  async DoIt() {
    // mod文件重置
    await this.resetModProject()
    // 获取开局国家和可选省份
    this.handleStartCountry()
    // 分配首都
    this.handleCapital()
    // 计算所有省份对每个国家的权重
    this.handleProvinceWeight()
    // 分配所有省份
    this.handleAllProvince()
    // 写入所有文件
    await this.WriteAllFile()
  }
  private countryDir: {
    [tag: string]: CountryEntry
  } = {}
  private selectableCountry: Set<string> = new Set() // 可选的国家
  private waitUseProvince: Set<number> = new Set() // 待选的省份
  private usedCountry: string[] = []
  private provinceWeight: {
    [province: number]: ProvinceWeight
  } = {}

  private calCountryWeight(tag: string) {
    const config = Config.CountryWeight
    switch (config) {
      case ConfigCountryWeight.None:
        return 1
      case ConfigCountryWeight.Random:
        return Math.random()
      case ConfigCountryWeight.Development:
        return Managers.Country.getDevelopment(tag) || 1
      case ConfigCountryWeight.OwnerCount:
        return Managers.Country.getOwnersCount(tag) || 1
      default:
        break
    }
    return 1
  }

  private handleCapital() {
    const config = Config.Capital
    if (config == ConfigCapital.Original) {
      Util.shuffleArray(Array.from(this.selectableCountry)).forEach((tag) => {
        const capital = Managers.File.HistoryCountries.Dir[tag].NowParam.capital
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
      })
      return
    }
    let getProvinceFun: (province: number) => string | undefined
    let getProvinceArrayFun: (province: number) => string[] | undefined
    let getTagkey: (tag: string) => string | undefined
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
        getProvinceFun = (province: number) =>
          Managers.File.HistoryProvinces.Dir[province].NowParam.owner
        break
      case ConfigCapital.StartCore:
        getProvinceArrayFun = (province: number) =>
          Managers.File.HistoryProvinces.Dir[province].NowParam.GetCores()
        getTagkey = (tag) => tag
        break
      case ConfigCapital.CountryCulture:
        getProvinceFun = (province: number) =>
          Managers.File.HistoryProvinces.Dir[province].NowParam.culture
        getTagkey = (tag) => Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture
        break
      case ConfigCapital.World:
        getProvinceFun = () => 'World'
        getTagkey = () => 'World'
        break
      case ConfigCapital.CountryCultureGroup:
        getProvinceFun = (province: number) =>
          Managers.File.HistoryProvinces.Dir[province].NowParam.culture
            ? Managers.Common.getCultureGroupByCulture(
                Managers.File.HistoryProvinces.Dir[province].NowParam.culture
              )
            : undefined
        getTagkey = (tag) =>
          Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture
            ? Managers.Common.getCultureGroupByCulture(
                Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture
              )
            : undefined
        break
      case ConfigCapital.CountryReligion:
        getProvinceFun = (province: number) =>
          Managers.File.HistoryProvinces.Dir[province].NowParam.religion
        getTagkey = (tag) => Managers.File.HistoryCountries.Dir[tag].NowParam.religion
        break
      case ConfigCapital.CountryReligionGroup:
        getProvinceFun = (province: number) =>
          Managers.File.HistoryProvinces.Dir[province].NowParam.religion
            ? Managers.Common.getReligionGroupByRegion(
                Managers.File.HistoryProvinces.Dir[province].NowParam.religion
              )
            : undefined
        getTagkey = (tag) =>
          Managers.File.HistoryCountries.Dir[tag].NowParam.religion
            ? Managers.Common.getReligionGroupByRegion(
                Managers.File.HistoryCountries.Dir[tag].NowParam.religion
              )
            : undefined
        break
      case ConfigCapital.CountryTechnologyGroup:
        getProvinceArrayFun = (province: number) =>
          Managers.File.HistoryProvinces.Dir[province].NowParam.discovered_by
        getTagkey = (tag) => Managers.File.HistoryCountries.Dir[tag].NowParam.technology_group
        break
      default:
        break
    }
    const range: ProvinceRange = {}
    this.waitUseProvince.forEach((land) => {
      if (getProvinceFun) {
        const key = getProvinceFun(land)
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
        const keys = getProvinceArrayFun(land)
        keys?.forEach((key) => {
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
    })
    Util.shuffleArray(Array.from(this.selectableCountry)).forEach((tag) => {
      // 默认使用开局首都的范围
      if (!getTagkey)
        var key = Managers.File.HistoryCountries.Dir[tag].NowParam.capital
          ? getProvinceFun(Managers.File.HistoryCountries.Dir[tag].NowParam.capital)
          : undefined
      else var key = getTagkey(tag)
      let capital
      if (key && range[key]) {
        capital = Util.randomFromArray(range[key]!.filter((x) => this.waitUseProvince.has(x)))
      } else if (range.Undefined && range.Undefined.length > 0) {
        capital = Util.randomFromArray(range.Undefined.filter((x) => this.waitUseProvince.has(x)))
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
    })
  }

  private handleStartCountry() {
    const config = Config.StartCountry
    const tags: Set<string> = new Set()
    switch (config) {
      case ConfigStartCountry.Start:
        // 使用开局存在的国家, 开局被控制的省份
        for (const provinceId in Managers.File.HistoryProvinces.Dir) {
          const data = Managers.File.HistoryProvinces.Dir[provinceId]
          if (data && data.NowParam.owner) {
            tags.add(data.NowParam.owner)
            this.waitUseProvince.add(parseInt(provinceId))
          }
        }
        Util.getRandomSubset(Array.from(tags), Config.StartCountryPercent).forEach((tag) =>
          this.selectableCountry.add(tag)
        )
        break
      case ConfigStartCountry.HasCore:
        // 使用开局存在核心, 开局被控制的省份
        for (const provinceId in Managers.File.HistoryProvinces.Dir) {
          const data = Managers.File.HistoryProvinces.Dir[provinceId]
          if (data && data.NowParam.owner) {
            data.NowParam.GetCores().forEach((core) => tags.add(core))
            this.waitUseProvince.add(parseInt(provinceId))
          }
        }
        Util.getRandomSubset(Array.from(tags), Config.StartCountryPercent).forEach((tag) =>
          this.selectableCountry.add(tag)
        )
        break
      case ConfigStartCountry.All:
        // 使用开局存在核心, 开局被控制的省份
        for (const provinceId in Managers.File.HistoryProvinces.Dir) {
          const data = Managers.File.HistoryProvinces.Dir[provinceId]
          if (data && data.NowParam.owner) {
            // data.NowParam.GetCores().forEach(core=>this.selectableCountry.add(core))
            this.waitUseProvince.add(parseInt(provinceId))
          }
        }
        Util.getRandomSubset(
          Object.keys(Managers.File.CommonCountrytags.param.ANY),
          Config.StartCountryPercent
        ).forEach((tag) => this.selectableCountry.add(tag))
        break
      default:
        break
    }
  }
  private handleProvinceWeight() {
    this.waitUseProvince.forEach((province) => {
      // 先重新洗牌再排序
      const provinceWeight = new ProvinceWeight()
      this.provinceWeight[province] = provinceWeight
      Array.from(this.selectableCountry).forEach((tag) => {
        const weight =
          this.calProvinceWeightDistance(tag, province) *
          this.calProvinceWeightCulture(tag, province) *
          this.calProvinceWeightReligion(tag, province) *
          this.calProvinceWeightPosition(tag, province)
        provinceWeight.addWeight(tag, weight)
      })
      provinceWeight.sort()
    })
  }
  private calProvinceWeightDistance(tag: string, province: number) {
    switch (Config.ProvinceWeight.Distance) {
      case ConfigProvinceDistance.None:
        return 1
      case ConfigProvinceDistance.Distance:
        return (
          10000 / Managers.Province.calDistanceSquare(province, this.countryDir[tag].capital) ** 0.5
        )
      case ConfigProvinceDistance.DistanceSquare:
        return 10000 / Managers.Province.calDistanceSquare(province, this.countryDir[tag].capital)
      case ConfigProvinceDistance.DistanceRooting:
        return (
          10000 /
          Managers.Province.calDistanceSquare(province, this.countryDir[tag].capital) ** 0.25
        )
    }
    return 1
  }
  private calProvinceWeightCulture(tag: string, province: number) {
    switch (Config.ProvinceWeight.Culture) {
      case ConfigProvinceCulture.None:
        return 1
      case ConfigProvinceCulture.SameCulture:
        return Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture ==
          Managers.File.HistoryProvinces.Dir[province].NowParam.culture
          ? 2
          : 1
      case ConfigProvinceCulture.SameCultureGroup:
        const primary_culture = Managers.File.HistoryCountries.Dir[tag].NowParam.primary_culture
        const proCulture = Managers.File.HistoryProvinces.Dir[province].NowParam.culture
        if (!primary_culture || !proCulture) {
          return 1
        }
        if (primary_culture == proCulture) return 4
        return Managers.Common.getCultureGroupByCulture(primary_culture) ==
          Managers.Common.getCultureGroupByCulture(proCulture)
          ? 2
          : 1
    }
    return 1
  }
  private calProvinceWeightReligion(tag: string, province: number) {
    switch (Config.ProvinceWeight.Religion) {
      case ConfigProvinceReligion.None:
        return 1
      case ConfigProvinceReligion.SameReligion:
        return Managers.File.HistoryCountries.Dir[tag].NowParam.religion ==
          Managers.File.HistoryProvinces.Dir[province].NowParam.religion
          ? 2
          : 1
      case ConfigProvinceReligion.SameReligionGroup:
        const tagReligion = Managers.File.HistoryCountries.Dir[tag].NowParam.religion
        const proReligon = Managers.File.HistoryProvinces.Dir[province].NowParam.religion
        if (!tagReligion || !proReligon) {
          return 1
        }
        if (tagReligion == proReligon) return 4
        return Managers.Common.getReligionGroupByRegion(tagReligion) ==
          Managers.Common.getReligionGroupByRegion(proReligon)
          ? 2
          : 1
    }
    return 1
  }
  private calProvinceWeightPosition(tag: string, province: number) {
    let ret = 1
    switch (Config.ProvinceWeight.Position) {
      case ConfigProvincePosition.None:
        return 1
      case ConfigProvincePosition.SameArea:
        return Managers.Province.getArea(this.countryDir[tag].capital) ==
          Managers.Province.getArea(province)
          ? 2
          : 1
      case ConfigProvincePosition.SameRegion:
        ret *=
          Managers.Province.getArea(this.countryDir[tag].capital) ==
          Managers.Province.getArea(province)
            ? 2
            : 1
        ret *=
          Managers.Province.getRegion(this.countryDir[tag].capital) ==
          Managers.Province.getRegion(province)
            ? 2
            : 1
        return ret
      case ConfigProvincePosition.SameSuperregion:
        ret *=
          Managers.Province.getArea(this.countryDir[tag].capital) ==
          Managers.Province.getArea(province)
            ? 2
            : 1
        ret *=
          Managers.Province.getRegion(this.countryDir[tag].capital) ==
          Managers.Province.getRegion(province)
            ? 2
            : 1
        ret *=
          Managers.Province.getSupreregion(this.countryDir[tag].capital) ==
          Managers.Province.getSupreregion(province)
            ? 2
            : 1
        return ret
    }
    return 1
  }
  private handleAllProvince() {
    this.usedCountry = Array.from(this.selectableCountry)
    let rank = 0
    while (this.usedCountry.length > 0 && rank < this.selectableCountry.size) {
      let rankAdd = true
      do {
        rankAdd = true
        Util.shuffleArray(this.usedCountry)
        for (let i = this.usedCountry.length - 1; i >= 0; i--) {
          const tag = this.usedCountry[i]
          const lands = this.getNowCountryAdjacentLands(tag)
          for (const land of lands) {
            var weight = this.provinceWeight[land]
            if (weight && weight.hasRankTag(rank, tag)) {
              this.countryAddProvince(tag, land)
              delete this.provinceWeight[land]
              rankAdd = false
              break
            }
          }
          const seaSealands = this.getNowCountrySameSeaLands(tag)
          for (const land of seaSealands) {
            var weight = this.provinceWeight[land]
            if (weight && weight.hasSameSeaRankTag(rank, tag)) {
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
    const provinces = Array.from(this.waitUseProvince)
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
    provinces.forEach((province) => {
      const tag = this.provinceWeight[province].findBiggestTag()
      if (tag) this.countryAddProvince(tag, province)
    })
  }
  private async WriteAllFile() {
    for (const tag in this.countryDir) {
      const entry = this.countryDir[tag]
      for (const province of entry.provinces) {
        await Managers.File.HistoryProvinces.setOwnerThenWriteFile(province.toString(), tag)
      }
      if (entry.capital != Managers.File.HistoryCountries.Dir[tag].NowParam.capital) {
        await Managers.File.HistoryCountries.setCapitalThenWriteFile(tag, entry.capital)
      }
    }
    for (const province of this.waitUseProvince) {
      await Managers.File.HistoryProvinces.setOwnerThenWriteFile(province.toString(), '{}')
    }
  }
  private async resetModProject() {
    try {
      await fs.access(path.join(Global.eu4DocumentsPath, 'mod', Global.projectName))
      await fs.rm(path.join(Global.eu4DocumentsPath, 'mod', Global.projectName), {
        recursive: true
      })
    } catch {}
    const mod = new ModDescriptionSyntax()
    mod.initData()
    await mod.writeFile(path.join(Global.eu4DocumentsPath, 'mod'))
    await mod.writeFile(Global.eu4DocumentsModProjectPath)
  }
  private countryAddProvince(country: string, province: number) {
    this.waitUseProvince.delete(province)
    const entry = this.countryDir[country]
    if (!entry) return
    if (entry.provinces.includes(province)) return
    entry.provinces.push(province)
    const newAdjacents = Managers.Province.getAdjacentLands(province)
    newAdjacents.forEach((land) => {
      if (!entry.provinces.includes(land) && !entry.mapAdjacentLands.includes(land)) {
        entry.mapAdjacentLands.push(land)
      }
    })
    const newSameSea = Managers.Province.getSameSeaLands(province)
    newSameSea.forEach((land) => {
      if (!entry.provinces.includes(land) && !entry.mapSameSeaLands.includes(land)) {
        entry.mapSameSeaLands.push(land)
      }
    })
  }
  // 从未被使用的省份里, 查询该国家的相邻省份
  private getNowCountryAdjacentLands(country: string) {
    return this.countryDir[country].mapAdjacentLands.filter((land) =>
      this.waitUseProvince.has(land)
    )
  }
  // 从未被使用的省份里, 查询该国家的隔海相望省份
  private getNowCountrySameSeaLands(country: string) {
    return this.countryDir[country].mapSameSeaLands.filter((land) => this.waitUseProvince.has(land))
  }
}
