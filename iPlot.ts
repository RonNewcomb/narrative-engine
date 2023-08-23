/// <reference path="./narrativeEngine.ts"/>

interface Desireable extends Record<string, any> {
  name: string;
  number?: number;
  owner?: Character;
}

type NewsSensitivity = "suggested" | Omit<Attempt["status"], "untried">;

interface News extends Attempt {
  level: NewsSensitivity;
  onlyKnownBy?: Character[];
}

function createNewsItem(attempt: Attempt): News {
  const newsItem = { ...attempt, level: attempt.status == "untried" ? "suggested" : attempt.status };
  currentTurnsNews.push(newsItem);
  //console.log("NEWS", newsItem);
  return newsItem;
}

const oldNews: News[] = [];
let currentTurnsNews: News[] = [];

function isButtonPushed(news: News, belief: ShouldBe): boolean {
  const changeStatements = news.definition.rulebooks?.moveDesireables?.(news) || [];
  if (!changeStatements || !changeStatements.length) return false;
  for (const statement of changeStatements) {
    if (statement[0] != belief.property && (statement[0] || belief.property)) continue; // they differ and either/both are a truthy value
    if (statement[1] != belief.ofDesireable) continue;
    // if (statement[2] != belief.toValue) return true;
    // if (statement[3] != belief.toValue) return true;
    return true;
  }
  return false;
}
