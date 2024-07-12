import Global from "./Global";
import Managers from "./manager/Managers";


console.log("eu4")
async function Todo() {
  console.log("Start")
  await Managers.Process.InitData();

  await Managers.Process.DoIt()
  console.log("End!!!!")
}

