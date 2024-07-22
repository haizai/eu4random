import FileManager from './FileManager'
import MapManager from './MapManager'
import ProvinceManager from './ProvinceManager'
import CountryManager from './CountryManager'
import ProcessManager from './ProcessManager'
import CommonManager from './CommonManager'
import ProxyManager from './ProxyManager'

export default class Managers {
  static Province: ProvinceManager = new ProvinceManager()
  static Map: MapManager = new MapManager()
  static File: FileManager = new FileManager()
  static Country: CountryManager = new CountryManager()
  static Process: ProcessManager = new ProcessManager()
  static Common: CommonManager = new CommonManager()
  static Proxy: ProxyManager = new ProxyManager()
}
