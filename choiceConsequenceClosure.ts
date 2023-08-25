interface ForeShadowing {}

////////

/**
 * scene beginning
 * - rarely interactive
 * - sets the stage
 * - its pulse is the Action the actor is attempting
 *
 * scene middle
 * - usually highly interactive
 * - toy commands OK
 * - tends toward conflict or other searching for a way forward
 *
 * scene ending
 * - any interactivity tends to be scene-scheduling level
 * - ends with success, failure, or a complication
 * - might foreshadow later scenes
 *
 */

/////////

interface Scene {
  pulse: Attempt<Resource, Resource>;
  isFinished?: boolean;
  result?: RuleOutcome;
  actor: Character;
}
// interface ReflectiveScene extends BaseScene {
//   type: "reflective";
//   actor: Character;
//   // can a ShouldBe be supported, ArgMap-like, by smaller ShouldBes,
//   // so that each reflective scene knocks down a supporting ShouldBe until no support exists,
//   // and a final blow to break the larger ShouldBe ?
// }
// SuspenseScene -- scene with a lot of tension
// DramaticScene -- scene with strong emotion

function createScene(actor: Character, pulse: Attempt<Resource, Resource>): Scene {
  const scene: Scene = { pulse, actor };
  return scene;
}

////////////

interface Choi6eWithForeshadowing {
  choice: "ally" | "support" | "defuse" | "escalate" | "prolong" | "ignore";
  foreshadow?: ForeShadowing;
  scene: Scene;
}

interface ConsequenceWithForeshadowedNewsProvingAgency {
  foreshadow?: ForeShadowing;
  scene: Scene;
}

interface ClosureFromInteriorReflection {
  scene: Scene;
}

interface ChoiceConsequenceClosure {
  choice: Choi6eWithForeshadowing;
  consequence?: ConsequenceWithForeshadowedNewsProvingAgency;
  closure: ClosureFromInteriorReflection;
}

function createSceneSet(
  choice: Choi6eWithForeshadowing,
  consequence?: ConsequenceWithForeshadowedNewsProvingAgency,
  closure?: ClosureFromInteriorReflection
): ChoiceConsequenceClosure {
  const actor = choice.scene.actor;
  const news = choice.scene.pulse;
  const reflect = createAttempt(actor, ReflectUpon, news, undefined, news);
  const ccc: ChoiceConsequenceClosure = {
    choice,
    consequence,
    closure: closure || {
      scene: createScene(choice.scene.actor, reflect),
    },
  };
  story.sceneStack.push(ccc);
  return ccc;
}

function getNextScene(): Scene | undefined {
  const startScenes = story.sceneStack.filter(s => !s.choice.scene.isFinished);
  if (startScenes.length) return startScenes[0].choice.scene;
  const midScenes = story.sceneStack.filter(s => s.consequence && !s.consequence.scene.isFinished);
  if (midScenes.length) return midScenes[0].consequence!.scene;
  const endScenes = story.sceneStack.filter(s => !s.closure.scene.isFinished);
  if (endScenes.length) return endScenes.reverse()[0].closure.scene;
  console.log("END STORY", story.sceneStack);
  return undefined;
}

let story: {
  characters: Character[];
  actionset: ActionDefinition<any, any>[];

  sceneStack: ChoiceConsequenceClosure[];
  history: News[];
  currentTurnsNews: News[];
} = { characters: [], actionset: [], sceneStack: [], history: [], currentTurnsNews: [] };

function playStory(firstScene: Scene | undefined, characters: Character[], actionset: ActionDefinition<any, any>[]): void {
  story = { characters, actionset, sceneStack: [], history: [], currentTurnsNews: [] };

  if (firstScene) createSceneSet({ choice: "ally", scene: firstScene });

  let turn = 0;
  for (let currentScene = firstScene; currentScene; currentScene = getNextScene()) {
    produceParagraphs(characters);
    console.log("TURN", ++turn);

    // characters act // creates scene types of Action
    const news = playScene(currentScene);
    // react to news // creates scene types of Reaction
    runNewsCycle(news, currentScene);

    if (turn > 7) break;
  }
}

/** outputs: scene success/failure/complication and news of what happened */
function playScene<N, SN>(scene: Scene): News[] {
  const character = scene.actor;
  let sceneAction = whatTheyAreTryingToDoNow(character);
  console.log("BEGIN", scene.pulse.verb, "SCENE:", character.name, sceneAction ? stringifyAttempt(sceneAction) : "Nothing");
  if (!sceneAction) console.error("no action -- run AI to pick a scene-action that does/un-does the news? adjusts for it?");
  if (sceneAction) scene.result = doThing(sceneAction, character);
  scene.isFinished = true;
  return story.currentTurnsNews;
}

const ReflectUpon: AbstractActionDefinition<Attempt> = {
  verb: "reflecting upon _",
  rulebooks: {
    news: {
      rules: [attempt => console.log(attempt.actor, "reflected."), createNewsItem],
    },
  },
};

const GettingBadNews: AbstractActionDefinition<News, ShouldBe> = {
  verb: "getting bad _ news violating _ belief",
  rulebooks: {
    check: {
      rules: [
        attempt => {
          const news = attempt.noun;
          const belief = attempt.secondNoun;
          if (!news) throw "missing News for GettingBadNews";
          if (!belief) throw "missing Belief for GettingBadNews";
          console.log('"', printAttempt(news), ' is bad news."');

          function findActions(badNews: Attempt<any, any>, shouldBe: ShouldBe): ActionDefinition<any, any>[] {
            const retval: ActionDefinition<any, any>[] = [];
            for (const action of story.actionset) {
              const effects = action.rulebooks?.moveDesireables?.(badNews) || [];
              for (const e of effects)
                if (shouldBe.property == e[0] && shouldBe.ofDesireable == e[1] && shouldBe.shouldBe == e[2] && shouldBe.toValue == e[3])
                  retval.push(action);
            }
            return retval;
          }

          const actions = findActions(news, belief);
          for (const action of actions) weCouldTry<any, any>(attempt.actor, action, news.noun, news.secondNoun, attempt);

          return "failed";
        },
      ],
    },
  },
};

function runNewsCycle(newss: News[], sceneJustFinished: Scene) {
  for (const news of newss)
    for (const character of story.characters)
      for (const belief of character.beliefs)
        if (isButtonPushed(news, belief)) {
          const sceneAction = createAttempt<News, ShouldBe>(character, GettingBadNews, news, belief, undefined);
          const reactionScene = createScene(character, sceneAction);
          //scheduleScene(reactionScene);
          createSceneSet({ scene: sceneJustFinished, foreshadow: {}, choice: "ally" }, { scene: reactionScene, foreshadow: {} });
        }

  // reset news
  story.history.push(...story.currentTurnsNews);
  story.currentTurnsNews = [];
}
