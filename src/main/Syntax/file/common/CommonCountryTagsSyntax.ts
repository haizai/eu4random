import { FileParamSyntax, SyntaxCountryParam } from "../../FileParamSyntax"


export default class CommonCountrytagsSyntax extends FileParamSyntax<SyntaxCountryParam> {
  param: SyntaxCountryParam = new SyntaxCountryParam()
  relativePath = ["common","country_tags", "00_countries.txt"]
}