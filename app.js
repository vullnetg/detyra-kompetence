import { scenarios } from './questions.js';
import { createQuiz, getDueReview, gradeQuiz, updateReview } from './quiz.js';

const content = document.querySelector('main');
const storageKey = 'detyra-kompetence:v1';
const bookUrl = 'https://dukagjinibotime.com/libra/fizika-6-liber-baze';
const letters = ['A', 'B', 'C', 'D'];

const iconPaths = {
  clipboard: '<rect x="5" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 12h6m-6 4h6"/>',
  shuffle: '<path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c1.6 0 2.7-1.3 4-3m4-6c1.3-1.7 2.4-3 4-3h3m-4-4 4 4-4 4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  book: '<path d="M12 7c-2-2-4-3-9-3v15c5 0 7 1 9 2 2-1 4-2 9-2V4c-5 0-7 1-9 3zm0 0v14"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  spark: '<path d="M12 2c1.3 6 3.7 8.4 10 10-6.3 1.6-8.7 4-10 10-1.3-6-3.7-8.4-10-10 6.3-1.6 8.7-4 10-10Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function readState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? {};
  } catch {
    return {};
  }
}

const state = { history: [], review: {}, active: null, ...readState() };

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Practice still works for this visit when browser storage is unavailable.
  }
}

function startTest() {
  const { quiz, history } = createQuiz(scenarios, state.history, state.review);
  state.history = history;
  state.active = {
    quiz,
    answers: Array(quiz.questions.length).fill(null),
    submitted: false,
  };
  saveState();
  navigate('testi');
}

function navigate(page) {
  if (location.hash === `#${page}`) {
    render(true);
  } else {
    location.hash = page;
  }
}

function home() {
  const due = getDueReview(state.review);
  const ongoing = state.active && !state.active.submitted;
  return `
    <div class="frame home">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow"><span aria-hidden="true"></span> Ushtrime praktike</p>
          <h1 id="page-title">Fizika<br><em>në praktikë.</em></h1>
          <p class="lede">Zgjidh probleme nga jeta e përditshme, kontrollo përgjigjet dhe zbulo çfarë të përsëritësh në libër.</p>
          <div class="hero-actions">
            <button type="button" class="button primary" data-action="start">${icon('clipboard')} Test i ri</button>
            ${ongoing ? '<a class="secondary-link" href="#testi">Vazhdo testin</a>' : ''}
            ${state.active?.submitted ? '<a class="secondary-link" href="#rezultati">Rezultati i fundit</a>' : ''}
          </div>
          <div class="hero-meta">
            <span>${icon('clipboard')} 6 pyetje për test</span>
            <span>${icon('book')} Libri deri në faqen 85</span>
          </div>
        </div>
        <div class="hero-visual">
          <img src="physics-lab.jpg" width="1200" height="800" alt="" fetchpriority="high">
        </div>
      </section>
      <section class="workflow" aria-labelledby="workflow-title">
        <h2 id="workflow-title">Si funksionon</h2>
        <div class="workflow-grid">
          <article>
            <span class="feature-icon violet">${icon('shuffle')}</span>
            <h3>Një situatë e re</h3>
            <p>Çdo test të sjell një histori nga shkolla, përditshmëria ose loja.</p>
          </article>
          <article>
            <span class="feature-icon mint">${icon('target')}</span>
            <h3>Provo njohuritë</h3>
            <p>Lexo të dhënat dhe zgjidh një përgjigje për secilën pyetje.</p>
          </article>
          <article>
            <span class="feature-icon apricot">${icon('book')}</span>
            <h3>Mëso nga gabimet</h3>
            <p>Shiko shpjegimin dhe gjej faqet e librit ku mund të përsëritësh temën.</p>
          </article>
        </div>
      </section>
      ${due.length ? `
        <section class="review-notice" aria-label="Rikujtimi i temave">
          <span class="feature-icon violet">${icon('timer')}</span>
          <div><h2>Për rikujtim sot</h2><p>${due.map(({ topic }) => escapeHtml(topic)).join(' · ')}</p></div>
        </section>` : ''}
    </div>`;
}

function scenarioTable(table) {
  return `
    <div class="table-wrap" tabindex="0" role="region" aria-label="Tabela e të dhënave">
      <table>
        <thead><tr>${table.headers.map((name) => `<th scope="col">${escapeHtml(name)}</th>`).join('')}</tr></thead>
        <tbody>${table.rows.map((row) => `<tr>${row.map((value, index) => index === 0
          ? `<th scope="row">${escapeHtml(value)}</th>`
          : `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function questionCard(question, index, answer) {
  return `
    <fieldset class="question" id="pyetja-${index + 1}" data-question="${index}">
      <legend><span class="question-number">${index + 1}.</span><span>${escapeHtml(question.prompt)}</span></legend>
      <div class="choices">
        ${question.options.map((option, optionIndex) => `
          <label class="choice">
            <input type="radio" name="question-${index}" value="${optionIndex}" ${answer === optionIndex ? 'checked' : ''}>
            <span class="choice-letter" aria-hidden="true">${letters[optionIndex]}</span>
            <span>${escapeHtml(option)}</span>
          </label>`).join('')}
      </div>
    </fieldset>`;
}

function quizPage({ quiz, answers }) {
  return `
    <div class="frame interior">
      <a class="back-link" href="#kryefaqja">Kryefaqja</a>
      <p class="eyebrow"><span aria-hidden="true"></span> ${escapeHtml(quiz.category)}</p>
      <h1 id="page-title" class="interior-title">${escapeHtml(quiz.title)}</h1>
      <div class="quiz-layout">
        <div class="quiz-main">
          <section class="scenario card" id="situata" aria-labelledby="scenario-title">
            <h2 id="scenario-title">Situata dhe të dhënat</h2>
            <p>${escapeHtml(quiz.intro)}</p>
            ${scenarioTable(quiz.table)}
          </section>
          <form id="quiz-form" novalidate>
            <div class="question-heading"><h2>Pyetjet</h2><p>Zgjidh një alternativë për secilën pyetje.</p></div>
            ${quiz.questions.map((question, index) => questionCard(question, index, answers[index])).join('')}
            <div class="submit-row">
              <button class="button primary" type="submit">${icon('check')} Dorëzo testin</button>
              <p id="validation" class="validation" role="alert"></p>
            </div>
          </form>
        </div>
        <aside class="progress-card card" aria-labelledby="progress-title">
          <h2 id="progress-title">Përparimi</h2>
          <p id="progress-count" aria-live="polite"></p>
          <progress id="test-progress" aria-label="Pyetjet e përgjigjura" value="0" max="${quiz.questions.length}"></progress>
          <nav class="jump-links" aria-label="Shko te pyetja">
            ${answers.map((_, index) => `<button type="button" data-jump="${index}" aria-label="Pyetja ${index + 1}">${index + 1}</button>`).join('')}
          </nav>
          <button type="button" class="text-button see-scenario" data-action="scenario">${icon('book')} Kthehu te situata</button>
        </aside>
      </div>
    </div>`;
}

function correction({ question, index, selectedAnswer, correctAnswer }) {
  return `
    <article class="correction card">
      <h3><span class="correction-number">${index + 1}.</span> ${escapeHtml(question.prompt)}</h3>
      <div class="answer-line answer-wrong">${icon('x')}<p><strong>Përgjigjja jote</strong> ${escapeHtml(selectedAnswer)}</p></div>
      <div class="answer-line answer-right">${icon('check')}<p><strong>Përgjigjja e saktë</strong> ${escapeHtml(correctAnswer)}</p></div>
      <p class="explanation">${escapeHtml(question.explanation)}</p>
      <div class="study-note">
        ${icon('book')}
        <div><strong>${escapeHtml(question.topic)} · Fq. ${escapeHtml(question.pages)}</strong><p>${escapeHtml(question.study)}</p></div>
      </div>
    </article>`;
}

function resultPage({ quiz, answers }) {
  const result = gradeQuiz(quiz, answers);
  const mistakes = result.items.filter(({ correct }) => !correct);
  const studyTopics = [...new Map(mistakes.map(({ question }) => [question.topic, question])).values()];
  return `
    <div class="frame interior">
      <a class="back-link" href="#kryefaqja">Kryefaqja</a>
      <p class="eyebrow"><span aria-hidden="true"></span> Testi përfundoi</p>
      <h1 id="page-title" class="interior-title">Rezultati yt</h1>
      <p class="result-subtitle">${escapeHtml(quiz.title)}</p>
      <div class="score-grid">
        <div class="score-card score-total"><span>${icon('target')} Pikët</span><strong>${result.earnedPoints}<small> / ${result.possiblePoints}</small></strong></div>
        <div class="score-card score-correct"><span>${icon('check')} Të sakta</span><strong>${result.correctCount}<small> / ${result.totalQuestions}</small></strong></div>
        <div class="score-card score-wrong"><span>${icon('x')} Të gabuara</span><strong>${result.wrongCount}<small> / ${result.totalQuestions}</small></strong></div>
      </div>
      <div class="result-layout">
        <section aria-labelledby="feedback-title">
          <h2 id="feedback-title">${mistakes.length ? 'Rishiko përgjigjet' : 'Të gjitha përgjigjet janë të sakta!'}</h2>
          ${mistakes.map(correction).join('')}
          <article class="transfer card">
            <h3>${icon('spark')} Ku të hyn në punë?</h3>
            <p>${escapeHtml(quiz.transfer.prompt)}</p>
            <details><summary>Shiko një përgjigje të mundshme</summary><p>${escapeHtml(quiz.transfer.answer)}</p></details>
          </article>
        </section>
        <aside class="result-aside" aria-label="Hapat pas testit">
          ${studyTopics.length ? `
            <section class="study-card card" aria-labelledby="study-title">
              <span class="feature-icon violet">${icon('book')}</span>
              <h2 id="study-title">Çfarë të përsëritësh</h2>
              <ul>${studyTopics.map(({ topic, pages }) => `<li><span>${escapeHtml(topic)}</span><strong>Fq. ${escapeHtml(pages)}</strong></li>`).join('')}</ul>
              <a href="${bookUrl}" target="_blank" rel="noopener noreferrer">Hap librin bazë <span aria-hidden="true">↗</span></a>
            </section>` : ''}
          <button class="button primary" type="button" data-action="start">${icon('clipboard')} Test i ri</button>
        </aside>
      </div>
    </div>`;
}

function updateProgress() {
  const { answers } = state.active;
  const count = answers.filter(Number.isInteger).length;
  document.querySelector('#progress-count').textContent = `${count} nga ${answers.length} pyetje`;
  document.querySelector('#test-progress').value = count;
  document.querySelectorAll('[data-jump]').forEach((button) => {
    const index = Number(button.dataset.jump);
    const answered = Number.isInteger(answers[index]);
    button.classList.toggle('answered', answered);
    button.setAttribute('aria-label', `Pyetja ${index + 1}${answered ? ', e përgjigjur' : ''}`);
  });
}

function focusQuestion(index) {
  const fieldset = document.querySelector(`[data-question="${index}"]`);
  fieldset.scrollIntoView({ block: 'center' });
  (fieldset.querySelector('input:checked') ?? fieldset.querySelector('input')).focus({ preventScroll: true });
}

function render(moveFocus = false) {
  const route = location.hash.slice(1);
  const { active } = state;
  if (active && route === 'testi' && active.submitted) {
    history.replaceState(null, '', '#rezultati');
    content.innerHTML = resultPage(active);
  } else if (active && route === 'testi') {
    content.innerHTML = quizPage(active);
    updateProgress();
  } else if (active?.submitted && route === 'rezultati') {
    content.innerHTML = resultPage(active);
  } else {
    content.innerHTML = home();
  }

  if (moveFocus) {
    window.scrollTo(0, 0);
    content.focus({ preventScroll: true });
  }
}

content.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.action === 'start') startTest();
  if (button.dataset.jump !== undefined) focusQuestion(Number(button.dataset.jump));
  if (button.dataset.action === 'scenario') {
    const scenario = document.querySelector('#situata');
    const heading = scenario.querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    scenario.scrollIntoView({ block: 'start' });
    heading.focus({ preventScroll: true });
  }
});

content.addEventListener('change', (event) => {
  const input = event.target.closest('input[type="radio"]');
  if (!input) return;
  const fieldset = input.closest('[data-question]');
  state.active.answers[Number(fieldset.dataset.question)] = Number(input.value);
  fieldset.classList.remove('missing');
  document.querySelector('#validation').textContent = '';
  updateProgress();
  saveState();
});

content.addEventListener('submit', (event) => {
  event.preventDefault();
  const { quiz, answers, submitted } = state.active;
  if (submitted) return;
  const firstMissing = answers.findIndex((answer) => !Number.isInteger(answer));
  if (firstMissing >= 0) {
    document.querySelector('#validation').textContent = 'Përgjigju të gjitha pyetjeve para se të dorëzosh testin.';
    document.querySelector(`[data-question="${firstMissing}"]`).classList.add('missing');
    focusQuestion(firstMissing);
    return;
  }

  state.review = updateReview(state.review, gradeQuiz(quiz, answers));
  state.active.submitted = true;
  saveState();
  navigate('rezultati');
});

document.querySelector('.skip-link').addEventListener('click', (event) => {
  event.preventDefault();
  content.focus();
});
window.addEventListener('hashchange', () => render(true));
render();
