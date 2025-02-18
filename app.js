document.addEventListener('DOMContentLoaded', () => {
    const questionContainer = document.getElementById('questionContainer');
    const answersContainer = document.getElementById('answersContainer');
    const progressFill = document.getElementById('progressFill');
    const timeLeft = document.getElementById('timeLeft');
    const startBtn = document.getElementById('startBtn');
    const totalText = document.getElementById('totalQuestions');
    const questionNum = document.getElementById('questionNum');
    const levelSelect = document.getElementById('level');
    const themeToggle = document.getElementById('themeToggle');
    const leaderboardContent = document.getElementById('leaderboardContent');
    const feedbackForm = document.getElementById('feedbackForm');

    let currentLevel = levelSelect.value;
    let currentQuestionIndex = 0;
    let score = 0;
    let timeLeftValue = 30;
    let timerInterval;
    let isTimerRunning = false;
    let isQuizOver = false;
    let isAnswered = false;
    let quizData = [];
    let filteredQuizData = [];
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Load questions
    fetch('./Helpers/questions.json')
        .then(response => response.json())
        .then(data => {
            quizData = data;
            filteredQuizData = filterQuestionsByLevel(quizData, currentLevel);
            totalText.textContent = filteredQuizData.length;
        })
        .catch(error => console.error('Erreur de chargement des questions :', error));

    // Event Listeners
    levelSelect.addEventListener('change', () => {
        currentLevel = levelSelect.value;
        filteredQuizData = filterQuestionsByLevel(quizData, currentLevel);
        totalText.textContent = filteredQuizData.length;
    });

    startBtn.addEventListener('click', startQuiz);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Thème Clair' : 'Thème Sombre';
    });

    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Merci pour votre feedback !');
        feedbackForm.reset();
    });

    // Start quiz
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        timeLeftValue = 30;
        stopTimer(); // Ensure timer stops before restarting
        startTimer();
        filteredQuizData = filterQuestionsByLevel(quizData, currentLevel);
        questionContainer.style.display = 'block';
        feedbackForm.style.display = 'none';
        displayQuestion(currentQuestionIndex);
    }

    function displayQuestion(questionIndex) {
        if (questionIndex >= filteredQuizData.length) {
            endQuiz();
            return;
        }

        const questionData = filteredQuizData[questionIndex];
        document.getElementById('questionText').textContent = questionData.question;

        answersContainer.innerHTML = '';
        questionData.answers.forEach((answer, index) => {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer';
            input.id = `answer${index + 1}`;
            input.value = answer;

            const label = document.createElement('label');
            label.htmlFor = `answer${index + 1}`;
            label.textContent = answer;

            answerDiv.appendChild(input);
            answerDiv.appendChild(label);
            answersContainer.appendChild(answerDiv);

            input.addEventListener('click', () => handleAnswer(questionData.correctAnswer === answer, label));
        });

        updateProgressBar(questionIndex + 1, filteredQuizData.length);
        questionNum.textContent = questionIndex + 1;
    }

    function handleAnswer(isCorrect, selectedAnswer) {
        if (isAnswered) return;

        isAnswered = true;
        document.querySelectorAll('input[name="answer"]').forEach(input => input.disabled = true);

        if (isCorrect) {
            score++;
            selectedAnswer.classList.add('correct');
        } else {
            selectedAnswer.classList.add('incorrect');
        }

        setTimeout(() => {
            currentQuestionIndex++;
            isAnswered = false;
            displayQuestion(currentQuestionIndex);
        }, 1500);
    }

    function startTimer() {
        if (isTimerRunning) return;

        isTimerRunning = true;
        timerInterval = setInterval(() => {
            timeLeftValue--;
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        timeLeft.textContent = timeLeftValue;
        if (timeLeftValue <= 0) {
            endQuiz();
            return;
        }
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }

    function updateProgressBar(current, total) {
        const progressPercentage = (current / total) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }

    function endQuiz() {
        isQuizOver = true;
        stopTimer();
        questionContainer.style.display = 'none';
        feedbackForm.style.display = 'block';
        updateLeaderboard(score);
        alert(`Quiz terminé ! Votre score est ${score} / ${filteredQuizData.length}`);
    }

    function updateLeaderboard(score) {
        leaderboard.push(score);
        leaderboard.sort((a, b) => b - a);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        renderLeaderboard();
    }

    function renderLeaderboard() {
        leaderboardContent.innerHTML = leaderboard.map((score, index) => `
            <div>${index + 1}. ${score} points</div>
        `).join('');
    }

    function filterQuestionsByLevel(questions, level) {
        if (level === 'All') {
            return questions;
        } else if (level === 'Beginner') {
            return questions.filter(question => question.level === 'Beginner' || question.level === 'BeginnerSubLevel1');
        } else {
            return questions.filter(question => question.level === level);
        }
    }

    renderLeaderboard();
});