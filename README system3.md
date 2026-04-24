# System 3 - a Narrative Engine

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

#### What advanced features would aid in next-generation intfic?

- ease of creation
  - speech-to-text, on-the-go
  - limited code or setup
- prove agency, teach how to play, indulge player, convey gamestate
  - Foreshadowing to prove agency
  - dialogue, news, foreshadowing is the HUD to convey gamestate
- choice, consequence, closure
  - all responses remembered, can ask about later
  - ?virtual responses - conditions on other responses - to remember what needs closure?
  - schedule closure
- characters are a bag of beliefs
  - belief is a _should_ statement
  - actions which break other's belief spur others to action
  - (beliefs are the push-buttons of plot)
  - all characters have different beliefs, setting up a kind of pachinko boardgame
  - beliefs are also expressions of what a person _can't_ do
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
- setting is a character
  - the "rules" of the story/genre are the setting's beliefs?
  - plot devices are deux-ex-machina push-buttons of plot
  - the tin idiot (author-character) breaks deadlocks via plot devices
  - therefore... plot devices are beliefs of setting? what?
- problems
  - control vs empathy? target second-order emotions
  - believability vs playability? apply stress, foreshadowing, or alliance
  - agency vs plot? A boardgame setup
- relation to others' external conflict
  - ally, support, defuse, escalate, prolong, ignore
- arc types
  - mystery creates curiousity until the explanation
  - conflict creates uncertainty until the decision
  - tension creates anticipation until the fulfillment
- speech acts
  - explore, ask, get info, input
  - exclaim, express, inform, output
  - offer, negotiate, promise, pronounce, create/uncreate a binding
  - challenge, probe, accuse; test a binding
- can system 2 be an "overlay" on system 3 as a writing aid?
  - can create the outline from a few pieces
  - can test for completeness

#### Advanced Maybes

**Build-time checks**

1. A response-check but it can't find the response.
2. A response-check but it finds more than one response.
3. A go-to that it can't find the passage.
4. A go-to but it finds too many passages that fit.
5. An optional warning that a response isn't used at all.

**Inferences**: A feature to turn one response-check into a different one, or a response-check that is calculated from other response-checks. For example, if we took the pineapple from scene 2 and/or left the cigarette on the table, then a new checkable "response" is "Maria knows." Now we can check the virtual response "Maria knows" as shorthand for the others.

> [`infer` Maria knows `from` took the pineapple from scene 2 `or` left the cigarette on the table]

**Plot Outline** is both guardrails and writing prompts (to-dos) and navigation aid.

**World Model**: A distillation of past actions to the current state of the world. But any question that the current state can answer, the complete ordered list of responses can also answer. (This might however require NPCs that "choose responses" to also be recorded if there's conflicting actions.)

**Pieces** of a board game. Comes with an algorithm to solve for. (Prolog?)

#### Ideas Worth Considering

Plot derives from character.

1. A character is a bag of beliefs, where a belief is a _should_ statement.
2. Violating a belief spurs the character to action, given the opportunity.
3. Characters spurring other characters is plot.
4. Therefore, a belief is a push-button for plot.

A scene is a little story centering around a character, a want, and some kind of action to fulfill it.

# How to Use System 3

The parser-generator is in the `s3p` folder and it's currently a multi-step build process. The following command performs these steps.

0. `npm run parse3` runs the parser-generator.
1. It uses Peggy (a parser generator) to create the system-3 parser from the `parser.peggy` description file that describes the syntax this README describes.
2. The resulting parser is in file `parser.js`.
3. We then run `compile.ts` to combine the sample author work `system3.sample.txt` with the `parser.js`.
4. The above results in an AST of the author's work in `system3.sample.txt.json`, which is placed in the `/system3` folder.
5. To run said json story in the browser:
6. Run `npm run system3` and serve `./system3/index.html` to browsers.

## Creating a Menu of Choices

### First choice

There is writing, and within are points like:

> He left. \* Follow him \* Return home \* Continue with purchase \*\* Later that day, ...

This paints the prompt's menu and waits on the user. After choosing a response, the following text is painted no matter the choice. Nothing in the "code" directed control elsewhere. But, the chosen response is remembered.

### Ending the menu

A group of possible choices is called a menu. Since a lone \* ends the text flow and begins a menu with its first possible choice, we need a way to indicate the end of the menu where the text flow will pick up again after the reader makes a choice. We do that with \*\* two astericks in a row.

## Referencing past choices

### With [did] or [didnt]

Substitutions of the form `[did ...]` can ask which response was made at which prompt.

> He accepted the seat. [did continue purchase] And you bought it anyway, right? [/did]
>
> He accepted the seat. [didnt continue purchase] If we had gotten it it would've helped. [/didnt]

It searches all possible responses for the match, highlighting it if it's not enough words to distinguish.

### With [if] and [unless]

Depending on how choices are written, "did" may not read very smoothly. Instead we can use `[if]`. Similarly for `[unless]` in place of `[didnt]`.

> He accepted the seat. [if continue purchase] And you bought it anyway, right? [/if]
>
> He accepted the seat. [unless continue purchase] If we had gotten it it would've helped. [/unless]

## Combine Them for Conditional Choices

Wrap responses in the substitution to hide them. They can reference themselves so they can't be chosen multiple times.

> He left.
>
> \* Follow him
>
> \* Return home
>
> [didnt continue with purchase]
>
> \* Continue with purchase
>
> [/didnt]
>
> \*\*
>
> Later that day, lorem ipsum

The above shows a menu with either two or three possible options. The third option appears until it has been chosen, then it never appears again.

### Multipart Responses with [menu]

In addition to making a simple list of possible reponses like a choose-your-own-adventure book, any given response can have multiple parts. When the reader chooses one of these responses, the menu slides aside to reveal a secondary menu with the next part of that response.

How to write it is a little different. Since the \* asterisk by itself simply adds another reponse to the first menu, we need to use the `[menu]` and `[/menu]` tags within the response to group its pieces together.

Example:

> He left. \* Follow him \* Return [menu] \* home \* to the library [/menu] \* Continue with purchase \*\* Later that day, ...

This makes an initial menu with three options, follow, continue, and return. If return is chosen, the menu slides aside to reveal a secondary menu with home and library.

While the second menu is shown, the reader can swipe right to return to the first menu. Otherwise, choosing home or library from that menu will complete the response, and the story continues.

When asking what the user chose with `[did]` or `[didnt]`, the system will check as if there was only a single menu with all the options: `[did return to the library]`, for instance. You can query if either of the "return" options was chosen with simply `[did return]` as the text in a `did` or `didnt` doesn't need to be a complete match. As long as an option contains that text it will match.

## Jumping Pages with [goto]

### Changing Threads

A choice can send the reader elsewhere entirely.

> He left. \* Follow him [goto Pretending to stay put] \* Return home \* Continue with purchase \*\* Later that day, ...
>
> ...lorem ipsum...
>
> Pretending to stay put, you wait until he's out of sight ...

After the `goto` comes the first words of the linked passage.

### Finishing Threads

The redirect can be used unconditionally. We use this to close off a thread and return to the main thread.

> Your purchase complete, you head home to prepare for the party.
>
> [goto Buried in wrapping paper]

## Marking Events and Time

### Marking Events with [event ...]

Sometimes an important plot point can be reached through multiple paths. In these cases, you can use `[event]` to mark the event as having occurred, and then query it later.

> [event Maria found out]

You would put that declaration in each of those multiple paths, so now you can simply ask `[did Maria found out]` to check if the event occurred.

### Marking Durations of Time with [scene]

Much like a director yells ACTION or CUT, use this to indicate an explicit change in scene. Usually this means an abrupt change in time or place, or even viewpoint.

> [scene]

You can name the scene, for later use with `[goto]` or `[did]`.

> [scene The Candy Shop]

> [goto The Candy Shop]

> [did The Candy Shop] \* offer some chocolate [/did]

## Remember and Recall with [the]

As the story progresses, you may find yourself needing to use more prose generation to handle all the possible situations that can come up. We use antecedents to do this.

> [`remember` Charlotte `as` the person who got the truck]

> "But [`the` person who got the truck] couldn't have since she was getting the truck that day."

# Every Person is a Tower

There's 4 speech acts, including "input" (requests for information) and "output" (answers and exclamations). We ignore some of Searle's speech acts because, like ritualistic acts, they're aren't interesting in an interactive context and are largely just glue.

So for every "input", question, there's an answer.

Answers can have locks on them. You need so much trust to ask the question and not get a rude stop, a deflection, or an evasion.

Questions can have locks on them too. Beliefs are walls that limit the ability to say certain things. Break the belief to unlock new menu options. Questions are more likely to have locks than answers, since unlocking beliefs to be a better person is the goal.

Each person is a tower, with some doors open, some closed, and some locked. Beliefs are the walls. The keys are trust and might not even exist within the tower. Even if you want to invite someone in, if they see something they're unprepared for, they'll not only leave but lock you out of their own tower.

Dialogue is exploring each other's towers. Don't do one-sided interviews. To build trust you have to give a little of yourself to get some of another.

Dialogue is trying to understand someone else, or at least some part of someone else. You may know she doesn't like turtles, but you may need to get a story to see the full cause and effect of how a person gets from here to there. Slotting together all the "facts" in an unbroken chain of cause and effect is required for understanding. (Whether you like or agree with the full picture is another question entirely.)

Finding some pieces of a chain can be done solo, with interactive interiority. It's a dialogue with one's self.

A (character's little) story (which is "output") is a path, up and down, of a navigation of a why/how tree. The listener can navigate the story with a few metacommands.

- continue, what happened next
- backup, wait explain what led up to that / how did that come about
- drilldown, tell me more about that point
- introspect, think about it, dialogue with self. This might return to the same options or cause the character to break the story and defend their beliefs.
- change subject ("output")
- share, a similar situation. This can flip who the storyteller is and who the listener is.

The continue and explain move linearly along the character's story's path, while drilldown pauses there and fills in a bit more.

Understanding a person is understanding their path through a why/how tree? Well, in many stories things just happen, so it's not really a problem-solving situation. Or is it?

Outside of listening to a story.... Remarking on something. Express opinions. Drilldown into why that opinion.

If a character has a lot of stories, place them in the editor in another file, with markup to show what starts/ends where and goto's and the other mechanical bits. These stories maybe aren't tailored much to the particular listener?

These characters aren't special, and also live in a lower-middle class neighborhood with sidewalks so cracked that they're becoming gravel. Some of the struggles and negative emotions in this world have wormed their way into their personalities. This game is about recognizing and somewhat undoing the damage, wherein two people make each other better people, and create something more than themselves.

This game is about those negative experiences, the causes of such, the exhuming of feelings, and the breakdown of unhelpful beliefs that limit their potential. About how stories and experiences crystallize into belief.

Change a belief through witness, through another demonstrating contradiction, through self-reflection.

Mechanic: quoting earlier sections during reflection. Quoting earlier reponse menus, to show new or old options. This implies the response menus are at least a little bit in-world, as a person can reflect on their choices. If I show a new option added to an old menu, it is a good way to show exploration matters.

If a breaking belief unlocks a new option, then, is there a cause-and-effect chain leading to it? If I believe X then Y can't possibly be, so what use is action Z. Therefore Z is never a response. Until dialogue turns that way to highlight the pieces. Even if the character changes the subject at that point in time, reflection is coming.

The characters pass through a series of increasingly private settings. The bus stop is first, then chatting on the bus, then the neighborhood park, then the movie theater, finally in someone's home. The movie is great because the movie can just say hints that the reader needs to hear to finish the game. But the initial bus stop conversation is the most important. Taken from real life, how would a young man talk to a young woman, a stranger, in that scenario, without the threat of the interaction going sour, or possibly worse, going nowhere at all? So the categories of responses after the initial information exchange, and the subcategories of how to go about it, are taken from real life advice. It is by far the widest choicepoint in the entire game, even though a good deal of its unused threads comes up in later conversations as grist.

Some thought was given to how rude the characters are allowed to be to each other, and how they each deal with said rudeness. We don't want the story to fly apart, but we also don't want it to be unbelievable. The recurring captive setting of the bus helps smooth over some spots -- literally no one can walk away. But the rudeness comes from sore spots in their psyches that are exactly target for the story's magic. We need to show the disease so the cure can be appreciated.
