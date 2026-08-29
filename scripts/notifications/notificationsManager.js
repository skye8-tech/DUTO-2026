/**
 * Notifications — localStorage
 */
const NOTIF_KEY = "duto_notifications";

function loadNotifications() {
  return loadData(NOTIF_KEY, []);
}

function saveNotifications(list) {
  saveData(NOTIF_KEY, list);
}

function addNotification(userId, type, text) {
  let list = loadNotifications();
  list.unshift({
    id: makeId(),
    userId: userId,
    type: type || "info",
    text: text,
    isRead: false,
    createdAt: new Date().toISOString()
  });
  // keep last 100
  if (list.length > 100) list = list.slice(0, 100);
  saveNotifications(list);
}

function getMyNotifications() {
  let me = getCurrentUser();
  if (!me) return [];
  let list = loadNotifications();
  let out = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].userId === me.id) out.push(list[i]);
  }
  return out;
}

function countUnreadNotifications() {
  let list = getMyNotifications();
  let n = 0;
  for (let i = 0; i < list.length; i++) {
    if (!list[i].isRead) n++;
  }
  // pending invites also count
  if (typeof getPendingInvitesForMe === "function") {
    n += getPendingInvitesForMe().length;
  }
  return n;
}

function markNotificationRead(id) {
  let list = loadNotifications();
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].isRead = true;
      saveNotifications(list);
      return;
    }
  }
}

function markAllNotificationsRead() {
  let me = getCurrentUser();
  if (!me) return;
  let list = loadNotifications();
  for (let i = 0; i < list.length; i++) {
    if (list[i].userId === me.id) list[i].isRead = true;
  }
  saveNotifications(list);
}
