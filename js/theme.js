/* =====================================================
   THEME.JS
   Light Mode / Dark Mode.
   We add or remove the class "dark-mode" on the <body> tag.
   All colors change through the CSS variables defined in
   style.css (:root and body.dark-mode) — JavaScript never
   touches individual colors directly.
   ===================================================== */

// Runs immediately (before the rest of the page loads) so
// there is no flash of the wrong theme.
function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme"); // "dark" or "light"
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
}
applySavedTheme();

document.addEventListener("DOMContentLoaded", function () {
  const themeToggleButtons = document.querySelectorAll(".theme-toggle");
  updateToggleIcon(themeToggleButtons);

  themeToggleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");

      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }

      updateToggleIcon(themeToggleButtons);

      // Small spin animation on the button that was clicked,
      // just for a bit of visual feedback.
      button.classList.add("spin");
      setTimeout(function () {
        button.classList.remove("spin");
      }, 400);
    });
  });
});

function updateToggleIcon(buttons) {
  const isDark = document.body.classList.contains("dark-mode");
  buttons.forEach(function (button) {
    button.textContent = isDark ? "☀️" : "🌙";
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  });
}
