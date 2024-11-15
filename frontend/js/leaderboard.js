async function fetchLeaderboard() {
  try {
    const response = await fetch("http://localhost:5000/leaderboard");
    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard data");
    }

    const leaderboardData = await response.json();
    populateLeaderboard(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }
}

function populateLeaderboard(leaderboardData) {
  const leaderboardBody = document.querySelector("#leaderboard tbody");
  leaderboardBody.innerHTML = ""; // Clear existing table rows

  leaderboardData.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.rank}</td>
      <td>${entry.username}</td>
      <td>${entry.score}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

  // Fetch the logged-in user's score and display it if logged in
  async function fetchUserScore() {
    try {
      const response = await fetch("http://localhost:5000/get-score", {
        method: "GET",
        credentials: "include" // Include cookies (if using session-based auth)
      });

      if (response.ok) {
        const data = await response.json();
        const score = data.score;

        // Show the score section and set the score
        document.getElementById("user-score-section").style.display = "block";
        document.getElementById("user-score").textContent = score;
      } else {
        // If the user is not logged in or there's an error fetching the score, hide the section
        document.getElementById("user-score-section").style.display = "none";
      }
    } catch (error) {
      console.error("Error fetching user score:", error);
    }
  }

// Fetch leaderboard when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchLeaderboard();
  fetchUserScore();
});