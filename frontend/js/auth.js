// Simulating authentication state
let isLoggedIn = false;
let currentUser = null;

function updateNavigation() {
    const loginLinkMobile = document.getElementById('login-link-mobile');
    const loginLinkDesktop = document.getElementById('login-link');
    const signupLinkMobile = document.getElementById('signup-link-mobile');
    const signupLinkDesktop = document.getElementById('signup-link');
    const logoutLinkMobile = document.getElementById('logout-link-mobile');
    const logoutLinkDesktop = document.getElementById('logout-link');
    const usernameMobile = document.getElementById('username-mobile');
    const usernameDesktop = document.getElementById('username-desktop');
    const userInfoMobile = document.querySelector('.phone-header .user-info');
    const userInfoDesktop = document.querySelector('.desktop-header .user-info');

    if (isLoggedIn) {
        loginLinkMobile.style.display = 'none';
        loginLinkDesktop.style.display = 'none';
        signupLinkMobile.style.display = 'none';
        signupLinkDesktop.style.display = 'none';
        logoutLinkMobile.style.display = 'block';
        logoutLinkDesktop.style.display = 'block';
        userInfoMobile.style.display = 'flex';
        userInfoDesktop.style.display = 'flex';
        usernameMobile.textContent = currentUser;
        usernameDesktop.textContent = currentUser;
    } else {
        loginLinkMobile.style.display = 'block';
        loginLinkDesktop.style.display = 'block';
        signupLinkMobile.style.display = 'block';
        signupLinkDesktop.style.display = 'block';
        logoutLinkMobile.style.display = 'none';
        logoutLinkDesktop.style.display = 'none';
        userInfoMobile.style.display = 'none';
        userInfoDesktop.style.display = 'none';
    }
}

function login(username) {
    isLoggedIn = true;
    currentUser = username;
    updateNavigation();
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    updateNavigation();
}

// Event listeners for login and logout
document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    login('JohnDoe'); // Simulating login with a hardcoded username
});

document.getElementById('login-link-mobile').addEventListener('click', (e) => {
    e.preventDefault();
    login('JohnDoe'); // Simulating login with a hardcoded username
});

document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

document.getElementById('logout-link-mobile').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Initialize navigation state
updateNavigation();


// Existing code...

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Here you would typically send a request to your server to authenticate the user
    // For this example, we'll just simulate a successful login
    login(username);
    alert('Login successful!');
    window.location.href = 'index.html';
}

function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Here you would typically send a request to your server to create a new user
    // For this example, we'll just simulate a successful signup
    login(username);
    alert('Sign up successful!');
    window.location.href = 'index.html';
}

function handleResetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    // Here you would typically send a request to your server to initiate the password reset process
    // For this example, we'll just simulate a successful password reset request
    alert(`Password reset link sent to ${email}. Please check your email.`);
    window.location.href = 'login.html';
}

// Add event listeners for login, signup, and reset password forms
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
}

const resetPasswordForm = document.getElementById('reset-password-form');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', handleResetPassword);
}

// Existing code...