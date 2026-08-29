const MESSAGES_KEY = "duto_messages";

function loadMessages() {
  return loadData(MESSAGES_KEY, []);
}

function saveMessages(messages) {
  saveData(MESSAGES_KEY, messages);
}

function sendMessage(receiverId, content) {
  let me = getCurrentUser();
  if (!me || !content || !content.trim()) return null;
  let messages = loadMessages();
  let msg = {
    id: makeId(),
    senderId: me.id,
    receiverId: receiverId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    isRead: false
  };
  messages.push(msg);
  saveMessages(messages);
  if (typeof addNotification === "function") {
    addNotification(
      receiverId,
      "message",
      "New message from " + me.fullName + (me.username ? " (@" + me.username + ")" : "")
    );
  }
  return msg;
}

function getConversation(otherUserId) {
  let me = getCurrentUser();
  if (!me) return [];
  let messages = loadMessages();
  let list = [];
  for (let i = 0; i < messages.length; i++) {
    let m = messages[i];
    if (
      (m.senderId === me.id && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === me.id)
    ) {
      list.push(m);
    }
  }
  list.sort(function (a, b) {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  return list;
}

function getAllUsersExceptMe() {
  let me = getCurrentUser();
  let users = loadData("duto_users", []);
  if (!me) return users;
  return users.filter(function (u) {
    return u.id !== me.id;
  });
}

function markConversationRead(otherUserId) {
  let me = getCurrentUser();
  if (!me) return;
  let messages = loadMessages();
  let changed = false;
  for (let i = 0; i < messages.length; i++) {
    if (
      messages[i].senderId === otherUserId &&
      messages[i].receiverId === me.id &&
      !messages[i].isRead
    ) {
      messages[i].isRead = true;
      changed = true;
    }
  }
  if (changed) saveMessages(messages);
}

function countUnreadMessages() {
  let me = getCurrentUser();
  if (!me) return 0;
  let messages = loadMessages();
  let n = 0;
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].receiverId === me.id && !messages[i].isRead) n++;
  }
  return n;
}
