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
// Done criterion 1: grid on the virtual table over the placeholder; pinch, drag, stretch; Done locks it.
// ---------------------------------------------------------------------------
@component
export class PillboxPlaceGridScenario extends Scenario {
  async run(): Promise<void> {
    const ui = new PillboxLeafInteractor()
    await sleep(1500)
    await resetGuide()

    expect(guide().getState().phase).toBe("place")
    expect(findSceneObjectByName("VirtualTable").enabled).toBe(true)
    expect(findSceneObjectByName("StandInOrganizer").enabled).toBe(true)
    expect(textOf("StandInLabel").includes("placeholder")).toBe(true)
    expect(textOf("CardTitle")).toBe("Place the grid over your organizer")

    // 7 x 2 compartments, about 3 cm apart at the starting size.
    for (let i = 0; i < 14; i++) {
      expect(cellObject(i).enabled).toBe(true)
    }
    const pitch = worldPos(cellObject(1)).sub(worldPos(cellObject(0))).length
    expect(pitch).toBeGreaterThan(2.8)
    expect(pitch).toBeLessThan(3.5)

    // Drag moves the grid across the table.
    const grid = findSceneObjectByName("OrganizerGrid")
    const before = worldPos(grid)
    await ui.dragNamed("GridPlate", new vec3(-4, 0, -7), 800)
    const after = worldPos(grid)
    expect(after.x).toBeLessThan(before.x - 2)
    expect(after.z).toBeLessThan(before.z - 3)
    expect(Math.abs(after.y - before.y)).toBeLessThan(0.01) // stays flat on the table

    // Stretching the corner handle resizes it.
    const scaleBefore = guide().getState().gridScale
    await ui.dragNamed("ResizeHandleBox", new vec3(5, 0, 2), 800)
    expect(guide().getState().gridScale).toBeGreaterThan(scaleBefore + 0.05)

    // Done locks it: message and handle hide, grid stays, it can no longer be dragged.
    await ui.tap("DoneButton")
    expect(guide().getState().phase).toBe("schedule")
    expect(findSceneObjectByName("ResizeHandle").enabled).toBe(false)
    expect(findSceneObjectByName("CardTitle").enabled).toBe(false) // the schedule list replaces the placement message
    expect(grid.enabled).toBe(true)
    expect(findInteractablesByName("GridPlate", undefined, true).length).toBe(0)
    const locked = worldPos(grid)
    expect(locked.sub(after).length).toBeLessThan(0.01)
  }
}
