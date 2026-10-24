/* =====================================================
   RESOURCE-DETAIL.JS
   Runs only on pages/resource-detail.html. Reads the topic from
   the URL (e.g. resource-detail.html?topic=hr-interviews), then
   shows that topic's links in six categories. Clicking a
   category button swaps the list of links below it.

   To add a new topic: add an entry to RESOURCE_TOPICS using the
   helpers below, then link its Explore button on resources.html
   to resource-detail.html?topic=<its key>.
   ===================================================== */

// The six categories, in the order their buttons are shown.
const RESOURCE_CATEGORIES = [
  { key: "websites", label: "Websites" },
  { key: "youtube", label: "YouTube" },
  { key: "books", label: "Books" },
  { key: "notes", label: "Notes" },
  { key: "extra", label: "Extra Practice" },
  { key: "cho", label: "Cheat Sheets" },
];

/* ---------- LINK HELPERS ---------- */
// Each helper returns one link as { title, note, url }.

// L = a normal link to a website or article.
function L(title, url, note) {
  return { title: title, note: note || "", url: url };
}

// B = a book. Links to a Google Books search for title + author.
function B(title, author) {
  return {
    title: title,
    note: "Book by " + author,
    url: "https://www.google.com/search?tbm=bks&q=" + encodeURIComponent(title + " " + author),
  };
}

// YT = a YouTube search, so the link keeps working even if a
// channel changes its URL.
function YT(channel, searchText) {
  return {
    title: channel,
    note: "YouTube",
    url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(searchText),
  };
}

// G = a Google search, for guides that many sites cover well.
function G(title, searchText) {
  return {
    title: title,
    note: "Google search",
    url: "https://www.google.com/search?q=" + encodeURIComponent(searchText),
  };
}

/* ---------- TOPICS ---------- */
const RESOURCE_TOPICS = {
  "technical-interviews": {
    title: "Technical Interviews",
    intro: "Practise the coding, DSA and core CS questions asked in technical rounds, and learn how to explain your thinking out loud.",
    websites: [
      L("GeeksforGeeks Interview Corner", "https://www.geeksforgeeks.org/interview-experiences/company-interview-corner/", "Company-wise questions and interview experiences"),
      L("InterviewBit", "https://www.interviewbit.com/", "Structured coding interview practice"),
      L("LeetCode Interview", "https://leetcode.com/explore/interview/", "Interview question sets on LeetCode Explore"),
      L("Pramp", "https://www.pramp.com/", "Free peer-to-peer mock interviews"),
      L("Tech Interview Handbook", "https://www.techinterviewhandbook.org/", "Free guide to the whole technical interview process"),
    ],
    youtube: [
      YT("take U forward (Striver)", "take U forward striver DSA"),
      YT("Apna College", "Apna College placement interview preparation"),
      YT("NeetCode", "NeetCode coding interview"),
    ],
    books: [
      B("Cracking the Coding Interview", "Gayle Laakmann McDowell"),
      B("Programming Interviews Exposed", "John Mongan"),
    ],
    notes: [
      L("Coding Interview Prep Guide", "https://www.techinterviewhandbook.org/coding-interview-prep/", "Free article: how to prepare step by step"),
    ],
    extra: [
      L("InterviewBit Mock Interviews", "https://www.interviewbit.com/mock-interview/", "Timed mock interviews to practise under pressure"),
    ],
    cho: [
      L("Algorithms Study Cheat Sheet", "https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/", "Tech Interview Handbook quick revision sheet"),
    ],
  },
  "hr-interviews": {
    title: "HR Interviews",
    intro: "Prepare for behavioural questions, talking through your resume and showing good communication in HR rounds.",
    websites: [
      L("Indeed Career Advice", "https://www.indeed.com/career-advice/interviewing", "Articles on every stage of the interview"),
      L("The Muse Interview Questions", "https://www.themuse.com/advice/interview-questions-and-answers", "Common questions with sample answers"),
      L("Glassdoor Interview Questions", "https://www.glassdoor.co.in/Interview/index.htm", "Real questions shared by candidates, by company"),
      L("LinkedIn Learning Interview Tips", "https://www.linkedin.com/learning/search?keywords=job%20interview", "Short video courses on interviewing"),
    ],
    youtube: [
      YT("Jeff Su", "Jeff Su job interview tips"),
      YT("Andrew LaCivita", "Andrew LaCivita interview questions and answers"),
    ],
    books: [
      B("Knock 'em Dead Job Interview", "Martin Yate"),
      B("101 Great Answers to the Toughest Interview Questions", "Ron Fry"),
    ],
    notes: [
      L("Top Interview Questions and Answers", "https://www.indeed.com/career-advice/interviewing/top-interview-questions-and-answers", "Free Indeed article with example answers"),
    ],
    extra: [
      G("STAR Method Guide", "STAR method interview answers guide with examples"),
    ],
    cho: [
      G("Common HR Questions Cheat Sheet", "common HR interview questions and answers cheat sheet"),
    ],
  },
};

/* ---------- PAGE SETUP ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.getElementById("resource-tabs");
  const list = document.getElementById("resource-list");
  if (!tabs || !list) return;

  const topicKey = new URLSearchParams(window.location.search).get("topic");

  // hasOwnProperty makes sure only our own topics are accepted
  // (not built-in names like "toString").
  if (!topicKey || !Object.prototype.hasOwnProperty.call(RESOURCE_TOPICS, topicKey)) {
    showTopicNotFound(list);
    return;
  }

  const topic = RESOURCE_TOPICS[topicKey];
  document.title = topic.title + " | Placement Prep Portal";
  document.getElementById("topic-title").textContent = topic.title;
  document.getElementById("topic-intro").textContent = topic.intro;

  renderCategoryTabs(tabs, list, topic);
});

// One button per category. The pressed one gets aria-pressed="true"
// (styled by the existing .chip[aria-pressed="true"] rule).
function renderCategoryTabs(tabs, list, topic) {
  const buttons = RESOURCE_CATEGORIES.map(function (category) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = category.label;
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", function () {
      buttons.forEach(function (other) {
        other.setAttribute("aria-pressed", "false");
      });
      button.setAttribute("aria-pressed", "true");
      renderLinks(list, topic[category.key] || []);
    });

    return button;
  });

  tabs.replaceChildren.apply(tabs, buttons);
  buttons[0].click(); // show Websites first
}

// Draws the links as cards that open in a new tab. Built with
// createElement/textContent, so no text is ever run as HTML.
function renderLinks(list, links) {
  if (links.length === 0) {
    const empty = document.createElement("p");
    empty.className = "resource-empty";
    empty.textContent = "Resources coming soon.";
    list.replaceChildren(empty);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "resource-links";

  links.forEach(function (link) {
    const card = document.createElement("a");
    card.className = "resource-link";
    card.href = link.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const title = document.createElement("span");
    title.className = "resource-link-title";
    title.textContent = link.title + " ↗";

    const note = document.createElement("span");
    note.className = "resource-link-note";
    note.textContent = link.note;

    card.appendChild(title);
    card.appendChild(note);
    grid.appendChild(card);
  });

  list.replaceChildren(grid);
}

function showTopicNotFound(list) {
  document.getElementById("topic-title").textContent = "Topic not found";
  document.getElementById("topic-intro").textContent = "This topic doesn't have a resource page yet.";

  const back = document.createElement("a");
  back.href = "resources.html";
  back.className = "btn btn-outline btn-sm";
  back.textContent = "Back to all resources";
  list.replaceChildren(back);
}
