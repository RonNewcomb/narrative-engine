# Narrative Engine

Implementing ideas from https://www.gamedeveloper.com/author/ron-newcomb with help of old-school "planner" AI I originally implemented for Inform 7: https://github.com/i7/extensions/blob/master/Ron%20Newcomb/Problem-Solving%20Characters.i7x

## Install and Run

With typescript and rollup both installed globally `npm i rollup --global` and `npm install tslib --global` issue the commands:

`tsc && rollup --file build.js build/g1.js`

Pull up index.html in the browser, view F12 console.

Can also use `--watch` on both commands in 2 different windows.

## notes

- need to separate the actions & reactions from the actual reporting to the user. Can't foreshadow a reaction unless the machinery runs to discover one.

## Flow

Setup desireables, actions on them, characters, and character beliefs about the dispositions of certain desireables. Call narrativeEngine with this.

`main` chooses a scene from a character and their initial action. `playStory` plays the scene, and then gets the next scene that ChoiceConsequenceClosure scheduled during the scene.

During a scene, run the character's action as a planning tree / Planner AI. Does multiple character actions in a loop.

Running a character action involves executing the action definition's rulebook: check rules to see if failed, then rules to make the changes in desireables. After the action was deemed successful, failed, or partly, create a `news` item and run through all the other characters and their beliefs to see if there are any consequences to the action. If so, ChoiceConsequenceClosure attaches a consequence object to the scene.

All desireables, attempts, and beliefs are _resources_.

# Impure functions

weCouldTry - attaches new child node to passed-in parent node... or to character.goals; doesn't return child node

createNewsItem - mutates story.currentTurnsNews

createSceneSet - mutates story.sceneStack

reactionsToNews - mutates story.sceneStack

resetNewsCycle - mutates story.history, story.currentTurnsNews

doThing - mutates attempt.status

doThingAsAScene - mutates character.goals, calls weCouldTry

moveDesireable - mutates global desireables

produceParagraphs - whole file is I/O

executeRulebook - calls moveDesireable

playScene - mutates scene.result, .isFinished; calls doThingAsAScene
