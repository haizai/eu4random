import Global from './Global'
import Managers from '../manager/Managers'

async function Todo() {
  console.log('Start')
  await Managers.Process.InitData()

  await Managers.Process.DoIt()
  console.log('End!!!!')
}
