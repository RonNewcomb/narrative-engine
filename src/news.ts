import { ReceivingImportantNews } from "./actions";
import { createAttempt, type Attempt } from "./attempts";
import { type ShouldBe } from "./beliefs";
import { type Character } from "./character";
import { createSceneSet, type ConsequenceWithForeshadowedNewsProvingAgency, type ForeShadowing } from "./choiceConsequenceClosure";
import { isButtonPushed } from "./iPlot";
import { createScene, type Scene } from "./scene";
import { type Story } from "./story";

export type NewsSensitivity = "suggested" | Omit<Attempt["status"], "untried">;

export interface News extends Attempt {
  level: NewsSensitivity;
  onlyKnownBy?: Character[];
}

export function createNewsItem(attempt: Attempt, story: Story): News {
  const newsItem: News = { ...attempt, level: attempt.status == "untried" ? "suggested" : attempt.status };
  story.currentTurnsNews.push(newsItem);
  //console_log("NEWS", newsItem);
  return newsItem;
}

export function reactionsToNews(news: News, scene: Scene, story: Story): ConsequenceWithForeshadowedNewsProvingAgency[] {
  const ccc = story.sceneStack.find(ccc => ccc.choice.scene == scene) || createSceneSet(story, { scene, choice: "ally" });
  const newConsequences: ConsequenceWithForeshadowedNewsProvingAgency[] = [];
  for (const character of story.characters)
    if (character != news.actor)
      if (!news.onlyKnownBy || news.onlyKnownBy.includes(character))
        for (const belief of character.beliefs)
          if (isButtonPushed(news, belief)) {
            const foreshadowThis: ForeShadowing = { character, belief, news };
            const sceneAction = createAttempt<News, ShouldBe>(character, ReceivingImportantNews, news, belief, undefined);
            const reactionScene = createScene(character, sceneAction);
            const consequence: ConsequenceWithForeshadowedNewsProvingAgency = { scene: reactionScene, foreshadow: foreshadowThis };
            newConsequences.push(consequence);
          }
  ccc.consequences.push(...newConsequences);
  return newConsequences;
}

export function resetNewsCycle(story: Story): void {
  story.history.push(...story.currentTurnsNews);
  story.currentTurnsNews = [];
}
