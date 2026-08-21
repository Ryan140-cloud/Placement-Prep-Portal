/* =====================================================
   MAIN.JS
   General site-wide functionality:
     1. Loading screen
     2. Hamburger menu
     3. Active navigation link
     4. Logout (works from any page)
     5. Nav auth state (Sign In/Up vs Logout)
     6. Homepage search bar -> resources page
     7. Resources page search/filter
     8. Company preparation cards
     9. Aptitude Mock Test (quiz widget)
     10. Resource explore click tracking (for the Dashboard)
     11. Scroll reveal animations
     12. Animated stat counters
     13. Navbar scroll state
     14. Button ripple effect
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  hideLoadingScreen();
  setupHamburgerMenu();
  highlightActiveLink();
  setupLogoutButtons();
  showLogoutMessageIfNeeded();
  setupHeroSearch();
  setupResourceSearch();
  setupCompanyCards();
  setupMockTest();
  setupExploreTracking();
  setupScrollReveal();
  setupStatCounters();
  setupNavbarScroll();
  setupButtonRipple();
});

/* ---------- 1. LOADING SCREEN ---------- */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) return;

  window.addEventListener("load", function () {
    setTimeout(function () {
      loadingScreen.classList.add("hidden");
    }, 400);
  });
}

/* ---------- 2. HAMBURGER MENU ---------- */
function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });
}

/* ---------- 3. ACTIVE NAVIGATION LINK ---------- */
function highlightActiveLink() {
  const currentPage = document.body.getAttribute("data-page");
  if (!currentPage) return;

  document.querySelectorAll(".nav-links a[data-page]").forEach(function (link) {
    if (link.getAttribute("data-page") === currentPage) {
      link.classList.add("active");
    }
  });
}

/* ---------- 4. LOGOUT ---------- */
function setupLogoutButtons() {
  document.querySelectorAll(".logout-btn").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      localStorage.removeItem("loggedInUser");
      sessionStorage.setItem("justLoggedOut", "true");

      const isInsidePagesFolder = window.location.pathname.includes("/pages/");
      window.location.href = isInsidePagesFolder ? "../index.html" : "index.html";
    });
  });
}

function showLogoutMessageIfNeeded() {
  if (sessionStorage.getItem("justLoggedOut") === "true") {
    sessionStorage.removeItem("justLoggedOut");
    // Required by the spec: a plain alert confirming logout.
    alert("You have been logged out successfully.");
  }
}

/* ---------- 5. NAV AUTH STATE ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const loggedInUser = localStorage.getItem("loggedInUser");
  document.querySelectorAll(".guest-only").forEach(function (el) {
    el.style.display = loggedInUser ? "none" : "";
  });
  document.querySelectorAll(".member-only").forEach(function (el) {
    el.style.display = loggedInUser ? "" : "none";
  });
});

/* ---------- 6. HOMEPAGE SEARCH -> RESOURCES PAGE ---------- */
// Typing a term on the homepage and pressing "Search" simply
// takes the user to resources.html with the term attached as
// a URL query (?q=...). The resources page then reads that
// value and reuses the same filtering logic as its own box.
function setupHeroSearch() {
  const form = document.getElementById("hero-search-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const input = document.getElementById("hero-search-input");
    const term = input.value.trim();
    window.location.href = "pages/resources.html" + (term ? "?q=" + encodeURIComponent(term) : "");
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      const term = chip.getAttribute("data-term");
      window.location.href = "pages/resources.html?q=" + encodeURIComponent(term);
    });
  });
}

/* ---------- 7. RESOURCES PAGE SEARCH ---------- */
// Every resource card carries its topic name in a data-name
// attribute. On every keystroke we loop through the cards and
// show/hide each one depending on whether its name includes
// the typed text.
function setupResourceSearch() {
  const searchInput = document.getElementById("resource-search");
  if (!searchInput) return;

  const cards = document.querySelectorAll(".resource-card");
  const noResultsMsg = document.getElementById("no-results");

  function filterCards() {
    const typedText = searchInput.value.trim().toLowerCase();
    let matchCount = 0;

    cards.forEach(function (card) {
      const cardName = card.getAttribute("data-name").toLowerCase();

      if (cardName.includes(typedText)) {
        matchCount++;
        // Make sure it's visible, then fade it in.
        card.style.display = "block";
        requestAnimationFrame(function () {
          card.classList.remove("hidden-card");
        });
      } else {
        // Fade it out first, then remove it from the grid
        // once the transition has finished playing.
        card.classList.add("hidden-card");
        setTimeout(function () {
          if (card.classList.contains("hidden-card")) {
            card.style.display = "none";
          }
        }, 250);
      }
    });

    if (noResultsMsg) {
      noResultsMsg.classList.toggle("show", matchCount === 0);
    }
  }

  searchInput.addEventListener("keyup", filterCards);

  // Pre-fill the box if the user arrived from the homepage search.
  const params = new URLSearchParams(window.location.search);
  const incomingQuery = params.get("q");
  if (incomingQuery) {
    searchInput.value = incomingQuery;
    filterCards();
  }
}

/* ---------- 8. COMPANY PREPARATION CARDS ---------- */
// Clicking a company card just demonstrates the concept: it
// shows a short message rather than linking to a real page.
function setupCompanyCards() {
  const cards = document.querySelectorAll(".company-card");
  const note = document.getElementById("company-note");
  if (cards.length === 0 || !note) return;

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      const companyName = card.getAttribute("data-company");
      note.textContent = "Loading " + companyName + " preparation resources...";
      note.classList.add("show");

      setTimeout(function () {
        note.textContent = companyName + "-specific resources are coming soon. Check the Resources page in the meantime.";
      }, 900);
    });
  });
}

/* ---------- 9. APTITUDE MOCK TEST (QUIZ WIDGET) ---------- */
// A small, self-contained quiz: an array of question objects,
// one shown at a time, a running score, and a result screen
// at the end. Kept deliberately simple to stay explainable.
const mockTestQuestions = [
  {
    question: "If a train travels 60 km in 1.5 hours, what is its speed?",
    options: ["30 km/h", "40 km/h", "45 km/h", "50 km/h"],
    answerIndex: 1,
  },
  {
    question: "Find the next number in the series: 2, 4, 8, 16, ?",
    options: ["20", "24", "32", "18"],
    answerIndex: 2,
  },
  {
    question: "What is 15% of 200?",
    options: ["20", "25", "30", "35"],
    answerIndex: 2,
  },
  {
    question: "Choose the word closest in meaning to 'Abundant'.",
    options: ["Scarce", "Plentiful", "Empty", "Narrow"],
    answerIndex: 1,
  },
  {
    question: "A shopkeeper marks up a product by 20% and then gives a 10% discount. What is the net profit percentage?",
    options: ["8%", "10%", "12%", "6%"],
    answerIndex: 0,
  },
];

let currentQuestionIndex = 0;
let mockTestScore = 0;

function setupMockTest() {
  const startBtn = document.getElementById("start-aptitude-test");
  const quizBox = document.getElementById("quiz-box");
  if (!startBtn || !quizBox) return;

  startBtn.addEventListener("click", function () {
    currentQuestionIndex = 0;
    mockTestScore = 0;
    quizBox.classList.add("show");
    renderQuestion();
    quizBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function renderQuestion() {
  const quizBox = document.getElementById("quiz-box");
  const question = mockTestQuestions[currentQuestionIndex];

  let optionsHtml = "";
  question.options.forEach(function (option, index) {
    optionsHtml +=
      '<label class="quiz-option">' +
      '<input type="radio" name="quizOption" value="' + index + '">' +
      option +
      "</label>";
  });

  quizBox.innerHTML =
    '<p class="quiz-progress">Question ' + (currentQuestionIndex + 1) + " of " + mockTestQuestions.length + '</p>' +
    '<h3 class="quiz-question">' + question.question + '</h3>' +
    '<div class="quiz-options">' + optionsHtml + '</div>' +
    '<button class="btn btn-primary btn-block" id="quiz-next-btn">' +
    (currentQuestionIndex === mockTestQuestions.length - 1 ? "Submit" : "Next") +
    '</button>';

  document.getElementById("quiz-next-btn").addEventListener("click", handleNextQuestion);

  // Give the option under the mouse a "selected" highlight the
  // moment it's picked — before Next/Submit is even clicked.
  document.querySelectorAll('input[name="quizOption"]').forEach(function (input) {
    input.addEventListener("change", function () {
      document.querySelectorAll(".quiz-option").forEach(function (label) {
        label.classList.remove("selected");
      });
      input.closest(".quiz-option").classList.add("selected");
    });
  });
}

function handleNextQuestion() {
  const selected = document.querySelector('input[name="quizOption"]:checked');

  if (!selected) {
    alert("Please select an answer before continuing.");
    return;
  }

  const chosenIndex = parseInt(selected.value);
  const correctIndex = mockTestQuestions[currentQuestionIndex].answerIndex;
  const isCorrect = chosenIndex === correctIndex;

  if (isCorrect) {
    mockTestScore++;
  }

  // Lock the options and color the chosen one plus the correct
  // one, so the student gets immediate feedback before moving on.
  const allOptions = document.querySelectorAll(".quiz-option");
  const nextBtn = document.getElementById("quiz-next-btn");

  allOptions.forEach(function (label, index) {
    label.classList.add("locked");
    label.querySelector("input").disabled = true;

    if (index === correctIndex) {
      label.classList.add("correct");
    } else if (index === chosenIndex && !isCorrect) {
      label.classList.add("wrong");
    }
  });

  nextBtn.disabled = true;

  setTimeout(function () {
    currentQuestionIndex++;

    if (currentQuestionIndex < mockTestQuestions.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }, 800);
}

function renderResult() {
  saveMockTestAttempt(mockTestScore, mockTestQuestions.length);

  const quizBox = document.getElementById("quiz-box");
  quizBox.innerHTML =
    '<div class="quiz-result">' +
    '<p class="quiz-progress">Test Complete</p>' +
    '<p class="score-num">' + mockTestScore + " / " + mockTestQuestions.length + '</p>' +
    '<p style="margin: 12px 0 22px; color: var(--text-muted);">You answered ' + mockTestScore + ' out of ' + mockTestQuestions.length + ' questions correctly.</p>' +
    '<button class="btn btn-outline" id="quiz-retry-btn">Retry Test</button>' +
    '</div>';

  document.getElementById("quiz-retry-btn").addEventListener("click", function () {
    currentQuestionIndex = 0;
    mockTestScore = 0;
    renderQuestion();
  });
}

// Saves this attempt into localStorage as part of a running
// array, so the Dashboard page can show mock test history and
// compute a best/average score. Only the 10 most recent
// attempts are kept, newest first.
function saveMockTestAttempt(score, total) {
  const history = JSON.parse(localStorage.getItem("mockTestHistory")) || [];

  history.unshift({
    date: new Date().toLocaleDateString(),
    score: score,
    total: total,
  });

  const trimmedHistory = history.slice(0, 10);
  localStorage.setItem("mockTestHistory", JSON.stringify(trimmedHistory));
}

/* ---------- 10. RESOURCE EXPLORE TRACKING ---------- */
// Every time an "Explore" button on a resource or feature card
// is clicked, we bump a simple counter in localStorage. The
// Dashboard page reads this counter to estimate how much of
// Coding/DSA and Interview prep a student has looked at.
function setupExploreTracking() {
  document.querySelectorAll(".track-explore").forEach(function (link) {
    link.addEventListener("click", function () {
      const currentClicks = parseInt(localStorage.getItem("resourceClicks")) || 0;
      localStorage.setItem("resourceClicks", currentClicks + 1);
    });
  });
}

/* ---------- 11. SCROLL REVEAL ---------- */
// Adds the "reveal" class to every card-like element on the
// page, then uses an IntersectionObserver — a browser feature
// that watches an element and tells us the moment it enters the
// viewport — to add "in-view" and trigger the fade-up transition
// defined in style.css. Each element is only observed once.
function setupScrollReveal() {
  const revealSelectors =
    ".stat-item, .category-card, .feature-card, .company-card, .mocktest-card, .resource-card, .about-card, .team-card";
  const elements = document.querySelectorAll(revealSelectors);
  if (elements.length === 0) return;

  elements.forEach(function (el) {
    el.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

/* ---------- 12. ANIMATED STAT COUNTERS ---------- */
// Reads the number already written in the HTML (e.g. "20+"),
// then counts up from 0 to that number once the stat scrolls
// into view, re-adding whatever suffix ("+") followed it.
function setupStatCounters() {
  const stats = document.querySelectorAll(".stat-number");
  if (stats.length === 0) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(function (stat) {
    observer.observe(stat);
  });
}

function animateCounter(el) {
  const fullText = el.textContent.trim(); // e.g. "20+"
  const numberMatch = fullText.match(/\d+/);
  if (!numberMatch) return;

  const targetNumber = parseInt(numberMatch[0]);
  const suffix = fullText.replace(numberMatch[0], ""); // "+" or ""
  const duration = 900; // total time in milliseconds
  const stepTime = Math.max(Math.floor(duration / targetNumber), 20);

  let current = 0;
  const timer = setInterval(function () {
    current++;
    el.textContent = current + suffix;

    if (current >= targetNumber) {
      clearInterval(timer);
      el.textContent = targetNumber + suffix;
    }
  }, stepTime);
}

/* ---------- 13. NAVBAR SCROLL STATE ---------- */
// Adds a "scrolled" class (a subtle shadow) once the page has
// scrolled down a little, so the fixed navbar visually lifts
// above the content instead of blending into it.
function setupNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

/* ---------- 14. BUTTON RIPPLE EFFECT ---------- */
// On every click, creates a small circular <span>, positions it
// where the mouse clicked, and lets the CSS animation in
// style.css expand and fade it out. The circle removes itself
// after the animation finishes.
function setupButtonRipple() {
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      const existingRipple = btn.querySelector(".ripple");
      if (existingRipple) existingRipple.remove();

      const circle = document.createElement("span");
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const radius = diameter / 2;
      const rect = btn.getBoundingClientRect();

      circle.style.width = circle.style.height = diameter + "px";
      circle.style.left = event.clientX - rect.left - radius + "px";
      circle.style.top = event.clientY - rect.top - radius + "px";
      circle.classList.add("ripple");

      btn.appendChild(circle);
      setTimeout(function () {
        circle.remove();
      }, 600);
    });
  });
}
