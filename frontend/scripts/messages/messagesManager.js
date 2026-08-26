/**
 * Messages — localStorage chat between users
 */
let MESSAGES_KEY = "duto_messages";

function loadMessages() {
  return loadData(MESSAGES_KEY, []);
}

function saveMessages(messages) {
  saveData(MESSAGES_KEY, messages);
}

function getCurrentUser() {
  return loadData("duto_current_user", null);
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
