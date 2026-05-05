# System 3 is a Narrative Engine

System 3 implements some ideas from https://www.gamedeveloper.com/author/ron-newcomb

System 2 seemed so heavyweight even I started to be afraid to use it. It was daunting, trying to write something in all those little boxes. I couldn't just _get started_.

Plus it seemed geared toward creating a perfect boardgame where no character was special. Although I still believe in the boardgame idea, let's not go overboard.

As for fully structuring the whole work with character beliefs which become actions which become scenes which become MRU paragraphs, it might work better as a build-time tool, like writing prompts and the like, rather than something needed at runtime.

## New Goals

Mobile-first. Play on mobile without needing parser typing nor lawnmowering a CYOA due to multipart responses. Multi-part choices to construct sentences seem to be the right default.

Emphasize always ready to publish. Smoothly scale from no choices, to a simple choice, to a multipart choice, to complex questions about multipart answers.

Responses are always remembered. The author needn't do anything special. Which answer was chosen can be retrieved just by asking.

Responses aren't jumps. The writing flows linearly unless a jump-to-page-X is specifically requested.

Emphasize getting words from brain to paper. Use speech-to-text from mobile. By design, you cannot edit on mobile.

Emphasize text-first and de-emphasize code. Avoid a "filling in forms" style of creation.

Use System 2 as a build-time aid, not a runtime library. Given character beliefs, it creates plot outlines and from that it creates writing prompts for scenes, exchanges, paragraphs.

## What ideas will aid the creation of next-gen intfic?

- ease of creation
  - speech-to-text, on-the-go
  - limited code or setup
- prove agency, teach how to play, indulge player, convey gamestate
  - Foreshadowing to prove agency
  - dialogue, news, foreshadowing is the HUD to convey gamestate
- problems and solutions
  - NPC believability vs NPC playability? apply stress, foreshadowing, or alliance
  - reader control vs reader empathy? target second-order emotions
  - agency vs plot? plot is derived from one character's reactions to another character's reactions; the PC is a character
- arc types
  - mystery creates curiousity until the explanation
  - conflict creates uncertainty until the decision
  - tension creates anticipation until the fulfillment
- choice, consequence, closure
  - all responses remembered, can ask about later
  - ?virtual responses - conditions on other responses - to remember what needs closure?
  - foreshadow consequence
  - schedule closure
- relation to others' external conflict
  - ally, support, defuse, escalate, prolong, ignore
- characters are a bag of beliefs
  - belief is a _should_ statement
  - actions which violate another's belief spur them to action, given the opportunity
  - characters spurring other characters is plot
  - (beliefs are the push-buttons of plot)
  - all characters have different beliefs, setting up a kind of pachinko boardgame
  - beliefs are also expressions of what a person _can't_ do
  - a scene is a little story centering around a character, a want, and some kind of action to fulfill it.
- a scene is an action
  - action is a planning tree
  - a planning tree has could/would/should
  - planning tree with could/would/should becomes dialogue
  - ?argument map also dialogue?
- amend beliefs
  - interactive interiority is a dialogue with one's self
  - challenged by others, dialogue
  - witnessing
  - amend your own beliefs with reflective scenes
  - amending beliefs changes the options menus
- setting is a character?
  - the "rules" of the story/genre are the setting's beliefs?
  - plot devices are deux-ex-machina push-buttons of plot
  - the tin idiot (author-character) breaks deadlocks via plot devices
  - therefore... plot devices are beliefs of setting? what?
- speech acts?
  - explore, ask, get info, input
  - exclaim, express, inform, output
  - offer, negotiate, promise, pronounce, create/uncreate a binding
  - challenge, probe, accuse; test a binding
- can system 2 be an "overlay" on system 3 as a writing aid?
  - can create the outline from a few pieces
  - can test for completeness

# How to Use System 3

This is still a work in progress, so a lot of software knowledge is required to get off the ground while the featureset is still being decided.

## How to Build and Run

The parser-generator is in the `system3` folder and it's currently a multi-step build process. The following command performs these steps.

0. `npm run parse` runs the parser-generator.
1. It uses Peggy (a parser generator) to create the system-3 parser from the `parser.peggy` description file that describes the syntax this README describes.
2. The resulting parser is in file `parser.js`.

This finishes creating the system-3 compiler. We run the compiler (only) on an author's work to test the parser.

3. We run `compile.ts` (which uses `parser.js`) to distill the sample author work `system3.sample.txt` into an AST file.
4. The AST is named `story.json` and is placed in a `dist` subfolder.

To publish the work runs the compiler, asset juggler, ifiction record substitution, and creates a `dist` folder full of stuff ready to go.

6. Run `npm run publish`

Once built/published, it can be served to browsers.

7. Run `npm run serve` to serve the published work from `dist` and serve it to browsers as `./dist/index.html`.
8. The `index.html` file must both load the `interpreter.ts` file and the AST file `story.json`.
9. Once both are loaded, it feeds the latter into the former and we're off.

The `index.html` file is preferably served off of a local IP address beginning with `192.168`, which means it should be visible to other devices on the same network (i.e., your home wifi). The top-right corner menu of the running work will, if it detects this, display a QR code that other devices on the same network can scan to also play the work.

This makes it easy to author a work on a PC or laptop, but then play the work on a phone, which is the intended method of enjoyment.

10. When it's working again, the work in `index.html` is served as a PWA - a Progressive Web App. This means the reader can install it "as an app" on their phone and won't need the PC to play the work.
11. But if the author then needs to update the work, this requires re-publishing the work from the PC, and then reinstalling the PWA on the phone.

## Creating a Menu of Choices

### First choice

There is writing, and within are points like:

```
He left. * Follow him * Return home * Continue shopping **

Later that day, ...
```

This paints the prompt's menu and waits on the reader. After they choose a response, the following text is painted no matter the choice. Nothing in the "code" directed control elsewhere. But, the chosen response is remembered.

### Ending the menu

A group of possible choices is called a menu. Since a lone `*` ends the text flow and begins a menu with its first possible choice, we need a way to indicate the end of the menu where the text flow will pick up again after the reader makes a choice. We do that with `**` two astericks in a row.

## Referencing past choices

### With [did] or [didnt]

Substitutions of the form `[did ...]` can ask which response was made at which prompt.

```
He accepted the seat. [did continue shopping] And you bought
it anyway, right? [/did]
```

```
He accepted the seat. [didnt continue shopping] If we had gotten
it it would've helped. [/didnt]
```

It searches all possible responses for the match, highlighting it if it's not enough words to distinguish.

### With [if] and [unless]

Depending on how choices are written, "did" may not read very smoothly. Instead we can use `[if]`. Similarly for `[unless]` in place of `[didnt]`.

```
He accepted the seat. [if continue shopping] And you bought it
anyway, right? [/if]
```

```
He accepted the seat. [unless continue shopping] If we had gotten
it it would've helped. [/unless]
```

There's no functional difference between the synonyms. Choose whichever reads more smoothly in context.

### Which Choice

Sometimes you want not whether one choice was made, but which. For this, `[the choice]` has the text of the most recent menu.

For older choices, `[the choice near ...]` lets you mention any of the possible options in a menu. it'll retrieve the menu containing the option you gave, and return to you the text of which choice was made.

### Hidden Words with #Hashtags

Many times the same choice will appear in different parts of the story but with identical wording. In order to reference the correct one you can place hidden words within the response using hashtags. The reader cannot see these tags but when you reference reponses with `[did]` or the like, the hidden hashtags can make it unambiguous which response you intended.

Example:

```
He left. * Follow him. * Investigate. #museum **
```

The word "museum" will be hidden from the reader but will still be available for queries like `[did Investigate. #museum]` so that no other response that says "Investigate" would be referenced by mistake.

Hashtags are written without spaces, and without any other punctuation marks besides apostrophes and hyphens. If you need additional context, you can either use multiple hashtags, or just smoosh words together in one big hashtag.

## Conditional Options

You can hide and show different choices in a menu based on previous selections by wrapping the response in a reference. A choice can also reference themselves so it can't be chosen multiple times.

```
He left.
* Follow him
* Return home
[didnt Continue shopping]
* Continue shopping
[/didnt]
**

Lorem ipsum...
```

The above shows a menu with either two or three possible options. The third option appears until the reader chooses it, then it never appears again.

### Multipart Responses with [menu]

In addition to making a simple list of possible reponses like a choose-your-own-adventure book, any given response can have multiple parts. When the reader chooses one of these responses, the menu slides aside to reveal a secondary menu with the next part of that response.

How to write it is a little different. Since the \* asterisk by itself simply adds another reponse to the first menu, we need to use the `[menu]` and `[/menu]` tags within the response to group its pieces together.

Example:

```
He left.
* Follow him
* Return [menu] * home * to the library [/menu]
* Continue shopping
**

Later that day, ...
```

This makes an initial menu with three options: follow, return, and continue. If follow or continue is chosen, the story continues normally. If return is chosen, the menu slides aside to reveal a secondary menu with home and library.

While the second menu is shown, the reader can swipe right to return to the first menu. Otherwise, choosing home or library from that menu will complete the response, and the story continues.

When asking what the user chose with `[did]` or `[didnt]`, the system will check as if there was only a single menu with all the options: `[did return to the library]`, for instance. You can query if either of the "return" options was chosen with simply `[did return]` as the text in a `did` or `didnt` doesn't need to be a complete match. As long as an option contains that passage, it will match. If this references unrelated options that include the word "return" a hashtag can be used between "return" and "[menu]".

Secondary menus can have tertiary menus by also using `[menu]` and `[/menu]` similarly. Multiple responses can have secondary menus, and the secondaries are distinct from one another. You can create a rich heirarchy of multipart responses if you wish. There's no limit to how many menus deep a response can go other than good taste.

## Jumping Pages with [goto]

### Redirecting Threads

A choice can send the reader elsewhere in the work rather than just the next paragraph. This is how printed choose-your-own-adventure books usually work. "If you took the shield, turn to page 57."

Instead of page numbers, we use the first words of the passage to identify where to go.

```
Your purchase complete, you head home to prepare for the party.

[goto Buried in wrapping paper]

Sitting down for dinner,
```

Here, "Buried in wrapping paper" is the first words of the passage to jump to. Passages after the `[goto]` such as "Sitting down for dinner" aren't displayed.

Similarly, even if "Buried" is found in the middle of a larger passage, the portions before "Buried" won't display.

```
...and shooed the husbands from the room.  Buried in wrapping paper,
```

The text the reader sees will begin from "Buried". The reader will not see the dismissal of husbands.

### Turn to Page 57

Perhaps it's obvious, but when you place the [goto] within a response, the goto doesn't take effect unless the reader chooses that response.

```
He left.
* Follow him [goto Pretending to stay put]
* Return home
* Continue shopping
**

Later that day, ...

(...somewhere else in the work...)

Pretending to stay put, you wait until he's out of sight.
```

### Marking Events with [plot ...]

Now that `[goto]` makes multiple branching paths possible, a new wrinkle appears. Sometimes an important plot point can be reached through multiple alternative paths. This makes asking `[if]` tricky. In these cases, you can use `[plot]` to mark the event as having occurred, and then query it later.

```
[plot Maria found out]
```

You would put that declaration in each of those multiple paths, so now you can simply ask `[if Maria found out]` to check if the event occurred regardless of how the reader got there.

## The Author-Character

Most interactive fiction have the notion of a player-character, the character whose actions are under control of the reader. Mirrorway introduces the concept of an author-character as well, which can perform just-in-time edits to the text before being shown to the reader. Every writer knows their writing tool's ability to copy, move, and alter text in basic ways. The author-character's abilities are the same, but they are performed after the story is published and delivered to the reader.

### [cut] [copy] [paste]

You can surround pretty much anything with `[cut]` and `[/cut]`, or `[copy]` and `[/copy]`. Once done, a later `[paste]` places a copy in that location. Think of it as the reverse of a `[goto]`: instead of going to where the passage is, have the passage come to you.

But improving on the keyboard's limitations, you can name what you `[cut]` or `[copy]`. This allows you several `[paste]` clipboards that can all be used at will.

```
[cut the long inspirational speech]
Lorem ipsum...
[/cut]

... elsewhere in the text ...

"And that is why we must act now! [paste the long inspirational speech]
```

The difference between `[cut]` versus `[copy]` is if the content is cut, it's removed from its original location. If it's copied, it stays in its original location. So a `[copy]` is just a `[cut]` immediately followed by its `[paste]`.

### Find and [replace]

You can replace words with different words in a passage with [replace].

```
[replace His Her]
His choice in the matter was an illusion.
[/replace]
```

It's intended for single-word substitutions, but you can use the `[` and `]` around words to match multiple words.

```
[replace [my car] [your car]]
"Well, let's go there and check it out. Should we take my car?"
"The bus would raise less suspicion."
\* Take my car. \* Take the bus. \*\*
[/replace]
```

This can be combined with cut copy paste to create dynamic text.

[find] acts like a go-to. It finds the named passage and jumps to it, continuing the story from there. It's much like the "turn to page 57" you would read in a printed choose-your-own-adventure book.

## Combination menus with `[/menu combo]`

Normally, a secondary menu is specific to the one response. But what if you wanted to have all responses of a menu have the same secondary menu? You can do this by ending the first menu with `[/menu combo]`. When followed by another menu they will glue together.

Note that you cannot have a `**` menu as part of a combo except perhaps the final menu.

```
[menu height] * tall * short [/menu combo]
[menu color] * blue * red [/menu combo]
* boy * girl **
```

### The Combo-Paste Combo

The `[cut]` and `[paste]` features mix well with `[combo]`.

```
[cut suspects]
* Mr. Black
* Mr. Green
* Ms. Scarlet
* Mr. Mustard
**
[/cut]

[cut weapons]
* Candlestick
* Knife
* Lead Pipe
* Revolver
* Rope
* Wrench
**
[/cut]

[cut rooms]
* Kitchen
* Ballroom
* Conservatory
* Dining Room
* Billiard Room
* Library
* Lounge
* Hall
* Study
**
[/cut]

[combo]
  [paste suspects]
  [paste weapons]
  [paste rooms]
[/combo]
```

## Puzzles

How to construct puzzles in this system? Aimless exploration has its place, but to really engage the reader they need to problem solve with the characters.

Puzzles have pieces that try to fit together. Some examples of framing are:

- sorting events into a chronological order (topo-sort)
- using process of elimination on a list of possibilities
- categorizing into buckets, then heirarchy
- brainstorming on cause and effect
- the Einstein logic puzzle, mastermind, Clue

Learning facts and trivia and trying to fit them together seem like good intfic.

There may also be resource management or counterplay. Card games are a good basis for this. War, Spades, Canasta, Peaknuckle. Weapons, building a field, betting, partnership are contained in these card games.

Board games add a visual map, which may not work as well in text. For board games where players move on a fixed tracks with bonuses or problems are attached to boxes, this allows seeing a bit of the future. There's dread and hope in seeing particular squares in the sidewalk ahead.

But the idea of having several "slots" and several things to be slotted implies a matching game. Holding a puzzle piece means an antecedent, but placing into a frame means prolog tuples brought up in context... which is also an antecedent. It means a menu offering, once a choice is chosen, not only disappears from the menu's reprint, but if the item is un-slotted it should reappear.

### A Series of Actions

Imagine a traditional puzzle of intfic. Most of the solving happens in the reader's mind. This is the interesting part. Once solved, the reader then performs the actions to do so. This is not the interesting part, it's perfunctory. Some actions may fail, as described by the flavorless omniscient narrator uncovering new or forgotten information that changes the solution. Iterate.

Now make this change: put a different character's name in front of each action. Each action when performed is in that character's voice about how they are doing. This simple act of delegation changes the texture of the puzzle quite dramatically. It recasts the reader from a lone engineer to a leader of an entire team, with all of the personality and "pop" that teamwork brings.

Now make this second change: the actions aren't performed in real time. The phrasing of the actions are in future tense. Some actions may still fail even at this stage, as one character lacks a skill or ability to perform the action, or some exterior constraint that a character knows about but the reader does not or has forgotten. But the texture of the same puzzle has changed significantly.

### Authoring It

Given four characters and four actions, the reader must mix-and-match them into pairs. This means that each menu has the same secondary menu, each pair is a response, and each subsequent menu display has fewer options. This also means that in order for each character to comment on (potentially) each assigned task, a series of passages for various combinations must be written. This requires features to make this authoring task more manageable.

### Sorting That [tip]

Similarly, when trying to put events into chronological order, saying the event and then menu'ing the before/after wouldn't naturally work because you need to see the text that comes after the before/after in order to choose correctly. But, appending the entire rest of the sentence to each operative word would make the menu too long and unwieldy. Use [tip]. It acts like the \* bullet point to create the next response, but this response will not be clickable and it will look distinct.

### Categorizing

Categorizing may be a little more direct as the list of buckets probably never changes.

### Process of Elimination

Removing items from a list usually entails keeping track of _why_ each was removed. New information may surface that changes the assumptions said reasons are based on.

### Logic Puzzles

Intense logic puzzles always need a visual aid just to remember the details of the partial solution. Much like a board game this may not be appropriate at all. Trying to describe such in dialogue probably wouldn't help much.

### Topological Sort

A character running this algorithm could solve problems for the reader, or even point out issues with a given solution.

### [know] [ofcourse] [suggest] and [search] [ask]

A Prolog engine allows searching through facts and inferences, and answering simple questions about whether a suggested piece of information contradicts the established information.

[know] adds a piece of information to the established.
[ofcourse] is a common-sense piece of inference to create new knowledge from old. If Ruth is Harry's mom, and Ruth is Sally's daughter, then [ofcourse] Sally is Harry's grandmother.
[suggest] is a way to propose a piece of information that may or may not be true. It is a working assumption to support a chain of cause.

`[cause ...]` is a way to propose a cause for a given effect. It is a working assumption to support a chain of causes.

`[fact]` creates a prolog fact. `[rule]` creates a prolog rule. These hew close to Prolog.

```
[fact man dr_black]
[fact man reverend_green]
[fact woman mrs_peacock]
[fact woman madame_rose]

// "category" is the relation "is in"
[category man dr_black]
[category man reverend_green]
[category woman mrs_peacock]
[category woman madame_rose]

[fact stay_in dr_black room_22]
[fact stay_in reverend_green room_24]
[fact stay_in mrs_peacock room_23]
[fact stay_in madame_rose room_21]

[relation stay_in dr_black room_22]
[relation stay_in reverend_green room_24]
[relation stay_in mrs_peacock room_23]
[relation stay_in madame_rose room_21]

// X in suspect iff X in man and X not-in victim
[rule [suspect X]  [man X] [not [victim X]] ]
[rule [suspect X] :- woman(X), not(victim(X))]
[rule [has_alibi(X)] :- suspect(X), playing_cards(X)]
[rule [went_outside(X)] :- gardening(X)]
[rule [went_outside(X)] :- smoker(X)]
[rule [went_outside(X)] :- played_golf(X)]
[rule [share_room(X,Y)] :- room(R), stay_in(X,R), stay_in(Y,R), different(X,Y)]
[rule [revolver_access(X)] :- owns_revolver(X)]
[rule [revolver_access(X)] :- share_room(X,Y), owns_revolver(Y)]
[rule [guilty(X)] :- suspect(X), went_outside(X), not(has_alibi(X)), revolver_access(X)]
```

## Discarded Features

### Rewriting the chosen response

When the reader chooses a response, we could allow the author to rewrite it on the fly. Sure, once the response is entered into the text the author could improve the flow a bit. The problem with this feature is in trying to prevent the author from rewriting the choice to something quite different. Although this could serve a narrative purpose with a reluctant player-character, please consider the effect the rewrite has on the reader. The reader, after reading all options and choosing one, would then be forced to re-read their choice to ensure it actually happened and scan for critical new information. This gets tiresome after awhile and it only takes one or two such instances to tip off the reader that this is something that needs constant attention, because the reader doesn't know when it may happen again.

As for why responses are and remain highlighted in the text after a choice was made, there's a small bookmarking aspect. After responding, the reader needs to start reading the text again from somewhere. If there was no indication of where that is, it can become tiresome to find where they left off each time. So the response appears directly in the text, bolded, to indicate to the reader where they left off. Since the response text is exactly what was displayed in the menu, the reader knows they can always begin reading directly after the bolded text.

Furthermore, if the reader ever wants to scroll back to see what they chose earlier or to double-check some information before responding, each bolded response serves as a landmark that catches the eye during rapid scrolling, aiding the reader in orientating themself as they skim the previous text.

### Counting anything

It's trivial for a computer to count things including the number of times a reader read a passage or made a particular choice. It's also trivial for an author to gate a story based on a statistic or a particular action being done a number of times. But repetition is generally not the kind of experience a reader is looking for in a story. Although gameplay loops are usually about "number go up" or a skill in timing, fiction is generally about interiority and the progression of feelings, so its interactive variant should probably lean toward exploration and discovery via dialogue both external and internal.

Dialogue, too, can be a game of fencing. A movie actress can use timing and delivery to convey meaning beyond the spoken words but in written media interiority is a necessary and more direct method. One person explores another like charting unknown lands, but the directions on their compass are why, what then, what next, what if, and, the guiding star, how do you feel.

## Considered Features

- Marking Durations of Time with [scene]
- Marking Durations for things that became true and then become false again later
- Antecedents with [the ...]
- [remember ... as ...]
- create new checkables with [infer] and [and] [or] [before] [after]
- named menus create antecedents and allow reuse
- _Plot Outline_ is both guardrails and writing prompts, to-dos, and navigation aids.
- _World Model_ is a distillation of past actions to the current state of the world. But any question that the current state can answer, the complete ordered list of responses can also answer. (This might however require NPCs that "choose responses" to also be recorded if there's conflicting actions.)
- Characters as pieces on a board game. Comes with a Prolog-like algorithm to solve for winning solutions. Allows NPCs to compensate for the PC's actions.

### Editing environment's sanity checks

1. A response-check but it can't find the response.
2. A response-check but it finds more than one response.
3. A go-to that it can't find the passage.
4. A go-to but it finds too many passages that fit.
5. An optional warning that a response isn't used at all.
