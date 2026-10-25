---
status: approved
---

# Design brief: Pillbox Guide

## The one spatial moment
The user sits at a table with an empty weekly organizer and their medicine boxes. A 7 x 2 grid (7 days, morning and evening) floats just above the organizer, lined up with the real compartments. They fill one medicine at a time, not day by day. The Lens lights up every compartment where the current medicine goes, with a small "1" on each, and the user drops in one tablet at a time and confirms each one. Ticked compartments turn green. At the end every compartment shows how many tablets it should now hold, for a last visual check.

## Why it belongs on glasses
- Uses: draws in the world (the grid and highlights sit on the real compartments); leaves your body free (hands on the pills, eyes on the box).
- Why it's better than the phone or laptop version: with a phone or paper list, the user looks away from the box to read it and has to keep their place. Here the highlight is on the compartment itself, so a pill is never put in the wrong day, and a free hand confirms each one.

## Product or overlay
- Type: overlay: it responds to a real organizer on the table.
- What the real version would sense: where the organizer is and where its compartments are.
- Stand-in for the preview: the user places the grid by hand. A flat 7 x 2 grid appears on the table with the message "Place the grid over your organizer". They pinch and drag it over the organizer, stretch it to match the size, and pinch "Done" to lock it. In the preview it sits on the virtual table over a simple flat placeholder box, clearly labelled as a stand-in. No recognition is needed.

## Where things live
- Where the user is looking during the main task: down at the compartment they are filling.
- Grid: lies flat on the table surface over the organizer, about 22 cm long and 9 cm wide, with compartments about 3 cm wide, matching real size. 7 columns (Monday to Sunday) by 2 rows (morning, evening).
- Highlight, the "1" and the arrow: sit directly on the compartment, not on the card. The current compartment glows brighter with a big arrow.
- Medicine card: stands upright just behind the organizer, slightly above it, like a small sign on the table, about 30 cm wide and 15 cm tall, tilted slightly toward the user (default). It never covers the compartments. It shows the medicine name as entered, for example "Morning tablet A, 1 every morning", plus the buttons. The user reads it with a small glance up.
- "Put this box away" and the final "Organizer ready" summary replace the card in the same place.
- Text is large and high-contrast (light text on a solid panel, no dark-on-dark), because many users are older.
- The table is about 70 cm in front of the user's start position (default).

## Hands and input
- Place the grid: pinch and drag to move, stretch to resize, pinch the "Done" button to lock it.
- Start filling: pinch a large "Start filling" button on the card.
- Confirm a compartment: a large "Next" button on the card, or a simple pinch anywhere (a big invisible target, so no aiming at the 3 cm compartment). The lit compartments are confirmed in a fixed order (Monday morning, Tuesday morning, and so on).
- Undo: a large "Undo" button steps back one compartment.
- Targets are big and highlight when aimed at.
- Voice: none.

## When things show
- Placement grid and message: shows at the start, hides when "Done" is pressed (the grid stays as the organizer overlay).
- Schedule list card: shows after placement, before filling, with the large "Start filling" button and the line "Check this list against your prescription. Ask your pharmacist if anything is unclear." It shows the label "Example schedule, not medical advice".
- Medicine step: shows the medicine name and lights up only the compartments where it goes, with a small "1" on each.
- "Put this box away": shows after the last compartment of a medicine, then moves to the next medicine.
- Final summary: each compartment shows its total tablet count, and the card says the organizer is ready, with the pharmacist reminder.
- If something needs attention out of view: none (everything stays on the table in front of the user).

## The example schedule (hard-coded, made-up names)
1. "Morning tablet A, 1 every morning": all 7 morning compartments.
2. "Evening tablet B, 1 every evening": all 7 evening compartments.
3. "Weekly tablet C, 1 on Monday morning": Monday morning only.

Final totals: Monday morning 2, other mornings 1, every evening 1.

The Lens never gives medical advice, doses or interactions. It only shows the schedule the user supplied.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. On start, the 7 x 2 grid appears on the virtual table over the placeholder box; I can pinch, drag and stretch it, and "Done" locks it.
2. The card shows the example schedule with "Example schedule, not medical advice" and "Start filling". Pressing it shows "Morning tablet A" and lights up all 7 morning compartments, with the first one glowing brighter and an arrow.
3. Pressing "Next" (or pinching anywhere) ticks the current compartment green with a check mark and moves the arrow to the next one in order; "Undo" steps back one.
4. After the last compartment of a medicine, the card says "Put this box away" and moves to the next medicine; "Weekly tablet C" lights only Monday morning.
5. At the end, each compartment shows its total tablet count (Monday morning 2, other mornings 1, evenings 1) and the card says the organizer is ready, with the pharmacist reminder.

## Out of scope
- Recognizing the real organizer or its compartments.
- Entering the schedule inside the Lens. Next step, not this version: a simple pinch-to-pick editor (choose days and morning or evening with buttons), and in a real version a phone companion app.
- Saving the schedule or progress between sessions.
- Any medical advice, doses or interaction checks.
- Voice, custom gestures, and multiple users.

## Risks and open questions
- Feel unproven: whether a 3 cm compartment highlight reads well and the grid stays aligned with a real organizer on real glasses.
- The hand-placed alignment can drift if the user moves; only real glasses can answer how well it holds.
- The made-up example schedule is not medical advice; the Lens must always show that label and the pharmacist reminder.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
