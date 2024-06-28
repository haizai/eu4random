import Util from "../../../../Util";
import FileSyntax from "../../FileSyntax"
import { SyntaxKeyValue } from "../../Syntax";

interface MapPositionsData {
  [id:string]: MapPositionItem
}
interface MapPositionItem {
  //城市位置，单位位置，文本，海港，商路，单位作战点，信风。
  position: string[];
  rotation: string[];
  height: string[]
}

class MapPositionsSyntax extends FileSyntax {
  private Map:MapPositionsData = {}
  relativePath = ["map", "positions.txt"]
  handleData(): void {
    this.data.forEach((element:SyntaxKeyValue) => {
      var position = Util.SyntaxArrayFindOne(element.value, "position") as string[]
      var rotation = Util.SyntaxArrayFindOne(element.value, "rotation") as string[]
      var height = Util.SyntaxArrayFindOne(element.value, "height") as string[]
      this.Map[element.key] = {
        position,
        rotation,
        height
      }
    });
  }
  GetCityPos(id:number):[number,number] {
    return [parseInt(this.Map[id].position[0]), parseInt(this.Map[id].position[1])]
  }
  GetProvinceIds() {
    return Object.keys(this.Map)
  }
}

export default MapPositionsSyntax