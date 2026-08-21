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
| Mock Tests | A real 5-question Aptitude quiz with scoring, plus two "coming soon" cards |
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
│   ├── dashboard.html       → Logged-in student dashboard
│   ├── about.html           → About Us page
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
│   └── dashboard.js                → Dashboard-only: readiness stats, progress bars,
│                                      mock test history, profile editing
│
├── loading.html             → Standalone auto-redirecting loading screen
│
├── assets/
│   ├── images/                    → (reserved for any images you add)
│   └── icons/                      → (reserved for any icons you add)
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
project. `localStorage.setItem("registeredUser", ...)` saves the signed-up
user as a JSON string; Sign In reads it back with `JSON.parse()` and
compares the entered email/password against it. This is **not** a secure,
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
- **Category progress bars** — Aptitude is 100% once at least one mock
  test has been attempted; Coding/DSA and Interview Prep scale with a
  `resourceClicks` counter (incremented every time an "Explore" button is
  clicked anywhere on the site); Mock Tests scales with how many attempts
  are on record.
- **Mock Test History table** — every completed mock test is saved as
  `{ date, score, total }` into a `mockTestHistory` array in
  `localStorage` (capped at the 10 most recent), then rendered with
  `.map()` into table rows.
- **Editable profile** — toggling "Edit Profile" reveals a small form;
  saving it merges the changes into the stored user object with the
  spread operator (`{ ...user, college: newValue }`) and re-renders.

This page (`js/dashboard.js`) intentionally uses a few more advanced
JavaScript ideas than the rest of the project — arrow functions, array
methods (`map`, `reduce`, `filter`), destructuring, and the spread
operator — since these are common in real-world JavaScript and are
usually only lightly covered in a viva focused mainly on HTML/CSS. Every
function is still short and commented so it's still explainable if asked.

## How to Run

1. Download or clone the project folder.
2. Open `index.html` directly in a browser, **or**
3. In VS Code, install the "Live Server" extension, right-click
   `index.html` specifically, and choose **"Open with Live Server"**.

No installation, build step, or server setup is required — it's plain
HTML, CSS, and JavaScript.

---

## Viva Preparation Guide

Short, simple answers you can memorize and explain naturally.

### HTML

**1. What is semantic HTML?**
Using tags that describe what the content *means*, not just how it looks
— e.g. `<nav>` instead of a plain `<div>`. It helps browsers, screen
readers, and other developers understand the page.

**2. Why did you use `<header>`?**
To wrap the introductory content of each page — the logo and the
navigation bar.

**3. What is the purpose of `<nav>`?**
It marks the block of navigation links specifically, so assistive
technology can jump straight to it.

**4. Difference between `<section>` and `<article>`?**
`<section>` groups a distinct part of a page (like the hero or the
stats). `<article>` is content that could stand alone, like a single
feature card or resource card.

**5. Why use `<form>`?**
It groups related input fields together and lets the browser handle
built-in behaviors like submitting on Enter and basic validation
attributes.

**6. Why is `index.html` used as the homepage?**
Web servers automatically look for a file named `index.html` when no
specific page is requested — it's the standard default filename.

### CSS

**7. What is Flexbox?**
A one-dimensional layout system — for lining things up in a single row
or column, like the navbar links.

**8. What is CSS Grid?**
A two-dimensional layout system — rows *and* columns together, like the
4-column feature section. `grid-template-columns` sets how many columns
appear.

**9. Why did you use Grid?**
The feature cards, resource cards, and company cards all need to line
up in a clean, even grid that reflows into fewer columns on smaller
screens — Grid does that with one line of CSS.

**10. What is a media query?**
A CSS rule that only applies when the screen matches a certain
condition, like `@media (max-width: 768px)`, which is how the layout
adapts from desktop to tablet to mobile.

**11. How did you make the navbar fixed?**
`position: fixed; top: 0;` takes the navbar out of the normal page flow
and pins it to the same screen position even while scrolling. The page
content below gets extra top padding so it isn't hidden underneath.

**12. How did you make the website responsive?**
By combining flexible layouts (Flexbox/Grid), relative units, and media
queries, so the same HTML reflows into different column counts at
different screen widths instead of breaking.

**13. How did you implement dark mode?**
CSS variables. `:root` defines one set of colors; `body.dark-mode`
defines the same variable names with dark colors. JavaScript just adds
or removes the `dark-mode` class — every element using `var(--bg)` etc.
updates automatically.

### JavaScript

**14. What is DOM?**
The Document Object Model — the browser's in-memory tree representation
of the HTML page, which JavaScript can read and change.

**15. What is `addEventListener()`?**
A method that attaches a function to run when a specific event (like a
click) happens on an element, without writing JavaScript inside the
HTML itself.

**16. How does the hamburger menu work?**
Clicking the hamburger button toggles an `open` class on both the
button and the nav-links list using `classList.toggle()`. CSS rules for
`.open` decide how the menu looks when shown.

**17. How does CAPTCHA work?**
`generateCaptcha()` picks 5 random characters using `Math.random()` and
displays them, also saving the value in a `data-captcha` attribute. On
submit, the typed value is compared against that stored value.

**18. How does login work?**
The registered user's details, saved during Sign Up, are read back from
`localStorage` with `JSON.parse()`. The entered email and password are
compared against them, and if they match, `loggedInUser` is saved to
mark the session as signed in.

**19. How does `localStorage` work?**
It's small key-value storage built into the browser that survives page
reloads and new tabs. `setItem()` saves data, `getItem()` reads it
back, and `JSON.stringify()`/`JSON.parse()` convert objects to and from
text, since localStorage only stores strings.

**20. How does logout work?**
`localStorage.removeItem("loggedInUser")` clears the session,
`window.location.href` redirects to the homepage, and an `alert()`
confirms the logout.

**21. How does the loading screen work?**
An overlay `<div>` covers the page while it loads. Once the browser's
`load` event fires (everything, including images, has finished
loading), JavaScript adds a `hidden` class that fades it out with a CSS
transition.

**22. How does form validation work?**
On `submit`, each field's value is checked against simple rules (empty
check, a regular expression for email/phone), and an error message is
shown next to the field if it fails, using `classList.add("show")` on a
hidden `<p class="error-msg">` element.

**23. How does resource search work?**
Every resource card carries its topic name in a `data-name` attribute.
On every keystroke in the search box, a loop checks whether each card's
`data-name` includes the typed text (case-insensitive) and shows or
hides the card with `element.style.display`.
