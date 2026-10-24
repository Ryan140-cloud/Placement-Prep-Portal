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
     15. Hero typing effect + score counter (homepage)
     16. Per-user storage: userKey() + moving the old single user
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
  setupHeroAnimations();
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

      // Only show the "logged out" alert if someone really was
      // logged in; a guest clicking Logout is just sent home.
      if (localStorage.getItem("loggedInUser") !== null) {
        localStorage.removeItem("loggedInUser");
        sessionStorage.setItem("justLoggedOut", "true");
      }

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
  const countMsg = document.getElementById("resource-count");
  const clearBtn = document.getElementById("resource-search-clear");
  let filterRun = 0; // goes up by 1 on every search

  function filterCards() {
    const typedText = searchInput.value.trim().toLowerCase();
    const thisRun = ++filterRun;
    let matchCount = 0;

    cards.forEach(function (card) {
      const cardName = card.getAttribute("data-name").toLowerCase();

      if (cardName.includes(typedText)) {
        matchCount++;
        // Make sure it's visible, then fade it in on the next
        // frame, unless a newer search has started since then
        // (otherwise a fast search could un-hide a wrong card).
        card.style.display = "block";
        requestAnimationFrame(function () {
          if (thisRun === filterRun) card.classList.remove("hidden-card");
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
    if (countMsg) {
      countMsg.textContent = "Showing " + matchCount + " of " + cards.length + " resources";
    }
    // The × only shows when there is something to clear.
    if (clearBtn) {
      clearBtn.hidden = searchInput.value === "";
    }
  }

  // "input" fires for typing, pasting, cutting and the browser's
  // autofill alike ("keyup" missed text pasted with the mouse).
  searchInput.addEventListener("input", filterCards);

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      searchInput.value = "";
      filterCards();
      searchInput.focus();
    });
  }

  // Pre-fill the box if the user arrived from the homepage search,
  // then filter once so the count shows straight away.
  const params = new URLSearchParams(window.location.search);
  const incomingQuery = params.get("q");
  if (incomingQuery) {
    searchInput.value = incomingQuery;
  }
  filterCards();
}

/* ---------- 8. COMPANY PREPARATION CARDS ---------- */
// Clicking a company card (or pressing Enter/Space on it) shows
// a panel with that company's exam, rounds, tips, a button to
// practise the matching mock test and a link to its careers page.
//
// NOTE: hiring patterns change every year. These details are a
// general guide only; students should always confirm the
// current pattern on the company's official careers site.
// practice must be "aptitude", "coding" or "interview".
const COMPANY_PREP = {
  TCS: {
    name: "TCS",
    exam: "TCS NQT",
    rounds: ["Foundation section: numerical, verbal and reasoning ability", "Advanced section: advanced aptitude and coding", "Technical interview", "Managerial interview", "HR interview"],
    tips: ["Practise time-bound aptitude sets, the test moves fast.", "Be comfortable writing code in one language end to end.", "Revise your final-year project, interviewers ask about it."],
    careersUrl: "https://www.tcs.com/careers",
    practice: "aptitude",
  },
  Infosys: {
    name: "Infosys",
    exam: "InfyTQ / Infosys Hiring Test",
    rounds: ["Online test: aptitude, logical reasoning, verbal and pseudo code", "Coding round (for higher roles)", "Technical interview", "HR interview"],
    tips: ["Practise reading pseudo code and predicting its output.", "Brush up on DBMS and OOP basics.", "Prepare clear answers about your strengths and projects."],
    careersUrl: "https://www.infosys.com/careers/",
    practice: "coding",
  },
  Wipro: {
    name: "Wipro",
    exam: "Wipro Elite NTH",
    rounds: ["Online assessment: aptitude, logical and verbal", "Written communication test (short essay)", "Coding test (2 problems)", "Technical and HR interview"],
    tips: ["Practise writing a short, well-structured essay.", "Solve easy and medium coding problems on arrays and strings.", "Keep answers about yourself short and confident."],
    careersUrl: "https://careers.wipro.com/",
    practice: "aptitude",
  },
  Accenture: {
    name: "Accenture",
    exam: "Accenture Cognitive + Technical + Coding",
    rounds: ["Cognitive and technical assessment", "Coding assessment", "Communication assessment", "Interview"],
    tips: ["Revise MS Office, networking and cloud basics for the technical section.", "Practise coding questions with a timer.", "Speak clearly in the communication round, pace matters."],
    careersUrl: "https://www.accenture.com/in-en/careers",
    practice: "coding",
  },
  Deloitte: {
    name: "Deloitte",
    exam: "Deloitte NLA",
    rounds: ["Online aptitude test (NLA)", "Group or case discussion", "Technical interview", "HR interview"],
    tips: ["Practise group discussions: listen first, then add a clear point.", "Read basic business news before case rounds.", "Revise core aptitude topics like percentages and ratios."],
    careersUrl: "https://www2.deloitte.com/in/en/careers.html",
    practice: "aptitude",
  },
  Cognizant: {
    name: "Cognizant",
    exam: "Cognizant GenC",
    rounds: ["Aptitude: quantitative, logical and English", "Technical / coding assessment", "Technical interview", "HR interview"],
    tips: ["Be ready to explain every skill written on your resume.", "Practise basic SQL queries.", "Prepare a STAR story about teamwork."],
    careersUrl: "https://careers.cognizant.com/",
    practice: "interview",
  },
  Capgemini: {
    name: "Capgemini",
    exam: "Capgemini Exceller (pseudo code + game based)",
    rounds: ["Pseudo code and English test", "Game-based aptitude test", "Behavioural competency test", "Technical and HR interview"],
    tips: ["Practise tracing loops and recursion in pseudo code.", "Try a few free game-based aptitude puzzles online.", "Answer behavioural questions honestly, they check consistency."],
    careersUrl: "https://www.capgemini.com/in-en/careers/",
    practice: "coding",
  },
  IBM: {
    name: "IBM",
    exam: "IBM Cognitive Ability + Coding",
    rounds: ["Cognitive ability assessment (game based)", "Coding and English language test", "Technical interview", "HR interview"],
    tips: ["Stay calm in the game-based test, accuracy beats speed.", "Revise OOP, DBMS and operating system basics.", "Research IBM's work in cloud and AI before the interview."],
    careersUrl: "https://www.ibm.com/careers",
    practice: "interview",
  },
};

// The test name shown on each "Practice ... test" button.
const PRACTICE_TEST_NAMES = {
  aptitude: "Aptitude",
  coding: "Coding Basics",
  interview: "Interview Basics",
};

function setupCompanyCards() {
  const cards = document.querySelectorAll(".company-card");
  const panel = document.getElementById("company-note");
  if (cards.length === 0 || !panel) return;

  function selectCard(card) {
    cards.forEach(function (otherCard) {
      otherCard.classList.remove("active");
    });
    card.classList.add("active");

    const company = COMPANY_PREP[card.getAttribute("data-company")];
    if (!company) return;

    renderCompanyPanel(panel, company);
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectCard(card);
    });

    // Cards are <article>s, so Enter/Space must be handled by hand.
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // stop Space from scrolling the page
        selectCard(card);
      }
    });
  });
}

// Builds the panel with createElement/textContent only, so no
// text can ever be run as HTML.
function renderCompanyPanel(panel, company) {
  const heading = createTextElement("h3", "", company.name);
  const exam = createTextElement("p", "company-panel-exam", "Exam: " + company.exam);

  const roundsList = document.createElement("ol");
  company.rounds.forEach(function (round) {
    roundsList.appendChild(createTextElement("li", "", round));
  });

  const tipsList = document.createElement("ul");
  company.tips.forEach(function (tip) {
    tipsList.appendChild(createTextElement("li", "", tip));
  });

  const testName = PRACTICE_TEST_NAMES[company.practice];
  const practiceBtn = createTextElement("button", "btn btn-primary btn-sm", "Practice " + testName + " test");
  practiceBtn.type = "button";
  practiceBtn.addEventListener("click", function () {
    startPracticeTest(company.practice);
  });

  const careersLink = createTextElement("a", "btn btn-outline btn-sm", "Official careers page ↗");
  careersLink.href = company.careersUrl;
  careersLink.target = "_blank";
  careersLink.rel = "noopener noreferrer";

  const actions = document.createElement("div");
  actions.className = "company-panel-actions";
  actions.appendChild(practiceBtn);
  actions.appendChild(careersLink);

  panel.replaceChildren(
    heading,
    exam,
    createTextElement("h4", "", "Selection rounds"),
    roundsList,
    createTextElement("h4", "", "Tips"),
    tipsList,
    actions,
    createTextElement("p", "company-panel-note", "Patterns change every year, so confirm the latest details on the official careers page.")
  );
  panel.classList.add("show");
}

// Starts a mock test exactly like its own Start Test button does.
function startPracticeTest(practice) {
  document.getElementById("mock-tests").scrollIntoView({ behavior: "smooth" });

  if (practice === "aptitude") {
    startQuiz("Aptitude", aptitudeQuestions, "");
  } else if (practice === "interview") {
    startQuiz("Interview Basics", interviewQuestions, "");
  } else if (practice === "coding") {
    const codingBtn = document.getElementById("start-coding-test");
    if (!codingBtn.disabled) startCodingTest(codingBtn); // skip if already loading
  }
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

// Interview Basics Test: 5 HR questions, then 5 basic technical
// questions that come up in most campus interviews.
const interviewQuestions = [
  {
    question: "What is the best way to answer \"Tell me about yourself\"?",
    options: [
      "Tell your full life story from childhood",
      "Give a short summary of your education, skills and goals that fit the job",
      "Talk only about your hobbies",
      "Say \"It's all in my resume\"",
    ],
    answerIndex: 1,
  },
  {
    question: "How should you answer \"What is your weakness?\"",
    options: [
      "Say you have no weaknesses",
      "Give a fake weakness like \"I work too hard\"",
      "Name a real weakness and explain how you are working to improve it",
      "Refuse to answer the question",
    ],
    answerIndex: 2,
  },
  {
    question: "What does the STAR method stand for?",
    options: [
      "Situation, Task, Action, Result",
      "Skills, Talent, Attitude, Results",
      "Start, Think, Answer, Repeat",
      "Strengths, Targets, Achievements, Reasons",
    ],
    answerIndex: 0,
  },
  {
    question: "What should you do when you don't know the answer to an interview question?",
    options: [
      "Make up an answer confidently",
      "Stay silent until the next question",
      "Change the topic to something you know",
      "Admit it honestly and explain how you would find the answer",
    ],
    answerIndex: 3,
  },
  {
    question: "Why should you research the company before an interview?",
    options: [
      "So you can give relevant answers and show real interest in the role",
      "So you can tell them what they are doing wrong",
      "It is not useful at all",
      "Only to find out the salary",
    ],
    answerIndex: 0,
  },
  {
    question: "What is the main difference between a process and a thread?",
    options: [
      "A thread is always faster than a process",
      "A process has its own memory space, while threads of the same process share memory",
      "A process can only run on one CPU, a thread on many",
      "There is no difference",
    ],
    answerIndex: 1,
  },
  {
    question: "What is the difference between a primary key and a foreign key?",
    options: [
      "Both mean the same thing",
      "A foreign key must be unique, a primary key need not be",
      "A primary key uniquely identifies a row; a foreign key refers to a primary key in another table",
      "A primary key is only used for passwords",
    ],
    answerIndex: 2,
  },
  {
    question: "In OOP, what is polymorphism?",
    options: [
      "Hiding data inside a class",
      "Creating many objects from one class",
      "Deleting unused objects automatically",
      "The same method name behaving differently depending on the object",
    ],
    answerIndex: 3,
  },
  {
    question: "What is a REST API?",
    options: [
      "A way for applications to talk over HTTP using methods like GET and POST on resources",
      "A database that stores web pages",
      "A programming language for servers",
      "A tool for designing user interfaces",
    ],
    answerIndex: 0,
  },
  {
    question: "What is the average time complexity of searching for a key in a hash table?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
    answerIndex: 2,
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

// PROMISE DEMO: new Promise with resolve
// wait(800) gives back a Promise that stays "pending" for 800 ms,
// then setTimeout calls resolve() and it becomes "fulfilled".
// So `await wait(ms)` simply means "pause here for ms milliseconds".
function wait(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// PROMISE DEMO: new Promise with reject
// timeout(ms) never resolves. After ms milliseconds it calls
// reject() with an Error, so the Promise becomes "rejected".
function timeout(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("Request timed out after " + ms / 1000 + " seconds"));
    }, ms);
  });
}

// PROMISE DEMO: Promise.race
// Promise.race starts both Promises and settles with whichever
// one finishes FIRST. If fetch() answers in time we get the
// response; if the timer wins, we get the timeout error instead.
function fetchWithTimeout(url, ms) {
  return Promise.race([fetch(url), timeout(ms)]);
}

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

  const interviewBtn = document.getElementById("start-interview-test");
  if (interviewBtn) {
    interviewBtn.addEventListener("click", function () {
      startQuiz("Interview Basics", interviewQuestions, "");
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
// PROMISE DEMO: async/await
// `await` pauses this function until fetchCodingQuestions() is
// done. If its Promise rejects, the error jumps to `catch`.
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

// Any error thrown here (offline, timeout, bad reply) makes this
// async function's Promise reject, and startCodingTest() then
// falls back to the built-in questions.
async function fetchCodingQuestions() {
  // fetchWithTimeout gives up after FETCH_TIMEOUT_MS (Promise.race).
  const response = await fetchWithTimeout(CODING_TEST_API_URL, FETCH_TIMEOUT_MS);
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

// PROMISE DEMO: await with our own Promise (wait)
// This is async so it can `await wait(...)` below: the green/red
// feedback stays on screen, then the next question appears.
async function handleNextQuestion() {
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

  // Pause so the student can see the feedback colours.
  await wait(FEEDBACK_DELAY_MS);

  currentQuestionIndex++;

  if (currentQuestionIndex < activeTest.questions.length) {
    renderQuestion();
  } else {
    renderResult();
  }
}

function renderResult() {
  const total = activeTest.questions.length;
  saveMockTestAttempt(activeTest.name, mockTestScore, total);

  // The readiness is read back from localStorage, so the whole
  // screen is built with createElement/textContent (no innerHTML).
  const readiness = getSavedReadiness();
  const isLoggedIn = localStorage.getItem("loggedInUser") !== null;

  const summary = createTextElement("p", "", "You answered " + mockTestScore + " out of " + total + " questions correctly.");
  summary.style.cssText = "margin: 12px 0 6px; color: var(--text-muted);";

  const readinessLine = createTextElement("p", "quiz-readiness", "Your overall readiness is now " + readiness.overall + "%.");

  const retryBtn = createTextElement("button", "btn btn-outline", "Retry Test");
  retryBtn.id = "quiz-retry-btn";

  // Logged in: go and see the Dashboard. Not logged in: sign up,
  // because the Dashboard needs an account.
  const nextLink = isLoggedIn
    ? createTextElement("a", "btn btn-primary", "View on Dashboard")
    : createTextElement("a", "btn btn-primary", "Sign up to save your progress");
  nextLink.href = isLoggedIn ? "pages/dashboard.html" : "pages/signup.html";

  const actions = document.createElement("div");
  actions.className = "quiz-result-actions";
  actions.appendChild(retryBtn);
  actions.appendChild(nextLink);

  const result = document.createElement("div");
  result.className = "quiz-result";
  result.appendChild(createTextElement("p", "quiz-progress", "Test Complete"));
  result.appendChild(createTextElement("p", "score-num", mockTestScore + " / " + total));
  result.appendChild(summary);
  result.appendChild(readinessLine);
  result.appendChild(actions);

  document.getElementById("quiz-box").replaceChildren(result);

  // Retry runs the same questions again (no new download needed).
  retryBtn.addEventListener("click", function () {
    currentQuestionIndex = 0;
    mockTestScore = 0;
    renderQuestion();
  });
}

// Saves this attempt into localStorage as part of a running
// array, so the Dashboard page can show mock test history and
// compute a best/average score. Only the 50 most recent
// attempts are kept, newest first.
const MAX_SAVED_ATTEMPTS = 50;

function saveMockTestAttempt(testName, score, total) {
  const history = JSON.parse(localStorage.getItem(userKey("mockTestHistory"))) || [];

  history.unshift({
    date: new Date().toLocaleDateString(),
    time: Date.now(),
    test: testName,
    score: score,
    total: total,
  });

  const trimmedHistory = history.slice(0, MAX_SAVED_ATTEMPTS);
  localStorage.setItem(userKey("mockTestHistory"), JSON.stringify(trimmedHistory));
}

// READINESS (shared by the homepage, the quiz result screen and
// the Dashboard, so every page shows the same numbers).
// All four categories come from the student's own results:
//   - Aptitude    = best % in any Aptitude test (0 if never taken)
//   - Coding & DSA = 80% from the best Coding Basics %
//                    + 20% from resources explored (5 clicks = full 20%)
//   - Interview   = best % in any Interview Basics test
//   - Mock Tests  = how many of the 3 tests were passed (60% or more), out of 3
//   - Overall     = the average of the four
// Old attempts saved before tests had names were all Aptitude.
const MOCK_TEST_NAMES = ["Aptitude", "Coding Basics", "Interview Basics"];
const PASS_PERCENT = 60;
const FULL_EXPLORE_CLICKS = 5;

function calculateReadiness(history, clicks) {
  // Best percentage scored in one test (0 if it was never taken).
  function bestPercent(testName) {
    let best = 0;
    history.forEach(function (attempt) {
      const name = attempt.test || "Aptitude";
      if (name === testName && attempt.total > 0) {
        best = Math.max(best, (attempt.score / attempt.total) * 100);
      }
    });
    return Math.round(best);
  }

  const aptitude = bestPercent("Aptitude");
  const interview = bestPercent("Interview Basics");

  const explorePercent = (Math.min(clicks, FULL_EXPLORE_CLICKS) / FULL_EXPLORE_CLICKS) * 100;
  const codingDsa = Math.round(bestPercent("Coding Basics") * 0.8 + explorePercent * 0.2);

  const testsPassed = MOCK_TEST_NAMES.filter(function (testName) {
    return bestPercent(testName) >= PASS_PERCENT;
  }).length;
  const mockTests = Math.round((testsPassed / MOCK_TEST_NAMES.length) * 100);

  const overall = Math.round((aptitude + codingDsa + interview + mockTests) / 4);

  return { aptitude: aptitude, codingDsa: codingDsa, interview: interview, mockTests: mockTests, overall: overall };
}

// Reads this browser's saved results and works out the readiness.
function getSavedReadiness() {
  const history = JSON.parse(localStorage.getItem(userKey("mockTestHistory"))) || [];
  const clicks = parseInt(localStorage.getItem(userKey("resourceClicks"))) || 0;
  return calculateReadiness(history, clicks);
}

/* ---------- 10. RESOURCE EXPLORE TRACKING ---------- */
// Every time an "Explore" button on a resource or feature card
// is clicked, we bump a simple counter in localStorage. The
// Dashboard page reads this counter to estimate how much of
// Coding/DSA and Interview prep a student has looked at.
function setupExploreTracking() {
  document.querySelectorAll(".track-explore").forEach(function (link) {
    link.addEventListener("click", function () {
      const clicksKey = userKey("resourceClicks");
      const currentClicks = parseInt(localStorage.getItem(clicksKey)) || 0;
      localStorage.setItem(clicksKey, currentClicks + 1);
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

/* ---------- 15. HERO TYPING EFFECT + SCORE COUNTER ---------- */
// Homepage hero only. Types company/role names one letter at a
// time ("Currently preparing for TCS NQT|"), and counts the
// "Readiness Score" card up from 0 while its bar fills.
const HERO_TYPING_WORDS = [
  "TCS NQT",
  "Infosys",
  "Wipro",
  "Accenture",
  "Cognizant",
  "Capgemini",
  "Software Engineer",
  "Data Analyst",
];
const TYPE_LETTER_MS = 90; // time between typed letters
const DELETE_LETTER_MS = 45; // deleting is a bit faster
const HOLD_WORD_MS = 1500; // pause on the full word
const NEXT_WORD_MS = 400; // pause before typing the next word
const SCORE_COUNT_MS = 1400; // how long the score takes to count up
const LOADING_SCREEN_MS = 800; // section 1 hides the loading screen about this long after load

function setupHeroAnimations() {
  const typingEl = document.getElementById("typing-text");
  if (!typingEl) return; // not the homepage

  setHeroScoreTarget(); // must run before the count-up reads data-target

  // Respect the visitor's "reduce motion" setting: show the
  // finished state straight away instead of animating.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    typingEl.textContent = HERO_TYPING_WORDS[0];
    showHeroScore(false);
    return;
  }

  startTypingLoop(typingEl);

  // Wait for the loading screen to fade so the count-up is visible.
  if (document.readyState === "complete") {
    showHeroScore(true);
  } else {
    window.addEventListener("load", function () {
      setTimeout(function () {
        showHeroScore(true);
      }, LOADING_SCREEN_MS);
    });
  }
}

// Types a word, holds it, deletes it, then moves to the next
// word, forever. Each step schedules the next with setTimeout.
function startTypingLoop(el) {
  let wordIndex = 0;
  let letterCount = 0;
  let isDeleting = false;

  function step() {
    const word = HERO_TYPING_WORDS[wordIndex];
    letterCount += isDeleting ? -1 : 1;
    el.textContent = word.slice(0, letterCount);

    let delay = isDeleting ? DELETE_LETTER_MS : TYPE_LETTER_MS;

    if (!isDeleting && letterCount === word.length) {
      isDeleting = true; // whole word typed: hold, then delete
      delay = HOLD_WORD_MS;
    } else if (isDeleting && letterCount === 0) {
      isDeleting = false; // word gone: move on to the next one
      wordIndex = (wordIndex + 1) % HERO_TYPING_WORDS.length;
      delay = NEXT_WORD_MS;
    }

    setTimeout(step, delay);
  }

  step();
}

// Logged in: the card shows the student's real overall readiness.
// Not logged in: it keeps the sample 82 from index.html.
function setHeroScoreTarget() {
  const scoreEl = document.getElementById("hero-score");
  const labelEl = document.getElementById("hero-score-label");
  if (!scoreEl || !labelEl) return;

  if (localStorage.getItem("loggedInUser") !== null) {
    const overall = getSavedReadiness().overall;
    scoreEl.dataset.target = overall;
    scoreEl.textContent = overall;
    labelEl.textContent = "Your Readiness Score";
  } else {
    labelEl.textContent = "Sample Readiness Score";
  }
}

// Sets the score card to its target (read from data-target).
// With animate = true it counts up and the bar grows (the CSS
// transition on .score-fill does the smooth growing).
function showHeroScore(animate) {
  const scoreEl = document.getElementById("hero-score");
  const fillEl = document.getElementById("hero-score-fill");
  if (!scoreEl || !fillEl) return;

  const target = parseInt(scoreEl.dataset.target) || 0;

  if (!animate) {
    scoreEl.textContent = target;
    fillEl.style.width = target + "%";
    return;
  }

  scoreEl.textContent = "0";
  fillEl.style.width = "0%";
  void fillEl.offsetWidth; // let the browser register 0% first, so the transition plays
  fillEl.style.width = target + "%";

  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / SCORE_COUNT_MS, 1);
    scoreEl.textContent = Math.round(target * progress);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- 16. PER-USER STORAGE ---------- */
// Each account gets its own mock test history, resource clicks
// and GitHub cache, saved under "<key>:<email>". For example a
// student logged in as asha@example.com has their history in
// "mockTestHistory:asha@example.com". Guests use the plain key.
const PER_USER_KEYS = ["mockTestHistory", "resourceClicks", "githubCache"];

// The logged-in email in lower case, or "" for a guest. Very old
// sessions were just the email as plain text, not JSON.
function getLoggedInEmail() {
  const raw = localStorage.getItem("loggedInUser");
  if (!raw) return "";

  let email = raw;
  try {
    const session = JSON.parse(raw);
    email = typeof session === "string" ? session : (session && session.email) || "";
  } catch (error) {
    // Not JSON: it's an old plain-text email.
  }
  return String(email).toLowerCase();
}

function userKey(baseKey) {
  const email = getLoggedInEmail();
  return email ? baseKey + ":" + email : baseKey;
}

// Before accounts were kept in a list, only ONE user was saved
// (in "registeredUser") and everyone shared the same history.
// This moves that user into the "users" list and gives them the
// old shared history, clicks and cache, so nothing they had is
// lost. It runs as soon as main.js loads, which is before
// auth.js or dashboard.js read anything.
function migrateSingleUserStorage() {
  const oldUserRaw = localStorage.getItem("registeredUser");
  if (!oldUserRaw || localStorage.getItem("users") !== null) return;

  let oldUser = null;
  try {
    oldUser = JSON.parse(oldUserRaw);
  } catch (error) {
    return; // unreadable: leave it alone
  }
  if (!oldUser || !oldUser.email) return;

  localStorage.setItem("users", JSON.stringify([oldUser]));
  localStorage.removeItem("registeredUser");

  const email = oldUser.email.toLowerCase();
  PER_USER_KEYS.forEach(function (baseKey) {
    const sharedValue = localStorage.getItem(baseKey);
    const ownKey = baseKey + ":" + email;
    if (sharedValue !== null && localStorage.getItem(ownKey) === null) {
      localStorage.setItem(ownKey, sharedValue);
      localStorage.removeItem(baseKey);
    }
  });
}

migrateSingleUserStorage();
