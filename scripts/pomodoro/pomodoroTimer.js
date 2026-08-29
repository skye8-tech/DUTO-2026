const FOCUS_SECONDS = 25 * 60; // 25 minutes
const POMODORO_STATS_KEY = "duto_pomodoro_stats";

let timerId = null;
let remaining = FOCUS_SECONDS;
let isRunning = false;

function loadPomodoroStats() {
  let stats = loadData(POMODORO_STATS_KEY, null);
  if (!stats || typeof stats !== "object") {
    return {
      sessionsToday: 0,
      minutesFocused: 0,
      streak: 0,
      lastDate: ""
    };
  }
  return stats;
}

function savePomodoroStats(stats) {
  saveData(POMODORO_STATS_KEY, stats);
}

function todayString() {
  let d = new Date();
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function ensureTodayStats() {
  let stats = loadPomodoroStats();
  let today = todayString();

  if (stats.lastDate !== today) {
    // New day
    if (stats.lastDate) {
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let yStr =
        yesterday.getFullYear() +
        "-" +
        String(yesterday.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(yesterday.getDate()).padStart(2, "0");

      if (stats.lastDate === yStr && stats.sessionsToday > 0) {
        stats.streak = (stats.streak || 0) + 1;
      } else if (stats.lastDate !== yStr) {
        stats.streak = 0;
      }
    }
    stats.sessionsToday = 0;
    stats.minutesFocused = 0;
    stats.lastDate = today;
    savePomodoroStats(stats);
  }

  return stats;
}

function formatTime(totalSeconds) {
  let m = Math.floor(totalSeconds / 60);
  let s = totalSeconds % 60;
  let mm = String(m).padStart(2, "0");
  let ss = String(s).padStart(2, "0");
  return mm + ":" + ss;
}

function updateDisplay() {
  let display = document.getElementById("pomodoro-timer-display");
  let bar = document.getElementById("pomodoro-progress-bar");
  let label = document.getElementById("pomodoro-progress-label");
  let sessionInfo = document.getElementById("pomodoro-session-info");

  if (display) {
    display.textContent = formatTime(remaining);
  }

  let done = FOCUS_SECONDS - remaining;
  let percent = Math.round((done / FOCUS_SECONDS) * 100);

  if (bar) {
    bar.style.width = percent + "%";
  }
  if (label) {
    label.textContent = percent + "% complete";
  }

  let stats = ensureTodayStats();
  if (sessionInfo) {
    let nextNum = stats.sessionsToday + 1;
    if (isRunning) {
      sessionInfo.textContent = "Focus Session · Session " + nextNum;
    } else if (remaining < FOCUS_SECONDS) {
      sessionInfo.textContent = "Paused · Session " + nextNum;
    } else {
      sessionInfo.textContent = "Focus Session · Session " + nextNum + " of 4";
    }
  }

  // Stats cards
  let elSessions = document.getElementById("pomodoro-today-sessions");
  let elMinutes = document.getElementById("pomodoro-today-minutes");
  let elStreak = document.getElementById("pomodoro-streak");

  if (elSessions) elSessions.textContent = String(stats.sessionsToday);
  if (elMinutes) elMinutes.textContent = String(stats.minutesFocused);
  if (elStreak) elStreak.textContent = String(stats.streak || 0);
}

function tick() {
  if (remaining <= 0) {
    completeSession();
    return;
  }
  remaining = remaining - 1;
  updateDisplay();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  if (timerId !== null) {
    clearInterval(timerId);
  }

  timerId = setInterval(tick, 1000);
  updateDisplay();
}

function pauseTimer() {
  isRunning = false;
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  updateDisplay();
}

function resetTimer() {
  pauseTimer();
  remaining = FOCUS_SECONDS;
  updateDisplay();
}

function completeSession() {
  pauseTimer();
  remaining = FOCUS_SECONDS;

  let stats = ensureTodayStats();
  stats.sessionsToday = stats.sessionsToday + 1;
  stats.minutesFocused = stats.minutesFocused + 25;
  stats.lastDate = todayString();

  if (!stats.streak || stats.streak < 1) {
    stats.streak = 1;
  }

  savePomodoroStats(stats);
  updateDisplay();

  // Browser notification
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Duto — Pomodoro complete", {
        body: "Focus session finished. Take a short break.",
        tag: "duto-pomodoro-done"
      });
    } catch (e) {}
  } else if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  if (typeof showSuccess === "function") showSuccess("Session complete.");
}

function setupPomodoroButtons() {
  let startBtn = document.getElementById("pomodoro-start-button");
  let pauseBtn = document.getElementById("pomodoro-pause-button");
  let resetBtn = document.getElementById("pomodoro-reset-button");

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      startTimer();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      pauseTimer();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetTimer();
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  //run on pomodoro page
  if (!document.getElementById("pomodoro-timer-display")) {
    return;
  }

  remaining = FOCUS_SECONDS;
  ensureTodayStats();
  updateDisplay();
  setupPomodoroButtons();
});