import CommonCountrytagsSyntax from '../logic/Syntax/file/common/CommonCountryTagsSyntax'
import CommonCulturesSyntax from '../logic/Syntax/file/common/CommonCulturesSyntax'
import CommonReligionsSyntax from '../logic/Syntax/file/common/CommonReligionsSyntax'
import HistoryCountriesSyntax from '../logic/Syntax/file/history/HistoryCountriesSyntax'
import HistoryProvincesSyntax from '../logic/Syntax/file/history/HistoryProvincesSyntax'
import MapAmbientObjectSyntax from '../logic/Syntax/file/map/MapAmbientObjectSyntax'
import MapAreaSyntax from '../logic/Syntax/file/map/MapAreaSyntax'
import MapClimateSyntax from '../logic/Syntax/file/map/MapClimateSyntax'
import MapContinentSyntax from '../logic/Syntax/file/map/MapContinentSyntax'
import MapDefaultSyntax from '../logic/Syntax/file/map/MapDefaultSyntax'
import MapPositionsSyntax from '../logic/Syntax/file/map/MapPositionsSyntax'
import MapRegionSyntax from '../logic/Syntax/file/map/MapRegionSyntax'
import MapSeasonsSyntax from '../logic/Syntax/file/map/MapSeasonsSyntax'
import MapSuperregionSyntax from '../logic/Syntax/file/map/MapSuperregionSyntax'
import MapTerrainSyntax from '../logic/Syntax/file/map/MapTerrainSyntax'

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

  CommonCountrytags: CommonCountrytagsSyntax = new CommonCountrytagsSyntax()
  CommonCultures: CommonCulturesSyntax = new CommonCulturesSyntax()
  CommonReligions: CommonReligionsSyntax = new CommonReligionsSyntax()

  async parseAllFile() {
    await this.MapAmbientObject.parseFile()
    await this.MapArea.parseFile()
    await this.MapClimate.parseFile()
    await this.MapContinent.parseFile()
    await this.MapDefalut.parseFile()
    await this.MapPositions.parseFile()
    await this.MapRegion.parseFile()
    await this.MapSeasons.parseFile()
    await this.MapSuperregion.parseFile()
    await this.MapTerrain.parseFile()

    await this.HistoryProvinces.parseFile()
    await this.HistoryCountries.parseFile()

    await this.CommonCountrytags.parseFile()
    await this.CommonCultures.parseFile()
    await this.CommonReligions.parseFile()
  }
}
export default FileManager
