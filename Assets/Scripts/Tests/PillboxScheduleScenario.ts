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
// Done criterion 2: schedule card, label, Start filling, first medicine lit, first compartment brighter + arrow.
// ---------------------------------------------------------------------------
@component
export class PillboxScheduleScenario extends Scenario {
  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(800)
    await toSchedule(ui)

    expect(guide().getState().phase).toBe("schedule")
    expect(textOf("ScheduleLine0")).toBe(NAME_A)
    expect(textOf("ScheduleLine1")).toBe(NAME_B)
    expect(textOf("ScheduleLine2")).toBe(NAME_C)
    expect(textOf("CardLabel")).toBe(LABEL)
    expect(findSceneObjectByName("CardLabel").enabled).toBe(true)
    expect(textOf("CardReminder")).toBe(REMINDER)
    expect(findSceneObjectByName("CardReminder").enabled).toBe(true)
    expect(findInteractablesByName("StartFillingButton", undefined, true).length).toBe(1)

    await ui.tap("StartFillingButton")

    const state = guide().getState()
    expect(state.phase).toBe("fill")
    expect(textOf("CardTitle")).toBe(NAME_A)
    expect(textOf("CardLabel")).toBe(LABEL)
    expect(textOf("CardProgress")).toBe("Compartment 1 of 7")

    // All 7 morning compartments lit with a "1"; evenings stay off.
    for (let d = 0; d < 7; d++) {
      expect(cellKind(d)).toBe("lit")
      expect(cellCount(d)).toBe("1")
      expect(cellChecked(d)).toBe(false)
      expect(cellKind(7 + d)).toBe("idle")
      expect(cellCount(7 + d)).toBe("")
    }

    // The first compartment glows brighter (larger) and carries the arrow.
    expect(state.currentCell).toBe(0)
    expect(cellObject(0).getTransform().getLocalScale().x).toBeGreaterThan(1.05)
    expect(cellObject(1).getTransform().getLocalScale().x).toBeLessThan(1.01)
    const arrow = findSceneObjectByName("CurrentArrow")
    expect(arrow.enabled).toBe(true)
    expect(Math.abs(worldX(arrow) - worldX(cellObject(0)))).toBeLessThan(0.5)
  }
}
