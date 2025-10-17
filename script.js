// 게임 상태 관리
let gameState = {
    currentQuestion: 0,
    score: 0,
    questions: [],
    userAnswers: [],
    isGameActive: false,
    selectedAnswer: null,
    currentOptions: [],
    remainingAttempts: 4, // 현재 문제의 남은 기회
    totalWrongAnswers: 0, // 전체 오답 횟수
    currentQuestionWrongAnswers: 0, // 현재 문제의 오답 횟수
    hintTimer: null, // 힌트 타이머
    hintShown: false // 힌트가 표시되었는지 여부
};

// 기본 속담 데이터베이스
let proverbDatabase = [
    "가는 말이 고와야 오는 말이 곱다",
    "가재는 게 편이다",
    "개천에서 용 난다",
    "고래 싸움에 새우 등 터진다",
    "금강산도 식후경이다",
    "낙숫물이 댓돌을 뚫는다",
    "낮말은 새가 듣고 밤말은 쥐가 듣는다",
    "닭 잡아먹고 오리발",
    "도둑이 제 발 저리다",
    "돌다리도 두들겨 보고 건너라",
    "등잔 밑이 어둡다",
    "말이 씨가 된다",
    "목마른 놈이 우물 판다",
    "바늘구멍에 황소바람",
    "백지장도 맞들면 낫다",
    "사공이 많으면 배가 산으로 간다",
    "새우 등 터지게 한다",
    "서당 개 삼 년이면 풍월을 읊는다",
    "세월이 약이다",
    "소 잃고 외양간 고친다",
    "시작이 반이다",
    "아는 것이 병이다",
    "열 번 찍어 안 넘어가는 나무 없다",
    "원숭이도 나무에서 떨어진다",
    "윗물이 맑아야 아랫물이 맑다",
    "자업자득이다",
    "제 눈에 안경이다",
    "천리 길도 한 걸음부터",
    "콩 심은 데 콩 나고 팥 심은 데 팥 난다",
    "호미로 막을 것을 가래로 막는다"
];

// 특정 속담에 대한 현대적 재해석 유머 매핑
const humorousMappings = {
    "금강산도 식후경이다": "가보고 싶다",
    "천리 길도 한 걸음부터": "시동부터 걸어라", 
    "아는 것이 병이다": "없다",
    "목마른 놈이 우물 판다": "정수기 찾는다",
    "자업자득이다": "살기 힘들다",
    "백지장도 맞들면 낫다": "으면 기분 나쁘다"
};

// 로컬 스토리지에서 속담 데이터 로드
function loadProverbDatabase() {
    const saved = localStorage.getItem('proverbDatabase');
    if (saved) {
        proverbDatabase = JSON.parse(saved);
    }
}

// 로컬 스토리지에 속담 데이터 저장
function saveProverbDatabase() {
    localStorage.setItem('proverbDatabase', JSON.stringify(proverbDatabase));
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadProverbDatabase();
    updateProverbList();
    updateProverbCount();
});

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 랜딩 화면으로 이동
function goToLanding() {
    showScreen('landingScreen');
    gameState.isGameActive = false;
}

// 속담 게임으로 이동
function goToProverbGame() {
    showScreen('mainScreen');
}

// Stroop 게임으로 이동
function goToStroopGame() {
    showScreen('stroopScreen');
}

// 메모리 게임으로 이동
function goToMemoryGame() {
    showScreen('memoryScreen');
}

// 숫자 게임으로 이동
function goToNumberGame() {
    showScreen('numberScreen');
}

// 메인 화면으로 이동
function goToMain() {
    showScreen('mainScreen');
    gameState.isGameActive = false;
}

// 게임 시작
function startGame() {
    if (proverbDatabase.length < 10) {
        alert('속담이 10개 이상 필요합니다. 속담 관리에서 더 추가해주세요.');
        return;
    }
    
    // 게임 상태 초기화
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.userAnswers = [];
    gameState.isGameActive = true;
    gameState.remainingAttempts = 4;
    gameState.totalWrongAnswers = 0;
    gameState.currentQuestionWrongAnswers = 0;
    
    // 랜덤하게 10개 속담 선택
    gameState.questions = getRandomProverbs(10);
    
    // 게임 화면으로 이동
    showScreen('gameScreen');
    showCurrentQuestion();
}

// 랜덤 속담 선택
function getRandomProverbs(count) {
    const shuffled = [...proverbDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 현재 문제 표시
function showCurrentQuestion() {
    const question = gameState.questions[gameState.currentQuestion];
    const splitPoint = Math.floor(question.length * 0.6); // 60% 지점에서 자르기
    const questionPart = question.substring(0, splitPoint);
    const correctAnswer = question.substring(splitPoint);
    
    document.getElementById('questionText').textContent = questionPart + '...';
    
    // 객관식 선택지 생성
    gameState.currentOptions = generateAnswerOptions(question, correctAnswer);
    displayAnswerOptions(gameState.currentOptions);
    
    // 선택 초기화 및 기회 초기화
    gameState.selectedAnswer = null;
    gameState.remainingAttempts = 4;
    gameState.currentQuestionWrongAnswers = 0;
    gameState.hintShown = false;
    
    // 진행 상황 업데이트
    document.getElementById('currentQuestion').textContent = gameState.currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = gameState.questions.length;
    document.getElementById('currentScore').textContent = gameState.score;
    
    // 남은 기회 표시 업데이트
    updateAttemptsDisplay();
    
    // 힌트 타이머 시작
    startHintTimer();
    
    // 다음 버튼 숨기기
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
}

// 객관식 선택지 생성
function generateAnswerOptions(question, correctAnswer) {
    const options = [correctAnswer]; // 정답 포함
    
    // 특정 속담에 현대적 재해석 유머가 있는지 확인
    if (humorousMappings[question]) {
        const humorousAnswer = humorousMappings[question];
        options.push(humorousAnswer);
    }
    
    // 다른 속담에서 유사한 부분들을 선택지로 만들기
    const otherProverbs = proverbDatabase.filter(p => p !== question);
    const shuffled = otherProverbs.sort(() => 0.5 - Math.random());
    
    // 남은 오답 선택지 생성 (유머가 있으면 2개, 없으면 3개)
    const remainingOptions = humorousMappings[question] ? 2 : 3;
    
    for (let i = 0; i < remainingOptions && i < shuffled.length; i++) {
        const otherProverb = shuffled[i];
        const splitPoint = Math.floor(otherProverb.length * 0.6);
        const wrongAnswer = otherProverb.substring(splitPoint);
        
        if (wrongAnswer !== correctAnswer && !options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    // 선택지가 4개가 안 되면 더 추가
    while (options.length < 4) {
        const randomProverb = proverbDatabase[Math.floor(Math.random() * proverbDatabase.length)];
        const splitPoint = Math.floor(randomProverb.length * 0.6);
        const randomAnswer = randomProverb.substring(splitPoint);
        
        if (!options.includes(randomAnswer)) {
            options.push(randomAnswer);
        }
    }
    
    // 선택지 섞기
    return options.sort(() => 0.5 - Math.random());
}

// 선택지 표시
function displayAnswerOptions(options) {
    const container = document.getElementById('answerOptions');
    container.innerHTML = '';
    
    options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.textContent = option;
        optionElement.onclick = () => selectAnswer(index, option);
        container.appendChild(optionElement);
    });
}

// 답안 선택
function selectAnswer(index, answer) {
    // 이전 선택 해제
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 현재 선택 표시
    document.querySelectorAll('.answer-option')[index].classList.add('selected');
    gameState.selectedAnswer = answer;
    
    // 자동으로 답안 확인
    setTimeout(() => {
        checkAnswer();
    }, 500);
}

// 답안 확인
function checkAnswer() {
    if (!gameState.selectedAnswer) {
        return;
    }
    
    const question = gameState.questions[gameState.currentQuestion];
    const splitPoint = Math.floor(question.length * 0.6);
    const correctAnswer = question.substring(splitPoint);
    
    // 정답 확인
    const isCorrect = gameState.selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        // 정답인 경우
        gameState.score += 10;
        showFeedback('정답입니다! 🎉', 'correct');
        
        // 힌트 타이머 클리어
        if (gameState.hintTimer) {
            clearTimeout(gameState.hintTimer);
        }
        
        // 답안 저장
        gameState.userAnswers.push({
            question: question,
            userAnswer: gameState.selectedAnswer,
            correctAnswer: correctAnswer,
            isCorrect: true,
            attempts: 4 - gameState.remainingAttempts
        });
        
        // 선택지에 정답 표시
        document.querySelectorAll('.answer-option').forEach((option) => {
            const optionText = option.textContent;
            if (optionText === correctAnswer) {
                option.classList.add('correct');
            }
        });
        
        // 다음 버튼 표시
        document.getElementById('nextBtn').style.display = 'block';
        
    } else {
        // 오답인 경우
        gameState.remainingAttempts--;
        gameState.currentQuestionWrongAnswers++;
        gameState.totalWrongAnswers++;
        
        // 선택지에 오답 표시
        document.querySelectorAll('.answer-option').forEach((option) => {
            const optionText = option.textContent;
            if (optionText === gameState.selectedAnswer) {
                option.classList.add('wrong');
            }
        });
        
        if (gameState.remainingAttempts > 0) {
            // 아직 기회가 남은 경우
            let feedbackMessage = `틀렸습니다. ${gameState.remainingAttempts}번의 기회가 남았습니다. 다시 선택해주세요.`;
            
            // 현대적 재해석 유머인지 확인
            const question = gameState.questions[gameState.currentQuestion];
            if (humorousMappings[question] && gameState.selectedAnswer === humorousMappings[question]) {
                feedbackMessage = `😄 재미있는 현대적 해석이네요! 하지만 틀렸습니다. ${gameState.remainingAttempts}번의 기회가 남았습니다.`;
            }
            
            showFeedback(feedbackMessage, 'wrong');
            updateAttemptsDisplay();
            
            // 선택지 다시 활성화
            setTimeout(() => {
                resetAnswerOptions();
            }, 2000);
            
        } else {
            // 기회를 모두 소진한 경우
            let finalFeedback = `기회를 모두 소진했습니다. 정답은 "${correctAnswer}"입니다.`;
            
            // 마지막 선택이 현대적 재해석 유머인지 확인
            const question = gameState.questions[gameState.currentQuestion];
            if (humorousMappings[question] && gameState.selectedAnswer === humorousMappings[question]) {
                finalFeedback = `😄 재미있는 현대적 해석이었지만 틀렸습니다. 정답은 "${correctAnswer}"입니다.`;
            }
            
            showFeedback(finalFeedback, 'wrong');
            
            // 답안 저장
            gameState.userAnswers.push({
                question: question,
                userAnswer: gameState.selectedAnswer,
                correctAnswer: correctAnswer,
                isCorrect: false,
                attempts: 4
            });
            
            // 정답 표시
            document.querySelectorAll('.answer-option').forEach((option) => {
                const optionText = option.textContent;
                if (optionText === correctAnswer) {
                    option.classList.add('correct');
                }
            });
            
            // 다음 버튼 표시
            document.getElementById('nextBtn').style.display = 'block';
        }
    }
    
    document.getElementById('currentScore').textContent = gameState.score;
}


// 힌트 타이머 시작
function startHintTimer() {
    // 기존 타이머가 있으면 클리어
    if (gameState.hintTimer) {
        clearTimeout(gameState.hintTimer);
    }
    
    // 8초 후 힌트 표시
    gameState.hintTimer = setTimeout(() => {
        if (!gameState.hintShown && gameState.isGameActive) {
            showHint();
        }
    }, 8000);
}

// 힌트 표시
function showHint() {
    if (gameState.hintShown) return;
    
    gameState.hintShown = true;
    
    // 정답 선택지에 강조 효과 추가
    const question = gameState.questions[gameState.currentQuestion];
    const splitPoint = Math.floor(question.length * 0.6);
    const correctAnswer = question.substring(splitPoint);
    
    document.querySelectorAll('.answer-option').forEach((option) => {
        const optionText = option.textContent;
        if (optionText === correctAnswer) {
            option.classList.add('hint-highlight');
        }
    });
    
    // 힌트는 시각적으로만 표시 (메시지 없음)
}

// 남은 기회 표시 업데이트
function updateAttemptsDisplay() {
    const attemptsInfo = document.getElementById('attemptsInfo');
    if (attemptsInfo) {
        attemptsInfo.textContent = `남은 기회: ${gameState.remainingAttempts}번`;
    }
}

// 선택지 다시 활성화
function resetAnswerOptions() {
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('wrong', 'selected');
        option.style.pointerEvents = 'auto';
        option.style.opacity = '1';
    });
    
    // 선택 초기화
    gameState.selectedAnswer = null;
}

// 사운드 재생 함수
function playSound(type) {
    try {
        // Web Audio API를 사용한 사운드 생성
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'correct') {
            // 정답 사운드: 상승하는 톤
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.3); // E5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'wrong') {
            // 오답 사운드: 하강하는 톤
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
            oscillator.frequency.exponentialRampToValueAtTime(261.63, audioContext.currentTime + 0.4); // C4
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        }
    } catch (error) {
        console.log('사운드 재생 오류:', error);
    }
}

// 피드백 표시
function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    
    // 사운드 재생
    if (type === 'correct' || type === 'wrong') {
        playSound(type);
    }
}

// 다음 문제
function nextQuestion() {
    // 힌트 타이머 클리어
    if (gameState.hintTimer) {
        clearTimeout(gameState.hintTimer);
    }
    
    gameState.currentQuestion++;
    
    if (gameState.currentQuestion >= gameState.questions.length) {
        showResult();
    } else {
        showCurrentQuestion();
    }
}

// 결과 화면 표시
function showResult() {
    const correctCount = gameState.userAnswers.filter(answer => answer.isCorrect).length;
    const wrongCount = gameState.userAnswers.length - correctCount;
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = gameState.totalWrongAnswers;
    
    // 점수에 따른 메시지
    let message = '';
    if (gameState.score >= 80) {
        message = '훌륭합니다! 🏆';
    } else if (gameState.score >= 60) {
        message = '잘했습니다! 👏';
    } else if (gameState.score >= 40) {
        message = '괜찮습니다! 👍';
    } else {
        message = '다시 도전해보세요! 💪';
    }
    
    document.getElementById('scoreMessage').textContent = message;
    
    showScreen('resultScreen');
}

// 게임 재시작
function restartGame() {
    startGame();
}

// 데이터 관리 화면 표시
function showDataManager() {
    showScreen('dataManagerScreen');
    updateProverbList();
    updateProverbCount();
}

// 속담 추가
function addProverb() {
    const newProverb = document.getElementById('newProverb').value.trim();
    
    if (!newProverb) {
        alert('속담을 입력해주세요.');
        return;
    }
    
    if (proverbDatabase.includes(newProverb)) {
        alert('이미 존재하는 속담입니다.');
        return;
    }
    
    if (newProverb.length < 5) {
        alert('속담이 너무 짧습니다.');
        return;
    }
    
    proverbDatabase.push(newProverb);
    saveProverbDatabase();
    
    document.getElementById('newProverb').value = '';
    updateProverbList();
    updateProverbCount();
    
    alert('속담이 추가되었습니다!');
}

// 속담 삭제
function deleteProverb(index) {
    if (confirm('이 속담을 삭제하시겠습니까?')) {
        proverbDatabase.splice(index, 1);
        saveProverbDatabase();
        updateProverbList();
        updateProverbCount();
    }
}

// 속담 목록 업데이트
function updateProverbList() {
    const listContainer = document.getElementById('proverbList');
    listContainer.innerHTML = '';
    
    proverbDatabase.forEach((proverb, index) => {
        const item = document.createElement('div');
        item.className = 'proverb-item';
        item.innerHTML = `
            <span class="proverb-text">${proverb}</span>
            <button class="delete-btn" onclick="deleteProverb(${index})">삭제</button>
        `;
        listContainer.appendChild(item);
    });
}

// 속담 개수 업데이트
function updateProverbCount() {
    document.getElementById('proverbCount').textContent = proverbDatabase.length;
}

// 키보드 이벤트 처리 (객관식에서는 숫자키로 선택)
document.addEventListener('keydown', function(event) {
    if (gameState.isGameActive && !gameState.selectedAnswer) {
        const key = event.key;
        if (key >= '1' && key <= '4') {
            const index = parseInt(key) - 1;
            const options = document.querySelectorAll('.answer-option');
            if (options[index]) {
                selectAnswer(index, options[index].textContent);
            }
        }
    } else if (event.key === 'Enter' && gameState.isGameActive) {
        if (document.getElementById('nextBtn').style.display === 'block') {
            nextQuestion();
        }
    }
});

// 터치 이벤트 최적화
document.addEventListener('touchstart', function(event) {
    // 터치 시 기본 동작 방지 (더블탭 줌 등)
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') {
        event.preventDefault();
    }
}, { passive: false });

// 입력 필드 포커스 시 키보드 자동 올라오기 방지
document.addEventListener('focusin', function(event) {
    if (event.target.tagName === 'INPUT') {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    }
});

// 앱 설치 프롬프트 (PWA 기능)
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 설치 버튼 표시 로직을 여기에 추가할 수 있습니다
});

// 오프라인 지원
window.addEventListener('online', function() {
    console.log('온라인 상태입니다.');
});

window.addEventListener('offline', function() {
    console.log('오프라인 상태입니다.');
    alert('인터넷 연결이 없습니다. 일부 기능이 제한될 수 있습니다.');
});

// Stroop 게임 상태 관리
let stroopGameState = {
    currentMode: null,
    currentDifficulty: 'normal',
    currentIdx: 0,
    score: 0,
    timer: 0,
    timerInterval: null,
    questions: []
};

// Stroop 게임 문제 데이터
const STROOP_QUESTIONS = {
    kor: [
        { word: '파랑', color: 'red', choices: ['파랑', '노랑', '초록', '빨강'], answer: '빨강' },
        { word: '노랑', color: 'blue', choices: ['파랑', '노랑', '초록', '빨강'], answer: '파랑' },
        { word: '초록', color: 'yellow', choices: ['초록', '노랑', '파랑', '빨강'], answer: '노랑' },
        { word: '빨강', color: 'green', choices: ['빨강', '노랑', '초록', '파랑'], answer: '초록' },
        { word: '노랑', color: 'green', choices: ['빨강', '노랑', '초록', '파랑'], answer: '초록' },
        { word: '초록', color: 'red', choices: ['빨강', '노랑', '초록', '파랑'], answer: '빨강' },
        { word: '파랑', color: 'yellow', choices: ['빨강', '노랑', '초록', '파랑'], answer: '노랑' },
        { word: '빨강', color: 'blue', choices: ['빨강', '노랑', '초록', '파랑'], answer: '파랑' },
        { word: '노랑', color: 'red', choices: ['빨강', '노랑', '초록', '파랑'], answer: '빨강' },
        { word: '초록', color: 'blue', choices: ['빨강', '노랑', '초록', '파랑'], answer: '파랑' },
    ],
    eng: [
        { word: 'GREEN', color: 'yellow', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'YELLOW' },
        { word: 'RED', color: 'blue', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'BLUE' },
        { word: 'YELLOW', color: 'green', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'GREEN' },
        { word: 'BLUE', color: 'red', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'RED' },
        { word: 'RED', color: 'green', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'GREEN' },
        { word: 'YELLOW', color: 'blue', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'BLUE' },
        { word: 'GREEN', color: 'red', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'RED' },
        { word: 'BLUE', color: 'yellow', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'YELLOW' },
        { word: 'YELLOW', color: 'red', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'RED' },
        { word: 'GREEN', color: 'blue', choices: ['GREEN', 'YELLOW', 'BLUE', 'RED'], answer: 'BLUE' },
    ],
    shape: [
        { shape: 'circle', color: 'green', choices: ['동그라미', '세모', '네모', '별'], answer: '동그라미' },
        { shape: 'triangle', color: 'red', choices: ['동그라미', '세모', '네모', '별'], answer: '세모' },
        { shape: 'square', color: 'blue', choices: ['동그라미', '세모', '네모', '별'], answer: '네모' },
        { shape: 'star', color: 'yellow', choices: ['동그라미', '세모', '네모', '별'], answer: '별' },
        { shape: 'circle', color: 'red', choices: ['동그라미', '세모', '네모', '별'], answer: '동그라미' },
        { shape: 'triangle', color: 'green', choices: ['동그라미', '세모', '네모', '별'], answer: '세모' },
        { shape: 'square', color: 'yellow', choices: ['동그라미', '세모', '네모', '별'], answer: '네모' },
        { shape: 'star', color: 'blue', choices: ['동그라미', '세모', '네모', '별'], answer: '별' },
        { shape: 'circle', color: 'yellow', choices: ['동그라미', '세모', '네모', '별'], answer: '동그라미' },
        { shape: 'triangle', color: 'blue', choices: ['동그라미', '세모', '네모', '별'], answer: '세모' },
    ],
    baby: [
        { img: '🍎', choices: ['사과', '바나나', '포도', '딸기'], answer: '사과' },
        { img: '🍌', choices: ['사과', '바나나', '포도', '딸기'], answer: '바나나' },
        { img: '🍇', choices: ['사과', '바나나', '포도', '딸기'], answer: '포도' },
        { img: '🍓', choices: ['사과', '바나나', '포도', '딸기'], answer: '딸기' },
        { img: '🍊', choices: ['오렌지', '수박', '복숭아', '배'], answer: '오렌지' },
        { img: '🍉', choices: ['오렌지', '수박', '복숭아', '배'], answer: '수박' },
        { img: '🍑', choices: ['오렌지', '수박', '복숭아', '배'], answer: '복숭아' },
        { img: '🍐', choices: ['오렌지', '수박', '복숭아', '배'], answer: '배' },
        { img: '🥕', choices: ['당근', '감자', '고구마', '무'], answer: '당근' },
        { img: '🥔', choices: ['당근', '감자', '고구마', '무'], answer: '감자' },
    ]
};

const STROOP_COLOR_MAP = {
    red: '#e06666',
    blue: '#6fa8dc',
    green: '#93c47d',
    yellow: '#ffd966',
    black: '#444',
    '빨강': '#e06666',
    '파랑': '#6fa8dc',
    '초록': '#93c47d',
    '노랑': '#ffd966',
    'GREEN': '#93c47d',
    'BLUE': '#6fa8dc',
    'YELLOW': '#ffd966',
    'RED': '#e06666',
};

const STROOP_DIFFICULTY_MAP = { 
    easy: 5, 
    normal: 10, 
    hard: 20 
};

// Stroop 게임 함수들
function selectStroopDifficulty(diff) {
    stroopGameState.currentDifficulty = diff;
    // 버튼 스타일 업데이트
    const btns = document.querySelectorAll('.btn-difficulty');
    btns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.btn-difficulty.${diff}`).classList.add('active');
}

function selectStroopMode(mode) {
    stroopGameState.currentMode = mode;
    document.getElementById('stroopModeScreen').style.display = 'none';
    document.getElementById('stroopStartScreen').style.display = 'block';
    
    let title = '';
    if (mode === 'kor') title = '한글 모드';
    if (mode === 'eng') title = '영어 모드';
    if (mode === 'shape') title = '모양 모드';
    if (mode === 'baby') title = '베이비 모드';
    document.getElementById('stroopSelectedModeTitle').textContent = title;
}

function startStroopGame() {
    stroopGameState.currentIdx = 0;
    stroopGameState.score = 0;
    stroopGameState.timer = 0;
    document.getElementById('stroopTimer').textContent = '0.0';
    
    if (stroopGameState.timerInterval) clearInterval(stroopGameState.timerInterval);
    stroopGameState.timerInterval = setInterval(() => {
        stroopGameState.timer += 0.1;
        document.getElementById('stroopTimer').textContent = stroopGameState.timer.toFixed(1);
    }, 100);
    
    document.getElementById('stroopStartScreen').style.display = 'none';
    document.getElementById('stroopGameArea').style.display = 'block';
    
    // 난이도에 따라 문제 셔플 및 개수 조정
    shuffleStroopQuestions();
    showStroopQuestion();
}

function shuffleStroopQuestions() {
    const arr = STROOP_QUESTIONS[stroopGameState.currentMode];
    let n = STROOP_DIFFICULTY_MAP[stroopGameState.currentDifficulty] || 10;
    if (arr.length < n) n = arr.length;
    
    // 피셔-예이츠 셔플
    let shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    stroopGameState.questions = shuffled.slice(0, n);
}

function showStroopQuestion() {
    const questionArea = document.getElementById('stroopQuestion');
    const choicesArea = document.getElementById('stroopChoices');
    const resultArea = document.getElementById('stroopResult');
    
    const q = stroopGameState.questions[stroopGameState.currentIdx];
    
    // 문제 표시
    let questionHTML = '';
    if (stroopGameState.currentMode === 'kor') {
        questionHTML = `<div style="color:${STROOP_COLOR_MAP[q.color]}">${q.word}</div>`;
    } else if (stroopGameState.currentMode === 'eng') {
        questionHTML = `<div style="color:${STROOP_COLOR_MAP[q.color]}">${q.word}</div>`;
    } else if (stroopGameState.currentMode === 'shape') {
        questionHTML = `<div><span style="font-size:3em;color:${STROOP_COLOR_MAP[q.color]}">${getShapeIcon(q.shape)}</span></div>`;
    } else if (stroopGameState.currentMode === 'baby') {
        questionHTML = `<div><span style="font-size:3em;">${q.img}</span></div>`;
    }
    questionArea.innerHTML = questionHTML;
    
    // 선택지 생성
    let allChoices = q.choices.slice();
    if (!allChoices.includes(q.answer)) allChoices.push(q.answer);
    
    // 선택지 셔플
    for (let i = allChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
    }
    
    let choicesHTML = '';
    allChoices.forEach(choice => {
        let style = '';
        if (stroopGameState.currentMode === 'kor' || stroopGameState.currentMode === 'eng') {
            style = `background:${STROOP_COLOR_MAP[choice]||'#eee'};color:${['yellow','노랑','YELLOW'].includes(choice)?'#b45f06':'#fff'};`;
        }
        choicesHTML += `<button class="stroop-choice-btn" style="${style}" onclick="checkStroopAnswer('${choice}')">${choice}</button>`;
    });
    choicesArea.innerHTML = choicesHTML;
    
    // 결과 초기화
    resultArea.textContent = '';
}

function checkStroopAnswer(choice) {
    const q = stroopGameState.questions[stroopGameState.currentIdx];
    const resultArea = document.getElementById('stroopResult');
    const judgeMark = document.getElementById('stroopJudgeMark');
    
    if (choice === q.answer) {
        stroopGameState.score++;
        resultArea.textContent = '정답!';
        resultArea.style.color = '#93c47d';
        if (judgeMark) {
            judgeMark.innerHTML = '<span style="font-size:5em;color:#4CAF50;">⭕</span>';
            judgeMark.style.display = 'flex';
        }
    } else {
        resultArea.textContent = '오답!';
        resultArea.style.color = '#e06666';
        if (judgeMark) {
            judgeMark.innerHTML = '<span style="font-size:5em;color:#e06666;">❌</span>';
            judgeMark.style.display = 'flex';
        }
    }
    
    setTimeout(() => {
        if (judgeMark) judgeMark.style.display = 'none';
        nextStroopQuestion();
    }, 800);
}

function nextStroopQuestion() {
    stroopGameState.currentIdx++;
    if (stroopGameState.currentIdx >= stroopGameState.questions.length) {
        showStroopResult();
    } else {
        showStroopQuestion();
    }
}

function showStroopResult() {
    const gameArea = document.getElementById('stroopGameArea');
    if (stroopGameState.timerInterval) clearInterval(stroopGameState.timerInterval);
    
    const resultHTML = `
        <div class="stroop-result">
            <h2>게임 완료!</h2>
            <p>점수: ${stroopGameState.score} / ${stroopGameState.questions.length}</p>
            <p>총 소요 시간: <span style='font-weight:bold;'>${stroopGameState.timer.toFixed(1)}초</span></p>
        </div>
        <div class="stroop-controls">
            <button class="btn btn-primary" onclick="restartStroopGame()">다시하기</button>
            <button class="btn btn-secondary" onclick="goToStroopModeSelect()">게임 선택으로</button>
        </div>
    `;
    
    gameArea.innerHTML = resultHTML;
}

function restartStroopGame() {
    document.getElementById('stroopModeScreen').style.display = 'block';
    document.getElementById('stroopGameArea').style.display = 'none';
    document.getElementById('stroopStartScreen').style.display = 'none';
    if (stroopGameState.timerInterval) clearInterval(stroopGameState.timerInterval);
}

function goToStroopModeSelect() {
    document.getElementById('stroopModeScreen').style.display = 'block';
    document.getElementById('stroopGameArea').style.display = 'none';
    document.getElementById('stroopStartScreen').style.display = 'none';
    if (stroopGameState.timerInterval) clearInterval(stroopGameState.timerInterval);
}

function getShapeIcon(shape) {
    if (shape === 'circle') return '●';
    if (shape === 'triangle') return '▲';
    if (shape === 'square') return '■';
    if (shape === 'star') return '★';
    return '?';
}

// 메모리 게임 상태 관리
let memoryGameState = {
    currentMode: null,
    currentDifficulty: 'normal',
    flippedCards: [],
    matchedCards: 0,
    currentPlayer: 1,
    score: 0,
    timer: 0,
    timerInterval: null,
    gameBoard: [],
    isGameActive: false
};

const MEMORY_DIFFICULTY_MAP = {
    easy: { rows: 4, cols: 3, name: '쉬움 (4x3)' },
    normal: { rows: 4, cols: 4, name: '보통 (4x4)' },
    hard: { rows: 5, cols: 4, name: '어려움 (5x4)' }
};

// 메모리 게임 함수들
function selectMemoryDifficulty(diff) {
    memoryGameState.currentDifficulty = diff;
    // 버튼 스타일 업데이트
    const btns = document.querySelectorAll('.memory-difficulty-buttons .btn-difficulty');
    btns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.memory-difficulty-buttons .btn-difficulty.${diff}`).classList.add('active');
}

function selectMemoryMode(mode) {
    memoryGameState.currentMode = mode;
    document.getElementById('memoryModeScreen').style.display = 'none';
    document.getElementById('memoryStartScreen').style.display = 'block';
    
    let title = '';
    if (mode === 'solo') title = '혼자 플레이';
    if (mode === 'vs') title = '컴퓨터와 대결';
    document.getElementById('memorySelectedModeTitle').textContent = title;
}

function startMemoryGame() {
    memoryGameState.flippedCards = [];
    memoryGameState.matchedCards = 0;
    memoryGameState.currentPlayer = 1;
    memoryGameState.score = 0;
    memoryGameState.timer = 0;
    memoryGameState.isGameActive = true;
    
    document.getElementById('memoryTimer').textContent = '0';
    document.getElementById('memoryScore').textContent = '0';
    
    if (memoryGameState.timerInterval) clearInterval(memoryGameState.timerInterval);
    memoryGameState.timerInterval = setInterval(() => {
        memoryGameState.timer++;
        document.getElementById('memoryTimer').textContent = memoryGameState.timer;
    }, 1000);
    
    document.getElementById('memoryStartScreen').style.display = 'none';
    document.getElementById('memoryGameArea').style.display = 'block';
    
    // 플레이어 정보 표시
    if (memoryGameState.currentMode === 'vs') {
        document.getElementById('memoryPlayerInfo').style.display = 'flex';
        document.getElementById('memoryCurrentPlayer').textContent = '플레이어 1';
    } else {
        document.getElementById('memoryPlayerInfo').style.display = 'none';
    }
    
    createMemoryBoard();
}

function createMemoryBoard() {
    const difficulty = MEMORY_DIFFICULTY_MAP[memoryGameState.currentDifficulty];
    const totalCards = difficulty.rows * difficulty.cols;
    const pairs = totalCards / 2;
    
    const board = document.getElementById('memoryGameBoard');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${difficulty.cols}, 1fr)`;
    
    // 색상 심볼 생성
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    let colorSymbols = [];
    for (let i = 0; i < pairs; i++) {
        const color = colors[i % colors.length];
        colorSymbols.push(color, color);
    }
    
    // 색상 셔플
    colorSymbols = colorSymbols.sort(() => Math.random() - 0.5);
    memoryGameState.gameBoard = colorSymbols;
    
    // 카드 생성
    colorSymbols.forEach((color, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.color = color;
        card.dataset.index = index;
        card.addEventListener('click', () => flipMemoryCard(card));
        board.appendChild(card);
    });
}

function flipMemoryCard(card) {
    if (!memoryGameState.isGameActive || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched') ||
        memoryGameState.flippedCards.length === 2) {
        return;
    }
    
    // 카드 색상 변경
    card.style.backgroundColor = card.dataset.color;
    card.classList.add('flipped');
    memoryGameState.flippedCards.push(card);
    
    if (memoryGameState.flippedCards.length === 2) {
        const [first, second] = memoryGameState.flippedCards;
        
        if (first.dataset.color === second.dataset.color) {
            // 매치 성공
            first.classList.add('matched');
            second.classList.add('matched');
            memoryGameState.matchedCards += 2;
            memoryGameState.score += 10;
            document.getElementById('memoryScore').textContent = memoryGameState.score;
            memoryGameState.flippedCards = [];
            
            // 게임 완료 체크
            if (memoryGameState.matchedCards === memoryGameState.gameBoard.length) {
                setTimeout(() => {
                    showMemoryResult();
                }, 500);
            }
        } else {
            // 매치 실패
            first.classList.add('wrong');
            second.classList.add('wrong');
            
            setTimeout(() => {
                first.classList.remove('flipped', 'wrong');
                second.classList.remove('flipped', 'wrong');
                first.style.backgroundColor = '';
                second.style.backgroundColor = '';
                memoryGameState.flippedCards = [];
                
                // 턴 전환 (vs 모드에서만)
                if (memoryGameState.currentMode === 'vs') {
                    switchMemoryTurn();
                }
            }, 1000);
        }
    }
}

function switchMemoryTurn() {
    memoryGameState.currentPlayer = memoryGameState.currentPlayer === 1 ? 2 : 1;
    document.getElementById('memoryCurrentPlayer').textContent = `플레이어 ${memoryGameState.currentPlayer}`;
}

function showMemoryResult() {
    memoryGameState.isGameActive = false;
    if (memoryGameState.timerInterval) clearInterval(memoryGameState.timerInterval);
    
    const difficulty = MEMORY_DIFFICULTY_MAP[memoryGameState.currentDifficulty];
    const totalPairs = (difficulty.rows * difficulty.cols) / 2;
    const time = memoryGameState.timer;
    const score = memoryGameState.score;
    
    let resultMessage = '';
    if (memoryGameState.currentMode === 'vs') {
        resultMessage = `게임 완료!<br>총 소요 시간: ${time}초<br>점수: ${score}점`;
    } else {
        resultMessage = `축하합니다!<br>총 소요 시간: ${time}초<br>점수: ${score}점<br>모든 카드를 찾았습니다!`;
    }
    
    const resultHTML = `
        <div class="memory-result">
            <h2>🎉 게임 완료!</h2>
            <p>${resultMessage}</p>
        </div>
        <div class="memory-controls">
            <button class="btn btn-primary" onclick="restartMemoryGame()">다시하기</button>
            <button class="btn btn-secondary" onclick="goToMemoryModeSelect()">게임 선택으로</button>
        </div>
    `;
    
    document.getElementById('memoryGameArea').innerHTML = resultHTML;
}

function restartMemoryGame() {
    document.getElementById('memoryModeScreen').style.display = 'block';
    document.getElementById('memoryGameArea').style.display = 'none';
    document.getElementById('memoryStartScreen').style.display = 'none';
    if (memoryGameState.timerInterval) clearInterval(memoryGameState.timerInterval);
}

function goToMemoryModeSelect() {
    document.getElementById('memoryModeScreen').style.display = 'block';
    document.getElementById('memoryGameArea').style.display = 'none';
    document.getElementById('memoryStartScreen').style.display = 'none';
    if (memoryGameState.timerInterval) clearInterval(memoryGameState.timerInterval);
}

// 숫자 게임 상태 관리
let numberGameState = {
    currentMode: null,
    currentDifficulty: 'normal',
    currentRound: 1,
    score: 0,
    targetNumber: '',
    userInput: '',
    isGameActive: false,
    displayTimer: null,
    countdownTimer: null
};

const NUMBER_DIFFICULTY_MAP = {
    easy: { digits: 3, name: '쉬움 (3자리)' },
    normal: { digits: 4, name: '보통 (4자리)' },
    hard: { digits: 5, name: '어려움 (5자리)' },
    expert: { digits: 6, name: '전문가 (6자리)' }
};

// 숫자 게임 함수들
function selectNumberDifficulty(diff) {
    numberGameState.currentDifficulty = diff;
    // 버튼 스타일 업데이트
    const btns = document.querySelectorAll('.number-difficulty-buttons .btn-difficulty');
    btns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.number-difficulty-buttons .btn-difficulty.${diff}`).classList.add('active');
}

function selectNumberMode(mode) {
    numberGameState.currentMode = mode;
    document.getElementById('numberModeScreen').style.display = 'none';
    document.getElementById('numberStartScreen').style.display = 'block';
    
    let title = '';
    if (mode === 'practice') title = '연습 모드';
    if (mode === 'challenge') title = '도전 모드';
    document.getElementById('numberSelectedModeTitle').textContent = title;
}

function startNumberGame() {
    numberGameState.currentRound = 1;
    numberGameState.score = 0;
    numberGameState.isGameActive = true;
    
    document.getElementById('numberScore').textContent = '0';
    document.getElementById('numberRound').textContent = '1';
    
    const difficulty = NUMBER_DIFFICULTY_MAP[numberGameState.currentDifficulty];
    document.getElementById('numberDifficultyText').textContent = difficulty.name;
    
    document.getElementById('numberStartScreen').style.display = 'none';
    document.getElementById('numberGameArea').style.display = 'block';
    
    showNumberSequence();
}

function showNumberSequence() {
    const difficulty = NUMBER_DIFFICULTY_MAP[numberGameState.currentDifficulty];
    numberGameState.targetNumber = generateRandomNumber(difficulty.digits);
    
    const display = document.getElementById('numberDisplay');
    const countdown = document.getElementById('numberCountdown');
    const inputArea = document.getElementById('numberInputArea');
    const result = document.getElementById('numberResult');
    
    // 초기화
    inputArea.style.display = 'none';
    result.textContent = '';
    numberGameState.userInput = '';
    
    // 숫자 표시
    display.textContent = numberGameState.targetNumber;
    display.className = 'number-display';
    
    // 카운트다운 시작
    let timeLeft = 3;
    countdown.textContent = `${timeLeft}초 후 입력하세요`;
    
    numberGameState.countdownTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            countdown.textContent = `${timeLeft}초 후 입력하세요`;
        } else {
            countdown.textContent = '숫자를 입력하세요!';
            display.textContent = '?'.repeat(difficulty.digits);
            inputArea.style.display = 'block';
            clearInterval(numberGameState.countdownTimer);
        }
    }, 1000);
}

function generateRandomNumber(digits) {
    let number = '';
    for (let i = 0; i < digits; i++) {
        number += Math.floor(Math.random() * 10);
    }
    return number;
}

function inputNumber(digit) {
    if (!numberGameState.isGameActive) return;
    
    const difficulty = NUMBER_DIFFICULTY_MAP[numberGameState.currentDifficulty];
    if (numberGameState.userInput.length < difficulty.digits) {
        numberGameState.userInput += digit;
        updateNumberDisplay();
    }
}

function clearNumberInput() {
    numberGameState.userInput = '';
    updateNumberDisplay();
}

function updateNumberDisplay() {
    const display = document.getElementById('numberDisplay');
    const difficulty = NUMBER_DIFFICULTY_MAP[numberGameState.currentDifficulty];
    
    let displayText = numberGameState.userInput;
    while (displayText.length < difficulty.digits) {
        displayText += '_';
    }
    
    display.textContent = displayText;
}

function submitNumberAnswer() {
    if (!numberGameState.isGameActive) return;
    
    const difficulty = NUMBER_DIFFICULTY_MAP[numberGameState.currentDifficulty];
    if (numberGameState.userInput.length !== difficulty.digits) {
        alert('모든 숫자를 입력해주세요.');
        return;
    }
    
    const isCorrect = numberGameState.userInput === numberGameState.targetNumber;
    const result = document.getElementById('numberResult');
    const display = document.getElementById('numberDisplay');
    
    if (isCorrect) {
        numberGameState.score += difficulty.digits * 10;
        document.getElementById('numberScore').textContent = numberGameState.score;
        result.textContent = '정답입니다! 🎉';
        result.className = 'number-result number-correct';
        display.className = 'number-display number-correct';
        
        setTimeout(() => {
            nextNumberRound();
        }, 1500);
    } else {
        result.textContent = `틀렸습니다. 정답: ${numberGameState.targetNumber}`;
        result.className = 'number-result number-wrong';
        display.className = 'number-display number-wrong';
        
        setTimeout(() => {
            showNumberResult();
        }, 2000);
    }
}

function nextNumberRound() {
    numberGameState.currentRound++;
    document.getElementById('numberRound').textContent = numberGameState.currentRound;
    
    setTimeout(() => {
        showNumberSequence();
    }, 1000);
}

function showNumberResult() {
    numberGameState.isGameActive = false;
    
    const resultHTML = `
        <div class="number-result">
            <h2>🎯 게임 완료!</h2>
            <p>총 ${numberGameState.currentRound - 1}라운드 진행</p>
            <p>최종 점수: <span style='font-weight:bold;'>${numberGameState.score}점</span></p>
        </div>
        <div class="number-controls">
            <button class="btn btn-primary" onclick="restartNumberGame()">다시하기</button>
            <button class="btn btn-secondary" onclick="goToNumberModeSelect()">게임 선택으로</button>
        </div>
    `;
    
    document.getElementById('numberGameArea').innerHTML = resultHTML;
}

function restartNumberGame() {
    document.getElementById('numberModeScreen').style.display = 'block';
    document.getElementById('numberGameArea').style.display = 'none';
    document.getElementById('numberStartScreen').style.display = 'none';
}

function goToNumberModeSelect() {
    document.getElementById('numberModeScreen').style.display = 'block';
    document.getElementById('numberGameArea').style.display = 'none';
    document.getElementById('numberStartScreen').style.display = 'none';
}

// 페이지 로드시 게임 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing games...');
    try {
        selectStroopDifficulty('normal');
        selectMemoryDifficulty('normal');
        selectNumberDifficulty('normal');
        console.log('Games initialized successfully');
    } catch (error) {
        console.error('Error initializing games:', error);
    }
});

// 추가 안전장치: window.onload
window.addEventListener('load', function() {
    console.log('Window loaded, ensuring all resources are ready...');
    // CSS가 로드되었는지 확인
    if (document.querySelector('link[href*="style.css"]')) {
        console.log('CSS file found');
    } else {
        console.error('CSS file not found!');
    }
});
