import Util from "../Util";
import Global from "./Global";
import { Syntax } from "./Syntax/Syntax";
import Managers from "./manager/Managers";
import os from "node:os"
import process from "node:process"
import path from "node:path"
import ModDescriptionSyntax from "./Syntax/file/ModDescriptionSyntax";
import { ProvinceWeightType } from "./manager/WeightManager";

console.log("eu4")

async function initData() {

  await Managers.File.parseAllFile()
  await Managers.Map.ReadProvinces();
  Managers.Province.initData()
  await Managers.Province.ReadDefinition()
  Managers.Province.fillColorIntDir();
  await Managers.Map.fillAllPos()
  // Managers.Province.fillAdjacentProvince()
}

interface CountryTodo {
  id: string,
  capital: number,
  provinces: number[]
}

async function Todo() {
  await initData();
  
  var mod = new ModDescriptionSyntax()
  mod.initData()
  await mod.writeFile(path.join(Global.eu4DocumentsPath, "mod"))
  await mod.writeFile(Global.eu4DocumentsModProjectPath)

  await nearestProvince()
}

// 首都不变, 其他有人的省份给最近的国家
async function nearestProvince() {
  var cd: {
    [id: string]: CountryTodo
  } = {}

  let existCountrySet = new Set<string>()
  let existProvinceSet = new Set<string>()

  for(let provinceId in Managers.File.HistoryProvinces.ProvinceDir) {
    let data = Managers.File.HistoryProvinces.ProvinceDir[provinceId]
    if (data && data.NowParam.owner) {
      existCountrySet.add(data.NowParam.owner)
      existProvinceSet.add(provinceId)
    }
  }
  existCountrySet.forEach(id => {
    let capital = Managers.File.HistoryCountries.CountryDir[id].capital
    existProvinceSet.delete(capital.toString())
    cd[id] = {
      id,
      capital,
      provinces: [capital]
    }
  });
  existProvinceSet.forEach(province => {
    // Managers.Weight.calProvinceWeight()
    // var posInt = Managers.Map.getProvinceCityPosInt(province)
    var min = Number.MAX_VALUE
    var minCountry
    for(var country in cd) {
      let weight = 1;
      weight *= Managers.Weight.calProvinceFactor(ProvinceWeightType.DistanceSquareToCapical, parseInt(province), country) ** 0.5
      weight *= Managers.Weight.calProvinceFactor(ProvinceWeightType.Culture, parseInt(province), country)
      weight *= Managers.Weight.calProvinceFactor(ProvinceWeightType.Religion, parseInt(province), country)
      
      if (weight < min) {
        min = weight
        minCountry = cd[country].id
      }
    }
    if (minCountry != null) {
      cd[minCountry].provinces.push(parseInt(province))
    }
  });
  for(let key in cd) {
    let c = cd[key]
    for(let province of c.provinces) {
      await Managers.File.HistoryProvinces.setOwnerThenWriteFile(province.toString(), key)
    }
  }

}
Todo()

