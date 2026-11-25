const QUESTION_POINTS = [1, 2, 2, 2, 3, 2];
const REVIEW_DAYS = [1, 3, 7, 14];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getDueReview(review = {}, now = Date.now()) {
  return Object.values(review)
    .filter((record) => record && Number.isFinite(record.dueAt) && record.dueAt <= now)
    .sort((first, second) => first.dueAt - second.dueAt);
}

function shuffleOptions(options, random) {
  const choices = options.map((answer, index) => ({ answer, correct: index === 0 }));
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
  }
  return {
    options: choices.map(({ answer }) => answer),
    correctIndex: choices.findIndex(({ correct }) => correct),
  };
}

export function createQuiz(scenarios, history = [], review = {}, {
  now = Date.now(),
  random = Math.random,
} = {}) {
  if (scenarios.length === 0) {
    throw new RangeError('The question bank must contain at least one scenario.');
  }

  const scenarioIds = new Set(scenarios.map(({ id }) => id));
  const currentHistory = history.filter((id) => scenarioIds.has(id));
  const seen = new Set(currentHistory);
  const unseen = scenarios.filter(({ id }) => !seen.has(id));
  const newCycle = unseen.length === 0;
  const previousId = currentHistory.at(-1);
  const candidates = newCycle
    ? scenarios.filter(({ id }) => scenarios.length === 1 || id !== previousId)
    : unseen;

  const dueTopics = new Set(getDueReview(review, now).map(({ topic }) => topic));
  const eligible = candidates.map((scenario) => {
    const scenarioTopics = new Set(scenario.questions.map(({ topic }) => topic));
    const dueCount = [...scenarioTopics].filter((topic) => dueTopics.has(topic)).length;
    return { scenario, dueCount };
  });
  const bestDueCount = Math.max(...eligible.map(({ dueCount }) => dueCount));
  const best = eligible.filter(({ dueCount }) => dueCount === bestDueCount);
  const { scenario } = best[Math.floor(random() * best.length)];

  return {
    quiz: {
      ...scenario,
      questions: scenario.questions.map((question, index) => ({
        ...question,
        ...shuffleOptions(question.options, random),
        points: question.points ?? QUESTION_POINTS[index] ?? 1,
      })),
    },
    history: [...(newCycle ? [] : currentHistory), scenario.id],
  };
}

export function gradeQuiz(quiz, answers = []) {
  const items = quiz.questions.map((question, index) => {
    const choice = answers[index];
    const answered = Number.isInteger(choice) && choice >= 0 && choice < question.options.length;
    const selectedIndex = answered ? choice : null;
    return {
      question,
      index,
      selectedIndex,
      selectedAnswer: answered ? question.options[choice] : null,
      correctAnswer: question.options[question.correctIndex],
      correct: selectedIndex === question.correctIndex,
    };
  });

  const correctItems = items.filter(({ correct }) => correct);
  const unansweredCount = items.filter(({ selectedIndex }) => selectedIndex === null).length;
  return {
    correctCount: correctItems.length,
    wrongCount: items.length - correctItems.length - unansweredCount,
    unansweredCount,
    totalQuestions: items.length,
    earnedPoints: correctItems.reduce((total, { question }) => total + question.points, 0),
    possiblePoints: items.reduce((total, { question }) => total + question.points, 0),
    items,
  };
}

export function updateReview(review = {}, results, now = Date.now()) {
  const topicResults = new Map();
  for (const item of results.items) {
    if (item.selectedIndex === null) continue;

    const { topic } = item.question;
    const previous = topicResults.get(topic);
    if (!previous || (previous.correct && !item.correct)) {
      topicResults.set(topic, item);
    }
  }

  const updated = { ...review };
  for (const { question, correct } of topicResults.values()) {
    const { topic, pages, study } = question;
    const previous = Object.hasOwn(review, topic) ? review[topic] : null;
    if (previous && correct && previous.dueAt > now) continue;

    const step = previous && correct ? Math.min(previous.step + 1, REVIEW_DAYS.length - 1) : 0;
    updated[topic] = { topic, pages, study, step, dueAt: now + REVIEW_DAYS[step] * DAY_IN_MS };
  }

  return updated;
}
