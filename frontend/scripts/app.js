/* UI for every app page
theme
require login
mobile sidebar
logout
 */

document.addEventListener("DOMContentLoaded", function () {
  // Theme (light / dark) — works on every page with #theme-toggle-button
  if (typeof setupTheme === "function") {
    setupTheme();
  }

  // Protected pages only (app pages, not login/signup)
  let path = window.location.pathname || "";
  let isAuthPage =
    path.indexOf("login.html") !== -1 ||
    path.indexOf("signup.html") !== -1 ||
    path.indexOf("forgot-password.html") !== -1;

  if (!isAuthPage && typeof requireLogin === "function") {
    requireLogin();
  }

  // Mobile sidebar open / close
  let menuButton = document.getElementById("mobile-menu-toggle");
  let sidebar = document.getElementById("app-sidebar");
  let overlay = document.getElementById("sidebar-overlay");

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    if (overlay) overlay.classList.add("active");
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
  }

  if (menuButton && sidebar) {
    menuButton.addEventListener("click", function () {
      if (sidebar.classList.contains("open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Close sidebar when a nav link is clicked (mobile)
  if (sidebar) {
    let links = sidebar.querySelectorAll(".sidebar-nav a");
    for (let i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        if (window.innerWidth <= 992) {
          closeSidebar();
        }
      });
    }
  }

  // Log out
  let logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (typeof logoutUser === "function") {
        logoutUser();
      }
      window.location.href = "login.html";
    });
  }

  // Optional: show user first name on dashboard welcome
  let welcome = document.getElementById("dashboard-user-name");
  if (welcome && typeof getCurrentUser === "function") {
    let user = getCurrentUser();
    if (user && user.fullName) {
      welcome.textContent = user.fullName.split(" ")[0];
    }
  }
});
