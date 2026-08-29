let selectedUserId = null;

function requireAuth() {
  let user = loadData("duto_current_user", null);
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function escapeText(t) {
  let d = document.createElement("div");
  d.textContent = t || "";
  return d.innerHTML;
}

function renderUsers(filter) {
  let users = getAllUsersExceptMe();
  let q = (filter || "").toLowerCase();
  let list = document.getElementById("msg-user-list");
  if (!list) return;
  list.innerHTML = "";
  let shown = 0;
  for (let i = 0; i < users.length; i++) {
    let u = users[i];
    let label = (u.fullName || "") + " @" + (u.username || "");
    if (q && label.toLowerCase().indexOf(q) === -1 && (u.username || "").toLowerCase().indexOf(q) === -1) {
      continue;
    }
    shown++;
    let btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost btn-block btn-sm";
    btn.style.textAlign = "left";
    btn.style.marginBottom = "0.35rem";
    btn.setAttribute("data-id", u.id);
    // name + username only (no email)
    btn.innerHTML =
      "<strong>" +
      escapeText(u.fullName) +
      "</strong><br><small>@" +
      escapeText(u.username || "user") +
      "</small>";
    btn.addEventListener("click", function (ev) {
      selectUser(ev.currentTarget.getAttribute("data-id"));
    });
    list.appendChild(btn);
  }
  if (shown === 0) {
    list.innerHTML =
      "<p class='text-muted'>No other users. Register a second account in this browser to demo chat.</p>";
  }
}

function selectUser(userId) {
  selectedUserId = userId;
  let users = loadData("duto_users", []);
  let name = "User";
  let uname = "";
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === userId) {
      name = users[i].fullName;
      uname = users[i].username || "";
    }
  }
  let title = document.getElementById("msg-chat-title");
  if (title) title.textContent = name + (uname ? " @" + uname : "");
  let form = document.getElementById("msg-form");
  if (form) {
    form.classList.remove("hidden");
    form.style.display = "flex";
  }
  markConversationRead(userId);
  if (typeof refreshNavBadges === "function") refreshNavBadges();
  renderThread();
}

function renderThread() {
  let box = document.getElementById("msg-thread");
  if (!box) return;
  if (!selectedUserId) {
    box.innerHTML = "<p class='text-muted'>Select a person to chat.</p>";
    return;
  }
  let me = getCurrentUser();
  let msgs = getConversation(selectedUserId);
  box.innerHTML = "";
  if (msgs.length === 0) {
    box.innerHTML = "<p class='text-muted'>No messages yet. Say hello!</p>";
    return;
  }
  for (let i = 0; i < msgs.length; i++) {
    let m = msgs[i];
    let mine = m.senderId === me.id;
    let bubble = document.createElement("div");
    bubble.style.cssText =
      "max-width:80%;padding:0.5rem 0.75rem;border-radius:12px;margin-bottom:0.5rem;" +
      (mine
        ? "background:let(--color-primary,#6c63ff);color:#fff;margin-left:auto;"
        : "background:#f3f4f6;margin-right:auto;");
    bubble.innerHTML =
      escapeText(m.content) +
      "<div style='font-size:0.7rem;opacity:0.8;margin-top:0.25rem;'>" +
      new Date(m.createdAt).toLocaleString() +
      "</div>";
    box.appendChild(bubble);
  }
  box.scrollTop = box.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;
  renderUsers("");
  let search = document.getElementById("msg-user-search");
  if (search) {
    search.placeholder = "Search by username...";
    search.addEventListener("input", function () {
      renderUsers(this.value);
    });
  }
  let form = document.getElementById("msg-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!selectedUserId) return;
      let input = document.getElementById("msg-input");
      let content = input.value.trim();
      if (!content) return;
      sendMessage(selectedUserId, content);
      input.value = "";
      renderThread();
      if (typeof refreshNavBadges === "function") refreshNavBadges();
    });
  }
});
