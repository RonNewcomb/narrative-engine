# System 3 - a Narrative Engine

System 3 implements some ideas from https://www.gamedeveloper.com/author/ron-newcomb

System 2 seemed so heavyweight even I started to be afraid to use it. Plus it seemed geared toward creating a perfect boardgame where no character was special.

Trying to write something in all those little boxes seems daunting.

## New Goals

Mobile-first. Play on mobile without needing parser typing nor lawnmowering a CYOA due to multipart responses.

Emphasize always ready to publish. Smooth scale from no choice, to press any key, to a simple unused choice, to a simple used choice, to a multipart choice, to a used mulitpart choice, to... a board game.

Don't assume every response jumps somewhere else in the text. Instead, it flows linearly until a jump is requested. But, always and automatically remember every choice made and can answer what was chosen at any time.

Emphasize ease and speed of writing. Emphasize getting the writing from brain to paper. Uses mobile to aid in authoring via speech-to-text. You cannot edit on mobile, only add more words. The inability to edit while on mobile is a feature.

Text-first, low-code. Deemphasize code and other fiddly bits. Avoid "filling in forms" style of creation.

What advanced features would aid in next-generation intfic?

- prove agency, teach how to play, indulge player, convey gamestate
- Foreshadowing to prove agency
- dialogue, news, foreshadowing is the HUD to convey gamestate
- choice, consequence, closure
- scene is an action, action is a planning tree, planning tree has could/would/should
- planning tree with could/would/should becomes dialogue
- ?argument map also dialogue?
- characters are a bag of beliefs
- belief is a _should_ statement
- actions which break other's belief spur others to action
- (beliefs are the push-buttons of plot)
- interactive interiority is a dialogue with one's self; may amend beliefs
- plot devices are deux-ex-machina push-buttons of plot
- the "rules" of the story/genre are the setting's beliefs
- tension: control vs empathy. target 2nd-order emotions
- tension: believability vs playability. apply stress, foreshadowing, or alliance
- tension: agency vs plot. A boardgame setup?
- ally, support, defuse, escalate, prolong, ignore
- tin idiot (author-character) breaks deadlocks via plot devices

#### Advanced Maybes

A feature to check for :

1. A response-check but it can't find the response.
2. A response-check but it finds more than one response.
3. A go-to that it can't find the passage.
4. A go-to but it finds too many passages that fit.
5. An optional warning that a response isn't used at all.

A feature to turn one response-check into a different one, or a response-check that is calculated from other response-checks. For example, if we took the pineapple from scene 2 and/or left the cigarette on the table, then a new checkable "response" is "Maria knows." Now we can check the virtual response "Maria knows" as shorthand for the others.

Any features to double-check the author and highlight to-dos. Guardrails for novice writers. Dissuade dungeon crawls and rambling. It doesn't explicitly have objects, but partial responses and hashtags can be used as such. Algorithms? Board game, planner A.I., is finishable checking, hashtag rules checking, automatic TODO highlighters, sample-based passage linking.

#### Ideas Worth Considering

Plot derives from character.

1. A character is a bag of beliefs, where a belief is a _should_ statement.
2. Violating a belief spurs the character to action, given the opportunity.
3. Characters spurring other characters is plot.
4. Therefore, a belief is a push-button for plot.

A scene is a little story centering around a character, a want, and some kind of action to fulfill it.

## How to Use System 3

### First choice

There is writing, and within are points like:

> He left. \* Follow him \* Return home \* Continue with purchase \*\* Later that day, ...

This paints the prompt's menu and waits on the user. After choosing a response, the following text is painted no matter the choice. Nothing in the "code" directed control elsewhere. But, the chosen response is remembered.

### Referencing a past choice

Substitutions of the form `[did ...]` can ask which response was made at which prompt.

> He accepted the seat. [did continue purchase] And you bought it anyway, right? [/did]
>
> He accepted the seat. [didnt continue purchase] If we had gotten it it would've helped. [/didnt]

It searches all possible responses for the match, highlighting it if it's not enough words to distinguish.

### Conditional Responses

Wrap responses in the substitution to hide them. They can reference themselves so they can't be chosen multiple times.

```
He left.

* Follow him
* Return home
[didnt continue with purchase]
    * Continue with purchase
[/didnt]

Later that day, lorem ipsum
```

### Multipart Responses

A responses menu can have sub-menus. An ellipsis on a button tips off the reader that they can explore, so an ellipsis after an opening bracket is how to write it.

> He left. \* Follow him \* Return ...[ \* home \* to the library ] \* Continue with purchase \*\* Later that day, ...

### Changing Threads

A choice can send the reader elsewhere entirely.

> He left. \* Follow him [^ Pretending to stay put] \* Return home \* Continue with purchase \*\* Later that day, ...
>
> ...lorem ipsum...
>
> Pretending to stay put, you wait until he's out of sight ...

After the ^ caret symbol comes the first words of the linked passage.

### Finishing Threads

The redirect can be used unconditionally. We use this to close off a thread and return to the main thread.

> Your purchase complete, you head home to prepare for the party.
>
> [^ Buried in wrapping paper]

## Hashtags

### Hashtags are names for passages and menus

There are hashtags written like #macguffin which are invisible to the reader. These can be used to reference a passage, prompt or response if using the text itself isn't working out.

Here is a tagged prompt.

> He left. #afterArgument \* Follow him \* Return home \* Continue with purchase \*\* Later that day, ...

And here is referencing that exact prompt, and then referencing one of the responses within that prompt.

> He accepted the seat. [did #afterArgument continue purchase] And you bought it anyway, right? [/did]

### Common Multipart Responses

We can re-use a set of responses via tag to save some repetitive typing. The same choice can appear many times in many different prompts. It becomes an object in its own right.

Tag the whole prompt. The prompt can be backstage.

> [#usualLocations \* home \* to the library]

Place the prompt within another prompt's ellipsis.

> He left. [ \* Follow him \* Return [... #usualLocations ] \* Continue with purchase ] Later that day, ...

### Changing Threads, Hashtag Example

If the passage is long or commonplace a tag can be used instead.

First tag a passage.

> #sneakAfter Pretending to stay put, you wait until he's out of sight ...

Reference the tag from one of the responses of this prompt.

> He left. \* Follow him [^#sneakAfter] \* Return home \* Continue with purchase \*\* Later that day,

### Tagging Select Text

You can select some text with the mouse and stick an annotation on it. It's a hashtag, but a hashtag that knows a beginning and end, rather than being a point.

## The Code Area

Most of your file will be writing with some markup. But there is an area without text where you can define rules, import other files, and re-usable bits and bobs.

You can import other files from here, and specify which tags etc from the other files are in scope here.

### Checks and Balances

You can map out your work, find things, and more using tags. But you can also create, combine, and sequence tags using other tags in the special section.

> #charlotte #maria #james are #people

It often comes up that in a given passage you can't remember or even know if the reader knows something yet. Use a tag to mark all the places where that something is shared with the reader, and another tag marking where that something needs to be known.

Then create a check.

> #learnSecret #magicLamp precedes #useSecret #magicLamp

You can define stretches of time with a pair of hashtags. You can use an ellipses to mean the rest of the tags in that combination.

> #start #scene ... must precede #end #scene ...

### Multiple Viewpoint Characters

The system remembers which response the reader chose for any prompt, but if your story has muliple viewpoint characters it might be important to know which character's viewpoint the reader was within when the response was made.

This might be because the reader chooses differently if they're aware of whom they're following, or it might be because a choice gets "used up" so can only be made by one character.

You can explicitly define the viewpoint characters backstage with a check.

> #charlotte is viewpoint
>
> #jacob are alternate viewpoints

Then the did/didn't is written slightly differently, using a preceding if.

```
He left.

* Follow him
* Return home
[if #charlotte didnt continue purchase:
* Continue with purchase
]

Later that day, lorem ipsum
```

If no viewpoint is specified then it belongs to the default viewpoint, if specified. The default viewpoint is assumed to NOT be any of the alternate viewpoints.

### Responsive NPCs

One method to characterize a viewpoint character is having _them_ respond to prompts instead of the reader.

If an option contains a `chooses` with a viewpoint then the prompt doesn't appear but everything else acts as if it had and that option was chosen.

```
He left.

* Follow him
* Return home [#jacob chooses]
* Continue with purchase

Later that day, lorem ipsum
```

It's straightforward to hide a response or even a whole prompt with a `[did ...]` or `[is ...]` or `[if ...]`.

### Board Game Character

Let's use a board game analogy: they are at the table playing a board game with you. Each character has things they want or don't want, and actions that can affect how and where things move or what other characters do.

(How does desires, props, actions to change/move props, action-as-scene, and action scenes scheduling reaction scenes all fit into this?)

Beliefs hide behind the things they do or don't want. Beliefs are goals, even if it is to maintain the status quo. Actions are more concrete. An action can be small or can comprise an entire scene or story.

With responses and tags we don't really know what's an in-game prop, what's an action or at least a verb. We don't know what the result of any choice will be since it is, frankly, the entire rest of the story.

We will need a backstage rule to define when and what kind of prompt a character auto-responds.
