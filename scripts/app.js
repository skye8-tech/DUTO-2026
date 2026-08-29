/**
 * Shared UI: theme, login gate, sidebar, logout, notification badges
 */

function refreshNavBadges() {
  let bell = document.getElementById("notification-bell");
  if (!bell) return;

  let count = 0;
  try {
    if (typeof countUnreadNotifications === "function") {
      count = countUnreadNotifications();
    } else if (typeof getPendingInvitesForMe === "function") {
      count = getPendingInvitesForMe().length;
    }
    if (typeof countUnreadMessages === "function") {
      // optional: messages contribute if we only have one badge
    }
  } catch (e) {}

  let badge = document.getElementById("notif-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.id = "notif-badge";
    badge.style.cssText =
      "position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 4px;" +
      "border-radius:999px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;" +
      "line-height:16px;text-align:center;display:none;";
    bell.style.position = "relative";
    bell.appendChild(badge);
  }
  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof setupTheme === "function") setupTheme();

  let path = window.location.pathname || "";
  let isAuthPage =
    path.indexOf("login.html") !== -1 ||
    path.indexOf("signup.html") !== -1 ||
    path.indexOf("forgot-password.html") !== -1;

  if (!isAuthPage && typeof requireLogin === "function") {
    requireLogin();
  }

  let menuButton = document.getElementById("mobile-menu-toggle");
  let sidebar = document.getElementById("app-sidebar");
  let overlay = document.getElementById("sidebar-overlay");

  function openSidebar() {
    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("active");
  }
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
  }

  if (menuButton && sidebar) {
    menuButton.addEventListener("click", function () {
      if (sidebar.classList.contains("open")) closeSidebar();
      else openSidebar();
    });
  }
  if (overlay) overlay.addEventListener("click", closeSidebar);

  if (sidebar) {
    let links = sidebar.querySelectorAll(".sidebar-nav a");
    for (let i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        if (window.innerWidth <= 992) closeSidebar();
      });
    }
  }

  let logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (typeof logoutUser === "function") logoutUser();
      window.location.href = "login.html";
    });
  }

  let welcome = document.getElementById("dashboard-user-name");
  if (welcome && typeof getCurrentUser === "function") {
    let user = getCurrentUser();
    if (user && user.fullName) {
      welcome.textContent = user.fullName.split(" ")[0];
    }
  }

  // Notification bell → notifications page
  let bell = document.getElementById("notification-bell");
  if (bell) {
    bell.addEventListener("click", function () {
      window.location.href = "notifications.html";
    });
  }

  refreshNavBadges();
  setInterval(refreshNavBadges, 15000);
});
