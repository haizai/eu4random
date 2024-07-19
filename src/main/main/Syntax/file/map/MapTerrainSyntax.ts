import { SyntaxParamSimpleType } from '../../../types'
import { FileParamSyntax } from '../../FileParamSyntax'
import FileSyntax from '../../FileSyntax'
import { SyntaxParam } from '../../SyntaxParam'

class MapTerrainParam extends SyntaxParam {
  CreateInstance = () => new MapTerrainParam()
  categories: {
    [key: string]: {
      color?: [number, number, number]
      sound_type?: string
      type?: string
      is_water?: boolean
      inland_sea?: boolean
      movement_cost?: number
      defence?: number
      nation_designer_cost_multiplier?: number
      local_development_cost?: number
      local_defensiveness?: number
      supply_limit?: number
      terrain_override?: number[]
    }
  } = {}
  terrain: {
    [key: string]: {
      type: string
      color: number[]
    }
  } = {}
  tree: {
    [key: string]: {
      terrain: string
      color: number[]
    }
  } = {}

  TYPES = {
    categories: {
      ANY: {
        color: [SyntaxParamSimpleType.int],
        sound_type: SyntaxParamSimpleType.string,
        type: SyntaxParamSimpleType.string,
        is_water: SyntaxParamSimpleType.boolean,
        inland_sea: SyntaxParamSimpleType.boolean,
        movement_cost: SyntaxParamSimpleType.float,
        defence: SyntaxParamSimpleType.int,
        nation_designer_cost_multiplier: SyntaxParamSimpleType.float,
        local_development_cost: SyntaxParamSimpleType.float,
        local_defensiveness: SyntaxParamSimpleType.float,
        supply_limit: SyntaxParamSimpleType.int,
        terrain_override: [SyntaxParamSimpleType.int]
      }
    },
    terrain: {
      ANY: {
        type: SyntaxParamSimpleType.string,
        color: [SyntaxParamSimpleType.int]
      }
    },
    tree: {
      ANY: {
        terrain: SyntaxParamSimpleType.string,
        color: [SyntaxParamSimpleType.int]
      }
    }
  }
}

export default class MapTerrainSyntax extends FileParamSyntax<MapTerrainParam> {
  param: MapTerrainParam = new MapTerrainParam()
  relativePath = ['map', 'terrain.txt']
}
