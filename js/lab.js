// Define your quiz questions as an array of objects
const questions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        correctAnswer: 2 // Index of the correct answer
    },
    {
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: 2
    },
    {
        question: "Which element has the chemical symbol 'O'?",
        options: ["Oxygen", "Gold", "Iron", "Osmium"],
        correctAnswer: 0
    }
];

let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const questionText = document.getElementById('soal');
const optionButtons = document.querySelectorAll('.quiz-option');
const nextButton = document.getElementById('nextbtn');
const restartButton = document.getElementById('restartbtn');

// Load a question to the quiz
function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    optionButtons.forEach((button, index) => {
        button.textContent = currentQuestion.options[index];
        button.disabled = false;
        button.style.backgroundColor = ""; // Reset background color
    });
}

// Check the selected answer
function selectAnswer(optionIndex) {
    const currentQuestion = questions[currentQuestionIndex];
    if (optionIndex === currentQuestion.correctAnswer) {
        score++;
        optionButtons[optionIndex].style.backgroundColor = "green"; // Highlight correct answer
    } else {
        optionButtons[optionIndex].style.backgroundColor = "red"; // Highlight incorrect answer
        optionButtons[currentQuestion.correctAnswer].style.backgroundColor = "green"; // Show correct answer
    }
    optionButtons.forEach(button => button.disabled = true); // Disable buttons after selection
}

// Move to the next question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        questionText.textContent = `Quiz finished! Your score: ${score} / ${questions.length}`;
        nextButton.disabled = true;
    }
}

// Restart the quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.disabled = false;
    loadQuestion();
}

// Event listeners for buttons
optionButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectAnswer(index));
});

nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', restartQuiz);

// Initialize the first question when the page loads
loadQuestion();
