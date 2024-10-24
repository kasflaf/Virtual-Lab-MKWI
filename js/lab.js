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
