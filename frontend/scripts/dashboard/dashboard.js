// Live dashboard data from localStorage add the backend latter if your seeing this

function getTasksSafe() {
  if (typeof loadTasks === "function") {
    return loadTasks();
  }
  let t = loadData("duto_tasks", []);
  return Array.isArray(t) ? t : [];
}

function getSchedulesSafe() {
  if (typeof loadSchedules === "function") {
    return loadSchedules();
  }
  let s = loadData("duto_schedules", []);
  return Array.isArray(s) ? s : [];
}

function getPomodoroStatsSafe() {
  let stats = loadData("duto_pomodoro_stats", null);
  if (!stats || typeof stats !== "object") {
    return { sessionsToday: 0, minutesFocused: 0, streak: 0 };
  }
  return stats;
}

function todayISO() {
  let d = new Date();
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function priorityClass(priority) {
  if (priority === "high") return "priority-high";
  if (priority === "medium") return "priority-medium";
  return "priority-low";
}

function priorityLabel(priority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

// Welcome name
function renderWelcomeName() {
  let user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  let nameSpan = document.getElementById("dashboard-user-name");
  if (user && nameSpan) {
    nameSpan.textContent = user.fullName;
  }
}

// Today's tasks 
function renderDashboardTasks() {
  let list = document.getElementById("today-tasks-list");
  if (!list) return;

  let tasks = getTasksSafe();
  let today = todayISO();

  // Prefer tasks due today, else show incomplete ones
  let filtered = [];
  let i;
  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) continue;
    if (!tasks[i].dueDate || tasks[i].dueDate === today) {
      filtered.push(tasks[i]);
    }
  }

  // If none due today, show any incomplete
  if (filtered.length === 0) {
    for (i = 0; i < tasks.length; i++) {
      if (!tasks[i].completed) {
        filtered.push(tasks[i]);
      }
    }
  }

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = "<p class=\"text-sm text-muted\">No tasks for today.</p>";
    return;
  }

  let max = Math.min(filtered.length, 5);
  for (i = 0; i < max; i++) {
    let task = filtered[i];
    let due = task.dueDate ? "Due " + task.dueDate : "No due date";

    let row = document.createElement("div");
    row.className = "task-card";
    row.innerHTML =
      "<input type=\"checkbox\" class=\"task-checkbox\" disabled " +
      (task.completed ? "checked" : "") +
      ">" +
      "<div class=\"task-content\">" +
        "<div class=\"task-title\">" + task.title + "</div>" +
        "<div class=\"task-meta\">" +
          "<span class=\"badge " + priorityClass(task.priority) + "\">" +
          priorityLabel(task.priority) +
          "</span> " +
          "<span>" + due + "</span>" +
        "</div>" +
      "</div>";
    list.appendChild(row);
  }
}

// Upcoming schedules 
function renderDashboardSchedules() {
  let list = document.getElementById("upcoming-schedule-list");
  if (!list) return;

  let sessions = getSchedulesSafe();
  let now = new Date();

  // Sort by date + time
  sessions.sort(function (a, b) {
    let da = a.date + "T" + a.time;
    let db = b.date + "T" + b.time;
    if (da < db) return -1;
    if (da > db) return 1;
    return 0;
  });

  let upcoming = [];
  for (let i = 0; i < sessions.length; i++) {
    let when = new Date(sessions[i].date + "T" + sessions[i].time + ":00");
    if (when.getTime() >= now.getTime() - 60 * 60 * 1000) {
      upcoming.push(sessions[i]);
    }
  }

  list.innerHTML = "";

  if (upcoming.length === 0) {
    list.innerHTML = "<p class=\"text-sm text-muted\">No upcoming sessions.</p>";
    return;
  }

  let max = Math.min(upcoming.length, 5);
  for (i = 0; i < max; i++) {
    let s = upcoming[i];
    let row = document.createElement("div");
    row.className = "dashboard-quick-item";
    row.innerHTML =
      "<span class=\"schedule-time text-sm font-bold text-accent\">" + s.time + "</span>" +
      "<span class=\"flex-1\">" + s.title + "</span>" +
      "<span class=\"text-xs text-muted\">" + s.date + "</span>";
    list.appendChild(row);
  }
}

// Pomodoro stats
function renderDashboardPomodoro() {
  let stats = getPomodoroStatsSafe();

  let countEl = document.getElementById("pomodoro-sessions-count");
  if (countEl) {
    countEl.textContent = String(stats.sessionsToday || 0);
  }

  
  let cards = document.querySelectorAll(".dashboard-pomodoro p.text-sm");
  if (cards.length > 0) {
    let mins = stats.minutesFocused || 0;
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    cards[0].textContent = h + "h " + String(m).padStart(2, "0") + "m focused time";
  }
}

// Productivity score
function renderProductivity() {
  let tasks = getTasksSafe();
  let total = tasks.length;
  let done = 0;
  let i;

  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) done++;
  }

  let percent = 0;
  if (total > 0) {
    percent = Math.round((done / total) * 100);
  }

  let scoreEl = document.getElementById("productivity-score");
  let barEl = document.getElementById("productivity-progress");

  if (scoreEl) scoreEl.textContent = percent + "%";
  if (barEl) barEl.style.width = percent + "%";
}

// Recent activity
function renderRecentActivity() {
  let list = document.getElementById("recent-activity-list");
  if (!list) return;

  let items = [];
  let tasks = getTasksSafe();
  let sessions = getSchedulesSafe();
  let stats = getPomodoroStatsSafe();
  let i;

  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      items.push("Completed \"" + tasks[i].title + "\"");
    }
  }

  if (stats.sessionsToday > 0) {
    items.push("Finished " + stats.sessionsToday + " Pomodoro session(s) today");
  }

  for (i = 0; i < Math.min(sessions.length, 2); i++) {
    items.push("Scheduled \"" + sessions[i].title + "\"");
  }

  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = "<p class=\"text-sm text-muted\">No recent activity yet.</p>";
    return;
  }

  let max = Math.min(items.length, 5);
  for (i = 0; i < max; i++) {
    let row = document.createElement("div");
    row.className = "activity-item";
    row.innerHTML =
      "<div class=\"activity-dot\"></div>" +
      "<div><div>" + items[i] + "</div></div>";
    list.appendChild(row);
  }
}

function getNotesSafe() {
  let notes = loadData("duto_notes", []);
  if (!Array.isArray(notes)) return [];
  return notes;
}

function renderDashboardNotes() {
  let list = document.getElementById("quick-notes-list");
  if (!list) return;

  let notes = getNotesSafe();

  list.innerHTML = "";

  if (notes.length === 0) {
    list.innerHTML = "<p class=\"text-sm text-muted\">No notes yet.</p>";
    return;
  }

  let max = Math.min(notes.length, 5);
  let i;
  for (i = 0; i < max; i++) {
    let n = notes[i];
    let row = document.createElement("div");
    row.className = "dashboard-quick-item";
    row.textContent = n.title || "Untitled note";
    list.appendChild(row);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("dashboard-user-name") &&
      !document.getElementById("today-tasks-list")) {
    return;
  }

  renderWelcomeName();
  renderDashboardTasks();
  renderDashboardSchedules();
  renderDashboardPomodoro();
  renderProductivity();
  renderRecentActivity();
  renderDashboardNotes();
});