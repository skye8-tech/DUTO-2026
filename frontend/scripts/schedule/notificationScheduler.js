// Browser notifications for study sessions

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return Promise.resolve("denied");
  }
  if (Notification.permission === "granted") {
    return Promise.resolve("granted");
  }
  if (Notification.permission === "denied") {
    return Promise.resolve("denied");
  }
  return Notification.requestPermission();
}

function showSessionNotification(session) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  let title = "Duto — Time to study";
  let body = session.title + " (" + session.time + ")";
  if (session.subject) {
    body = session.subject + ": " + body;
  }

  try {
    new Notification(title, {
      body: body,
      tag: "studi-schedule-" + session.id
    });
  } catch (e) {
    console.log("Notification error", e);
  }
}

function scheduleSessionNotification(session) {
  if (!session.notify) return;

  let when = new Date(session.date + "T" + session.time + ":00");
  let now = new Date();
  let delay = when.getTime() - now.getTime();

  if (delay <= 0) return;
  if (delay > 24 * 60 * 60 * 1000) return;

  setTimeout(function () {
    showSessionNotification(session);
  }, delay);
}

function scheduleAllUpcomingNotifications() {
  if (typeof loadSchedules !== "function") return;

  let list = loadSchedules();
  let i;
  for (i = 0; i < list.length; i++) {
    scheduleSessionNotification(list[i]);
  }
}