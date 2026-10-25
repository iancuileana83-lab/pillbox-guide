import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractorEvent} from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent"
import {Interactor, InteractorTriggerType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"

// ---------------------------------------------------------------------------
// Pillbox Guide: a 7 x 2 overlay on a weekly organizer, filled one medicine at a time.
// Scale: centimeters. User starts at the origin facing -Z.
// ---------------------------------------------------------------------------

// The example schedule is hard-coded with made-up names (from devpost/design-brief.md).
// Cell index = row * 7 + day; row 0 = morning, row 1 = evening; day 0 = Monday.
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const ROW_NAMES = ["Morning", "Evening"]

interface Medicine {
  name: string
  cells: number[]
}

const MEDICINES: Medicine[] = [
  {name: "Morning tablet A, 1 every morning", cells: [0, 1, 2, 3, 4, 5, 6]},
  {name: "Evening tablet B, 1 every evening", cells: [7, 8, 9, 10, 11, 12, 13]},
  {name: "Weekly tablet C, 1 on Monday morning", cells: [0]}
]

// Fixed wording from the brief. Do not edit without the user's approval.
const LABEL_NOT_ADVICE = "Example schedule, not medical advice"
const REMINDER = "Check this list against your prescription. Ask your pharmacist if anything is unclear."
const TEXT_PLACE = "Place the grid over your organizer"
const TEXT_PUT_AWAY = "Put this box away"
const TEXT_READY = "Organizer ready"

export type Phase = "place" | "schedule" | "fill" | "putaway" | "done"

// Layout, in cm.
const TABLE_Y = -30
const TABLE_Z = -70
const ORGANIZER_SIZE = new vec3(22.8, 2.5, 9) // same footprint as the grid plate (GRID_W + 0.8 by GRID_H)
const GRID_W = 22
const GRID_H = 9
const CELL_PITCH_X = 3.14
const CELL_PITCH_Y = 4.0
const CELL_SIZE = new vec2(2.8, 3.4)
const GRID_LIFT = 0.3 // grid floats just above the organizer top
const CARD_SIZE = new vec2(30, 15)
const ARROW_LEAN = 1.45 // radians (about 83 degrees): the arrow lies almost flat on the table, tip at the cell, so it never rises over the day labels
const BUTTON_Z = 1.6 // buttons sit proud of the card so a press never sinks them behind it

const COL_PLATE = new vec4(0.2, 0.27, 0.45, 1)
const COL_PLATE_HOVER = new vec4(0.3, 0.4, 0.65, 1)
const COL_CELL_IDLE = new vec4(0.42, 0.5, 0.68, 1)
const COL_CELL_LIT = new vec4(1.0, 0.78, 0.1, 1)
const COL_CELL_CURRENT_A = new vec4(1.0, 0.85, 0.2, 1)
const COL_CELL_CURRENT_B = new vec4(1.0, 1.0, 0.75, 1)
const COL_CELL_DONE = new vec4(0.25, 0.8, 0.35, 1)
const COL_CELL_TOTAL = new vec4(0.3, 0.55, 0.9, 1)
const COL_ARROW = new vec4(0.15, 0.95, 0.95, 1) // cyan: stands out from the yellow cells and the blue plate
const COL_CARD = new vec4(0.14, 0.2, 0.36, 1)
const COL_TABLE = new vec4(0.32, 0.34, 0.42, 1)
const COL_ORGANIZER = new vec4(0.82, 0.76, 0.6, 1)
const COL_BTN_MAIN = new vec4(0.1, 0.5, 0.85, 1)
const COL_BTN_UNDO = new vec4(0.5, 0.35, 0.75, 1)
const COL_HANDLE =new vec4(1.0, 0.6, 0.15, 1)
const WHITE = new vec4(1, 1, 1, 1)

interface CellVisual {
  root: SceneObject
  base: RenderMeshVisual
  mat: Material
  count: Text
  check: SceneObject
}

@component
export class PillboxGuide extends BaseScriptComponent {
  static instance: PillboxGuide | null = null

  @input
  @hint("Unit box mesh used for every shape")
  boxMesh: RenderMesh

  @input
  @hint("Unlit material, cloned for each shape")
  unlitMat: Material

  private boxUnit: vec3 = new vec3(1, 1, 1)

  // Scene objects
  private world: SceneObject
  private gridRoot: SceneObject
  private plateMat: Material
  private handleRoot: SceneObject
  private handleMat: Material
  private cardRoot: SceneObject
  private anywhereTarget: SceneObject
  private arrow: SceneObject
  private cells: CellVisual[] = []

  // Card contents
  private titleText: Text
  private bodyText: Text
  private progressText: Text
  private reminderText: Text
  private labelText: Text
  private scheduleLines: Text[] = []
  private buttons: {[key: string]: Button} = {}
  private buttonObjs: {[key: string]: SceneObject} = {}

  // State
  private phase: Phase = "place"
  private medIndex: number = 0
  private step: number = 0 // index into the current medicine's cells
  private ticked: boolean[][] = MEDICINES.map((m) => m.cells.map(() => false))
  private gridScale: number = 1
  private gridStartPos: vec3 = vec3.zero()
  private dragMode: "none" | "move" | "resize" = "none"
  private dragInteractor: Interactor | null = null
  private dragOffset: vec3 = vec3.zero()
  private plateHover: boolean = false
  private handleHover: boolean = false

  onAwake() {
    PillboxGuide.instance = this
    this.createEvent("OnStartEvent").bind(() => this.start())
    this.createEvent("UpdateEvent").bind(() => this.update())
  }

  // ----------------------------------------------------------------------- build

  private start() {
    const min = this.boxMesh.aabbMin
    const max = this.boxMesh.aabbMax
    this.boxUnit = new vec3(
      Math.max(max.x - min.x, 0.0001),
      Math.max(max.y - min.y, 0.0001),
      Math.max(max.z - min.z, 0.0001)
    )

    this.world = this.makeObject("PillboxWorld", this.sceneObject)
    this.buildTableAndOrganizer()
    this.buildGrid()
    this.buildHandle()
    this.buildCard()
    this.buildAnywhereTarget()
    this.buildArrow()
    this.setPhase("place")
  }

  private makeObject(name: string, parent: SceneObject, pos: vec3 = vec3.zero()): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    so.getTransform().setLocalPosition(pos)
    return so
  }

  private makeMat(color: vec4): Material {
    const m = this.unlitMat.clone()
    m.mainPass.baseColor = color
    return m
  }

  /** A box of the given size in cm, centered on its object. */
  private makeBox(name: string, parent: SceneObject, size: vec3, pos: vec3, color: vec4): {obj: SceneObject; rmv: RenderMeshVisual; mat: Material} {
    // The holder stays unscaled (colliders and interactables go on it); the mesh child carries the box scale.
    const so = this.makeObject(name, parent, pos)
    const meshObj = this.makeObject(name + "Mesh", so)
    meshObj.getTransform().setLocalScale(new vec3(size.x / this.boxUnit.x, size.y / this.boxUnit.y, size.z / this.boxUnit.z))
    const rmv = meshObj.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    rmv.mesh = this.boxMesh
    const mat = this.makeMat(color)
    rmv.mainMaterial = mat
    return {obj: so, rmv, mat}
  }

  private makeText(
    name: string,
    parent: SceneObject,
    text: string,
    size: number,
    pos: vec3,
    width: number,
    height: number,
    align: HorizontalAlignment = HorizontalAlignment.Center
  ): Text {
    const so = this.makeObject(name, parent, pos)
    const t = so.createComponent("Component.Text") as Text
    t.text = text
    t.size = size
    t.depthTest = true
    t.textFill.color = WHITE
    t.horizontalAlignment = align
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Wrap
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-width / 2, width / 2, -height / 2, height / 2)
    return t
  }

  private makeCollider(so: SceneObject, size: vec3) {
    const col = so.createComponent("Physics.ColliderComponent") as ColliderComponent
    const shape = Shape.createBoxShape()
    shape.size = size
    col.shape = shape
    col.fitVisual = false
    return col
  }

  private buildTableAndOrganizer() {
    // The virtual table (stand-in for the real one).
    this.makeBox("VirtualTable", this.world, new vec3(90, 2, 60), new vec3(0, TABLE_Y - 1, TABLE_Z), COL_TABLE)

    // Placeholder organizer, obviously a stand-in.
    const org = this.makeBox(
      "StandInOrganizer",
      this.world,
      ORGANIZER_SIZE,
      new vec3(0, TABLE_Y + ORGANIZER_SIZE.y / 2, TABLE_Z),
      COL_ORGANIZER
    )
    const lbl = this.makeText(
      "StandInLabel",
      this.world,
      "Stand-in organizer (placeholder)",
      46,
      new vec3(0, TABLE_Y + 0.15, TABLE_Z + ORGANIZER_SIZE.z / 2 + 12),
      26,
      2.4
    )
    lbl.getSceneObject().getTransform().setLocalRotation(quat.fromEulerAngles(-Math.PI / 2, 0, 0))
    org.obj.name = "StandInOrganizer"
  }

  private cellLocalPos(index: number): vec3 {
    const row = Math.floor(index / 7)
    const day = index % 7
    const x = (day - 3) * CELL_PITCH_X
    const y = row === 0 ? CELL_PITCH_Y / 2 : -CELL_PITCH_Y / 2
    return new vec3(x, y, 0.25)
  }

  private buildGrid() {
    // Starts exactly over the stand-in organizer; the user can still drag and stretch it.
    this.gridStartPos = new vec3(0, TABLE_Y + ORGANIZER_SIZE.y + GRID_LIFT, TABLE_Z)
    this.gridRoot = this.makeObject("OrganizerGrid", this.world, this.gridStartPos)
    this.gridRoot.getTransform().setLocalRotation(quat.fromEulerAngles(-Math.PI / 2, 0, 0))

    const plate = this.makeBox("GridPlate", this.gridRoot, new vec3(GRID_W + 0.8, GRID_H, 0.3), vec3.zero(), COL_PLATE)
    this.plateMat = plate.mat

    // Day and row labels.
    // Light text on a dark backing bar so the labels stay readable over the table.
    const dayBarY = GRID_H / 2 + 1.7
    this.makeBox("DayLabelBar", this.gridRoot, new vec3(GRID_W + 0.8, 2.4, 0.3), new vec3(0, dayBarY, 0), COL_PLATE)
    for (let d = 0; d < 7; d++) {
      const t = this.makeText("DayLabel_" + DAYS[d], this.gridRoot, DAYS[d], 70, new vec3((d - 3) * CELL_PITCH_X, dayBarY, 0.25), 3.1, 2.2)
      t.horizontalOverflow = HorizontalOverflow.Overflow
    }
    for (let r = 0; r < 2; r++) {
      const y = r === 0 ? CELL_PITCH_Y / 2 : -CELL_PITCH_Y / 2
      const barX = -(GRID_W + 0.8) / 2 - 0.4 - 3.7
      this.makeBox("RowLabelBar_" + ROW_NAMES[r], this.gridRoot, new vec3(7.4, 2.6, 0.3), new vec3(barX, y, 0), COL_PLATE)
      const t = this.makeText("RowLabel_" + ROW_NAMES[r], this.gridRoot, ROW_NAMES[r], 66, new vec3(barX, y, 0.25), 7.2, 2.4)
      t.horizontalOverflow = HorizontalOverflow.Overflow
    }

    for (let i = 0; i < 14; i++) {
      this.cells.push(this.buildCell(i))
    }

    // Interaction for placing: move by dragging anywhere on the grid.
    this.makeCollider(plate.obj, new vec3(GRID_W + 0.8, GRID_H, 2).uniformScale(1))
    const inter = plate.obj.createComponent(Interactable.getTypeName()) as Interactable
    inter.onTriggerStart.add((e: InteractorEvent) => this.beginDrag(e.interactor, "move"))
    inter.onTriggerEnd.add(() => this.endDrag())
    inter.onTriggerEndOutside.add(() => this.endDrag())
    inter.onTriggerCanceled.add(() => this.endDrag())
    inter.onHoverEnter.add(() => (this.plateHover = true))
    inter.onHoverExit.add(() => (this.plateHover = false))
  }

  private buildCell(i: number): CellVisual {
    const row = Math.floor(i / 7)
    const day = i % 7
    const root = this.makeObject("Cell_" + DAYS[day] + "_" + ROW_NAMES[row], this.gridRoot, this.cellLocalPos(i))
    const base = this.makeBox("CellBase", root, new vec3(CELL_SIZE.x, CELL_SIZE.y, 0.4), vec3.zero(), COL_CELL_IDLE)
    const count = this.makeText("CellCount", root, "", 96, new vec3(0, 0, 0.3), 2.8, 3.0)
    // Dark text on the bright yellow cell would be unreadable on glasses; use white with the cell's own contrast.
    const check = this.makeObject("CellCheck", root, new vec3(0, 0, 0.3))
    this.makeBox("CheckShort", check, new vec3(1.0, 0.45, 0.2), new vec3(-0.68, -0.25, 0), WHITE).obj
      .getTransform()
      .setLocalRotation(quat.fromEulerAngles(0, 0, -0.82))
    this.makeBox("CheckLong", check, new vec3(2.1, 0.45, 0.2), new vec3(0.33, 0.15, 0), WHITE).obj
      .getTransform()
      .setLocalRotation(quat.fromEulerAngles(0, 0, 0.84))
    check.enabled = false
    return {root, base: base.rmv, mat: base.mat, count, check}
  }

  private buildHandle() {
    // A bright corner handle: drag it to stretch the grid.
    this.handleRoot = this.makeObject("ResizeHandle", this.gridRoot, new vec3(GRID_W / 2 + 0.8, -GRID_H / 2 - 0.8, 0.3))
    const box = this.makeBox("ResizeHandleBox", this.handleRoot, new vec3(2.4, 2.4, 0.8), vec3.zero(), COL_HANDLE)
    this.handleMat = box.mat
    this.makeCollider(box.obj, new vec3(3.6, 3.6, 2))
    const inter = box.obj.createComponent(Interactable.getTypeName()) as Interactable
    inter.onTriggerStart.add((e: InteractorEvent) => this.beginDrag(e.interactor, "resize"))
    inter.onTriggerEnd.add(() => this.endDrag())
    inter.onTriggerEndOutside.add(() => this.endDrag())
    inter.onTriggerCanceled.add(() => this.endDrag())
    inter.onHoverEnter.add(() => (this.handleHover = true))
    inter.onHoverExit.add(() => (this.handleHover = false))
  }

  private buildCard() {
    this.cardRoot = this.makeObject("MedicineCard", this.world, new vec3(0, TABLE_Y + 11, TABLE_Z - 11))
    this.cardRoot.getTransform().setLocalRotation(quat.fromEulerAngles(-0.35, 0, 0))
    this.makeBox("CardPanel", this.cardRoot, new vec3(CARD_SIZE.x, CARD_SIZE.y, 0.6), vec3.zero(), COL_CARD)

    const z = 0.5
    this.titleText = this.makeText("CardTitle", this.cardRoot, "", 92, new vec3(0, 3.6, z), 27, 5)
    this.bodyText = this.makeText("CardBody", this.cardRoot, "", 54, new vec3(0, 0, z), 27, 4)
    this.progressText = this.makeText("CardProgress", this.cardRoot, "", 54, new vec3(0, -0.3, z), 27, 1.6)
    this.reminderText = this.makeText("CardReminder", this.cardRoot, REMINDER, 46, new vec3(0, -0.6, z), 27, 3)
    this.labelText = this.makeText("CardLabel", this.cardRoot, LABEL_NOT_ADVICE, 40, new vec3(0, -6.6, z), 27, 1.4)
    for (let i = 0; i < MEDICINES.length; i++) {
      this.scheduleLines.push(this.makeText("ScheduleLine" + i, this.cardRoot, MEDICINES[i].name, 58, new vec3(0, 5.6 - i * 2.3, z), 28, 2))
    }

    this.addButton("DoneButton", "Done", new vec3(0, -3.6, BUTTON_Z), 9, 3.6, () => this.onDone())
    this.addButton("StartFillingButton", "Start filling", new vec3(0, -3.9, BUTTON_Z), 12, 3.8, () => this.onStartFilling())
    this.addButton("NextButton", "Next", new vec3(8, -3.6, BUTTON_Z), 10, 4.2, () => this.advance())
    this.addButton("UndoButton", "Undo", new vec3(-8, -3.6, BUTTON_Z), 10, 4.2, () => this.undo())
  }

  private addButton(name: string, label: string, pos: vec3, w: number, h: number, onClick: () => void) {
    const so = this.makeObject(name, this.cardRoot, pos)
    const btn = so.createComponent(Button.getTypeName()) as Button
    // Primary style so the face is bright and readable (the default face is dark gray).
    ;(btn as any)._themeOverride = "SnapOS2"
    ;(btn as any)._shapeSnapOS2 = "Rectangle"
    ;(btn as any)._styleSnapOS2 = name === "UndoButton" ? "Secondary" : "Primary"
    ;(btn as any)._size = new vec3(w, h, 1)
    btn.initialize()
    // Bright plate in front of the button face, so the control is clearly visible (additive display).
    const base = name === "UndoButton" ? COL_BTN_UNDO : COL_BTN_MAIN
    const plate = this.makeBox(name + "Plate", so, new vec3(w, h, 0.3), new vec3(0, 0, 0.3), base)
    const t = this.makeText(name + "Label", so, label, 68, new vec3(0, 0, 0.6), w - 0.6, h)
    t.horizontalOverflow = HorizontalOverflow.Overflow
    // Highlight when aimed at.
    btn.onHoverEnter.add(() => (plate.mat.mainPass.baseColor = base.uniformScale(1.0).add(new vec4(0.25, 0.25, 0.25, 0))))
    btn.onHoverExit.add(() => (plate.mat.mainPass.baseColor = base))
    btn.onTriggerUp.add(onClick)
    this.buttons[name] = btn
    this.buttonObjs[name] = so
  }

  private buildAnywhereTarget() {
    // A big invisible target so a pinch anywhere confirms; nearer buttons win when aimed at.
    this.anywhereTarget = this.makeObject("PinchAnywhereTarget", this.world, new vec3(0, -5, -130))
    this.makeCollider(this.anywhereTarget, new vec3(260, 160, 2))
    const inter = this.anywhereTarget.createComponent(Interactable.getTypeName()) as Interactable
    inter.onTriggerEnd.add(() => this.advance())
  }

  private arrowPos(cellIndex: number, bob: number): vec3 {
    // Tip at the near edge of the cell, floating a little above it.
    return this.cellLocalPos(cellIndex).add(new vec3(0, -(CELL_SIZE.y / 2 + 0.2), 0.5 + bob * 0.9))
  }

  private buildArrow() {
    // Points at the current compartment. Child of the grid; leans toward the user (away from the day labels)
    // and its tip touches the near edge of the cell.
    this.arrow = this.makeObject("CurrentArrow", this.gridRoot)
    this.arrow.getTransform().setLocalRotation(quat.fromEulerAngles(Math.PI / 2 + ARROW_LEAN, 0, 0))
    this.arrow.getTransform().setLocalScale(vec3.one().uniformScale(1.2))
    this.makeBox("ArrowShaft", this.arrow, new vec3(0.9, 3.2, 0.9), new vec3(0, 1.8, 0), COL_ARROW)
    this.makeBox("ArrowLeft", this.arrow, new vec3(0.9, 2.4, 0.9), new vec3(-0.85, 0.85, 0), COL_ARROW).obj
      .getTransform()
      .setLocalRotation(quat.fromEulerAngles(0, 0, Math.PI / 4))
    this.makeBox("ArrowRight", this.arrow, new vec3(0.9, 2.4, 0.9), new vec3(0.85, 0.85, 0), COL_ARROW).obj
      .getTransform()
      .setLocalRotation(quat.fromEulerAngles(0, 0, -Math.PI / 4))
    this.arrow.enabled = false
  }

  // ----------------------------------------------------------------------- placement drag

  private beginDrag(interactor: Interactor, mode: "move" | "resize") {
    if (this.phase !== "place") return
    this.dragMode = mode
    this.dragInteractor = interactor
    const hit = this.tablePoint(interactor)
    if (mode === "move" && hit) {
      this.dragOffset = this.gridRoot.getTransform().getWorldPosition().sub(hit)
    }
  }

  private endDrag() {
    this.dragMode = "none"
    this.dragInteractor = null
  }

  /** Where the interactor's ray meets the horizontal plane of the grid. */
  private tablePoint(interactor: Interactor): vec3 | null {
    const o = interactor.startPoint
    const d = interactor.direction
    if (!o) return null
    const planeY = TABLE_Y + ORGANIZER_SIZE.y + GRID_LIFT
    // Direct (near) interaction has no ray: use the fingertip's position over the plane.
    if (!d || d.length < 0.0001) return new vec3(o.x, planeY, o.z)
    if (d.y > -0.0001) return null
    const t = (planeY - o.y) / d.y
    return o.add(d.uniformScale(t))
  }

  private updateDrag() {
    if (this.dragMode === "none" || !this.dragInteractor) return
    if (this.dragInteractor.currentTrigger === InteractorTriggerType.None) {
      this.endDrag()
      return
    }
    const hit = this.tablePoint(this.dragInteractor)
    if (!hit) return
    const tr = this.gridRoot.getTransform()
    if (this.dragMode === "move") {
      const p = hit.add(this.dragOffset)
      tr.setWorldPosition(new vec3(this.clamp(p.x, -30, 30), tr.getWorldPosition().y, this.clamp(p.z, TABLE_Z - 20, TABLE_Z + 25)))
    } else {
      // Scale so the handle follows the pointer. Handle distance from the grid center at scale 1:
      const center = tr.getWorldPosition()
      const flat = new vec3(hit.x - center.x, 0, hit.z - center.z)
      const base = Math.sqrt(Math.pow(this.handleRoot.getTransform().getLocalPosition().x, 2) + Math.pow(this.handleRoot.getTransform().getLocalPosition().y, 2))
      this.setGridScale(flat.length / base)
    }
  }

  private setGridScale(s: number) {
    this.gridScale = this.clamp(s, 0.6, 1.8)
    this.gridRoot.getTransform().setLocalScale(vec3.one().uniformScale(this.gridScale))
  }

  private clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v))
  }

  // ----------------------------------------------------------------------- flow

  private onDone() {
    if (this.phase !== "place") return
    this.endDrag()
    this.setPhase("schedule")
  }

  private onStartFilling() {
    if (this.phase !== "schedule") return
    this.medIndex = 0
    this.step = 0
    this.setPhase("fill")
  }

  /** Confirm the current compartment (Next button or a pinch anywhere). */
  advance() {
    if (this.phase === "fill") {
      const med = MEDICINES[this.medIndex]
      this.ticked[this.medIndex][this.step] = true
      this.step++
      if (this.step >= med.cells.length) {
        this.setPhase("putaway")
      } else {
        this.refresh()
      }
    } else if (this.phase === "putaway") {
      if (this.medIndex + 1 < MEDICINES.length) {
        this.medIndex++
        this.step = 0
        this.setPhase("fill")
      } else {
        this.setPhase("done")
      }
    }
  }

  /** Step back one compartment (or one screen). */
  undo() {
    if (this.phase === "fill") {
      if (this.step > 0) {
        this.step--
        this.ticked[this.medIndex][this.step] = false
        this.refresh()
      } else if (this.medIndex > 0) {
        this.medIndex--
        this.step = MEDICINES[this.medIndex].cells.length
        this.setPhase("putaway")
      } else {
        this.setPhase("schedule")
      }
    } else if (this.phase === "putaway") {
      this.step = MEDICINES[this.medIndex].cells.length - 1
      this.ticked[this.medIndex][this.step] = false
      this.setPhase("fill")
    } else if (this.phase === "done") {
      this.medIndex = MEDICINES.length - 1
      this.step = MEDICINES[this.medIndex].cells.length
      this.setPhase("putaway")
    }
  }

  private setPhase(p: Phase) {
    this.phase = p
    this.refresh()
  }

  // ----------------------------------------------------------------------- view

  private totals(): number[] {
    const t = new Array(14).fill(0)
    MEDICINES.forEach((m) => m.cells.forEach((c) => t[c]++))
    return t
  }

  private show(name: string, on: boolean) {
    this.buttonObjs[name].enabled = on
  }

  private refresh() {
    const p = this.phase

    // Card texts
    const showLines = p === "schedule"
    this.scheduleLines.forEach((t) => (t.getSceneObject().enabled = showLines))
    this.titleText.getSceneObject().enabled = p !== "schedule"
    this.bodyText.getSceneObject().enabled = p === "place"
    this.progressText.getSceneObject().enabled = p === "fill"
    if (p === "fill") {
      this.progressText.text = "Compartment " + (this.step + 1) + " of " + MEDICINES[this.medIndex].cells.length
    }
    this.reminderText.getSceneObject().enabled = p === "schedule" || p === "done"
    this.labelText.getSceneObject().enabled = true

    const reminderT = this.reminderText.getSceneObject().getTransform()
    const titleT = this.titleText.getSceneObject().getTransform()
    if (p === "place") {
      this.titleText.text = TEXT_PLACE
      titleT.setLocalPosition(new vec3(0, 3.8, 0.5))
      this.bodyText.text = "Drag the grid to move it. Drag the orange corner to resize it."
      this.bodyText.getSceneObject().getTransform().setLocalPosition(new vec3(0, 0.2, 0.5))
    } else if (p === "schedule") {
      reminderT.setLocalPosition(new vec3(0, -0.6, 0.5))
    } else if (p === "fill") {
      this.titleText.text = MEDICINES[this.medIndex].name
      titleT.setLocalPosition(new vec3(0, 3.0, 0.5))
    } else if (p === "putaway") {
      this.titleText.text = TEXT_PUT_AWAY
      titleT.setLocalPosition(new vec3(0, 3.0, 0.5))
    } else if (p === "done") {
      this.titleText.text = TEXT_READY
      titleT.setLocalPosition(new vec3(0, 4.4, 0.5))
      reminderT.setLocalPosition(new vec3(0, 0.9, 0.5))
    }

    // Buttons
    this.show("DoneButton", p === "place")
    this.show("StartFillingButton", p === "schedule")
    this.show("NextButton", p === "fill" || p === "putaway")
    this.show("UndoButton", p === "fill" || p === "putaway" || p === "done")
    const undoT = this.buttonObjs["UndoButton"].getTransform()
    undoT.setLocalPosition(p === "done" ? new vec3(0, -3.9, BUTTON_Z) : new vec3(-8, -3.6, BUTTON_Z))

    // Placement helpers
    this.handleRoot.enabled = p === "place"
    const gridInter = this.plateInteractable()
    if (gridInter) gridInter.enabled = p === "place"
    this.anywhereTarget.enabled = p === "fill" || p === "putaway"

    this.refreshCells()
  }

  private plateInteractable(): Interactable | null {
    const plate = this.gridRoot.getChild(0)
    return plate ? (plate.getComponent(Interactable.getTypeName()) as Interactable) : null
  }

  private refreshCells() {
    const p = this.phase
    const totals = this.totals()
    const litMap: {[cell: number]: {step: number}} = {}
    if (p === "fill" || p === "putaway") {
      MEDICINES[this.medIndex].cells.forEach((c, i) => (litMap[c] = {step: i}))
    }
    this.arrow.enabled = false

    for (let i = 0; i < 14; i++) {
      const cv = this.cells[i]
      cv.check.enabled = false
      cv.count.text = ""
      cv.mat.mainPass.baseColor = COL_CELL_IDLE
      cv.root.getTransform().setLocalScale(vec3.one())

      if (p === "done") {
        cv.count.text = "" + totals[i]
        cv.mat.mainPass.baseColor = COL_CELL_TOTAL
      } else if (litMap[i] !== undefined) {
        const s = litMap[i].step
        if (this.ticked[this.medIndex][s]) {
          cv.mat.mainPass.baseColor = COL_CELL_DONE
          cv.check.enabled = true
        } else {
          cv.mat.mainPass.baseColor = COL_CELL_LIT
          cv.count.text = "1"
          cv.count.textFill.color = new vec4(0.1, 0.1, 0.15, 1)
          if (p === "fill" && s === this.step) {
            this.arrow.enabled = true
            this.arrow.getTransform().setLocalPosition(this.arrowPos(i, 0))
          }
        }
      }
      if (p === "done") cv.count.textFill.color = WHITE
    }
  }

  private currentCellIndex(): number {
    if (this.phase !== "fill") return -1
    return MEDICINES[this.medIndex].cells[this.step]
  }

  private update() {
    this.updateDrag()
    const time = getTime()

    // Highlight on aim during placement.
    if (this.phase === "place") {
      this.plateMat.mainPass.baseColor = this.plateHover || this.dragMode === "move" ? COL_PLATE_HOVER : COL_PLATE
      const hot = this.handleHover || this.dragMode === "resize"
      this.handleMat.mainPass.baseColor = hot ? new vec4(1, 0.85, 0.4, 1) : COL_HANDLE
    } else {
      this.plateMat.mainPass.baseColor = COL_PLATE
    }

    // The current compartment glows brighter; the arrow bobs.
    const cur = this.currentCellIndex()
    if (cur >= 0) {
      const k = 0.5 + 0.5 * Math.sin(time * 5)
      const cv = this.cells[cur]
      cv.mat.mainPass.baseColor = new vec4(
        COL_CELL_CURRENT_A.r + (COL_CELL_CURRENT_B.r - COL_CELL_CURRENT_A.r) * k,
        COL_CELL_CURRENT_A.g + (COL_CELL_CURRENT_B.g - COL_CELL_CURRENT_A.g) * k,
        COL_CELL_CURRENT_A.b + (COL_CELL_CURRENT_B.b - COL_CELL_CURRENT_A.b) * k,
        1
      )
      cv.root.getTransform().setLocalScale(vec3.one().uniformScale(1.08))
      const bob = 0.5 + 0.5 * Math.sin(time * 4)
      this.arrow.getTransform().setLocalPosition(this.arrowPos(cur, bob))
    }
  }

  // ----------------------------------------------------------------------- test hooks

  /** Test hook: return to the start screen (grid at its starting spot, nothing ticked). */
  resetForTest() {
    this.endDrag()
    this.ticked = MEDICINES.map((m) => m.cells.map(() => false))
    this.medIndex = 0
    this.step = 0
    this.setGridScale(1)
    this.gridRoot.getTransform().setWorldPosition(this.gridStartPos)
    this.setPhase("place")
  }

  getState() {
    return {
      phase: this.phase,
      medIndex: this.medIndex,
      step: this.step,
      currentCell: this.currentCellIndex(),
      cardTitle: this.titleText.text,
      gridScale: this.gridScale
    }
  }
}
