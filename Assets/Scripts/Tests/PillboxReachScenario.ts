import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {
  LABEL,
  NAME_A,
  NAME_B,
  NAME_C,
  PillboxLeafInteractor,
  REMINDER,
  cellChecked,
  cellCount,
  cellKind,
  cellObject,
  guide,
  litCells,
  nextTimes,
  resetGuide,
  textOf,
  toFilling,
  toSchedule,
  worldPos,
  worldX
} from "./PillboxLeafHelpers"

// ---------------------------------------------------------------------------
// Reachability: drive the card's buttons the way a real arm would (IK interactor).
// ---------------------------------------------------------------------------
@component
export class PillboxReachScenario extends Scenario {
  private readonly _ik = createIKInteractor()

  async run(): Promise<void> {
    await sleep(800)
    await resetGuide()
    const done = findInteractablesByName("DoneButton", undefined, true)[0]
    await this._ik.trigger(done)
    await sleep(400)
    expect(guide().getState().phase).toBe("schedule")
    const start = findInteractablesByName("StartFillingButton", undefined, true)[0]
    await this._ik.trigger(start)
    await sleep(400)
    expect(guide().getState().phase).toBe("fill")
    const next = findInteractablesByName("NextButton", undefined, true)[0]
    await this._ik.trigger(next)
    await sleep(400)
    expect(cellChecked(0)).toBe(true)
  }
}
