/* =====================================================
   API/JOBS.JS  (Vercel serverless function -> /api/jobs)
   Runs on Vercel's servers, never in the browser. The
   Himalayas jobs API doesn't allow calls straight from a web
   page (no CORS header), so pages/jobs.html calls /api/jobs
   and this function fetches the jobs from Himalayas for it.
   No API key is needed.

   Query params:
     q         - keyword (default "software", max 60 characters)
     type      - optional: "Intern" or "Full Time"
     seniority - optional: "Entry-level"
     page      - results page, starting at 1 (default 1)

   Himalayas updates its jobs once a day, so results are cached
   on Vercel's CDN for 6 hours. That keeps us well under their
   shared rate limit.
   ===================================================== */

const HIMALAYAS_SEARCH_URL = "https://himalayas.app/jobs/api/search";
const DEFAULT_KEYWORD = "software";
const MAX_KEYWORD_LENGTH = 60;
const MAX_PAGE = 100;
const ALLOWED_TYPES = ["Intern", "Full Time"];
const ALLOWED_SENIORITY = ["Entry-level"];
const HIMALAYAS_TIMEOUT_MS = 10000; // give up on Himalayas after 10 seconds
const CACHE_HEADER = "s-maxage=21600, stale-while-revalidate=3600"; // 6 hours (+1 hour stale)

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Only GET requests are allowed.");
  }

  const input = readSearchInput(req.url);
  if (input.error) return sendError(res, 400, input.error);

  let himalayasResponse;
  try {
    himalayasResponse = await fetch(buildHimalayasUrl(input), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(HIMALAYAS_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Himalayas request failed:", error.name, error.message);
    return sendError(res, 502, "Could not reach the Himalayas jobs service. Please try again.");
  }

  if (himalayasResponse.status === 429) {
    return sendError(res, 429, "Too many requests, please try again in a minute");
  }

  const data = await himalayasResponse.json().catch(() => null);

  if (!himalayasResponse.ok || !data) {
    console.error("Himalayas error:", himalayasResponse.status);
    const status = himalayasResponse.ok ? 502 : himalayasResponse.status;
    return sendError(res, status, `The Himalayas jobs service returned an error (${himalayasResponse.status}). Please try again later.`);
  }

  res.setHeader("Cache-Control", CACHE_HEADER);
  return res.status(200).json({
    totalCount: Number(data.totalCount) || 0,
    page: input.page,
    jobs: (Array.isArray(data.jobs) ? data.jobs : []).map(toJob),
  });
}

// Reads and checks the query string. Returns { q, type, seniority, page }
// or { error } with a message explaining what's wrong.
function readSearchInput(requestUrl) {
  const params = new URL(requestUrl, "http://localhost").searchParams;
  const q = (params.get("q") || "").trim().slice(0, MAX_KEYWORD_LENGTH);
  const type = (params.get("type") || "").trim();
  const seniority = (params.get("seniority") || "").trim();
  const pageText = (params.get("page") || "1").trim();

  if (type && !ALLOWED_TYPES.includes(type)) {
    return { error: `type must be one of: ${ALLOWED_TYPES.join(", ")}.` };
  }
  if (seniority && !ALLOWED_SENIORITY.includes(seniority)) {
    return { error: `seniority must be: ${ALLOWED_SENIORITY.join(", ")}.` };
  }

  const page = Number(pageText);
  if (!/^\d+$/.test(pageText) || page < 1 || page > MAX_PAGE) {
    return { error: `page must be a whole number from 1 to ${MAX_PAGE}.` };
  }

  return { q: q || DEFAULT_KEYWORD, type, seniority, page };
}

function buildHimalayasUrl({ q, type, seniority, page }) {
  const params = new URLSearchParams({ q: q, country: "India", page: String(page) });
  if (type) params.set("employment_type", type);
  if (seniority) params.set("seniority", seniority);
  return `${HIMALAYAS_SEARCH_URL}?${params}`;
}

// Keeps only the fields the Jobs page needs.
function toJob(job) {
  return {
    title: toText(job.title),
    companyName: toText(job.companyName),
    companyLogo: toHttpsUrl(job.companyLogo),
    employmentType: toText(job.employmentType),
    seniority: toTextList(job.seniority),
    locationRestrictions: toTextList(job.locationRestrictions),
    minSalary: toNumberOrNull(job.minSalary),
    maxSalary: toNumberOrNull(job.maxSalary),
    currency: toText(job.currency),
    salaryPeriod: toText(job.salaryPeriod),
    pubDate: toNumberOrNull(job.pubDate), // Unix time in seconds
    applicationLink: toHttpsUrl(job.applicationLink),
    guid: toText(job.guid),
  };
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Seniority and location come as lists of strings (seniority
// is sometimes a single string, so wrap it in a list).
function toTextList(value) {
  const list = Array.isArray(value) ? value : [value];
  return list.filter((item) => typeof item === "string" && item.trim() !== "");
}

// Logos and apply links must be https:// links, otherwise null.
function toHttpsUrl(value) {
  return typeof value === "string" && value.startsWith("https://") ? value : null;
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
