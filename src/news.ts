import { GettingBadNews } from "./actions";
import { createAttempt, type Attempt } from "./attempts";
import { type ShouldBe } from "./beliefs";
import { type Character } from "./character";
import { createSceneSet } from "./choiceConsequenceClosure";
import { console_log, stringifyAttempt } from "./debug";
import { isButtonPushed } from "./iPlot";
import { createScene, type Scene } from "./scene";
import { story } from "./story";

export type NewsSensitivity = "suggested" | Omit<Attempt["status"], "untried">;

export interface News extends Attempt {
  level: NewsSensitivity;
  onlyKnownBy?: Character[];
}

export function createNewsItem(attempt: Attempt): News {
  const newsItem: News = { ...attempt, level: attempt.status == "untried" ? "suggested" : attempt.status };
  story.currentTurnsNews.push(newsItem);
  //console_log("NEWS", newsItem);
  return newsItem;
}

export function runNewsCycle(newss: News[], sceneJustFinished: Scene) {
  for (const news of newss)
    for (const character of story.characters)
      if (character != news.actor)
        for (const belief of character.beliefs)
          if (isButtonPushed(news, belief)) {
            console_log("((But", character.name, " didn't like ", stringifyAttempt(news), ".))");
            const sceneAction = createAttempt<News, ShouldBe>(character, GettingBadNews, news, belief, undefined);
            const reactionScene = createScene(character, sceneAction);
            //scheduleScene(reactionScene);
            createSceneSet({ scene: sceneJustFinished, foreshadow: {}, choice: "ally" }, { scene: reactionScene, foreshadow: {} });
          }
}

export function resetNewsCycle(): void {
  story.history.push(...story.currentTurnsNews);
  story.currentTurnsNews = [];
}
