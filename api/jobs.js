/* =====================================================
   API/JOBS.JS  (Vercel serverless function -> /api/jobs)
   Runs on Vercel's servers, never in the browser. The Jobs
   page (pages/jobs.html) calls /api/jobs, and this function
   calls Adzuna using our secret keys, so the keys are never
   sent to visitors.

   Needs two environment variables (set them in Vercel):
     ADZUNA_APP_ID   and   ADZUNA_APP_KEY

   Query params:
     what  - keyword (default "fresher software")
     where - location (optional)
     page  - results page, starting at 1 (default 1)
   ===================================================== */

const ADZUNA_SEARCH_URL = "https://api.adzuna.com/v1/api/jobs/in/search/";
const RESULTS_PER_PAGE = 12;
const MAX_INPUT_LENGTH = 60;
const MAX_PAGE = 100;
const DEFAULT_KEYWORD = "fresher software";
const ADZUNA_TIMEOUT_MS = 10000; // give up on Adzuna after 10 seconds
const CACHE_HEADER = "s-maxage=3600"; // Vercel's CDN keeps each result for 1 hour

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Only GET requests are allowed.");
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    return sendError(res, 500, "Server is not configured: set ADZUNA_APP_ID and ADZUNA_APP_KEY in the Vercel environment variables.");
  }

  const input = readSearchInput(req.url);
  if (input.error) return sendError(res, 400, input.error);

  let adzunaResponse;
  try {
    adzunaResponse = await fetch(buildAdzunaUrl(input, appId, appKey), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(ADZUNA_TIMEOUT_MS),
    });
  } catch (error) {
    // Never log the URL itself: it contains the secret key.
    console.error("Adzuna request failed:", error.name, error.message);
    return sendError(res, 502, "Could not reach the Adzuna jobs service. Please try again.");
  }

  const data = await adzunaResponse.json().catch(() => null);

  if (!adzunaResponse.ok || !data) {
    // Adzuna explains errors in "display" or "exception".
    const detail = data && (data.display || data.exception);
    console.error("Adzuna error:", adzunaResponse.status, detail || "(no details)");
    const status = adzunaResponse.ok ? 502 : adzunaResponse.status;
    const message = `Adzuna returned an error (${adzunaResponse.status})` + (detail ? `: ${detail}` : ".");
    return sendError(res, status, message);
  }

  res.setHeader("Cache-Control", CACHE_HEADER);
  return res.status(200).json({
    count: Number(data.count) || 0,
    page: input.page,
    results: (Array.isArray(data.results) ? data.results : []).map(toJob),
  });
}

// Reads and checks the query string. Returns { what, where, page }
// or { error } with a message explaining what's wrong.
function readSearchInput(requestUrl) {
  const params = new URL(requestUrl, "http://localhost").searchParams;
  const what = (params.get("what") || "").trim();
  const where = (params.get("where") || "").trim();
  const pageText = (params.get("page") || "1").trim();

  if (what.length > MAX_INPUT_LENGTH) {
    return { error: `Keyword must be ${MAX_INPUT_LENGTH} characters or fewer.` };
  }
  if (where.length > MAX_INPUT_LENGTH) {
    return { error: `Location must be ${MAX_INPUT_LENGTH} characters or fewer.` };
  }

  const page = Number(pageText);
  if (!/^\d+$/.test(pageText) || page < 1 || page > MAX_PAGE) {
    return { error: `Page must be a whole number from 1 to ${MAX_PAGE}.` };
  }

  return { what: what || DEFAULT_KEYWORD, where, page };
}

function buildAdzunaUrl({ what, where, page }, appId, appKey) {
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: what,
    results_per_page: String(RESULTS_PER_PAGE),
    "content-type": "application/json",
  });
  if (where) params.set("where", where);
  return `${ADZUNA_SEARCH_URL}${page}?${params}`;
}

// Keeps only the fields the Jobs page needs.
function toJob(job) {
  return {
    title: toPlainText(job.title),
    company: { display_name: toPlainText(job.company && job.company.display_name) },
    location: { display_name: toPlainText(job.location && job.location.display_name) },
    created: typeof job.created === "string" ? job.created : null,
    redirect_url: toSafeAdzunaUrl(job.redirect_url),
    salary_min: toNumberOrNull(job.salary_min),
    salary_max: toNumberOrNull(job.salary_max),
    contract_time: typeof job.contract_time === "string" ? job.contract_time : null,
  };
}

// Adzuna wraps matched words in tags like <strong>Java</strong>
// and uses entities like &amp;. The page shows plain text, so
// strip the tags and decode the common entities here.
function toPlainText(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

// Only https links on an Adzuna domain are passed to the page.
function toSafeAdzunaUrl(value) {
  try {
    const url = new URL(value);
    const isAdzunaHost = /(^|\.)adzuna\.[a-z.]+$/i.test(url.hostname);
    return url.protocol === "https:" && isAdzunaHost ? url.href : null;
  } catch (error) {
    return null;
  }
}

function toNumberOrNull(value) {
  const number = Number(value);
  return value !== null && value !== undefined && Number.isFinite(number) && number > 0 ? number : null;
}

// Every error goes back as JSON: { "error": "message" }.
// Errors are never cached, so a fixed problem shows up right away.
function sendError(res, status, message) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json({ error: message });
}
