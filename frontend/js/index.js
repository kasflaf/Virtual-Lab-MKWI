/* START BUTTON */
// Check if user is logged in
function setupStartButton() {
  const startButton = document.getElementById("startbtn");

  // Get username from local storage
  const token = localStorage.getItem("user");

  // Redirect based on login status
  if (token) {
    // If token exists, set the button to redirect to lab.html
    startButton.onclick = function () {
      location.href = "./page/quiz.html";
    };
  } else {
    // If no token, set the button to redirect to login.html
    startButton.onclick = function () {
      location.href = "./page/login.html";
    };
  }
}

// Call setup function when the page loads
window.onload = setupStartButton;
