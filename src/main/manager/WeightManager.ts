import Util from "../../Util";
import Managers from "./Managers";

export enum ProvinceWeightType {
  DistanceSquareToCapical,
  Culture,
  Religion,
}

export default class WeightManager {


  calProvinceFactor(type: ProvinceWeightType, province: number, country: string):number {
    switch (type) {
      case ProvinceWeightType.DistanceSquareToCapical: {
        let provincePosInt = Managers.Map.getProvinceCityPosInt(province.toString())
        let capital = Managers.File.HistoryCountries.CountryDir[country].capital
        let capitalPosInt = Managers.Map.getProvinceCityPosInt(capital.toString())
        return Managers.Map.calDistanceSquare(provincePosInt, capitalPosInt)
      }
      case ProvinceWeightType.Culture: {
        let provinceCulture = Managers.File.HistoryProvinces.ProvinceDir[province].NowParam.culture
        let countryCulture = Managers.File.HistoryCountries.CountryDir[country].primary_culture
        if (provinceCulture === countryCulture) {
          return 2
        }
      }
      case ProvinceWeightType.Religion: {
        let provinceReligion = Managers.File.HistoryProvinces.ProvinceDir[province].NowParam.religion
        let countryReligion = Managers.File.HistoryCountries.CountryDir[country].religion
        if (provinceReligion === countryReligion) {
          return 2
        }
      }
    }
    return 1
  }
}