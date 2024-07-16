import path from "node:path"
import fs from "node:fs/promises"
import Global from "../Global";
import Util from "../Util";
import BMP from "../bmp";
import Managers from "./Managers";
import { ProvinceRange } from "../types";

interface ProvinceData {
  [id:string]: ProvinceItem
}
interface ProvinceItem {
  id: number
  // position?: Position;
  definition?: Definition;
  allPos: number[]
  adjacentProvinces: Set<number>

  continent?: string // 大洲
  area?: string // 地区
  region?: string // 区域
  superregion?: string // 次大陆
}
interface Definition {
  red: number;
  green: number;
  blue: number;
}
interface ColorProvinceDir {
  [colorInt: number]: number
}

interface Adjacency {
  From: number;
  To: number;
  Type: string; // sea, canal, lake+
  Through: number;
  start_x: number;
  start_y: number;
  stop_x: number;
  stop_y: number;
  Comment: string;
}


class ProvinceManager {
  private data: ProvinceData = {}
  private colorIntDir: ColorProvinceDir = {}
  private adjas:Adjacency[] = []
  private acrossWaterProvinceDir: {[province: number]: number[]} = {}
  private areaToRegion: {[area:string]: string} = {}
  private regionToSuperRegion: {[region:string]: string} = {}

  isSea = (province: number) => Managers.File.MapDefalut.param.sea_starts.includes(province)
  isLake = (province: number) => Managers.File.MapDefalut.param.lakes.includes(province)
  isImpassableLand = (province: number) => Managers.File.MapClimate.param.ANY.impassable.includes(province)
  isLand = (province: number) => !this.isSea(province) && !this.isLake(province) && !this.isImpassableLand(province)
  getAdjacentProvinces = (province: number) => Array.from(this.data[province].adjacentProvinces).concat(this.getAcrossWaterAdjacentProvinces(province))
  getAdjacentLands = (province: number) => this.getAdjacentProvinces(province).filter(prov=>this.isLand(prov))
  getSameSeaLands = (province: number) => {
    var set = new Set<number>()
    this.getAdjacentProvinces(province).filter(prov=>this.isSea(prov)).forEach(sea=>this.getAdjacentLands(sea).forEach(land=>set.add(land)))
    set.delete(province)
    return Array.from(set)
  }
  getCityPosInt(provinceId: number) {
    var pos = Managers.File.MapPositions.param.ANY[provinceId].position
    var posInt = Managers.Map.ToPosInt(pos[0], pos[1])
    return posInt
  }
  calDistanceSquare(province1: number,province2: number) {
    let provincePosInt1 = this.getCityPosInt(province1)
    let provincePosInt2 = this.getCityPosInt(province2)
    return Managers.Map.calDistanceSquare(provincePosInt1, provincePosInt2)
  }
  // 是否跨海相邻
  getAcrossWaterAdjacentProvinces(province:number) {
    return this.acrossWaterProvinceDir[province] || []
  }
  getContinent = (province:number) => this.data[province].continent
  getArea = (province:number) => this.data[province].area
  getRegion = (province:number) => this.data[province].region
  getSupreregion = (province:number) => this.data[province].superregion


  // private regionRange:ProvinceRange = {}
  // private superregionRange:ProvinceRange = {}
   
  // copyContinentRange = ():ProvinceRange => JSON.parse(JSON.stringify(Managers.File.MapContinent.param.ANY))
  // copyAreaRange = ():ProvinceRange => JSON.parse(JSON.stringify(Managers.File.MapArea.param.ANY))
  // copyRegionRange = ():ProvinceRange => JSON.parse(JSON.stringify(this.regionRange))
  // copySuperregionRange = ():ProvinceRange => JSON.parse(JSON.stringify(this.superregionRange))

  calDataByFiles() {
    for(var continent in Managers.File.MapContinent.param.ANY) {
      var provinces = Managers.File.MapContinent.param.ANY[continent]
      provinces.forEach(province=>this.data[province].continent = continent)
    }
    for(var region in Managers.File.MapRegion.param.ANY) {
      var regions = Managers.File.MapRegion.param.ANY[region]
      regions?.areas?.forEach(area=>this.areaToRegion[area] = region)
    }
    for(var superregion in Managers.File.MapSuperregion.param.ANY) {
      var superregions = Managers.File.MapSuperregion.param.ANY[superregion]
      superregions.forEach(region=>this.regionToSuperRegion[region] = superregion)
    }
    
    for(var area in Managers.File.MapArea.param.ANY) {
      var provinces = Managers.File.MapArea.param.ANY[area]
      provinces.forEach(province=>{
        if (this.data[province] == null) {
          throw new Error(`province ${province} not exist in ProvinceManager`)
          return
        }
        this.data[province].area = area
        let region = this.areaToRegion[area]
        if (region) {
          this.data[province].region = region
          let superregion = this.regionToSuperRegion[region]
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
    for(var id of Managers.File.MapPositions.GetProvinceIds()) {
      this.data[id] = {
        id: parseInt(id),
        allPos: [],
        adjacentProvinces: new Set()
      }
    }
  }
  async ReadDefinition() {
    const definitionScv = path.join(Global.eu4GamePath, "map", "definition.csv")
    var str = await fs.readFile(definitionScv,{encoding:"latin1"})
    var defArr = str.split("\n")
    
    for(var i = 1; i < defArr.length; i++) {
      var [definition, id] = this.parseDefinition(defArr[i]) 
      if (definition != null) {
        this.data[id].definition = definition
      }
    }
  }
  async ReadAdjacencies() {
    const adjacenciesScv = path.join(Global.eu4GamePath, "map", "adjacencies.csv")
    var str = await fs.readFile(adjacenciesScv,{encoding:"latin1"})
    var arr = str.split("\n")
    for(var i = 1; i < arr.length; i++) {
      var adja = this.parseAdjacency(arr[i])
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
      let provinceData = this.data[id]
      provinceData.allPos.forEach(posInt=>{
        Managers.Map.getAdjacentPosInt(posInt).forEach(adjacentPosInt=>{
          const colorInt = Managers.Map.getColorIntByPosInt(adjacentPosInt)
          let adjacentId = this.getProvinceIdByColorInt(colorInt)
          if(adjacentId !== undefined && adjacentId.toString() !== id) {
            provinceData.adjacentProvinces.add(adjacentId)
          }
        })
      })
    }
  }
  getProvinceIdByColorInt(colorInt:number) {
    return this.colorIntDir[colorInt]
  }
  addToAllPos(colorInt:number, posInt:number){
    this.data[this.colorIntDir[colorInt]].allPos.push(posInt)
  }
  fillColorIntDir() {
    for(var id in this.data) {
      var def = this.data[id].definition
      var rgb = Util.calColorInt(def.red, def.green, def.blue)
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
  parseDefinition(defStr: string): [Definition, number] {
    if (!defStr) {
      return null
    }
    var arr = defStr.trim().split(";");
    if (arr.length < 6) {
      return null
    }
    var id = parseInt(arr[0])
    var red = parseInt(arr[1])
    var green = parseInt(arr[2])
    var blue = parseInt(arr[3])
    var pos: Definition = {
      red,
      green,
      blue,
    }
    return [pos, id]
  }
  parseAdjacency(str: string): Adjacency {
    if (!str) {
      return null
    }
    var arr = str.trim().split(";");
    if (arr.length < 9) {
      return null
    }
    var From = parseInt(arr[0])
    var To = parseInt(arr[1])
    var Type = arr[2]
    var Through = parseInt(arr[3])
    var start_x = parseInt(arr[4])
    var start_y = parseInt(arr[5])
    var stop_x = parseInt(arr[6])
    var stop_y = parseInt(arr[7])
    var Comment = arr[8]
    var adja: Adjacency = {
      From,
      To,
      Type,
      Through,
      start_x,
      start_y,
      stop_x,
      stop_y,
      Comment,
    }
    return adja
  }
}

export default ProvinceManager