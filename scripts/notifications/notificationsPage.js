function escapeText(t) {
  let d = document.createElement("div");
  d.textContent = t || "";
  return d.innerHTML;
}

function renderInvites() {
  let list = document.getElementById("invite-list");
  let empty = document.getElementById("no-invites");
  if (!list) return;
  let invites = getPendingInvitesForMe();
  list.innerHTML = "";
  if (invites.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  for (let i = 0; i < invites.length; i++) {
    let inv = invites[i];
    let li = document.createElement("li");
    li.className = "task-item";
    li.style.cssText = "list-style:none;padding:0.75rem 0;border-bottom:1px solid #e5e7eb;";
    li.innerHTML =
      "<div><strong>" +
      escapeText(inv.fromName) +
      "</strong> invited you to " +
      escapeText(inv.type) +
      " <em>" +
      escapeText(inv.targetName) +
      "</em></div>" +
      '<div style="margin-top:0.5rem;display:flex;gap:0.5rem;">' +
      '<button type="button" class="btn btn-primary btn-sm btn-accept" data-id="' +
      inv.id +
      '">Accept</button>' +
      '<button type="button" class="btn btn-ghost btn-sm btn-decline" data-id="' +
      inv.id +
      '">Decline</button></div>';
    list.appendChild(li);
  }
}

function renderNotifs() {
  let list = document.getElementById("notif-list");
  let empty = document.getElementById("empty-state");
  if (!list) return;
  let notifs = getMyNotifications();
  list.innerHTML = "";
  if (notifs.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  for (let i = 0; i < notifs.length; i++) {
    let n = notifs[i];
    let li = document.createElement("li");
    li.style.cssText =
      "list-style:none;padding:0.6rem 0;border-bottom:1px solid #e5e7eb;" +
      (n.isRead ? "opacity:0.65;" : "font-weight:600;");
    li.innerHTML =
      escapeText(n.text) +
      "<div class='text-sm text-muted'>" +
      new Date(n.createdAt).toLocaleString() +
      "</div>";
    list.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof requireLogin === "function") requireLogin();
  renderInvites();
  renderNotifs();

  let inviteList = document.getElementById("invite-list");
  if (inviteList) {
    inviteList.addEventListener("click", function (e) {
      if (e.target.classList.contains("btn-accept")) {
        acceptInvite(e.target.getAttribute("data-id"));
        renderInvites();
        renderNotifs();
        if (typeof refreshNavBadges === "function") refreshNavBadges();
      }
      if (e.target.classList.contains("btn-decline")) {
        declineInvite(e.target.getAttribute("data-id"));
        renderInvites();
        if (typeof refreshNavBadges === "function") refreshNavBadges();
      }
    });
  }

  let markBtn = document.getElementById("mark-all-read");
  if (markBtn) {
    markBtn.addEventListener("click", function () {
      markAllNotificationsRead();
      renderNotifs();
      if (typeof refreshNavBadges === "function") refreshNavBadges();
    });
  }
});
