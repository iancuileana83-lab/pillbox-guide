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
// Done criterion 4: "Put this box away" after each medicine; weekly tablet C lights Monday morning only.
// ---------------------------------------------------------------------------
@component
export class PillboxPutAwayScenario extends Scenario {
  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(800)
    await toFilling(ui)

    // Medicine A: 7 confirmations, then "Put this box away".
    await nextTimes(ui, 7)
    expect(guide().getState().phase).toBe("putaway")
    expect(textOf("CardTitle")).toBe("Put this box away")
    for (let d = 0; d < 7; d++) {
      expect(cellChecked(d)).toBe(true)
    }

    // Moves on to medicine B: evenings lit, mornings off.
    await ui.tap("NextButton")
    expect(textOf("CardTitle")).toBe(NAME_B)
    expect(guide().getState().currentCell).toBe(7)
    for (let d = 0; d < 7; d++) {
      expect(cellKind(7 + d)).toBe("lit")
      expect(cellKind(d)).toBe("idle")
    }
    await nextTimes(ui, 7)
    expect(textOf("CardTitle")).toBe("Put this box away")

    // Medicine C lights Monday morning only.
    await ui.tap("NextButton")
    expect(textOf("CardTitle")).toBe(NAME_C)
    expect(guide().getState().currentCell).toBe(0)
    expect(cellKind(0)).toBe("lit")
    expect(cellCount(0)).toBe("1")
    expect(litCells().length).toBe(1) // only Monday morning (the current compartment)
    for (let i = 1; i < 14; i++) {
      expect(cellKind(i)).toBe("idle")
    }
  }
}
