/* =====================================================
   DASHBOARD.JS
   Runs only on pages/dashboard.html. This is the one file in
   the project that leans on a few more advanced JavaScript
   ideas — arrow functions, array methods (map/filter/reduce),
   object destructuring, template literals, and the spread
   operator (...) for copying/updating objects. Every function
   is still small and commented, but it's a step up from the
   plain loops used elsewhere in the project.

   Where the numbers come from (all frontend-only, no backend):
     - "registeredUser"   -> saved at Sign Up (auth.js)
     - "mockTestHistory"  -> saved every time a mock test ends (main.js)
     - "resourceClicks"   -> counted every time an "Explore"
                             button is clicked on a resource card
   ===================================================== */

const STORAGE_KEYS = {
  user: "registeredUser",
  loggedIn: "loggedInUser",
  history: "mockTestHistory",
  clicks: "resourceClicks",
};

// Small arrow-function helpers — each just reads one piece of
// data out of localStorage and gives it a sensible default.
const getUser = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.user)) || null;
const getHistory = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
const getClicks = () => parseInt(localStorage.getItem(STORAGE_KEYS.clicks)) || 0;

document.addEventListener("DOMContentLoaded", function () {
  const user = getUser();
  if (!user) return; // the inline guard script in <head> already redirects

  renderWelcome(user);
  renderStatsAndProgress();
  renderHistoryTable();
  renderProfile(user);
  setupProfileEditing(user);
});

/* ---------- WELCOME HEADER ---------- */
function renderWelcome(user) {
  const nameEl = document.getElementById("welcome-name");
  const subEl = document.getElementById("welcome-sub");
  if (nameEl) nameEl.textContent = `Welcome back, ${user.fullName.split(" ")[0]}!`;
  if (subEl) subEl.textContent = `${user.course} · Class of ${user.gradYear} · ${user.college}`;
}

/* ---------- READINESS CALCULATIONS ---------- */
// Four simple, explainable rules turn raw activity (clicks,
// quiz attempts) into a percentage per category. None of this
// is "real" — it's a frontend demo — but the math is genuine.
function calculateCategoryReadiness() {
  const history = getHistory();
  const clicks = getClicks();

  const aptitude = history.length > 0 ? 100 : 20;
  const codingDsa = Math.min(100, clicks * 15);
  const interview = Math.min(100, Math.max(0, (clicks - 3) * 20));
  const mockTests = Math.min(100, history.length * 25);

  return { aptitude, codingDsa, interview, mockTests };
}

function renderStatsAndProgress() {
  const { aptitude, codingDsa, interview, mockTests } = calculateCategoryReadiness();
  const history = getHistory();

  // Overall readiness = the average of the four categories,
  // calculated with reduce() instead of a manual running total.
  const categories = [aptitude, codingDsa, interview, mockTests];
  const overall = Math.round(categories.reduce((sum, value) => sum + value, 0) / categories.length);

  paintRing(overall);
  animateProgressBar("apt", aptitude);
  animateProgressBar("coding", codingDsa);
  animateProgressBar("interview", interview);
  animateProgressBar("mocktest", mockTests);

  // Scores are converted to "out of 10" so they're easy to
  // compare regardless of how many questions a test has.
  const scoresOutOf10 = history.map((attempt) => (attempt.score / attempt.total) * 10);

  const attemptsEl = document.getElementById("stat-attempts");
  const bestEl = document.getElementById("stat-best");
  const avgEl = document.getElementById("stat-avg");

  if (attemptsEl) attemptsEl.textContent = history.length;

  if (scoresOutOf10.length === 0) {
    if (bestEl) bestEl.textContent = "—";
    if (avgEl) avgEl.textContent = "—";
  } else {
    const best = Math.max(...scoresOutOf10).toFixed(1);
    const average = (scoresOutOf10.reduce((sum, s) => sum + s, 0) / scoresOutOf10.length).toFixed(1);
    if (bestEl) bestEl.textContent = best + "/10";
    if (avgEl) avgEl.textContent = average + "/10";
  }
}

// Paints the circular ring using a CSS conic-gradient built
// entirely in JavaScript — the percentage decides where the
// teal portion of the circle stops and the empty track begins.
function paintRing(percent) {
  const ring = document.getElementById("readiness-ring");
  const label = document.getElementById("readiness-percent");
  if (!ring || !label) return;

  ring.style.background = `conic-gradient(var(--teal) ${percent}%, var(--border) ${percent}% 100%)`;
  label.textContent = percent + "%";
}

// Animates a progress bar's width and updates its percentage
// label. The 50ms delay lets the browser register the starting
// width of 0% before transitioning, so the CSS transition plays.
function animateProgressBar(prefix, percent) {
  const fill = document.getElementById(prefix + "-fill");
  const label = document.getElementById(prefix + "-percent");
  if (label) label.textContent = percent + "%";
  if (fill) {
    setTimeout(function () {
      fill.style.width = percent + "%";
    }, 50);
  }
}

/* ---------- MOCK TEST HISTORY TABLE ---------- */
function renderHistoryTable() {
  const tableBody = document.getElementById("history-body");
  const emptyMsg = document.getElementById("history-empty");
  if (!tableBody) return;

  const history = getHistory();

  if (history.length === 0) {
    tableBody.innerHTML = "";
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";

  // .map() turns each attempt object into a table row, and
  // .join("") glues all the rows into one HTML string.
  tableBody.innerHTML = history
    .map(function (attempt) {
      const { date, score, total } = attempt; // object destructuring
      const percent = Math.round((score / total) * 100);
      const pillClass = percent >= 60 ? "" : "low";

      return `
        <tr>
          <td>${date}</td>
          <td>Aptitude Mock Test</td>
          <td>${score} / ${total}</td>
          <td><span class="score-pill ${pillClass}">${percent}%</span></td>
        </tr>
      `;
    })
    .join("");
}

/* ---------- PROFILE CARD ---------- */
function renderProfile(user) {
  const fields = {
    "profile-name": user.fullName,
    "profile-email": user.email,
    "profile-phone": user.phone,
    "profile-college": user.college,
    "profile-course": user.course,
    "profile-year": user.gradYear,
  };

  // Object.entries + forEach loops over every {id: value} pair
  // above and writes it into the matching element on the page.
  Object.entries(fields).forEach(function ([id, value]) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function setupProfileEditing(user) {
  const editBtn = document.getElementById("edit-profile-btn");
  const cancelBtn = document.getElementById("cancel-edit-btn");
  const form = document.getElementById("edit-profile-form");
  const view = document.getElementById("profile-view");

  if (!editBtn || !form || !view) return;

  editBtn.addEventListener("click", function () {
    document.getElementById("edit-college").value = user.college;
    document.getElementById("edit-course").value = user.course;
    document.getElementById("edit-year").value = user.gradYear;

    view.classList.add("hide");
    form.classList.add("show");
  });

  cancelBtn.addEventListener("click", function () {
    form.classList.remove("show");
    view.classList.remove("hide");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // The spread operator (...user) copies every existing field,
    // then the three new values overwrite just college/course/year —
    // simpler than rebuilding the whole user object by hand.
    const updatedUser = {
      ...user,
      college: document.getElementById("edit-college").value.trim(),
      course: document.getElementById("edit-course").value.trim(),
      gradYear: document.getElementById("edit-year").value,
    };

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    user = updatedUser;

    renderProfile(updatedUser);
    renderWelcome(updatedUser);

    form.classList.remove("show");
    view.classList.remove("hide");
  });
}
