/**
 * Dashboard — proposal layout:
 * KPIs, upcoming deadlines, overdue, active tasks, project progress, notifications
 */

function getTasksSafe() {
  if (typeof loadTasks === "function") return loadTasks();
  return [];
}

function todayISO() {
  let d = new Date();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function escapeText(t) {
  let d = document.createElement("div");
  d.textContent = t || "";
  return d.innerHTML;
}

function renderWelcomeName() {
  let user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  let el = document.getElementById("dashboard-user-name");
  if (user && el) el.textContent = user.fullName.split(" ")[0];
}

function renderKPIs() {
  let tasks = getTasksSafe();
  let projects =
    typeof getMyProjects === "function"
      ? getMyProjects()
      : typeof loadProjects === "function"
      ? loadProjects()
      : [];

  let activeTasks = 0;
  let done = 0;
  let overdue = 0;
  let today = todayISO();
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) done++;
    else {
      activeTasks++;
      if (tasks[i].dueDate && tasks[i].dueDate < today) overdue++;
    }
  }

  let activeProjects = 0;
  for (let p = 0; p < projects.length; p++) {
    if (projects[p].status !== "completed") activeProjects++;
  }

  setText("kpi-tasks", activeTasks);
  setText("kpi-active-projects", activeProjects);
  setText("kpi-overdue", overdue);
  setText("kpi-done", done);
}

function setText(id, val) {
  let el = document.getElementById(id);
  if (el) el.textContent = String(val);
}

function renderUpcoming() {
  let list = document.getElementById("list-upcoming");
  let empty = document.getElementById("empty-upcoming");
  if (!list) return;
  let tasks = getTasksSafe();
  let today = todayISO();
  let upcoming = [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) continue;
    if (tasks[i].dueDate && tasks[i].dueDate >= today) {
      upcoming.push(tasks[i]);
    }
  }
  upcoming.sort(function (a, b) {
    return (a.dueDate || "").localeCompare(b.dueDate || "");
  });
  upcoming = upcoming.slice(0, 6);
  list.innerHTML = "";
  if (upcoming.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  for (i = 0; i < upcoming.length; i++) {
    let li = document.createElement("li");
    li.innerHTML =
      "<strong>" +
      escapeText(upcoming[i].title) +
      "</strong> · due " +
      escapeText(upcoming[i].dueDate);
    list.appendChild(li);
  }
}

function renderOverdue() {
  let list = document.getElementById("list-overdue");
  let empty = document.getElementById("empty-overdue");
  if (!list) return;
  let tasks = getTasksSafe();
  let today = todayISO();
  let items = [];
  for (let i = 0; i < tasks.length; i++) {
    if (!tasks[i].completed && tasks[i].dueDate && tasks[i].dueDate < today) {
      items.push(tasks[i]);
    }
  }
  list.innerHTML = "";
  if (items.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  for (i = 0; i < items.length; i++) {
    let li = document.createElement("li");
    li.innerHTML =
      "<strong>" +
      escapeText(items[i].title) +
      '</strong> · <span style="color:let(--color-danger)">overdue ' +
      escapeText(items[i].dueDate) +
      "</span>";
    list.appendChild(li);
  }
}

function renderActiveTasks() {
  let list = document.getElementById("list-active-tasks");
  let empty = document.getElementById("empty-active-tasks");
  if (!list) return;
  let tasks = getTasksSafe().filter(function (t) {
    return !t.completed;
  });
  tasks = tasks.slice(0, 8);
  list.innerHTML = "";
  if (tasks.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  for (let i = 0; i < tasks.length; i++) {
    let li = document.createElement("li");
    li.textContent =
      tasks[i].title +
      (tasks[i].priority ? " (" + tasks[i].priority + ")" : "");
    list.appendChild(li);
  }
}

function renderProjects() {
  let box = document.getElementById("list-projects");
  let empty = document.getElementById("empty-projects");
  if (!box) return;
  let projects =
    typeof getMyProjects === "function" ? getMyProjects() : [];
  projects = projects.filter(function (p) {
    return p.status !== "completed";
  });
  box.innerHTML = "";
  if (projects.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  for (let i = 0; i < projects.length; i++) {
    let p = projects[i];
    let pct = typeof projectProgress === "function" ? projectProgress(p) : 0;
    let div = document.createElement("div");
    div.style.marginBottom = "0.85rem";
    div.innerHTML =
      "<div><strong>" +
      escapeText(p.name) +
      "</strong> · " +
      pct +
      "%</div>" +
      '<div class="progress-track"><div class="progress-fill" style="width:' +
      pct +
      '%"></div></div>';
    box.appendChild(div);
  }
}

function renderNotifs() {
  let list = document.getElementById("list-notifications");
  let empty = document.getElementById("empty-notifications");
  if (!list) return;
  let notifs =
    typeof getMyNotifications === "function" ? getMyNotifications() : [];
  notifs = notifs.slice(0, 5);
  list.innerHTML = "";
  if (notifs.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  for (let i = 0; i < notifs.length; i++) {
    let li = document.createElement("li");
    li.textContent = notifs[i].text;
    list.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof requireLogin === "function") requireLogin();
  renderWelcomeName();
  renderKPIs();
  renderUpcoming();
  renderOverdue();
  renderActiveTasks();
  renderProjects();
  renderNotifs();
});
