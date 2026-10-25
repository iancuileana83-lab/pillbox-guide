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
// Done criterion 5: final totals on every compartment and the organizer-ready card with the reminder.
// ---------------------------------------------------------------------------
@component
export class PillboxSummaryScenario extends Scenario {
  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(800)
    await toFilling(ui)

    await nextTimes(ui, 7) // A
    await ui.tap("NextButton") // put away -> B
    await nextTimes(ui, 7)
    await ui.tap("NextButton") // put away -> C
    await ui.tap("NextButton") // C Monday
    expect(guide().getState().phase).toBe("putaway")
    await ui.tap("NextButton") // put away -> summary

    expect(guide().getState().phase).toBe("done")
    expect(textOf("CardTitle")).toBe("Organizer ready")
    expect(textOf("CardReminder")).toBe(REMINDER)
    expect(findSceneObjectByName("CardReminder").enabled).toBe(true)
    expect(textOf("CardLabel")).toBe(LABEL)

    expect(cellCount(0)).toBe("2") // Monday morning
    for (let d = 1; d < 7; d++) {
      expect(cellCount(d)).toBe("1")
    }
    for (let d = 0; d < 7; d++) {
      expect(cellCount(7 + d)).toBe("1")
    }
    for (let i = 0; i < 14; i++) {
      expect(cellKind(i)).toBe("total")
    }
    expect(findSceneObjectByName("CurrentArrow").enabled).toBe(false)
  }
}
