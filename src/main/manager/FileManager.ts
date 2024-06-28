import CommonCountryTagsSyntax from "../Syntax/file/common/CommonCountryTagsSyntax"
import HistoryCountriesSyntax from "../Syntax/file/history/HistoryCountriesSyntax"
import HistoryProvincesSyntax from "../Syntax/file/history/HistoryProvincesSyntax"
import MapAmbientObjectSyntax from "../Syntax/file/map/MapAmbientObjectSyntax"
import MapAreaSyntax from "../Syntax/file/map/MapAreaSyntax"
import MapClimateSyntax from "../Syntax/file/map/MapClimateSyntax"
import MapContinentSyntax from "../Syntax/file/map/MapContinentSyntax"
import MapDefaultSyntax from "../Syntax/file/map/MapDefaultSyntax"
import MapPositionsSyntax from "../Syntax/file/map/MapPositionsSyntax"
import MapRegionSyntax from "../Syntax/file/map/MapRegionSyntax"
import MapSeasonsSyntax from "../Syntax/file/map/MapSeasonsSyntax"
import MapSuperregionSyntax from "../Syntax/file/map/MapSuperregionSyntax"
import MapTerrainSyntax from "../Syntax/file/map/MapTerrainSyntax"

class FileManager {
  MapAmbientObject: MapAmbientObjectSyntax = new MapAmbientObjectSyntax()
  MapArea: MapAreaSyntax = new MapAreaSyntax()
  MapClimate: MapClimateSyntax = new MapClimateSyntax()
  MapDefalut: MapDefaultSyntax = new MapDefaultSyntax()
  MapPositions: MapPositionsSyntax = new MapPositionsSyntax()
  MapContinent: MapContinentSyntax = new MapContinentSyntax()
  MapRegion: MapRegionSyntax = new MapRegionSyntax()
  MapSeasons: MapSeasonsSyntax = new MapSeasonsSyntax()
  MapSuperregion: MapSuperregionSyntax = new MapSuperregionSyntax()
  MapTerrain: MapTerrainSyntax = new MapTerrainSyntax()

  HistoryProvinces: HistoryProvincesSyntax = new HistoryProvincesSyntax()
  HistoryCountries: HistoryCountriesSyntax = new HistoryCountriesSyntax()
  
  CommonCountryTags: CommonCountryTagsSyntax = new CommonCountryTagsSyntax()
  
  async parseAllFile() {
    await this.MapAmbientObject.parseFile()
    await this.MapArea.parseFile()
    await this.MapClimate.parseFile()
    await this.MapDefalut.parseFile()
    await this.MapPositions.parseFile()
    await this.MapContinent.parseFile()
    await this.MapRegion.parseFile()
    await this.MapSeasons.parseFile()
    await this.MapSuperregion.parseFile()
    await this.MapTerrain.parseFile()

    await this.HistoryProvinces.parseFile()
    await this.HistoryCountries.parseFile()
    
    await this.CommonCountryTags.parseFile()



  }
}
export default FileManager