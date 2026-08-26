let PROJECTS_KEY = "duto_projects";

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

function createProject(name, description, status, deadline) {
  let projects = loadProjects();
  let userId = getCurrentUserId();
  let project = {
    id: makeId(),
    name: name,
    description: description || "",
    status: status || "active",
    deadline: deadline || null,
    ownerId: userId,
    members: userId ? [userId] : [],
    tasks: [],
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
  let projects = loadProjects().filter(function (p) {
    return p.id !== id;
  });
  saveProjects(projects);
}

function getProjectById(id) {
  let projects = loadProjects();
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].id === id) return projects[i];
  }
  return null;
}

function addProjectMember(projectId, userId) {
  let p = getProjectById(projectId);
  if (!p) return false;
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
  return task;
}

function setProjectTaskStatus(projectId, taskId, status) {
  let p = getProjectById(projectId);
  if (!p || !p.tasks) return false;
  for (let i = 0; i < p.tasks.length; i++) {
    if (p.tasks[i].id === taskId) {
      p.tasks[i].status = status;
      updateProject(projectId, { tasks: p.tasks });
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
