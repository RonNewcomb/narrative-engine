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

### In the [know]: [categories] [orderings] [relations] [implications]

A Prolog engine allows searching through facts and inferences, and answering simple questions about whether a suggested piece of information contradicts the established information.

[know] [/know] add information to the engine.
[suggest] is a way to propose a piece of information that may or may not be true. It is a working assumption to support a chain of cause.

`[categories]` defines various categories of things, but not what things are in each category. Each word in here becomes a new clause.
`[orderings]` defines what categories are time-sequenced or otherwise in-a-row. Each word in here becomes a new clause.
`[relations]` defines links between two or more categories. Each word in here becomes a new clause.
`[implications]` creates new categories in terms of base categories.

```
[categories men women suspects victims smokers gardeners golfers rooms gun-owners went-outside ]
[men dr_black green]
[women rose peacock]
[suspects ] if ...
[victims deed]
[smokers black]
[gardeners peacock]
[golfers green]
[rooms r21 r22 r23 r24]
[gun-owners green black]

[orderings events houses-in-a-row]
[events card-game murder retire] // but in order!

[relations stays-in ]
[stays_in dr_black room_22]
[stays_in reverend_green room_24]
[stays_in mrs_peacock room_23]
[stays_in madame_rose room_21]

[implications]
[gun-access if [or gun-owners share_room] [revolver_access]]
[suspects are [or man woman] [not victims]]

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
