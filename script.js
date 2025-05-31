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

// ✅ 언어 버튼 클릭 → 언어 적용 + 시작 버튼 표시
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;

    // 버튼 선택 상태 스타일 적용
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // 언어 JSON 불러오기
    fetch(`lang/${currentLang}.json`)
      .then(res => res.json())
      .then(data => {
        quizData = data;
        applyLanguage(); // 전체 텍스트 업데이트
        document.getElementById('start-btn').style.display = 'block';
      });
  });
});

// ✅ 시작 버튼 클릭 시 퀴즈 시작
document.getElementById('start-btn').addEventListener('click', () => {
  if (!quizData) return; // 언어 선택 안 했으면 동작 X
  startQuiz();
});

// ✅ 전체 텍스트 적용 함수
function applyLanguage() {
  document.getElementById('main-title').innerText = quizData.title;
  document.querySelector('.intro-text').innerHTML = quizData.intro.replace(/\n/g, '<br>');
  document.getElementById('start-btn').innerText = quizData.start;
  document.getElementById('prev-btn').innerText = quizData.back;
  document.getElementById('restart-btn').innerText = quizData.restart;
  document.getElementById('share-btn').innerText = quizData.share;
}

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
    { index: 9, minScore: 2 },
    { index: 10, minScore: 2 },
    { index: 11, minScore: 1 },
    { index: 12, minScore: 1 },
    { index: 13, minScore: 1 },
    { index: 14, minScore: 1 }
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
  const isImmediateDanger = checkImmediateDanger();

  if (isImmediateDanger) {
    resultKey = 'danger';
    scoreClass = 'score-danger';
    score += 66;
    if (score > 100) score = 100;
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
    <div class="score-box ${scoreClass}">${score}${quizData.score}</div>
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

document.getElementById('share-btn').onclick = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert(quizData?.copy_success || '링크가 복사되었습니다!');
  });
};
