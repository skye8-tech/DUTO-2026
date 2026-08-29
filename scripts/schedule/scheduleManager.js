// scripts/schedule/scheduleManager.js

const SCHEDULE_KEY = "duto_schedules";

function loadSchedules() {
  let list = loadData(SCHEDULE_KEY, []);
  if (!Array.isArray(list)) return [];
  return list;
}

function saveSchedules(list) {
  saveData(SCHEDULE_KEY, list);
}

function addSchedule(title, subject, date, time, duration, city, notify) {
  let list = loadSchedules();
  let session = {
    id: makeId(),
    title: title,
    subject: subject,
    date: date,
    time: time,
    duration: duration,
    city: city,
    notify: notify
  };
  list.push(session);
  saveSchedules(list);
  return session;
}

function deleteSchedule(sessionId) {
  let list = loadSchedules();
  let newList = [];
  let i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id !== sessionId) {
      newList.push(list[i]);
    }
  }
  saveSchedules(newList);
}

function cityLabel(city) {
  let map = {
    yaounde: "Yaoundé",
    douala: "Douala",
    bafoussam: "Bafoussam",
    bamenda: "Bamenda",
    garoua: "Garoua",
    maroua: "Maroua",
    ngaoundere: "Ngaoundéré",
    other: "Other"
  };
  return map[city] || city;
}

function renderSchedules() {
  let container = document.getElementById("schedule-list-container");
  if (!container) return;

  let list = loadSchedules();
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p class=\"text-muted\">No sessions yet. Schedule one above.</p>";
    return;
  }

  // Show loading text while weather loads
  container.innerHTML = "<p class=\"text-muted\">Loading light estimates…</p>";

  // Fetch light for every session, then draw
  let jobs = [];
  let i;
  for (i = 0; i < list.length; i++) {
    jobs.push(estimateLightFromWeather(list[i].date, list[i].time, list[i].city));
  }

  Promise.all(jobs).then(function (lights) {
    container.innerHTML = "";

    for (i = 0; i < list.length; i++) {
      let s = list[i];
      let light = lights[i];
      let badgeClass = lightBadgeClass(light);
      let tip = lightPrepTip(light);
      let notifyText = s.notify ? "Notification on" : "Notification off";

      let card = document.createElement("div");
      card.className = "schedule-card";
      if (light < 40) {
        card.className = "schedule-card schedule-card-warning";
      }

      card.innerHTML =
        "<div class=\"schedule-card-time\">" +
          "<div class=\"schedule-time\">" + s.time + "</div>" +
          "<div class=\"schedule-date text-xs text-muted\">" + s.date + "</div>" +
          "<div class=\"schedule-duration text-xs text-muted\">" + s.duration + " min</div>" +
        "</div>" +
        "<div class=\"schedule-card-content\">" +
          "<div class=\"schedule-title\">" + s.title + "</div>" +
          "<div class=\"schedule-meta\">" +
            "<span class=\"badge badge-primary\">" + (s.subject || "General") + "</span> " +
            "<span class=\"text-xs text-muted\">" + cityLabel(s.city) + "</span> " +
            "<span class=\"text-xs text-muted\">· " + notifyText + "</span>" +
          "</div>" +
          "<div class=\"schedule-light-row\">" +
            "<span class=\"light-badge " + badgeClass + "\">Light ~" + light + "%</span> " +
            "<span class=\"schedule-prep-tip text-xs\">" + tip + "</span>" +
          "</div>" +
        "</div>" +
        "<div class=\"schedule-card-actions\">" +
          "<button type=\"button\" class=\"btn btn-ghost btn-sm text-danger\" data-delete=\"" + s.id + "\">Delete</button>" +
        "</div>";

      container.appendChild(card);
    }

    let buttons = container.querySelectorAll("[data-delete]");
    for (i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (event) {
        let id = event.target.getAttribute("data-delete");
        deleteSchedule(id);
        renderSchedules();
      });
    }
  });
}

function setupScheduleForm() {
  let form = document.getElementById("schedule-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let title = document.getElementById("schedule-title-input").value.trim();
    let subject = document.getElementById("schedule-subject-input").value.trim();
    let date = document.getElementById("schedule-date-input").value;
    let time = document.getElementById("schedule-time-input").value;
    let duration = document.getElementById("schedule-duration-input").value || "60";
    let city = document.getElementById("schedule-city-input").value;
    let notifyBox = document.getElementById("schedule-notify-checkbox");
    let notify = notifyBox && notifyBox.checked === true;

    if (!title || !date || !time) {
      if (typeof showError === "function") showError("Title, date and time are required.");
      return;
    }

    let session = addSchedule(title, subject, date, time, duration, city, notify);

    if (notify) {
      requestNotificationPermission().then(function () {
        scheduleSessionNotification(session);
      });
    }

    form.reset();
    renderSchedules();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderSchedules();
  setupScheduleForm();
  scheduleAllUpcomingNotifications();
});