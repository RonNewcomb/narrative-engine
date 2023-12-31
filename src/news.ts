import { ReceivingImportantNews } from "./actions";
import { createAttempt, type Attempt } from "./attempts";
import { type ShouldBe } from "./beliefs";
import { type Character } from "./characters";
import { createSceneSet, isButtonPushed, type ConsequenceWithForeshadowedNewsProvingAgency, type ForeShadowing } from "./consequences";
import { stringify } from "./paragraphs";
import { createScene, type Scene } from "./scenes";
import { type Story } from "./story";

export type NewsSensitivity = "suggested" | Omit<Attempt["status"], "untried">;

export interface News extends Attempt {
  level: NewsSensitivity;
  onlyKnownBy?: Character[];
}

export function createNewsItem(attempt: Attempt, story: Story): News {
  const newsItem: News = { ...attempt, level: attempt.status == "untried" ? "suggested" : attempt.status };
  return newsItem;
}

export function reactionsToNews(news: News, scene: Scene, story: Story): ConsequenceWithForeshadowedNewsProvingAgency[] {
  const ccc = story.sceneStack.find(ccc => ccc.choice.scene == scene) || createSceneSet(story, { scene, choice: "ally" });
  const newConsequences: ConsequenceWithForeshadowedNewsProvingAgency[] = [];
  for (const character of story.characters)
    if (character != news.actor)
      if (!news.onlyKnownBy || news.onlyKnownBy.includes(character))
        for (const belief of character.beliefs)
          if (isButtonPushed(news, belief, story)) {
            const foreshadowThis: ForeShadowing = { character, belief, news };
            console.log("ReceivingImportantNews for news ", stringify(news));
            const sceneAction = createAttempt<News, ShouldBe>(character, ReceivingImportantNews, news, belief, undefined);
            const reactionScene = createScene(sceneAction);
            const consequence: ConsequenceWithForeshadowedNewsProvingAgency = { scene: reactionScene, foreshadow: foreshadowThis };
            newConsequences.push(consequence);
          }
  ccc.consequences.push(...newConsequences);
  return newConsequences;
}
