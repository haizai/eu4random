import { SyntaxParamSimpleType } from "../../../types"
import { FileParamSyntax } from "../../FileParamSyntax"
import { SyntaxParam } from "../../SyntaxParam"

class CommonReligionsParam extends SyntaxParam {
  CreateInstance = () => new CommonReligionsParam()
  
  ANY: {[religionsGroup: string]: {
    defender_of_faith?: boolean,
    can_form_personal_unions?: boolean,
    center_of_religion?: number,
    flags_with_emblem_percentage?: number,
    flag_emblem_index_range?: number[],
    harmonized_modifier?: string,
    crusade_name?: string,
    ai_will_propagate_through_trade?: boolean,
    ANY?: {

    }
  }}

  TYPES = {
    
    ANY: {
      defender_of_faith: SyntaxParamSimpleType.boolean,
      can_form_personal_unions: SyntaxParamSimpleType.boolean,
      center_of_religion: SyntaxParamSimpleType.int,
      flags_with_emblem_percentage: SyntaxParamSimpleType.int,
      flag_emblem_index_range: [SyntaxParamSimpleType.int],
      harmonized_modifier: SyntaxParamSimpleType.string,
      crusade_name: SyntaxParamSimpleType.string,
      ai_will_propagate_through_trade: SyntaxParamSimpleType.boolean,
  
      ANY: {

      }
    }
  }
}
export default class CommonReligionsSyntax extends FileParamSyntax<CommonReligionsParam> {
  param: CommonReligionsParam = new CommonReligionsParam()
  relativePath = ["common","religions", "00_religion.txt"]
}