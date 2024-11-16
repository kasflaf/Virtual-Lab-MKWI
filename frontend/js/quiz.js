const questions = [
  {
    type: "fill-in-the-blank",
    question: "The capital of France is _______.",
    answer: "Paris",
  },
  {
    type: "multiple-choice",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: "Mars",
  },
  {
    type: "fill-in-the-blank",
    question: "Water boils at _______ degrees Celsius at sea level.",
    answer: "100",
  },
  {
    type: "multiple-choice",
    question: "Who painted the Mona Lisa?",
    options: [
      "Vincent van Gogh",
      "Leonardo da Vinci",
      "Pablo Picasso",
      "Michelangelo",
    ],
    answer: "Leonardo da Vinci",
  },
];

let currentQuestionIndex = 0;
let score = 0;
let quizCompleted = false;

const questionContainer = document.getElementById("question-container");
const questionText = document.getElementById("question-text");
const answerOptions = document.getElementById("answer-options");
const submitBtn = document.getElementById("submit-btn");
const resultContainer = document.getElementById("result-container");
const resultText = document.getElementById("result-text");
const nextBtn = document.getElementById("next-btn");
const finishBtn = document.getElementById("finish-btn");
const scoreDisplay = document.getElementById("score-display");
const quizForm = document.getElementById("quiz-form");

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.question;
  answerOptions.innerHTML = "";

  if (question.type === "fill-in-the-blank") {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "answer-input";
    input.required = true;
    answerOptions.appendChild(input);
  } else if (question.type === "multiple-choice") {
    question.options.forEach((option, index) => {
      const div = document.createElement("div");
      div.className = "answer-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.id = `option-${index}`;
      input.value = option;
      input.required = true;
      const label = document.createElement("label");
      label.htmlFor = `option-${index}`;
      label.textContent = option;
      div.appendChild(input);
      div.appendChild(label);
      answerOptions.appendChild(div);
    });
  }

  submitBtn.textContent = "Submit Answer";
  questionContainer.style.display = "block";
  resultContainer.style.display = "none";
}

function checkAnswer(event) {
  event.preventDefault();

  if (quizCompleted) {
    // If quiz is completed and home button is clicked
    window.location.reload();
    return;
  }

  const question = questions[currentQuestionIndex];
  let userAnswer;
  let isCorrect = false;

  if (question.type === "fill-in-the-blank") {
    userAnswer = document.getElementById("answer-input").value.trim();
    isCorrect = userAnswer.toLowerCase() === question.answer.toLowerCase();
  } else if (question.type === "multiple-choice") {
    const selectedOption = document.querySelector(
      'input[name="answer"]:checked',
    );
    if (selectedOption) {
      userAnswer = selectedOption.value;
      isCorrect = userAnswer === question.answer;
    }
  }

  if (isCorrect) {
    score += 10;
    resultText.textContent = "Correct! +10 points";
    resultText.style.color = "green";
  } else {
    resultText.textContent =
      `Incorrect. The correct answer is: ${question.answer}`;
    resultText.style.color = "red";
  }

  scoreDisplay.textContent = `Total Score: ${score}`;
  questionContainer.style.display = "none";
  resultContainer.style.display = "block";

  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.style.display = "none";
    finishBtn.style.display = "inline-block";
  } else {
    nextBtn.style.display = "inline-block";
    finishBtn.style.display = "none";
  }
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  quizCompleted = true;
  updateScore(); // Update the score in the backend
  location.href = "./leaderboard.html";
}

quizForm.addEventListener("submit", checkAnswer);
nextBtn.addEventListener("click", nextQuestion);
finishBtn.addEventListener("click", finishQuiz);

async function getScore() {
  try {
    const response = await fetch("http://128.199.65.6/get-score", {
      method: "GET",
      credentials: "include", // Include cookies for authentication
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      score = data.score; // Update the score variable with the backend value
      scoreDisplay.textContent = `Total Score: ${score}`; // Update the displayed score
    } else {
      console.error("Failed to fetch score from backend:", response.statusText);
    }
  } catch (error) {
    console.error("Error while fetching score:", error);
  }
}

async function updateScore() {
  try {
    const response = await fetch("http://128.199.65.6/update-score", {
      method: "PUT",
      credentials: "include", // Include cookies for authentication
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ score }),
    });

    if (!response.ok) {
      console.log("UPDATE SUCCESS");
    }
  } catch (error) {
    console.error("Error while updating score:", error);
  }
}

window.onload = function () {
  getScore(); // Fetch score from backend on page load
  displayQuestion(); // Display the first question
};
