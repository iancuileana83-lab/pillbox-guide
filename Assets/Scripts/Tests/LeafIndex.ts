import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {PillboxPlaceGridScenario} from "./PillboxPlaceGridScenario"
import {PillboxScheduleScenario} from "./PillboxScheduleScenario"
import {PillboxTickUndoScenario} from "./PillboxTickUndoScenario"
import {PillboxPutAwayScenario} from "./PillboxPutAwayScenario"
import {PillboxSummaryScenario} from "./PillboxSummaryScenario"
import {PillboxReachScenario} from "./PillboxReachScenario"
import {PillboxShotTickedScenario} from "./PillboxShotTickedScenario"
import {PillboxShotPutAwayScenario} from "./PillboxShotPutAwayScenario"
import {PillboxDemoScenario} from "./PillboxDemoScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "c1-place-grid", typename: PillboxPlaceGridScenario.getTypeName()},
    {id: "c2-schedule-start", typename: PillboxScheduleScenario.getTypeName()},
    {id: "c3-tick-undo", typename: PillboxTickUndoScenario.getTypeName()},
    {id: "c4-put-away-next-medicine", typename: PillboxPutAwayScenario.getTypeName()},
    {id: "c5-final-summary", typename: PillboxSummaryScenario.getTypeName()},
    {id: "reach-ik-buttons", typename: PillboxReachScenario.getTypeName()},
    // Helpers for the Devpost screenshots and the demo video (not part of the done-criteria checks)
    {id: "shot-ticked", typename: PillboxShotTickedScenario.getTypeName()},
    {id: "shot-putaway", typename: PillboxShotPutAwayScenario.getTypeName()},
    {id: "demo-video", typename: PillboxDemoScenario.getTypeName()}
  ]
}
