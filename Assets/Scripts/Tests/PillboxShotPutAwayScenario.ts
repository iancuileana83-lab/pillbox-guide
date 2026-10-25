import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {PillboxLeafInteractor, nextTimes, toFilling} from "./PillboxLeafHelpers"

// Stage setter for a screenshot: stops on the "Put this box away" screen.
@component
export class PillboxShotPutAwayScenario extends Scenario {
  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(800)
    await toFilling(ui)
    await nextTimes(ui, 7)
    await sleep(600)
  }
}
