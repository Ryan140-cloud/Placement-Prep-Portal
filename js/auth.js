/* =====================================================
   AUTH.JS
   Handles: CAPTCHA, Sign Up, Sign In, Show/Hide password.

   IMPORTANT (for viva): this is a FRONTEND-ONLY demo. There
   is no server or database. Every account is saved as a plain
   JavaScript object in one array, localStorage key "users",
   so many students can sign up in the same browser. Sign Up
   refuses an email that's already in the list, and login
   finds the account by email and compares the password. This
   is fine to demonstrate the idea of authentication, but is
   NOT secure enough for a real, production website (passwords
   should never be stored in plain text on a real system).

   (Older versions kept a single user in "registeredUser";
   main.js moves that user into "users" automatically.)
   ===================================================== */

/* ---------- ACCOUNTS ---------- */
function getUsers() {
  const users = JSON.parse(localStorage.getItem("users"));
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Emails are compared in lower case, so "Asha@Mail.com" and
// "asha@mail.com" count as the same account.
function findUserByEmail(email) {
  const target = email.toLowerCase();
  const match = getUsers().find(function (user) {
    return user.email && user.email.toLowerCase() === target;
  });
  return match || null;
}

/* ---------- CAPTCHA ---------- */
function generateCaptcha() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I, avoids confusion
  let captcha = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    captcha += characters[randomIndex];
  }
  return captcha;
}

function refreshCaptcha(displayId) {
  const display = document.getElementById(displayId);
  if (!display) return;
  const newCaptcha = generateCaptcha();
  display.textContent = newCaptcha;
  display.setAttribute("data-captcha", newCaptcha);
}

// Briefly shakes the CAPTCHA box — used whenever the entered
// code turns out to be wrong, as a bit of visual feedback.
function shakeCaptcha(displayId) {
  const display = document.getElementById(displayId);
  if (!display) return;
  display.classList.add("shake");
  setTimeout(function () {
    display.classList.remove("shake");
  }, 400);
}

/* ---------- SHOW / HIDE PASSWORD ---------- */
function setupPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      const targetId = toggle.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        toggle.textContent = "Hide";
      } else {
        input.type = "password";
        toggle.textContent = "Show";
      }
    });
  });
}

/* ---------- VALIDATION HELPERS ---------- */
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + "-error");
  if (input) input.classList.add("invalid");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + "-error");
  if (input) input.classList.remove("invalid");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }
}

function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function isValidPhone(phone) {
  const pattern = /^[0-9]{10}$/;
  return pattern.test(phone);
}

/* ---------- SIGN UP ---------- */
function setupSignupForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  refreshCaptcha("signup-captcha");

  const refreshBtn = document.getElementById("signup-captcha-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      refreshCaptcha("signup-captcha");
    });
  }

  setupPasswordToggles();

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isFormValid = true;

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const college = document.getElementById("college").value.trim();
    const course = document.getElementById("course").value.trim();
    const gradYear = document.getElementById("gradYear").value;
    const terms = document.getElementById("terms").checked;
    const captchaInput = document.getElementById("captchaInput").value.trim();
    const captchaDisplay = document.getElementById("signup-captcha");

    ["fullName", "email", "phone", "password", "confirmPassword", "college", "course", "gradYear", "captchaInput"]
      .forEach(clearError);

    if (fullName === "") {
      showError("fullName", "Please enter your full name.");
      isFormValid = false;
    }

    if (!isValidEmail(email)) {
      showError("email", "Please enter a valid email address.");
      isFormValid = false;
    } else if (findUserByEmail(email)) {
      showError("email", "An account with this email already exists. Please sign in.");
      isFormValid = false;
    }

    if (!isValidPhone(phone)) {
      showError("phone", "Please enter a valid 10-digit phone number.");
      isFormValid = false;
    }

    if (password.length < 6) {
      showError("password", "Password must be at least 6 characters.");
      isFormValid = false;
    }

    if (confirmPassword !== password || confirmPassword === "") {
      showError("confirmPassword", "Passwords do not match.");
      isFormValid = false;
    }

    if (college === "") {
      showError("college", "Please enter your college.");
      isFormValid = false;
    }

    if (course === "") {
      showError("course", "Please enter your course.");
      isFormValid = false;
    }

    if (gradYear === "") {
      showError("gradYear", "Please select your graduation year.");
      isFormValid = false;
    }

    if (!terms) {
      alert("Please accept the Terms & Conditions to continue.");
      isFormValid = false;
    }

    if (captchaInput.toUpperCase() !== captchaDisplay.getAttribute("data-captcha")) {
      showError("captchaInput", "Please enter the correct CAPTCHA.");
      shakeCaptcha("signup-captcha");
      isFormValid = false;
    }

    if (!isFormValid) {
      refreshCaptcha("signup-captcha");
      return;
    }

    const user = {
      fullName: fullName,
      email: email,
      phone: phone,
      password: password, // demo only — see note at top of file
      college: college,
      course: course,
      gradYear: gradYear,
    };

    // concat() returns a new array with the new user added at the end.
    saveUsers(getUsers().concat([user]));

    const alertBox = document.getElementById("signup-alert");
    alertBox.textContent = "Account created successfully! Redirecting to Sign In...";
    alertBox.classList.remove("error");
    alertBox.classList.add("success", "show");

    setTimeout(function () {
      window.location.href = "login.html";
    }, 1500);
  });
}

/* ---------- SIGN IN ---------- */
// Returns the signed-in session object, or null if nobody is
// signed in. Older sessions stored just the email as a plain
// string, so if JSON.parse fails we wrap that string instead.
function getLoggedInUser() {
  const raw = localStorage.getItem("loggedInUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { email: raw };
  }
}

// Prefills the email box if "Remember Me" was ticked last time.
function prefillRememberedEmail() {
  const raw = localStorage.getItem("rememberMe");
  if (!raw) return;
  let remembered = null;
  try {
    remembered = JSON.parse(raw);
  } catch (error) {
    return;
  }
  if (remembered && remembered.email) {
    document.getElementById("loginEmail").value = remembered.email;
    document.getElementById("rememberMe").checked = true;
  }
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  refreshCaptcha("login-captcha");

  const refreshBtn = document.getElementById("login-captcha-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      refreshCaptcha("login-captcha");
    });
  }

  setupPasswordToggles();

  // Already signed in? Skip the login page entirely.
  if (getLoggedInUser()) {
    window.location.replace("dashboard.html");
    return;
  }

  prefillRememberedEmail();

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isFormValid = true;

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const captchaInput = document.getElementById("loginCaptchaInput").value.trim();
    const captchaDisplay = document.getElementById("login-captcha");
    const rememberMe = document.getElementById("rememberMe").checked;
    const alertBox = document.getElementById("login-alert");

    ["loginEmail", "loginPassword", "loginCaptchaInput"].forEach(clearError);
    alertBox.classList.remove("show", "success", "error");

    if (!isValidEmail(email)) {
      showError("loginEmail", "Please enter a valid email.");
      isFormValid = false;
    }

    if (password === "") {
      showError("loginPassword", "Please enter your password.");
      isFormValid = false;
    }

    if (captchaInput.toUpperCase() !== captchaDisplay.getAttribute("data-captcha")) {
      showError("loginCaptchaInput", "Please enter the correct CAPTCHA.");
      shakeCaptcha("login-captcha");
      isFormValid = false;
    }

    if (!isFormValid) {
      refreshCaptcha("login-captcha");
      return;
    }

    const savedUser = findUserByEmail(email);

    if (savedUser && savedUser.password === password) {
      // Session copy of the profile — the password is never included.
      const session = {
        fullName: savedUser.fullName,
        email: savedUser.email,
        college: savedUser.college,
        course: savedUser.course,
        gradYear: savedUser.gradYear,
        githubUsername: savedUser.githubUsername || "",
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem("loggedInUser", JSON.stringify(session));

      if (rememberMe) {
        localStorage.setItem("rememberMe", JSON.stringify({ email: savedUser.email }));
      } else {
        localStorage.removeItem("rememberMe");
      }

      alertBox.textContent = "Login successful!";
      alertBox.classList.add("success", "show");

      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 1200);
    } else {
      alertBox.textContent = "Invalid email or password.";
      alertBox.classList.add("error", "show");
      refreshCaptcha("login-captcha");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupSignupForm();
  setupLoginForm();
});
