import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {PillboxGuide} from "../PillboxGuide"

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const ROWS = ["Morning", "Evening"]

export type CellKind = "idle" | "lit" | "done" | "total" | "other"

export function guide(): PillboxGuide {
  const g = PillboxGuide.instance
  if (!g) throw new Error("PillboxGuide is not running")
  return g
}

export function cellName(index: number): string {
  return "Cell_" + DAYS[index % 7] + "_" + ROWS[Math.floor(index / 7)]
}

export function cellObject(index: number): SceneObject {
  return findSceneObjectByName(cellName(index))
}

export function childByName(parent: SceneObject, name: string): SceneObject {
  for (let i = 0; i < parent.getChildrenCount(); i++) {
    const c = parent.getChild(i)
    if (c.name === name) return c
  }
  throw new Error(`Child "${name}" not found under "${parent.name}"`)
}

export function textOf(name: string): string {
  return (findSceneObjectByName(name).getComponent("Component.Text") as Text).text
}

export function cellCount(index: number): string {
  return (childByName(cellObject(index), "CellCount").getComponent("Component.Text") as Text).text
}

export function cellChecked(index: number): boolean {
  return childByName(cellObject(index), "CellCheck").enabled
}

export function cellColor(index: number): vec4 {
  const mesh = childByName(childByName(cellObject(index), "CellBase"), "CellBaseMesh")
  return (mesh.getComponent("Component.RenderMeshVisual") as RenderMeshVisual).mainMaterial.mainPass.baseColor
}

export function cellKind(index: number): CellKind {
  const c = cellColor(index)
  if (Math.abs(c.r - 0.42) < 0.06 && Math.abs(c.g - 0.5) < 0.06 && Math.abs(c.b - 0.68) < 0.06) return "idle"
  if (c.r > 0.9 && c.b < 0.8 && c.g > 0.7) return "lit" // yellow, including the pulsing current cell
  if (c.g > 0.7 && c.r < 0.4 && c.b < 0.5) return "done" // green
  if (Math.abs(c.r - 0.3) < 0.06 && Math.abs(c.g - 0.55) < 0.06 && Math.abs(c.b - 0.9) < 0.06) return "total"
  return "other"
}

export function worldX(obj: SceneObject): number {
  return obj.getTransform().getWorldPosition().x
}

export function worldPos(obj: SceneObject): vec3 {
  return obj.getTransform().getWorldPosition()
}

export class PillboxLeafInteractor extends DefaultLeafInteractor {
  /** Aim at and trigger a named, enabled interactable (button, target...). */
  async tap(name: string): Promise<void> {
    const target = findInteractablesByName(name, undefined, true)[0]
    if (!target) {
      throw new Error(`Interactable "${name}" not found or not enabled`)
    }
    await this.trigger(target)
    await sleep(250)
  }

  async dragNamed(name: string, delta: vec3, durationMs: number): Promise<void> {
    const target = findInteractablesByName(name, undefined, true)[0]
    if (!target) {
      throw new Error(`Interactable "${name}" not found or not enabled`)
    }
    // Hover first so the simulated hand is already at the target when it pinches (otherwise its approach
    // travel is counted as part of the drag).
    await this.hover(target, 600)
    await this.drag(target, delta, durationMs)
    await sleep(250)
  }
}

/** Fresh start for every scenario: scenarios share one live Lens. */
export async function resetGuide(): Promise<void> {
  guide().resetForTest()
  await sleep(300)
}

export const NAME_A = "Morning tablet A, 1 every morning"
export const NAME_B = "Evening tablet B, 1 every evening"
export const NAME_C = "Weekly tablet C, 1 on Monday morning"
export const LABEL = "Example schedule, not medical advice"
export const REMINDER = "Check this list against your prescription. Ask your pharmacist if anything is unclear."

export async function toSchedule(ui: PillboxLeafInteractor) {
  await resetGuide()
  await ui.tap("DoneButton")
}

export async function toFilling(ui: PillboxLeafInteractor) {
  await toSchedule(ui)
  await ui.tap("StartFillingButton")
}

export async function nextTimes(ui: PillboxLeafInteractor, n: number) {
  for (let i = 0; i < n; i++) {
    await ui.tap("NextButton")
  }
}

export function litCells(): number[] {
  const out: number[] = []
  for (let i = 0; i < 14; i++) {
    if (cellKind(i) === "lit") out.push(i)
  }
  return out
}
