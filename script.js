const weights = [1.0, 1.2, 1.2, 1.3, 1.3, 1.3, 1.5, 1.5, 1.5, 1.7, 1.7, 1.7, 2, 2, 2];
let quizData = null;
let currentLang = 'ko';
let currentIndex = 0;
let answers = [];

const introSection = document.getElementById('intro');
const quizSection = document.getElementById('quiz-section');
const resultSection = document.getElementById('result-section');
const questionCard = document.getElementById('question-card');
const optionsDiv = document.getElementById('options');
const progressText = document.getElementById('progress-text');

document.querySelectorAll('[data-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    fetch(`lang/${currentLang}.json`)
      .then(res => res.json())
      .then(data => {
        quizData = data;
        startQuiz();
      });
  });
});

function startQuiz() {
  introSection.style.display = 'none';
  quizSection.style.display = 'block';
  resultSection.style.display = 'none';
  currentIndex = 0;
  answers = Array(quizData.questions.length).fill(null);
  showQuestion();
}

function showQuestion() {
  const q = quizData.questions[currentIndex];
  questionCard.innerHTML = q.replace(/\n/g, '<br>');
  optionsDiv.innerHTML = '';
  progressText.innerText = `${currentIndex + 1} / ${quizData.questions.length}`;

  quizData.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.className = 'option-btn';
    btn.onclick = () => {
      answers[currentIndex] = idx;
      if (currentIndex < quizData.questions.length - 1) {
        currentIndex++;
        showQuestion();
      } else {
        showResult();
      }
    };
    optionsDiv.appendChild(btn);
  });

  document.getElementById('prev-btn').style.display = currentIndex > 0 ? 'inline-block' : 'none';
}

document.getElementById('prev-btn').onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
};

function checkImmediateDanger() {
  const dangerConditions = [
    { index: 9, minScore: 2 },  // Q10: 물건 던지기, 벽 치기
    { index: 10, minScore: 2 }, // Q11: 밀치기, 잡아채기
    { index: 11, minScore: 1 }, // Q12: 죽이고 죽겠다
    { index: 12, minScore: 1 }, // Q13: 자해 암시
    { index: 13, minScore: 1 }, // Q14: 스토킹 암시
    { index: 14, minScore: 1 }  // Q15: 협박 암시
  ];
  return dangerConditions.some(cond => answers[cond.index] !== null && answers[cond.index] >= cond.minScore);
}

function showResult() {
    quizSection.style.display = 'none';
    resultSection.style.display = 'block';
  
    let score = 0;
    answers.forEach((a, i) => {
      if (a !== null) score += a * weights[i];
    });
  
    let resultKey = 'safe';
    let scoreClass = 'score-safe';
  
    // Killer 문항 조건 확인
    const isImmediateDanger = checkImmediateDanger();
  
    // 결과 판단
    if (isImmediateDanger) {
      resultKey = 'danger';
      scoreClass = 'score-danger';
      // 점수가 낮아도 납득이 가게끔 보정
      if (score < 70) {
        score = 70;
      }
  
    } else if (score >= 66) {
      resultKey = 'danger';
      scoreClass = 'score-danger';
    } else if (score >= 46) {
      resultKey = 'warning';
      scoreClass = 'score-warning';
    } else if (score >= 26) {
      resultKey = 'caution';
      scoreClass = 'score-caution';
    }

    score = Math.ceil(score);
  
    document.getElementById('result-message').innerHTML = `
      <div class="score-box ${scoreClass}">${score}점</div>
      <div class="description">${quizData.results[resultKey]}</div>
    `;
  }  

document.getElementById('restart-btn').onclick = () => {
  resultSection.style.display = 'none';
  introSection.style.display = 'block';
};

document.getElementById('main-title').onclick = () => {
  resultSection.style.display = 'none';
  quizSection.style.display = 'none';
  introSection.style.display = 'block';
};
