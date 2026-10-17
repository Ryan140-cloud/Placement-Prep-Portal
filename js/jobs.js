/* =====================================================
   JOBS.JS
   Runs only on pages/jobs.html. Searches jobs and internships
   in India through our own /api/jobs endpoint (api/jobs.js),
   which talks to Adzuna on the server so the secret API key
   never reaches the browser.

   Safety: every piece of text from the API is put on the page
   with textContent / createElement, never innerHTML.
   ===================================================== */

const JOBS_ENDPOINT = "/api/jobs";
const DAY_MS = 24 * 60 * 60 * 1000;

const CONTRACT_LABELS = {
  full_time: "Full time",
  part_time: "Part time",
};

// One shared formatter for Indian rupee amounts, e.g. ₹4,50,000.
const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// What's being searched, which page we're on, and how many jobs
// are showing. requestId lets us ignore an old, slow request
// if a newer search has started since.
const jobsState = {
  what: "",
  where: "",
  page: 1,
  loaded: 0,
  total: 0,
  requestId: 0,
};

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("jobs-search-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setActiveChip(null);
    startNewSearch();
  });

  // Quick filter chips fill in the keyword box and search.
  document.querySelectorAll(".job-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.getElementById("jobs-what").value = chip.dataset.term;
      setActiveChip(chip);
      startNewSearch();
    });
  });

  document.getElementById("jobs-load-more").addEventListener("click", function () {
    loadJobs(jobsState.page + 1);
  });

  startNewSearch(); // show some jobs straight away
});

function startNewSearch() {
  jobsState.what = document.getElementById("jobs-what").value.trim();
  jobsState.where = document.getElementById("jobs-where").value.trim();
  jobsState.loaded = 0;
  jobsState.total = 0;
  document.getElementById("jobs-grid").replaceChildren();
  loadJobs(1);
}

async function loadJobs(page) {
  const requestId = ++jobsState.requestId;
  const isFirstPage = page === 1;
  const loadMoreBtn = document.getElementById("jobs-load-more");

  setLoading(true, isFirstPage);

  try {
    const data = await fetchJobs(jobsState.what, jobsState.where, page);
    if (requestId !== jobsState.requestId) return; // a newer search took over

    jobsState.page = page;
    jobsState.total = data.count;
    jobsState.loaded += data.results.length;

    appendJobCards(data.results);
    showSummary();
    loadMoreBtn.textContent = "Load more";
    loadMoreBtn.hidden = data.results.length === 0 || jobsState.loaded >= jobsState.total;
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
async function fetchJobs(what, where, page) {
  const params = new URLSearchParams({ page: String(page) });
  if (what) params.set("what", what);
  if (where) params.set("where", where);

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
    count: Number(data.count) || 0,
    results: Array.isArray(data.results) ? data.results : [],
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
  if (jobsState.loaded === 0) {
    showStatus("No jobs found for that search. Try a different keyword or location.", "empty");
    return;
  }

  let text = `Showing ${jobsState.loaded} of ${jobsState.total.toLocaleString("en-IN")} jobs`;
  if (jobsState.what) text += ` for "${jobsState.what}"`;
  if (jobsState.where) text += ` in ${jobsState.where}`;
  showStatus(text, "");
}

// Highlights the clicked chip (or none) and tells screen readers.
function setActiveChip(activeChip) {
  document.querySelectorAll(".job-chip").forEach(function (chip) {
    const isActive = chip === activeChip;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
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

  const contractLabel = CONTRACT_LABELS[job.contract_time];
  if (contractLabel) card.append(makeEl("span", "tag", contractLabel));

  card.append(makeEl("h3", "", job.title || "Untitled role"));

  const company = job.company && job.company.display_name;
  card.append(makeEl("p", "job-company", company || "Company not listed"));

  const meta = makeEl("ul", "job-meta");
  const location = job.location && job.location.display_name;
  if (location) meta.append(makeEl("li", "", `📍 ${location}`));
  const salary = formatSalary(job.salary_min, job.salary_max);
  if (salary) meta.append(makeEl("li", "", `💰 ${salary}`));
  const posted = formatPostedDate(job.created);
  if (posted) meta.append(makeEl("li", "", `🕒 ${posted}`));
  card.append(meta);

  card.append(buildApplyLink(job.redirect_url));
  return card;
}

// "Apply" opens the job on Adzuna in a new tab. Only https links
// are allowed (the server already checks they're Adzuna links).
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

// e.g. "₹3,00,000 – ₹5,00,000", or one amount if only one is known.
function formatSalary(min, max) {
  const low = Number(min) || 0;
  const high = Number(max) || 0;
  if (low && high && low !== high) return `${rupees.format(low)} – ${rupees.format(high)}`;
  const single = low || high;
  return single ? rupees.format(single) : "";
}

// Turns an ISO date into "Posted today", "Posted 3 days ago", etc.
function formatPostedDate(created) {
  const postedAt = Date.parse(created);
  if (Number.isNaN(postedAt)) return "";

  const days = Math.floor((Date.now() - postedAt) / DAY_MS);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;

  const months = Math.floor(days / 30);
  return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
}
