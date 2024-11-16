// signup.js

document.getElementById("signup-form").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Check if passwords match
    if (password !== confirmPassword) {
      document.getElementById("error-message").innerText =
        "Passwords do not match!";
      document.getElementById("error-message").style.display = "block";
      return;
    }

    try {
      const response = await fetch("http://128.199.65.6:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login page after successful registration
        window.location.href = "./login.html"; // Redirect to login page
      } else {
        // Show error message
        document.getElementById("error-message").innerText = data.error;
        document.getElementById("error-message").style.display = "block";
        document.getElementById("success-message").style.display = "none";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("error-message").innerText =
        "An error occurred. Please try again later.";
      document.getElementById("error-message").style.display = "block";
      document.getElementById("success-message").style.display = "none";
    }
  },
);
