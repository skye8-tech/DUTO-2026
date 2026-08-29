/**
 * Projects — localStorage full demo features
 */
const PROJECTS_KEY = "duto_projects";

function loadProjects() {
  return loadData(PROJECTS_KEY, []);
}

function saveProjects(projects) {
  saveData(PROJECTS_KEY, projects);
}

function getCurrentUserId() {
  let user = loadData("duto_current_user", null);
  return user ? user.id : null;
}

function createProject(name, description, status, deadline, teamId) {
  let projects = loadProjects();
  let userId = getCurrentUserId();
  let members = userId ? [userId] : [];

  // If linked to a team, add every team member automatically
  if (teamId && typeof getTeamById === "function") {
    let team = getTeamById(teamId);
    if (team && team.members) {
      for (let i = 0; i < team.members.length; i++) {
        if (members.indexOf(team.members[i]) === -1) {
          members.push(team.members[i]);
        }
      }
    }
  }

  let project = {
    id: makeId(),
    name: name,
    description: description || "",
    status: status || "active",
    deadline: deadline || null,
    ownerId: userId,
    teamId: teamId || null,
    members: members,
    tasks: [],
    comments: [],
    files: [],
    createdAt: new Date().toISOString()
  };
  projects.push(project);
  saveProjects(projects);
  return project;
}

function updateProject(id, fields) {
  let projects = loadProjects();
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].id === id) {
      let keys = Object.keys(fields);
      for (let k = 0; k < keys.length; k++) {
        projects[i][keys[k]] = fields[keys[k]];
      }
      saveProjects(projects);
      return projects[i];
    }
  }
  return null;
}

function deleteProject(id) {
  saveProjects(
    loadProjects().filter(function (p) {
      return p.id !== id;
    })
  );
}

function getProjectById(id) {
  let projects = loadProjects();
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].id === id) return projects[i];
  }
  return null;
}

function getMyProjects() {
  let uid = getCurrentUserId();
  return loadProjects().filter(function (p) {
    return p.ownerId === uid || (p.members && p.members.indexOf(uid) !== -1);
  });
}

function addProjectMember(projectId, userId) {
  let p = getProjectById(projectId);
  if (!p) return false;
  p.members = p.members || [];
  if (p.members.indexOf(userId) === -1) {
    p.members.push(userId);
    updateProject(projectId, { members: p.members });
  }
  return true;
}

function addProjectTask(projectId, title, assigneeId) {
  let p = getProjectById(projectId);
  if (!p) return null;
  let task = {
    id: makeId(),
    title: title,
    assigneeId: assigneeId || null,
    status: "todo",
    createdAt: new Date().toISOString()
  };
  p.tasks = p.tasks || [];
  p.tasks.push(task);
  updateProject(projectId, { tasks: p.tasks });

  // notify assignee
  if (assigneeId && typeof addNotification === "function") {
    let me = getCurrentUser();
    addNotification(
      assigneeId,
      "task",
      (me ? me.fullName : "Someone") + " assigned you “" + title + "” on " + p.name
    );
  }
  return task;
}

function setProjectTaskStatus(projectId, taskId, status) {
  let p = getProjectById(projectId);
  if (!p || !p.tasks) return false;
  for (let i = 0; i < p.tasks.length; i++) {
    if (p.tasks[i].id === taskId) {
      p.tasks[i].status = status;
      updateProject(projectId, { tasks: p.tasks });
      // notify members of status change
      if (typeof addNotification === "function") {
        let me = getCurrentUser();
        for (let m = 0; m < (p.members || []).length; m++) {
          if (p.members[m] !== (me && me.id)) {
            addNotification(
              p.members[m],
              "status",
              (me ? me.fullName : "Someone") +
                " set “" +
                p.tasks[i].title +
                "” to " +
                status
            );
          }
        }
      }
      return true;
    }
  }
  return false;
}

function projectProgress(project) {
  if (!project.tasks || project.tasks.length === 0) return 0;
  let done = 0;
  for (let i = 0; i < project.tasks.length; i++) {
    if (project.tasks[i].status === "done") done++;
  }
  return Math.round((done / project.tasks.length) * 100);
}

function addProjectComment(projectId, text) {
  let p = getProjectById(projectId);
  let me = getCurrentUser();
  if (!p || !me || !text.trim()) return null;
  p.comments = p.comments || [];
  let c = {
    id: makeId(),
    userId: me.id,
    userName: me.fullName,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };
  p.comments.push(c);
  updateProject(projectId, { comments: p.comments });
  for (let m = 0; m < (p.members || []).length; m++) {
    if (p.members[m] !== me.id && typeof addNotification === "function") {
      addNotification(
        p.members[m],
        "comment",
        me.fullName + " commented on " + p.name
      );
    }
  }
  return c;
}

function addProjectFile(projectId, fileName) {
  let p = getProjectById(projectId);
  let me = getCurrentUser();
  if (!p || !fileName) return null;
  p.files = p.files || [];
  let f = {
    id: makeId(),
    name: fileName,
    uploadedBy: me ? me.fullName : "User",
    createdAt: new Date().toISOString()
  };
  p.files.push(f);
  updateProject(projectId, { files: p.files });
  return f;
}
