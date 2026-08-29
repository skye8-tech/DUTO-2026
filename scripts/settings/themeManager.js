/**
 * Theme: light / dark — applies to <html data-theme="">
 */
function applyTheme(theme) {
  if (theme !== "dark" && theme !== "light") theme = "light";
  document.documentElement.setAttribute("data-theme", theme);
  try {
    if (typeof saveData === "function") {
      saveData("duto_theme", theme);
    } else {
      localStorage.setItem("duto_theme", JSON.stringify(theme));
    }
  } catch (e) {}

  let button = document.getElementById("theme-toggle-button");
  if (button) {
    if (theme === "dark") {
      button.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
      button.setAttribute("title", "Light mode");
      button.setAttribute("aria-label", "Switch to light mode");
    } else {
      button.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
      button.setAttribute("title", "Dark mode");
      button.setAttribute("aria-label", "Switch to dark mode");
    }
  }
}

function getSavedTheme() {
  try {
    if (typeof loadData === "function") {
      return loadData("duto_theme", "light");
    }
    let raw = localStorage.getItem("duto_theme");
    if (!raw) return "light";
    return JSON.parse(raw);
  } catch (e) {
    return "light";
  }
}

function toggleTheme() {
  let current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

function setupTheme() {
  applyTheme(getSavedTheme());
  let button = document.getElementById("theme-toggle-button");
  if (button && !button.getAttribute("data-theme-bound")) {
    button.setAttribute("data-theme-bound", "1");
    button.addEventListener("click", function (e) {
      e.preventDefault();
      toggleTheme();
    });
  }
}

// Apply as early as possible if utilities already loaded
if (document.documentElement) {
  try {
    let early = localStorage.getItem("duto_theme");
    if (early) {
      let t = JSON.parse(early);
      if (t === "dark" || t === "light") {
        document.documentElement.setAttribute("data-theme", t);
      }
    }
  } catch (e2) {}
}
