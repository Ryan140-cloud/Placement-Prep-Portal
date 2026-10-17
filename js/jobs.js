/* =====================================================
   JOBS.JS
   Runs only on pages/jobs.html. Shows remote jobs open to
   candidates in India from Himalayas (himalayas.app). The
   browser can't call Himalayas directly, so we call our own
   /api/jobs endpoint (api/jobs.js), which fetches the jobs on
   the server and passes them back.

   Safety: every piece of text from the API is put on the page
   with textContent / createElement, never innerHTML, and only
   https:// logo and apply links are used.
   ===================================================== */

const JOBS_ENDPOINT = "/api/jobs";
const DAY_MS = 24 * 60 * 60 * 1000;

// Short labels for how often a salary is paid.
const SALARY_PERIOD_LABELS = {
  hourly: "/ hour",
  daily: "/ day",
  weekly: "/ week",
  monthly: "/ month",
  annual: "/ year",
  yearly: "/ year",
};

// What's being searched, which page we're on, and which jobs are
// already showing (by guid, so the same job never appears twice).
// requestId lets us ignore an old, slow request if a newer
// search has started since.
const jobsState = {
  q: "",
  type: "",
  seniority: "",
  page: 1,
  total: 0,
  seenGuids: new Set(),
  requestId: 0,
};

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("jobs-search-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    startNewSearch();
  });

  // "Internships" / "Freshers" switch a filter on or off.
  document.querySelectorAll(".job-filter-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      const isOn = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", isOn ? "false" : "true");
      startNewSearch();
    });
  });

  // "Software" / "Data" / "Design" fill in the keyword box
  // (clicking the active one again clears it).
  document.querySelectorAll(".job-keyword-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      const input = document.getElementById("jobs-q");
      const isActive = chip.getAttribute("aria-pressed") === "true";
      input.value = isActive ? "" : chip.dataset.keyword;
      startNewSearch();
    });
  });

  document.getElementById("jobs-load-more").addEventListener("click", function () {
    loadJobs(jobsState.page + 1);
  });

  startNewSearch(); // show some jobs straight away
});

function startNewSearch() {
  jobsState.q = document.getElementById("jobs-q").value.trim();
  jobsState.type = readFilterChip("type");
  jobsState.seniority = readFilterChip("seniority");
  jobsState.total = 0;
  jobsState.seenGuids = new Set();

  syncKeywordChips();
  document.getElementById("jobs-grid").replaceChildren();
  loadJobs(1);
}

// Returns the chip's value if that filter is switched on, else "".
function readFilterChip(filterName) {
  const chip = document.querySelector(`.job-filter-chip[data-filter="${filterName}"]`);
  return chip && chip.getAttribute("aria-pressed") === "true" ? chip.dataset.value : "";
}

// A keyword chip looks "on" whenever the search box matches it.
function syncKeywordChips() {
  document.querySelectorAll(".job-keyword-chip").forEach(function (chip) {
    const isActive = chip.dataset.keyword.toLowerCase() === jobsState.q.toLowerCase();
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

async function loadJobs(page) {
  const requestId = ++jobsState.requestId;
  const isFirstPage = page === 1;
  const loadMoreBtn = document.getElementById("jobs-load-more");

  setLoading(true, isFirstPage);

  try {
    const data = await fetchJobs(page);
    if (requestId !== jobsState.requestId) return; // a newer search took over

    jobsState.page = page;
    jobsState.total = data.totalCount;

    // Skip any job we're already showing (same guid).
    const newJobs = data.jobs.filter(function (job) {
      if (!job.guid || jobsState.seenGuids.has(job.guid)) return false;
      jobsState.seenGuids.add(job.guid);
      return true;
    });

    appendJobCards(newJobs);
    showSummary();

    // Stop once a page comes back empty, or everything is showing.
    const isFinished = data.jobs.length === 0 || jobsState.seenGuids.size >= jobsState.total;
    loadMoreBtn.textContent = "Load more";
    loadMoreBtn.hidden = isFinished;
  } catch (error) {
    if (requestId !== jobsState.requestId) return;

    if (isFirstPage) {
      showStatus(error.message, "error");
      loadMoreBtn.hidden = true;
    } else {
      // Keep the jobs already shown; let the student retry.
      loadMoreBtn.textContent = "Couldn't load more — try again";
    }
  } finally {
    if (requestId === jobsState.requestId) setLoading(false, isFirstPage);
  }
}

// Calls our own API and turns every kind of failure into an
// Error with a message that's safe to show on the page.
async function fetchJobs(page) {
  const params = new URLSearchParams({ page: String(page) });
  if (jobsState.q) params.set("q", jobsState.q);
  if (jobsState.type) params.set("type", jobsState.type);
  if (jobsState.seniority) params.set("seniority", jobsState.seniority);

  let response;
  try {
    response = await fetch(`${JOBS_ENDPOINT}?${params}`);
  } catch (error) {
    throw new Error("Could not load jobs. Check your internet connection and try again.");
  }

  // Live Server (or any plain static server) has no /api/jobs,
  // so it answers with an HTML 404 page instead of JSON.
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("The jobs service isn't available here. Run the site with \"vercel dev\" or open the deployed Vercel site.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Could not load jobs (error ${response.status}).`);
  }

  return {
    totalCount: Number(data.totalCount) || 0,
    jobs: Array.isArray(data.jobs) ? data.jobs : [],
  };
}

/* ---------- PAGE STATES ---------- */
function setLoading(isLoading, isFirstPage) {
  const searchBtn = document.getElementById("jobs-search-btn");
  const loadMoreBtn = document.getElementById("jobs-load-more");
  const grid = document.getElementById("jobs-grid");

  searchBtn.disabled = isLoading;
  grid.setAttribute("aria-busy", isLoading ? "true" : "false");

  if (isFirstPage && isLoading) {
    showStatus("Searching jobs...", "");
    loadMoreBtn.hidden = true;
  }
  if (!isFirstPage) {
    loadMoreBtn.disabled = isLoading;
    if (isLoading) loadMoreBtn.textContent = "Loading...";
  }
}

// kind is "" (normal), "error" or "empty".
function showStatus(text, kind) {
  const status = document.getElementById("jobs-status");
  status.textContent = text;
  status.className = "jobs-status" + (kind ? " " + kind : "");
}

function showSummary() {
  const shown = jobsState.seenGuids.size;
  if (shown === 0) {
    showStatus("No jobs found for that search. Try a different keyword or turn off a filter.", "empty");
    return;
  }

  let text = `Showing ${shown} of ${jobsState.total.toLocaleString("en-IN")} jobs`;
  if (jobsState.q) text += ` for "${jobsState.q}"`;
  if (jobsState.type === "Intern") text += " · Internships";
  if (jobsState.seniority === "Entry-level") text += " · Freshers";
  showStatus(text, "");
}

/* ---------- JOB CARDS ---------- */
// Small helper: creates an element with a class and plain text.
function makeEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function appendJobCards(jobs) {
  const grid = document.getElementById("jobs-grid");
  jobs.forEach(function (job) {
    grid.append(buildJobCard(job));
  });
}

function buildJobCard(job) {
  const card = makeEl("article", "job-card");

  // Logo + title + company side by side.
  const head = makeEl("div", "job-card-head");
  const logo = buildLogo(job.companyLogo);
  if (logo) head.append(logo);
  const titleWrap = makeEl("div", "job-title-wrap");
  titleWrap.append(makeEl("h3", "", job.title || "Untitled role"));
  titleWrap.append(makeEl("p", "job-company", job.companyName || "Company not listed"));
  head.append(titleWrap);
  card.append(head);

  if (job.employmentType) card.append(makeEl("span", "tag", job.employmentType));

  const meta = makeEl("ul", "job-meta");
  const salary = formatSalary(job);
  if (salary) meta.append(makeEl("li", "", `💰 ${salary}`));
  const posted = formatPostedDate(job.pubDate);
  if (posted) meta.append(makeEl("li", "", `🕒 ${posted}`));
  card.append(meta);

  card.append(buildApplyLink(job.applicationLink));
  return card;
}

// Company logo, only from an https:// address. If the image
// fails to load it's simply removed, leaving the text.
function buildLogo(url) {
  if (typeof url !== "string" || !url.startsWith("https://")) return null;

  const img = document.createElement("img");
  img.className = "job-logo";
  img.src = url;
  img.alt = ""; // decorative: the company name is right next to it
  img.width = 44;
  img.height = 44;
  img.loading = "lazy";
  img.addEventListener("error", function () {
    img.remove();
  });
  return img;
}

// "Apply" opens the job in a new tab, only if it's an https:// link.
function buildApplyLink(url) {
  if (typeof url !== "string" || !url.startsWith("https://")) {
    return makeEl("p", "job-apply-missing", "Apply link unavailable");
  }

  const link = makeEl("a", "btn btn-primary btn-sm job-apply", "Apply ↗");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  return link;
}

// e.g. "$40,000 – $60,000 / year" or "₹30,000 / month".
// Salaries can be in any currency, so we use the job's own.
function formatSalary(job) {
  const low = Number(job.minSalary) || 0;
  const high = Number(job.maxSalary) || 0;
  if (!low && !high) return "";

  const amount = low && high && low !== high
    ? `${formatMoney(low, job.currency)} – ${formatMoney(high, job.currency)}`
    : formatMoney(low || high, job.currency);
  const period = SALARY_PERIOD_LABELS[String(job.salaryPeriod).toLowerCase()];
  return period ? `${amount} ${period}` : amount;
}

// Intl.NumberFormat throws on an unknown currency code, so fall
// back to a plain number followed by the code.
function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    return `${amount.toLocaleString("en-IN")} ${currency || ""}`.trim();
  }
}

// pubDate is Unix time in seconds. Turns it into "Posted today",
// "Posted 3 days ago", etc.
function formatPostedDate(pubDate) {
  const seconds = Number(pubDate);
  if (!seconds) return "";

  const days = Math.floor((Date.now() - seconds * 1000) / DAY_MS);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;

  const months = Math.floor(days / 30);
  return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
}
