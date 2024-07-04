import FileManager from "./FileManager";
import MapManager from "./MapManager";
import ProvinceManager from "./ProvinceManager";
import CountryManager from "./CountryManager";
import WeightManager from "./WeightManager";
import ProcessManager from "./ProcessManager";

export default class Managers {
  static Province: ProvinceManager = new ProvinceManager()
  static Map: MapManager = new MapManager()
  static File: FileManager = new FileManager()
  static Country: CountryManager = new CountryManager()
  static Weight: WeightManager = new WeightManager()
  static Process: ProcessManager = new ProcessManager()
}
