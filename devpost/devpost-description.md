# Pillbox Guide: Devpost description (DRAFT)

> Draft for you to edit. Items in [brackets] are yours to fill in or confirm. Before you submit, re-run the LEAF tests in Lens Studio and update the "Testing" section to match what actually passes.

## Tagline
A weekly pill organizer you fill one medicine at a time, with the right compartment lit on the box itself.

## What it does
Pillbox Guide is a Specs overlay for the weekly pill organizer on your table. A 7 x 2 grid (Monday to Sunday, morning and evening) floats just above the organizer and lines up with its real compartments.

You fill one medicine at a time, not one day at a time:
1. **Place the grid.** Pinch and drag the grid over your organizer, stretch it to match the size, and pinch "Done" to lock it.
2. **See the schedule.** A card standing behind the organizer lists the medicines and shows "Example schedule, not medical advice" and a reminder to check the list with your pharmacist.
3. **Fill.** "Start filling" lights every compartment where the current medicine goes, each with a small "1". The current compartment glows brighter with a big arrow, and the card says "Compartment 2 of 7". Drop in one tablet, then pinch "Next" (or pinch anywhere) to confirm. The compartment turns green with a check mark. "Undo" steps back.
4. **Put the box away.** After the last compartment of a medicine, the card says "Put this box away" and moves to the next medicine.
5. **Check.** At the end every compartment shows how many tablets it should now hold, for one last visual check, and the card says "Organizer ready".

The Lens never gives medical advice, doses or interaction checks. It only shows the schedule the user supplies. In this version the schedule is a hard-coded example with made-up medicine names.

## Who it's for
People who fill a weekly pill organizer by hand. That includes many older adults and the family members who help them. Losing your place halfway through a week of pills is easy, and a wrong compartment is a real problem. Text is large and high-contrast, and the controls are big pinch targets, because many of these users have less steady hands and weaker eyesight.

## Why glasses
- **It draws in the world.** The highlight sits on the compartment itself, so a pill is never put in the wrong day.
- **It leaves your hands and eyes free.** With a phone or a paper list you look away from the box to read, then hunt for your place again. Here your eyes stay on the box and a free hand confirms each pill.

## How it was built
- Built for Specs in Lens Studio, using the Spectacles Interaction Kit and UI Kit for all interaction, so it works with the mouse in Interactive Preview.
- Built with **Claude Code** and **CLAD**, the Lens Studio agent toolkit: Claude Code wrote the scripts and scene from the design brief and drove Lens Studio through its tools.
- Designed first with a written design brief (`devpost/design-brief.md`), which we followed closely.
- Real-world scale in centimeters: a 22 cm by 9 cm grid with compartments about 3 cm wide.
- Designed for an additive display, where black is transparent: light text on solid panels, bright button plates, no reliance on dark colors.

## Testing
- Six LEAF scenarios, one for each of the five done criteria plus an IK reachability check, run in the Lens Studio preview.
- On the final design (organizer aligned under the grid, larger day and row labels, a flat arrow that no longer covers the labels), all six scenarios passed in the Lens Studio preview: placing the grid, the schedule card, ticking and Undo, "Put this box away" and the next medicine, the final totals, and the IK reach check.
- The tests use simulated hands. They prove the logic, not the feel on real glasses.
- Known limitation found while testing: with the preview camera moved very close, a direct poke on "Done" also pressed "Start filling", because the two buttons sit in the same spot on the card. A real version should offset them.

## What I learned
- [Edit these in your own words. Suggestions from the build:]
- Writing the design brief first made the build much faster. Every "where does this go" question already had an answer.
- Real-size, real-distance placement matters. A 3 cm target needs to be big enough to see, and the arrow needs to lean away from the labels it would otherwise cover.
- An additive display changes the design: dark panels fade out, so contrast has to come from bright colors and light text.
- Automated tests catch logic problems, but only looking at the preview shows whether something is hard to read.

## Honest limits
- **Preview only.** There is no Specs device here, so everything was tried in Lens Studio's Interactive Preview. How the grid holds its alignment on a real organizer, how the highlight reads on real glasses, and real hand tracking are all **unproven**.
- **No recognition.** The user places the grid by hand over a stand-in organizer. It can drift if the user moves. A real version would sense the organizer and its compartments.
- **Fixed example schedule.** The medicines are hard-coded and made up. There is no schedule editor, no saving between sessions, and no voice. Next steps would be a simple pinch-to-pick editor and a phone companion app.
- **Not medical advice.** The Lens always shows "Example schedule, not medical advice" and the pharmacist reminder. It does no dosing, interaction checks or advice.
- **Tests simulate hands.** The tests drive the interface with simulated hands, which proves the logic but not the feel.

## About the demo video
The demo video (`devpost/pillbox-guide-slideshow.mp4`, with captions in `devpost/pillbox-guide-captions.srt`) is **a slideshow of screenshots taken in the Lens Studio preview, with narration and captions. It is not a live recording.** The laptop ran out of memory when we tried to record the preview live, so Lens Studio crashed. The video says this on its title card and in a banner on every slide. The screenshots show the real preview output of the final design. The narration notes that hand input in the tests is simulated, and that grid alignment on real glasses is unproven.

## Links
- Video: [YouTube link, public: upload `devpost/pillbox-guide-slideshow.mp4`]
- Repo: [GitHub link, public. Only make it public when you are ready]
