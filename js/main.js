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
     9. Mock Tests: Aptitude + Coding Basics (shared quiz widget)
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

/* ---------- 9. MOCK TESTS (QUIZ WIDGET) ---------- */
// One small quiz widget shared by every mock test: a list of
// question objects, one shown at a time, a running score, and
// a result screen at the end. Each test just hands the widget
// its own name and questions. Kept simple to stay explainable.
const aptitudeQuestions = [
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

// Backup questions for the Coding Basics Test, used whenever
// the online question bank can't be reached (offline, rate
// limited, or any other error) so the test always works.
const codingFallbackQuestions = [
  {
    question: "Which data structure works on the 'Last In, First Out' (LIFO) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    answerIndex: 1,
  },
  {
    question: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
    answerIndex: 2,
  },
  {
    question: "Which keyword is used to define a function in Python?",
    options: ["func", "function", "define", "def"],
    answerIndex: 3,
  },
  {
    question: "In most programming languages, what index does the first element of an array have?",
    options: ["0", "1", "-1", "It depends on the array size"],
    answerIndex: 0,
  },
  {
    question: "What does HTML stand for?",
    options: ["Hyper Trainer Marking Language", "HyperText Markup Language", "HighText Machine Language", "Hyperlink and Text Management Language"],
    answerIndex: 1,
  },
  {
    question: "Which of these is NOT a loop in C or Java?",
    options: ["for", "while", "do-while", "repeat-until"],
    answerIndex: 3,
  },
  {
    question: "What is the value of 7 % 3 (the modulus operator)?",
    options: ["1", "2", "2.33", "0"],
    answerIndex: 0,
  },
  {
    question: "Which OOP concept means hiding internal details and exposing only what is needed?",
    options: ["Inheritance", "Polymorphism", "Encapsulation", "Recursion"],
    answerIndex: 2,
  },
  {
    question: "What does SQL stand for?",
    options: ["Structured Query Language", "Simple Question Language", "Sequential Query Logic", "Standard Quick Lookup"],
    answerIndex: 0,
  },
  {
    question: "A function that calls itself is called a...",
    options: ["Loop function", "Recursive function", "Static function", "Lambda function"],
    answerIndex: 1,
  },
];

// Open Trivia DB: 10 multiple-choice questions from category 18
// (Science: Computers). encode=url3986 means every string comes
// URL-encoded, so we decode it with decodeURIComponent.
const CODING_TEST_API_URL = "https://opentdb.com/api.php?amount=10&category=18&type=multiple&encode=url3986";
const FETCH_TIMEOUT_MS = 8000; // give up on a slow network after 8 seconds
const FEEDBACK_DELAY_MS = 800; // how long the green/red feedback stays before moving on

// The test currently on screen, plus where the student is in it.
let activeTest = { name: "", questions: [], note: "" };
let currentQuestionIndex = 0;
let mockTestScore = 0;

function setupMockTest() {
  const quizBox = document.getElementById("quiz-box");
  if (!quizBox) return;

  const aptitudeBtn = document.getElementById("start-aptitude-test");
  if (aptitudeBtn) {
    aptitudeBtn.addEventListener("click", function () {
      startQuiz("Aptitude", aptitudeQuestions, "");
    });
  }

  const codingBtn = document.getElementById("start-coding-test");
  if (codingBtn) {
    codingBtn.addEventListener("click", function () {
      startCodingTest(codingBtn);
    });
  }
}

// Resets the score and shows question 1 of the given test.
function startQuiz(testName, questions, note) {
  const quizBox = document.getElementById("quiz-box");
  activeTest = { name: testName, questions: questions, note: note };
  currentQuestionIndex = 0;
  mockTestScore = 0;
  quizBox.classList.add("show");
  renderQuestion();
  quizBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Shows a single line of text (like "Loading questions...")
// inside the quiz box in place of a question.
function showQuizMessage(message) {
  const quizBox = document.getElementById("quiz-box");
  const messageEl = document.createElement("p");
  messageEl.className = "quiz-progress";
  messageEl.textContent = message;
  quizBox.replaceChildren(messageEl);
  quizBox.classList.add("show");
}

// Fetches the coding questions, falling back to the built-in
// ones if anything goes wrong. The button is disabled while
// loading so it can't be double-clicked.
async function startCodingTest(startBtn) {
  const originalText = startBtn.textContent;
  startBtn.disabled = true;
  startBtn.textContent = "Loading questions...";
  showQuizMessage("Loading questions...");

  let questions = codingFallbackQuestions;
  let note = "";

  try {
    questions = await fetchCodingQuestions();
  } catch (error) {
    console.warn("Coding Basics Test: using built-in questions.", error);
    note = "Couldn't reach the online question bank, so these are our built-in questions.";
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = originalText;
  }

  startQuiz("Coding Basics", questions, note);
}

async function fetchCodingQuestions() {
  // AbortController lets us cancel the request if it takes too long.
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(CODING_TEST_API_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    // response_code 0 = success. Anything else (e.g. 5 = too many
    // requests, the API allows 1 every 5 seconds) means no questions.
    if (data.response_code !== 0 || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error("Open Trivia DB response_code " + data.response_code);
    }

    return data.results.map(toQuizQuestion);
  } finally {
    clearTimeout(timer);
  }
}

// Turns one API result into our { question, options, answerIndex }
// shape: mix the right answer in with the wrong ones, shuffle,
// then remember where the right answer ended up.
function toQuizQuestion(item) {
  const correctAnswer = decodeURIComponent(item.correct_answer);
  const wrongAnswers = item.incorrect_answers.map(function (answer) {
    return decodeURIComponent(answer);
  });
  const options = shuffleArray([correctAnswer].concat(wrongAnswers));

  return {
    question: decodeURIComponent(item.question),
    options: options,
    answerIndex: options.indexOf(correctAnswer),
  };
}

// Fisher-Yates shuffle on a copy, so the original array is untouched.
function shuffleArray(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

// Small helper: makes an element with a class and plain text.
// textContent (not innerHTML) means text from the API can never
// be run as HTML on our page.
function createTextElement(tagName, className, text) {
  const el = document.createElement(tagName);
  el.className = className;
  el.textContent = text;
  return el;
}

function renderQuestion() {
  const quizBox = document.getElementById("quiz-box");
  const questions = activeTest.questions;
  const question = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const parts = [];

  // Only shown on question 1, e.g. when the backup questions are used.
  if (activeTest.note && currentQuestionIndex === 0) {
    const noteEl = createTextElement("p", "quiz-progress", activeTest.note);
    noteEl.style.color = "var(--text-muted)";
    parts.push(noteEl);
  }

  parts.push(createTextElement("p", "quiz-progress", "Question " + (currentQuestionIndex + 1) + " of " + questions.length));
  parts.push(createTextElement("h3", "quiz-question", question.question));

  const optionsWrap = document.createElement("div");
  optionsWrap.className = "quiz-options";
  question.options.forEach(function (option, index) {
    const label = document.createElement("label");
    label.className = "quiz-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "quizOption";
    input.value = index;

    label.appendChild(input);
    label.appendChild(document.createTextNode(option));
    optionsWrap.appendChild(label);
  });
  parts.push(optionsWrap);

  const nextBtn = createTextElement("button", "btn btn-primary btn-block", isLastQuestion ? "Submit" : "Next");
  nextBtn.id = "quiz-next-btn";
  parts.push(nextBtn);

  quizBox.replaceChildren.apply(quizBox, parts);

  nextBtn.addEventListener("click", handleNextQuestion);

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
  const correctIndex = activeTest.questions[currentQuestionIndex].answerIndex;
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

    if (currentQuestionIndex < activeTest.questions.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }, FEEDBACK_DELAY_MS);
}

function renderResult() {
  const total = activeTest.questions.length;
  saveMockTestAttempt(activeTest.name, mockTestScore, total);

  // Only numbers we calculated ourselves go into this HTML.
  const quizBox = document.getElementById("quiz-box");
  quizBox.innerHTML =
    '<div class="quiz-result">' +
    '<p class="quiz-progress">Test Complete</p>' +
    '<p class="score-num">' + mockTestScore + " / " + total + '</p>' +
    '<p style="margin: 12px 0 22px; color: var(--text-muted);">You answered ' + mockTestScore + ' out of ' + total + ' questions correctly.</p>' +
    '<button class="btn btn-outline" id="quiz-retry-btn">Retry Test</button>' +
    '</div>';

  // Retry runs the same questions again (no new download needed).
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
function saveMockTestAttempt(testName, score, total) {
  const history = JSON.parse(localStorage.getItem("mockTestHistory")) || [];

  history.unshift({
    date: new Date().toLocaleDateString(),
    test: testName,
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
