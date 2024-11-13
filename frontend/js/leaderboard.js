const leaderboardData = [
    { rank: 1, username: "JohnDoe", score: 1000 },
    { rank: 2, username: "JaneSmith", score: 950 },
    { rank: 3, username: "BobJohnson", score: 900 },
    { rank: 4, username: "AliceWilliams", score: 850 },
    { rank: 5, username: "CharlieBrown", score: 800 },
    { rank: 6, username: "DavidMiller", score: 750 },
    { rank: 7, username: "EvaGreen", score: 700 },
    { rank: 8, username: "FrankWhite", score: 650 },
    { rank: 9, username: "GraceYoung", score: 600 },
    { rank: 10, username: "HenryTaylor", score: 550 },
];

function populateLeaderboard() {
    const leaderboardBody = document.querySelector("#leaderboard tbody");
    leaderboardBody.innerHTML = "";

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

document.addEventListener("DOMContentLoaded", populateLeaderboard);