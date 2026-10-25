# Pillbox Guide

A Specs (Snap Spectacles) AR overlay for filling a **weekly pill organizer** one medicine at a time. A 7 x 2 grid (Monday to Sunday, morning and evening) sits on the organizer and lights up the compartment to fill next, with a big arrow, a tick when confirmed, and a final count check.

Built for the **Learn AR with SPECS** hackathon with Lens Studio, Claude Code and CLAD.

> **Example schedule, not medical advice.** The Lens never gives medical advice, doses or interaction checks. It only shows a hard-coded example schedule with made-up medicine names. Always check a real list with your pharmacist.

## Demo

- `devpost/pillbox-guide-slideshow.mp4`: narrated slideshow of Lens Studio preview screenshots, with captions in `devpost/pillbox-guide-captions.srt`. **It is a slideshow, not a live recording**, because the laptop used for the build ran out of memory when recording the preview live.
- `devpost/screenshots/`: the five preview screenshots used in the video.
- `devpost/devpost-description.md`: project description, honest limits and what was learned.
- `devpost/design-brief.md`: the design brief the Lens was built from.
- `devpost/video-script.md`: the script for a live recording.

## Open it

1. Install **Lens Studio 5.24 or newer** with SPECS (Spectacles) support.
2. Open `specs-lens.esproj`.
3. In the Preview panel choose **Interactive Preview** with the Specs device. A mouse click acts as a pinch. WASD moves, Q/E go down/up, right-drag (or hold Shift) looks around.
4. Look down at the table. Place the grid over the stand-in organizer, press **Done**, then **Start filling**, and press **Next** (or pinch anywhere) for each compartment.

The `Packages/` folder contains the Spectacles Interaction Kit, Spectacles UI Kit, Leaf (test framework), and their small dependencies, so the project opens as-is. They keep their own licenses. Lens Studio regenerates `Cache/` and `Support/` itself.

## Tests (LEAF)

Open the LEAF panel in Lens Studio, choose the Preview target, and run the scenarios one at a time (they share one live Lens):

| Scenario | Checks |
|---|---|
| `c1-place-grid` | the grid sits on the virtual table; drag, stretch, and Done lock it |
| `c2-schedule-start` | schedule card, label, Start filling, first medicine lit, arrow |
| `c3-tick-undo` | Next or pinch-anywhere ticks and moves on; Undo steps back |
| `c4-put-away-next-medicine` | "Put this box away", next medicine, Monday-only tablet |
| `c5-final-summary` | final counts and the "Organizer ready" card with the reminder |
| `reach-ik-buttons` | a simulated arm can reach Done, Start filling and Next |

`shot-ticked`, `shot-putaway` and `demo-video` are helper scenarios used to stage screenshots and a demo run.

The tests use simulated hands. They prove the logic, not the feel on real glasses.

## Limits

- Tried in the Lens Studio preview only. No Specs device was available, so alignment on a real organizer and real hand tracking are **unproven**.
- The organizer is not recognized. The user places the grid by hand.
- The schedule is a fixed example. There is no editor, saving, or voice.

## License

MIT for the code and docs in this repository (see `LICENSE`). Packages in `Packages/` belong to their authors and keep their own licenses.
