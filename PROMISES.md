# JavaScript Promises in this project

A **Promise** is an object that stands for a value we will get *later*, such as the reply to a network request.
It is always in one of 3 states: **pending** (still waiting), **fulfilled** (finished and gave us a value, via `resolve`) or **rejected** (failed and gave us an error, via `reject`).
Once a Promise is fulfilled or rejected it never changes again. We react to it with `.then()` / `.catch()` / `.finally()`, or with `await` inside an `async` function.

Every example below has a comment starting with `PROMISE DEMO:` above it, so you can find them all by searching the project for **PROMISE DEMO**.

| Promise feature | File | Function | Used by (website feature) | How to see it in the browser |
|---|---|---|---|---|
| `new Promise` with `resolve` | `js/main.js` | `wait(ms)`, awaited in `handleNextQuestion()` | Mock Tests (Aptitude / Coding Basics) | Home page → Mock Tests → start a test, pick an answer, click Next. The green/red feedback stays for 0.8 s (`await wait(FEEDBACK_DELAY_MS)`), then the next question appears. |
| `new Promise` with `reject` | `js/main.js` | `timeout(ms)` | Coding Basics test | DevTools → Network → set throttling to a very slow custom profile (or block `opentdb.com`). After 8 s the timeout rejects and the built-in questions are shown with the note "Couldn't reach the online question bank…". |
| `Promise.race` | `js/main.js` | `fetchWithTimeout(url, ms)`, called by `fetchCodingQuestions()` | Coding Basics test | Normal network: online questions load (fetch wins the race). DevTools → Network → Offline, then click Start: fetch fails first, built-in questions are shown. |
| `.then()` / `.catch()` / `.finally()` | `js/contact.js` | submit handler of `#contact-form` | Contact Us form | Fill in the form and send: success message appears (`.then`). Set Network → Offline and send again: "Could not reach the email service…" (`.catch`). Both times the button goes back from "Sending..." to normal (`.finally`). |
| `Promise.all` | `js/dashboard.js` | `loadGithubData(username)` | Dashboard → GitHub Profile card | Add a GitHub username in Edit Profile. In DevTools → Network you can see the profile and repos requests start at the same time. |
| `Promise.allSettled` | `js/dashboard.js` | `DOMContentLoaded` handler (with `renderGithubCard` + `loadTipOfTheDay`) | Dashboard → GitHub card + Tip of the Day | Open the Dashboard and look at the Console: `Dashboard loaded: 2 fulfilled, 0 rejected`. Block `api.adviceslip.com` in DevTools (right-click the request → Block request URL) and reload: a built-in tip is shown and the console says `1 fulfilled, 1 rejected`. |
| `async` / `await` | `js/main.js`, `js/jobs.js`, `api/jobs.js` | `startCodingTest()`, `loadJobs()`, `handler()` | Coding Basics test, Jobs page, Jobs API (Vercel) | Start the Coding Basics test ("Loading questions..." while it awaits), or open the Jobs page (jobs appear when `await fetchJobs()` finishes). `api/jobs.js` runs on the Vercel server, so it only works on the deployed site or with `vercel dev`. |

## Promise.all vs Promise.allSettled

- `Promise.all([a, b])` rejects as soon as **one** Promise rejects. Use it when you need **all** results (the GitHub card needs both the profile and the repos).
- `Promise.allSettled([a, b])` always waits for **every** Promise and tells you, for each one, whether it was `"fulfilled"` or `"rejected"`. Use it when the tasks are independent (the GitHub card and the tip don't depend on each other).
