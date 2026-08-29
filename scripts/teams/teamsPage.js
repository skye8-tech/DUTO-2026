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

function renderTeams() {
  let list = document.getElementById("team-list");
  let empty = document.getElementById("team-empty");
  if (!list) return;
  let teams = typeof getMyTeams === "function" ? getMyTeams() : loadTeams();
  list.innerHTML = "";
  if (teams.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");

  for (let i = 0; i < teams.length; i++) {
    let t = teams[i];
    let memberLabels = [];
    for (let m = 0; m < (t.members || []).length; m++) {
      let u = findUserById(t.members[m]);
      if (u) memberLabels.push(u.fullName);
      else memberLabels.push("Member");
    }
    let card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "0.75rem";
    card.innerHTML =
      "<h3>" +
      escapeText(t.name) +
      "</h3>" +
      "<p>" +
      escapeText(t.description || "No description") +
      "</p>" +
      "<p><strong>Members:</strong> " +
      escapeText(memberLabels.join(", ") || "You") +
      "</p>" +
      '<form class="invite-team-form" data-id="' +
      t.id +
      '" data-name="' +
      escapeText(t.name) +
      '" style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;">' +
      '<input type="text" class="form-control invite-username" placeholder="Invite by username" style="flex:1;min-width:140px;" />' +
      '<button type="submit" class="btn btn-secondary btn-sm">Send invite</button>' +
      '<button type="button" class="btn btn-ghost btn-sm btn-delete-team" data-id="' +
      t.id +
      '">Delete</button></form>';
    list.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;
  renderTeams();

  let form = document.getElementById("team-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let name = document.getElementById("team-name").value.trim();
      if (!name) return;
      createTeam(name, document.getElementById("team-description").value.trim());
      form.reset();
      let msg = document.getElementById("team-form-msg");
      if (msg) {
        msg.className = "alert alert-success";
        msg.textContent = "Team created.";
        msg.classList.remove("hidden");
      }
      renderTeams();
    });
  }

  let list = document.getElementById("team-list");
  if (!list) return;

  list.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-delete-team")) {
      let tid = e.target.getAttribute("data-id");
      showConfirmModal({
        title: "Delete team",
        message: "This team will be removed from your account.",
        confirmLabel: "Delete",
        onConfirm: function () {
          deleteTeam(tid);
          renderTeams();
          if (typeof showSuccess === "function") showSuccess("Team deleted.");
        }
      });
    }
  });

  list.addEventListener("submit", function (e) {
    if (!e.target.classList.contains("invite-team-form")) return;
    e.preventDefault();
    let teamId = e.target.getAttribute("data-id");
    let teamName = e.target.getAttribute("data-name");
    let uname = e.target.querySelector(".invite-username").value.trim();
    let user = findUserByUsername(uname);
    if (!user) {
      showError("No account found with that username.");
      return;
    }
    createInvite(user.id, "team", teamId, teamName);
    showSuccess("Invite sent.");
    e.target.reset();
  });
});
