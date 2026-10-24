# Placement Prep Portal

A frontend-only website that helps students prepare for campus placements —
aptitude, coding, DSA, and interviews — all from one platform.

## Description

Final-year students preparing for campus recruitment usually rely on many
scattered resources: one site for aptitude, another for coding practice,
random PDFs for interview questions. **Placement Prep Portal** brings all
of this into a single, simple website built around four preparation paths
— Aptitude & Reasoning, Coding & DSA, Interview Preparation, and Mock
Tests — with a searchable resource library, company-wise prep cards, and
a working sample mock test.

## Technologies

- HTML5
- CSS3 (Flexbox, CSS Grid, media queries, CSS variables, transitions)
- Vanilla JavaScript (no frameworks, no libraries)
- Browser `localStorage` for demo user data and theme (no backend, no database)

JavaScript Promises (`new Promise`, `.then/.catch/.finally`, `Promise.all`,
`Promise.allSettled`, `Promise.race`, `async/await`) are used inside real
features. See [PROMISES.md](PROMISES.md) for where each one is and how to
see it working.

## Features

| Feature | Description |
|---|---|
| Fixed Navigation | Navy navbar, stays visible on scroll, present on every page |
| Light / Dark Mode | Toggle in navbar, saved with `localStorage`, persists across pages |
| Hero Section | Two-column layout with a preparation "dashboard" visual |
| Search Section | Homepage search bar + topic chips that jump to filtered resources |
| Statistics | Quick numbers about the platform |
| Preparation Categories | Aptitude, Coding, DSA and Interview topic lists |
| Feature Grid | Built with CSS Grid, 4 columns → 2 → 1 responsively |
| Company Preparation | 8 company cards with a simple click interaction |
| Mock Tests | Three working tests with scoring and instant answer feedback: Aptitude (5 questions), Coding Basics (10 questions from an online question bank, with built-in backup questions) and Interview Basics (10 HR + technical questions) |
| Resources Page | 12 topic cards (CSS Grid) with a live JavaScript search |
| Sign Up | Full registration form with validation + CAPTCHA, saved to `localStorage` |
| Sign In | Compares entered credentials with the saved user, includes CAPTCHA and Show/Hide Password; redirects straight into the Dashboard on success |
| Dashboard | Auth-protected page: overall readiness ring, per-category progress bars, mock test history table, editable profile, and quick action buttons |
| Logout | Clears the logged-in state, redirects home, and alerts the user |
| About Us | Mission, vision, and a simple team section |
| Contact Us | Validated contact form with a success message |
| Loading Screen | Navy overlay with a spinner shown while the page loads |
| Active Nav Highlight | Current page is highlighted (orange underline) in the navbar |
| Responsive Design | Mobile (320–480px), Tablet (768–1024px), Desktop (1200px+) |

## Folder Structure

```text
Placement-Prep-Portal/
│
├── loading.html            → Optional splash screen (CSS-only progress bar)
│                              that auto-redirects into index.html
├── index.html              → Homepage (hero, search, stats, categories,
│                              feature grid, companies, mock test, footer)
│
├── pages/
│   ├── login.html           → Sign In page
│   ├── signup.html          → Sign Up / registration page
│   ├── resources.html       → Resource library (CSS Grid) with search
│   ├── resource-detail.html → Links for one topic (?topic=...), in six categories
│   ├── dashboard.html       → Logged-in student dashboard
│   ├── about.html           → About Us page
│   ├── privacy.html         → Privacy Policy (what is stored, and where)
│   ├── terms.html           → Terms & Conditions
│   └── contact.html         → Contact Us page
│
├── css/
│   ├── style.css             → Variables, layout, and all main component styles
│   ├── responsive.css        → All media queries (mobile/tablet/desktop)
│   └── forms.css              → Login/Signup/Contact form and CAPTCHA styling
│
├── js/
│   ├── main.js                 → Loading screen, hamburger menu, active link,
│   │                              logout, search, company cards, mock test quiz,
│   │                              explore-click tracking, scroll reveal, ripple
│   ├── auth.js                  → CAPTCHA, signup validation, login validation,
│   │                              show/hide password
│   ├── theme.js                  → Light/dark mode toggle and localStorage persistence
│   ├── contact.js                 → Contact form validation and submission
│   ├── resource-detail.js         → Topic links + L()/B()/YT()/G() helpers
│   └── dashboard.js                → Dashboard-only: readiness stats, progress bars,
│                                      mock test history, profile editing
│
├── loading.html             → Standalone auto-redirecting loading screen
│
└── README.md
```

All links between pages use **relative paths only** — for example,
`pages/login.html` from the homepage, and `../index.html` from inside
`pages/`. There are no absolute paths anywhere in the project.

## Color Palette

| Role | Color | Hex |
|---|---|---|
| Navbar, footer, headings | Navy | `#0B203C` |
| Primary buttons, links | Teal | `#10A5B2` |
| CTAs, highlights, active states | Orange | `#F5A524` |
| Page background | Light gray | `#F4F7FA` |
| Cards | White | `#FFFFFF` |
| Body text | Dark gray | `#1F2937` |

Applied roughly 60% white/light-gray, 25% navy, 10% teal, 5% orange, kept
consistent across every page and in dark mode (where the same variable
names simply point to darker values).

## Responsive Design

- **Mobile (320px–480px):** single-column layout, hamburger menu, stacked
  cards, full-width buttons.
- **Tablet (768px–1024px):** two-column layouts for categories, the
  feature grid, resource cards, and the footer.
- **Desktop (1200px+):** the full multi-column layout — two-column hero,
  four-column feature grid, four-column company grid, four-column footer.

Resize the browser window (or use DevTools' device toolbar) to see all
three breakpoints in action.

## Authentication

Sign Up and Sign In are built entirely with JavaScript and `localStorage`
for demonstration purposes, as required for a frontend-only college
project. Every account is saved in one JSON array under the `users` key,
so several students can sign up in the same browser. Sign Up refuses an
email that already has an account, and Sign In finds the account by email
(ignoring upper/lower case) and compares the password. Each student's mock
test history, resource clicks and GitHub cache are saved separately under
`<key>:<email>` (for example `mockTestHistory:asha@example.com`) using the
`userKey()` helper in `js/main.js`. Data from the older single-user version
(`registeredUser`) is moved across automatically. This is **not** a secure,
production-grade authentication system — a real website would need a
backend server, a database, and properly hashed passwords. This
limitation is intentional and expected for this assignment.

## Dark Mode

Dark mode is built with CSS custom properties (variables). `:root` defines
one set of values (light mode); `body.dark-mode` defines a second set of
the *same* variable names with darker colors. A single JavaScript function
toggles the `dark-mode` class on `<body>` and saves the choice with
`localStorage.setItem("theme", "dark")`, so no CSS ever needs to be
swapped or duplicated.

## CAPTCHA

`generateCaptcha()` builds a random 5-character string from a fixed set of
letters and numbers using `Math.random()`. It's displayed on screen and
also stored in a `data-captcha` attribute. When the form is submitted, the
value the user typed is compared (case-insensitive) against that stored
attribute. The refresh button just calls the same generator again.

## Dashboard

`pages/dashboard.html` is a protected page — a small inline script in its
`<head>` checks `localStorage.getItem("loggedInUser")` the instant the
page starts loading and redirects to Sign In if nobody is logged in, so
there's no flash of dashboard content before the redirect happens.

Everything shown on it is calculated from data already in `localStorage`:

- **Overall Readiness ring** — an average of four category percentages,
  rendered with a CSS `conic-gradient` whose stop point is set by
  JavaScript based on the calculated percentage.
- **Category progress bars** — worked out from the student's own test
  results by `calculateReadiness()` in `js/main.js`, which the homepage
  uses too, so both always match. Aptitude and Interview = best score in
  that test. Coding & DSA = 80% from the best Coding Basics score + 20%
  from resources explored (the `resourceClicks` counter; 5 clicks gives
  the full 20%). Mock Tests = how many of the 3 tests were passed with
  60% or more. A "Next step" line under the bars points at the lowest one.
- **Mock Test History table** — every completed mock test is saved as
  `{ date, time, test, score, total }` into a `mockTestHistory` array in
  `localStorage` (capped at the 50 most recent), then rendered with
  `.map()` into table rows.
- **Homepage Readiness Score** — when logged in, the hero card shows the
  same overall readiness as the ring; logged out, it shows a sample 82.
- **Editable profile** — toggling "Edit Profile" reveals a small form;
  saving it merges the changes into the stored user object with the
  spread operator (`{ ...user, college: newValue }`) and re-renders.

This page (`js/dashboard.js`) intentionally uses a few more advanced
JavaScript ideas than the rest of the project — arrow functions, array
methods (`map`, `reduce`, `filter`), destructuring, and the spread
operator — since these are common in real-world JavaScript and are
usually only lightly covered in a viva focused mainly on HTML/CSS. Every
function is still short and commented so it's still explainable if asked.

## Team Details
**Team Leader** : Ridhi Jain

**Team Members** : Ryan Sharma, Garv Goel, Kartik Thakur
