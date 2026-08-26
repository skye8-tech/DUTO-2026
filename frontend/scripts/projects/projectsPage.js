/*projectsPage.js — render andproject UI
 */

function requireAuth() {
  let user = loadData("duto_current_user", null);
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function showMsg(id, text, ok) {
  let el = document.getElementById(id);
  if (!el) return;
  el.className = ok ? "alert alert-success" : "alert alert-error";
  el.textContent = text;
  el.classList.remove("hidden");
}

function renderProjects() {
  let list = document.getElementById("project-list");
  let empty = document.getElementById("project-empty");
  let projects = loadProjects();
  list.innerHTML = "";
  if (projects.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
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

function escapeText(t) {
  let d = document.createElement("div");
  d.textContent = t || "";
  return d.innerHTML;
}

function openProjectDetail(id) {
  let p = getProjectById(id);
  let box = document.getElementById("detail-" + id);
  if (!p || !box) return;

  // hide others
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

  box.innerHTML =
    "<h4>Assign a mini-task</h4>" +
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
    "<h4 style='margin-top:1rem;'>Add member by email</h4>" +
    '<form class="member-form" data-id="' +
    id +
    '">' +
    '<input type="email" class="form-control member-email" placeholder="member@email.com" required style="margin-bottom:0.5rem;" />' +
    '<button type="submit" class="btn btn-secondary btn-sm">Add member</button></form>';
}

document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;

  renderProjects();

  document.getElementById("project-form").addEventListener("submit", function (e) {
    e.preventDefault();
    let name = document.getElementById("project-name").value.trim();
    if (!name) return;
    createProject(
      name,
      document.getElementById("project-description").value.trim(),
      document.getElementById("project-status").value,
      document.getElementById("project-deadline").value || null
    );
    document.getElementById("project-form").reset();
    showMsg("project-form-msg", "Project created.", true);
    renderProjects();
  });

  document.getElementById("project-list").addEventListener("click", function (e) {
    let t = e.target;
    if (t.classList.contains("btn-delete-project")) {
      if (confirm("Delete this project?")) {
        deleteProject(t.getAttribute("data-id"));
        renderProjects();
      }
    }
    if (t.classList.contains("btn-open-project")) {
      openProjectDetail(t.getAttribute("data-id"));
    }
    if (t.classList.contains("btn-cycle-task")) {
      let cur = t.getAttribute("data-status");
      let next = "todo";
      if (cur === "todo") next = "in-progress";
      else if (cur === "in-progress") next = "done";
      setProjectTaskStatus(
        t.getAttribute("data-pid"),
        t.getAttribute("data-tid"),
        next
      );
      openProjectDetail(t.getAttribute("data-pid"));
      renderProjects();
      openProjectDetail(t.getAttribute("data-pid"));
    }
  });

  document.getElementById("project-list").addEventListener("submit", function (e) {
    if (e.target.classList.contains("assign-form")) {
      e.preventDefault();
      let pid = e.target.getAttribute("data-id");
      let titleInput = e.target.querySelector(".assign-title");
      let title = titleInput.value.trim();
      if (!title) return;
      addProjectTask(pid, title, getCurrentUserId());
      titleInput.value = "";
      openProjectDetail(pid);
    }
    if (e.target.classList.contains("member-form")) {
      e.preventDefault();
      let pid2 = e.target.getAttribute("data-id");
      let email = e.target.querySelector(".member-email").value.trim();
      let users = loadData("duto_users", []);
      let found = null;
      for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) found = users[i];
      }
      if (!found) {
        alert("No registered user with that email. They must sign up first.");
        return;
      }
      addProjectMember(pid2, found.id);
      alert("Member added: " + found.fullName);
      openProjectDetail(pid2);
    }
  });
});
