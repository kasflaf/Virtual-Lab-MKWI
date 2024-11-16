/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
  document.getElementById("Sidenav").style.width = "250px";
  const overlay = document.getElementById("overlay");
  overlay.style.opacity = "1"; // Set opacity to 1 for fade-in
  overlay.style.visibility = "visible"; // Make it visible
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
  document.getElementById("Sidenav").style.width = "0";
  const overlay = document.getElementById("overlay");
  overlay.style.opacity = "0"; // Set opacity to 0 for fade-out
  overlay.style.visibility = "hidden"; // Hide it
}

function updateNavigation() {
  const user = localStorage.getItem("user");
  const loginLinksMobile = document.querySelectorAll(
    "#login-link-mobile, #signup-link-mobile",
  );
  const loginLinksDesktop = document.querySelectorAll(
    "#login-link, #signup-link",
  );
  const logoutLinks = document.querySelectorAll("#logout-link");
  const deleteAccountLinks = document.querySelectorAll("#delete-account");

  if (user) {
    loginLinksMobile.forEach((link) => link.style.display = "none");
    loginLinksDesktop.forEach((link) => link.style.display = "none");
    logoutLinks.forEach((link) => link.style.display = "block");
    deleteAccountLinks.forEach((link) => link.style.display = "block");
  } else {
    loginLinksMobile.forEach((link) => link.style.display = "block");
    loginLinksDesktop.forEach((link) => link.style.display = "block");
    logoutLinks.forEach((link) => link.style.display = "none");
    deleteAccountLinks.forEach((link) => link.style.display = "none");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateNavigation();

  // Add event listeners for Logout and Delete Account
  document.getElementById("logout-link").addEventListener(
    "click",
    function (e) {
      e.preventDefault();
      closeNav();
      showConfirmationModal("Are you sure you want to log out?", "logout");
    },
  );

  document.getElementById("delete-account").addEventListener(
    "click",
    function (e) {
      e.preventDefault();
      closeNav();
      showConfirmationModal(
        "Are you sure you want to delete your account? This action is irreversible.",
        "delete",
      );
    },
  );

 // Add event listeners for Logout and Delete Account
 document.getElementById("logout-link-d").addEventListener(
  "click",
  function (e) {
    e.preventDefault();
    closeNav();
    showConfirmationModal("Are you sure you want to log out?", "logout");
  },
);

document.getElementById("delete-account-d").addEventListener(
  "click",
  function (e) {
    e.preventDefault();
    closeNav();
    showConfirmationModal(
      "Are you sure you want to delete your account? This action is irreversible.",
      "delete",
    );
  },
);

  // Close modal
  document.getElementById("close-modal").addEventListener(
    "click",
    closeConfirmationModal,
  );

  // Handle confirmation actions
  document.getElementById("confirm-action").addEventListener(
    "click",
    function () {
      const action =
        document.getElementById("confirmation-message").dataset.action;
      if (action === "logout") {
        handleLogout();
      } else if (action === "delete") {
        handleDeleteAccount();
      }
      closeConfirmationModal();
    },
  );

  document.getElementById("cancel-action").addEventListener(
    "click",
    closeConfirmationModal,
  );
});

// Show confirmation modal with appropriate message
function showConfirmationModal(message, action) {
  const modal = document.getElementById("confirmation-modal");
  const messageElement = document.getElementById("confirmation-message");
  messageElement.innerText = message;
  messageElement.dataset.action = action; // Store action type in data attribute
  modal.style.display = "block";
}

// Close confirmation modal
function closeConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  modal.style.display = "none";
}

// Handle logout
async function handleLogout() {
  try {
    const response = await fetch("http://128.199.65.6:5000/logout", {
      method: "POST",
      credentials: "include", // Ensure cookies are sent along with the request
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem("user");
      if (window.location.pathname === "/index.html") {
        window.location.reload();
      } else {
        window.location.href = "../index.html";
      }
    } else {
      alert(data.error || "Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("An error occurred during logout. Please try again later.");
  }
}

// Handle account deletion
async function handleDeleteAccount() {
  try {
    const response = await fetch("http://128.199.65.6:5000/delete-account", {
      method: "DELETE",
      credentials: "include", // Include cookies with the request
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem("user");
      if (window.location.pathname === "/index.html") {
        window.location.reload();
      } else {
        window.location.href = "../index.html";
      }
    } else {
      alert(data.message || "Error deleting account. Please try again.");
    }
  } catch (error) {
    console.error("Error during account deletion:", error);
    alert("An error occurred. Please try again later.");
  }
}
