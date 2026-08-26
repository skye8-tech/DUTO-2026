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
  let teams = loadTeams();
  list.innerHTML = "";
  if (teams.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  for (let i = 0; i < teams.length; i++) {
    let t = teams[i];
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
      (t.members ? t.members.length : 0) +
      "</p>" +
      '<form class="add-member-form" data-id="' +
      t.id +
      '" style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;">' +
      '<input type="text" class="form-control member-query" placeholder="Member email or name" style="flex:1;min-width:160px;" />' +
      '<button type="submit" class="btn btn-secondary btn-sm">Add member</button>' +
      '<button type="button" class="btn btn-ghost btn-sm btn-delete-team" data-id="' +
      t.id +
      '">Delete</button></form>';
    list.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;
  renderTeams();

  document.getElementById("team-form").addEventListener("submit", function (e) {
    e.preventDefault();
    let name = document.getElementById("team-name").value.trim();
    if (!name) return;
    createTeam(name, document.getElementById("team-description").value.trim());
    document.getElementById("team-form").reset();
    let msg = document.getElementById("team-form-msg");
    msg.className = "alert alert-success";
    msg.textContent = "Team created.";
    msg.classList.remove("hidden");
    renderTeams();
  });

  document.getElementById("team-list").addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-delete-team")) {
      if (confirm("Delete this team?")) {
        deleteTeam(e.target.getAttribute("data-id"));
        renderTeams();
      }
    }
  });

  document.getElementById("team-list").addEventListener("submit", function (e) {
    if (!e.target.classList.contains("add-member-form")) return;
    e.preventDefault();
    let teamId = e.target.getAttribute("data-id");
    let q = e.target.querySelector(".member-query").value.trim();
    let user = findUserByEmailOrName(q);
    if (!user) {
      alert("User not found. They must register on Duto first.");
      return;
    }
    addTeamMember(teamId, user.id);
    alert("Added " + user.fullName + " to the team.");
    renderTeams();
  });
});
