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

interface BaseScene {
  type: string;
  isFinished?: boolean;
  result?: RuleOutcome;
}

interface IntroScene extends BaseScene {
  type: "introduction";
  actor: Character;
}
interface ActionScene extends BaseScene {
  type: "action";
  actor: Character;
}
interface ReactionScene extends BaseScene {
  type: "reaction";
  actor: Character;
  news: News;
  belief: ShouldBe;
}
interface ConflictScene extends BaseScene {
  type: "conflict";
  actor: Character;
}
interface ReflectiveScene extends BaseScene {
  type: "reflective";
  actor: Character;
  // can a ShouldBe be supported, ArgMap-like, by smaller ShouldBes,
  // so that each reflective scene knocks down a supporting ShouldBe until no support exists,
  // and a final blow to break the larger ShouldBe ?
}
// SuspenseScene -- scene with a lot of tension
// DramaticScene -- scene with strong emotion

type Scene = IntroScene | ActionScene | ReactionScene | ConflictScene | ReflectiveScene;

function createScene(type: "introduction", actor: Character, news: News): Scene;
function createScene(type: "action", actor: Character): Scene;
function createScene(type: "reflective", actor: Character): Scene;
function createScene(type: "conflict", actor: Character): Scene;
function createScene(type: "reaction", actor: Character, news: News, belief: ShouldBe): Scene;
function createScene(type: Scene["type"], actor: Character, news?: News, belief?: ShouldBe): Scene {
  const scene: Scene = type == "reaction" ? { type, news: news!, belief: belief!, actor } : { type, actor };
  return scene;
}

///////////

const scenesTodo: Scene[] = [];

function scheduleScene(scene: Scene): void {
  const character: Character = scene.actor;
  console.log("SCHEDULED", scene.type, "SCENE for", character.name, "about", scene.type == "reaction" && stringifyAction(scene.news));
  scenesTodo.push(scene);
}

////////////

interface Choi6eWithForeshadowing {
  choice: "ally" | "support" | "defuse" | "escalate" | "prolong" | "ignore";
  foreshadow: ForeShadowing;
  scene: Scene;
}

interface ConsequenceWithForeshadowedNewsProvingAgency {
  foreshadow: ForeShadowing;
  scene: Scene;
}

interface ClosureFromInteriorReflection {
  scene: Scene;
}

interface ChoiceConsequenceClosure {
  choice: Choi6eWithForeshadowing;
  consequence: ConsequenceWithForeshadowedNewsProvingAgency;
  closure: ClosureFromInteriorReflection;
}

const sceneStack: ChoiceConsequenceClosure[] = [];

function createSceneSet(
  choice: Choi6eWithForeshadowing,
  consequence?: ConsequenceWithForeshadowedNewsProvingAgency,
  closure?: ClosureFromInteriorReflection
): ChoiceConsequenceClosure {
  const news: News = {} as any;
  const belief: ShouldBe = {} as any;
  const ccc: ChoiceConsequenceClosure = {
    choice,
    consequence: consequence || { foreshadow: choice.foreshadow, scene: createScene("reaction", choice.scene.actor, news, belief) },
    closure: closure || { scene: createScene("reflective", choice.scene.actor) },
  };
  sceneStack.push(ccc);
  return ccc;
}

function getNextScene(): Scene | null {
  const startScenes = sceneStack.filter(s => !s.choice.scene.isFinished);
  if (startScenes.length) return startScenes[0].choice.scene;
  const midScenes = sceneStack.filter(s => !s.consequence.scene.isFinished);
  if (midScenes.length) return midScenes[0].consequence.scene;
  const endScenes = sceneStack.filter(s => !s.closure.scene.isFinished);
  if (endScenes.length) return endScenes.reverse()[0].closure.scene;
  return null;
}

function playStory(firstScene: Scene, characters: Character[]): void {
  let turn = 0;
  for (let currentScene: Scene | null = firstScene; currentScene != null; currentScene = getNextScene()) {
    produceParagraphs(characters);
    console.log("TURN", ++turn);

    // characters act // creates scene types of Action
    const news = playScene(currentScene);
    // react to news // creates scene types of Reaction
    runNewsCycle(news, currentScene, characters);

    if (turn > 5) break;
  }
}

/** outputs: scene success/failure/complication and news of what happened */
function playScene(scene: Scene): News[] {
  const character = scene.actor;
  let sceneAction = whatTheyAreTryingToDoNow(character);
  console.log("BEGIN", scene.type, "SCENE:", character.name, sceneAction ? stringifyAttempt(sceneAction) : "Nothing");
  if (!sceneAction && scene.type == "reaction") sceneAction = realizingIssue(character, scene);
  if (!sceneAction) throw "no action -- run AI to pick a scene-action that does/un-does the news? adjusts for it?";
  scene.result = doThing(sceneAction, character);
  scene.isFinished = true;
  return currentTurnsNews;
}

const RealizingProblem: ActionDefinition = {
  verb: "realizing",
  rulebooks: {
    check: {
      rules: [
        attempt => {
          console.log("Oh i need a ", attempt.noun?.name || attempt.noun);

          // const actions = findCounterActions(actionset, scene.news, scene.belief);
          // for (const action of actions) weCouldTry(attempt.actor, action, attempt.noun, attempt.secondNoun, attempt);
          return makeNoDecision;
        },
      ],
    },
  },
};

function findCounterActions(actionset: ActionDefinition[], attempt: Attempt, shouldBe: ShouldBe): ActionDefinition[] {
  const retval: ActionDefinition[] = [];
  for (const action of actionset) {
    const effects = action.rulebooks?.moveDesireables?.(attempt) || [];
    for (const e of effects)
      if (shouldBe.property == e[0] && shouldBe.ofDesireable == e[1] && shouldBe.shouldBe == e[2] && shouldBe.toValue == e[3])
        retval.push(action);
  }
  return retval;
}

function realizingIssue(character: Character, scene: ReactionScene): Attempt {
  const news = scene.news;
  const goal = createMyGoal(RealizingProblem, news.noun, news.secondNoun);
  goal.actor = character;
  character.goals.push(goal);
  const actions = findCounterActions(actionset, scene.news, scene.belief);
  for (const action of actions) weCouldTry(character, action, news.noun, news.secondNoun, goal);
  return goal;
}

function runNewsCycle(newss: News[], sceneJustFinished: Scene, characters: Character[]) {
  for (let news of newss)
    for (let character of characters)
      for (let belief of character.beliefs)
        if (isButtonPushed(news, belief)) {
          const reactionScene = createScene("reaction", character, news, belief) as ReactionScene;

          // move this somewhere
          realizingIssue(character, reactionScene);

          //scheduleScene(reactionScene);
          createSceneSet({ scene: sceneJustFinished, foreshadow: {}, choice: "ally" }, { scene: reactionScene, foreshadow: {} });
        }

  // reset news
  oldNews.push(...currentTurnsNews);
  currentTurnsNews = [];
}
