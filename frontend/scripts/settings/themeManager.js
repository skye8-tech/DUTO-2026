function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  saveData("duto_theme", theme);

  // Update topbar button icon if present
  let button = document.getElementById("theme-toggle-button");
  if (button) {
    if (theme === "dark") {
      button.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
      button.setAttribute("aria-label", "Switch to light mode");
    } else {
      button.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
      button.setAttribute("aria-label", "Switch to dark mode");
    }
  }
}

function getSavedTheme() {
  return loadData("duto_theme", "light");
}

function toggleTheme() {
  let current = document.documentElement.getAttribute("data-theme");
  if (current === "dark") {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }
}

function setupTheme() {
  let saved = getSavedTheme();
  applyTheme(saved);

  let button = document.getElementById("theme-toggle-button");
  if (button) {
    // Avoid double-binding if script runs twice
    if (!button.getAttribute("data-theme-bound")) {
      button.setAttribute("data-theme-bound", "1");
      button.addEventListener("click", function () {
        toggleTheme();
      });
    }
  }
}
