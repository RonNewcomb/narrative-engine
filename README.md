# A Narrative Engine

Implementing ideas from https://www.gamedeveloper.com/author/ron-newcomb with help of old-school "planner" AI originally implemented for Inform 7: https://github.com/i7/extensions/blob/master/Ron%20Newcomb/Problem-Solving%20Characters.i7x

## Purpose

I tried to author an intfiction once. It didn't go well. Not because of the computerized aspect of it, I have a good handle on that, but because what I thought an intfiction was supposed to be didn't match up with what else was out there.

The writing books I've since read have taught me a lot. For example, plot is just the series of characters reacting to the actions of other characters. Foreshadowing informs readers of the importance of the seemingly trivial. Scenes package smaller stories into composable chunks. Existing tools for creating intfiction didn't connect with let alone teach any of these concepts.

Many of the existing tools for interactive fiction fall into two camps, the choose-your-own-adventure and the parser-based world simulation. CYOA intfiction I found so easy I rarely paid the reading of it close attention. Parser-based intfiction I still find difficult to actually progress through. But I always felt there was a false distinction here, and something in the middle was the right default.

Some text-manipulation features that seemed vital didn't exist. Trying to convey gamestate means creating novel sentences. Expressing such sentences as dialogue would be extremely useful, though I can't even imagine how that would work. But even spellcheckers for player and author were missing.

So I created a new system from scratch. I hope it helps me become a better writer. I hope it makes intfiction that focuses on doing interesting things with interesting characters.

Is there pleasure in having an effect on people? Maybe "actions" based on how it makes the character feel rather than the actual world effect of the action? Not because it's great writing, but because we want that to be the real meat of the gameplay. So, it will happen multiple times. Gratitude, thankfulness, or, rivalship. Not actions but... with diction, dialogue.

## Install and Run

With typescript and rollup both installed globally `npm i rollup --global` and `npm i --global @rollup/plugin-json` and `npm install tslib --global` issue the commands:

`tsc && rollup --file build.js build/app/story1.js `

Pull up index.html in the browser, view F12 console.

Can also use `--watch` on both commands in 2 different windows.

## Flow

Setup desireables, actions on them, characters, and character beliefs about the dispositions of certain desireables. Call narrativeEngine with this.

`main` chooses a scene from a character and their initial action. `playStory` plays the scene, and then gets the next scene that ChoiceConsequenceClosure scheduled during the scene.

During a scene, run the character's action as a planning tree / Planner AI. Does multiple character actions in a loop.

Running a character action involves executing the action definition's rulebook: check rules to see if failed, then rules to make the changes in desireables. After the action was deemed successful, failed, or partly, create a `news` item and run through all the other characters and their beliefs to see if there are any consequences to the action. If so, ChoiceConsequenceClosure attaches a consequence object to the scene.

All desireables, attempts, and beliefs are _resources_.

# Impure functions

weCouldTry - attaches new child node to passed-in parent node... or to character.goals; doesn't return child node

createSceneSet - mutates story.sceneStack

reactionsToNews - mutates story.sceneStack

doThing - mutates attempt.status

doThingAsAScene - mutates character.goals, calls weCouldTry

moveDesireable - mutates global desireables

produceParagraphs - whole file is I/O

executeRulebook - calls moveDesireable

playScene - mutates scene.result, .isFinished; calls doThingAsAScene

## TODOs

- can fully run speculatively

- examples of using the foreshadowing feature

- can give it a parser fn that returns the Action a player wants to do -- thread it all the way through

- diff()

- need to separate the actions & reactions from the actual reporting to the user. Can't foreshadow a reaction unless the machinery runs to discover one.

## HOW TOs

Is there pleasure in having an effect on people? Maybe "actions" based on how it makes the character feel rather than the actual world effect of the action? Not because it's great writing, but because we want that to be the real meat of the gameplay. So, it will happen multiple times. Gratitude, thankfulness, or, rivalship. Not actions but... with diction, dialogue.

Dialogue generator.. ok, most people's speech isn't that special or unique. At least everyday speech.

Regarding 4 more tasks for the paragraph: NPC cooperation and gratitude is what? If it's so important...

There's pleasure in making things happen. Most CYOAs have lots of non-choice stuff that could honestly be excised with no ill effect. Even asking someone to do or help with something would be better than being passive-with-buttons.

## MRUs

1. motivating factor
1. involutary subconscious response
1. involuntary body language
1. conscious body language
1. speech

or,

1. motivating factor
1. emotional reaction
1. review what happened, reasoning out why, consider options available
1. anticipation of what follows from those options
1. choice

or, combining,

1. motivating factor
1. "feel", involuntary subconscious response
1. "flinch", involuntary body language
1. "move", conscious body language
1. "review", review what happened, reasoning out why,
1. "consider", consider options available
1. "foresee", anticipation of what follows from those options
1. "choose", choice
1. "speak", speech

### Publish

Publishing is a special build pipeline requiring Bun (an alternative to NodeJS). It outputs to `/build` a set of files ready for a web server to serve.

```bash
cd publishing
bun run publish.ts
```

### Run

Publish first. Running locally using either the Bun runner:

```bash
bun build ./app/story1.ts  --outfile story1.js --outdir build --watch
```

## without bun

no longer works.

Build and rollup in-place and point a browser to it:

```bash
tsc -p common/tsconfig.json && tsc -p src/tsconfig.json && tsc -p app/tsconfig.json
rollup --file build/build.js build/app/story1.js  --plugin json
```
