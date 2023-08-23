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

interface IntroScene {
  type: "introduction";
  actor: Character;
}
interface ActionScene {
  type: "action";
  actor: Character;
}
interface ReactionScene {
  type: "reaction";
  actor: Character;
  news: News;
}
interface ConflictScene {
  type: "conflict";
  actor: Character;
}
interface ReflectiveScene {
  type: "reflective";
  actor: Character;
  // can a ShouldBe be supported, ArgMap-like, by smaller ShouldBes,
  // so that each reflective scene knocks down a supporting ShouldBe until no support exists,
  // and a final blow to break the larger ShouldBe ?
}
// SuspenseScene -- scene with a lot of tension
// DramaticScene -- scene with strong emotion

type Scene = IntroScene | ActionScene | ReactionScene | ConflictScene | ReflectiveScene;

const scenesTodo: Scene[] = [];

function createScene(type: "introduction", actor: Character, news: News): Scene;
function createScene(type: "action", actor: Character): Scene;
function createScene(type: "reflective", actor: Character): Scene;
function createScene(type: "conflict", actor: Character): Scene;
function createScene(type: "reaction", actor: Character, news: News): Scene;
function createScene(type: Scene["type"], actor: Character, news?: News): Scene {
  const scene: Scene = type == "reaction" ? { type, news: news!, actor } : { type, actor };
  return scene;
}

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

const tracking: ChoiceConsequenceClosure[] = [];

function createSceneSet(
  choice: Choi6eWithForeshadowing,
  consequence?: ConsequenceWithForeshadowedNewsProvingAgency,
  closure?: ClosureFromInteriorReflection
): ChoiceConsequenceClosure {
  const news: News = {} as any;
  const ccc: ChoiceConsequenceClosure = {
    choice,
    consequence: consequence || { foreshadow: choice.foreshadow, scene: createScene("reaction", choice.scene.actor, news) },
    closure: closure || { scene: createScene("reflective", choice.scene.actor) },
  };
  tracking.push(ccc);
  return ccc;
}

function getSceneSet(searchFn: (ccc: ChoiceConsequenceClosure) => boolean): ChoiceConsequenceClosure[] {
  return tracking.filter(searchFn);
}
