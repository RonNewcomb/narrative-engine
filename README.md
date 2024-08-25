# A Narrative Engine

Implementing ideas from https://www.gamedeveloper.com/author/ron-newcomb with help of old-school "planner" AI originally implemented for Inform 7: https://github.com/i7/extensions/blob/master/Ron%20Newcomb/Problem-Solving%20Characters.i7x

## Purpose

I tried to author an intfiction once. It didn't go well. Not because of the computerized aspect of it, I have a good handle on that, but because what I thought an intfiction was supposed to be didn't match up with what else was out there.

The writing books I've since read have taught me a lot. For example, plot is just the series of characters reacting to the actions of other characters. Foreshadowing informs readers of the importance of the seemingly trivial. Scenes package smaller stories into composable chunks. Existing tools for creating intfiction didn't connect with let alone teach any of these concepts.

Many of the existing tools for interactive fiction fall into two camps, the choose-your-own-adventure and the parser-based world simulation. CYOA intfiction I found so easy I rarely paid the reading of it close attention. Parser-based intfiction I still find difficult to actually progress through. But I always felt there was a false distinction here, and something in the middle was the right default.

Some text-manipulation features that seemed vital didn't exist. Trying to convey gamestate means creating novel sentences. Expressing such sentences as dialogue would be extremely useful, though I can't even imagine how that would work. But even spellcheckers for player and author were missing.

So I created a new system from scratch. I hope it helps me become a better writer. I hope it makes intfiction that focuses on doing interesting things with interesting characters.

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

so maybe,

1. "cause", motivating factor
1. "feel", involuntary subconscious response
1. "flinch", involuntary body language
1. "move", conscious body language
1. "exclaim", semiconscious speech?
1. "review", review what happened, reasoning out why,
1. "consider", consider options available
1. "foresee", anticipation of what follows from those options
1. "choose", choice
1. "speak", speech

## Devlog

1. had an infinite loop because the action that was supposed to solve a failing action didn't actually solve the issue. (Property `owned` vs `owner` mismatch.)

So, I need infinite loop protection and some kind of typing to make the error impossible. And a method to hunt down such problems that doesn't involve tracing the library.

1. moved most of main menu to index.html

## How to Run

With typescript and rollup both installed globally.

```
npm install --global typescript
npm install --global tslib
npm install --global rollup
npm install --global @rollup/plugin-json
npm install --global @types/node
```

Compile and bundle.

`tsc && rollup --file build.js build/app/story1.js `

Pull up index.html in the browser, view F12 console.

Can also use `--watch` on both commands in 2 different windows.

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

# System 3

## Goals

Mobile-first. Play on mobile without needing parser typing nor lawnmowering a CYOA due to multipart responses.

Emphasize always ready to publish. Smooth scale from no choice, to press any key, to a simple unused choice, to a simple used choice, to a multipart choice, to a used mulitpart choice, to... a board game. (Unusual in that after a prompt, the text continues on. A "jump" to a different passage isn't assumed. But it does remember and it can ask itself later what was chosen.)

Emphasize ease and speed of writing. Emphasize getting the writing from brain to paper. Uses mobile to aid in authoring via speech-to-text. You cannot edit on mobile, only add more words. The inability to be an editor while on mobile is a feature.

Text-first, low-code. Deemphasize code and other fiddly bits. Avoid "filling in forms" style of creation.

Features to double-check the author and highlight to-dos. Guardrails for novice writers like myself. Dissuade dungeon crawls and rambling.

Doesn't explicitly have objects, but partial responses and hashtags can be used as such.

Algorithms. Board game, planner A.I., is finishable checking, hashtag rules checking, automatic TODO highlighters, sample-based passage linking.

## How to

### First choice

There is writing, and within are points like:

```
He left. [ * Follow him * Return home * Continue with purchase ] Later that day, ...
```

This paints the prompt's menu and waits on the user. After choosing a response, the following text is painted no matter the choice. Nothing in the "code" directed control elsewhere. But, the chosen response is remembered.

### Referencing a past choice

Substitutions of the form `[did ...]` can ask which response was made at which prompt.

```
He accepted the seat.   [did continue purchase]And you bought it anyway, right?[/did]

He accepted the seat.   [didnt continue purchase]If we had gotten it it would've helped.[/didnt]
```

It searches all possible responses for the match, highlighting it if it's not enough words to distinguish.

### Conditional Responses

Wrap responses in the substitution to hide them. They can reference themselves so they can't be chosen multiple times.

```
He left.

[
    * Follow him
    * Return home
    [didnt continue purchase]
        * Continue with purchase
    [/didnt]
]

Later that day, ...
```

### Hashtags

There are hashtags written like #macguffin which are invisible to the reader. These can be used to reference a passage, prompt or response if using the text itself isn't working out.

Here is a tagged prompt.

```
He left. [#afterArgument * Follow him * Return home * Continue with purchase ] Later that day, ...
```

And here is referencing that exact prompt, and then referencing one of the responses within that prompt.

```
He accepted the seat.  [did #afterArgument continue purchase]And you bought it anyway, right?[/did]
```

### Multipart Responses

A response can have pieces. An ellipsis on a button tips off the reader that they can explore, so an ellipsis after an opening bracket is how to write it.

```
He left. [ * Follow him * Return [... * home * to the library ] * Continue with purchase ] Later that day, ...
```

### Common Multipart Responses

We can re-use a set of responses via tag to save some repetitive typing. The same choice can appear many times in many different prompts. It becomes an object in its own right.

Tag the whole prompt. The prompt can be backstage.

```
[#usualLocations * home * to the library]
```

Place the prompt within another prompt's ellipsis.

```
He left. [ * Follow him * Return [... #usualLocations ] * Continue with purchase ] Later that day, ...
```

### Changing Threads

A choice can send the reader elsewhere entirely.

```
He left. [ * Follow him [^ Pretending to stay put] * Return home * Continue with purchase ] Later that day, ...
```

```
Pretending to stay put, you wait until he's out of sight ...
```

After the ^ caret symbol comes the first words of the linked passage.

### Changing Threads, Hashtag Example

If the passage is long or commonplace a tag can be used instead.

First tag a passage.

```
#sneakAfter Pretending to stay put, you wait until he's out of sight ...
```

Reference the tag from one of the responses of this prompt.

```
He left. [ * Follow him [^#sneakAfter] * Return home * Continue with purchase ] Later that day, ...
```

### Finishing Threads

The redirect can be used unconditionally. We use this to close off a thread and return to the main thread.

```
Your purchase complete, you head home to prepare for the party.

[^ Buried in wrapping paper]
```

### Tagging Select Text

You can select some text with the mouse and stick an annotation on it. It's a hashtag, but a hashtag that knows a beginning and end, rather than being a point.

### Backstage

Most of your file will be writing with some markup. But there is an area called the backstage where some things can be declared, without being tied to a particular passage. Re-usable prompts, sanity checks, and responsive NPC behavior hold this.

(The backstage is purely declarative code.)

You can import other files from here, and specify which tags etc from the other files are in scope here.

### Checks and Balances

You can map out your work, find things, and more using tags. But you can also create, combine, and sequence tags using other tags in the special section.

```
#charlotte #maria #james are #people
```

It often comes up that in a given passage you can't remember or even know if the reader knows something yet. Use a tag to mark all the places where that something is shared with the reader, and another tag marking where that something needs to be known.

Then create a check.

```
#learnSecret #magicLamp precedes #useSecret  #magicLamp
```

You can define stretches of time with a pair of hashtags. You can use an ellipses to mean the rest of the tags in that combination.

```
#start #scene ... must precede  #end #scene ...
```

### Multiple Viewpoint Characters

The system remembers which response the reader chose for any prompt, but if your story has muliple viewpoint characters it might be important to know which character's viewpoint the reader was within when the response was made.

This might be because the reader chooses differently if they're aware of whom they're following, or it might be because a choice gets "used up" so can only be made by one character.

You can explicitly define the viewpoint characters backstage with a check.

```
#charlotte is viewpoint

#jacob are alternate viewpoints
```

Then the did/didn't is written slightly differently, using a preceding if.

```
He left.

[
    * Follow him
    * Return home
    [if #charlotte didnt continue purchase:
        * Continue with purchase
    ]
]

Later that day, ...
```

If no viewpoint is specified then it belongs to the default viewpoint, if specified. The default viewpoint is assumed to NOT be any of the alternate viewpoints.

### Responsive NPCs

One method to characterize a viewpoint character is having _them_ respond to prompts instead of the reader.

If an option contains a `chooses` with a viewpoint then the prompt doesn't appear but everything else acts as if it had and that option was chosen.

```
He left.

[
    * Follow him
    * Return home [#jacob chooses]
    * Continue with purchase
]

Later that day, ...
```

It's straightforward to hide a response or even a whole prompt with a `[did ...]` or `[is ...]` or `[if ...]`.

### Board Game Character

Let's use a board game analogy: they are at the table playing a board game with you. Each character has things they want or don't want, and actions that can affect how and where things move or what other characters do.

(How does desires, props, actions to change/move props, action-as-scene, and action scenes scheduling reaction scenes all fit into this?)

Beliefs hide behind the things they do or don't want. Beliefs are goals, even if it is to maintain the status quo. Actions are more concrete. An action can be small or can comprise an entire scene or story.

With responses and tags we don't really know what's an in-game prop, what's an action or at least a verb. We don't know what the result of any choice will be since it is, frankly, the entire rest of the story.

We will need a backstage rule to define when and what kind of prompt a character auto-responds.
