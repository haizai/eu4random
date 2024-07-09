import path from "node:path"
import fs from "node:fs/promises"
import Global from "../Global";
import Util from "../../Util";
import BMP from "../bmp";
import Managers from "./Managers";

interface ProvinceData {
  [id:string]: ProvinceItem
}
interface ProvinceItem {
  id: number
  // position?: Position;
  definition?: Definition;
  allPos: number[]
  adjacentProvinces: Set<number>
}
interface Definition {
  red: number;
  green: number;
  blue: number;
}
interface Position {
  name: string;
  //城市位置，单位位置，文本，海港，商路，单位作战点，信风。
  position: number[];
  rotation: number[];
  height: number[]
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