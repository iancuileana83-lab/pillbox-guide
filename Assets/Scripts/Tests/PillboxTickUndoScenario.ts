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
// Done criterion 3: Next (or a pinch anywhere) ticks green + check and moves the arrow; Undo steps back.
// ---------------------------------------------------------------------------
@component
export class PillboxTickUndoScenario extends Scenario {
  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(800)
    await toFilling(ui)

    // Next button.
    await ui.tap("NextButton")
    expect(cellChecked(0)).toBe(true)
    expect(cellKind(0)).toBe("done")
    expect(cellCount(0)).toBe("")
    expect(guide().getState().currentCell).toBe(1)
    expect(textOf("CardProgress")).toBe("Compartment 2 of 7")
    const arrow = findSceneObjectByName("CurrentArrow")
    expect(Math.abs(worldX(arrow) - worldX(cellObject(1)))).toBeLessThan(0.5)
    expect(cellChecked(1)).toBe(false)

    // A simple pinch anywhere does the same.
    await ui.tap("PinchAnywhereTarget")
    expect(cellChecked(1)).toBe(true)
    expect(cellKind(1)).toBe("done")
    expect(guide().getState().currentCell).toBe(2)

    // Undo steps back one compartment, twice.
    await ui.tap("UndoButton")
    expect(cellChecked(1)).toBe(false)
    expect(cellKind(1)).toBe("lit")
    expect(guide().getState().currentCell).toBe(1)
    expect(cellChecked(0)).toBe(true)
    await ui.tap("UndoButton")
    expect(cellChecked(0)).toBe(false)
    expect(guide().getState().currentCell).toBe(0)
    expect(Math.abs(worldX(arrow) - worldX(cellObject(0)))).toBeLessThan(0.5)
  }
}
