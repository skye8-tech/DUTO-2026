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

function showMsg(id, text, ok) {
  let el = document.getElementById(id);
  if (!el) return;
  el.className = ok ? "alert alert-success" : "alert alert-error";
  el.textContent = text;
  el.classList.remove("hidden");
}

function memberNames(ids) {
  if (typeof formatMemberNames === "function") return formatMemberNames(ids);
  let names = [];
  for (let i = 0; i < (ids || []).length; i++) {
    let u = typeof findUserById === "function" ? findUserById(ids[i]) : null;
    names.push(u ? u.fullName : "Member");
  }
  return names.join(", ") || "None";
}

function renderProjects() {
  let list = document.getElementById("project-list");
  let empty = document.getElementById("project-empty");
  if (!list) return;
  let projects = typeof getMyProjects === "function" ? getMyProjects() : loadProjects();
  list.innerHTML = "";
  if (projects.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");

  for (let i = 0; i < projects.length; i++) {
    let p = projects[i];
    let progress = projectProgress(p);
    let card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "0.75rem";
    card.innerHTML =
      "<h3>" +
      escapeText(p.name) +
      "</h3>" +
      "<p>" +
      escapeText(p.description || "No description") +
      "</p>" +
      "<p><strong>Status:</strong> " +
      escapeText(p.status) +
      " · <strong>Progress:</strong> " +
      progress +
      "% · <strong>Members:</strong> " +
      (p.members ? p.members.length : 0) +
      "</p>" +
      "<p class='text-sm text-muted'>" +
      escapeText(memberNames(p.members)) +
      "</p>" +
      '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;">' +
      '<button type="button" class="btn btn-secondary btn-sm btn-open-project" data-id="' +
      p.id +
      '">Open</button>' +
      '<button type="button" class="btn btn-ghost btn-sm btn-delete-project" data-id="' +
      p.id +
      '">Delete</button></div>' +
      '<div class="project-detail hidden" id="detail-' +
      p.id +
      '" style="margin-top:1rem;padding-top:1rem;border-top:1px solid #e5e7eb;"></div>';
    list.appendChild(card);
  }
}

function openProjectDetail(id) {
  let p = getProjectById(id);
  let box = document.getElementById("detail-" + id);
  if (!p || !box) return;
  let all = document.querySelectorAll(".project-detail");
  for (let i = 0; i < all.length; i++) {
    if (all[i].id !== "detail-" + id) all[i].classList.add("hidden");
  }
  box.classList.remove("hidden");

  let tasksHtml = "";
  let tasks = p.tasks || [];
  for (let t = 0; t < tasks.length; t++) {
    let task = tasks[t];
    tasksHtml +=
      "<li style='margin-bottom:0.35rem;'>" +
      escapeText(task.title) +
      " — <em>" +
      escapeText(task.status) +
      '</em> <button type="button" class="btn btn-ghost btn-sm btn-cycle-task" data-pid="' +
      id +
      '" data-tid="' +
      task.id +
      '" data-status="' +
      task.status +
      '">Next status</button></li>';
  }
  if (!tasksHtml) tasksHtml = "<li>No mini-tasks yet.</li>";

  let commentsHtml = "";
  for (let c = 0; c < (p.comments || []).length; c++) {
    let cm = p.comments[c];
    commentsHtml +=
      "<li><strong>" +
      escapeText(cm.userName) +
      ":</strong> " +
      escapeText(cm.text) +
      "</li>";
  }
  if (!commentsHtml) commentsHtml = "<li>No comments yet.</li>";

  let filesHtml = "";
  for (let f = 0; f < (p.files || []).length; f++) {
    filesHtml +=
      "<li>" +
      escapeText(p.files[f].name) +
      " <span class='text-muted'>(by " +
      escapeText(p.files[f].uploadedBy) +
      ")</span></li>";
  }
  if (!filesHtml) filesHtml = "<li>No files yet.</li>";

  box.innerHTML =
    "<h4>Invite member (by username)</h4>" +
    '<form class="invite-form" data-id="' +
    id +
    '" data-name="' +
    escapeText(p.name) +
    '">' +
    '<input type="text" class="form-control invite-user" placeholder="username" required style="margin-bottom:0.5rem;" />' +
    '<button type="submit" class="btn btn-secondary btn-sm">Send invite</button></form>' +
    "<h4 style='margin-top:1rem;'>Assign mini-task</h4>" +
    '<form class="assign-form" data-id="' +
    id +
    '">' +
    '<input type="text" class="form-control assign-title" placeholder="Task title" required style="margin-bottom:0.5rem;" />' +
    '<button type="submit" class="btn btn-primary btn-sm">Add task</button></form>' +
    "<h4 style='margin-top:1rem;'>Tasks (" +
    projectProgress(p) +
    "% done)</h4><ul>" +
    tasksHtml +
    "</ul>" +
    "<h4 style='margin-top:1rem;'>Comments</h4><ul>" +
    commentsHtml +
    "</ul>" +
    '<form class="comment-form" data-id="' +
    id +
    '">' +
    '<input type="text" class="form-control comment-text" placeholder="Write a comment..." style="margin-bottom:0.5rem;" />' +
    '<button type="submit" class="btn btn-ghost btn-sm">Post</button></form>' +
    "<h4 style='margin-top:1rem;'>Files (name only for demo)</h4><ul>" +
    filesHtml +
    "</ul>" +
    '<form class="file-form" data-id="' +
    id +
    '">' +
    '<input type="text" class="form-control file-name" placeholder="filename.pdf" style="margin-bottom:0.5rem;" />' +
    '<button type="submit" class="btn btn-ghost btn-sm">Add file label</button></form>';
}

function fillTeamSelect() {
  let sel = document.getElementById("project-team");
  if (!sel || typeof loadTeams !== "function") return;
  let teams = typeof getMyTeams === "function" ? getMyTeams() : loadTeams();
  let current = sel.value;
  sel.innerHTML = '<option value="">No team — personal project</option>';
  for (let i = 0; i < teams.length; i++) {
    let opt = document.createElement("option");
    opt.value = teams[i].id;
    opt.textContent = teams[i].name;
    sel.appendChild(opt);
  }
  if (current) sel.value = current;
}

document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;
  fillTeamSelect();
  renderProjects();

  let form = document.getElementById("project-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let name = document.getElementById("project-name").value.trim();
      if (!name) return;
      let teamSelect = document.getElementById("project-team");
      let teamId = teamSelect ? teamSelect.value || null : null;
      createProject(
        name,
        document.getElementById("project-description").value.trim(),
        document.getElementById("project-status").value,
        document.getElementById("project-deadline").value || null,
        teamId
      );
      form.reset();
      if (typeof showSuccess === "function") {
        showSuccess("Project created.");
      }
      showMsg("project-form-msg", "Project created.", true);
      renderProjects();
      fillTeamSelect();
    });
  }

  let list = document.getElementById("project-list");
  if (!list) return;

  list.addEventListener("click", function (e) {
    let t = e.target;
    if (t.classList.contains("btn-delete-project")) {
      let pid = t.getAttribute("data-id");
      showConfirmModal({
        title: "Delete project",
        message: "This project and its mini-tasks will be removed.",
        confirmLabel: "Delete",
        onConfirm: function () {
          deleteProject(pid);
          renderProjects();
          if (typeof showSuccess === "function") showSuccess("Project deleted.");
        }
      });
    }
    if (t.classList.contains("btn-open-project")) {
      openProjectDetail(t.getAttribute("data-id"));
    }
    if (t.classList.contains("btn-cycle-task")) {
      let cur = t.getAttribute("data-status");
      let next = "todo";
      if (cur === "todo") next = "in-progress";
      else if (cur === "in-progress") next = "done";
      let pid = t.getAttribute("data-pid");
      setProjectTaskStatus(pid, t.getAttribute("data-tid"), next);
      renderProjects();
      openProjectDetail(pid);
    }
  });

  list.addEventListener("submit", function (e) {
    let formEl = e.target;
    if (formEl.classList.contains("assign-form")) {
      e.preventDefault();
      let pid = formEl.getAttribute("data-id");
      let title = formEl.querySelector(".assign-title").value.trim();
      if (!title) return;
      addProjectTask(pid, title, getCurrentUserId());
      openProjectDetail(pid);
    }
    if (formEl.classList.contains("invite-form")) {
      e.preventDefault();
      let pid2 = formEl.getAttribute("data-id");
      let pname = formEl.getAttribute("data-name");
      let uname = formEl.querySelector(".invite-user").value.trim();
      let user = findUserByUsername(uname);
      if (!user) {
        showError("No account found with that username.");
        return;
      }
      createInvite(user.id, "project", pid2, pname);
      showSuccess("Invite sent.");
    }
    if (formEl.classList.contains("comment-form")) {
      e.preventDefault();
      let pid3 = formEl.getAttribute("data-id");
      let text = formEl.querySelector(".comment-text").value.trim();
      if (!text) return;
      addProjectComment(pid3, text);
      openProjectDetail(pid3);
    }
    if (formEl.classList.contains("file-form")) {
      e.preventDefault();
      let pid4 = formEl.getAttribute("data-id");
      let fname = formEl.querySelector(".file-name").value.trim();
      if (!fname) return;
      addProjectFile(pid4, fname);
      openProjectDetail(pid4);
    }
  });
});
