import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {PillboxLeafInteractor, nextTimes, toFilling} from "./PillboxLeafHelpers"

// Stage setter for a screenshot: stops on a medicine step with two compartments ticked.
@component
export class PillboxShotTickedScenario extends Scenario {
  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(800)
    await toFilling(ui)
    await nextTimes(ui, 2)
    await sleep(600)
  }
}
