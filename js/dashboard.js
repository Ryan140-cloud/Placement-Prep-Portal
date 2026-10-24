/* =====================================================
   DASHBOARD.JS
   Runs only on pages/dashboard.html. This is the one file in
   the project that leans on a few more advanced JavaScript
   ideas — arrow functions, array methods (map/filter/reduce),
   object destructuring, template literals, and the spread
   operator (...) for copying/updating objects. Every function
   is still small and commented, but it's a step up from the
   plain loops used elsewhere in the project.

   Where the numbers come from (all frontend-only, no backend,
   everything lives in this browser's localStorage):
     - "users"            -> every account, saved at Sign Up (auth.js);
                             the Dashboard shows the logged-in one
     - "loggedInUser"     -> who is signed in right now (no password)
     - "mockTestHistory"  -> saved every time a mock test ends (main.js)
     - "resourceClicks"   -> counted every time an "Explore"
                             button is clicked on a resource card
     - "githubCache"      -> last GitHub API result + when it was
                             fetched (reused for 30 minutes)
   The last three are kept separately for each account:
   userKey() in main.js adds the email, e.g.
   "mockTestHistory:asha@example.com".
   ===================================================== */

const STORAGE_KEYS = {
  users: "users",
  loggedIn: "loggedInUser",
  history: "mockTestHistory",
  clicks: "resourceClicks",
  githubCache: "githubCache",
};

// Small arrow-function helpers — each just reads one piece of
// data out of localStorage and gives it a sensible default.
const getAccounts = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
const getHistory = () => JSON.parse(localStorage.getItem(userKey(STORAGE_KEYS.history))) || [];
const getClicks = () => parseInt(localStorage.getItem(userKey(STORAGE_KEYS.clicks))) || 0;

// The logged-in student's account from "users", or null.
// getLoggedInEmail() (main.js) is already in lower case.
const getUser = () => {
  const email = getLoggedInEmail();
  if (!email) return null;
  return getAccounts().find((account) => (account.email || "").toLowerCase() === email) || null;
};

// The signed-in session saved by auth.js (JSON, no password).
// Very old sessions were just the email as plain text, so if
// it isn't valid JSON we wrap it, the same way auth.js does.
const getSession = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.loggedIn);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { email: raw };
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const user = getUser();
  if (!user) return; // the inline guard script in <head> already redirects

  renderWelcome(user);
  renderStatsAndProgress();
  renderHistoryTable();
  renderProfile(user);
  setupProfileEditing(user);
  setupGithubCard();

  // PROMISE DEMO: Promise.allSettled
  // Starts the GitHub card and the Tip of the day at the same time.
  //   - Promise.all fails as soon as ONE Promise rejects, and the
  //     results of the others are lost.
  //   - Promise.allSettled waits for ALL of them to finish and
  //     reports each one as "fulfilled" or "rejected".
  // So one broken API can never stop us hearing about the other.
  // (Try it: in DevTools > Network, right-click the adviceslip
  // request > "Block request URL", then reload. The tip falls
  // back to a built-in one and is counted as rejected.)
  Promise.allSettled([renderGithubCard(user), loadTipOfTheDay()]).then((results) => {
    const fulfilled = results.filter((result) => result.status === "fulfilled").length;
    const rejected = results.length - fulfilled;
    console.log(`Dashboard loaded: ${fulfilled} fulfilled, ${rejected} rejected`);
  });
});

/* ---------- WELCOME HEADER ---------- */
function renderWelcome(user) {
  const nameEl = document.getElementById("welcome-name");
  const subEl = document.getElementById("welcome-sub");
  if (nameEl) nameEl.textContent = `Welcome back, ${user.fullName.split(" ")[0]}!`;
  if (subEl) subEl.textContent = `${user.course} · Class of ${user.gradYear} · ${user.college}`;
}

/* ---------- READINESS ---------- */
// calculateReadiness() lives in main.js (loaded before this file)
// so the homepage and the Dashboard always show the same numbers.
// Its rules are explained in the comment above it there.

// One "next step" per category, used when it's the lowest one.
// The first text is for a test never taken, the second for a
// test taken but not yet at 100%.
const NEXT_STEPS = {
  aptitude: ["take the Aptitude test", "retake the Aptitude test to raise your best score"],
  codingDsa: ["take the Coding Basics test", "retake the Coding Basics test and explore the Coding & DSA resources"],
  interview: ["take the Interview Basics test", "retake the Interview Basics test to raise your best score"],
  mockTests: ["score 60% or more on all 3 mock tests", "score 60% or more on all 3 mock tests"],
};

function renderStatsAndProgress() {
  const history = getHistory();
  const readiness = calculateReadiness(history, getClicks());
  const { aptitude, codingDsa, interview, mockTests, overall } = readiness;

  paintRing(overall);
  animateProgressBar("apt", aptitude);
  animateProgressBar("coding", codingDsa);
  animateProgressBar("interview", interview);
  animateProgressBar("mocktest", mockTests);
  renderAdvice(readiness);

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

// Points the student at their lowest category. If two are tied,
// the one listed first (Aptitude, Coding, Interview, Mock Tests) wins.
function renderAdvice(readiness) {
  const adviceEl = document.getElementById("progress-advice");
  if (!adviceEl) return;

  if (readiness.overall === 100) {
    adviceEl.textContent = "Great work, you are placement ready!";
    return;
  }

  const lowestKey = Object.keys(NEXT_STEPS).reduce((lowest, key) =>
    readiness[key] < readiness[lowest] ? key : lowest
  );
  const [neverTried, tryAgain] = NEXT_STEPS[lowestKey];
  adviceEl.textContent = `Next step: ${readiness[lowestKey] === 0 ? neverTried : tryAgain}.`;
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

  // Display name for each saved test. Older attempts have no
  // "test" field — they were all Aptitude, so that's the default.
  // Looking names up here (instead of printing the saved text)
  // also keeps anything odd in localStorage out of the HTML.
  const testLabels = {
    "Aptitude": "Aptitude Mock Test",
    "Coding Basics": "Coding Basics Test",
    "Interview Basics": "Interview Basics Test",
  };

  // .map() turns each attempt object into a table row, and
  // .join("") glues all the rows into one HTML string.
  tableBody.innerHTML = history
    .map(function (attempt) {
      const { date, test, score, total } = attempt; // object destructuring
      const percent = Math.round((score / total) * 100);
      const pillClass = percent >= 60 ? "" : "low";
      const testLabel = testLabels[test] || testLabels["Aptitude"];

      return `
        <tr>
          <td>${date}</td>
          <td>${testLabel}</td>
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
    "profile-github": user.githubUsername || "—",
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

  const githubInput = document.getElementById("edit-github");
  const githubError = document.getElementById("edit-github-error");

  const clearGithubError = () => {
    githubInput.classList.remove("invalid");
    githubError.textContent = "";
    githubError.classList.remove("show");
  };

  editBtn.addEventListener("click", function () {
    document.getElementById("edit-college").value = user.college;
    document.getElementById("edit-course").value = user.course;
    document.getElementById("edit-year").value = user.gradYear;
    githubInput.value = user.githubUsername || "";
    clearGithubError();

    view.classList.add("hide");
    form.classList.add("show");
  });

  cancelBtn.addEventListener("click", function () {
    form.classList.remove("show");
    view.classList.remove("hide");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Optional field: empty is fine, but anything typed must look
    // like a real GitHub username before we send it to the API.
    const githubUsername = githubInput.value.trim();
    clearGithubError();
    if (githubUsername && !GITHUB_USERNAME_PATTERN.test(githubUsername)) {
      githubInput.classList.add("invalid");
      githubError.textContent = "Use letters, numbers or single hyphens (max 39 characters).";
      githubError.classList.add("show");
      return;
    }

    // The spread operator (...user) copies every existing field,
    // then the new values overwrite just college/course/year and
    // the GitHub username — simpler than rebuilding the whole
    // user object by hand.
    const updatedUser = {
      ...user,
      college: document.getElementById("edit-college").value.trim(),
      course: document.getElementById("edit-course").value.trim(),
      gradYear: document.getElementById("edit-year").value,
      githubUsername: githubUsername,
    };

    // Swap this student's old account for the updated one inside
    // "users". map() builds a new array; every other account is
    // copied across unchanged.
    const updatedAccounts = getAccounts().map((account) =>
      (account.email || "").toLowerCase() === user.email.toLowerCase() ? updatedUser : account
    );
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(updatedAccounts));
    user = updatedUser;

    // Keep the signed-in session (auth.js) in step with the edits.
    // Same spread idea; the password is never part of the session.
    const session = getSession();
    if (session) {
      const updatedSession = {
        ...session,
        college: updatedUser.college,
        course: updatedUser.course,
        gradYear: updatedUser.gradYear,
        githubUsername: updatedUser.githubUsername,
      };
      localStorage.setItem(STORAGE_KEYS.loggedIn, JSON.stringify(updatedSession));
    }

    renderProfile(updatedUser);
    renderWelcome(updatedUser);
    renderGithubCard(updatedUser);

    form.classList.remove("show");
    view.classList.remove("hide");
  });
}

/* ---------- GITHUB PROFILE CARD ---------- */
// Shows the student's public GitHub profile and latest repos
// using GitHub's free REST API (no key needed). Without a key
// GitHub allows only 60 requests an hour, so each result is
// cached in localStorage and reused for 30 minutes.
//
// Safety: every piece of text from GitHub goes onto the page
// with textContent / createElement (never innerHTML), and only
// links starting with https://github.com/ are ever used.
const GITHUB_API_BASE = "https://api.github.com/users/";
const GITHUB_CACHE_MS = 30 * 60 * 1000; // 30 minutes
const GITHUB_REPO_COUNT = 6;
// GitHub usernames: letters, numbers and single hyphens,
// 1–39 characters, never starting or ending with a hyphen.
const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

// Each request gets a number; if an older request finishes
// after a newer one started, its result is simply ignored.
let githubRequestId = 0;

const safeGithubLink = (url) =>
  typeof url === "string" && url.startsWith("https://github.com/") ? url : null;
const safeAvatarUrl = (url) =>
  typeof url === "string" && url.startsWith("https://avatars.githubusercontent.com/") ? url : null;

// Creates an element with an optional class and plain text.
const makeEl = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};

// An <a> to GitHub, or null if the URL isn't a github.com link.
const makeGithubLink = (url, text, className) => {
  const safeUrl = safeGithubLink(url);
  if (!safeUrl) return null;
  const link = makeEl("a", className, text);
  link.href = safeUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
};

// An Error that carries a message we're happy to show the user.
const githubError = (message) => Object.assign(new Error(message), { isGithubError: true });

const fetchGithubJson = async (url) => {
  const response = await fetch(url);
  if (response.status === 404) throw githubError("GitHub user not found");
  if (response.status === 403 || response.status === 429) {
    throw githubError("GitHub rate limit reached, try again later");
  }
  if (!response.ok) throw githubError(`GitHub returned an error (${response.status})`);
  return response.json();
};

// PROMISE DEMO: Promise.all
// Fetches the profile and repos at the same time (Promise.all)
// and keeps only the fields the card needs. If EITHER request
// fails, Promise.all rejects and the card shows the error.
const loadGithubData = async (username) => {
  const userUrl = GITHUB_API_BASE + encodeURIComponent(username);
  const [profile, repos] = await Promise.all([
    fetchGithubJson(userUrl),
    fetchGithubJson(`${userUrl}/repos?sort=updated&per_page=${GITHUB_REPO_COUNT}`),
  ]);

  return {
    username: username.toLowerCase(),
    fetchedAt: Date.now(),
    profile: {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      htmlUrl: profile.html_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
    },
    repos: (Array.isArray(repos) ? repos : []).map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      htmlUrl: repo.html_url,
    })),
  };
};

// Returns the cached result only if it's for this username and
// less than 30 minutes old; otherwise null (= fetch again).
const readGithubCache = (username) => {
  try {
    const cached = JSON.parse(localStorage.getItem(userKey(STORAGE_KEYS.githubCache)));
    const isFresh =
      cached &&
      cached.username === username.toLowerCase() &&
      Date.now() - cached.fetchedAt < GITHUB_CACHE_MS;
    return isFresh ? cached : null;
  } catch (error) {
    return null; // broken cache entry — just fetch again
  }
};

const writeGithubCache = (data) => {
  try {
    localStorage.setItem(userKey(STORAGE_KEYS.githubCache), JSON.stringify(data));
  } catch (error) {
    // Storage full or blocked: the card still works, just uncached.
  }
};

// Counts how many of the repos use each language, most used first,
// e.g. [["JavaScript", 3], ["Python", 2]].
const countTopLanguages = (repos) => {
  const counts = repos.reduce(
    (tally, repo) => (repo.language ? { ...tally, [repo.language]: (tally[repo.language] || 0) + 1 } : tally),
    {}
  );
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};

// Opens the Edit Profile form and jumps to the GitHub field.
const openGithubField = () => {
  const form = document.getElementById("edit-profile-form");
  if (!form.classList.contains("show")) document.getElementById("edit-profile-btn").click();
  const input = document.getElementById("edit-github");
  input.scrollIntoView({ behavior: "smooth", block: "center" });
  input.focus({ preventScroll: true });
};

const buildGithubEmptyState = () => {
  const wrap = makeEl("div", "github-empty");
  wrap.append(makeEl("p", "", "Add your GitHub username to show your profile and latest projects here."));
  const button = makeEl("button", "btn btn-primary btn-sm", "Add GitHub Username");
  button.type = "button";
  button.addEventListener("click", openGithubField);
  wrap.append(button);
  return wrap;
};

const buildGithubHeader = (profile) => {
  const header = makeEl("div", "github-header");

  const avatarUrl = safeAvatarUrl(profile.avatarUrl);
  if (avatarUrl) {
    const avatar = document.createElement("img");
    avatar.className = "github-avatar";
    avatar.src = avatarUrl;
    avatar.alt = `${profile.login}'s GitHub avatar`;
    avatar.width = 64;
    avatar.height = 64;
    header.append(avatar);
  }

  const info = makeEl("div", "github-info");
  info.append(makeEl("h4", "github-name", profile.name || profile.login));
  info.append(makeEl("p", "github-login", `@${profile.login}`));
  if (profile.bio) info.append(makeEl("p", "github-bio", profile.bio));
  const profileLink = makeGithubLink(profile.htmlUrl, "View profile on GitHub ↗", "github-profile-link");
  if (profileLink) info.append(profileLink);

  header.append(info);
  return header;
};

const buildGithubStats = ({ publicRepos, followers }) => {
  const stats = makeEl("div", "github-stats");
  [["Public repos", publicRepos], ["Followers", followers]].forEach(([label, value]) => {
    const stat = makeEl("div", "github-stat");
    stat.append(makeEl("span", "github-stat-num", String(Number(value) || 0)));
    stat.append(makeEl("span", "github-stat-label", label));
    stats.append(stat);
  });
  return stats;
};

const buildTopLanguages = (repos) => {
  const section = makeEl("div", "github-section");
  section.append(makeEl("h4", "github-section-title", "Top languages"));

  const languages = countTopLanguages(repos);
  if (languages.length === 0) {
    section.append(makeEl("p", "github-muted", "No language data in these repos yet."));
    return section;
  }

  const list = makeEl("ul", "github-languages");
  languages.forEach(([language, count]) => {
    list.append(makeEl("li", "github-lang-chip", `${language} · ${count}`));
  });
  section.append(list);
  return section;
};

const buildRepoList = (repos) => {
  const section = makeEl("div", "github-section");
  section.append(makeEl("h4", "github-section-title", "Latest repositories"));

  if (repos.length === 0) {
    section.append(makeEl("p", "github-muted", "No public repositories yet."));
    return section;
  }

  const list = makeEl("ul", "github-repos");
  repos.forEach((repo) => {
    const item = makeEl("li", "github-repo");
    // Fall back to plain text if the repo link isn't a github.com URL.
    item.append(makeGithubLink(repo.htmlUrl, repo.name, "github-repo-name") || makeEl("span", "github-repo-name", repo.name));
    item.append(makeEl("p", "github-repo-desc", repo.description || "No description"));

    const meta = makeEl("p", "github-repo-meta");
    meta.append(makeEl("span", "", repo.language || "—"));
    meta.append(makeEl("span", "", `★ ${Number(repo.stars) || 0}`));
    item.append(meta);

    list.append(item);
  });
  section.append(list);
  return section;
};

const buildGithubProfile = ({ profile, repos, fetchedAt }) => {
  const time = new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return [
    buildGithubHeader(profile),
    buildGithubStats(profile),
    buildTopLanguages(repos),
    buildRepoList(repos),
    makeEl("p", "github-updated", `Last updated at ${time}`),
  ];
};

// Draws the card: empty state, cached data, or a fresh fetch.
// forceRefresh = true skips the cache (used by the Refresh button).
const renderGithubCard = async (user, forceRefresh = false) => {
  const content = document.getElementById("github-content");
  const refreshBtn = document.getElementById("github-refresh-btn");
  if (!content || !refreshBtn) return;

  const username = (user.githubUsername || "").trim();
  const requestId = ++githubRequestId;

  if (!username) {
    refreshBtn.hidden = true;
    content.replaceChildren(buildGithubEmptyState());
    return;
  }

  refreshBtn.hidden = false;

  const cached = forceRefresh ? null : readGithubCache(username);
  if (cached) {
    content.replaceChildren(...buildGithubProfile(cached));
    return;
  }

  refreshBtn.disabled = true;
  content.replaceChildren(makeEl("p", "github-status", "Loading GitHub profile..."));

  try {
    const data = await loadGithubData(username);
    if (requestId !== githubRequestId) return; // a newer request took over
    writeGithubCache(data);
    content.replaceChildren(...buildGithubProfile(data));
  } catch (error) {
    if (requestId !== githubRequestId) return;
    // fetch() itself throws (TypeError) when the network is down.
    const message = error.isGithubError ? error.message : "Could not reach GitHub";
    content.replaceChildren(makeEl("p", "github-status error", message));
  } finally {
    if (requestId === githubRequestId) refreshBtn.disabled = false;
  }
};

// The Refresh button re-reads the saved user (it may have been
// edited since the page loaded) and skips the cache.
const setupGithubCard = () => {
  const refreshBtn = document.getElementById("github-refresh-btn");
  if (!refreshBtn) return;
  refreshBtn.addEventListener("click", () => {
    const user = getUser();
    if (user) renderGithubCard(user, true);
  });
};

/* ---------- TIP OF THE DAY ---------- */

const ADVICE_API_URL = "https://api.adviceslip.com/advice";

// Shown instead when the Advice Slip API can't be reached.
const PLACEMENT_TIPS = [
  "Solve at least one aptitude set every day; speed comes from practice.",
  "Before an interview, read the company's recent news and products.",
  "Explain your projects out loud: what you built, why, and what you learned.",
  "Revise arrays, strings and linked lists first; they appear in most coding rounds.",
  "Keep your resume to one page and be ready to talk about every line on it.",
];

// Fills the Tip of the day panel. If the API fails we still show
// a built-in tip, then re-throw the error so Promise.allSettled
// (above) records this task as "rejected".
const loadTipOfTheDay = async () => {
  const tipText = document.getElementById("tip-text");
  if (!tipText) return;

  try {
    // no-store: ask the browser for a fresh tip every time.
    const response = await fetch(ADVICE_API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Advice Slip returned ${response.status}`);
    const data = await response.json();
    if (!data.slip || !data.slip.advice) throw new Error("Advice Slip sent no advice");
    tipText.textContent = data.slip.advice;
  } catch (error) {
    const randomIndex = Math.floor(Math.random() * PLACEMENT_TIPS.length);
    tipText.textContent = PLACEMENT_TIPS[randomIndex];
    throw error;
  }
};
