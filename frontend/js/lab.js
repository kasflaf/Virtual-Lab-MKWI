// Define your quiz questions as an array of objects
const questions = [
    {
        question: "What is the past tense of 'go'?",
        options: ["goed", "went", "going", "gone"],
        correctAnswer: 1 // Index of the correct answer
    },
    {
        question: "Which of the following is a synonym for 'happy'?",
        options: ["sad", "joyful", "angry", "tired"],
        correctAnswer: 1
    },
    {
        question: "What is the plural form of 'child'?",
        options: ["childs", "children", "childes", "kids"],
        correctAnswer: 1
    },
    {
        question: "Which word is an antonym of 'difficult'?",
        options: ["easy", "hard", "complex", "complicated"],
        correctAnswer: 0
    },
    {
        question: "What is the main verb in the sentence: 'She loves to read books'?",
        options: ["She", "loves", "to", "read"],
        correctAnswer: 1
    }
];

let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const questionText = document.getElementById('soal');
const optionButtons = document.querySelectorAll('.quiz-option');
const nextButton = document.getElementById('nextbtn');
const restartButton = document.getElementById('restartbtn');
const scoreDisplay = document.getElementById('score-display');

// Load a question to the quiz
function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    optionButtons.forEach((button, index) => {
        button.textContent = currentQuestion.options[index];
        button.disabled = false;
        button.style.backgroundColor = ""; // Reset background color
    });
    updateScoreDisplay();
}

// Check the selected answer
function selectAnswer(optionIndex) {
    const currentQuestion = questions[currentQuestionIndex];
    if (optionIndex === currentQuestion.correctAnswer) {
        score++;
        optionButtons[optionIndex].style.backgroundColor = "#2ecc71"; // Green for correct
    } else {
        optionButtons[optionIndex].style.backgroundColor = "#e74c3c"; // Red for incorrect
        optionButtons[currentQuestion.correctAnswer].style.backgroundColor = "#2ecc71"; // Show correct answer
    }
    optionButtons.forEach(button => button.disabled = true); // Disable buttons after selection
    updateScoreDisplay();
}

// Move to the next question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        questionText.textContent = "Quiz finished!";
        optionButtons.forEach(button => button.style.display = 'none');
        nextButton.disabled = true;
        updateScoreDisplay();
    }
}

// Restart the quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.disabled = false;
    optionButtons.forEach(button => button.style.display = '');
    loadQuestion();
}

// Update the score display
function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score} / ${questions.length}`;
}

// Event listeners for buttons
optionButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectAnswer(index));
});

nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', restartQuiz);

// Initialize the first question when the page loads
loadQuestion();