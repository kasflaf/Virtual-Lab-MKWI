document.getElementById("login-form").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://128.199.65.6/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", username);

        // alert(data.message); // Success message
        window.location.href = "../index.html"; // Redirect if needed
      } else {
        // Show the error message on the page
        document.getElementById("error-message").innerText = data.message;
        document.getElementById("error-message").style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      //   alert("An error occurred. Please try again later.");
    }
  },
);
