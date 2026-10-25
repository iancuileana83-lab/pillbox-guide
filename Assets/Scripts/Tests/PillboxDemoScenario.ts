import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils"
import {PillboxLeafInteractor, guide, nextTimes, resetGuide} from "./PillboxLeafHelpers"

// Drives the whole flow, paced for the narrated demo video. It prints "[DEMO] sN" when narration
// segment N should start, so the narration can be placed on the recording afterwards.
@component
export class PillboxDemoScenario extends Scenario {
  private t0: number = 0

  private pose(label: string) {
    const g = findSceneObjectByName("OrganizerGrid").getTransform().getWorldPosition()
    print("[DEMO] pose " + label + " x=" + g.x.toFixed(2) + " z=" + g.z.toFixed(2) + " scale=" + guide().getState().gridScale.toFixed(2))
  }

  private mark(id: string) {
    this.t0 = getTime()
    print("[DEMO] " + id)
  }

  /** Keep the current narration segment on screen for at least `seconds` since its marker. */
  private async until(seconds: number) {
    const left = seconds - (getTime() - this.t0)
    if (left > 0) await sleep(Math.round(left * 1000))
  }

  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(800)
    await resetGuide()

    this.mark("s1") // intro on the placement screen
    await this.until(8.2)

    this.mark("s2") // place the grid: move it, stretch it, press Done (hand input is simulated)
    await sleep(2500)
    this.pose("start")
    await ui.dragNamed("GridPlate", new vec3(-3, 0, 2), 900)
    this.pose("after-move")
    await ui.dragNamed("GridPlate", new vec3(3, 0, -2), 900)
    this.pose("after-move-back")
    await ui.dragNamed("ResizeHandleBox", new vec3(2, 0, 1), 900)
    this.pose("after-stretch")
    await ui.dragNamed("ResizeHandleBox", new vec3(-2, 0, -1), 900)
    this.pose("after-stretch-back")
    await this.until(13.6)
    await ui.tap("DoneButton")

    this.mark("s3") // schedule card
    await this.until(9.0)
    await ui.tap("StartFillingButton")

    this.mark("s4") // first medicine: Next, Next, Undo, Next
    await sleep(2200)
    await ui.tap("NextButton")
    await sleep(1200)
    await ui.tap("NextButton")
    await sleep(1200)
    await ui.tap("UndoButton")
    await sleep(1200)
    await ui.tap("NextButton")
    await this.until(9.4)

    await nextTimes(ui, 5) // finish medicine A (silent): 7 compartments, 2 done so far
    await sleep(500)
    expect(guide().getState().phase).toBe("putaway")
    this.mark("s5") // "Put this box away", then the next medicine
    await sleep(3600)
    await ui.tap("NextButton")
    await this.until(7.0)

    await nextTimes(ui, 7) // medicine B (silent)
    await sleep(900)
    await ui.tap("NextButton") // put away -> Weekly tablet C
    expect(guide().getState().medIndex).toBe(2)
    expect(guide().getState().phase).toBe("fill")
    this.mark("s6") // Monday morning only
    await this.until(5.4)

    await ui.tap("NextButton") // C Monday
    await sleep(900)
    await ui.tap("NextButton") // put away -> summary
    expect(guide().getState().phase).toBe("done")
    this.mark("s7") // final totals
    await this.until(10.4)

    this.mark("s8") // outro
    await this.until(11.0)
    print("[DEMO] end")
  }
}
