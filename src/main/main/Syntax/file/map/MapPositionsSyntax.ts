import Util from "../../../Util";
import { SyntaxParamSimpleType } from "../../../types";
import { FileParamSyntax } from "../../FileParamSyntax";
import FileSyntax from "../../FileSyntax"
import { SyntaxKeyValue } from "../../Syntax";
import { SyntaxParam } from "../../SyntaxParam";

class MapPositionsParam extends SyntaxParam {
  CreateInstance = () => new MapPositionsParam()
  ANY: {[key: string]: {
    position: [number,number,number,number,number,number,number,number,number,number,number,number,number,number],
    rotation: [number,number,number,number,number,number,number],
    height: [number,number,number,number,number,number,number],
  }} = {}
  TYPES = {
    ANY: {
      position: [SyntaxParamSimpleType.int],
      rotation: [SyntaxParamSimpleType.float],
      height: [SyntaxParamSimpleType.int],
    }
  }
}

// interface MapPositionsData {
//   [id:string]: MapPositionItem
// }
// interface MapPositionItem {
//   //城市位置，单位位置，文本，海港，商路，单位作战点，信风。
//   position: string[];
//   rotation: string[];
//   height: string[]
// }

class MapPositionsSyntax extends FileParamSyntax<MapPositionsParam> {
  param: MapPositionsParam = new MapPositionsParam();
  // private Map:MapPositionsData = {}
  relativePath = ["map", "positions.txt"]
  // handleData(): void {
  //   this.data.forEach((element:SyntaxKeyValue) => {
  //     var position = Util.SyntaxArrayFindOne(element.value, "position") as string[]
  //     var rotation = Util.SyntaxArrayFindOne(element.value, "rotation") as string[]
  //     var height = Util.SyntaxArrayFindOne(element.value, "height") as string[]
  //     this.Map[element.key] = {
  //       position,
  //       rotation,
  //       height
  //     }
  //   });
  // }
  GetCityPos(id:number):[number,number] {
    return [this.param.ANY[id].position[0], this.param.ANY[id].position[1]]
  }
  GetProvinceIds() {
    return Object.keys(this.param.ANY)
  }
}

export default MapPositionsSyntax