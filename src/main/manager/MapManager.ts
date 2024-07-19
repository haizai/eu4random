import Global from "../main/Global"
import path from "node:path"
import fs from "node:fs/promises"
import BMP from "../main/bmp"
import Util from "../main/Util"
import Managers from "./Managers"

class MapManager {
  width!:number
  height!:number
  private bmp!:BMP
  async ReadProvinces() {
    const provincesBmp = path.join(Global.eu4GamePath, "map", "provinces.bmp")
    var buffer = await fs.readFile(provincesBmp)
    this.bmp = new BMP()
    this.bmp.decode(buffer)
    this.width = this.bmp.biWidth
    this.height = this.bmp.biHeight
  }

  fillAllPos() {
    for(var x = 0; x < this.width; x++) {
      for(var y = 0; y < this.height; y++) {
        var posInt = this.ToPosInt(x,y)
        var colorInt = Util.calColorInt(...this.bmp.getColorByPosInt(posInt))
        Managers.Province.addToAllPos(colorInt, posInt)
      }
    }
  }
  ToPosInt(x:number, y:number) {
    return this.bmp.calPosInt(x,y)
  }
  ToPos(posInt:number):[number, number] {
    return this.bmp.calPos(posInt)
  }

  getColorByPosInt(posInt:number) {
    return this.bmp.getColorByPosInt(posInt)
  }
  getColorByPos(x:number, y:number):[number,number,number] {
    return this.getColorByPosInt(this.ToPosInt(x, y))
  }
  getColorIntByPosInt(posInt:number):number{
    return Util.calColorInt(...this.getColorByPosInt(posInt))
  }
  getColorIntByPos(x:number, y:number): number{
    return Util.calColorInt(...this.getColorByPos(x,y))
  }
  calDistanceSquare(posInt1:number, posInt2:number) {
    var [x1, y1] = this.ToPos(posInt1);
    var [x2, y2] = this.ToPos(posInt2);
    var x = Math.abs(x2 - x1)
    x = Math.min(x, this.width - x)
    return x**2 + (y1-y2)**2
  }


  getAdjacentPosInt(posInt:number) {
    var [x,y] = this.ToPos(posInt)
    var ret:number[] = []
    if (x == 0) 
      ret.push(this.ToPosInt(this.width-1,y))
    else
      ret.push(this.ToPosInt(x-1, y))
    if (x == this.width-1)
      ret.push(this.ToPosInt(0,y))
    else
      ret.push(this.ToPosInt(x+1,0))
    if (y != 0) 
      ret.push(this.ToPosInt(x,y-1))
    if (y != this.height-1)
      ret.push(this.ToPosInt(x,y+1))
    return ret
  }
}

export default MapManager