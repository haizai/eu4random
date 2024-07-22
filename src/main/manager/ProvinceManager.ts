import path from 'node:path'
import fs from 'node:fs/promises'
import Global from '../logic/Global'
import Util from '../logic/Util'
import Managers from './Managers'

interface ProvinceData {
  [id: string]: ProvinceItem
}
interface ProvinceItem {
  id: number
  // position?: Position;
  definition?: Definition
  allPos: number[]
  adjacentProvinces: Set<number>

  continent?: string // 大洲
  area?: string // 地区
  region?: string // 区域
  superregion?: string // 次大陆
}
interface Definition {
  red: number
  green: number
  blue: number
}
interface ColorProvinceDir {
  [colorInt: number]: number
}

interface Adjacency {
  From: number
  To: number
  Type: string // sea, canal, lake+
  Through: number
  start_x: number
  start_y: number
  stop_x: number
  stop_y: number
  Comment: string
}

class ProvinceManager {
  private data: ProvinceData = {}
  private colorIntDir: ColorProvinceDir = {}
  private adjas: Adjacency[] = []
  private acrossWaterProvinceDir: { [province: number]: number[] } = {}
  private areaToRegion: { [area: string]: string } = {}
  private regionToSuperRegion: { [region: string]: string } = {}

  isSea = (province: number) => Managers.File.MapDefalut.param.sea_starts.includes(province)
  isLake = (province: number) => Managers.File.MapDefalut.param.lakes.includes(province)
  isImpassableLand = (province: number) =>
    Managers.File.MapClimate.param.ANY.impassable.includes(province)
  isLand = (province: number) =>
    !this.isSea(province) && !this.isLake(province) && !this.isImpassableLand(province)
  getAdjacentProvinces = (province: number) =>
    Array.from(this.data[province].adjacentProvinces).concat(
      this.getAcrossWaterAdjacentProvinces(province)
    )
  getAdjacentLands = (province: number) =>
    this.getAdjacentProvinces(province).filter((prov) => this.isLand(prov))
  getSameSeaLands = (province: number) => {
    const set = new Set<number>()
    this.getAdjacentProvinces(province)
      .filter((prov) => this.isSea(prov))
      .forEach((sea) => this.getAdjacentLands(sea).forEach((land) => set.add(land)))
    set.delete(province)
    return Array.from(set)
  }
  getCityPosInt(provinceId: number) {
    const pos = Managers.File.MapPositions.param.ANY[provinceId].position
    const posInt = Managers.Map.ToPosInt(pos[0], pos[1])
    return posInt
  }
  calDistanceSquare(province1: number, province2: number) {
    const provincePosInt1 = this.getCityPosInt(province1)
    const provincePosInt2 = this.getCityPosInt(province2)
    return Managers.Map.calDistanceSquare(provincePosInt1, provincePosInt2)
  }
  // 是否跨海相邻
  getAcrossWaterAdjacentProvinces(province: number) {
    return this.acrossWaterProvinceDir[province] || []
  }
  getContinent = (province: number) => this.data[province].continent
  getArea = (province: number) => this.data[province].area
  getRegion = (province: number) => this.data[province].region
  getSupreregion = (province: number) => this.data[province].superregion

  // private regionRange:ProvinceRange = {}
  // private superregionRange:ProvinceRange = {}

  // copyContinentRange = ():ProvinceRange => JSON.parse(JSON.stringify(Managers.File.MapContinent.param.ANY))
  // copyAreaRange = ():ProvinceRange => JSON.parse(JSON.stringify(Managers.File.MapArea.param.ANY))
  // copyRegionRange = ():ProvinceRange => JSON.parse(JSON.stringify(this.regionRange))
  // copySuperregionRange = ():ProvinceRange => JSON.parse(JSON.stringify(this.superregionRange))

  calDataByFiles() {
    for (var continent in Managers.File.MapContinent.param.ANY) {
      var provinces = Managers.File.MapContinent.param.ANY[continent]
      provinces.forEach((province) => (this.data[province].continent = continent))
    }
    for (var region in Managers.File.MapRegion.param.ANY) {
      const regions = Managers.File.MapRegion.param.ANY[region]
      regions?.areas?.forEach((area) => (this.areaToRegion[area] = region))
    }
    for (var superregion in Managers.File.MapSuperregion.param.ANY) {
      const superregions = Managers.File.MapSuperregion.param.ANY[superregion]
      superregions.forEach((region) => (this.regionToSuperRegion[region] = superregion))
    }

    for (var area in Managers.File.MapArea.param.ANY) {
      var provinces = Managers.File.MapArea.param.ANY[area]
      provinces.forEach((province) => {
        if (this.data[province] == null) {
          throw new Error(`province ${province} not exist in ProvinceManager`)
          return
        }
        this.data[province].area = area
        const region = this.areaToRegion[area]
        if (region) {
          this.data[province].region = region
          const superregion = this.regionToSuperRegion[region]
          if (superregion) {
            this.data[province].superregion = superregion
          }
        }
      })
    }

    // for(var key in this.data) {
    //   var item = this.data[key]
    //   if (item.region) {
    //     if (!this.regionRange[item.region]) {
    //       this.regionRange[item.region] = []
    //     }
    //     this.regionRange[item.region].push(item.id)
    //   } else {
    //     if (!this.regionRange.Undefined) {
    //       this.regionRange.Undefined
    //     }
    //     this.regionRange.Undefined.push(item.id)
    //   }
    //   if (item.superregion) {
    //     if (!this.superregionRange[item.superregion]) {
    //       this.superregionRange[item.superregion] = []
    //     }
    //     this.superregionRange[item.superregion].push(item.id)
    //   } else {
    //     if (!this.superregionRange.Undefined) {
    //       this.superregionRange.Undefined
    //     }
    //     this.superregionRange.Undefined.push(item.id)
    //   }
    // }
  }
  initData() {
    for (const id of Managers.File.MapPositions.GetProvinceIds()) {
      this.data[id] = {
        id: parseInt(id),
        allPos: [],
        adjacentProvinces: new Set()
      }
    }
  }
  async ReadDefinition() {
    const definitionScv = path.join(Global.eu4GamePath, 'map', 'definition.csv')
    const str = await fs.readFile(definitionScv, { encoding: 'latin1' })
    const defArr = str.split('\n')

    for (let i = 1; i < defArr.length; i++) {
      const definition = this.parseDefinition(defArr[i])
      if (definition != null) {
        this.data[definition[1]].definition = definition[0]
      }
    }
  }
  async ReadAdjacencies() {
    const adjacenciesScv = path.join(Global.eu4GamePath, 'map', 'adjacencies.csv')
    const str = await fs.readFile(adjacenciesScv, { encoding: 'latin1' })
    const arr = str.split('\n')
    for (let i = 1; i < arr.length; i++) {
      const adja = this.parseAdjacency(arr[i])
      if (adja) {
        this.adjas.push(adja)
        if (!this.acrossWaterProvinceDir[adja.From]) {
          this.acrossWaterProvinceDir[adja.From] = []
        }
        this.acrossWaterProvinceDir[adja.From].push(adja.To)
        if (!this.acrossWaterProvinceDir[adja.To]) {
          this.acrossWaterProvinceDir[adja.To] = []
        }
        this.acrossWaterProvinceDir[adja.To].push(adja.From)
      }
    }
  }
  fillAdjacentProvince() {
    for (const id in this.data) {
      const provinceData = this.data[id]
      provinceData.allPos.forEach((posInt) => {
        Managers.Map.getAdjacentPosInt(posInt).forEach((adjacentPosInt) => {
          const colorInt = Managers.Map.getColorIntByPosInt(adjacentPosInt)
          const adjacentId = this.getProvinceIdByColorInt(colorInt)
          if (adjacentId !== undefined && adjacentId.toString() !== id) {
            provinceData.adjacentProvinces.add(adjacentId)
          }
        })
      })
    }
  }
  getProvinceIdByColorInt(colorInt: number) {
    return this.colorIntDir[colorInt]
  }
  addToAllPos(colorInt: number, posInt: number) {
    this.data[this.colorIntDir[colorInt]].allPos.push(posInt)
  }
  fillColorIntDir() {
    for (const id in this.data) {
      const def = this.data[id].definition
      const rgb = Util.calColorInt(def!.red, def!.green, def!.blue)
      this.colorIntDir[rgb] = parseInt(id)
    }
  }
  // parsePosition(posStr: string): [Position,number] {
  //   if (!posStr) {
  //     return null
  //   }
  //   var lines = posStr.split("\n");
  //   if (lines.length < 9) {
  //     return null
  //   }
  //   var name = lines[0]
  //   var id = parseInt(lines[1].split("=")[0])
  //   var position = lines[3].trim().split(" ").map(str=>parseFloat(str))
  //   var rotation = lines[6].trim().split(" ").map(str=>parseFloat(str))
  //   var height = lines[9].trim().split(" ").map(str=>parseFloat(str))
  //   var pos: Position = {
  //     name,
  //     position,
  //     rotation,
  //     height
  //   }
  //   return [pos, id]
  // }
  parseDefinition(defStr: string): [Definition, number] | null {
    if (!defStr) {
      return null
    }
    const arr = defStr.trim().split(';')
    if (arr.length < 6) {
      return null
    }
    const id = parseInt(arr[0])
    const red = parseInt(arr[1])
    const green = parseInt(arr[2])
    const blue = parseInt(arr[3])
    const pos: Definition = {
      red,
      green,
      blue
    }
    return [pos, id]
  }
  parseAdjacency(str: string): Adjacency | null {
    if (!str) {
      return null
    }
    const arr = str.trim().split(';')
    if (arr.length < 9) {
      return null
    }
    const From = parseInt(arr[0])
    const To = parseInt(arr[1])
    const Type = arr[2]
    const Through = parseInt(arr[3])
    const start_x = parseInt(arr[4])
    const start_y = parseInt(arr[5])
    const stop_x = parseInt(arr[6])
    const stop_y = parseInt(arr[7])
    const Comment = arr[8]
    const adja: Adjacency = {
      From,
      To,
      Type,
      Through,
      start_x,
      start_y,
      stop_x,
      stop_y,
      Comment
    }
    return adja
  }
}

export default ProvinceManager
